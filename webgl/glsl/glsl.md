# Glsl Useful Snippets

## What THREE provides

```c++
    attribute vec3 normal;
    attribute vec3 position;
```

## Lights

```c++
// point light
float ptl = dot(normalize(vec3(1., 1., 1.)), v_normal);

```

```c++
    // hemi light
    vec3 h_sky = vec3(1., 1., 1.);
    vec3 h_ground = vec3(.1, .1, .1);
    vec3 h_dir = normalize(vec3(1., -2., 4.));
    vec3 hlight = mix(h_ground, h_sky, 1. - dot(h_dir, v_normal));
```

## Materials

```c++
    // matcap material setup
    varying vec3 v_normal;
    varying vec3

    // (> VERTEX)
    vec4 transformed = modelViewMatrix \* vec4(position, 1.0);
    v_view = normalize(- transformed.xyz);
    v_normal = normal;

    // (> FRAGMENT)
    vec3 x = normalize( vec3(v_view.z, 0., -v_view.x));
    vec3 y = cross(v_view, x);
    vec2 fakeUv = vec2( dot(x, v_normal), dot(y, v_normal)) * .495 + .5;
```

## Transforms

```c++
// rotate 2d
vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}

// rotation 3d
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}
```
