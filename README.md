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

**checkout `d26ce87`**
_(mark !4.2)_

- **Sliding webgl scene:**
- we create a basic `slider.js` class
- events from vue passed through `gl.js`
- we then slider the whole group containing the rings
  - this way we only update a single transform matrix, and it gets automatically registered in out slader thanks to the modelMatrix

```jsx
// * index.vue
  <div
    @click="$webgl.gl.onClick"
    @mousedown="$webgl.gl.onMouseDown"
    @mouseup="$webgl.gl.onMouseUp"
    class="h-screen py-10"
  >

    <!-- add add slider events on the homepage only -->

    {/* ... */}
  </div>
```

```js
// * gl.js
async init(items) {
  // ...

  // initialise slider
  this.slider = new Slider([0, this.scene.children[0].children.length - 1], {
    remap: 0.0001,
  });
}

// ...

// mouse events for slider
onMouseMove(e) {
  // ...
  this.slider?.onMouseMove(e);
}

onMouseDown(e) {
  this.slider?.onMouseDown(e);
}

onMouseUp(e) {
  this.slider?.onMouseUp(e);
}

render() {
  // ...

  //render slider and pass X to scene
  this.slider?.update();
  this.scene?.update(this.time, this.slider.x || 0);

  // ...
}

// * scene.js
update(t, x) {
  if (!this.shouldRender) return;

  // move group by slider X
  this.rings.position.x = -x;

  this.rings?.children.forEach((ring) => ring.update(t));
}
```

### 4.3 (Basic) Page transition

**checkout `47a91e2`**
_(mark !4.3)_

- **Page based animaton:**
  - we create a custom function for each page that needs an animation in `gl.js`
  - we restructure from the vue side the `onBeforeMount` to call the correct function
  - we handle a bit of state for the raycaster and such

_Added index in the "fake" cms so can be read from the function and passes to the init for the products. In a normal scenario you probably will match the array by slug (as the ring has the data) and find the correct one like this_

```js

pageProduct(index) {
  this.shouldRaycast = false;

  if (this.isInit) {
    this.isInit = false;
    // to handle initial state
  } else {
    // to handle when a page is transitioned to

    // we move the slider to position
    this.slider.toPosition(+index);

    // we scale everything and keep the selected one
    this.scene.rings.children.forEach((item, i) => {
      item.onHover();

      if (i !== +index) {
        gsap.to(item.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          onComplete: () => {
            item.visible = false;
          },
        });
      } else {
        gsap.to(item.scale, {
          x: 2,
          y: 2,
          z: 2,
          duration: 1,
          ease: "back.out",
        });
      }
    });
  }
}

// ...
// home reverses the state
// about currently empty

```

_Now this is fine because webgl is real fast, but in general if you want to go for this approach I'd suggest handling a single gsap tween with a random object, use the `onUpdate` function and pass the value as scale to all children that go in 1 direction and rever it for the ones that go the other way. This way you'll end up with a single instead of one per item. We'll not spend more time on this because we go for a cooler tranistion and optimise there._

---

## 5. RenderTargets

### 5.1 Post Processing Basics

**checkout `4a83b6a`**
_(mark !5.1)_

- to render a scene to a texture you control we use a WebGlRenderTarget
  - we need to give it the correct size
- we use it by setting the renderer to render to this target, and pass only a what we want this target to render
- we'll then pass the resulting texture to out post processing pass, and treat it as a normal texture
  - you can think of threejs postprocessing as a 3d plane, always flat against the screen, that gets textures of things we renderer and does more shader work on top of it
  - we render whatever we want not to the screen but to textures first
  - we then this textures to this final plane
  - the last pass is rendering this plane to the screen to display in the viewport
- postprocessing is a nice thing to tweak on mobile to recover performance if needed

```js
//  * scene.js
constructor({ vp }) {
  super({});
  this.vp = vp;
}

async load({ items }) {
  this.rings = new Group();

  // create render target for this scene
  this.target = new WebGLRenderTarget(
    this.vp.w * this.vp.dpr(),
    this.vp.h * this.vp.dpr()
  );

  // ...
}

update(t, x) {
  if (!this.shouldRender) return;

  this.rings.position.x = -x; // !4.2 move group by slider X
  this.rings?.children.forEach((ring) => ring.update(t));

  // render to target and return from update function
  this.vp.renderer.setRenderTarget(this.target);
  this.vp.renderer.render(this.rings, this.vp.camera);
  this.vp.renderer.setRenderTarget(null);

  // return the target after animation
  return this.target.texture;
}

resize(vp) {
  // resize the target
  this.vp = vp;
  this.target.setSize(this.vp.w * this.vp.dpr(), this.vp.h * this.vp.dpr());

  this.quad?.resize();
}

//  * gl.js
render() {
  // ...

  //  get the rendered scene texture from the target and pass it to post
  this.ringScene = this.scene?.update(this.time, this.slider.x || 0);

  if (this.post && this.post.isOn) {
    // pass it
    this.post.renderPasses(this.time, { rings: this.ringScene });
    this.post.render();
  } else {
    this.renderer.render(this.scene, this.camera);
  }
}


// * post.js`

constructor() {
  // ...

  // we can avoid a useless render now because we're doing this manually
  // this.renderPass = new RenderPass(scene, camera);
  // this.addPass(this.renderPass);
}


createPasses() {
  // restructure to access
  this.mixpass = new MixPass();
  this.addPass(this.mixpass);
}

renderPasses(t, { rings }) {
  // get ring texture from scene and pass it to shader
  this.mixpass.uniforms.u_rings.value = rings;
}
```

```c++
// * post/mix/fragment.frag

// pass the ring
uniform sampler2D u_rings;


void main() {
    // we're now using our texture instead of the basic render one
    gl_FragColor.rgb = texture2D( u_rings, vUv ).rrr;
    gl_FragColor.a = 1.;
}

```

### 5.2 Threejs Default Passes

\*_checkout ``\_\_(mark !5.2)_

- **Basic Threejs passes:**
  - we now have an antiasing issue, since when using custom passes three can't do autoimatic antialising
  - threejs has a pass you cna use made exactly for this
  - there's lots of nice effects that can be used and can be checked out in the examples of three by searching post processing

```js
// * post.js

// import needed passes from three
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";

createPasses() {
  this.mixpass = new MixPass();
  this.addPass(this.mixpass);

  // create the pass (needs to be the last one)
  this.fxaa = new ShaderPass(FXAAShader);
  this.addPass(this.fxaa);
}

resize(vp) {
  // resize passes (this needs to be called form gl.js)
  this.vp = vp;

  // pass resolution as uniforms (copied form the example)
  this.fxaa.material.uniforms["resolution"].value.x =
    1 / (this.vp.w * this.vp.dpr());
  this.fxaa.material.uniforms["resolution"].value.y =
    1 / (this.vp.w.h * this.vp.dpr());
}
```

**Be aware that when using passes made by someone else those might have specific needs. Read the docs or you'll get weird errors.**

### 5.3 Custom Passes

**checkout `2f13503`**
_mark !5.3_

- this approach allows for more complex scenes to be route dependant, take a first look at render targets, image blending and cool things in webgl

  - there's no right or wrong, both are fine (but serve different purposes)

- using multiple scenes based on the page
- handling page based state
- rendertarget and post processing

- first we create an alternative collection of objects to show as a new scene `about.js`

  - it's just a new scene, copied (and simplified) from `scene.js`

- we also make some logic to make sure we can conveniently switch page and we don't render both at the same time when not needed

- we add a function in post to handle the scene switch

- we mix the two textures with an uniforms

```js
// * gl.js
this.about = new AboutScene(this.vp); // !11

pageAbout() {
  this.switchPage(1);
}

render() {
  // ...
  if (this.scene && this.shouldRender)
    this.ringsTexture = this.scene?.update(this.time, this.slider?.x || 0);

  // we make the rendering of those conditional
  // based on the shouldRender property
  // so we control with a single one both the animations
  // and the actual rendering process
  if (this.about && this.about.shouldRender)
    this.aboutTexture = this.about?.update(this.time);

  if (this.post && this.post.isOn) {
    this.post.renderPasses(this.time, this.ringsTexture, this.aboutTexture);
    this.post.render();
  } else {
    this.renderer.render(this.scene, this.camera);
  }
}

async switchPage(value) {
  // add a function to switch between different targets
  // make sure we render both only when transitioning
  // you might want to look at ping pong technique
  // if your scenes are too heavy and don't want
  // to render both at the same time

  if (value === 1) {
    // to about
    this.aboutScene.shouldRender = true; // this controls raf
    // technically not needed because we're using an if on the render function but you never know
    this.aboutScene.visible = true;
    await this.post.toPage(1);
    this.scene.visible = false;
    this.scene.shouldRender = false;
  } else {
    // to home
    this.scene.shouldRender = true;
    this.scene.visible = true;
    await this.post.toPage(0);
    this.aboutScene.visible = false;
    this.aboutScene.shouldRender = false;
  }
}

// * about.js
// is just a real basic copy of our scene at this point

// * post.js
// ...

/** Animation */
toPage(val) {
  // !11
  return new Promise((resolve) => {
    gsap.to(this.mixpass.uniforms.u_page, {
      value: val,
      duration: 1,
      onComplete: () => {
        resolve();
      },
    });
  });
}
```

```c++
uniform sampler2D u_rings;
uniform sampler2D u_about;

uniform float u_page;

void main() {
    vec4 rings = texture2D(u_rings, vUv);
    vec4 about = texture2D(u_about, vUv); // !11

    vec3 diff = mix(rings.rgb, about.rgb, u_page);


    gl_FragColor.rgb = diff;
    gl_FragColor.a = 1.;
}

```

---
