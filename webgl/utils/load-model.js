import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const loader = new GLTFLoader();

export function loadModel(url) {
  return new Promise((resolve) => {
    loader.load(url, (gltf) => {
      const result = {
        model: gltf.scene,
        // animations: gltf.animations, // use only if model has animations / skinning
      };

      //  might want to traverse here as it's more elegant
      //  but it might make more sense to do it when using the model
      // as when the model will be empty you'll need to remember
      // you've done it here

      resolve(result);
    });
  });
}

// (*) TODO : add draco loader
