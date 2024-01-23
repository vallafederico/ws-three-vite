# Threejs Nuxt Workshop

[Live Preview](ws-three-vite.vercel.app)

You can follow the steps by calling
`git checkout` `{step #}`

## 1. Project Setup

**checkout `0e2ec0a`**
_(mark !1)_

- **Boilerplate Setup with Loader:**
  - We have already set up the boilerplate with the loader.
  - To clarify, we should avoid loading assets from a global source.
  - Instead, our goal is to load assets from a simulated CMS located in `/utils/items`.

```js
// * items.js (fake CMS)
export const items = [
  {
    name: "000",
    slug: "000",
    ...defaults,
    webgl: {
      model: "/webgl/000.glb",
      diffuse: "/webgl/000-diff.jpg",
    },
  },
  {
    name: "001",
    slug: "001",
    ...defaults,
    webgl: {
      model: "/webgl/001.glb",
      diffuse: "/webgl/001-diff.jpg",
    },
  },
  {
    name: "002",
    slug: "002",
    ...defaults,
    webgl: {
      model: "/webgl/002.glb",
      diffuse: "/webgl/002-diff.jpg",
    },
  },
  // ...
];
```

- **Loading Strategies:**
  - Given that the model will be fetched from the CMS, it's important to note that we cannot load a single asset and then later split it into different parts.
  - Ideally, we should opt for a solution that involves making a single network request. This is the preferred approach, but it's not always possible.

```js
// * scene.js - load function
async load({ items }) {
  this.rings = new Group(); // create a group

  // create items and add them to group (before loading them)
  this.rings.add(
    ...items.map(
      (item, index) =>
        new Ring({
          data: item.webgl,
          index,
        })
    )
  );

  this.add(this.rings); // add them

  // load all of them and use the timer here
  console.time("load::scene");
  await Promise.all(this.rings.children.map((ring) => ring.load()));
  console.timeEnd("load::scene");

  this.create();
}
```

- **Creating a `Ring` Class:**
  - We also need to duplicate the existing model class and transform it into a `Ring` class.
  - There will be a few differences between the new `Ring` class and the original model class.

```js
// * ring.js (duplicate of model)
export class Ring extends Group {
  constructor({ data, index }) {
    super();
    // get data instead of geometry directly
    this.data = data;
    this.index = index;
  }

  async load() {
    // add a load function to be called from the scene
    const { model, diffuse } = await loadAssets(this.data);
    this.create(model, diffuse);
  }

  create(geometry, diffuse) {
    const group = findGroup(geometry);

    this.material = new Material();

    group.traverse((item) => {
      if (item.isMesh) {
        item.material = this.material;
      }
    });

    // use the index to move items
    this.position.x = this.index;

    this.add(...group.children);
  }

  // ...
}
```

[TODO \* add image step1.jpeg]

---

## 2. Shader Based Basic Materials

**checkout `a545b2d`**
_(mark !2)_

- **Passing Textures:**

  - we have the **diffuse** texture already automatically loaded from the loader
    - be aware model texture might need flipping, in this case (for now) we might do it directly in the loader
  - we also want something to simlulate some lights with mode depth
    - we can use a **matcap** as it's always the less computationally expensive, faster to load and gives a great result 90% of the time
      - we need to load this, and we do it from then `scene.js` and using the loader function with the `assets.js`, so without passing any arguments

- we'll also add some simple rotation just to see the effect of the light a bit better
  - to do this you want to add the rotation in the `ring.js`
  - and pass the time to the ring models from the `scene.js`

_(Fixed an issue with the items.js where I gave the wrong name to the textures, now are called diffuse and not texture)_

```js
// * texture-loader.js
export function loadTexture(url) {
  return new Promise((resolve) => {
    tl.load(url, (data) => {
      data.needsUpdate = true;

      // usually when dealing with texture models you want to NOT flip the texture
      data.flipY = false;

      resolve(data);
    });
  });
}

// * scene.js
load() {
  // ...
  console.time("load::scene");
  // load matcap only once
  const { matcap } = await loadAssets();
  // pass it to the ring
  await Promise.all(this.rings.children.map((ring) => ring.load({ matcap })));
  console.timeEnd("load::scene");
}

update(t) {
  // ...
  // pass time from scene to all children
  this.rings?.children.forEach((ring) => ring.update(t));
}

// * ring.js
async load({ matcap }) {
  // ...

  // pass matcap to create
  this.create({ geometry: model, diffuse, matcap });
}

create({ geometry, diffuse, matcap }) {
  const group = findGroup(geometry);

  this.material = new Material({
    // pass diffuse and matcap texture to the material
    u_t1: diffuse,
    u_matcap: matcap,
  });
  // ...
}

update(t) {
  this.material.time = t;

  // add simple movement to check out the light
  this.rotation.y = t * 0.8;
  this.rotation.x = t * 0.8;
}
```

- **Light and Diffuse in Shaders:**

  - when dealing with materials we'll almost always need **normals** and **uvs**
    - **normals** are used to calculate lights
    - **uvs** to map textures to models
  - to pass those from the `vertex` shader to the`fragment` we'll use **varyings** for this
  - we'll also need the view ray for the formula to apply the matcap, also calculated in the `vertex` and passed in the `fragment`
  - then we can just add this values to out diffuse, getting both light informations and (fake) reflections
  - we'll also pass the light position from the `vertex` shader as it might be useful to have this in both and the only way data flows in this case is vertex > fragment

```c++
  // * vertex.vert
  #define MPI 3.1415926535897932384626433832795

  uniform float u_time;

  varying vec2 v_uv;
  varying vec3 v_normal;

  // create varyings
  varying vec3 v_view;
  varying vec3 LIGHT_POS;


  void main() {
    vec3 pos = position;

    // calculate the view ray for the matcap
    vec4 transformed = modelViewMatrix * vec4(position, 1.0);
    v_view = normalize(- transformed.xyz);


    gl_Position = projectionMatrix * transformed;
    v_uv = uv;

    // also multiply the normal with the normal matrix to make sure the rotation we're passing freom the object is reflected in the light informations (*)
    v_normal = normalize(normalMatrix * normal);
    LIGHT_POS = vec3(0., 1., 0.);
  }

// fragment.frag
// ...

// get varyings from vertex shader
varying vec3 v_normal;
varying vec3 v_view;
varying vec3 LIGHT_POS;

// define some params for easier control
// PARAMS
const float POINT_POWER = .4;
const float HEMI_POWER = .8;
const float MATCAP_POWER = 1.;

void main() {
  vec4 diff = texture2D(u_t1, v_uv);


  /** Lights */

  // hemisphere light implementation
  vec3 h_sky = vec3(1., 1., 1.);
  vec3 h_ground = vec3(.1, .1, .1);
  vec3 h_dir = normalize(LIGHT_POS);
  vec3 hlight = mix(h_ground, h_sky, 1. - dot(h_dir, v_normal)) * HEMI_POWER;
  diff.rgb = diff.rgb * hlight; // mixing light by *

  // matcap implementation
  vec3 x = normalize( vec3(v_view.z, 0., -v_view.x));
  vec3 y = cross(v_view, x);
  vec2 fake_uv = vec2( dot(x, v_normal), dot(y, v_normal)) * .495 + .5;
  vec3 matcap = texture2D(u_matcap, fake_uv).rgb;
  diff.rgb *= (1. - MATCAP_POWER) + matcap * MATCAP_POWER; // mixing matcap


  gl_FragColor.rgb = diff.rgb;
  gl_FragColor.a = diff.a;
}
```

**(\*) When multiplying matrices vectors order of operation is important, and the matrix always comes first**

[TODO \* add image step1.jpeg]

---

## 3. Raycasting (3d events)

### 3.1 Raycasting Basics

**checkout `7c33c8e`**
_(mark !3.1)_

The [Raycaster](https://threejs.org/docs/#api/en/core/Raycaster) is a class in three that allows us to to cast a ray from the camera to a mouse (or any vector2 position) and check if it intersects with any mesh on the scene. We use it to calculate clicks on meshes based on intersections.

We want to set it up in `gl.js` as we'll need the mouse position for this and we might want to to more with this later.

- First step is to add mouse move events, and remap the coordinates to -1 to 1 both in X and Y
- The initialise the raycaster, and calculate the intersections with our meshes

  - we're using pretty complex meshes though, and the performance will suffer.

- To fix this we create invisible target meshes in the `ring.js` class, set it to not be seen, and we'll check intersection on those.

- we set the event from vue and call a method on the webgl class

```jsx
// * app.vue
<script setup>
  const { $webgl } = useNuxtApp();
</script>

<template>

  <main @mousemove="$webgl.gl.onMouseMove" class="relative z-10">
  {/* ... */}
  </main>

{/* ... */}
</template>
```

```js
// * gl.js
setup(canvas) {
  // ...
  // initialise raycaster
  this.raycaster = new Raycaster();
  this.raycaster._isReady = false;
}

async init(items) {
  // ...

  // set raycaster targets and make it active
  this.raycaster._targets = this.scene.children[0].children.map(
    (item) => item.target
  );
  this.raycaster._isReady = true;
}

onMouseMove(e) {
  // mousemove event for raycasting, coordinates need normalisation
  // comes from app.vue for consistency
  this.mouse.x = (e.clientX / this.vp.w) * 2 - 1;
  this.mouse.y = -(e.clientY / this.vp.h) * 2 + 1;

  this.castRay();
}

castRay() {
  if (!this.raycaster._isReady) return;

  // cast ray function from mouse position
  this.raycaster.setFromCamera(this.mouse, this.camera);

  const intersects =
    this.raycaster.intersectObjects(this.raycaster._targets)[0] || null;

  if (intersects) {
    const { index } = intersects.object.parent;
    console.log(index);
    return index;
  }
}


// * ring.js
create({ geometry, diffuse, matcap }) {
  // ...

  // create a target simple mesh and make it invisible
  this.target = new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshBasicMaterial({ color: 0xff0000 })
  );
  this.target.visible = false;

  this.add(...group.children, this.target);
}
```

### 3.2 Sending events and changing page

**checkout `0fca226`**
_(mark !3.2)_

- **Setup basic Event pipeline:**
  - from `index.vue` we set a click event
  - it's quite conveninent to do it like this so it automatically unmounts and we don't need to handle state from the webgl
    - you might want to use better names for specific events, but in this case it's the only one so it's fine
  - we slightly modify the `castRay()` function to return more data
    - to do that we also modify what info get to the `ring.js` and what we load from there

```vue
<div @click="$webgl.gl.onClick" class="h-screen py-10"></div>
```

```js

// *gl.js
castRay() {
  // ...

  if (intersects) {
    // restructure intersects to get more data
    const { parent } = intersects.object;
    return parent.data;
  } else {
    return null;
  }
}

// * scene.js
async load({ items }) {
  this.rings = new Group();

  this.rings.add(
    ...items.map((item, index) => {
      return new Ring({
        // pass the 2hole info to the ring
        data: item,
        index,
      });
    })
  );
  // ...
}

// * ring.js
async load({ matcap }) {
  // only pass the webgl to the loader
  const { model, diffuse } = await loadAssets(this.data.webgl);
  // ...
}

```

---

## 4. Basic Animations

- **Animating in Webgl:**
  - Is done through **uniforms**
  - With three you can also use scale and position for groups and meshes
    - In this case what you're doing is effectively modifying uniforms you don't see as those are set automatically thanks to how the `ShaderMaterial` works

### 4.1 3D Model Hover

**checkout `0780e30`**
_(mark !4.1)_

First animation we can build is a hover effect. We alreayd have the raycaster, we just need to make sure since it fires continuosly, that it only fires once per event. We can build it all inside the Ring class itself, and trigger the event from the gl class.

- some simple logic in gl.js to make sure we call the event only once, and call this on mousemove
- add a uniform for controlling the hover, and change it's value with gsap
  - notice uniforms have a `.value` inside which is pretty convenient for how gsap works
- then some basic modifications in shaders, scale and rotation for now
  - notice that we just rotate the position vector that rotation is not going to respond to light
  - this happens because we're using the normalMatrix which is an automatic three uniform, but that is not aware of this further modification
  - to fix this we'll need to also rotate the normal if we're doing the operation on GPU and not CPU

```js
  // gl.js
  castRay() {
    // ...

    const { parent } = intersects.object;
    this.rayHover(parent.index); // call the hover function
    return parent.data;
  } else {
    this.rayHover(); // and call it with no value
    return null;
  }
}

// hover function to change ring state
rayHover(index = null) {ù
// make sure runs only once
  if (index === this.a.hoverCurr) return;

  if (index !== null) {
    this.scene.rings.children[index].onHover(1);
  } else {
    this.scene.rings.children[this.a.hoverCurr]?.onHover(0);
  }

  this.a.hoverCurr = index;
}

// * ring.js
/** Animation */
onHover(val = 0) {
  // hover state with gsap
  gsap.to(this.material.uniforms.u_a_hover, {
    value: val,
    duration: 0.9,
  });
}

```

- **Animating with uniforms:**
  - We now have a value that updates on hover

```c++
// ...
// pass the uniform to animate in shader
uniform float u_a_hover;

// import utility rotation function as shader chunk
#include '../glsl/rotate.glsl'

void main() {
  vec3 pos = position;

  // animate with the uniform
  pos *= 1. + u_a_hover * .2;

  float rot_fac = u_a_hover * MPI * .3;
  pos = rotate(pos, vec3(-1., -1., -1.), rot_fac);
  // rotate also normals as this rotation since it's done in shaders
  // will not apply to the normalMatrix, so light will not be affected
  vec3 nor = rotate(normal, vec3(-1., -1., -1.), rot_fac);


  // update the position we're using for the model
  vec4 transformed = modelViewMatrix * vec4(pos, 1.0);
  v_view = normalize(- transformed.xyz);


  gl_Position = projectionMatrix * transformed;
  v_uv = uv;

  // update the normal we're using so
  // the material reacts correctly to lights
  v_normal = normalize(normalMatrix * nor);
  LIGHT_POS = vec3(0., 1., 0.);
}


```

### 4.2 Basic Slider

**checkout ``**
_(mark !4.2)_

### 4.3 Page transition

_(mark !4.3)_

---

## 5. RenderTargets

### 5.1 Post Processing Basics

**checkout ``**
_(mark !5.1)_

### 5.2 Threejs Default Passes

**checkout ``**
_(mark !5.2)_

### 5.3 Custom Passes

**checkout ``**
_(mark !5.2)_

#### Scene based page transition

#### ??? Noise Post processing

---
