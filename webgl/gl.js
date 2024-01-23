import { WebGLRenderer, PerspectiveCamera, Raycaster } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { gsap } from "../utils/gsap";

import { Scene } from "./scene";
import { Post } from "./post";
import { Slider } from "./slider";

export class Gl {
  shouldRender = false;
  isInit = true;
  time = 0;
  // !3 create mouse propery
  mouse = { x: 0, y: 0 };
  // !4.1 create animation tracking object
  a = {
    hoverCurr: null,
  };
  // 4.3 add raycast state controller
  shouldRaycast = true;

  constructor({ $nuxt }) {
    this.nuxt = $nuxt;
  }

  start({ canvas, items }) {
    // this.items = items;

    this.setup(canvas);
    this.init(items);
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

    // !5.1 we attach cam and render to the vp and we pass it ot the scene
    this.vp.renderer = this.renderer;
    this.vp.camera = this.camera;

    this.scene = new Scene({ vp: this.vp });

    // this.setupControls(); // !1 temporarily enable controls
    this.setupPost(); // !5.1 enable post

    // !3.1 initialise raycaster
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
  async init(items) {
    // !1 pass items from init to scene load function
    this.assets = await this.scene.load({ items });
    this.nuxt.$bus.$emit("app:ready");

    this.shouldRender = true;

    // !3.1 set raycaster targets and make it active
    this.raycaster._targets = this.scene.children[0].children.map(
      (item) => item.target
    );
    this.raycaster._isReady = true;

    // !4.2 initialise slider
    this.slider = new Slider([0, this.scene.children[0].children.length - 1], {
      remap: 0.0001,
    });
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
    if (!this.shouldRender) return;

    this.time += 0.01;

    // console.log(this.nuxt.$scroll.lenis.scroll);

    this.controls?.update();
    this.slider?.update();
    // 4.2 pass slider X to scene

    // 5.1 get the rendered scene texture from the target and pass it to post
    this.ringScene = this.scene?.update(this.time, this.slider.x || 0);

    if (this.post && this.post.isOn) {
      this.post.renderPasses(this.time, { rings: this.ringScene });
      this.post.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /** Events */
  onScroll(e) {
    // console.log(e);
  }

  castRay() {
    if (!this.raycaster._isReady) return;

    // !3.1 cast ray function from mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects =
      this.raycaster.intersectObjects(this.raycaster._targets)[0] || null;

    if (intersects) {
      // !3.2 restructure intersects to get more data
      const { parent } = intersects.object;
      this.rayHover(parent.index); // !4.1 call
      return parent.data;
    } else {
      this.rayHover(); // !4.1 call as empty
      return null;
    }
  }

  rayHover(index = null) {
    // !4.1 hover function to change ring state
    if (index === this.a.hoverCurr) return;
    if (index !== null) {
      this.scene.rings.children[index].onHover(1);
    } else {
      this.scene.rings.children[this.a.hoverCurr]?.onHover(0);
    }

    this.a.hoverCurr = index;
  }

  initEvts() {
    // ...
  }

  onClick() {
    // !3.2 click event from homepage to navigate to page
    // we could alternatively emit an event back to the page using $bus
    // this also automatically unmounts so nice

    const target = this.castRay();

    if (target !== null) {
      this.nuxt.$router.push("/" + target.slug);
    }
  }

  onMouseMove(e) {
    if (!this.shouldRaycast) return;
    // !3.1 mousemove event for raycasting, coordinates need normalisation
    // comes from app.vue for consistency
    this.mouse.x = (e.clientX / this.vp.w) * 2 - 1;
    this.mouse.y = -(e.clientY / this.vp.h) * 2 + 1;

    this.castRay();

    // !4.2 mousemove event for slider
    this.slider?.onMouseMove(e);
  }

  // !4.2 mouse events for slider
  onMouseDown(e) {
    // console.log("mousedown");
    this.slider?.onMouseDown(e);
  }

  onMouseUp(e) {
    // console.log("mousedown");
    this.slider?.onMouseUp(e);
  }

  /** Pages */

  // !4.3 don't need this anymore
  // onPageChange(name) {
  //   if (this.isInit) {
  //     this.isInit = false;
  //     console.log("initialstate", name);
  //   } else {
  //     console.log("pagechange", name);
  //   }
  // }

  // !4.3 create page based functions
  pageHome() {
    this.shouldRaycast = true; // !4.3 control raycast

    if (this.isInit) {
      this.isInit = false;
      // console.log("initialstate: home");
    } else {
      this.slider.toPosition();

      this.scene.rings.children.forEach((item, i) => {
        gsap.to(item.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: "expo.out",
          onStart: () => {
            item.visible = true;
          },
        });
      });
    }
  }

  pageProduct(index) {
    this.shouldRaycast = false;

    if (this.isInit) {
      this.isInit = false;
      // console.log("initialstat:product");
    } else {
      // console.log("transitionto:product");

      // !4.3 we scale everything and keep the selected one
      this.slider.toPosition(+index);

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

  pageAbout() {
    this.shouldRaycast = false;

    if (this.isInit) {
      this.isInit = false;
      console.log("initialstate: about");
    } else {
      console.log("about");
    }
  }
}
