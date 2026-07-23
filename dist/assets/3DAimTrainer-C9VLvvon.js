import{j as e}from"./index-DX47m1e1.js";import{b as r}from"./vendor-router-BNStLRIG.js";import{M as u,a as p}from"./minimize-DGI48H0B.js";import"./createLucideIcon--bujgNi7.js";const g=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIM TRAINER — PRO</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0c;
    color: #e8e8e8;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }
  #canvas {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    display: block;
    cursor: none;
  }
  #hud {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    display: none;
    z-index: 10;
  }
  #hud.active { display: block; }
  #crosshair {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 24px; height: 24px;
    transition: transform 0.05s ease;
  }
  #crosshair::before, #crosshair::after {
    content: '';
    position: absolute;
    background: rgba(255,255,255,0.92);
    border-radius: 1px;
    box-shadow: 0 0 3px rgba(0,0,0,0.8);
  }
  #crosshair::before { width: 2px; height: 10px; top: 7px; left: 11px; }
  #crosshair::after { width: 10px; height: 2px; top: 11px; left: 7px; }
  .ch-dot {
    position: absolute;
    width: 2px; height: 2px;
    background: rgba(255,255,255,0.92);
    border-radius: 50%;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
  }
  #crosshair.recoil { transform: translate(-50%, calc(-50% - 4px)); }
  #hitmarker {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 18px; height: 18px;
    opacity: 0;
    pointer-events: none;
  }
  #hitmarker::before, #hitmarker::after {
    content: '';
    position: absolute;
    background: #ff4444;
    border-radius: 1px;
  }
  #hitmarker::before { width: 2px; height: 8px; top: 5px; left: 8px; }
  #hitmarker::after { width: 8px; height: 2px; top: 8px; left: 5px; }
  #hitmarker.flash { animation: hitflash 0.12s ease-out forwards; }
  @keyframes hitflash {
    0% { opacity: 1; transform: translate(-50%, -50%) rotate(45deg) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -50%) rotate(45deg) scale(0.9); }
  }
  #stats {
    position: absolute;
    top: 18px; left: 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 5px 12px;
    min-width: 130px;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
  }
  .stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    margin-left: auto;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }
  .stat-value.accent { color: #4fc3f7; }
  .stat-value.good { color: #69f0ae; }
  .stat-value.bad { color: #ff5252; }
  #timer-panel {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 8px 22px;
    text-align: center;
  }
  #timer-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 2px;
  }
  #timer-value {
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }
  #fps {
    position: absolute;
    top: 18px; right: 18px;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
  }
  .score-popup {
    position: absolute;
    font-size: 13px;
    font-weight: 700;
    color: #69f0ae;
    pointer-events: none;
    text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    animation: floatUp 0.55s ease-out forwards;
    letter-spacing: 0.04em;
  }
  @keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-28px); }
  }
  .screen {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    background: rgba(6,6,8,0.96);
    backdrop-filter: blur(12px);
  }
  .screen.hidden { display: none; }
  .logo {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 14px;
  }
  .title {
    font-size: clamp(42px, 6vw, 72px);
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 6px;
  }
  .title span {
    background: linear-gradient(135deg, #4fc3f7 0%, #81d4fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.08em;
    margin-bottom: 48px;
    text-transform: uppercase;
    font-weight: 500;
  }
  .btn-primary {
    background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 15px 48px;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
    box-shadow: 0 4px 24px rgba(79,195,247,0.25);
    margin-bottom: 14px;
    min-width: 200px;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); opacity: 0.8; }
  .btn-secondary {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 12px 40px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    min-width: 200px;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
  .info-grid { display: flex; gap: 16px; margin-bottom: 48px; }
  .info-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 16px 22px;
    text-align: center;
    min-width: 110px;
  }
  .info-card .ic-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 6px;
  }
  .info-card .ic-val { font-size: 18px; font-weight: 800; color: #4fc3f7; }
  .hint { font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 0.08em; margin-top: 8px; }
  #pause-screen .pause-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 36px;
  }
  .pause-stat {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 12px 20px;
    text-align: center;
  }
  .pause-stat .ps-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 4px;
  }
  .pause-stat .ps-val { font-size: 22px; font-weight: 800; color: #ffffff; }
  #muzzle-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: radial-gradient(ellipse at 50% 80%, rgba(255,200,80,0.12) 0%, transparent 60%);
    pointer-events: none;
    opacity: 0;
    z-index: 8;
    transition: opacity 0.04s;
  }
  #muzzle-overlay.flash { opacity: 1; }
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<div id="hud">
  <div id="crosshair"><div class="ch-dot"></div></div>
  <div id="hitmarker"></div>
  <div id="muzzle-overlay"></div>
  <div id="stats">
    <div class="stat-row"><span class="stat-label">Score</span><span class="stat-value accent" id="s-score">0</span></div>
    <div class="stat-row"><span class="stat-label">Hits</span><span class="stat-value good" id="s-hits">0</span></div>
    <div class="stat-row"><span class="stat-label">Misses</span><span class="stat-value bad" id="s-misses">0</span></div>
    <div class="stat-row"><span class="stat-label">Accuracy</span><span class="stat-value" id="s-acc">—</span></div>
  </div>
  <div id="timer-panel">
    <div id="timer-label">Session Time</div>
    <div id="timer-value">0:00</div>
  </div>
  <div id="fps">60 FPS</div>
</div>
<div class="screen" id="start-screen">
  <div class="logo">Aim Trainer Pro</div>
  <div class="title">SHARPEN YOUR <span>AIM</span></div>
  <div class="subtitle">First-Person Precision Training</div>
  <div class="info-grid">
    <div class="info-card"><div class="ic-label">Mode</div><div class="ic-val" style="font-size:13px;color:#fff;">Infinite</div></div>
    <div class="info-card"><div class="ic-label">Targets</div><div class="ic-val">∞</div></div>
    <div class="info-card"><div class="ic-label">Spawn</div><div class="ic-val" style="font-size:13px;">50ms</div></div>
    <div class="info-card"><div class="ic-label">Ammo</div><div class="ic-val" style="font-size:13px;color:#fff;">∞</div></div>
  </div>
  <button class="btn-primary" id="btn-start">▶ Start Training</button>
  <div class="hint">ESC to pause · Left click to shoot</div>
</div>
<div class="screen hidden" id="pause-screen">
  <div class="logo">Paused</div>
  <div class="title" style="font-size:42px;margin-bottom:24px;">TRAINING PAUSED</div>
  <div class="pause-stats">
    <div class="pause-stat"><div class="ps-label">Score</div><div class="ps-val" id="p-score">0</div></div>
    <div class="pause-stat"><div class="ps-label">Hits</div><div class="ps-val" id="p-hits">0</div></div>
    <div class="pause-stat"><div class="ps-label">Misses</div><div class="ps-val" id="p-misses">0</div></div>
    <div class="pause-stat"><div class="ps-label">Accuracy</div><div class="ps-val" id="p-acc">—</div></div>
  </div>
  <button class="btn-primary" id="btn-resume">▶ Resume</button>
  <button class="btn-secondary" id="btn-restart">Restart</button>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
<script>
"use strict";
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') {
      const p = audioCtx.resume();
      if (p && p.catch) p.catch(e => console.warn("Audio resume blocked", e));
    }
  } catch (err) {
    console.warn("Audio init failed", err);
  }
}
function playGunshot() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 420;
  filter.Q.value = 0.6;
  src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
  src.start(t); src.stop(t + 0.12);
  const osc = audioCtx.createOscillator();
  const og = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  og.gain.setValueAtTime(0.8, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(og); og.connect(audioCtx.destination);
  osc.start(t); osc.stop(t + 0.1);
}
function playHit() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.06);
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(t); osc.stop(t + 0.07);
}
function playDestroy() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [600, 800, 1100].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t + i * 0.018);
    g.gain.setValueAtTime(0.22, t + i * 0.018);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.018 + 0.08);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t + i * 0.018); o.stop(t + i * 0.018 + 0.09);
  });
}
const state = { running: false, paused: false, hits: 0, misses: 0, score: 0, startTime: 0, pauseAccum: 0, pauseStart: 0 };
function resetState() { state.running=false; state.paused=false; state.hits=0; state.misses=0; state.score=0; state.startTime=0; state.pauseAccum=0; state.pauseStart=0; }
const canvas = document.getElementById('canvas');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x1a1a1e, 1);
  canvas.addEventListener("webglcontextlost", (e) => { 
    e.preventDefault(); 
    if (state.running) pauseGame(); 
  }, false);
} catch (e) {
  console.error("WebGL failed to init", e);
  document.getElementById('start-screen').innerHTML = '<div style="color:#ff5252;padding:20px;text-align:center;max-width:400px;margin:0 auto;line-height:1.5;">WebGL is not supported or failed to initialize on your device. Please ensure hardware acceleration is enabled in your browser settings.</div>';
}
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1a1a1e, 18, 38);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 80);
camera.position.set(0, 1.65, 0);
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const PI_2 = Math.PI / 2;
const lookSensitivity = 0.0018;
function applyMouseMove(dx, dy) {
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= dx * lookSensitivity;
  euler.x -= dy * lookSensitivity;
  euler.x = Math.max(-PI_2 * 0.88, Math.min(PI_2 * 0.88, euler.x));
  camera.quaternion.setFromEuler(euler);
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
});
(function buildRoom() {
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x2e2e35 });
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x252528 });
  const ceilMat = new THREE.MeshLambertMaterial({ color: 0x202023 });
  const W = 22, H = 6, D = 32;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -D/2 + 2); scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, -D/2 + 2); scene.add(ceil);
  const bwall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
  bwall.position.set(0, H/2, -D + 2); scene.add(bwall);
  const lwall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
  lwall.rotation.y = Math.PI / 2; lwall.position.set(-W/2, H/2, -D/2 + 2); scene.add(lwall);
  const rwall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
  rwall.rotation.y = -Math.PI / 2; rwall.position.set(W/2, H/2, -D/2 + 2); scene.add(rwall);
  const gridHelper = new THREE.GridHelper(W, 22, 0x333338, 0x2a2a30);
  gridHelper.position.set(0, 0.002, -D/2 + 2); scene.add(gridHelper);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x3a3a45 });
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.5), markerMat);
    m.position.set((i - 1) * 6, 2.5, -D + 2.01); scene.add(m);
  }
  const baseMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1f });
  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, 0.06), baseMat);
  baseboard.position.set(0, 0.06, -D + 2.04); scene.add(baseboard);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff8e8 });
  const lightGeom = new THREE.PlaneGeometry(0.8, 3);
  [-6, 0, 6].forEach(x => {
    [-4, -14, -24].forEach(z => {
      const l = new THREE.Mesh(lightGeom, lightMat);
      l.rotation.x = Math.PI / 2; l.position.set(x, H - 0.01, z); scene.add(l);
    });
  });
})();
const ambient = new THREE.AmbientLight(0xffffff, 0.55); scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xfff8f0, 0.9); dirLight.position.set(2, 8, 4); scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.35); fillLight.position.set(-4, 3, -8); scene.add(fillLight);
const gunGroup = new THREE.Group();
(function buildGun() {
  const darkMetal = new THREE.MeshLambertMaterial({ color: 0x1c1c22 });
  const metal = new THREE.MeshLambertMaterial({ color: 0x2a2a32 });
  const grip = new THREE.MeshLambertMaterial({ color: 0x111116 });
  const barrel = new THREE.MeshLambertMaterial({ color: 0x222228 });
  const slide = new THREE.MeshLambertMaterial({ color: 0x1a1a20 });
  const silver = new THREE.MeshLambertMaterial({ color: 0x6a6a72 });
  const slideM = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.065, 0.32), slide);
  slideM.position.set(0, 0.01, -0.04); gunGroup.add(slideM);
  const frameM = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.24), metal);
  frameM.position.set(0, -0.04, 0.0); gunGroup.add(frameM);
  const barrelM = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.34, 8), barrel);
  barrelM.rotation.x = Math.PI / 2; barrelM.position.set(0, 0.01, -0.21); gunGroup.add(barrelM);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.005, 6, 8), silver);
  ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.01, -0.37); gunGroup.add(ring);
  const tgShape = new THREE.Shape();
  tgShape.moveTo(-0.018, 0); tgShape.lineTo(0.018, 0); tgShape.lineTo(0.018, -0.028); tgShape.lineTo(-0.018, -0.028); tgShape.lineTo(-0.018, 0);
  const tg = new THREE.Mesh(new THREE.ShapeGeometry(tgShape), darkMetal);
  tg.position.set(0, -0.01, 0.04); tg.rotation.x = -0.15; gunGroup.add(tg);
  const gripM = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.13, 0.10), grip);
  gripM.position.set(0, -0.105, 0.09); gripM.rotation.x = 0.12; gunGroup.add(gripM);
  const gripBase = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.022, 0.095), darkMetal);
  gripBase.position.set(0, -0.175, 0.09); gunGroup.add(gripBase);
  const fsight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.004), darkMetal);
  fsight.position.set(0, 0.048, -0.35); gunGroup.add(fsight);
  const rsight = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.010, 0.006), darkMetal);
  rsight.position.set(0, 0.048, 0.12); gunGroup.add(rsight);
  const ext = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.008, 0.05), silver);
  ext.position.set(0.028, 0.04, -0.02); gunGroup.add(ext);
})();
gunGroup.position.set(0.14, -0.14, -0.32);
gunGroup.rotation.y = 0.04;
camera.add(gunGroup);
scene.add(camera);
const muzzleFlashGeo = new THREE.SphereGeometry(0.025, 6, 4);
const muzzleFlashMat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0 });
const muzzleFlash = new THREE.Mesh(muzzleFlashGeo, muzzleFlashMat);
muzzleFlash.position.set(0.14, -0.13, -0.71);
camera.add(muzzleFlash);
let muzzleTimer = 0;
const TARGET_RADIUS = 0.28, TARGET_MIN_Z = -6, TARGET_MAX_Z = -26;
const TARGET_Y_MIN = 0.8, TARGET_Y_MAX = 3.8, TARGET_X_RANGE = 7.5;
const SPEED_BASE = 1.4, SPEED_RANGE = 2.2;
const DIR_CHANGE_MIN = 0.6, DIR_CHANGE_MAX = 1.8;
const targetGeo = new THREE.SphereGeometry(TARGET_RADIUS, 16, 12);
const targetCoreMat = new THREE.MeshLambertMaterial({ color: 0xff3333 });
const targetGlowMat = new THREE.MeshBasicMaterial({ color: 0xff6655, transparent: true, opacity: 0.18, side: THREE.BackSide });
const targetGlowGeo = new THREE.SphereGeometry(TARGET_RADIUS * 1.22, 14, 10);
let activeTarget = null, spawnTimeout = null, spawnLocked = false;
function spawnTarget() {
  if (!state.running || state.paused || spawnLocked) return;
  spawnLocked = true;
  const delay = 50 + Math.random() * 70;
  spawnTimeout = setTimeout(() => {
    if (!state.running || state.paused) { spawnLocked = false; return; }
    const mesh = new THREE.Mesh(targetGeo, targetCoreMat);
    const glow = new THREE.Mesh(targetGlowGeo, targetGlowMat);
    mesh.add(glow);
    const z = TARGET_MIN_Z + Math.random() * (TARGET_MAX_Z - TARGET_MIN_Z);
    const x = (Math.random() * 2 - 1) * TARGET_X_RANGE;
    const y = TARGET_Y_MIN + Math.random() * (TARGET_Y_MAX - TARGET_Y_MIN);
    mesh.position.set(x, y, z);
    const speed = SPEED_BASE + Math.random() * SPEED_RANGE;
    const angle = Math.random() * Math.PI * 2;
    mesh.userData = {
      vel: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed * 0.6, 0),
      dirTimer: DIR_CHANGE_MIN + Math.random() * (DIR_CHANGE_MAX - DIR_CHANGE_MIN),
      age: 0
    };
    scene.add(mesh); activeTarget = mesh; spawnLocked = false;
  }, delay);
}
function destroyTarget(hit) {
  if (!activeTarget) return;
  scene.remove(activeTarget); activeTarget = null;
  if (hit) {
    playHit(); playDestroy();
    state.hits++; state.score += 100;
    updateHUD(); showHitMarker(); showScorePopup();
  }
  spawnTarget();
}
function updateTarget(dt) {
  if (!activeTarget) return;
  const u = activeTarget.userData;
  u.age += dt; u.dirTimer -= dt;
  if (u.dirTimer <= 0) {
    const angle = Math.random() * Math.PI * 2;
    const speed = SPEED_BASE + Math.random() * SPEED_RANGE;
    u.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed * 0.55, 0);
    u.dirTimer = DIR_CHANGE_MIN + Math.random() * (DIR_CHANGE_MAX - DIR_CHANGE_MIN);
  }
  const p = activeTarget.position;
  p.x += u.vel.x * dt; p.y += u.vel.y * dt;
  if (p.x > TARGET_X_RANGE) { p.x = TARGET_X_RANGE; u.vel.x *= -1; }
  if (p.x < -TARGET_X_RANGE) { p.x = -TARGET_X_RANGE; u.vel.x *= -1; }
  if (p.y > TARGET_Y_MAX) { p.y = TARGET_Y_MAX; u.vel.y *= -1; }
  if (p.y < TARGET_Y_MIN) { p.y = TARGET_Y_MIN; u.vel.y *= -1; }
  const pulse = 1 + 0.04 * Math.sin(u.age * 6);
  activeTarget.scale.setScalar(pulse);
}
const impactPool = [];
const POOL_SIZE = 8;
const impactGeo = new THREE.SphereGeometry(0.04, 4, 3);
const impactMat = new THREE.MeshBasicMaterial({ color: 0xff6644 });
for (let i = 0; i < POOL_SIZE; i++) {
  const m = new THREE.Mesh(impactGeo, impactMat);
  m.visible = false; m.userData = { life: 0, vel: new THREE.Vector3() };
  scene.add(m); impactPool.push(m);
}
let poolIdx = 0;
function spawnImpact(pos) {
  for (let i = 0; i < 5; i++) {
    const m = impactPool[poolIdx % POOL_SIZE]; poolIdx++;
    m.position.copy(pos);
    m.userData.vel.set((Math.random()-0.5)*3.5, Math.random()*3+1, (Math.random()-0.5)*3.5);
    m.userData.life = 0.35; m.visible = true; m.scale.setScalar(1);
  }
}
function updateImpacts(dt) {
  for (let i = 0; i < POOL_SIZE; i++) {
    const m = impactPool[i];
    if (!m.visible) continue;
    m.userData.life -= dt;
    if (m.userData.life <= 0) { m.visible = false; continue; }
    m.position.addScaledVector(m.userData.vel, dt);
    m.userData.vel.y -= 6 * dt;
    m.scale.setScalar(m.userData.life / 0.35);
  }
}
const raycaster = new THREE.Raycaster();
const centerNDC = new THREE.Vector2(0, 0);
let canShoot = true, shootCooldown = 0;
const SHOOT_COOLDOWN = 0.08;
function shoot() {
  if (!state.running || state.paused || !canShoot) return;
  ensureAudio(); canShoot = false; shootCooldown = SHOOT_COOLDOWN;
  playGunshot(); triggerMuzzleFlash(); triggerRecoil();
  raycaster.setFromCamera(centerNDC, camera);
  if (activeTarget) {
    const hits = raycaster.intersectObject(activeTarget, true);
    if (hits.length > 0) { spawnImpact(hits[0].point.clone()); destroyTarget(true); return; }
  }
  state.misses++; updateHUD();
}
let recoilAnim = 0, recoilActive = false;
const gunRestPos = new THREE.Vector3(0.14, -0.14, -0.32);
const gunRecoilPos = new THREE.Vector3(0.14, -0.10, -0.28);
function triggerRecoil() {
  recoilActive = true; recoilAnim = 0;
  document.getElementById('crosshair').classList.add('recoil');
  setTimeout(() => document.getElementById('crosshair').classList.remove('recoil'), 60);
}
function updateGunRecoil(dt) {
  if (!recoilActive) return;
  recoilAnim += dt * 14;
  if (recoilAnim >= 1) { recoilAnim = 0; recoilActive = false; }
  const t = recoilAnim < 0.3 ? recoilAnim / 0.3 : 1 - (recoilAnim - 0.3) / 0.7;
  gunGroup.position.lerpVectors(gunRestPos, gunRecoilPos, t);
  gunGroup.rotation.x = -t * 0.07;
}
function triggerMuzzleFlash() {
  muzzleFlashMat.opacity = 0.9; muzzleTimer = 0.055;
  document.getElementById('muzzle-overlay').classList.add('flash');
  setTimeout(() => document.getElementById('muzzle-overlay').classList.remove('flash'), 40);
}
function updateMuzzleFlash(dt) {
  if (muzzleTimer > 0) {
    muzzleTimer -= dt;
    muzzleFlashMat.opacity = muzzleTimer <= 0 ? 0 : (muzzleTimer / 0.055) * 0.9;
    if (muzzleTimer <= 0) muzzleTimer = 0;
  }
}
const elScore=document.getElementById('s-score'), elHits=document.getElementById('s-hits');
const elMisses=document.getElementById('s-misses'), elAcc=document.getElementById('s-acc');
const elTimer=document.getElementById('timer-value'), elFps=document.getElementById('fps');
function updateHUD() {
  elScore.textContent = state.score; elHits.textContent = state.hits; elMisses.textContent = state.misses;
  const total = state.hits + state.misses;
  elAcc.textContent = total === 0 ? '—' : Math.round((state.hits / total) * 100) + '%';
  document.getElementById('p-score').textContent = state.score;
  document.getElementById('p-hits').textContent = state.hits;
  document.getElementById('p-misses').textContent = state.misses;
  document.getElementById('p-acc').textContent = total === 0 ? '—' : Math.round((state.hits / total) * 100) + '%';
}
function formatTime(ms) { const s=Math.floor(ms/1000), m=Math.floor(s/60); return m+':'+String(s%60).padStart(2,'0'); }
function showHitMarker() {
  const hm=document.getElementById('hitmarker');
  hm.classList.remove('flash'); void hm.offsetWidth; hm.classList.add('flash');
}
function showScorePopup() {
  const hud=document.getElementById('hud');
  const span=document.createElement('div');
  span.className='score-popup'; span.textContent='+100';
  span.style.left=(45+Math.random()*10)+'%'; span.style.top=(42+Math.random()*8)+'%';
  hud.appendChild(span); setTimeout(()=>span.remove(), 600);
}
let fpsFrames=0, fpsAccum=0;
function updateFPS(dt) {
  fpsFrames++; fpsAccum+=dt;
  if (fpsAccum>=0.5) {
    const fps=Math.round(fpsFrames/fpsAccum);
    elFps.textContent=fps+' FPS';
    elFps.style.color=fps>=55?'rgba(105,240,174,0.7)':fps>=30?'rgba(255,183,77,0.7)':'rgba(255,82,82,0.7)';
    fpsFrames=0; fpsAccum=0;
  }
}
let pointerLocked = false;
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
  if (!pointerLocked && state.running && !state.paused) pauseGame();
});
document.addEventListener('mousemove', (e) => {
  if (!pointerLocked || !state.running || state.paused) return;
  applyMouseMove(e.movementX, e.movementY);
});
document.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  if (!pointerLocked || !state.running || state.paused) return;
  shoot();
});
function requestPointerLock() { 
  try {
    const p = canvas.requestPointerLock();
    if (p && p.catch) p.catch(e => console.warn("Pointer lock error", e));
  } catch(e) {
    console.warn("Pointer lock unsupported", e);
  }
}
function startGame() {
  ensureAudio(); resetState(); state.running = true; state.startTime = performance.now();
  if (activeTarget) { scene.remove(activeTarget); activeTarget = null; }
  clearTimeout(spawnTimeout); spawnLocked = false;
  gunGroup.position.copy(gunRestPos); gunGroup.rotation.set(0, 0.04, 0);
  euler.set(0, 0, 0); camera.quaternion.setFromEuler(euler);
  updateHUD();
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('pause-screen').classList.add('hidden');
  document.getElementById('hud').classList.add('active');
  requestPointerLock(); spawnTarget();
}
function pauseGame() {
  if (!state.running || state.paused) return;
  state.paused = true; state.pauseStart = performance.now();
  document.getElementById('pause-screen').classList.remove('hidden');
  updateHUD();
}
function resumeGame() {
  if (!state.running || !state.paused) return;
  state.paused = false; state.pauseAccum += performance.now() - state.pauseStart;
  document.getElementById('pause-screen').classList.add('hidden');
  requestPointerLock();
  if (!activeTarget) spawnTarget();
}
function restartGame() { document.getElementById('pause-screen').classList.add('hidden'); startGame(); }
let lastTime = performance.now();
let animFrameId = null;
function loop(now) {
  animFrameId = requestAnimationFrame(loop);
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now;
    if (state.running && !state.paused) {
      if (!canShoot) { shootCooldown -= dt; if (shootCooldown <= 0) { canShoot = true; shootCooldown = 0; } }
      updateTarget(dt); updateImpacts(dt); updateGunRecoil(dt); updateMuzzleFlash(dt); updateFPS(dt);
      if (elTimer) elTimer.textContent = formatTime(now - state.startTime - state.pauseAccum);
    }
    if (renderer) renderer.render(scene, camera);
  } catch (err) {
    console.error("Game loop error:", err);
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (state.running) pauseGame();
  }
}
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-resume').addEventListener('click', resumeGame);
document.getElementById('btn-restart').addEventListener('click', restartGame);
requestAnimationFrame(loop);
<\/script>
</body>
</html>`,f=[{label:"CPS Test",href:"/cps-test",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("line",{x1:"12",y1:"6",x2:"12",y2:"10"}),e.jsx("circle",{cx:"12",cy:"14",r:"1",fill:"currentColor"})]})},{label:"Spacebar Counter",href:"/spacebar-counter",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("rect",{x:"2",y:"5",width:"20",height:"14",rx:"2"}),e.jsx("line",{x1:"6",y1:"15",x2:"18",y2:"15"})]})},{label:"Aim Trainer",href:"/aim-trainer",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"6"}),e.jsx("circle",{cx:"12",cy:"12",r:"2"})]})},{label:"Typing Test",href:"/typing-test",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),e.jsx("path",{d:"M8 15h8M7 11h2m3 0h2m3 0h-1"})]})},{label:"Reaction Time",href:"/reaction-time",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]})},{label:"Scroll Test",href:"/scroll-test",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 11l3-3 3 3"}),e.jsx("path",{d:"M9 13l3 3 3-3"})]})},{label:"Double Click",href:"/double-click",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("line",{x1:"12",y1:"6",x2:"12",y2:"10"})]})},{label:"3D Aim Trainer",href:"/3d-aim-trainer",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M3 12h3m12 0h3M12 3v3m0 12v3"}),e.jsx("circle",{cx:"12",cy:"12",r:"8",opacity:".4"})]})},{label:"Mouse Accuracy",href:"/mouse-accuracy",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("path",{d:"M12 2v10"})]})},{label:"Key Visualizer",href:"/key-visualizer",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("rect",{x:"2",y:"5",width:"20",height:"14",rx:"2"}),e.jsx("path",{d:"M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"})]})},{label:"F1 Reaction",href:"/f1-reaction",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})})},{label:"Space Defense",href:"/space-defense",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})})},{label:"Accuracy Test",href:"/accuracy",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"}),e.jsx("polyline",{points:"22 4 12 14.01 9 11.01"})]})},{label:"CPS Rush",href:"/cps-rush",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("path",{d:"M12 12v-4"}),e.jsx("circle",{cx:"12",cy:"14",r:"1",fill:"currentColor"})]})},{label:"Voyager Game",href:"/voyager-game",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("path",{d:"M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"})})},{label:"Space Waves",href:"/space-waves",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("path",{d:"M2 12h4l3-9 5 18 3-9h5"})})}];function w(){const s=r.useRef(null),l=r.useRef(null),[a,o]=r.useState(!1),[c,d]=r.useState("");r.useEffect(()=>{const t=new Blob([g],{type:"text/html"}),n=URL.createObjectURL(t);return d(n),()=>{URL.revokeObjectURL(n)}},[]);const m=r.useCallback(()=>{const t=s.current;t&&(document.fullscreenElement?document.exitFullscreen?.().then(()=>o(!1)).catch(()=>{}):t.requestFullscreen?.().then(()=>o(!0)).catch(()=>{}))},[]);return r.useEffect(()=>{const t=()=>o(!!document.fullscreenElement);return document.addEventListener("fullscreenchange",t),()=>document.removeEventListener("fullscreenchange",t)},[]),e.jsxs("div",{style:{width:"100%",minHeight:"100vh"},children:[e.jsxs("div",{ref:s,style:{width:"100%",height:"100vh",position:"relative",background:"#0a0a0c",overflow:"hidden"},children:[e.jsx("iframe",{ref:l,src:c,style:{width:"100%",height:"100%",border:"none",display:"block"},allow:"pointer-lock; fullscreen",title:"3D Aim Trainer"}),e.jsx("div",{style:{position:"absolute",top:"14px",right:"14px",display:"flex",gap:"8px",zIndex:100},children:e.jsx("button",{onClick:m,"aria-label":a?"Exit fullscreen":"Enter fullscreen",style:{background:"rgba(4,9,20,0.8)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"7px",color:"#9ca3af",cursor:"pointer",display:"flex",alignItems:"center"},children:a?e.jsx(u,{size:16}):e.jsx(p,{size:16})})})]}),e.jsxs("section",{"aria-label":"More Tools",style:{maxWidth:"1000px",margin:"4rem auto 0 auto",padding:"0 2rem"},children:[e.jsx("h2",{style:{fontWeight:800,fontSize:"1.5rem",color:"#fff",marginBottom:"1.5rem",textAlign:"center",letterSpacing:"-0.3px"},children:"More Tools"}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:"1rem"},children:f.map(({label:t,href:n,icon:h})=>e.jsxs("a",{href:n,style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0.6rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1.2rem 0.5rem",cursor:"pointer",textDecoration:"none",transition:"all 0.2s ease"},onMouseEnter:i=>{i.currentTarget.style.background="rgba(79,195,247,0.08)",i.currentTarget.style.borderColor="rgba(79,195,247,0.35)",i.currentTarget.style.transform="translateY(-2px)"},onMouseLeave:i=>{i.currentTarget.style.background="rgba(255,255,255,0.03)",i.currentTarget.style.borderColor="rgba(255,255,255,0.07)",i.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"56px",height:"56px",borderRadius:"12px",background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",color:"#4fc3f7",transition:"color 0.3s ease"},children:h}),e.jsx("span",{style:{color:"#d1d1de",fontSize:"0.8rem",fontWeight:600,textAlign:"center"},children:t})]},n))})]}),e.jsxs("article",{style:{maxWidth:"1000px",margin:"0 auto",padding:"4rem 2rem",color:"#cbd5e1",fontFamily:"system-ui, sans-serif",lineHeight:"1.6"},children:[e.jsx("h1",{style:{fontSize:"2.5rem",fontWeight:900,marginBottom:"2.5rem",color:"#fff",textAlign:"center",textTransform:"uppercase",letterSpacing:"-0.02em"},children:"The Ultimate Guide to 3D Aim Training"}),e.jsxs("div",{style:{marginBottom:"4rem",fontSize:"1.1rem",color:"#9ca3af"},children:[e.jsxs("p",{style:{marginBottom:"1.5rem"},children:["Welcome to the most comprehensive and deeply analytical guide on 3D Aim Training you will ever read. Aim training in a three-dimensional environment has revolutionized the way competitive gamers prepare for high-stakes matches in top-tier First-Person Shooters (FPS) like Valorant, Counter-Strike 2, Overwatch 2, and Apex Legends. Unlike simple 2D clicker games, a true 3D Aim Trainer immerses you in a simulated spatial environment that requires precise camera rotation, crosshair placement, and depth perception. The integration of 3D physics means that your mouse movements translate directly into angular rotations within the game engine, governed by complex calculations involving field of view (FOV), sensitivity, and dots per inch (DPI). Mastering this environment is not just about clicking fast; it is about building robust neural pathways that automate the process of target acquisition. According to studies in ",e.jsx("a",{href:"https://en.wikipedia.org/wiki/Motor_learning",target:"_blank",rel:"noopener noreferrer",style:{color:"#4fc3f7",textDecoration:"none"},children:"motor learning"}),", the specificity of practice is paramount. When you train in 3D, you are engaging the exact same spatial awareness mechanisms that you rely on in actual gameplay."]}),e.jsxs("p",{style:{marginBottom:"1.5rem"},children:['The journey to elite aiming is paved with thousands of repetitions, focusing on micro-corrections, tracking smoothness, and the raw speed of flick shots. Professional esports athletes dedicate countless hours to isolated mechanical practice. But why does this work so effectively? The answer lies in the cognitive concept of procedural memory. When you first start playing an FPS, aiming requires conscious thought. You have to actively decide how far to move your hand to reach a target on the screen. However, through structured practice in a controlled 3D aim trainer, this process is pushed into the subconscious. The brain forms strong synaptic connections that map specific physical hand movements to specific on-screen crosshair displacements. This is often colloquially referred to as "muscle memory," although the memory resides entirely in the brain, not the muscles themselves. A comprehensive overview of how ',e.jsx("a",{href:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4346284/",target:"_blank",rel:"noopener noreferrer",style:{color:"#4fc3f7",textDecoration:"none"},children:"neuroplasticity"})," facilitates skill acquisition demonstrates that consistent, targeted repetition leads to structural changes in the brain that support rapid, automatic execution of complex motor tasks."]}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:"One of the most critical factors in 3D aim training is ensuring that your training environment perfectly mirrors your primary game. This is where the concept of eDPI (effective Dots Per Inch) comes into play. eDPI is calculated by multiplying your mouse's hardware DPI by your in-game sensitivity multiplier. By maintaining a consistent eDPI across your aim trainer and your game, you ensure that the muscle memory you build is perfectly transferable. Furthermore, your Field of View (FOV) must also match. A higher FOV makes targets in the center of the screen appear smaller and move slower across the monitor, while a lower FOV makes them appear larger and move faster. If your FOV in the aim trainer is different from your game, your brain will struggle to calibrate the necessary hand movements. Many modern aim trainers, including this one, allow you to adjust your sensitivity and FOV to perfectly match popular titles, ensuring 1:1 translation of your mechanical skills."}),e.jsxs("p",{style:{marginBottom:"1.5rem"},children:["Beyond the software, hardware plays an undeniable role in aiming potential. A lightweight gaming mouse with a flawless optical sensor is essentially a prerequisite for high-level competitive play. Sensors like the PixArt 3360 and its derivatives provide true 1:1 tracking without hardware acceleration or angle snapping. This raw input is crucial because any artificial manipulation of your mouse movement by the hardware will disrupt the formation of accurate muscle memory. Additionally, the polling rate of the mouse—how often it reports its position to the computer—should be at least 1000Hz to minimize input lag. When combined with a high refresh rate monitor (144Hz, 240Hz, or even 360Hz), the latency between your physical movement and the visual feedback on the screen is reduced to milliseconds. This immediate feedback loop is essential for making the rapid micro-corrections required for elite tracking and flicking. You can learn more about the impact of latency on human performance in ",e.jsx("a",{href:"https://humanfactors.jmir.org/2021/1/e23735/",target:"_blank",rel:"noopener noreferrer",style:{color:"#4fc3f7",textDecoration:"none"},children:"human-computer interaction studies"}),"."]}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:'Aiming can generally be broken down into three fundamental techniques: flicking, tracking, and crosshair placement. Flicking is the rapid, explosive movement of the crosshair to a target that appears suddenly. It relies heavily on ingrained spatial memory and fast twitch muscle fibers. Tracking, on the other hand, involves keeping the crosshair smoothly locked onto a moving target. This requires continuous visual processing and smooth, controlled arm and wrist movements. Tracking is heavily emphasized in games with longer "time-to-kill" (TTK) like Apex Legends or Overwatch 2. Crosshair placement is perhaps the most important yet most often overlooked aspect of aiming. It involves pre-aiming the crosshair at the exact location where an enemy is expected to appear, typically at head height. Good crosshair placement minimizes the need for drastic flicking, making aiming feel effortless. A comprehensive 3D aim trainer provides scenarios to isolate and practice each of these techniques individually.'}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:'When constructing a routine, consistency is far more valuable than marathon sessions. Practicing for 30 minutes every single day yields significantly better results than practicing for three hours once a week. This is because motor learning and memory consolidation occur primarily during sleep. Short, focused training sessions followed by adequate rest allow the brain to process and solidify the neural pathways formed during practice. During your sessions, it is crucial to focus on accuracy before speed. The mantra "slow is smooth, and smooth is fast" applies perfectly to aim training. If you try to flick faster than your current skill level allows, you will build bad habits and reinforce inaccurate muscle memory. Focus on hitting the target with 90-95% accuracy. Once you can consistently hit targets at a certain speed with high accuracy, your speed will naturally increase over time without sacrificing precision.'}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:"Another vital component of mechanical skill development is posture and ergonomics. How you sit at your desk, the height of your chair, and the positioning of your arm on the desk all heavily influence your aiming consistency. A common recommendation among professional players is to ensure that your elbow is resting comfortably on the desk or armrest, forming roughly a 90-degree angle. This provides a stable pivot point for large sweeping arm movements (used for turning and large tracking motions) while freeing up the wrist and fingers for precise micro-adjustments. Tension in your grip or forearm is the enemy of smooth aiming. Learning to maintain a relaxed grip on the mouse, even in high-pressure situations, prevents fatigue and allows for much more fluid and precise cursor control. Ergonomics not only improves performance but also prevents repetitive strain injuries (RSI), which are unfortunately common in esports."}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:"The evolution of aim trainers has been fascinating. What started as simple flash-based browser games has evolved into sophisticated standalone engines built in Unity or Unreal Engine, or in this case, a highly optimized WebGL environment. These modern trainers offer incredibly detailed statistics, tracking your reaction time, accuracy, over-flick percentage, and time-to-damage. Analyzing this data is crucial for identifying your weaknesses. Do you consistently overshoot targets to the right? You might need to adjust your grip or lower your sensitivity slightly. Do you struggle with targets moving vertically? You can isolate vertical tracking scenarios to build proficiency. The data-driven approach to mechanical improvement has elevated the average skill level in competitive shooters to unprecedented heights."}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:"But aim isn't everything. It's important to remember that mechanics exist to serve game sense. You can have the most precise aim in the world, but if you are consistently caught out of position or lack understanding of map control and timings, you will still lose engagements. Aim training should supplement your actual gameplay, not replace it. The ideal ratio varies, but many coaches recommend spending no more than 20-30% of your total gaming time on isolated aim training. The rest should be spent playing the game, applying your improved mechanics in real, dynamic situations where positioning, movement, and decision-making all interact simultaneously. This holistic approach ensures that you become a complete player, rather than just a highly accurate static turret."}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:"Cognitive fatigue is a real phenomenon that affects aiming performance. Because aiming requires intense visual focus and rapid decision-making, your central nervous system can become depleted after prolonged sessions. You might notice your reaction times slowing down or your tracking becoming jittery after a few hours of intense play. Recognizing the signs of cognitive fatigue and taking regular breaks is essential for maintaining peak performance. Techniques such as the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) can help reduce eye strain, while physical stretching can relieve tension in your shoulders and wrists. Proper hydration, nutrition, and sleep are also foundational elements of cognitive performance. You cannot expect your brain to execute complex motor tasks at maximum efficiency if it is not properly fueled and rested."}),e.jsx("p",{style:{marginBottom:"1.5rem"},children:"In conclusion, 3D aim training is a scientifically grounded method for improving your mechanical proficiency in first-person shooters. By understanding the principles of motor learning, optimizing your hardware and software environment, and adhering to a consistent, accuracy-focused practice routine, you can systematically elevate your aiming capabilities. Remember that improvement is not linear; there will be plateaus and even temporary regressions. However, with dedication and a data-driven approach to identifying and addressing your weaknesses, the neural pathways will inevitably strengthen, and those seemingly impossible flick shots will eventually become second nature. Now, dive into the trainer above, start building those repetitions, and watch as your hard work translates into tangible results on the scoreboard. Below you will find an extensive breakdown of every single aspect of aim training, divided into specific, actionable sections to guide you on your journey to becoming a mechanical god."}),e.jsxs("p",{style:{marginBottom:"1.5rem"},children:["To further understand the cognitive demands of gaming, refer to academic publications on ",e.jsx("a",{href:"https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01824/full",target:"_blank",rel:"noopener noreferrer",style:{color:"#4fc3f7",textDecoration:"none"},children:"esports psychology and cognitive performance"}),", which highlight the incredible mental processing speeds required at the highest levels of competitive play. The skills you are building here extend far beyond the virtual battlefield, enhancing your hand-eye coordination, reaction times, and spatial reasoning in profound ways. This is just the beginning. The following 35+ sections will tear down every mechanic, myth, and methodology in the world of aim training."]})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Introduction to 3D Aim Training"}),e.jsx("p",{children:"Aim training in a 3D environment bridges the gap between 2D cursor control and actual in-game performance in first-person shooters. By simulating the 3D space, you train your brain to understand the relationship between mouse movement and camera rotation."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Why 3D Aim Training is Essential"}),e.jsx("p",{children:"Unlike 2D aim trainers, a 3D environment accounts for FOV (Field of View) and camera projection. This ensures that the muscle memory you build directly translates to your favorite competitive shooters without any weird sensitivity scaling issues."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"The Physics of 3D Aiming"}),e.jsx("p",{children:"3D aiming involves rotating a virtual camera around a pivot point (your character's head). Understanding how angular movement corresponds to physical mouse movement is the first step to mastering your aim."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Understanding Mouse Sensitivity"}),e.jsx("p",{children:"Sensitivity is the multiplier applied to your physical mouse movement. In a 3D engine, this translates to degrees of rotation per mouse count. Finding a comfortable sensitivity is crucial for consistency."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"DPI vs. In-Game Sensitivity"}),e.jsx("p",{children:"DPI (Dots Per Inch) is your hardware sensitivity, while in-game sensitivity is a software multiplier. A higher DPI with lower in-game sensitivity often results in smoother camera movement because of more frequent sensor updates."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Finding Your Perfect eDPI"}),e.jsx("p",{children:"eDPI (Effective DPI) is calculated by multiplying your DPI by your in-game sensitivity. It allows players to compare their true sensitivity regardless of their hardware settings. Pro players usually hover around an eDPI of 200 to 400 in tactical shooters."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"The Role of Muscle Memory"}),e.jsx("p",{children:"Muscle memory is technically motor learning in the brain. Through repetition, your brain optimizes the neural pathways to perform movements automatically, allowing you to focus on strategy rather than mechanics."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Flicking vs. Tracking"}),e.jsx("p",{children:"Flicking is the act of rapidly snapping your crosshair to a target, while tracking is smoothly following a moving target. Most competitive games require a mastery of both, though some favor one over the other."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Mastering Flick Shots"}),e.jsx("p",{children:"Good flicking relies on spatial awareness and motor memory. The goal is to make the initial flick as close to the target as possible, reducing the need for secondary micro-adjustments."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"The Art of Tracking Targets"}),e.jsx("p",{children:"Tracking requires predicting target movement and maintaining a smooth, consistent hand motion. It relies heavily on visual focus and reactivity rather than pure muscle memory."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Crosshair Placement Fundamentals"}),e.jsx("p",{children:"Good crosshair placement reduces the distance you need to flick. Always keep your crosshair at head height and anticipate where enemies might appear around corners."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Importance of Target Acquisition"}),e.jsx("p",{children:"Target acquisition is the speed at which you visually process a target and begin your mouse movement. Improving this phase drastically lowers your overall time-to-kill."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Reducing Reaction Time"}),e.jsx("p",{children:"While biological reaction time is largely fixed, you can improve your cognitive processing speed by reducing distractions, sleeping well, and practicing specific scenarios to make reactions more automatic."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Hand-Eye Coordination in 3D Space"}),e.jsx("p",{children:"Aiming requires tight coordination between what you see and what your hand does. 3D trainers specifically challenge this coordination by introducing depth and perspective."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"The Impact of Monitor Refresh Rate"}),e.jsx("p",{children:"A higher refresh rate (like 144Hz or 240Hz) updates the screen more frequently, giving you more recent visual information. This significantly aids in tracking fast-moving targets."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Input Lag and How to Minimize It"}),e.jsx("p",{children:"Input lag is the delay between moving your mouse and seeing the result on screen. Minimize it by using exclusive fullscreen mode, disabling V-Sync, and using raw input."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Optimal Posture for Aiming"}),e.jsx("p",{children:"A consistent posture ensures your arm rests on the desk the same way every time. This consistency is vital because changes in friction or arm angle can throw off your muscle memory."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Grip Styles: Palm, Claw, and Fingertip"}),e.jsx("p",{children:"Different grips offer different advantages. Palm is stable, fingertip offers maximum vertical agility, and claw is a hybrid. Find the one that naturally suits your hand size and mouse shape."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Choosing the Right Mousepad"}),e.jsx("p",{children:"Mousepads come in speed, control, and hybrid surfaces. A control pad offers more stopping power for precise flicks, while a speed pad allows for effortless tracking."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Mouse Weight and Aiming Performance"}),e.jsx("p",{children:"Lightweight mice reduce the inertia required to start and stop movements, generally making flicks snappier and tracking less fatiguing over long sessions."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Warming Up Before Ranked Matches"}),e.jsx("p",{children:"Always spend 10-15 minutes in a 3D aim trainer before jumping into competitive play. It wakes up your nervous system and gets your hand accustomed to the friction of your mousepad."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Structuring Your Aim Training Routine"}),e.jsx("p",{children:"A good routine should include a mix of static clicking, dynamic clicking, and smooth tracking scenarios. Don't just practice what you are already good at."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Avoiding Aim Fatigue and Burnout"}),e.jsx("p",{children:"Training for hours on end yields diminishing returns. Keep your sessions focused and limit them to 30-45 minutes to prevent physical and mental fatigue."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Overcoming Aim Plateaus"}),e.jsx("p",{children:"If you stop improving, change your routine. Try altering your sensitivity slightly for a week to force your brain to actively process aiming rather than relying entirely on autopilot."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Analyzing Your Aiming Mistakes"}),e.jsx("p",{children:"Are you consistently over-flicking or under-flicking? Recognizing these patterns allows you to actively correct them during your training sessions."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"The Psychology of Clutch Situations"}),e.jsx("p",{children:"Under pressure, players tend to tense their arms, which ruins smooth aiming. Training helps make your aim so automatic that it holds up even when adrenaline spikes."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Breathing Techniques for Steady Aim"}),e.jsx("p",{children:"Deep, rhythmic breathing keeps your heart rate down and prevents tension from building up in your shoulders and forearms, keeping your aim fluid."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Visual Focus and Target Tracking"}),e.jsx("p",{children:"Focus your eyes on the target, not your crosshair. Your brain will naturally align the center of the screen with whatever you are looking at if you have practiced enough."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Peripheral Vision in FPS Games"}),e.jsx("p",{children:"While you focus on a specific target, your peripheral vision is responsible for acquiring the next one. 3D trainers with multiple targets help widen your effective awareness."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Micro-Adjustments in Crosshair Movement"}),e.jsx("p",{children:"When a flick isn't perfectly accurate, a micro-adjustment is required. This is usually done with the fingertips and is crucial for hitting small targets at long distances."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"The Importance of Consistency"}),e.jsx("p",{children:"Aiming well once is easy; aiming well every day is hard. Consistency comes from maintaining the same hardware, posture, and practice schedule."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Translating Training to In-Game Performance"}),e.jsx("p",{children:"Remember that aim is only one part of an FPS game. Positioning, game sense, and movement mechanics are just as important to ensure your aiming skills actually yield kills."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Common Aiming Bad Habits"}),e.jsx("p",{children:"Tensing up, holding your breath, pressing the mouse button too hard, and relying on wrist movement for large turns are common habits that hold players back."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"How to Break Bad Aiming Habits"}),e.jsx("p",{children:"Breaking a habit requires conscious effort. Slow down your practice, focus on relaxation, and prioritize perfect technique over high scores until the new habit forms."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Setting Realistic Aiming Goals"}),e.jsx("p",{children:"Don't expect to become a pro in a week. Set small, incremental goals like increasing your accuracy by 2% or beating your high score on a specific scenario."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Tracking Your Aim Progress over Time"}),e.jsx("p",{children:"Keep a log of your scores and accuracy. Looking back at your progress over months is the best way to stay motivated during training plateaus."})]}),e.jsxs("section",{style:{marginBottom:"2.5rem"},children:[e.jsx("h2",{children:"Conclusion: Becoming a Better Aimer"}),e.jsx("p",{children:"Mastering 3D aim is a journey of thousands of repetitions. Stay disciplined, take care of your physical health, and use this trainer as a stepping stone to dominate in your favorite games."})]}),e.jsxs("section",{style:{marginTop:"4rem",paddingTop:"2rem",borderTop:"1px solid rgba(255,255,255,0.1)"},children:[e.jsx("h2",{style:{fontSize:"2rem",fontWeight:900,marginBottom:"2rem",color:"#fff",textAlign:"center"},children:"Frequently Asked Questions"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"1. What is 3D aim training?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"3D aim training involves practicing mouse movements in a simulated three-dimensional space, mimicking the mechanics of modern First-Person Shooters (FPS) to improve accuracy, reaction time, and muscle memory."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"2. How is it different from 2D aim trainers?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"2D trainers focus on planar cursor movement (X/Y axes). 3D trainers incorporate field of view (FOV), depth perception, and angular camera rotation, making the practice directly transferable to real FPS games."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"3. Does aim training actually build muscle memory?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:'Yes, though technically it builds "procedural memory" in the brain. Repeated, specific movements strengthen neural pathways, making your flick shots and tracking automatic and subconscious.'})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"4. What is eDPI and why does it matter?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"eDPI stands for effective Dots Per Inch. It is calculated by multiplying your mouse's hardware DPI by your in-game sensitivity. Matching eDPI across games ensures your muscle memory remains consistent."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"5. How long should I practice aim training each day?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Consistency is key. Practicing for 15 to 30 minutes daily is highly effective. Marathon sessions often lead to cognitive fatigue and reinforce bad habits through sloppy mechanics."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"6. Should I focus on speed or accuracy?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Always focus on accuracy first (aiming for 90-95% hit rate). As you build clean procedural memory, your speed will naturally increase without sacrificing your mechanical foundation."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"7. What is tracking in FPS games?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Tracking is the ability to keep your crosshair locked onto a moving target. It requires smooth, continuous mouse movements and is crucial for games with longer time-to-kill like Apex Legends."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"8. What is a flick shot?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"A flick shot is a rapid, explosive movement of the crosshair to a target, relying almost entirely on ingrained muscle memory rather than conscious visual tracking."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"9. Do aim trainers improve game sense?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"No. Aim trainers isolate mechanical skill. Game sense—understanding positioning, timing, map layouts, and enemy behavior—can only be developed by actually playing the game."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"10. Why is my aim inconsistent?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Inconsistency can stem from cognitive fatigue, poor posture, lack of warmup, inconsistent hardware setup, or simply not playing enough to solidify your mechanical skills across different scenarios."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"11. Is a higher polling rate better for aiming?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Yes, up to a point. A polling rate of 1000Hz (reporting 1000 times per second) is considered the standard for competitive play, ensuring minimal input latency between your hand and the screen."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"12. What is mouse acceleration?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:'Mouse acceleration changes your cursor speed based on how fast you move the mouse. It is generally recommended to turn this OFF (e.g., "Enhance pointer precision" in Windows) to build consistent muscle memory.'})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"13. How does FOV affect my aim?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Field of View dictates how much of the game world is visible. Higher FOV makes targets appear smaller and slower, while lower FOV makes them larger and faster. Your aim trainer FOV should match your game's FOV."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"14. Should I change my sensitivity if I perform badly?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Frequently changing your sensitivity prevents muscle memory from forming. Pick a reasonable sensitivity used by professionals in your game and stick with it for at least a few weeks before adjusting."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"15. What grip style is best for aiming?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:'There is no single "best" grip. Palm grip offers stability, fingertip grip offers precision micro-adjustments, and claw grip strikes a balance. Choose whatever feels most natural and pain-free.'})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"16. How important is a high refresh rate monitor?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Extremely important. Upgrading from 60Hz to 144Hz or 240Hz drastically reduces motion blur and input lag, making it significantly easier to track fast-moving targets visually."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"17. Will 3D aim training help me in Valorant?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Yes. While Valorant relies heavily on crosshair placement and positioning, 3D aim training sharpens your reaction time and micro-adjustments, which are vital for winning aim duels."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"18. What is crosshair placement?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Crosshair placement involves proactively aiming at the exact height and angle where an enemy's head is expected to appear. Good placement reduces the distance you need to flick."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"19. Can aiming cause physical injuries?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Yes, poor ergonomics, tense grip, and excessive marathon sessions can lead to Repetitive Strain Injuries (RSI) like carpal tunnel. Stretching and taking breaks is non-negotiable for longevity."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"20. Is arm aiming better than wrist aiming?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Generally, a combination is best. Use your arm for large sweeping movements (lower sensitivity) to protect your wrist from strain, and use your wrist/fingers for precise micro-adjustments."})]}),e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:"21. Do heavier mice make aiming harder?"}),e.jsx("p",{style:{marginTop:"1rem",color:"#9ca3af",lineHeight:"1.6"},children:"Heavier mice have more inertia, making them harder to start and stop quickly. This is why the competitive standard has shifted dramatically towards lightweight mice (under 70 grams) for optimal flick speed and control."})]})]})]})]})]})}export{w as default};
