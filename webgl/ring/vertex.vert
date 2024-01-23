#define MPI 3.1415926535897932384626433832795

uniform float u_time;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_view;

varying vec3 LIGHT_POS;

// (!4.1) uniforms to animate in shader
uniform float u_a_hover;

#include '../glsl/rotate.glsl'

void main() {
  vec3 pos = position;

  // !4.1 animate with the uniform
  pos *= 1. + u_a_hover * .2; 

  float rot_fac = u_a_hover * MPI * .3; 
  pos = rotate(pos, vec3(-1., -1., -1.), rot_fac);
  // !4.1 rotate also normals as this rotation since it's done in shaders
  // will not apply to the normalMatrix, so light will not be affected
  vec3 nor = rotate(normal, vec3(-1., -1., -1.), rot_fac);
  

  // !4.1 update the position we're using for the model
  vec4 transformed = modelViewMatrix * vec4(pos, 1.0);
  v_view = normalize(- transformed.xyz);


  gl_Position = projectionMatrix * transformed;
  v_uv = uv;

  // !2 normals need to be updated based on the rotation
  // three automatically passes the normal matrix as a uniform
  // and will be coherent with the modelViewMatrix, which
  // is what we modify when setting rotation.x and rotation.y

  // !4.1 update the normal we're using
  v_normal = normalize(normalMatrix * nor); 
  LIGHT_POS = vec3(0., 1., 0.);
}