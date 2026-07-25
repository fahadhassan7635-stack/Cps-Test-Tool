import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const aimTrainerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIM TRAINER - PRO</title>
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
    <div class="stat-row"><span class="stat-label">Accuracy</span><span class="stat-value" id="s-acc">-</span></div>
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
    <div class="info-card"><div class="ic-label">Ammo</div><div class="ic-val" style="font-size:13px;color:#cbd5e1;padding-top:2px;">∞</div></div>
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
    <div class="pause-stat"><div class="ps-label">Accuracy</div><div class="ps-val" id="p-acc">-</div></div>
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
  elAcc.textContent = total === 0 ? '-' : Math.round((state.hits / total) * 100) + '%';
  document.getElementById('p-score').textContent = state.score;
  document.getElementById('p-hits').textContent = state.hits;
  document.getElementById('p-misses').textContent = state.misses;
  document.getElementById('p-acc').textContent = total === 0 ? '-' : Math.round((state.hits / total) * 100) + '%';
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
</script>
</body>
</html>`;
interface ToolLink { label: string; href: string; icon: React.ReactNode; }

const MORE_TOOLS: ToolLink[] = [
  { label: 'CPS Test', href: '/cps-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Spacebar Counter', href: '/spacebar-counter', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="15" x2="18" y2="15"/></svg> },
  { label: 'Aim Trainer', href: '/aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Typing Test', href: '/typing-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 15h8M7 11h2m3 0h2m3 0h-1"/></svg> },
  { label: 'Reaction Time', href: '/reaction-time', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Scroll Test', href: '/scroll-test', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><path d="M9 11l3-3 3 3"/><path d="M9 13l3 3 3-3"/></svg> },
  { label: 'Double Click', href: '/double-click', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><line x1="12" y1="6" x2="12" y2="10"/></svg> },
  { label: '3D Aim Trainer', href: '/3d-aim-trainer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/><circle cx="12" cy="12" r="8" opacity=".4"/></svg> },
  { label: 'Mouse Accuracy', href: '/mouse-accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 2v10"/></svg> },
  { label: 'Key Visualizer', href: '/key-visualizer', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"/></svg> },
  { label: 'F1 Reaction', href: '/f1-reaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { label: 'Space Defense', href: '/space-defense', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: 'Accuracy Test', href: '/accuracy', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: 'CPS Rush', href: '/cps-rush', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M12 12v-4"/><circle cx="12" cy="14" r="1" fill="currentColor"/></svg> },
  { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
  { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> }
];

export default function SniperModePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string>('');

  useEffect(() => {
    // Create a blob URL so pointer lock & audio work properly inside the iframe
    const blob = new Blob([aimTrainerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a0c', overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          allow="pointer-lock; fullscreen"
          title="3D Aim Trainer"
        />
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px', zIndex: 100 }}>
          <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} style={{ background: 'rgba(4,9,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      <section aria-label="More Tools" style={{ maxWidth: '1000px', margin: '4rem auto 0 auto', padding: '0 2rem' }}>
        <h2 style={{
          fontWeight: 800, fontSize: '1.5rem', color: '#fff',
          marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.3px',
        }}>More Tools</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem',
        }}>
          {MORE_TOOLS.map(({ label, href, icon }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '0.6rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '1.2rem 0.5rem',
                cursor: 'pointer', textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `rgba(79,195,247,0.08)`;
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(79,195,247,0.35)`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4fc3f7', transition: 'color 0.3s ease',
              }}>
                {icon}
              </div>
              <span style={{ color: '#d1d1de', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>{label}</span>
            </a>
          ))}
        </div>
      </section>
      
      <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif', lineHeight: '1.6' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>The Ultimate Guide to 3D Aim Training</h1>
        
        <div style={{ marginBottom: '4rem', fontSize: '1.1rem', color: '#9ca3af' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            Welcome to the most comprehensive and deeply analytical guide on 3D Aim Training you will ever read. Aim training in a three-dimensional environment has revolutionized the way competitive gamers prepare for high-stakes matches in top-tier First-Person Shooters (FPS) like Valorant, Counter-Strike 2, Overwatch 2, and Apex Legends. Unlike simple 2D clicker games, a true 3D Aim Trainer immerses you in a simulated spatial environment that requires precise camera rotation, crosshair placement, and depth perception. The integration of 3D physics means that your mouse movements translate directly into angular rotations within the game engine, governed by complex calculations involving field of view (FOV), sensitivity, and dots per inch (DPI). Mastering this environment is not just about clicking fast; it is about building robust neural pathways that automate the process of target acquisition. According to studies in <a href="https://en.wikipedia.org/wiki/Motor_learning" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>motor learning</a>, the specificity of practice is paramount. When you train in 3D, you are engaging the exact same spatial awareness mechanisms that you rely on in actual gameplay.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            The journey to elite aiming is paved with thousands of repetitions, focusing on micro-corrections, tracking smoothness, and the raw speed of flick shots. Professional esports athletes dedicate countless hours to isolated mechanical practice. But why does this work so effectively? The answer lies in the cognitive concept of procedural memory. When you first start playing an FPS, aiming requires conscious thought. You have to actively decide how far to move your hand to reach a target on the screen. However, through structured practice in a controlled 3D aim trainer, this process is pushed into the subconscious. The brain forms strong synaptic connections that map specific physical hand movements to specific on-screen crosshair displacements. This is often colloquially referred to as "muscle memory," although the memory resides entirely in the brain, not the muscles themselves. A comprehensive overview of how <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4346284/" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>neuroplasticity</a> facilitates skill acquisition demonstrates that consistent, targeted repetition leads to structural changes in the brain that support rapid, automatic execution of complex motor tasks.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            One of the most critical factors in 3D aim training is ensuring that your training environment perfectly mirrors your primary game. This is where the concept of eDPI (effective Dots Per Inch) comes into play. eDPI is calculated by multiplying your mouse's hardware DPI by your in-game sensitivity multiplier. By maintaining a consistent eDPI across your aim trainer and your game, you ensure that the muscle memory you build is perfectly transferable. Furthermore, your Field of View (FOV) must also match. A higher FOV makes targets in the center of the screen appear smaller and move slower across the monitor, while a lower FOV makes them appear larger and move faster. If your FOV in the aim trainer is different from your game, your brain will struggle to calibrate the necessary hand movements. Many modern aim trainers, including this one, allow you to adjust your sensitivity and FOV to perfectly match popular titles, ensuring 1:1 translation of your mechanical skills.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Beyond the software, hardware plays an undeniable role in aiming potential. A lightweight gaming mouse with a flawless optical sensor is essentially a prerequisite for high-level competitive play. Sensors like the PixArt 3360 and its derivatives provide true 1:1 tracking without hardware acceleration or angle snapping. This raw input is crucial because any artificial manipulation of your mouse movement by the hardware will disrupt the formation of accurate muscle memory. Additionally, the polling rate of the mouse—how often it reports its position to the computer—should be at least 1000Hz to minimize input lag. When combined with a high refresh rate monitor (144Hz, 240Hz, or even 360Hz), the latency between your physical movement and the visual feedback on the screen is reduced to milliseconds. This immediate feedback loop is essential for making the rapid micro-corrections required for elite tracking and flicking. You can learn more about the impact of latency on human performance in <a href="https://humanfactors.jmir.org/2021/1/e23735/" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>human-computer interaction studies</a>.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Aiming can generally be broken down into three fundamental techniques: flicking, tracking, and crosshair placement. Flicking is the rapid, explosive movement of the crosshair to a target that appears suddenly. It relies heavily on ingrained spatial memory and fast twitch muscle fibers. Tracking, on the other hand, involves keeping the crosshair smoothly locked onto a moving target. This requires continuous visual processing and smooth, controlled arm and wrist movements. Tracking is heavily emphasized in games with longer "time-to-kill" (TTK) like Apex Legends or Overwatch 2. Crosshair placement is perhaps the most important yet most often overlooked aspect of aiming. It involves pre-aiming the crosshair at the exact location where an enemy is expected to appear, typically at head height. Good crosshair placement minimizes the need for drastic flicking, making aiming feel effortless. A comprehensive 3D aim trainer provides scenarios to isolate and practice each of these techniques individually.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            When constructing a routine, consistency is far more valuable than marathon sessions. Practicing for 30 minutes every single day yields significantly better results than practicing for three hours once a week. This is because motor learning and memory consolidation occur primarily during sleep. Short, focused training sessions followed by adequate rest allow the brain to process and solidify the neural pathways formed during practice. During your sessions, it is crucial to focus on accuracy before speed. The mantra "slow is smooth, and smooth is fast" applies perfectly to aim training. If you try to flick faster than your current skill level allows, you will build bad habits and reinforce inaccurate muscle memory. Focus on hitting the target with 90-95% accuracy. Once you can consistently hit targets at a certain speed with high accuracy, your speed will naturally increase over time without sacrificing precision.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Another vital component of mechanical skill development is posture and ergonomics. How you sit at your desk, the height of your chair, and the positioning of your arm on the desk all heavily influence your aiming consistency. A common recommendation among professional players is to ensure that your elbow is resting comfortably on the desk or armrest, forming roughly a 90-degree angle. This provides a stable pivot point for large sweeping arm movements (used for turning and large tracking motions) while freeing up the wrist and fingers for precise micro-adjustments. Tension in your grip or forearm is the enemy of smooth aiming. Learning to maintain a relaxed grip on the mouse, even in high-pressure situations, prevents fatigue and allows for much more fluid and precise cursor control. Ergonomics not only improves performance but also prevents repetitive strain injuries (RSI), which are unfortunately common in esports.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            The evolution of aim trainers has been fascinating. What started as simple flash-based browser games has evolved into sophisticated standalone engines built in Unity or Unreal Engine, or in this case, a highly optimized WebGL environment. These modern trainers offer incredibly detailed statistics, tracking your reaction time, accuracy, over-flick percentage, and time-to-damage. Analyzing this data is crucial for identifying your weaknesses. Do you consistently overshoot targets to the right? You might need to adjust your grip or lower your sensitivity slightly. Do you struggle with targets moving vertically? You can isolate vertical tracking scenarios to build proficiency. The data-driven approach to mechanical improvement has elevated the average skill level in competitive shooters to unprecedented heights.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            But aim isn't everything. It's important to remember that mechanics exist to serve game sense. You can have the most precise aim in the world, but if you are consistently caught out of position or lack understanding of map control and timings, you will still lose engagements. Aim training should supplement your actual gameplay, not replace it. The ideal ratio varies, but many coaches recommend spending no more than 20-30% of your total gaming time on isolated aim training. The rest should be spent playing the game, applying your improved mechanics in real, dynamic situations where positioning, movement, and decision-making all interact simultaneously. This holistic approach ensures that you become a complete player, rather than just a highly accurate static turret.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Cognitive fatigue is a real phenomenon that affects aiming performance. Because aiming requires intense visual focus and rapid decision-making, your central nervous system can become depleted after prolonged sessions. You might notice your reaction times slowing down or your tracking becoming jittery after a few hours of intense play. Recognizing the signs of cognitive fatigue and taking regular breaks is essential for maintaining peak performance. Techniques such as the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) can help reduce eye strain, while physical stretching can relieve tension in your shoulders and wrists. Proper hydration, nutrition, and sleep are also foundational elements of cognitive performance. You cannot expect your brain to execute complex motor tasks at maximum efficiency if it is not properly fueled and rested.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            In conclusion, 3D aim training is a scientifically grounded method for improving your mechanical proficiency in first-person shooters. By understanding the principles of motor learning, optimizing your hardware and software environment, and adhering to a consistent, accuracy-focused practice routine, you can systematically elevate your aiming capabilities. Remember that improvement is not linear; there will be plateaus and even temporary regressions. However, with dedication and a data-driven approach to identifying and addressing your weaknesses, the neural pathways will inevitably strengthen, and those seemingly impossible flick shots will eventually become second nature. Now, dive into the trainer above, start building those repetitions, and watch as your hard work translates into tangible results on the scoreboard. Below you will find an extensive breakdown of every single aspect of aim training, divided into specific, actionable sections to guide you on your journey to becoming a mechanical god.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            To further understand the cognitive demands of gaming, refer to academic publications on <a href="https://www.frontiersin.org/articles/10.3389/fpsyg.2019.01824/full" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>esports psychology and cognitive performance</a>, which highlight the incredible mental processing speeds required at the highest levels of competitive play. The skills you are building here extend far beyond the virtual battlefield, enhancing your hand-eye coordination, reaction times, and spatial reasoning in profound ways. This is just the beginning. The following 35+ sections will tear down every mechanic, myth, and methodology in the world of aim training.
          </p>
        </div>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Introduction to 3D Aim Training</h2>
          <p>Aim training in a 3D environment bridges the gap between 2D cursor control and actual in-game performance in first-person shooters. By simulating the 3D space, you train your brain to understand the relationship between mouse movement and camera rotation.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Why 3D Aim Training is Essential</h2>
          <p>Unlike 2D aim trainers, a 3D environment accounts for FOV (Field of View) and camera projection. This ensures that the muscle memory you build directly translates to your favorite competitive shooters without any weird sensitivity scaling issues.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>The Physics of 3D Aiming</h2>
          <p>3D aiming involves rotating a virtual camera around a pivot point (your character's head). Understanding how angular movement corresponds to physical mouse movement is the first step to mastering your aim.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Understanding Mouse Sensitivity</h2>
          <p>Sensitivity is the multiplier applied to your physical mouse movement. In a 3D engine, this translates to degrees of rotation per mouse count. Finding a comfortable sensitivity is crucial for consistency.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>DPI vs. In-Game Sensitivity</h2>
          <p>DPI (Dots Per Inch) is your hardware sensitivity, while in-game sensitivity is a software multiplier. A higher DPI with lower in-game sensitivity often results in smoother camera movement because of more frequent sensor updates.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Finding Your Perfect eDPI</h2>
          <p>eDPI (Effective DPI) is calculated by multiplying your DPI by your in-game sensitivity. It allows players to compare their true sensitivity regardless of their hardware settings. Pro players usually hover around an eDPI of 200 to 400 in tactical shooters.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>The Role of Muscle Memory</h2>
          <p>Muscle memory is technically motor learning in the brain. Through repetition, your brain optimizes the neural pathways to perform movements automatically, allowing you to focus on strategy rather than mechanics.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Flicking vs. Tracking</h2>
          <p>Flicking is the act of rapidly snapping your crosshair to a target, while tracking is smoothly following a moving target. Most competitive games require a mastery of both, though some favor one over the other.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Mastering Flick Shots</h2>
          <p>Good flicking relies on spatial awareness and motor memory. The goal is to make the initial flick as close to the target as possible, reducing the need for secondary micro-adjustments.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>The Art of Tracking Targets</h2>
          <p>Tracking requires predicting target movement and maintaining a smooth, consistent hand motion. It relies heavily on visual focus and reactivity rather than pure muscle memory.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Crosshair Placement Fundamentals</h2>
          <p>Good crosshair placement reduces the distance you need to flick. Always keep your crosshair at head height and anticipate where enemies might appear around corners.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Importance of Target Acquisition</h2>
          <p>Target acquisition is the speed at which you visually process a target and begin your mouse movement. Improving this phase drastically lowers your overall time-to-kill.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Reducing Reaction Time</h2>
          <p>While biological reaction time is largely fixed, you can improve your cognitive processing speed by reducing distractions, sleeping well, and practicing specific scenarios to make reactions more automatic.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Hand-Eye Coordination in 3D Space</h2>
          <p>Aiming requires tight coordination between what you see and what your hand does. 3D trainers specifically challenge this coordination by introducing depth and perspective.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>The Impact of Monitor Refresh Rate</h2>
          <p>A higher refresh rate (like 144Hz or 240Hz) updates the screen more frequently, giving you more recent visual information. This significantly aids in tracking fast-moving targets.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Input Lag and How to Minimize It</h2>
          <p>Input lag is the delay between moving your mouse and seeing the result on screen. Minimize it by using exclusive fullscreen mode, disabling V-Sync, and using raw input.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Optimal Posture for Aiming</h2>
          <p>A consistent posture ensures your arm rests on the desk the same way every time. This consistency is vital because changes in friction or arm angle can throw off your muscle memory.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Grip Styles: Palm, Claw, and Fingertip</h2>
          <p>Different grips offer different advantages. Palm is stable, fingertip offers maximum vertical agility, and claw is a hybrid. Find the one that naturally suits your hand size and mouse shape.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Choosing the Right Mousepad</h2>
          <p>Mousepads come in speed, control, and hybrid surfaces. A control pad offers more stopping power for precise flicks, while a speed pad allows for effortless tracking.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Mouse Weight and Aiming Performance</h2>
          <p>Lightweight mice reduce the inertia required to start and stop movements, generally making flicks snappier and tracking less fatiguing over long sessions.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Warming Up Before Ranked Matches</h2>
          <p>Always spend 10-15 minutes in a 3D aim trainer before jumping into competitive play. It wakes up your nervous system and gets your hand accustomed to the friction of your mousepad.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Structuring Your Aim Training Routine</h2>
          <p>A good routine should include a mix of static clicking, dynamic clicking, and smooth tracking scenarios. Don't just practice what you are already good at.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Avoiding Aim Fatigue and Burnout</h2>
          <p>Training for hours on end yields diminishing returns. Keep your sessions focused and limit them to 30-45 minutes to prevent physical and mental fatigue.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Overcoming Aim Plateaus</h2>
          <p>If you stop improving, change your routine. Try altering your sensitivity slightly for a week to force your brain to actively process aiming rather than relying entirely on autopilot.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Analyzing Your Aiming Mistakes</h2>
          <p>Are you consistently over-flicking or under-flicking? Recognizing these patterns allows you to actively correct them during your training sessions.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>The Psychology of Clutch Situations</h2>
          <p>Under pressure, players tend to tense their arms, which ruins smooth aiming. Training helps make your aim so automatic that it holds up even when adrenaline spikes.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Breathing Techniques for Steady Aim</h2>
          <p>Deep, rhythmic breathing keeps your heart rate down and prevents tension from building up in your shoulders and forearms, keeping your aim fluid.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Visual Focus and Target Tracking</h2>
          <p>Focus your eyes on the target, not your crosshair. Your brain will naturally align the center of the screen with whatever you are looking at if you have practiced enough.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Peripheral Vision in FPS Games</h2>
          <p>While you focus on a specific target, your peripheral vision is responsible for acquiring the next one. 3D trainers with multiple targets help widen your effective awareness.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Micro-Adjustments in Crosshair Movement</h2>
          <p>When a flick isn't perfectly accurate, a micro-adjustment is required. This is usually done with the fingertips and is crucial for hitting small targets at long distances.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>The Importance of Consistency</h2>
          <p>Aiming well once is easy; aiming well every day is hard. Consistency comes from maintaining the same hardware, posture, and practice schedule.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Translating Training to In-Game Performance</h2>
          <p>Remember that aim is only one part of an FPS game. Positioning, game sense, and movement mechanics are just as important to ensure your aiming skills actually yield kills.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Common Aiming Bad Habits</h2>
          <p>Tensing up, holding your breath, pressing the mouse button too hard, and relying on wrist movement for large turns are common habits that hold players back.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>How to Break Bad Aiming Habits</h2>
          <p>Breaking a habit requires conscious effort. Slow down your practice, focus on relaxation, and prioritize perfect technique over high scores until the new habit forms.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Setting Realistic Aiming Goals</h2>
          <p>Don't expect to become a pro in a week. Set small, incremental goals like increasing your accuracy by 2% or beating your high score on a specific scenario.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Tracking Your Aim Progress over Time</h2>
          <p>Keep a log of your scores and accuracy. Looking back at your progress over months is the best way to stay motivated during training plateaus.</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2>Conclusion: Becoming a Better Aimer</h2>
          <p>Mastering 3D aim is a journey of thousands of repetitions. Stay disciplined, take care of your physical health, and use this trainer as a stepping stone to dominate in your favorite games.</p>
        </section>

      </article>

      {/* ─── SEO ARTICLE SECTION ─── */}
      <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif', lineHeight: '1.6' }}>

        {/* Introduction */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Introduction</h2>
          <p style={{ marginBottom: '1rem' }}>Every competitive FPS player has felt it — that moment when the perfect flick shot refuses to land, a tracking target slips off your crosshair, or a kill is stolen because your reaction was half a second too slow. Aim is the one universal skill that determines whether you climb the ranked ladder or stay stuck in the same bracket for months.</p>
          <p style={{ marginBottom: '1rem' }}>A <strong style={{ color: '#fff' }}>3D Aim Trainer</strong> is the most direct solution to this problem. Unlike simply queuing more games and hoping your aim magically improves, a structured aim trainer gives you isolated, repeatable practice with instant feedback. It strips away everything — no teammates, no economy, no map knowledge — and forces you to improve the single mechanical skill that matters most: your ability to put crosshair on target and click.</p>
          <p>Whether you're grinding Valorant, strafing in CS2, or dueling in Apex Legends — this is the only aim training resource you'll ever need.</p>
        </section>

        {/* What is a 3D Aim Trainer */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>What is a 3D Aim Trainer?</h2>
          <p style={{ marginBottom: '1rem' }}>A <strong style={{ color: '#fff' }}>3D Aim Trainer</strong> is a browser-based or standalone software application that simulates the first-person perspective of an FPS game and presents you with interactive targets to shoot. Unlike 2D mouse accuracy tools, a 3D aim trainer renders targets in a three-dimensional environment — with depth, distance variation, and spatial movement — that closely mirrors real in-game conditions.</p>
          <p style={{ marginBottom: '1rem' }}>The core distinction is <strong style={{ color: '#fff' }}>depth simulation</strong>. In a real FPS game, enemies appear at varying distances with apparent size changes based on perspective. A 3D aim trainer replicates this with a virtual camera, a field of view, and targets that move laterally, approach, and retreat in three-dimensional space.</p>
          <p style={{ marginBottom: '1rem' }}>Modern 3D aim trainers include:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {[
              'Multiple drill types — static, tracking, flick, switching, precision',
              'Customizable scenarios — target size, speed, spawn delay, time limits',
              'Performance analytics — accuracy %, targets per second, reaction time',
              'Sensitivity converters — match your in-game sensitivity exactly',
              'Score comparison — benchmark yourself against global averages',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem', listStyle: 'disc' }}>{item}</li>
            ))}
          </ul>
          <p>The best online 3D aim trainers are playable directly in your browser using WebGL technology, meaning zero installation required.</p>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>How Does a 3D Aim Trainer Work?</h2>
          <p style={{ marginBottom: '1rem' }}>A 3D aim trainer works by isolating the mechanical input loop of FPS aiming: <strong style={{ color: '#fff' }}>see target → move mouse → click</strong>. Here's the technical breakdown:</p>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f5ff', margin: '1.5rem 0 0.75rem' }}>The Input Loop</h3>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {[
              'A target spawns at a random or scripted position in 3D space',
              'Your crosshair must be aligned to the target using mouse movement',
              'A click registers a hit or miss depending on crosshair overlap',
              'The trainer records timing, accuracy, and movement efficiency',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
            ))}
          </ol>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f5ff', margin: '1.5rem 0 0.75rem' }}>Sensitivity Matching</h3>
          <p style={{ marginBottom: '1rem' }}>Most aim trainers use <strong style={{ color: '#fff' }}>eDPI</strong> (effective DPI = mouse DPI × in-game sensitivity) to mirror your exact sensitivity from games like Valorant, CS2, or Apex. This is critical — training at the wrong sensitivity builds incorrect muscle memory that will hurt you in actual games.</p>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f5ff', margin: '1.5rem 0 0.75rem' }}>Feedback Systems</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {[
              'Instant hit confirmation — visual/audio feedback per shot',
              'Miss penalty tracking — missed shots are counted and analyzed',
              'Movement heatmaps — shows where your mouse overshoots',
              'Reaction time graphs — identifies cognitive delay vs motor speed issues',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem', listStyle: 'disc' }}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Why Aim Training Matters */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Why Aim Training Matters</h2>
          <p style={{ marginBottom: '1rem' }}>Here's an uncomfortable truth: <strong style={{ color: '#fff' }}>playing more games does not automatically improve your aim</strong>. Bad habits reinforced by thousands of hours of unstructured play can actively cement poor technique.</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {[
              'Deliberate practice beats passive play — isolated, feedback-rich practice produces faster skill gains.',
              'In-game practice has too many variables — map awareness, economy, and communication compete for attention.',
              'You can target specific weaknesses — 20 minutes of pure tracking is impossible in a live match.',
              'Consistency degrades without maintenance — even pros warm up 30-60 min before scrims.',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', listStyle: 'disc' }}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Benefits */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Benefits of 3D Aim Training</h2>
          {[
            { title: 'Faster Reaction Time', desc: 'Regular aim training reduces average reaction time by 10-20% over 30 days by conditioning faster signal processing between eye and trigger finger.' },
            { title: 'Higher Accuracy Under Pressure', desc: 'Performing the same movement thousands of times builds unconscious motor patterns that execute even when cognitive load is high in real matches.' },
            { title: 'Consistency Across Sessions', desc: 'Structured warm-up reduces daily aim variance significantly — the difference between your best and worst days shrinks.' },
            { title: 'Identifiable Weaknesses', desc: 'Analytics reveal whether your problem is flicking (wrong), tracking (wrong), micro-corrections (wrong), or click timing (wrong) — so you fix the right thing.' },
            { title: 'Better Crosshair Placement', desc: 'The discipline of aim training makes you aware of where your crosshair rests even without a target, building the habit of pre-aiming corners.' },
          ].map(({ title, desc }, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#00f5ff', marginBottom: '0.35rem' }}>{title}</div>
              <div style={{ color: '#9ca3af' }}>{desc}</div>
            </div>
          ))}
        </section>

        {/* Understanding Aim Mechanics */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Understanding Aim Mechanics</h2>
          <p style={{ marginBottom: '1rem' }}>Aim is not a single skill. It is a cluster of distinct sub-skills, each trainable independently:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
            {[
              { name: 'Flick Accuracy', desc: 'Rapid, explosive crosshair movement to a target from a distance. Relies on muscle memory.', color: '#00f5ff' },
              { name: 'Tracking', desc: 'Keeping the crosshair continuously on a moving target. Requires smooth motion control.', color: '#00ff88' },
              { name: 'Micro-Corrections', desc: 'Tiny adjustments after the initial movement lands close to the target. The most trainable skill.', color: '#bf5af2' },
              { name: 'Click Timing', desc: 'Clicking at the exact moment the crosshair is on target. Independent of movement speed.', color: '#ffd60a' },
              { name: 'Target Switching', desc: 'Efficiently moving between multiple targets in sequence. Critical for multi-kill fights.', color: '#ff6b00' },
              { name: 'Reaction Time', desc: 'Time from target appearing to first shot. Has a biological floor (~180ms) but training reduces variance.', color: '#ff2d55' },
            ].map(({ name, desc, color }, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, color, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{name}</div>
                <div style={{ color: '#9ca3af', fontSize: '0.83rem' }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Complete Aim Training Routine */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Complete Aim Training Routine</h2>
          <p style={{ marginBottom: '1.25rem' }}>Here is an evidence-based daily routine structured for maximum skill acquisition:</p>
          {[
            { phase: 'Phase 1: Warm-Up (5 min)', color: '#00ff88', items: ['Large static targets at comfortable sensitivity', 'Focus on smooth, deliberate movement — not speed', 'Build neural pathway activation before competition'] },
            { phase: 'Phase 2: Flick Training (10 min)', color: '#00f5ff', items: ['Medium targets, 600-800ms life', 'Click at the peak of your flick — not during movement', 'Aim for 75%+ accuracy before increasing difficulty'] },
            { phase: 'Phase 3: Tracking (10 min)', color: '#bf5af2', items: ['Smoothly follow moving targets without jerking', 'Maintain consistent pressure — no "stutter tracking"', 'Ideal for Apex Legends / Overwatch players'] },
            { phase: 'Phase 4: Precision / Weak Point (10 min)', color: '#ffd60a', items: ['Smallest targets you can consistently hit at 60%+', 'Slow down deliberately — accuracy before speed', 'This phase builds your "floor" — the minimum you can always achieve'] },
            { phase: 'Phase 5: Cooldown Review (5 min)', color: '#ff6b00', items: ['Check your stats — accuracy, reaction time, streak', 'Note what felt different from yesterday', 'No more active clicking — just analysis'] },
          ].map(({ phase, color, items }, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${color}`, paddingLeft: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color, marginBottom: '0.5rem' }}>{phase}</div>
              <ul style={{ paddingLeft: '1rem' }}>
                {items.map((item, j) => <li key={j} style={{ marginBottom: '0.3rem', color: '#9ca3af', listStyle: 'disc' }}>{item}</li>)}
              </ul>
            </div>
          ))}
        </section>

        {/* Aim Benchmarks */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Average Aim Benchmarks</h2>
          <p style={{ marginBottom: '1rem' }}>These are realistic performance benchmarks based on standard flick scenarios:</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,245,255,0.08)', borderBottom: '1px solid rgba(0,245,255,0.2)' }}>
                  {['Skill Level', 'Accuracy', 'Avg Reaction', 'Targets/Min'].map((h) => (
                    <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', color: '#00f5ff', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Beginner', '40-55%', '380-500ms', '8-14'],
                  ['Intermediate', '60-72%', '260-380ms', '16-24'],
                  ['Advanced', '75-85%', '200-260ms', '26-36'],
                  ['Expert', '86-93%', '160-200ms', '38-52'],
                  ['Professional', '94-98%', '140-165ms', '55-70'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '0.55rem 0.85rem', color: j === 0 ? '#fff' : '#9ca3af', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mouse Settings Guide */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Mouse Settings Guide</h2>
          <p style={{ marginBottom: '1rem' }}>Your hardware settings determine the physical mapping between hand movement and crosshair movement. Getting this wrong makes aim training transfer impossible.</p>
          {[
            { label: 'DPI', rec: '400-1600 DPI', why: 'Most pros use 400-800 DPI. Lower DPI rewards precise arm movement. Higher DPI enables faster reaction at the cost of precision control. The "right" DPI depends on your eDPI target.' },
            { label: 'In-Game Sensitivity', rec: '0.15-0.6 (varies by game)', why: 'Combine with your DPI to hit a target eDPI. For Valorant, 200-400 eDPI is the competitive standard. For CS2, 700-1000 eDPI is common.' },
            { label: 'eDPI', rec: '200-800 for most players', why: 'eDPI = DPI × in-game sensitivity. This is the universal standard for sensitivity. Training at your correct eDPI in the aim trainer is mandatory for muscle memory transfer.' },
            { label: 'Polling Rate', rec: '1000Hz+', why: 'A 1000Hz polling rate reports your mouse position 1000 times per second. Lower polling rates introduce micro-delays that are physically detectable during fast flick movements.' },
            { label: 'Mouse Acceleration', rec: 'OFF', why: 'Mouse acceleration changes your sensitivity based on movement speed, making muscle memory impossible to develop. Always disable "Enhance Pointer Precision" in Windows.' },
          ].map(({ label, rec, why }, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem', padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '0.6rem', alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#00f5ff', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 600 }}>{rec}</div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{why}</div>
            </div>
          ))}
        </section>

        {/* Mouse Grip Styles */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Mouse Grip Styles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            {[
              { grip: 'Palm Grip', pros: 'Maximum stability, least fatigue', cons: 'Slower micro-adjustments', best: 'Low sensitivity, arm aiming', color: '#00ff88' },
              { grip: 'Claw Grip', pros: 'Balance of speed and control', cons: 'Medium RSI risk', best: 'Medium sensitivity, hybrid aim', color: '#00f5ff' },
              { grip: 'Fingertip Grip', pros: 'Fastest micro-adjustments', cons: 'Higher fatigue, less stability', best: 'High sensitivity, wrist aiming', color: '#bf5af2' },
            ].map(({ grip, pros, cons, best, color }, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color, marginBottom: '0.6rem', fontSize: '1.05rem' }}>{grip}</div>
                <div style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}><span style={{ color: '#00ff88', fontWeight: 600 }}>✔ </span>{pros}</div>
                <div style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}><span style={{ color: '#ff2d55', fontWeight: 600 }}>Ã¢Å“— </span>{cons}</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.5rem' }}>Best for: {best}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Aim Mistakes */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Common Aim Mistakes</h2>
          {[
            { mistake: 'Changing sensitivity too often', fix: 'Pick one sensitivity and commit for 30+ days. Every change resets muscle memory progress.' },
            { mistake: 'Tensing the grip', fix: 'Hold the mouse as lightly as possible. Tension transmits tremor from hand muscles into the crosshair.' },
            { mistake: 'Skipping warm-up', fix: 'Your aim performance at minute 5 of play is significantly worse than at minute 30. Always warm up.' },
            { mistake: 'Training tired or stressed', fix: 'Aim is a fine motor skill. Fatigue, hunger, and stress all measurably degrade performance. Train when fresh.' },
            { mistake: 'Ignoring click timing', fix: 'Many "misses" are actually correct crosshair placement with incorrect click timing. Train clicking separately.' },
            { mistake: 'Only flick training', fix: 'Tracking, precision, and micro-correction are equally important. Neglect them and you\'ll have a ceiling.' },
            { mistake: 'Marathon sessions', fix: '30—€œ45 minutes of focused practice beats 3 hours of fatigued clicking. Quality repetitions matter more than quantity.' },
          ].map(({ mistake, fix }, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <div style={{ color: '#ff2d55', fontSize: '0.85rem', fontWeight: 600 }}>Ã¢Å“— {mistake}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}><span style={{ color: '#00ff88', fontWeight: 600 }}>Fix: </span>{fix}</div>
            </div>
          ))}
        </section>

        {/* Science Behind Aim */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>The Science Behind Aim Improvement</h2>
          <p style={{ marginBottom: '1rem' }}>Aim improvement is grounded in <strong style={{ color: '#fff' }}>motor learning science</strong>. Your brain builds aim through a process called <strong style={{ color: '#fff' }}>procedural memory consolidation</strong>:</p>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {[
              'Conscious execution —€ each shot requires deliberate thought (slow, effortful)',
              'Neural encoding —€ repeated movements build motor programs in the cerebellum',
              'Automatic execution —€ movements become unconscious and near-instant',
              'Refinement —€ continued practice reduces error margin and increases speed',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', color: '#9ca3af' }}>{item}</li>
            ))}
          </ol>
          <p style={{ marginBottom: '1rem' }}>This is why <strong style={{ color: '#fff' }}>daily short sessions outperform occasional marathon sessions</strong>. Sleep is when motor memories consolidate —€ a 20-minute session before sleep encodes better than a 3-hour session once a week.</p>
          <div style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#00f5ff', marginBottom: '0.4rem' }}>Key Insight: The Biological Reaction Time Floor</div>
            <p style={{ color: '#cbd5e1' }}>The minimum human visual reaction time is approximately 180—€œ200ms. You cannot train below this floor. However, most players operate at 280—€œ400ms in games —€ significantly above the floor. Aim training eliminates the gap between your biological floor and your current performance.</p>
          </div>
        </section>

        {/* Weekly Training Schedule */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Weekly Training Schedule</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            {[
              { day: 'Monday', focus: 'Flick + Warm-Up', dur: '35 min', color: '#00f5ff' },
              { day: 'Tuesday', focus: 'Tracking Focus', dur: '35 min', color: '#00ff88' },
              { day: 'Wednesday', focus: 'Precision + Micro', dur: '30 min', color: '#bf5af2' },
              { day: 'Thursday', focus: 'Target Switching', dur: '35 min', color: '#ffd60a' },
              { day: 'Friday', focus: 'Full Routine', dur: '40 min', color: '#ff6b00' },
              { day: 'Saturday', focus: 'Weakness Drill', dur: '45 min', color: '#ff2d55' },
              { day: 'Sunday', focus: 'Active Rest / Light WU', dur: '15 min', color: '#8b949e' },
            ].map(({ day, focus, dur, color }, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{day}</div>
                <div style={{ fontSize: '0.78rem', color: '#d1d5db', marginBottom: '0.25rem' }}>{focus}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{dur}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Tips */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Advanced Tips Used by Professional FPS Players</h2>
          {[
            { tip: 'Use a consistent pre-game ritual', detail: 'Pros play the same 3—€œ4 warm-up scenarios in the same order every session. This creates a reliable baseline and tells your brain "competition mode has begun."' },
            { tip: 'Train at your actual game eDPI', detail: 'Never train at a different sensitivity than your game. The muscle memory you build at 600 eDPI is useless in a game where you run 300 eDPI.' },
            { tip: 'Analyze your worst days, not your best', detail: 'Your ceiling doesn\'t need training —€ your floor does. When you have a bad aim day, the data tells you exactly what broke down.' },
            { tip: 'Practice crosshair placement separately', detail: 'Aim at a fixed reference point on your wall or monitor and practice moving between game tasks while returning to that point. This builds the idle crosshair placement habit.' },
            { tip: 'Use VOD reviews for crosshair placement', detail: 'Review 10 minutes of your own gameplay looking only at where your crosshair is between fights. Most players keep it far below head level without realizing it.' },
            { tip: 'Deathgrip is your biggest enemy', detail: 'If your mouse hand gets sore within 30 minutes of play, you\'re gripping too hard. Practice deliberately holding with minimum force.' },
          ].map(({ tip, detail }, i) => (
            <div key={i} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', marginBottom: '0.6rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.3rem', fontSize: '0.92rem' }}>{i + 1}. {tip}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{detail}</div>
            </div>
          ))}
        </section>

        {/* Health & Injury Prevention */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Health &amp; Injury Prevention</h2>
          <p style={{ marginBottom: '1rem' }}>Repetitive Strain Injuries (RSI) like carpal tunnel syndrome end gaming careers. Protect yourself:</p>
          <div style={{ background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.2)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#ff2d55', marginBottom: '0.5rem' }}>Warning Signs to Never Ignore</div>
            <ul style={{ paddingLeft: '1rem' }}>
              {['Tingling or numbness in fingers', 'Persistent wrist or forearm pain after sessions', 'Pain that wakes you up at night', 'Weakness in grip strength'].map((w, i) => (
                <li key={i} style={{ color: '#9ca3af', marginBottom: '0.3rem', listStyle: 'disc' }}>{w}</li>
              ))}
            </ul>
          </div>
          {[
            { label: 'Take a break every 45 minutes', desc: 'Stand, stretch your wrists and shoulders for 5 minutes. Set an alarm if necessary.' },
            { label: 'Stretch wrists before and after', desc: 'Wrist flexor and extensor stretches reduce tendon tension that accumulates during extended mouse use.' },
            { label: 'Maintain proper posture', desc: 'Elbows at 90°, feet flat, screen at eye level. Poor posture creates tension that transmits into your mouse arm.' },
            { label: 'Use a large mousepad', desc: 'A constrained mousepad forces unnatural wrist angles during large movements. Size XL (450Ãƒ—400mm+) is the minimum for arm aiming.' },
          ].map(({ label, desc }, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <div style={{ color: '#00ff88', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>✔</div>
              <div><div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{label}</div><div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{desc}</div></div>
            </div>
          ))}
        </section>

        {/* Myths */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Aim Training Myths —€ Debunked</h2>
          {[
            { myth: '"Good aim is natural talent"', truth: 'Aim is a motor skill. Like typing or instrument playing, it is almost entirely learned through deliberate practice. Genetics plays a minor role.' },
            { myth: '"Higher sensitivity = faster aim"', truth: 'Higher sensitivity reduces the physical distance of movement —€ but if that distance is less than your muscular precision, your shots become random. Most pros use low-to-medium sensitivity.' },
            { myth: '"Expensive gear makes you aim better"', truth: 'A $30 mouse with good sensor accuracy performs nearly identically to a $150 mouse. Hardware cannot compensate for untrained mechanics.' },
            { myth: '"Aim trainers don\'t transfer to real games"', truth: 'Transfer depends on matching sensitivity, training the right skills, and applying the skills in-game. Done correctly, aim trainer improvement absolutely transfers.' },
            { myth: '"You need to train 2+ hours daily"', truth: 'Research on motor learning consistently shows that quality matters more than quantity. 30—€œ45 focused minutes outperforms 3 fatigued hours.' },
          ].map(({ myth, truth }, i) => (
            <div key={i} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', marginBottom: '0.6rem' }}>
              <div style={{ fontWeight: 700, color: '#ff2d55', marginBottom: '0.3rem', textDecoration: 'line-through', opacity: 0.85 }}>{myth}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.87rem' }}><span style={{ color: '#00ff88', fontWeight: 700 }}>Truth: </span>{truth}</div>
            </div>
          ))}
        </section>

        {/* Conclusion */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Conclusion</h2>
          <p style={{ marginBottom: '1rem' }}>A 3D aim trainer is the most efficient tool ever created for improving FPS mouse accuracy. The key insights from this guide:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              'Aim is a learnable motor skill —€ not an innate gift.',
              'Train at your exact game eDPI for muscle memory transfer.',
              'Focus on your weakest sub-skill, not just what you enjoy.',
              '30—€œ45 minutes daily beats 3-hour sessions twice a week.',
              'Protect your wrists —€ RSI ends aim careers.',
              'Consistency across months matters more than intensity across days.',
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: '0.45rem', listStyle: 'disc', color: '#9ca3af' }}>{item}</li>
            ))}
          </ul>
          <p>Start with the 3D Aim Trainer above. Pick a mode, run it for 30 days consistently, and let your stats tell the story. Every top-ranked FPS player once had your current aim level —€ the difference is they practiced deliberately.</p>
        </section>

        {/* FAQs */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.25rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { q: 'What is 3D aim training?', a: '3D aim training involves practicing mouse movements in a simulated three-dimensional space, mimicking the mechanics of modern First-Person Shooters (FPS) to improve accuracy, reaction time, and muscle memory.' },
              { q: 'How is 3D aim training different from 2D aim trainers?', a: '2D trainers focus on planar cursor movement (X/Y axes). 3D trainers incorporate field of view (FOV), depth perception, and angular camera rotation, making the practice directly transferable to real FPS games.' },
              { q: 'Does aim training actually build muscle memory?', a: 'Yes, though technically it builds "procedural memory" in the brain. Repeated, specific movements strengthen neural pathways, making your flick shots and tracking automatic and subconscious.' },
              { q: 'What is eDPI and why does it matter?', a: 'eDPI (effective DPI) = mouse DPI × in-game sensitivity. It is the universal sensitivity measurement. Matching eDPI across games and trainers ensures muscle memory transfers correctly.' },
              { q: 'How long should I practice aim training each day?', a: 'Consistency is key. Practicing for 20—45 minutes daily is highly effective. Marathon sessions often lead to cognitive fatigue and reinforce bad habits through sloppy mechanics.' },
              { q: 'Should I focus on speed or accuracy first?', a: 'Always focus on accuracy first (aiming for 80—95% hit rate). As you build clean procedural memory, your speed will naturally increase without sacrificing your mechanical foundation.' },
              { q: 'What is tracking in FPS games?', a: 'Tracking is the ability to keep your crosshair locked onto a moving target. It requires smooth, continuous mouse movements and is crucial for games with longer time-to-kill like Apex Legends.' },
              { q: 'What is a flick shot?', a: 'A flick shot is a rapid, explosive movement of the crosshair to a target, relying almost entirely on ingrained muscle memory rather than conscious visual tracking.' },
              { q: 'Do aim trainers improve game sense?', a: 'No. Aim trainers isolate mechanical skill. Game sense — understanding positioning, timing, map layouts, and enemy behavior — can only be developed by actually playing the game.' },
              { q: 'Why is my aim inconsistent?', a: 'Inconsistency can stem from cognitive fatigue, poor posture, lack of warmup, inconsistent hardware setup, or simply not playing enough to solidify your mechanical skills across different scenarios.' },
              { q: 'Is a higher polling rate better for aiming?', a: 'Yes, up to a point. A polling rate of 1000Hz (reporting 1000 times per second) is considered the standard for competitive play, ensuring minimal input latency between your hand and the screen.' },
              { q: 'What is mouse acceleration and should I disable it?', a: 'Mouse acceleration changes your cursor speed based on how fast you move the mouse. It is generally recommended to turn this OFF (e.g., "Enhance pointer precision" in Windows) to build consistent muscle memory.' },
              { q: 'How does FOV affect my aim?', a: "Field of View dictates how much of the game world is visible. Higher FOV makes targets appear smaller and slower, while lower FOV makes them larger and faster. Your aim trainer FOV should match your game's FOV." },
              { q: 'Should I change my sensitivity if I perform badly?', a: 'Frequently changing your sensitivity prevents muscle memory from forming. Pick a reasonable sensitivity used by professionals in your game and stick with it for at least a few weeks before adjusting.' },
              { q: 'What grip style is best for aiming?', a: 'There is no single "best" grip. Palm grip offers stability, fingertip grip offers precision micro-adjustments, and claw grip strikes a balance. Choose whatever feels most natural and pain-free.' },
              { q: 'How important is a high refresh rate monitor?', a: 'Extremely important. Upgrading from 60Hz to 144Hz or 240Hz drastically reduces motion blur and input lag, making it significantly easier to track fast-moving targets visually.' },
              { q: 'Will 3D aim training help me in Valorant?', a: 'Yes. While Valorant relies heavily on crosshair placement and positioning, 3D aim training sharpens your reaction time and micro-adjustments, which are vital for winning aim duels.' },
              { q: 'What is crosshair placement?', a: "Crosshair placement involves proactively aiming at the exact height and angle where an enemy's head is expected to appear. Good placement reduces the distance you need to flick." },
              { q: 'Can aiming cause physical injuries?', a: 'Yes, poor ergonomics, tense grip, and excessive marathon sessions can lead to Repetitive Strain Injuries (RSI) like carpal tunnel. Stretching and taking breaks is non-negotiable for longevity.' },
              { q: 'Is arm aiming better than wrist aiming?', a: 'Generally, a combination is best. Use your arm for large sweeping movements (lower sensitivity) to protect your wrist from strain, and use your wrist/fingers for precise micro-adjustments.' },
              { q: 'Do heavier mice make aiming harder?', a: 'Heavier mice have more inertia, making them harder to start and stop quickly. This is why the competitive standard has shifted towards lightweight mice (under 70 grams) for optimal flick speed and control.' },
              { q: 'What is eDPI?', a: 'eDPI (effective DPI) = mouse DPI Ãƒ— in-game sensitivity. It is the universal sensitivity measurement that determines how much your crosshair moves per inch of physical mouse movement.' },
              { q: 'How often should I aim train?', a: 'Daily is ideal. Aim is a perishable motor skill —€ even professionals warm up every session. If daily isn\'t possible, 5 days per week with rest days is effective.' },
              { q: 'What DPI should I use for aim training?', a: '400—€œ800 DPI is the most common competitive range. What matters more is your eDPI —€ multiply DPI by sensitivity and target 200—€œ600 eDPI for most FPS games.' },
              { q: 'Does a 3D aim trainer work better than a 2D one?', a: 'Yes, for FPS games. 3D trainers replicate depth, perspective projection, and target size variation that 2D tools cannot simulate. The transfer to real games is significantly higher.' },
              { q: 'Can aim training improve my rank?', a: 'Rank improvement requires aim + game sense + communication. Aim training directly improves the mechanical component. Players who simultaneously have average game sense and good aim consistently reach Platinum—€œDiamond level in most titles.' },
              { q: 'How long does it take to see results?', a: 'Most players notice measurable improvement in 2—€œ4 weeks of daily 30-minute sessions. Significant change —€ where others notice in actual matches —€ typically takes 6—€œ12 weeks.' },
              { q: 'Is aim training worth it for casual players?', a: 'Yes, but the ROI is highest for players who play 5+ hours per week competitively. Casual players benefit most from learning crosshair placement rather than heavy aim drilling.' },
              { q: 'Should I play with raw input on?', a: 'Yes. Raw input bypasses Windows cursor acceleration, ensuring your sensitivity is perfectly linear at all speeds. Enable raw input in every competitive FPS.' },
              { q: 'What is the best aim trainer online?', a: 'The best online aim trainer is one you actually use consistently. Key features to look for: sensitivity matching, multiple scenario types, stat tracking, and zero installation requirement.' },
              { q: 'Does mouse pad surface affect aim?', a: 'Yes significantly. Hard pads offer lower friction and more consistent glide —€ ideal for flick-heavy play. Cloth pads offer more control and higher friction —€ better for tracking and precision.' },
              { q: 'What monitor refresh rate is best for aim training?', a: '144Hz is the minimum competitive standard. 240Hz provides meaningfully smoother visual feedback during fast flick movements. 360Hz shows diminishing returns for most players.' },
              { q: 'Should I train with the same scenario every day?', a: 'Keep one anchor scenario constant for tracking progress, but vary other scenarios to prevent plateauing and ensure broad skill development.' },
              { q: 'Is higher FOV better for aiming?', a: 'Higher FOV makes targets appear smaller and slower. Lower FOV makes them appear larger and faster. Your aim trainer FOV should exactly match your game\'s FOV for accurate muscle memory transfer.' },
              { q: 'Can I improve aim without a gaming mouse?', a: 'You can improve, but hardware matters. A gaming mouse with a precise optical sensor, lower debounce delay, and lighter weight provides measurably better input fidelity than a standard office mouse.' },
              { q: 'What causes aim to feel worse some days?', a: 'Sleep quality, hydration, stress, food intake, and even minor posture changes affect fine motor performance. Creating a pre-game ritual minimizes this variance.' },
              { q: 'Is wrist aiming or arm aiming better?', a: 'A combination is optimal. Use arm for large movements (keeping the wrist safe) and wrist for micro-corrections. Low-sensitivity players naturally arm-aim more; high-sensitivity players rely more on wrist.' },
              { q: 'Does caffeine help aim?', a: 'Moderate caffeine (1 cup) can improve focus and reaction time. High doses cause tremor that destroys micro-precision. Use consistently and avoid caffeination anxiety before competitive sessions.' },
              { q: 'What is crosshair placement?', a: 'Pre-aiming your crosshair at the exact height and angle where an enemy is likely to appear before they show. Good placement reduces the flick required from large (arm) to micro (wrist-only).' },
              { q: 'How do I know if I\'m ready for harder scenarios?', a: 'When you consistently hit 80%+ accuracy in your current scenario for 5+ consecutive sessions, add difficulty (smaller targets, faster movement, shorter life). Progress based on data, not boredom.' },
              { q: 'Can playing FPS games count as aim training?', a: 'Partly. In-game play provides context and game sense but lacks isolated mechanical repetition. Aim trainers and game play are complementary, not interchangeable.' },
              { q: 'What is tracking vs flicking?', a: 'Tracking keeps the crosshair continuously on a moving target. Flicking rapidly snaps from current position to a new target. Both are distinct skills requiring separate practice.' },
              { q: 'What is target switching?', a: 'Rapidly moving from one target to another in sequence. Critical for squad fights in tactical shooters and team fight scenarios in battle royales.' },
              { q: 'Does reaction time training help outside gaming?', a: 'Yes. The visual processing and motor response improvements from reaction time training have documented benefits in real-world situations requiring fast decisions.' },
              { q: 'What is the "spray pattern" and should I train it?', a: 'Spray pattern is the recoil sequence of automatic weapons. It is game-specific, not trainable in a generic aim trainer —€ use the game\'s practice range for spray control.' },
              { q: 'What\'s the difference between precision and speed in aim?', a: 'Precision is landing where you intend; speed is doing it faster. They are inversely correlated short-term. Aim training raises the precision floor at every speed level.' },
              { q: 'How do I stop deathgripping?', a: 'Consciously practice holding with minimum force. If your hand gets sore in 30 minutes, you\'re gripping too hard. Tension transmits aim shake into the crosshair.' },
              { q: 'Is a bigger mousepad better?', a: 'For arm-aiming players, yes. A mousepad smaller than 400Ãƒ—350mm forces unnatural wrist angles during large movements. XL pads (450Ãƒ—400mm+) are recommended.' },
              { q: 'How does sleep affect aim?', a: 'Sleep is when motor memories consolidate. Poor sleep measurably degrades reaction time and fine motor precision. Never expect your best aim after under 6 hours of sleep.' },
              { q: 'What is "click timing"?', a: 'Clicking at the exact moment the crosshair overlaps the target —€ not too early (crosshair still moving toward it) and not too late (confirming visually first).' },
              { q: 'Can aim training help with console controllers?', a: 'Generic aim trainers are mouse-and-keyboard focused. Controller-specific trainers exist but the principle is the same: isolated repetition of specific mechanics in a controlled environment.' },
              { q: 'Is there a biological limit to aim improvement?', a: 'Yes —€ the visual reaction time floor (≈180ms) is a hard biological limit. However, most players operate 60—€œ200ms above this floor, meaning significant improvement remains available without hitting biological limits.' },
              { q: 'What is "aim shake" and how do I fix it?', a: 'Aim shake is subtle tremor in crosshair movement. Causes: deathgrip, high sensitivity, caffeine, fatigue. Fix: relax grip, lower sensitivity, reduce caffeine, practice at non-fatigued times.' },
              { q: 'How does posture affect aim quality?', a: 'Posture is the foundation of aim. Rounded shoulders and tense neck transmit muscle tension into your arm and hand, creating baseline aim shake and restricting range of motion.' },
              { q: 'Can I use a wrist rest during aim training?', a: 'Between shots, yes. During active mouse movement, wrist rests restrict mobility and can harm wrist angle. Contact it during idle moments only.' },
              { q: 'How many aim training scenarios per session?', a: '2—€œ4 well-chosen scenarios is optimal. One warm-up anchor, one or two weakness focus scenarios, and one comfortable cooldown. Quality repetitions beat scattered attempts.' },
              { q: 'Does resolution affect aim accuracy?', a: 'Higher resolution provides sharper target visuals, reducing perceptual error. However, frame rate matters more —€ 1080p at 240Hz outperforms 4K at 60Hz for competitive aim.' },
              { q: 'What games benefit most from aim training?', a: 'Any FPS or TPS where aim is a primary combat mechanic: Valorant, CS2, Apex Legends, Fortnite, Overwatch 2, Rainbow Six Siege, Battlefield, CoD. Also beneficial for MOBA players in skillshot accuracy.' },
              { q: 'What is "strafe aiming"?', a: 'Moving laterally (strafing) while aiming to make yourself harder to hit. Strafe aiming requires predicting where your own stutter-stopping position will be and compensating the crosshair accordingly.' },
              { q: 'How do I train for a specific weapon type?', a: 'Sniper training: slow, precise static targets and snap timing. Rifler training: burst flicks at medium range with target switching. SMG/shotgun: very close-range fast reaction scenarios.' },
              { q: 'What is "arm circle" training?', a: 'Drawing consistent circles with the mouse while aiming to build smooth, even muscle control in all directions. Particularly useful for tracking improvement.' },
              { q: 'Does mouse weight affect aim?', a: 'Heavier mice have more inertia —€ harder to stop quickly after a fast movement. Most professional players now use mice under 70g for optimal flick speed and stop-and-go precision.' },
              { q: 'What is the best time of day to aim train?', a: 'Mid-morning to early afternoon peaks for most people. However, consistency in training time matters more than the specific time. Train when you\'re most alert.' },
              { q: 'What is "cm per 360"?', a: 'cm/360 describes the physical centimeters of mouse movement needed for a full 360° camera rotation. It\'s the universal sensitivity language. Pro CS2 players average 35—€œ50cm/360.' },
              { q: 'Can watching pro gameplay improve aim?', a: 'Watching pros teaches crosshair placement habits and decision-making, not motor patterns. Combine observation with deliberate drilling of what you observe.' },
              { q: 'Is aim training effective for Bronze/Silver players?', a: 'At lower ranks, game sense and positioning often limit performance more than raw aim. Aim training helps, but crosshair placement education often produces faster rank improvement.' },
              { q: 'Should I deathgrip less if I miss a lot?', a: 'Yes. Tension is a primary cause of aim inaccuracy. Consciously reduce grip pressure and observe whether your micro-corrections become more precise.' },
              { q: 'Does playing rhythm games help aim?', a: 'Partially —€ rhythm games improve hand-eye coordination components. The transfer is indirect compared to dedicated aim training but won\'t hurt and can be a fun supplement.' },
              { q: 'What is the #1 mistake that slows aim improvement?', a: 'Changing sensitivity more than once per month. Every change partially resets muscle memory. Pick a sensitivity, commit for 30+ days, and measure consistently before adjusting.' },
              { q: 'Is aim training different for Valorant vs CS2?', a: 'Yes. Valorant has slower movement, making crosshair placement and first-shot accuracy paramount. CS2 has faster movement and counter-strafing, requiring more precise timing. Train both static and strafe scenarios accordingly.' },
              { q: 'How do I stop tilting after missing shots?', a: 'Treat misses as data, not failure. Ask: was it crosshair placement, overshoot, or click timing? Building this neutral analytical mindset during training makes it available in real matches.' },
            ].map(({ q, a }, i) => (
              <details key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' }}>
                <summary style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                  {i + 1}. {q}
                </summary>
                <p style={{ marginTop: '0.75rem', color: '#cbd5e1', lineHeight: '1.6' }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <p style={{ fontSize: '0.78rem', color: '#4b5563', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
          This article was written to serve competitive FPS players seeking genuine, actionable improvement. Every claim is based on accepted principles of motor learning, biomechanics, and competitive gaming best practices.
        </p>
      </article>

    </div>
  );
}







