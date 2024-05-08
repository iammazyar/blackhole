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
    uniform float totalWidth;
    uniform float totalHeight;
    uniform float t;
    uniform float scale;
    uniform float px;
    uniform float py;
    uniform float GALAXY_R;
    uniform float DUST_SIZE;
    uniform float COMPR;         
    uniform float SPEED;
    uniform float NB_ARMS;
    uniform float logRadiusCoeficeint;
    
    float BULB_R = GALAXY_R/2.;
    const vec3 GALAXY_COL = vec3(.9, .9, 1.); 
    const vec3 BULB_COL   = 2.2*vec3(0.9,.90,.90);
    const vec3 SKY_COL    = .5*vec3(.0,.0,.0);


    mat2 rotate_axis(float angle){
    
        float co = cos(angle);
        float si = sin(angle);
        mat2 M = mat2(co,-si, si, co);
        return M;
    }


    float hash( float n ){
        return fract(sin(n)*43758.5453);
    }


    float base_noise( vec2 uv ){
        
        float amp = 2.;
        
        vec2 p = floor(uv);
        vec2 f = fract(uv);

        f = f*f*(3.0-2.0*f);

        float n = p.x + p.y*57.0;

        float exe_noise =amp * mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                                mix( hash(n+ 57.0), hash(n+ 58.0),f.x),
                                f.y);
        exe_noise = clamp(exe_noise, .2, 5.);
        return exe_noise;
    }



    float main_noise(vec2 uv){
        
        float v=0.;
        float a=-SPEED*t;
        mat2 M = rotate_axis(a);
        const int L = 7;
        float s=1.;
        for (int i=0; i<L; i++)
        {
            uv = M*uv;
            float b = base_noise(s*uv);
            v += 1./s* pow(b,3.); 
            s *= 2.;
        }
        
        return v/2.;
    }


    float spire_dust(vec2 uv, mat2 R, float dens){

        
        // gaz texture
        float gaz = main_noise(.11 * 1. * R * uv);
        float gaz_trsp = pow((1.-gaz*dens), 2.);

    return gaz_trsp;
    }

    vec3 galaxy (vec2 uv){

        float radius = length(uv); // polar coords
        float angle = atan(uv.y,uv.x);
        float logRadius = logRadiusCoeficeint*log(radius); // logarythmic spiral  //2 
        
        // galaxy profile
        float r; // disk
        
        r = radius/GALAXY_R;
        float dens = exp(-r*r);
        
        r = radius/BULB_R;
        float bulb = exp(-r*r);
        
        float phase = NB_ARMS*(angle-logRadius);
        float spires = 1. + NB_ARMS * COMPR * sin(phase);
        
        dens *= .7*spires;
        
        // arms = spirals compression
        mat2 R = rotate_axis(angle);//wink bulb ligth
        
        angle = angle - COMPR*sin(phase) + SPEED*t;
        
        uv = r*vec2(cos(angle),sin(angle));
        
        float small_dust = spire_dust(uv, R, dens);
        
        float big_dust = main_noise(5.*uv); 
            
        vec3 col;
        // mix all	
        col = mix(SKY_COL, small_dust*(GALAXY_COL) + small_dust * DUST_SIZE * big_dust, dens);
        col = mix(col, BULB_COL, bulb);
        col = mix(col, vec3(.0), bulb/1.);
        //col += BULB_COL*smoothstep(.3,.2,radius);
        
        return col;
    }


    void main()
    {
        
        vec2 uv = vec2(vUvs.x,vUvs.y);
        uv *= scale;
        uv -= scale/2.;
        uv -= vec2(scale*(px/totalWidth), scale*(py/totalHeight));
        //uv.x *= iResolutionX/iResolutionY;
        uv = rotate_axis(-SPEED*t)*uv;
        vec3 col = galaxy(uv);
        
        gl_FragColor = vec4(vec3(col),1.0);
    }
`

export const shaderMaterial = {
    vertexShader,
    fragmentShader
}
