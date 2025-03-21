import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Lenis from "lenis";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);

function basicAnimate() {
  renderer.render(scene, camera);
  requestAnimationFrame(basicAnimate);
}
basicAnimate();

let model;

const loader = new GLTFLoader();
loader.load("./models/black_chair.glb", (gltf) => {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        node.material.metalness = 2;
        node.material.roughness = 3;
        node.material.envMapIntensity = 5;
      }
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(model);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 1.75;
  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();
  cancelAnimationFrame(basicAnimate);
  animate();
});

const floatAmplitude = 0.2;
const floatSpeed = 1.5;
// const rotationSpeed = 0.3;
let isFloating = true;
let currentScroll = 0;

const totalScrollHeight =
  document.documentElement.scrollHeight - window.innerHeight;

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
    });
  }
}

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

function animate() {
  if (model) {
    if (isFloating) {
      const floatOffset =
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = floatOffset;
    }
    const scrollPosition = Math.min(currentScroll / totalScrollHeight, 1);
    const baseTilt = 0.5;
    model.rotation.x = scrollPosition * Math.PI * 4 + baseTilt;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const heroSecction = document.querySelector(".hero");
const archiveSection = document.querySelector(".archive");
const outroSection = document.querySelector(".outro");

const splitTextHero= new SplitType(".hero h1",{
    types:"lines",
    lineClass:"line"
})
splitTextHero.lines.forEach((line)=>{
    const text= line.innerHTML;
    line.innerHTML = `<span style="display:block; transform:translateY(150px);">${text}</span>`;
})
gsap.to(".hero h1 .line span", {
    translateY: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power3.inOut",
    force3D: true,
  });

const spliText = new SplitType(".outro-para h2", {
  types: "lines",
  lineClass: "line",
});

spliText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style="display:block; transform:translateY(200px);">${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".outro",
  start: "top center",
  onEnter: () => {
    gsap.to(".outro h2 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.inOut",
      force3D: true,
    });
  },
  onLeaveBack: () => {
    gsap.to(".outro h2 .line span", {
      translateY: 70,
      duration: 1,
      stagger: 0.1,
      ease: "power3.inOut",
      force3D: true,
    });
  },
  toggleActions: "play reverse play reverse",
});
