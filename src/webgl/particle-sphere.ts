import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

const placeSphere = (points: Points): void => {
  if (window.innerWidth > 1024) points.position.set(80, 0, 0);
  else points.position.set(0, -50, 0);
};

const createSphere = (count: number): Points => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warm = new Color('#f97316');
  const cool = new Color('#5b21b6');
  const mixed = new Color();

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 100 + Math.random() * 10;
    const y = radius * Math.sin(phi) * Math.sin(theta);
    positions.set([radius * Math.sin(phi) * Math.cos(theta), y, radius * Math.cos(phi)], i * 3);
    mixed.copy(warm).lerp(cool, (y + 100) / 200);
    colors.set([mixed.r, mixed.g, mixed.b], i * 3);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  return new Points(
    geometry,
    new PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: AdditiveBlending,
    }),
  );
};

/** Renders the background particle sphere. Returns false when WebGL is unavailable. */
export const startParticleSphere = (canvas: HTMLCanvasElement, animate: boolean): boolean => {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
  } catch {
    canvas.remove();
    return false;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 200;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const sphere = createSphere(window.innerWidth < 768 ? 400 : 1000);
  placeSphere(sphere);
  scene.add(sphere);

  const pointer = { x: 0, y: 0 };
  let spinX = 0;
  let spinY = 0;
  let frame = 0;

  const render = (): void => {
    renderer.render(scene, camera);
  };

  const tick = (): void => {
    frame = window.requestAnimationFrame(tick);
    spinY += 0.002;
    spinX += 0.001;
    sphere.rotation.y += (spinY + pointer.x * 0.5 - sphere.rotation.y) * 0.05;
    sphere.rotation.x += (spinX + pointer.y * 0.5 - sphere.rotation.x) * 0.05;
    camera.position.x += (pointer.x * 20 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 20 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    render();
  };

  window.addEventListener(
    'resize',
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      placeSphere(sphere);
      if (!animate) render();
    },
    { passive: true },
  );

  if (!animate) {
    render();
    return true;
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      tick();
    }
  });
  tick();
  return true;
};
