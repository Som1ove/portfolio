import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const ASSET_ROOT = `${import.meta.env.BASE_URL}assets`;
const MODEL_URL = `${ASSET_ROOT}/gameboy-1989/source/Sketchfab%20Game%20Boy.fbx`;
const TEXTURE_ROOT = `${ASSET_ROOT}/gameboy-1989/textures/`;
const HOME_ROTATION = { x: -0.15, y: 0.22 };
const SCREEN_SIZE = { width: 640, height: 420 };
const MODEL_FACE_ROTATION = { x: 0.06, y: -0.08, z: 0 };
const INSERTED_SHELL_COLORS = {
  yellow: 0xd49417,
  green: 0x18251f,
  gray: 0x8e8e88,
};
const INSERTED_MODEL_PARTS = new Set(['cartridge_low', 'chip_low']);
const DETACHED_MODEL_PARTS = new Set(['cartridge_low001', 'chip_low001']);

const SCREEN_THEMES = {
  idle: {
    bg: '#8dad48',
    dark: '#263411',
    mid: '#5e782f',
    light: '#c8d972',
    title: 'SOM1OVE OS',
    meta: 'NO CART',
    hint: 'DROP TO LOAD',
  },
  pokemon: {
    bg: '#d9e84a',
    dark: '#243414',
    mid: '#738f2f',
    light: '#fff06a',
    title: 'GAME DEV',
    meta: 'POKEMON LOADED',
    hint: 'PRESS START',
  },
  zelda: {
    bg: '#b5c56d',
    dark: '#213820',
    mid: '#6d8e3f',
    light: '#ffd51f',
    title: 'PHOTO',
    meta: 'ZELDA LOADED',
    hint: 'PRESS START',
  },
  kirby: {
    bg: '#ffc94a',
    dark: '#3c3415',
    mid: '#a7bf58',
    light: '#fff6c9',
    title: 'ILLUST',
    meta: 'KIRBY LOADED',
    hint: 'PRESS START',
  },
};

function pixelText(ctx, text, x, y, size, color, align = 'left') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.font = `900 ${size}px "Courier New", monospace`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawPixelBox(ctx, x, y, width, height, theme) {
  ctx.fillStyle = theme.light;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = theme.dark;
  ctx.fillRect(x, y, width, 8);
  ctx.fillRect(x, y, 8, height);
  ctx.fillRect(x, y + height - 8, width, 8);
  ctx.fillRect(x + width - 8, y, 8, height);
  ctx.fillStyle = theme.mid;
  ctx.fillRect(x + 18, y + 18, width - 36, height - 36);
}

function drawCartridgePreview(ctx, theme) {
  drawPixelBox(ctx, 70, 154, 138, 154, theme);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(92, 194, 94, 70);
  ctx.fillStyle = theme.dark;
  ctx.fillRect(92, 194, 94, 8);
  ctx.fillRect(92, 256, 94, 8);
  ctx.fillRect(102, 176, 74, 8);
  ctx.fillRect(122, 278, 34, 12);
}

function drawPokemonScreen(ctx, theme) {
  for (let x = 260; x < 590; x += 42) {
    for (let y = 140; y < 300; y += 34) {
      ctx.fillStyle = (x + y) % 3 === 0 ? theme.mid : '#b7cc42';
      ctx.fillRect(x, y, 24, 18);
    }
  }
  ctx.fillStyle = theme.dark;
  ctx.fillRect(282, 286, 250, 16);
  ctx.fillRect(438, 242, 76, 16);
  ctx.fillStyle = '#fff06a';
  ctx.fillRect(330, 238, 34, 34);
  ctx.fillStyle = theme.dark;
  ctx.fillRect(340, 248, 6, 6);
  ctx.fillRect(358, 248, 6, 6);
  ctx.fillRect(338, 266, 30, 8);
}

function drawZeldaScreen(ctx, theme) {
  ctx.fillStyle = theme.dark;
  ctx.fillRect(262, 132, 274, 180);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(278, 148, 242, 148);
  ctx.fillStyle = theme.mid;
  ctx.fillRect(296, 214, 86, 58);
  ctx.fillRect(402, 172, 86, 86);
  ctx.fillStyle = theme.light;
  ctx.fillRect(308, 164, 46, 14);
  ctx.fillRect(472, 268, 30, 12);
  ctx.strokeStyle = theme.dark;
  ctx.lineWidth = 8;
  ctx.strokeRect(304, 170, 188, 92);
}

function drawKirbyScreen(ctx, theme) {
  ctx.fillStyle = theme.mid;
  ctx.fillRect(250, 244, 310, 40);
  ctx.fillStyle = theme.light;
  ctx.fillRect(318, 156, 128, 118);
  ctx.fillStyle = theme.dark;
  ctx.fillRect(344, 190, 14, 24);
  ctx.fillRect(406, 190, 14, 24);
  ctx.fillRect(362, 232, 42, 10);
  ctx.fillStyle = '#f0a800';
  ctx.fillRect(286, 184, 44, 28);
  ctx.fillRect(438, 144, 64, 34);
}

function drawScreenTexture(canvas, cartridge, bootProgress = 1) {
  const ctx = canvas.getContext('2d');
  const id = cartridge?.id ?? 'idle';
  const theme = SCREEN_THEMES[id] ?? SCREEN_THEMES.idle;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
  for (let y = 0; y < canvas.height; y += 14) {
    ctx.fillRect(0, y, canvas.width, 3);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(34, 28, 190, 8);
  ctx.fillRect(34, 42, 120, 8);

  if (!cartridge) {
    pixelText(ctx, 'INSERT', 320, 146, 54, theme.dark, 'center');
    pixelText(ctx, 'CARTRIDGE', 320, 208, 25, theme.dark, 'center');
    pixelText(ctx, 'SOM1OVE PORTFOLIO', 320, 284, 20, theme.dark, 'center');
  } else if (id === 'pokemon') {
    pixelText(ctx, theme.meta, 40, 48, 25, theme.dark);
    pixelText(ctx, theme.title, 40, 82, 58, theme.dark);
    drawPokemonScreen(ctx, theme);
  } else if (id === 'zelda') {
    pixelText(ctx, theme.meta, 40, 48, 25, theme.dark);
    pixelText(ctx, theme.title, 40, 82, 58, theme.dark);
    drawZeldaScreen(ctx, theme);
  } else if (id === 'kirby') {
    pixelText(ctx, theme.meta, 40, 48, 25, theme.dark);
    pixelText(ctx, theme.title, 40, 82, 58, theme.dark);
    drawKirbyScreen(ctx, theme);
  }

  ctx.fillStyle = theme.dark;
  ctx.fillRect(40, 340, 560, 8);
  pixelText(ctx, theme.hint, 320, 356, 27, theme.dark, 'center');
  pixelText(ctx, 'S1', 584, 32, 24, theme.dark);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  gradient.addColorStop(0.28, 'rgba(255, 255, 255, 0.04)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (bootProgress < 1) {
    const flash = 1 - bootProgress;
    ctx.fillStyle = `rgba(255, 246, 201, ${flash * 0.72})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.dark;

    for (let y = 0; y < canvas.height; y += 42) {
      ctx.fillRect(0, y + bootProgress * 28, canvas.width, 10);
    }

    pixelText(ctx, 'LOADING', 320, 188, 38, theme.dark, 'center');
  }
}

function remapScreenUvs(geometry) {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const position = geometry.attributes.position;
  const uv = [];
  const width = max.x - min.x || 1;
  const height = max.y - min.y || 1;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    uv.push((x - min.x) / width, (y - min.y) / height);
  }

  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.attributes.uv.needsUpdate = true;
}

export default function GameBoyConsole({ dropRef, isArmed = false, cartridge = null }) {
  const canvasRef = useRef(null);
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const activeCartridgeRef = useRef(cartridge);
  const screenCanvasRef = useRef(null);
  const screenTextureRef = useRef(null);
  const screenAnimationFrameRef = useRef(null);
  const insertedSlotMaterialRef = useRef(null);
  const insertedModelPartsRef = useRef([]);
  const originRef = useRef({ x: 0, y: 0, rotateX: HOME_ROTATION.x, rotateY: HOME_ROTATION.y });
  const targetRotationRef = useRef({ ...HOME_ROTATION });
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    activeCartridgeRef.current = cartridge;

    if (insertedSlotMaterialRef.current) {
      insertedSlotMaterialRef.current.color.setHex(INSERTED_SHELL_COLORS[cartridge?.shell] ?? 0x161616);
    }
  }, [cartridge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mount = mountRef.current;
    if (!canvas || !mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.55, 6.15);

    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (error) {
      console.warn('WebGL is unavailable; using the lightweight Game Boy fallback.', error);
      mount.classList.add('is-fallback');
      return () => mount.classList.remove('is-fallback');
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const group = new THREE.Group();
    group.rotation.set(HOME_ROTATION.x, HOME_ROTATION.y, 0);
    groupRef.current = group;
    scene.add(group);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = SCREEN_SIZE.width;
    screenCanvas.height = SCREEN_SIZE.height;
    drawScreenTexture(screenCanvas, cartridge);
    screenCanvasRef.current = screenCanvas;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.NearestFilter;
    screenTexture.magFilter = THREE.NearestFilter;
    screenTexture.needsUpdate = true;
    screenTextureRef.current = screenTexture;

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });

    scene.add(new THREE.HemisphereLight(0xfff3b0, 0x22110b, 2.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.6);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd51f, 2.1);
    rimLight.position.set(-4, 1.8, 2);
    scene.add(rimLight);

    const textureLoader = new THREE.TextureLoader();
    const useFallback = (error) => {
      console.warn('Game Boy assets failed to load; using the lightweight fallback.', error);
      mount.classList.add('is-fallback');
    };
    const loadColorTexture = (fileName) => {
      const texture = textureLoader.load(`${TEXTURE_ROOT}${fileName}`, undefined, undefined, useFallback);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
      return texture;
    };

    const mainAlbedo = loadColorTexture('main.webp');
    const externalAlbedo = loadColorTexture('external.webp');

    const mainMaterial = new THREE.MeshStandardMaterial({
      map: mainAlbedo,
      roughness: 0.82,
      metalness: 0.08,
    });

    const externalMaterial = new THREE.MeshStandardMaterial({
      map: externalAlbedo,
      roughness: 0.78,
      metalness: 0.08,
    });

    const insertedShellMaterial = new THREE.MeshStandardMaterial({
      color: INSERTED_SHELL_COLORS[cartridge?.shell] ?? 0x242424,
      roughness: 0.86,
      metalness: 0.04,
      transparent: true,
      opacity: cartridge ? 1 : 0,
    });
    insertedSlotMaterialRef.current = insertedShellMaterial;

    const insertedChipMaterial = new THREE.MeshStandardMaterial({
      color: 0x151515,
      roughness: 0.9,
      metalness: 0.02,
      transparent: true,
      opacity: cartridge ? 1 : 0,
    });

    const loader = new FBXLoader();
    loader.load(MODEL_URL, (model) => {
      insertedModelPartsRef.current = [];

      model.traverse((child) => {
        if (child.isMesh) {
          const materialName = Array.isArray(child.material)
            ? child.material[0]?.name
            : child.material?.name;

          if (child.name === 'screen_low') {
            remapScreenUvs(child.geometry);
            child.material = screenMaterial;
            child.renderOrder = 12;
          } else if (INSERTED_MODEL_PARTS.has(child.name)) {
            child.material = child.name === 'chip_low' ? insertedChipMaterial : insertedShellMaterial;
            child.visible = Boolean(activeCartridgeRef.current);
            insertedModelPartsRef.current.push(child);
          } else if (DETACHED_MODEL_PARTS.has(child.name)) {
            child.visible = false;
          } else if (materialName === 'Main') {
            child.material = mainMaterial;
          } else {
            child.material = externalMaterial;
          }

          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const scale = 3.52 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      model.rotation.set(MODEL_FACE_ROTATION.x, MODEL_FACE_ROTATION.y, MODEL_FACE_ROTATION.z);

      group.add(model);
    }, undefined, useFallback);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height || 1;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);

      if (groupRef.current && !reduceMotion) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          targetRotationRef.current.x,
          0.1,
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotationRef.current.y,
          0.1,
        );
      }

      if (insertedSlotMaterialRef.current) {
        const targetOpacity = activeCartridgeRef.current ? 1 : 0;
        insertedSlotMaterialRef.current.opacity = THREE.MathUtils.lerp(
          insertedSlotMaterialRef.current.opacity,
          targetOpacity,
          reduceMotion ? 1 : 0.18,
        );
      }

      insertedModelPartsRef.current.forEach((mesh) => {
        mesh.visible = Boolean(activeCartridgeRef.current);

        if (mesh.material?.opacity !== undefined) {
          mesh.material.opacity = insertedSlotMaterialRef.current?.opacity ?? 1;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mainMaterial.dispose();
      externalMaterial.dispose();
      insertedShellMaterial.dispose();
      insertedChipMaterial.dispose();
      [
        mainAlbedo,
        externalAlbedo,
      ].forEach((texture) => texture.dispose());
      if (screenAnimationFrameRef.current) {
        window.cancelAnimationFrame(screenAnimationFrameRef.current);
      }
      screenMaterial.dispose();
      screenTexture.dispose();
      renderer.dispose();
      group.clear();
      mount.classList.remove('is-fallback');
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!screenCanvasRef.current || !screenTextureRef.current) return;

    if (screenAnimationFrameRef.current) {
      window.cancelAnimationFrame(screenAnimationFrameRef.current);
    }

    if (reduceMotion) {
      drawScreenTexture(screenCanvasRef.current, cartridge);
      screenTextureRef.current.needsUpdate = true;
      return undefined;
    }

    const startTime = window.performance.now();
    const duration = 420;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      drawScreenTexture(screenCanvasRef.current, cartridge, progress);
      screenTextureRef.current.needsUpdate = true;

      if (progress < 1) {
        screenAnimationFrameRef.current = window.requestAnimationFrame(tick);
      }
    };

    screenAnimationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (screenAnimationFrameRef.current) {
        window.cancelAnimationFrame(screenAnimationFrameRef.current);
      }
    };
  }, [cartridge, reduceMotion]);

  const startRotation = (event) => {
    if (reduceMotion) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    originRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: targetRotationRef.current.x,
      rotateY: targetRotationRef.current.y,
    };
    setDragging(true);
  };

  const moveRotation = (event) => {
    if (!dragging || reduceMotion) return;

    const dx = event.clientX - originRef.current.x;
    const dy = event.clientY - originRef.current.y;

    targetRotationRef.current = {
      x: Math.max(-0.95, Math.min(0.75, originRef.current.rotateX - dy * 0.004)),
      y: Math.max(-3.35, Math.min(3.35, originRef.current.rotateY + dx * 0.006)),
    };
  };

  const stopRotation = (event) => {
    if (!reduceMotion) {
      targetRotationRef.current = { ...HOME_ROTATION };
    }

    if (event?.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragging(false);
  };

  return (
    <motion.div
      className="console-stage model-console-stage"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`gameboy-model${isArmed ? ' is-armed' : ''}`}
        role="img"
        aria-label="Rotatable classic Game Boy 3D model"
        tabIndex={0}
        onPointerDown={startRotation}
        onPointerMove={moveRotation}
        onPointerUp={stopRotation}
        onPointerCancel={stopRotation}
        ref={mountRef}
      >
        <div className="drop-target" ref={dropRef}>
          DROP CART
        </div>
        <div className="gameboy-fallback" aria-hidden="true">
          <div className="gameboy-fallback-screen">
            <span>SOM1OVE</span>
            <strong>GAME WORLD</strong>
          </div>
          <div className="gameboy-fallback-controls">
            <span>+</span>
            <span>A&nbsp;&nbsp;B</span>
          </div>
          <small>LIGHTWEIGHT MODE</small>
        </div>
        <canvas ref={canvasRef} />
      </div>
    </motion.div>
  );
}
