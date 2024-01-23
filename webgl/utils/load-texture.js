import { TextureLoader } from "three";
const tl = new TextureLoader();

export function loadTexture(url) {
  return new Promise((resolve) => {
    tl.load(url, (data) => {
      data.needsUpdate = true;

      // !2 usually when dealing with texture models you want to NOT flip the texture
      data.flipY = false;

      // add sizes (if needed for texture control)
      //   data.source.w = data.source.data.width;
      //   data.source.h = data.source.data.height;
      //   data.source.r = data.source.data.width / data.source.data.height;

      resolve(data);
    });
  });
}
