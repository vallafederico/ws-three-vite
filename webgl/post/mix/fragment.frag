uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;

uniform sampler2D u_rings;


void main() {
    // !5.1 we're now using our texture instead of the basic render one
    gl_FragColor.rgb = texture2D( u_rings, vUv ).rrr;
    gl_FragColor.a = 1.;
}