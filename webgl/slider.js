import { gsap } from "../utils/gsap";

function lerp(a, b, alpha) {
  return a + alpha * (b - a);
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// !4.2 add slider class
export class Slider {
  startx = 0;
  x = 0;
  speed = 0;
  round = 0;

  isSliding = false;
  isLocked = false;

  constructor(size, { remap } = { remap: 0.0001 }) {
    this.size = size;
    this.remap = remap;
  }

  onMouseMove(e) {
    if (!this.isSliding) return;
    this.speed += (e.clientX - this.startx) * -this.remap;
  }

  onMouseDown(e) {
    if (this.isLocked) return;
    this.isSliding = true;
    this.startx = e.clientX;
  }

  onMouseUp(e) {
    this.isSliding = false;
  }

  update() {
    if (this.isLocked) return;
    this.x += this.speed;
    this.speed *= 0.85;

    this.round = Math.round(this.x);
    if (this.round < this.size[0]) this.round = 0;
    if (this.round > this.size[1]) this.round = this.size[1];
    const diff = this.round - this.x;

    this.x += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015;
  }

  /** Helpers */

  toPosition(val = null) {
    // console.log(val);

    if (val !== null) {
      this.isLocked = true;

      gsap.to(this, {
        x: val,
        duration: 1.2,
      });
    } else {
      this.isLocked = false;
    }
  }
}
