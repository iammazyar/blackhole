import { Shader, Mesh, BLEND_MODES } from "pixi.js";
import { geometry } from '../geometry';
import { shaderMaterial } from './glsl/shaderMaterial';
import { totalWidth, totallHeight, scale } from "../constants";
import { gsap } from "gsap";


const { vertexShader, fragmentShader } = { ...shaderMaterial };

export class Template {
    constructor(x, y){
        this.t = 0;
        this.x = x;
        this.y = y;
        this.setup();
    }

    setup(){
        this.shader = Shader.from(vertexShader, fragmentShader, {//uniforms
            iResolutionX: innerWidth,
            iResolutionY: innerHeight,
            totalWidth: totalWidth,
            totalHeight: totallHeight,
            scale: scale,
            scaleRefiner: 1.0,
            t: this.t,
            px: this.x,
            py: this.y
        });
        this.mesh = new Mesh(geometry, this.shader);
        this.mesh.blendMode = BLEND_MODES.ADD;
    }
    updateScale(c){
        gsap.to(this.shader.uniforms, {
            scaleRefiner: c,
            duration: 0.015
        });
    }
    update(){
        this.t += 1/60;
        this.shader.uniforms.t = this.t;
        this.shader.uniforms.px = this.x;
        this.shader.uniforms.py = this.y;
    }
}