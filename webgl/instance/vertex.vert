#define MPI 3.1415926535897932384626433832795


attribute vec3 a_position;

uniform float u_time;
varying vec2 v_uv;


void main() {
  vec3 pos = position;
  pos += a_position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  v_uv = uv;
}


/*
  vec4 m_pos = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 1000. * (1. / -m_pos.z);
  gl_Position = projectionMatrix * m_pos;
*/