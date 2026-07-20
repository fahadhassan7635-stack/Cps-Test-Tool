import { useEffect, useRef } from 'react';

const aimTrainerHTML = `<!DOCTYPE html>
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
"use strict";
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.setClearColor(0x1a1a1e, 1);
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
  renderer.setSize(window.innerWidth, window.innerHeight);
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
function requestPointerLock() { canvas.requestPointerLock(); }
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
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now;
  if (state.running && !state.paused) {
    if (!canShoot) { shootCooldown -= dt; if (shootCooldown <= 0) { canShoot = true; shootCooldown = 0; } }
    updateTarget(dt); updateImpacts(dt); updateGunRecoil(dt); updateMuzzleFlash(dt); updateFPS(dt);
    elTimer.textContent = formatTime(now - state.startTime - state.pauseAccum);
  }
  renderer.render(scene, camera);
}
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-resume').addEventListener('click', resumeGame);
document.getElementById('btn-restart').addEventListener('click', restartGame);
requestAnimationFrame(loop);
</script>
</body>
</html>`;

export default function SniperModePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Create a blob URL so pointer lock & audio work properly inside the iframe
    const blob = new Blob([aimTrainerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#0a0a0c' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="pointer-lock"
        title="3D Aim Trainer"
      />
    </div>
  );
}
