import * as THREE from "three";

/**
 * A 3D Mumbai local (ICF EMU, Central Railway livery) that drives out of a
 * photo. The photo is treated as a window at z = 0:
 *  - the part of the train behind the window (z < 0) is drawn only inside the
 *    photo's frame, using a stencil mask;
 *  - the part in front of it (z > 0) is drawn everywhere, so the cab breaks out
 *    of the frame and over the page.
 * Loaded on demand (with three.js) by TrainPortal.tsx.
 */

const C = {
  white: "#EEF0F2",
  whiteShade: "#D6DADF",
  purple: "#7C2C9E",
  purpleDark: "#5E1F7A",
  yellow: "#F2C300",
  yellowDark: "#C99E00",
  glass: "#1E2833",
  interior: "#161C26",
  frame: "#9AA0A8",
  roof: "#C3C8CF",
  under: "#26211F",
  red: "#D62828",
};

const CAR_L = 7;
const CAR_H = 1.55;
const CAR_W = 1.3;
const BODY_Y = 0.42; // underside of the body above rail top
const WHEEL_R = 0.22;
const CARS = 3;
const GAP = 0.14;

type Tex = THREE.CanvasTexture;

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, flip = false): Tex {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  if (flip) {
    g.translate(w, 0);
    g.scale(-1, 1);
  }
  draw(g);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/** Car side: white body, purple lower band, purple-framed open doorways, barred windows. */
function drawSide(cab: boolean) {
  return (g: CanvasRenderingContext2D) => {
    const W = 1400;
    const H = 310;
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#F7F8F9");
    grad.addColorStop(1, C.white);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.fillStyle = C.whiteShade;
    g.fillRect(0, 0, W, 14);

    // Purple lower band and white sill
    g.fillStyle = C.purple;
    g.fillRect(0, H * 0.7, W, H * 0.15);
    g.fillStyle = C.purpleDark;
    g.fillRect(0, H * 0.85, W, 3);

    // Barred windows (louvres) between doorways
    const windows = [190, 300, 520, 630, 860, 970, 1190];
    for (const x of windows) {
      roundRect(g, x, 52, 80, 112, 10);
      g.fillStyle = C.glass;
      g.fill();
      g.lineWidth = 6;
      g.strokeStyle = C.frame;
      g.stroke();
      g.strokeStyle = "#7F868F";
      g.lineWidth = 4;
      for (let y = 68; y < 160; y += 14) {
        g.beginPath();
        g.moveTo(x + 4, y);
        g.lineTo(x + 76, y);
        g.stroke();
      }
    }

    // Open doorways with purple frames, seats and a grab pole
    for (const x of [80, 400, 740, 1070]) {
      if (cab && x === 1070) continue;
      g.fillStyle = C.purple;
      g.fillRect(x - 10, 26, 110, H - 26);
      g.fillStyle = C.interior;
      g.fillRect(x, 34, 90, H - 34);
      g.fillStyle = "#2F5DA8";
      g.fillRect(x + 8, 170, 30, 50);
      g.fillRect(x + 52, 170, 30, 50);
      g.fillStyle = "#AEB4BB";
      g.fillRect(x + 43, 38, 5, H - 50);
    }

    // Lettering on the band
    g.fillStyle = "#FFFFFF";
    g.font = "bold 46px Arial, Helvetica, sans-serif";
    g.fillText("CR", 225, H * 0.82);
    g.fillText("CR", 895, H * 0.82);
    g.fillStyle = "#6E7781";
    g.font = "bold 22px Arial, Helvetica, sans-serif";
    g.fillText("III", 560, 40);

    if (cab) {
      // The yellow cab wraps round to the side at the front end.
      g.fillStyle = C.yellow;
      g.fillRect(W - 150, 0, 150, H);
      g.fillStyle = C.yellowDark;
      g.fillRect(W - 150, 0, 4, H);
      roundRect(g, W - 118, 48, 74, 104, 10);
      g.fillStyle = C.glass;
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = "#3A3A3A";
      g.stroke();
      g.fillStyle = C.purple;
      g.fillRect(W - 150, H * 0.7, 150, H * 0.15);
    }
    g.fillStyle = "#3B3F45";
    g.fillRect(0, H - 6, W, 6);
  };
}

/** Driving-cab front, after the ICF EMU in the photo. */
function drawFront(g: CanvasRenderingContext2D) {
  const W = 520;
  const H = 620;
  const grad = g.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#E9B900");
  grad.addColorStop(0.5, C.yellow);
  grad.addColorStop(1, "#E3B400");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // Destination board and roof lamp
  roundRect(g, 170, 22, 180, 34, 6);
  g.fillStyle = "#1A1A1A";
  g.fill();
  g.fillStyle = "#FFB000";
  g.font = "bold 20px monospace";
  g.fillText("CSMT  FAST", 196, 46);

  // Windscreens
  for (const x of [34, 276]) {
    roundRect(g, x, 76, 210, 190, 22);
    g.fillStyle = C.glass;
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = "#2B2B2B";
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.18)";
    g.lineWidth = 14;
    g.beginPath();
    g.moveTo(x + 40, 240);
    g.lineTo(x + 110, 100);
    g.stroke();
  }
  // Wipers
  g.strokeStyle = "#111";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(140, 262);
  g.lineTo(190, 120);
  g.moveTo(382, 262);
  g.lineTo(430, 120);
  g.stroke();

  // Unit number, IR emblem, ICF
  g.fillStyle = "#3A2A1A";
  g.font = "bold 30px Arial, sans-serif";
  g.fillText("5417", 400, 62);
  g.strokeStyle = C.red;
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(232, 300);
  g.lineTo(288, 300);
  g.moveTo(260, 282);
  g.lineTo(260, 340);
  g.moveTo(236, 336);
  g.lineTo(284, 306);
  g.stroke();
  g.fillStyle = C.purple;
  g.font = "bold 64px Arial, sans-serif";
  g.fillText("ICF", 330, 345);

  // Black band with oval headlight pods
  g.fillStyle = "#151515";
  g.fillRect(0, 372, W, 92);
  for (const cx of [110, 410]) {
    g.beginPath();
    g.ellipse(cx, 418, 66, 34, 0, 0, Math.PI * 2);
    g.fillStyle = "#3A3D42";
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = "#9EA4AC";
    g.stroke();
    for (const dx of [-26, 26]) {
      g.beginPath();
      g.ellipse(cx + dx, 418, 20, 22, 0, 0, Math.PI * 2);
      g.fillStyle = "#FFF6C8";
      g.fill();
    }
  }

  // Lower front: marker plates (red dots / red X) on white
  g.fillStyle = "#E6E8EA";
  g.fillRect(0, 464, W, 100);
  g.fillStyle = "#FFFFFF";
  g.fillRect(70, 478, 70, 70);
  g.fillStyle = C.red;
  for (const [x, y] of [
    [88, 496],
    [122, 496],
    [88, 530],
    [122, 530],
  ]) {
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#FFFFFF";
  g.fillRect(380, 478, 70, 70);
  g.strokeStyle = C.red;
  g.lineWidth = 12;
  g.beginPath();
  g.moveTo(392, 490);
  g.lineTo(438, 536);
  g.moveTo(438, 490);
  g.lineTo(392, 536);
  g.stroke();
  g.fillStyle = C.purple;
  g.fillRect(0, 564, W, 56);
}

function drawRoof(g: CanvasRenderingContext2D) {
  g.fillStyle = C.roof;
  g.fillRect(0, 0, 1024, 128);
  g.strokeStyle = "rgba(255,255,255,0.55)";
  g.lineWidth = 3;
  for (let y = 12; y < 128; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
}

type Built = { group: THREE.Group; wheels: THREE.Object3D[]; disposables: { dispose(): void }[] };

function buildTrain(): Built {
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);
  const std = (p: THREE.MeshStandardMaterialParameters) =>
    keep(new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.08, ...p }));

  const sideA = keep(canvasTexture(1400, 310, drawSide(false)));
  const sideB = keep(canvasTexture(1400, 310, drawSide(false), true));
  const cabA = keep(canvasTexture(1400, 310, drawSide(true)));
  const cabB = keep(canvasTexture(1400, 310, drawSide(true), true));
  const front = keep(canvasTexture(520, 620, drawFront));
  const roofTex = keep(canvasTexture(1024, 128, drawRoof));

  const mEndGrey = std({ color: "#5E636A" });
  const mRoof = std({ map: roofTex, metalness: 0.35, roughness: 0.45 });
  const mUnder = std({ color: C.under, roughness: 0.8 });
  const mFront = std({ map: front, roughness: 0.4 });
  const mSideA = std({ map: sideA });
  const mSideB = std({ map: sideB });
  const mCabA = std({ map: cabA });
  const mCabB = std({ map: cabB });
  const mRoofBox = std({ color: "#A3A7AE", metalness: 0.3 });
  const mWheel = std({ color: "#2A2826", metalness: 0.5, roughness: 0.5 });
  const mRim = std({ color: "#8A8680", metalness: 0.6, roughness: 0.4 });
  const mPanto = std({ color: C.red, roughness: 0.5 });
  const mDark = std({ color: "#1B1B1B", roughness: 0.7 });

  const bodyGeo = keep(new THREE.BoxGeometry(CAR_L, CAR_H, CAR_W));
  const roofGeo = keep(new THREE.BoxGeometry(CAR_L - 0.05, 0.16, CAR_W - 0.06));
  const roofBoxGeo = keep(new THREE.BoxGeometry(1.4, 0.18, 0.75));
  const underGeo = keep(new THREE.BoxGeometry(CAR_L - 0.4, 0.2, CAR_W - 0.2));
  const equipGeo = keep(new THREE.BoxGeometry(1.2, 0.22, CAR_W - 0.35));
  const bogieGeo = keep(new THREE.BoxGeometry(1.6, 0.16, CAR_W - 0.1));
  const wheelGeo = keep(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.08, 20));
  const hubGeo = keep(new THREE.CylinderGeometry(WHEEL_R * 0.45, WHEEL_R * 0.45, 0.09, 12));
  const bar = keep(new THREE.CylinderGeometry(0.025, 0.025, 1, 6));
  const gangGeo = keep(new THREE.BoxGeometry(GAP + 0.02, CAR_H - 0.3, CAR_W - 0.3));
  const cowGeo = keep(new THREE.BoxGeometry(0.35, 0.3, CAR_W - 0.15));
  const couplerGeo = keep(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 8));

  const group = new THREE.Group();
  const wheels: THREE.Object3D[] = [];

  for (let i = 0; i < CARS; i++) {
    const cab = i === 0;
    const car = new THREE.Group();
    car.position.x = -(CAR_L / 2) - i * (CAR_L + GAP);

    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    const body = new THREE.Mesh(bodyGeo, [
      cab ? mFront : mEndGrey,
      mEndGrey,
      mRoof,
      mUnder,
      cab ? mCabA : mSideA,
      cab ? mCabB : mSideB,
    ]);
    body.position.y = BODY_Y + CAR_H / 2;
    car.add(body);

    const roof = new THREE.Mesh(roofGeo, mRoof);
    roof.position.y = BODY_Y + CAR_H + 0.08;
    car.add(roof);
    for (const x of [-2.2, 2.2]) {
      const rb = new THREE.Mesh(roofBoxGeo, mRoofBox);
      rb.position.set(x, BODY_Y + CAR_H + 0.25, 0);
      car.add(rb);
    }

    if (i === 1) {
      // Pantograph: a red diamond frame with a contact bar
      const top = BODY_Y + CAR_H + 0.16;
      const panto = new THREE.Group();
      const strut = (x1: number, y1: number, x2: number, y2: number) => {
        const len = Math.hypot(x2 - x1, y2 - y1);
        const m = new THREE.Mesh(bar, mPanto);
        m.scale.y = len;
        m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
        m.rotation.z = Math.atan2(x1 - x2, y2 - y1);
        return m;
      };
      for (const z of [-0.3, 0.3]) {
        const side = new THREE.Group();
        side.position.z = z;
        side.add(strut(-0.5, 0, 0, 0.55), strut(0, 0.55, 0.5, 0), strut(0, 0.55, -0.15, 0.85));
        panto.add(side);
      }
      const head = new THREE.Mesh(bar, mPanto);
      head.scale.y = 1.1;
      head.rotation.x = Math.PI / 2;
      head.position.set(-0.15, 0.86, 0);
      panto.add(head);
      panto.position.set(0, top, 0);
      car.add(panto);
    }

    const under = new THREE.Mesh(underGeo, mUnder);
    under.position.y = BODY_Y - 0.08;
    car.add(under);
    for (const x of [-0.9, 0.9]) {
      const eq = new THREE.Mesh(equipGeo, mUnder);
      eq.position.set(x, BODY_Y - 0.22, 0);
      car.add(eq);
    }

    for (const bx of [-CAR_L / 2 + 1.2, CAR_L / 2 - 1.2]) {
      const bogie = new THREE.Mesh(bogieGeo, mDark);
      bogie.position.set(bx, WHEEL_R + 0.06, 0);
      car.add(bogie);
      for (const ax of [-0.5, 0.5]) {
        for (const z of [-(CAR_W / 2 - 0.08), CAR_W / 2 - 0.08]) {
          const pivot = new THREE.Group();
          pivot.position.set(bx + ax, WHEEL_R, z);
          const w = new THREE.Mesh(wheelGeo, mWheel);
          w.rotation.x = Math.PI / 2;
          const hub = new THREE.Mesh(hubGeo, mRim);
          hub.rotation.x = Math.PI / 2;
          const spoke = new THREE.Mesh(bar, mRim);
          spoke.scale.y = WHEEL_R * 1.8;
          spoke.position.z = z > 0 ? 0.05 : -0.05;
          pivot.add(w, hub, spoke);
          car.add(pivot);
          wheels.push(pivot);
        }
      }
    }

    if (cab) {
      const cow = new THREE.Mesh(cowGeo, mDark);
      cow.position.set(CAR_L / 2 - 0.05, BODY_Y - 0.12, 0);
      car.add(cow);
      const coupler = new THREE.Mesh(couplerGeo, mDark);
      coupler.rotation.z = Math.PI / 2;
      coupler.position.set(CAR_L / 2 + 0.15, BODY_Y + 0.05, 0);
      car.add(coupler);
    } else {
      const gang = new THREE.Mesh(gangGeo, mDark);
      gang.position.set(CAR_L / 2 + GAP / 2, BODY_Y + CAR_H / 2, 0);
      car.add(gang);
    }
    group.add(car);
  }
  return { group, wheels, disposables };
}

export type TrainPortal = {
  /** 0 = deep inside the photo, 1 = cab fully out of the frame. */
  setProgress(t: number): void;
  /** Canvas size and the photo's rectangle within it, in CSS pixels. */
  resize(width: number, height: number, portal: { x: number; y: number; w: number; h: number }): void;
  dispose(): void;
};

export function createTrainPortal(canvas: HTMLCanvasElement): TrainPortal | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, stencil: true, powerPreference: "low-power" });
  } catch {
    return null; // No WebGL: the photo stays as it is.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
  const DIST = 20;
  camera.position.set(0, 0, DIST);
  camera.lookAt(0, 0, 0);

  // Soft daylight; the key light comes from the front-left so the visible
  // side of the train reads white, not grey.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8a74, 1.4));
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-7, 8, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff1d6, 0.9);
  rim.position.set(9, 6, 8);
  scene.add(rim);

  // Portal mask: writes 1 into the stencil buffer where the photo is.
  const maskGeo = new THREE.PlaneGeometry(1, 1);
  const maskMat = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilZPass: THREE.ReplaceStencilOp,
  });
  const mask = new THREE.Mesh(maskGeo, maskMat);
  mask.renderOrder = 0;
  scene.add(mask);

  const behindPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0); // keeps z <= 0
  const frontPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // keeps z >= 0

  const behind = buildTrain();
  const front = buildTrain();
  const extraMats: THREE.Material[] = [];
  const configure = (root: THREE.Object3D, inside: boolean, order: number) => {
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      o.renderOrder = order;
      const mats = (Array.isArray(o.material) ? o.material : [o.material]).map((m: THREE.Material) => {
        const c = m.clone();
        extraMats.push(c);
        c.clippingPlanes = [inside ? behindPlane : frontPlane];
        if (inside) {
          c.stencilWrite = true; // enables the stencil test in three.js
          c.stencilRef = 1;
          c.stencilFunc = THREE.EqualStencilFunc;
          c.stencilFail = THREE.KeepStencilOp;
          c.stencilZFail = THREE.KeepStencilOp;
          c.stencilZPass = THREE.KeepStencilOp;
        }
        return c;
      });
      o.material = Array.isArray(o.material) ? mats : mats[0];
    });
  };
  configure(behind.group, true, 1);
  configure(front.group, false, 2);

  // Track inside the photo (behind the window only)
  const track = new THREE.Group();
  const railMat = new THREE.MeshStandardMaterial({ color: "#8E8A84", metalness: 0.6, roughness: 0.4 });
  const sleeperMat = new THREE.MeshStandardMaterial({ color: "#4A3A2E", roughness: 0.9 });
  for (const m of [railMat, sleeperMat]) {
    m.clippingPlanes = [behindPlane];
    m.stencilWrite = true;
    m.stencilRef = 1;
    m.stencilFunc = THREE.EqualStencilFunc;
    m.stencilZPass = THREE.KeepStencilOp;
    extraMats.push(m);
  }
  const railGeo = new THREE.BoxGeometry(90, 0.06, 0.06);
  const sleeperGeo = new THREE.BoxGeometry(0.22, 0.05, CAR_W + 0.5);
  for (const z of [-(CAR_W / 2 - 0.08), CAR_W / 2 - 0.08]) {
    const r = new THREE.Mesh(railGeo, railMat);
    r.position.set(-45, -0.03, z);
    r.renderOrder = 1;
    track.add(r);
  }
  for (let x = -90; x < 0; x += 0.75) {
    const s = new THREE.Mesh(sleeperGeo, sleeperMat);
    s.position.set(x, -0.085, 0);
    s.renderOrder = 1;
    track.add(s);
  }

  scene.add(behind.group, front.group, track);

  // Path: the train runs level, almost straight at the viewer, so the yellow
  // cab grows out of the photo face-on instead of sliding off to the side.
  const heading = new THREE.Vector3(0.14, 0, 0.99).normalize();
  const yaw = Math.atan2(-heading.z, heading.x);
  const SCALE = 0.95;
  for (const g of [behind.group, front.group, track]) {
    g.rotation.y = yaw;
    g.scale.setScalar(SCALE);
  }
  const anchor = new THREE.Vector3(); // where the cab crosses the photo's plane
  const S_START = -26;
  const S_END = 7;

  let progress = 0;
  let frame = 0;
  const draw = () => {
    frame = 0;
    const e = 1 - Math.pow(1 - progress, 3);
    const s = S_START + (S_END - S_START) * e;
    const pos = anchor.clone().addScaledVector(heading, s);
    behind.group.position.copy(pos);
    front.group.position.copy(pos);
    track.position.copy(anchor);
    const spin = -s / WHEEL_R;
    for (const w of [...behind.wheels, ...front.wheels]) w.rotation.z = spin;
    renderer.render(scene, camera);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  return {
    setProgress(t) {
      const next = Math.min(1, Math.max(0, t));
      if (Math.abs(next - progress) < 0.0005) return;
      progress = next;
      schedule();
    },
    resize(width, height, portal) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // World units per CSS pixel on the z = 0 plane.
      const k = (2 * DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / height;
      const cx = (portal.x + portal.w / 2 - width / 2) * k;
      const cy = -(portal.y + portal.h / 2 - height / 2) * k;
      const pw = portal.w * k;
      const ph = portal.h * k;
      mask.position.set(cx, cy, 0);
      mask.scale.set(pw, ph, 1);
      // The cab crosses the frame slightly right of centre, on a floor near the bottom.
      anchor.set(cx + pw * 0.12, cy - ph * 0.5 + 0.02, 0);
      schedule();
    },
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      for (const d of [...behind.disposables, ...front.disposables]) d.dispose();
      for (const m of extraMats) m.dispose();
      maskGeo.dispose();
      maskMat.dispose();
      railGeo.dispose();
      sleeperGeo.dispose();
      renderer.dispose();
    },
  };
}
