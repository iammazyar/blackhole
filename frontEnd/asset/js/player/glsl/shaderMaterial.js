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
    uniform float NB_ARMS;
    uniform float GALAXY_R;
    uniform float red_color_galaxy;
    uniform float green_color_galaxy;
    uniform float blue_color_galaxy;
    uniform float DUST_SIZE;
    uniform float COMPR;         
    uniform float SPEED;
    uniform float logRadiusCoeficeint;
    
    float BULB_R = GALAXY_R/3.;
    vec3 GALAXY_COL = vec3(red_color_galaxy, green_color_galaxy, blue_color_galaxy); 
    const vec3 BULB_COL   = 2.2*vec3(1.,.8,.8);
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

        //cordinates
        float radius = length(uv); // polar coords
        float angle = atan(uv.y,uv.x);
        float logRadius = 1.*log(radius); // logarythmic spiral  //2 
        
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
const levelUpFragmentShader = `

    varying vec2 vUvs;
    uniform float totalWidth;
    uniform float totalHeight;
    uniform float t;
    uniform float scale;
    uniform float px;
    uniform float py;
    uniform float GALAXY_R;
    uniform float red_color_galaxy;
    uniform float green_color_galaxy;
    uniform float blue_color_galaxy;
    uniform float c1;
    uniform float c2;
   
    
    float BULB_R = GALAXY_R / 3.;
    vec3 SKY_COL = .5*vec3(.3,.5,.9);

    void main()
    {
        vec2 uv = vec2(vUvs.x,vUvs.y);
        uv *= scale;
        uv -= scale/2.;
        uv -= vec2(scale*(px/totalWidth), scale*(py/totalHeight));
        //uv.x *= iResolutionX/iResolutionY;

        vec3 col;
        float d = dot(uv,uv);
        float a = atan(uv.x, uv.y);
        float dist = length(uv);
        float r = dist/GALAXY_R;
        float dens = exp(-r*r);
        float t1 = -t*.3;
        float light2 = c1*smoothstep(t*(dens/.44), .9*t*(dens/.44), dist ) + c2*smoothstep(dens, dens-(t-.44)*(dens/.44), dist);
        float bla = sin(t1+sin(t1+sin(t1)*.5))*.5+.5;
        float burst = sin(t*.05);
        float burstFade = smoothstep(0., .02, abs(burst));
        float size = 3.9*sin(t1)+4.;
        size = max(size, sqrt(size));
        float light = size/d;//center light
        col *= mix(1., light, burstFade);
        col += mix(col, light2*vec3(red_color_galaxy, green_color_galaxy, blue_color_galaxy), burstFade);
        col += light*.2*vec3(red_color_galaxy, green_color_galaxy, blue_color_galaxy)*bla*burstFade;
        t1*=1.5;
            
        
        a -=.1;
        float rays = sin(a*5.+t1*3.)-cos(a*7.-t1);
        rays *= sin(a+t1+sin(a*4.)*10.)*.5+.5;
        col*=smoothstep(.5, .3, dist);
        col += rays*bla*.1*burstFade;
        col = mix(vec3(.0), col, dens);
        
        
        gl_FragColor = vec4(vec3(col),1.0);
    }

`
const dustflowShader = `

    varying vec2 vUvs;
    uniform float totalWidth;
    uniform float totalHeight;
    uniform float scale;
    uniform float px;
    uniform float py;
    uniform float radius;
    uniform float iResolutionX;
    uniform float iResolutionY;
    uniform float uvC;


    float hash( float n ){
        return fract(sin(n)*43758.5453);
    }

    float noise( vec2 uv ){
        
        uv *= 1.;
        float amp = 1.;
        
        vec2 p = floor(uv);
        vec2 f = fract(uv);

        f = f*f*(3.0-2.0*f);

        float n = p.x + p.y*57.0;

        float exe_noise =amp * mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                                mix( hash(n+ 57.0), hash(n+ 58.0),f.x),
                                f.y);

        return exe_noise;
    }


    float fbm( vec2 uv )
    {
        uv *= 4.;
        float f = 0.0;

        f += 0.50000*noise( uv ); uv = uv*2.02;
        f += 0.25000*noise( uv ); uv = uv*2.03;
        f += 0.12500*noise( uv ); uv = uv*2.01;
        f += 0.06250*noise( uv ); uv = uv*2.04;
        f += 0.03125*noise( uv );

        return f/0.984375;
    }

    void main(){
        vec2 uv = vec2(vUvs.x,vUvs.y);
        uv -= .5;
        uv.x *= iResolutionX/iResolutionY;
        uv *= 2.;
        
        vec3 col;
        uv -= uvC;
        float noise = fbm(uv);
        uv += uvC;

        //scale
        uv /= 2.;
        uv *= scale;
        uv -= vec2(scale*(px/totalWidth), scale*(py/totalHeight));
        float d = length(uv);
        noise *= smoothstep(radius, .125*radius, d);
        col = vec3(noise,noise,noise);

        
        gl_FragColor = vec4(col, 1.0);
    }
`
export const shaderMaterial = {
    vertexShader,
    fragmentShader, 
    levelUpFragmentShader,
    dustflowShader
}
