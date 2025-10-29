import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import load_mujoco from '../dist/mujoco_wasm.js';
import { loadSceneFromURL } from './mujocoUtils.js';

const mujocoXML = "./environment/coop-openended-v2.xml"; // path to your XML

async function init() {
    // Load MuJoCo WASM
    const mujoco = await load_mujoco();

    // Set up virtual filesystem and mount XML
    mujoco.FS.mkdir('/working');
    mujoco.FS.mount(mujoco.MEMFS, { root: '.' }, '/working');
    mujoco.FS.writeFile("/working/coop-openended-v2.xml", await (await fetch(mujocoXML)).text());

    // Load scene from XML
    const [model, state, simulation, bodies, lights] = await loadSceneFromURL(mujoco, "coop-openended-v2.xml");

    // --- Three.js setup ---
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 100);
    camera.position.set(2.0, 1.7, 1.7);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.7, 0);
    controls.update();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Update all body positions from MuJoCo simulation
        for (let b = 0; b < model.nbody; b++) {
            if (bodies[b]) {
                const pos = new THREE.Vector3();
                const quat = new THREE.Quaternion();
                mujocoUtils.getPosition(simulation.xpos, b, pos);
                mujocoUtils.getQuaternion(simulation.xquat, b, quat);
                bodies[b].position.copy(pos);
                bodies[b].quaternion.copy(quat);
                bodies[b].updateWorldMatrix();
            }
        }

        // Render
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();
