#define MPI 3.1415926535897932384626433832795

uniform float u_time;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_view;

varying vec3 LIGHT_POS;





void main() {
  vec3 pos = position;
  
  // matcap handling
  vec4 transformed = modelViewMatrix * vec4(position, 1.0);
  v_view = normalize(- transformed.xyz);


  gl_Position = projectionMatrix * transformed;
  v_uv = uv;

  // !2 normals need to be updated based on the rotation
  // three automatically passes the normal matrix as a uniform
  // and will be coherent with the modelViewMatrix, which
  // is what we modify when setting rotation.x and rotation.y
  v_normal = normalize(normalMatrix * normal); 
  LIGHT_POS = vec3(0., 1., 0.);
}