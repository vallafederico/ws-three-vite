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

---

## 3. Raycasting (events)

**checkout ``**
_(mark !3)_

---

## 4. Basic Animations

### 3D Model Hover

**checkout ``**
_(mark !4.1)_

### Basic Slider

**checkout ``**
_(mark !4.2)_

### Page transition

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
