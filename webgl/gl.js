import { WebGLRenderer, PerspectiveCamera, Raycaster } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Scene } from "./scene";
import { AboutScene } from "./about";
import { Post } from "./post";
import { Slider } from "./slider";

export class Gl {
  shouldRender = false;
  isInit = true;
  time = 0;
  mouse = { x: 0, y: 0 };
  a = {
    hoverCurr: null,
  };
  shouldRaycast = true;
  // initial setup
  // initialset = null;
  scenes = { curr: null, currTx: null, next: null, nextTx: null };
  constructor({ $nuxt }) {
    this.nuxt = $nuxt;
  }

  set data(data) {
    const { canvas, items } = data;
    this.canvas = canvas;
    this.items = items;
  }

  start(currentScene) {
    this.setup(currentScene);
    this.init();
    this.initEvts();
  }

  setup(currentScene) {
    // viewport utils
    this.vp = {
      w: window.innerWidth,
      h: window.innerHeight,
      aspect: () => {
        return this.vp.w / this.vp.h;
      },
      dpr: () => {
        return Math.min(window.devicePixelRatio, 2);
      },
    };

    // webgl renderer
    this.renderer = new WebGLRenderer({
      alpha: true,
    });

    this.renderer.setPixelRatio(this.vp.dpr());
    this.renderer.setSize(this.vp.w, this.vp.h);
    this.renderer.setClearColor(0x000000, 1);
    this.canvas.appendChild(this.renderer.domElement);

    // camera
    this.camera = new PerspectiveCamera(
      70, // fov
      this.vp.aspect(), // aspect
      0.1, // near
      1000 // far
    );

    this.camera.position.set(0, 0, 2);

    this.vp.renderer = this.renderer;
    this.vp.camera = this.camera;

    this.scenes.curr = new currentScene({ vp: this.vp });
    this.scenes.next = new AboutScene({ vp: this.vp });

    // this.setupControls();
    this.setupPost();

    this.raycaster = new Raycaster();
    this.raycaster._isReady = false;
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, document.body);
    this.controls.enableZoom = false;
  }

  setupPost() {
    this.post = new Post({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
    });
  }

  /** Lifecycle */
  async init() {
    // console.log("init:call");

    this.assets = await this.scenes.curr.load({ items: this.items });
    this.nuxt.$bus.$emit("app:ready");

    this.shouldRender = true;

    this.raycaster._targets = this.scenes.curr.children[0].children.map(
      (item) => item.target
    );
    this.raycaster._isReady = true;

    this.slider = new Slider(
      [0, this.scenes.curr.children[0].children.length - 1],
      {
        remap: 0.0001,
      }
    );
  }

  resize({ target }) {
    this.vp.w = target.clientWidth;
    this.vp.h = target.clientHeight;

    this.renderer.setSize(this.vp.w, this.vp.h);

    this.camera.aspect = this.vp.aspect();
    this.camera.updateProjectionMatrix();

    this.post?.resize(this.vp);
    this.scenes.curr?.resize(this.vp);
  }

  render() {
    if (!this.shouldRender) return;

    this.time += 0.01;

    // console.log(this.nuxt.$scroll.lenis.scroll);

    this.controls?.update();
    this.slider?.update();

    if (this.scenes.curr && this.scenes.curr.shouldRender)
      this.scenes.currTx = this.scenes.curr.update(
        this.time,
        this.slider?.x || 0
      );

    if (this.scenes.next && this.scenes.next.shouldRender)
      this.scenes.nextTx = this.scenes.next.update(
        this.time,
        this.slider?.x || 0
      );

    if (this.post && this.post.isOn) {
      this.post.renderPasses(this.time, {
        rings: this.scenes.currTx,
        about: this.scenes.nextTx,
      });
      this.post.render();
    }
  }

  /** Events */
  onScroll(e) {
    // console.log(e);
  }

  castRay() {
    if (!this.raycaster._isReady) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects =
      this.raycaster.intersectObjects(this.raycaster._targets)[0] || null;

    if (intersects) {
      const { parent } = intersects.object;
      this.rayHover(parent.index);
      return parent.data;
    } else {
      this.rayHover();
      return null;
    }
  }

  rayHover(index = null) {
    if (index === this.a.hoverCurr) return;
    if (index !== null) {
      this.scenes.curr.rings.children[index].onHover(1);
    } else {
      this.scenes.curr.rings.children[this.a.hoverCurr]?.onHover(0);
    }

    this.a.hoverCurr = index;
  }

  initEvts() {
    // ...
  }

  onClick() {
    const target = this.castRay();

    if (target !== null) {
      this.nuxt.$router.push("/" + target.slug);
    }
  }

  onMouseMove(e) {
    if (!this.shouldRaycast) return;

    this.mouse.x = (e.clientX / this.vp.w) * 2 - 1;
    this.mouse.y = -(e.clientY / this.vp.h) * 2 + 1;

    this.castRay();

    this.slider?.onMouseMove(e);
  }

  onMouseDown(e) {
    this.slider?.onMouseDown(e);
  }

  onMouseUp(e) {
    this.slider?.onMouseUp(e);
  }

  /** Pages */
  pageHome() {
    console.log("home");
    this.shouldRaycast = true;

    if (this.isInit) {
      this.isInit = false;
      this.start(handleScenes("home"));
    } else {
      this.switchPage(0);
      this.slider.toPosition();

      // this.scene.rings.children.forEach((item, i) => {
      //   gsap.to(item.scale, {
      //     x: 1,
      //     y: 1,
      //     z: 1,
      //     duration: 1,
      //     ease: "expo.out",
      //     onStart: () => {
      //       item.visible = true;
      //     },
      //   });
      // });
    }
  }

  pageProduct(index) {
    this.shouldRaycast = false;

    if (this.isInit) {
      this.isInit = false;
      this.start(handleScenes("home"));
      // console.log("initialstat:product");
    } else {
      // console.log("transitionto:product");

      // !4.3 we scale everything and keep the selected one
      this.slider.toPosition(+index);

      // this.scene.rings.children.forEach((item, i) => {
      //   item.onHover();

      //   if (i !== +index) {
      //     gsap.to(item.scale, {
      //       x: 0,
      //       y: 0,
      //       z: 0,
      //       duration: 0.8,
      //       onComplete: () => {
      //         item.visible = false;
      //       },
      //     });
      //   } else {
      //     gsap.to(item.scale, {
      //       x: 2,
      //       y: 2,
      //       z: 2,
      //       duration: 1,
      //       ease: "back.out",
      //     });
      //   }
      // });
    }
  }

  pageAbout() {
    this.shouldRaycast = false;

    if (this.isInit) {
      this.isInit = false;
      // console.log("initialstate: about");
      this.start(handleScenes("about"));
    } else {
      this.switchPage(1);
      console.log("about");
    }
  }

  async switchPage(value) {
    // to about
    const curr = this.scenes.curr;
    this.scenes.curr = this.scenes.next;
    this.scenes.next = curr;
  }
}

/** Helpers */
function handleScenes(sceneName) {
  switch (sceneName) {
    case "home":
      return Scene;
      break;
    case "about":
      return AboutScene;
      break;
    // case "product": Post; break;
  }
}
