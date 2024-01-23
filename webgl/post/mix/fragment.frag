// uniform float opacity;
// uniform sampler2D tDiffuse;
varying vec2 vUv;

uniform sampler2D u_rings;
uniform sampler2D u_about;

uniform float u_page;


void main() {
    // !5.1 we're now using our texture instead of the basic render one

    // !5.3 mix the two
    vec4 rings = texture2D( u_rings, vUv );
    vec4 about = texture2D( u_about, vUv );

    vec4 final = mix(rings, about, u_page);

    gl_FragColor.rgb = final.rgb;
    gl_FragColor.a = 1.;
}