uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {
    gl_FragColor.rgb = texture2D( tDiffuse, vUv ).rrr;
    gl_FragColor.a = 1.;
}