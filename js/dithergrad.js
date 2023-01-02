// Three.js - Shadertoy Basic
// from https://r105.threejsfundamentals.org/threejs/threejs-shadertoy-basic.html

'use strict';

import * as THREE from './three.module.js';

function main() {
    const canvas = document.querySelector('.dither');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.autoClearColor = false;

    const camera = new THREE.OrthographicCamera(
        -1, // left
        1, // right
        1, // top
        -1, // bottom
        -1, // near,
        1, // far
    );
    const scene = new THREE.Scene();
    const plane = new THREE.PlaneGeometry(2, 2);

    const fragmentShader = `
    #include <common>

    uniform vec3 iResolution;
    uniform float iTime;

    /*

    This shader tests how the Valve fullscreen dithering
    shader affects color and banding.

    The function is adapted from slide 49 of Alex Vlachos's
    GDC2015 talk: "Advanced VR Rendering".
    http://alex.vlachos.com/graphics/Alex_Vlachos_Advanced_VR_Rendering_GDC2015.pdf

    --
    Zavie

    */


    float gamma = 2.2;

    // ---8<----------------------------------------------------------------------

    vec3 ScreenSpaceDither(vec2 vScreenPos, float colorDepth)
    {
        // lestyn's RGB dither (7 asm instructions) from Portal 2 X360, slightly modified for VR
        vec3 vDither = vec3(dot(vec2(131.0, 312.0), vScreenPos.xy + iTime));
        vDither.rgb = fract(vDither.rgb / vec3(103.0, 71.0, 97.0)) - vec3(0.5, 0.5, 0.5);
        return (vDither.rgb / colorDepth) * 0.375;
    }

    // ---8<----------------------------------------------------------------------

    // The functions that follow are only used to generate
    // the color gradients for demonstrating dithering effect.

    float h00(float x) { return 2.*x*x*x - 3.*x*x + 1.; }
    float h10(float x) { return x*x*x - 2.*x*x + x; }
    float h01(float x) { return 3.*x*x - 2.*x*x*x; }
    float h11(float x) { return x*x*x - x*x; }
    float Hermite(float p0, float p1, float m0, float m1, float x)
    {
        return p0*h00(x) + m0*h10(x) + p1*h01(x) + m1*h11(x);
    }

    // Source:
    // http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
    vec3 hsv2rgb(vec3 c)
    {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    vec3 generateColor(vec2 uv)
    {
        float a = sin(iTime * 0.5)*0.5 + 0.5;
        float b = sin(iTime * 0.75)*0.5 + 0.5;
        float c = sin(iTime * 1.0)*0.5 + 0.5;
        float d = sin(iTime * 1.25)*0.5 + 0.5;
        
        float y0 = mix(a, b, uv.x);
        float y1 = mix(c, d, uv.x);
        float x0 = mix(a, c, uv.y);
        float x1 = mix(b, d, uv.y);
        
        float h = fract(mix(0., 0.1, Hermite(0., 1., 4.*x0, 4.*x1, uv.x)) + iTime * 0.05);
        float s = Hermite(0., 1., 5.*y0, 5.*y1, 1. - uv.y);
        float v = Hermite(0., 1., 5.*y0, 5.*y1, uv.y);

        return hsv2rgb(vec3(h, s, v));
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        float colorDepth = 8.0; //mix(2.0, 255.0, pow(clamp(mix(-0.2, 1.2, abs(2.0 * fract(iTime / 11.0) - 1.0)), 0., 1.), 2.0));

        vec2 uv = fragCoord.xy / iResolution.xy;

        vec3 color = pow(generateColor(uv), vec3(1. / gamma));
        vec3 ditheredColor = color + ScreenSpaceDither(fragCoord.xy, colorDepth);

        vec3 finalColor = mix(color, ditheredColor, smoothstep(0.099, 0.101, uv.x));
        
        fragColor = vec4(floor(ditheredColor * colorDepth) / colorDepth, 1.0);
    }

    void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
    }
    `;
    const uniforms = {
        iTime: { value: 0 },
        iResolution:  { value: new THREE.Vector3() },
    };
    const material = new THREE.ShaderMaterial({
        fragmentShader,
        uniforms,
    });
    scene.add(new THREE.Mesh(plane, material));

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth / 4;
        const height = canvas.clientHeight / 4;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
        renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.0005;  // convert to seconds

        resizeRendererToDisplaySize(renderer);

        const canvas = renderer.domElement;
        uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
        uniforms.iTime.value = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
