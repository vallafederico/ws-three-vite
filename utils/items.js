const defaults = {
  description: "This is a description of the item",
};

// !2 wrong name for texture in here corrected for "diffuse" from "texture"
export const items = [
  {
    name: "000",
    slug: "000",
    ...defaults,
    webgl: {
      model: "/webgl/001.glb",
      diffuse: "/webgl/001.jpg",
    },
  },
  {
    name: "001",
    slug: "001",
    ...defaults,
    webgl: {
      model: "/webgl/002.glb",
      diffuse: "/webgl/002.jpg",
    },
  },
  {
    name: "002",
    slug: "002",
    ...defaults,
    webgl: {
      model: "/webgl/003.glb",
      diffuse: "/webgl/003.jpg",
    },
  },
  {
    name: "003",
    slug: "003",
    ...defaults,
    webgl: {
      model: "/webgl/004.glb",
      diffuse: "/webgl/004.jpg",
    },
  },
  {
    name: "004",
    slug: "004",
    ...defaults,
    webgl: {
      model: "/webgl/005.glb",
      diffuse: "/webgl/005.jpg",
    },
  },
  {
    name: "005",
    slug: "005",
    ...defaults,
    webgl: {
      model: "/webgl/006.glb",
      diffuse: "/webgl/006.jpg",
    },
  },
  {
    name: "006",
    slug: "006",
    ...defaults,
    webgl: {
      model: "/webgl/007.glb",
      diffuse: "/webgl/007.jpg",
    },
  },
  {
    name: "007",
    slug: "007",
    ...defaults,
    webgl: {
      model: "/webgl/008.glb",
      diffuse: "/webgl/008.jpg",
    },
  },
  {
    name: "008",
    slug: "008",
    ...defaults,
    webgl: {
      model: "/webgl/009.glb",
      diffuse: "/webgl/009.jpg",
    },
  },
  {
    name: "009",
    slug: "009",
    ...defaults,
    webgl: {
      model: "/webgl/010.glb",
      diffuse: "/webgl/010.jpg",
    },
  },
];
