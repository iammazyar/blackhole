import { Sprite, Shader, Mesh, BLEND_MODES } from "pixi.js";
import { geometry } from '../geometry';
import { shaderMaterial } from './glsl/shaderMaterial';
import { scale, totalWidth, totallHeight, width, height} from "../constants";
import { gsap } from "gsap";


const { vertexShader, fragmentShader, levelUpFragmentShader, dustflowShader } = { ...shaderMaterial };

class DrawGalaxy {

    constructor(x, y, t, radius, color, level){
        this.uniforms = {//uniforms
            totalWidth: totalWidth,
            totalHeight: totallHeight,
            DUST_SIZE: 0.1,
            COMPR: 0.1,// compression in arms
            SPEED: 0.1,// rotation speed
            logRadiusCoeficeint: 2.0,
            t: t,
            scale: scale,
            px: x,
            py: y,
            NB_ARMS: level,
            GALAXY_R: scale*radius/totallHeight,
            red_color_galaxy: color.red,
            green_color_galaxy: color.green,
            blue_color_galaxy: color.blue
        }
        this.shader = Shader.from(vertexShader, fragmentShader, this.uniforms);
        this.mesh = new Mesh(geometry, this.shader);
        this.mesh.blendMode = BLEND_MODES.SCREEN;
    }
    
}

class DrawLevelUpExplosion {
    constructor(x, y, color, radius){
        this.t = 0;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.uniforms = {//uniforms
            totalWidth: totalWidth,
            totalHeight: totallHeight,
            red_color_galaxy: color.red,
            green_color_galaxy: color.green,
            blue_color_galaxy: color.blue,
            t: this.t,
            scale: scale,
            px: this.x,
            py: this.y,
            GALAXY_R: scale*this.radius/totallHeight,
            c1: 1.,
            c2: 0.
        }
        this.shader = Shader.from(vertexShader, levelUpFragmentShader, this.uniforms);
        this.mesh = new Mesh(geometry, this.shader);
        this.mesh.blendMode = BLEND_MODES.SCREEN;
        this.mesh.visible = false;
    }
    
   
}


export class Galaxy {
    
    constructor(x, y, radius, color, newLevel){
        this.t = 0;// elapsedtime
        this.levelUpT = 0;//time for explosion effect
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.presentLevel = 1.;
        this.newLevel = newLevel;
        this.galaxyShader = new DrawGalaxy(this.x, this.y, this.t, this.radius, this.color, this.newLevel);
        this.levelUpShader = new DrawLevelUpExplosion(this.x, this.y, this.color, this.radius);
    } 
    updateGalaxyShader(NB_ARMS, COMPR, DUST_SIZE, SPEED, logRadiusCoeficeint){
        this.galaxyShader.shader.uniforms.NB_ARMS = NB_ARMS;
        this.galaxyShader.shader.uniforms.COMPR = COMPR;
        this.galaxyShader.shader.uniforms.DUST_SIZE = DUST_SIZE;
        this.galaxyShader.shader.uniforms.SPEED = SPEED;
        this.galaxyShader.shader.uniforms.logRadiusCoeficeint = logRadiusCoeficeint;
    }
    levelUpExplosionEffect(){
        this.levelUpShader.mesh.visible = true;
        this.levelUpT += 1/60;
        this.levelUpShader.shader.uniforms.t = this.levelUpT;
        this.levelUpShader.shader.uniforms.GALAXY_R = scale*this.radius/totallHeight;
        this.levelUpShader.shader.uniforms.px = this.x;
        this.levelUpShader.shader.uniforms.py = this.y;
    
        if(this.levelUpT >= 0.44){
            this.levelUpShader.shader.uniforms.c1 = 0.;
            this.levelUpShader.shader.uniforms.c2 = 1.;
            switch (this.newLevel) {
                case 2:
                    this.updateGalaxyShader(this.newLevel, 0.3, 0.2, 0.13, 2.0);
                    break;
                case 3:
                    this.updateGalaxyShader(this.newLevel, 0.15, 0.2, 0.16, 1.0);
                    break;
                case 4:
                    this.updateGalaxyShader(this.newLevel, 0.12, 0.22, 0.2, 0.9);
                    break;
                case 5:
                    this.updateGalaxyShader(this.newLevel, 0.09, 0.24, 0.22, 0.8)
                    break;
                case 6:
                    this.updateGalaxyShader(this.newLevel, 0.08, 0.26, 0.25, 0.8)
                    break;
                case 7:
                    this.updateGalaxyShader(this.newLevel, 0.07, 0.28, 0.27, 0.8);
                    break;
                case 8:
                    this.updateGalaxyShader(this.newLevel, 0.06, 0.29, 0.28, 0.8);
                    break;
                case 9:
                    this.updateGalaxyShader(this.newLevel, 0.06, 0.3, 0.29, 0.7);
                    break;
                case 10.:
                    this.updateGalaxyShader(this.newLevel, 0.05, 0.32, 0.3, 0.7);
                    break;
                default:
                    break;
            }
        }
        if(this.levelUpT > 2.32){
            this.presentLevel = this.newLevel;
            this.levelUpShader.mesh.visible = false;
            this.levelUpT = 0;
        }
    }

    updateScale(c){
        gsap.to(this.galaxyShader.shader.uniforms, {
            scale: c*scale,
            duration: 0.015
        });
        // gsap.to(this.levelUpShader.shader.uniforms, {
        //     scale: c*scale,
        //     duration: 0.015
        // });
    }
    update(){
        this.t += 1/60;
        this.galaxyShader.shader.uniforms.t = this.t;
        this.galaxyShader.shader.uniforms.GALAXY_R = scale*this.radius/totallHeight;
        this.galaxyShader.shader.uniforms.px = this.x;
        this.galaxyShader.shader.uniforms.py = this.y; 
        if(this.newLevel > this.presentLevel) {
            console.log("levelup")
            this.levelUpExplosionEffect();
        } 
    }
}