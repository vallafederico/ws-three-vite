import { WebGLRenderer, PerspectiveCamera } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { gsap } from "../utils/gsap";

import { Scene } from "./scene";
import { Post } from "./post";

export class Gl {
  shouldRender = false;
  isInit = true;
  time = 0;
  constructor({ $nuxt }) {
    this.nuxt = $nuxt;
  }

  start({ canvas, items }) {
    this.items = items;
    // console.log("items", items);
    // window.app = this;
    this.setup(canvas);
    this.init();
    this.initEvts();
  }

  setup(canvas) {
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
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(this.vp.dpr());
    this.renderer.setSize(this.vp.w, this.vp.h);
    this.renderer.setClearColor(0x000000, 1);
    canvas.appendChild(this.renderer.domElement);

    // camera
    this.camera = new PerspectiveCamera(
      70, // fov
      this.vp.aspect(), // aspect
      0.1, // near
      1000 // far
    );
    this.camera.position.set(0, 0, 2);

    this.scene = new Scene();

    // this.setupControls(); // uncomment to be able to move around
    this.setupPost(); // uncomment to enable post processing
  }

  setupControls() {
    // watch out can introduct weird behaviour in the DOM
    // use it to debug only

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
    this.assets = await this.scene.load();
    this.nuxt.$bus.$emit("app:ready");
    // console.log("ASSETS:", this.assets);

    this.shouldRender = true;

    // called by the plugin directly
    // this.render();
  }

  resize({ target }) {
    this.vp.w = target.clientWidth;
    this.vp.h = target.clientHeight;

    this.renderer.setSize(this.vp.w, this.vp.h);

    this.camera.aspect = this.vp.aspect();
    this.camera.updateProjectionMatrix();

    this.scene?.resize(this.vp);
  }

  render() {
    // this if we didn't use the gsap ticker
    // requestAnimationFrame(this.render.bind(this));
    if (!this.shouldRender) return;

    this.time += 0.01;

    // console.log(this.nuxt.$scroll.lenis.scroll);

    this.controls?.update();
    this.scene?.update(this.time);

    if (this.post && this.post.isOn) {
      this.post.renderPasses(this.time);
      this.post.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /** Events */
  onScroll(e) {
    // console.log(e);
  }

  initEvts() {
    // ...
  }

  onClick() {
    console.log("evt:click");
  }

  onPageChange(name) {
    if (this.isInit) {
      this.isInit = false;
      console.log("initialstate", name);
    } else {
      console.log("pagechange", name);
    }
  }
}
