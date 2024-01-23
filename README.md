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

## 2. Shader Based Materials

**checkout ``**
_(mark !2)_

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
