const vertexShader = `
precision mediump float;
attribute vec2 aVertexPosition;
attribute vec2 aUvs;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
varying vec2 vUvs;

void main() {
    vUvs = aUvs;
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}`;
const fragmentShader = `

    varying vec2 vUvs;
    uniform float iResolutionX;
    uniform float iResolutionY;
    uniform float totalWidth;
    uniform float totalHeight;
    uniform float scale;
    uniform float scaleRefiner;
    uniform float t;
    uniform float px;
    uniform float py;

    const vec3 SKY_COL = .25*vec3(.3,.5,.9);

    
    mat2 Rot(float a){

        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
    }

    float rec(vec2 uv, float x, float y, float margin){
        //uv *= 2.;
        //uv *= scale;
        float c;
        c += (1. - smoothstep(.5*y, .5*y + margin, abs(uv.y)));
        c *= (1. - smoothstep(.5*x, .5*x + margin, abs(uv.x)));
       
        return c;
    }

    float Hash21(vec2 p){
        p = fract(p*vec2(123.34,456.21));
        p += dot(p,p+45.32);
        return fract(p.x*p.y);
    }

    float Star(vec2 uv, float flare) {
        float d = length(uv);
        float m = .05/d;
        
        float rays = max(0., 1.-abs(uv.x*uv.y*1000.));
        m += rays*flare;
        uv *= Rot(3.1415/4.);
        rays = max(0., 1.-abs(uv.x*uv.y*1000.));
        m += rays*.3*flare;
        
        m *= smoothstep(1., .2, d);
        return m;
    }

    vec3 StarLayer(vec2 uv){
        vec3 col = vec3 (0);
        vec2 gv = fract(uv)-.5;
        vec2 id = floor(uv);
    
        for(int y=-1;y<=1;y++) {
            for(int x=-1;x<=1;x++) {
                vec2 offs = vec2(x, y);
                
                float n = Hash21(id+offs); // random between 0 and 1
                float size = fract(n*345.32);
                
                float star = Star(gv-offs-vec2(n, fract(n*34.))+.5, smoothstep(.9, 1., size)*.6);
                
                vec3 color = sin(vec3(.2, .3, .9)*fract(n*2345.2)*123.2)*.5+.5;
                color = color*vec3(1,.25,1.+size)+vec3(.2, .2, .1)*2.;
                
                star *= sin(t*3.+n*6.2831)*.5+1.;
                col += star*size*color;
            }
        }
        return col;
    }
 
    void main()
    {
        vec2 uv = vec2(vUvs.x,vUvs.y);
        uv -= .5;
        uv *= scale*scaleRefiner;
        uv -= vec2(scale*scaleRefiner*(px/totalWidth), scale*scaleRefiner*(py/totalHeight));
        const float NUM_LAYERS  = 2.;

        float tempScale = 1.;
        vec3 col;
        float temp = rec(uv, scale, scale, 0.1*scale);
          
        //uv *= Rot(.1*t);
        for(float i=.0;i<1.;i+=1./NUM_LAYERS){
            float depth = fract(i*t*.1);
            float scale = mix(20.,15.,depth);
            float fade = depth*smoothstep(1.,.9,depth)+0.1;
            col+=StarLayer(uv*8.+i*453.)*fade; 
        }
        col = mix(SKY_COL, col, col);
        col *= (1. - temp);
        //col = 1. - col;
        //col *= vec3 (.078);
        gl_FragColor = vec4(vec3(col), 1.0);
    }
`
export const shaderMaterial = {
    vertexShader,
    fragmentShader
}