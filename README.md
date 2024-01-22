# Giga Workshops

# WS

(Live Preview)[giga-webgl.vercel.app]

```node
git checkout {{step #}}
```

## 1. Nuxt Boilerplate

checkout `afab8e8`

### <Canvas> Nuxt Component

- Set up a `Canvas.vue` component where the app entry point resides
  - Only notable at this point is you should always export named class in your system (nuxt doesn't work otherwise)
- In this case the canvas is going to be persistent, so:

  - It sits outside the router scope
  - We're not really worried about mounting / unmounting and the lifecycle

- Canvas is going to stay fixed in the bg, so it's always covering the whole screen
- Note that we're adding a div that's going to get a canvas added by the code itself, but we're still providing styles for when the canvas will be there

```jsx
<div class="fixed top-[0px] left-[0px] w-screen h-screen" ref="canvas"></div>
```

```css
canvas {
  width: 100vw;
  height: 100svh;
  box-sizing: border-box;
  pointer-events: none;
  /* border: 3px solid pink; */
}
```

##### In case of mounting in a non persistent component

- Most pricinples are the same
- You'll want to unmount it when whe component unmounts
- If you're attaching it to the window you'll also want to clear that reference
- Webgl stays in memory in a weird presistent way so this is really important

### Nuxt

- Setup base comms between nuxt and webgl entry point
  - Using mitt for events, we really just need a way to communicate
  - Is convenient because I can get it inside the app and emit from the webgl class system
- Also having custom scroll (w/Lenis) as a plugin
  - Plugin just so I can reference it from anywhere and get the scroll positions inside the app

### Webgl Entry

- Our entry point will be the gl.js file
- Empty for now, just concerned with having basic examples of events and stuffs

## 2. THREEJS Boilerplate (in Nuxt)

checkout `6dc4274` (check if correct)

### Decisions

- Using three instead of framework specific solutions (tresjs)
  - More flexibility given the imperative approach (vs declarative)

### Install / Plugins

- webgl with `three` (THREEJS)[https://threejs.org/]
- `vite-plugin-glsl -D` to be able to import shaders and use in separate files (NPM)[https://www.npmjs.com/package/vite-plugin-glsl]

```js
//  nuxt.config.ts
import glsl from "vite-plugin-glsl";

export default defineNuxtConfig({
  // ... (normal nuxt config whatever)
  vite: {
    plugins: [
      gsls({
        include: [
          "**/*.glsl",
          "**/*.vert",
          "**/*.frag",
          // "**/*.wgsl",
          // "**/*.vs",
          // "**/*.fs",
        ],
        exclude: undefined,
        warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
        defaultExtension: "glsl", // Shader suffix when no extension is specified
        compress: false, // Compress output shader code
        watch: true, // Recompile shader on change
        root: "/", // Directory for root imports
      }),
    ],
  },
});
```

### Boilerplate

- WebGl in general requires (a lot of) boilerplate code
- Most of the things we do are, at least at a basic level, always the same
- Building blocks to save time + be more efficent
- Be able to understand and build on top of those

#### Structure

##### Main

- `gl.js` : main component that holds interface with nuxt and webgl context
- `scene.js` : main scene handler - contains all the scenes, groups (and in simpler projects meshes / models directly )

##### Meshes & Loaders

This classes are the starters of almost all you'll need to do. You should use those to copy and paste and modify to make it into something cooler.

- `quad.js` - basic plane for test / images and plane based effects
- `instance.js` - basic instancing starter example
- `model.js` - group wrapper with utilities to use with a loaded 3d model

  - please note that glb/gltf might come with weird threes. By default this class looks for the first group it finds in the three. This might be why your object doesn't look as expected. You can look into the object yourself and pass the correct part of the mesh as the content.

- utils - various loaders and a main loader functions that takes an object of references (usually in /public) and spits out the loaded version of it

  - you can use all the loaders separately if needed
  - it automatically takes the content of the asset folder
  - you can pass custom object if you want to load only specific things inside a component
  - you can use single loaders to load instances of specific things

##### Post Processing

- `/post` - contains the starter for post processing passes

  - `index.js` is the basic setup
    - if you're using default passes you should probably do it in here directly
  - `/pass` contains the full pipeline for a custom post shader (you should duplicate that if you need more passes)

##### Mix

- `assets.js` - contains basic assets references

- `/glsl` - should contain all the shader chunks you'll want to reuse

  - we can import by using the `#include` syntax thanks to the `vite-glsl-plugin` (we might want to call it chunks)

##### Other

- `gsap.js` - wraps our gsap. In this case also provides the SINGLE raf we'll be using in the whole project. We attach it to the scroll in the plugin folder and we use it inside the `gl.js` to trigger the `render()` function

## 2. Starting the project

### ...
