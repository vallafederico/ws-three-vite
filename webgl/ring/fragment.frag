uniform float u_time;
uniform sampler2D u_t1; 
uniform sampler2D u_matcap; 

varying vec2 v_uv;

varying vec3 v_normal;
varying vec3 v_view; // !2 for matcap
// varying vec3 v_position;

varying vec3 LIGHT_POS; // !2 for light

// PARAMS
const float POINT_POWER = .4;
const float HEMI_POWER = .8;
const float MATCAP_POWER = 1.;

void main() {
  vec4 diff = texture2D(u_t1, v_uv);


  /** Lights */

  // hemisphere light
  vec3 h_sky = vec3(1., 1., 1.);
  vec3 h_ground = vec3(.1, .1, .1);
  vec3 h_dir = normalize(LIGHT_POS);
  vec3 hlight = mix(h_ground, h_sky, 1. - dot(h_dir, v_normal)) * HEMI_POWER;
  diff.rgb = diff.rgb * hlight;

  // matcap material
  vec3 x = normalize( vec3(v_view.z, 0., -v_view.x));
  vec3 y = cross(v_view, x);
  vec2 fake_uv = vec2( dot(x, v_normal), dot(y, v_normal)) * .495 + .5;
  vec3 matcap = texture2D(u_matcap, fake_uv).rgb;
  diff.rgb *= (1. - MATCAP_POWER) + matcap * MATCAP_POWER;


  gl_FragColor.rgb = diff.rgb;
  gl_FragColor.a = diff.a;
}