import { Shader, Mesh, BLEND_MODES } from "pixi.js";
import { geometry } from '../geometry';
import { shaderMaterial } from './glsl/shaderMaterial';
import { height, scale, totalWidth, totallHeight, width, scaleRadius} from "../constants";
import { gsap } from "gsap";



const { vertexShader, fragmentShader } = { ...shaderMaterial };

export class BlackHole {
    
    constructor(x, y, radius){
        this.t = 0;// elapsedtime
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.shaderSetUp();
    }

    shaderSetUp(){
        this.shader = Shader.from(vertexShader, fragmentShader, {//uniforms
            totalWidth: totalWidth,
            totalHeight: totallHeight,
            DUST_SIZE: 0.22,
            COMPR: 0.12,// compression in arms
            SPEED: 0.1,// rotation speed
            logRadiusCoeficeint: .9,
            GALAXY_R: scale*this.radius/totallHeight,
            t: this.t,
            scale: scale,
            px: this.x,
            py: this.y,
            NB_ARMS: 4.0
        });
        this.mesh = new Mesh(geometry, this.shader);
        this.mesh.blendMode = BLEND_MODES.SCREEN;

    }
    updateScale(c){
        gsap.to(this.shader.uniforms, {
            scale: c*scale,
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