uniform float u_time;
// uniform sampler2D u_t1; vec4 img = texture2D(u_t1, v_uv);

varying vec2 v_uv;
// varying vec3 v_position;


void main() {


  gl_FragColor.rgb = vec3(v_uv, 1.);
  gl_FragColor.a = 1.;
}