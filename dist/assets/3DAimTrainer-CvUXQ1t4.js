import{j as e}from"./index-XPV8mCgL.js";import{b as o}from"./vendor-router-DqPzEVhT.js";import{M as g,a as h}from"./minimize-5wtu3niT.js";import"./createLucideIcon-Bzm-evPl.js";const u=`<!DOCTYPE html>
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
  /* ── Challenge Mode ── */
  .mode-tabs { display: flex; gap: 10px; margin-bottom: 22px; }
  .mode-tab {
    flex: 1; padding: 10px 0; border-radius: 8px; cursor: pointer;
    font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.55);
    transition: all 0.15s;
  }
  .mode-tab.active {
    background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
    color: #fff; border-color: transparent;
    box-shadow: 0 4px 18px rgba(79,195,247,0.28);
  }
  #challenge-options { display: none; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 22px; }
  #challenge-options.visible { display: flex; }
  .dur-grid { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .dur-btn {
    padding: 8px 18px; border-radius: 8px; cursor: pointer;
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65);
    transition: all 0.15s;
  }
  .dur-btn.selected {
    background: rgba(79,195,247,0.18); color: #4fc3f7; border-color: #4fc3f7;
  }
  #timer-panel.challenge-mode #timer-label { color: #ff9800; }
  #timer-panel.challenge-mode #timer-value { color: #ff9800; }
  #timer-panel.challenge-mode.urgent #timer-value { color: #ff4444; animation: pulse-red 0.5s ease-in-out infinite; }
  @keyframes pulse-red { 0%,100% { opacity:1; } 50% { opacity:0.55; } }
  /* ── Result Popup ── */
  #result-popup {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    z-index: 200; pointer-events: auto;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(14px);
    opacity: 0; transition: opacity 0.25s ease;
  }
  #result-popup.visible { opacity: 1; }
  #result-popup.hidden { display: none; }
  .rp-card {
    background: #0d1117; border: 1px solid rgba(79,195,247,0.35);
    border-radius: 20px; padding: 2rem 2.2rem;
    width: min(480px, 90vw); text-align: center;
    box-shadow: 0 0 60px rgba(79,195,247,0.12);
    transform: scale(0.9); transition: transform 0.28s cubic-bezier(.34,1.56,.64,1);
  }
  #result-popup.visible .rp-card { transform: scale(1); }
  .rp-badge {
    display: inline-block; padding: 4px 14px; border-radius: 20px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
    background: rgba(79,195,247,0.15); color: #4fc3f7; margin-bottom: 10px;
  }
  .rp-title { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; }
  .rp-sub { font-size: 12px; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
  .rp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .rp-stat {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 14px 10px;
  }
  .rp-stat-label { font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 6px; }
  .rp-stat-val { font-size: 26px; font-weight: 800; }
  .rp-stat-val.hits { color: #69f0ae; }
  .rp-stat-val.misses { color: #ff5252; }
  .rp-stat-val.score { color: #4fc3f7; }
  .rp-stat-val.acc { color: #ffb300; }
  .rp-btns { display: flex; gap: 10px; }
  .rp-btn-primary {
    flex: 1; padding: 13px 0; border-radius: 8px;
    background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
    color: #fff; border: none; font-size: 12px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
    box-shadow: 0 4px 18px rgba(79,195,247,0.25);
  }
  .rp-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .rp-btn-secondary {
    flex: 1; padding: 13px 0; border-radius: 8px;
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.1); font-size: 12px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
    transition: background 0.15s;
  }
  .rp-btn-secondary:hover { background: rgba(255,255,255,0.12); }
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
  <div class="mode-tabs">
    <button class="mode-tab active" id="tab-infinite">∞ Infinite</button>
    <button class="mode-tab" id="tab-challenge">⏱ Challenge</button>
  </div>
  <div id="challenge-options">
    <div style="font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Select Duration</div>
    <div class="dur-grid">
      <button class="dur-btn selected" data-dur="10">10s</button>
      <button class="dur-btn" data-dur="20">20s</button>
      <button class="dur-btn" data-dur="30">30s</button>
      <button class="dur-btn" data-dur="60">60s</button>
      <button class="dur-btn" data-dur="100">100s</button>
    </div>
  </div>
  <div class="info-grid" id="info-grid-infinite">
    <div class="info-card"><div class="ic-label">Mode</div><div class="ic-val" style="font-size:13px;color:#fff;">Infinite</div></div>
    <div class="info-card"><div class="ic-label">Targets</div><div class="ic-val">∞</div></div>
    <div class="info-card"><div class="ic-label">Spawn</div><div class="ic-val" style="font-size:13px;">50ms</div></div>
    <div class="info-card"><div class="ic-label">Ammo</div><div class="ic-val" style="font-size:13px;color:#cbd5e1;padding-top:2px;">∞</div></div>
  </div>
  <button class="btn-primary" id="btn-start">▶ Start Training</button>
  <div class="hint">ESC to pause · Left click to shoot</div>
</div>
<div id="result-popup" class="hidden">
  <div class="rp-card">
    <div class="rp-badge">Challenge Complete</div>
    <div class="rp-title" id="rp-title">Great Shot!</div>
    <div class="rp-sub" id="rp-sub">30 Second Challenge</div>
    <div class="rp-grid">
      <div class="rp-stat"><div class="rp-stat-label">Hits</div><div class="rp-stat-val hits" id="rp-hits">0</div></div>
      <div class="rp-stat"><div class="rp-stat-label">Misses</div><div class="rp-stat-val misses" id="rp-misses">0</div></div>
      <div class="rp-stat"><div class="rp-stat-label">Score</div><div class="rp-stat-val score" id="rp-score">0</div></div>
      <div class="rp-stat"><div class="rp-stat-label">Accuracy</div><div class="rp-stat-val acc" id="rp-acc">-</div></div>
    </div>
    <div class="rp-btns">
      <button class="rp-btn-primary" id="rp-play-again">▶ Play Again</button>
      <button class="rp-btn-secondary" id="rp-menu">↩ Menu</button>
    </div>
  </div>
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
  <button class="btn-secondary" id="btn-pause-menu" style="margin-top: 14px;">↩ Menu</button>
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
// ── Challenge Mode State ──
const challenge = { active: false, duration: 10, remaining: 10 };
let selectedDuration = 10;
let isChallengeMode = false;
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
const timerPanel=document.getElementById('timer-panel');
const timerLabel=document.getElementById('timer-label');
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
function formatCountdown(sec) { const m=Math.floor(sec/60); return m > 0 ? m+':'+String(Math.ceil(sec%60)).padStart(2,'0') : Math.ceil(sec).toString(); }
function getRank(hits, acc) {
  if (acc >= 80 && hits >= 15) return '🎯 Sharpshooter!';
  if (acc >= 60 && hits >= 10) return '✅ Good Aim!';
  if (hits === 0) return '😬 Keep Practicing';
  return '💪 Not Bad!';
}
function showResultPopup() {
  if (activeTarget) { scene.remove(activeTarget); activeTarget = null; }
  clearTimeout(spawnTimeout); spawnLocked = false;
  const total = state.hits + state.misses;
  const acc = total === 0 ? 0 : Math.round((state.hits / total) * 100);
  document.getElementById('rp-hits').textContent = state.hits;
  document.getElementById('rp-misses').textContent = state.misses;
  document.getElementById('rp-score').textContent = state.score;
  document.getElementById('rp-acc').textContent = total === 0 ? '-' : acc + '%';
  document.getElementById('rp-sub').textContent = selectedDuration + ' Second Challenge';
  document.getElementById('rp-title').textContent = getRank(state.hits, acc);
  const popup = document.getElementById('result-popup');
  popup.classList.remove('hidden');
  requestAnimationFrame(() => popup.classList.add('visible'));
  timerPanel.classList.remove('challenge-mode','urgent');
  timerLabel.textContent = 'Session Time';
}
function hideResultPopup() {
  const popup = document.getElementById('result-popup');
  popup.classList.remove('visible');
  setTimeout(() => popup.classList.add('hidden'), 260);
}
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
  hideResultPopup();
  // Challenge mode setup
  if (isChallengeMode) {
    challenge.active = true; challenge.duration = selectedDuration; challenge.remaining = selectedDuration;
    timerPanel.classList.add('challenge-mode');
    timerPanel.classList.remove('urgent');
    timerLabel.textContent = 'Time Left';
    elTimer.textContent = formatCountdown(selectedDuration);
  } else {
    challenge.active = false;
    timerPanel.classList.remove('challenge-mode','urgent');
    timerLabel.textContent = 'Session Time';
  }
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
function endChallenge() {
  state.running = false; challenge.active = false;
  if (document.pointerLockElement) document.exitPointerLock();
  document.getElementById('hud').classList.remove('active');
  showResultPopup();
}
let lastTime = performance.now();
let animFrameId = null;
function loop(now) {
  animFrameId = requestAnimationFrame(loop);
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now;
    if (state.running && !state.paused) {
      if (!canShoot) { shootCooldown -= dt; if (shootCooldown <= 0) { canShoot = true; shootCooldown = 0; } }
      updateTarget(dt); updateImpacts(dt); updateGunRecoil(dt); updateMuzzleFlash(dt); updateFPS(dt);
      if (challenge.active) {
        challenge.remaining -= dt;
        if (challenge.remaining <= 0) { challenge.remaining = 0; endChallenge(); }
        else {
          if (elTimer) elTimer.textContent = formatCountdown(challenge.remaining);
          if (challenge.remaining <= 5) timerPanel.classList.add('urgent');
          else timerPanel.classList.remove('urgent');
        }
      } else {
        if (elTimer) elTimer.textContent = formatTime(now - state.startTime - state.pauseAccum);
      }
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
document.getElementById('btn-pause-menu').addEventListener('click', () => {
  document.getElementById('pause-screen').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('hud').classList.remove('active');
  resetState();
  if (activeTarget) { scene.remove(activeTarget); activeTarget = null; }
  clearTimeout(spawnTimeout); spawnLocked = false;
});
// Mode tab switching
document.getElementById('tab-infinite').addEventListener('click', () => {
  isChallengeMode = false;
  document.getElementById('tab-infinite').classList.add('active');
  document.getElementById('tab-challenge').classList.remove('active');
  document.getElementById('challenge-options').classList.remove('visible');
  document.getElementById('info-grid-infinite').style.display = '';
});
document.getElementById('tab-challenge').addEventListener('click', () => {
  isChallengeMode = true;
  document.getElementById('tab-challenge').classList.add('active');
  document.getElementById('tab-infinite').classList.remove('active');
  document.getElementById('challenge-options').classList.add('visible');
  document.getElementById('info-grid-infinite').style.display = 'none';
});
// Duration buttons
document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDuration = parseInt(btn.dataset.dur, 10);
  });
});
// Result popup buttons
document.getElementById('rp-play-again').addEventListener('click', () => {
  hideResultPopup();
  setTimeout(startGame, 270);
});
document.getElementById('rp-menu').addEventListener('click', () => {
  hideResultPopup();
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('hud').classList.remove('active');
});
requestAnimationFrame(loop);
<\/script>
</body>
</html>`,f=[{label:"CPS Test",href:"/cps-test",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("line",{x1:"12",y1:"6",x2:"12",y2:"10"}),e.jsx("circle",{cx:"12",cy:"14",r:"1",fill:"currentColor"})]})},{label:"Spacebar Counter",href:"/spacebar-counter",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("rect",{x:"2",y:"5",width:"20",height:"14",rx:"2"}),e.jsx("line",{x1:"6",y1:"15",x2:"18",y2:"15"})]})},{label:"Aim Trainer",href:"/aim-trainer",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"6"}),e.jsx("circle",{cx:"12",cy:"12",r:"2"})]})},{label:"Typing Test",href:"/typing-test",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("rect",{x:"2",y:"4",width:"20",height:"16",rx:"2"}),e.jsx("path",{d:"M8 15h8M7 11h2m3 0h2m3 0h-1"})]})},{label:"Reaction Time",href:"/reaction-time",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]})},{label:"Scroll Test",href:"/scroll-test",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 11l3-3 3 3"}),e.jsx("path",{d:"M9 13l3 3 3-3"})]})},{label:"Double Click",href:"/double-click",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("line",{x1:"12",y1:"6",x2:"12",y2:"10"})]})},{label:"3D Aim Trainer",href:"/3d-aim-trainer",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M3 12h3m12 0h3M12 3v3m0 12v3"}),e.jsx("circle",{cx:"12",cy:"12",r:"8",opacity:".4"})]})},{label:"Mouse Accuracy",href:"/mouse-accuracy",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("path",{d:"M12 2v10"})]})},{label:"Key Visualizer",href:"/key-visualizer",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("rect",{x:"2",y:"5",width:"20",height:"14",rx:"2"}),e.jsx("path",{d:"M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1"})]})},{label:"F1 Reaction",href:"/f1-reaction",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})})},{label:"Space Defense",href:"/space-defense",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})})},{label:"Accuracy Test",href:"/accuracy",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"}),e.jsx("polyline",{points:"22 4 12 14.01 9 11.01"})]})},{label:"CPS Rush",href:"/cps-rush",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:[e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"}),e.jsx("path",{d:"M12 12v-4"}),e.jsx("circle",{cx:"12",cy:"14",r:"1",fill:"currentColor"})]})},{label:"Voyager Game",href:"/voyager-game",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("path",{d:"M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"})})},{label:"Space Waves",href:"/space-waves",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:"36",height:"36",children:e.jsx("path",{d:"M2 12h4l3-9 5 18 3-9h5"})})}];function w(){const a=o.useRef(null),c=o.useRef(null),[l,n]=o.useState(!1),[d,m]=o.useState("");o.useEffect(()=>{const t=new Blob([u],{type:"text/html"}),r=URL.createObjectURL(t);return m(r),()=>{URL.revokeObjectURL(r)}},[]);const p=o.useCallback(()=>{const t=a.current;t&&(document.fullscreenElement?document.exitFullscreen?.().then(()=>n(!1)).catch(()=>{}):t.requestFullscreen?.().then(()=>n(!0)).catch(()=>{}))},[]);return o.useEffect(()=>{const t=()=>n(!!document.fullscreenElement);return document.addEventListener("fullscreenchange",t),()=>document.removeEventListener("fullscreenchange",t)},[]),e.jsxs("div",{style:{width:"100%",minHeight:"100vh"},children:[e.jsxs("div",{ref:a,style:{width:"100%",height:"100vh",position:"relative",background:"#0a0a0c",overflow:"hidden"},children:[e.jsx("iframe",{ref:c,src:d,style:{width:"100%",height:"100%",border:"none",display:"block"},allow:"pointer-lock; fullscreen",title:"3D Aim Trainer"}),e.jsx("div",{style:{position:"absolute",top:"14px",right:"14px",display:"flex",gap:"8px",zIndex:100},children:e.jsx("button",{onClick:p,"aria-label":l?"Exit fullscreen":"Enter fullscreen",style:{background:"rgba(4,9,20,0.8)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",padding:"7px",color:"#9ca3af",cursor:"pointer",display:"flex",alignItems:"center"},children:l?e.jsx(g,{size:16}):e.jsx(h,{size:16})})})]}),e.jsxs("section",{"aria-label":"More Tools",style:{maxWidth:"1000px",margin:"4rem auto 0 auto",padding:"0 2rem"},children:[e.jsx("h2",{style:{fontWeight:800,fontSize:"1.5rem",color:"#fff",marginBottom:"1.5rem",textAlign:"center",letterSpacing:"-0.3px"},children:"More Tools"}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:"1rem"},children:f.map(({label:t,href:r,icon:s})=>e.jsxs("a",{href:r,style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0.6rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1.2rem 0.5rem",cursor:"pointer",textDecoration:"none",transition:"all 0.2s ease"},onMouseEnter:i=>{i.currentTarget.style.background="rgba(79,195,247,0.08)",i.currentTarget.style.borderColor="rgba(79,195,247,0.35)",i.currentTarget.style.transform="translateY(-2px)"},onMouseLeave:i=>{i.currentTarget.style.background="rgba(255,255,255,0.03)",i.currentTarget.style.borderColor="rgba(255,255,255,0.07)",i.currentTarget.style.transform="translateY(0)"},children:[e.jsx("div",{style:{width:"56px",height:"56px",borderRadius:"12px",background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",color:"#4fc3f7",transition:"color 0.3s ease"},children:s}),e.jsx("span",{style:{color:"#d1d1de",fontSize:"0.8rem",fontWeight:600,textAlign:"center"},children:t})]},r))})]}),e.jsxs("article",{style:{maxWidth:"1000px",margin:"0 auto",padding:"4rem 2rem",color:"#cbd5e1",fontFamily:"system-ui, sans-serif",lineHeight:"1.6"},children:[e.jsxs("nav",{"aria-label":"Table of Contents",style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"1.5rem",marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.2rem",fontWeight:700,color:"#fff",marginBottom:"1rem",marginTop:0},children:"Table of Contents"}),e.jsxs("ul",{style:{listStyle:"none",padding:0,margin:0,display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"0.5rem"},children:[e.jsx("li",{children:e.jsx("a",{href:"#introduction",style:{color:"#4fc3f7",textDecoration:"none"},children:"1. Introduction to FPS Aim Training"})}),e.jsx("li",{children:e.jsx("a",{href:"#fixedaim-features",style:{color:"#4fc3f7",textDecoration:"none"},children:"2. Why Choose FixedAim?"})}),e.jsx("li",{children:e.jsx("a",{href:"#how-to-use",style:{color:"#4fc3f7",textDecoration:"none"},children:"3. How to Use FixedAim"})}),e.jsx("li",{children:e.jsx("a",{href:"#training-plan",style:{color:"#4fc3f7",textDecoration:"none"},children:"4. 7-Day Beginner Training Plan"})}),e.jsx("li",{children:e.jsx("a",{href:"#game-specific",style:{color:"#4fc3f7",textDecoration:"none"},children:"5. Game-Specific Aim Training (CS2, Valorant, Apex)"})}),e.jsx("li",{children:e.jsx("a",{href:"#aim-mechanics",style:{color:"#4fc3f7",textDecoration:"none"},children:"6. Core Aim Mechanics Explained"})}),e.jsx("li",{children:e.jsx("a",{href:"#ergonomics-grips",style:{color:"#4fc3f7",textDecoration:"none"},children:"7. Mouse Grips & Ergonomics"})}),e.jsx("li",{children:e.jsx("a",{href:"#comparison",style:{color:"#4fc3f7",textDecoration:"none"},children:"8. FixedAim vs. Desktop Trainers"})}),e.jsx("li",{children:e.jsx("a",{href:"#hardware",style:{color:"#4fc3f7",textDecoration:"none"},children:"9. Hardware & Settings Checklist"})}),e.jsx("li",{children:e.jsx("a",{href:"#faq",style:{color:"#4fc3f7",textDecoration:"none"},children:"10. Frequently Asked Questions"})})]})]}),e.jsx("h1",{style:{fontSize:"2.5rem",fontWeight:900,marginBottom:"2.5rem",color:"#fff",textAlign:"center",textTransform:"uppercase",letterSpacing:"-0.02em"},children:"The Ultimate Guide to FPS Aim Training"}),e.jsxs("section",{id:"introduction",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Introduction to FPS Aim Training"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Aim training in a three-dimensional environment has revolutionized how competitive gamers prepare for tactical shooters and battle royales. Unlike simple 2D clicker games, an online aim practice tool immerses you in a simulated spatial environment that requires precise camera rotation, crosshair placement, and depth perception."}),e.jsxs("p",{style:{marginBottom:"1rem"},children:["According to principles of ",e.jsx("a",{href:"https://en.wikipedia.org/wiki/Motor_learning",target:"_blank",rel:"noopener noreferrer",style:{color:"#4fc3f7",textDecoration:"none"},children:"motor learning"}),', the specificity of practice is paramount. When you train in a dedicated 3D space, you are engaging the exact spatial awareness mechanisms relied upon in actual gameplay. Consistent, targeted repetition may lead to structural changes in the brain that support rapid, automatic execution of complex motor tasks, commonly referred to as building "muscle memory."']}),e.jsx("div",{style:{textAlign:"center",margin:"2rem 0"},children:e.jsx("button",{onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),style:{background:"linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)",color:"#fff",border:"none",borderRadius:"8px",padding:"12px 32px",fontSize:"1.1rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 15px rgba(79,195,247,0.3)",transition:"transform 0.2s"},children:"Start Training Now"})})]}),e.jsxs("section",{id:"fixedaim-features",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Why Choose FixedAim?"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Built by passionate developers and competitive gamers, FixedAim provides a seamless, friction-free environment to hone your mechanics. We understand that you want to train without bloat, loading screens, or paywalls."}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"1rem",marginBottom:"1.5rem"},children:[{title:"100% Free & Unlocked",desc:"No premium subscriptions or hidden features."},{title:"Browser-Based",desc:"Runs directly in your browser. Compatible with Chrome, Edge, Firefox, and Safari."},{title:"No Installation",desc:"Zero downloads required. Get straight into the action in seconds."},{title:"Privacy First",desc:"No login required. Your data and stats stay local to your machine."}].map((t,r)=>e.jsxs("div",{style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"1.25rem"},children:[e.jsx("h3",{style:{fontSize:"1.1rem",color:"#4fc3f7",marginBottom:"0.5rem",marginTop:0},children:t.title}),e.jsx("p",{style:{fontSize:"0.9rem",color:"#9ca3af",margin:0},children:t.desc})]},r))}),e.jsx("h3",{style:{fontSize:"1.4rem",color:"#fff",marginBottom:"1rem"},children:"Live Performance Tracking"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Our tool doesn't just let you shoot targets; it tracks every micro-movement to provide real-time performance statistics, including:"}),e.jsxs("ul",{style:{paddingLeft:"1.5rem",marginBottom:"1rem"},children:[e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#00f5ff"},children:"Accuracy (%):"})," Your precision rating. Hitting 90%+ consistently is better than missing fast."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#00ff88"},children:"Hits & Misses:"})," Raw hit and miss counts to evaluate your volume of fire and trigger discipline."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#bf5af2"},children:"Score:"})," An aggregated point system rewarding both speed and accuracy."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#ffd60a"},children:"Session Time:"})," A live timer to ensure you don't overtrain and hit cognitive fatigue."]})]})]}),e.jsxs("section",{id:"how-to-use",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"How to Use FixedAim (Step-by-Step)"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Getting started with FixedAim is incredibly simple. Follow these steps to begin your first session:"}),e.jsxs("ol",{style:{paddingLeft:"1.5rem",marginBottom:"1rem"},children:[e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Match Your Sensitivity:"})," Before starting, ensure your mouse DPI is set to your usual gaming standard (e.g., 400, 800, or 1600 DPI)."]}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Start the Trainer:"}),' Click the "Start Training" button at the top of the page. Your mouse cursor will lock to the screen for a true FPS experience.']}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Acquire Targets:"})," 3D targets will spawn randomly in the virtual environment. Look around using your mouse."]}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Shoot and Track:"})," Left-click to shoot. For moving targets, track them smoothly across your screen before firing."]}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Analyze Your Stats:"})," Press ESC at any time to pause the game and unlock your cursor. Review your Accuracy, Hits, and Misses on the HUD."]}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Iterate and Repeat:"}),' Hit "Resume" to continue or "Restart" to wipe the slate clean and try for a higher score!']})]})]}),e.jsxs("section",{id:"training-plan",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"7-Day Beginner Training Plan"}),e.jsxs("p",{style:{marginBottom:"1rem"},children:["Consistency is the secret to building mechanical skill. If you are new to aim training, follow this structured 7-day routine. Spend ",e.jsx("strong",{children:"15 to 20 minutes daily"})," on FixedAim to build foundational muscle memory without burning out."]}),e.jsx("div",{style:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",padding:"1.25rem"},children:e.jsxs("ul",{style:{listStyle:"none",padding:0,margin:0},children:[e.jsxs("li",{style:{marginBottom:"1rem",paddingBottom:"1rem",borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("strong",{style:{color:"#4fc3f7"},children:"Days 1 & 2: Accuracy Over Speed"}),e.jsx("br",{}),e.jsxs("span",{style:{color:"#9ca3af",fontSize:"0.9rem"},children:["Focus purely on hitting the target. Do not rush your clicks. Aim for a minimum of ",e.jsx("strong",{children:"90% accuracy"}),". If you miss, slow down. This builds the initial neural pathways."]})]}),e.jsxs("li",{style:{marginBottom:"1rem",paddingBottom:"1rem",borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("strong",{style:{color:"#00ff88"},children:"Days 3 & 4: Micro-Corrections"}),e.jsx("br",{}),e.jsxs("span",{style:{color:"#9ca3af",fontSize:"0.9rem"},children:["Flick to the target quickly, but pause for a split-second to verify your crosshair is centered before clicking. Try to maintain ",e.jsx("strong",{children:"85% accuracy"})," while increasing initial flick speed."]})]}),e.jsxs("li",{style:{marginBottom:"1rem",paddingBottom:"1rem",borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("strong",{style:{color:"#bf5af2"},children:"Days 5 & 6: Pushing the Pace"}),e.jsx("br",{}),e.jsxs("span",{style:{color:"#9ca3af",fontSize:"0.9rem"},children:["Start trusting your muscle memory. Shoot the moment you feel the crosshair is on target. Your accuracy may drop to ",e.jsx("strong",{children:"75-80%"}),", but your targets-per-minute (Score) should increase significantly."]})]}),e.jsxs("li",{children:[e.jsx("strong",{style:{color:"#ffd60a"},children:"Day 7: The Benchmark Test"}),e.jsx("br",{}),e.jsx("span",{style:{color:"#9ca3af",fontSize:"0.9rem"},children:"Treat today as a ranked match. Do a 3-minute warm-up, then do 3 serious runs. Record your highest Score and Accuracy. This is your new baseline for the following week!"})]})]})})]}),e.jsxs("section",{id:"game-specific",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Game-Specific Aim Training"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Different first-person shooters demand entirely different subsets of aiming mechanics. Tailoring your training to the game you play is critical for competitive success."}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginTop:"1.5rem"},children:[e.jsxs("div",{style:{background:"linear-gradient(180deg, rgba(255,70,85,0.05) 0%, rgba(0,0,0,0.2) 100%)",border:"1px solid rgba(255,70,85,0.2)",borderRadius:"12px",padding:"1.5rem"},children:[e.jsxs("h3",{style:{color:"#ff4655",marginTop:0,marginBottom:"0.75rem",fontSize:"1.2rem",display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"#ff4655",children:e.jsx("path",{d:"M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"})}),"Tactical Shooters (Valorant, CS2)"]}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.95rem",marginBottom:"1rem"},children:"Tactical FPS games have extremely low Time-To-Kill (TTK). A single headshot ends the fight. Therefore, training should prioritize:"}),e.jsxs("ul",{style:{paddingLeft:"1.2rem",color:"#9ca3af",fontSize:"0.9rem"},children:[e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{children:"Crosshair Placement:"})," Pre-aiming corners at head height."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{children:"Micro-Flicks:"})," Tiny, fast adjustments from a good crosshair position directly to the target's head."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{children:"Click Timing:"})," Firing at the exact moment you counter-strafe to an absolute stop."]})]})]}),e.jsxs("div",{style:{background:"linear-gradient(180deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.2) 100%)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:"12px",padding:"1.5rem"},children:[e.jsxs("h3",{style:{color:"#00ff88",marginTop:0,marginBottom:"0.75rem",fontSize:"1.2rem",display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"#00ff88",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",fill:"none",stroke:"#00ff88",strokeWidth:"2"}),e.jsx("path",{d:"M12 6v6l4 2",stroke:"#00ff88",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}),"Tracking Shooters (Apex, Overwatch)"]}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.95rem",marginBottom:"1rem"},children:"These games feature high TTK, fast player movement, and verticality. You cannot rely on a single flick shot. Training must focus on:"}),e.jsxs("ul",{style:{paddingLeft:"1.2rem",color:"#9ca3af",fontSize:"0.9rem"},children:[e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{children:"Smooth Tracking:"})," Keeping the crosshair glued to a target that is strafing unpredictably."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{children:"Reactivity:"})," How quickly you can change the direction of your mouse when the enemy changes strafe direction."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{children:"Target Switching:"})," Rapidly transitioning fire from one low-HP target to another during team fights."]})]})]})]})]}),e.jsxs("section",{id:"aim-mechanics",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Core Aim Mechanics Explained"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Aiming is a cluster of distinct sub-skills. Identifying your weakest link can help you structure a more effective training routine."}),e.jsxs("div",{style:{background:"rgba(0,0,0,0.3)",borderRadius:"12px",padding:"1.5rem",marginBottom:"1.5rem",border:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("h3",{style:{color:"#fff",marginTop:0,marginBottom:"1rem"},children:"Visualizing Aim Mechanics"}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:"1rem"},children:[e.jsxs("div",{style:{textAlign:"center"},children:[e.jsxs("div",{style:{width:"80px",height:"80px",borderRadius:"50%",border:"2px dashed #4fc3f7",margin:"0 auto 0.5rem",position:"relative"},children:[e.jsx("div",{style:{position:"absolute",top:"50%",left:"50%",width:"10px",height:"10px",background:"#ff4444",borderRadius:"50%",transform:"translate(-50%, -50%)"}}),e.jsx("svg",{width:"80",height:"80",style:{position:"absolute",top:0,left:0},children:e.jsx("path",{d:"M 40,40 L 70,20",stroke:"#4fc3f7",strokeWidth:"2",markerEnd:"url(#arrowhead)"})})]}),e.jsx("span",{style:{fontSize:"0.85rem",color:"#9ca3af"},children:"Flicking"})]}),e.jsxs("div",{style:{textAlign:"center"},children:[e.jsxs("div",{style:{width:"80px",height:"80px",borderRadius:"50%",border:"2px solid rgba(255,255,255,0.1)",margin:"0 auto 0.5rem",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:"50%",left:"20%",width:"14px",height:"14px",background:"#00ff88",borderRadius:"50%",transform:"translate(-50%, -50%)"}}),e.jsx("svg",{width:"80",height:"80",style:{position:"absolute",top:0,left:0},children:e.jsx("path",{d:"M 16,40 Q 40,10 64,40",stroke:"#00ff88",strokeWidth:"2",fill:"none"})})]}),e.jsx("span",{style:{fontSize:"0.85rem",color:"#9ca3af"},children:"Tracking"})]})]})]}),e.jsxs("ul",{style:{paddingLeft:"1.5rem",marginBottom:"1rem"},children:[e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#00f5ff"},children:"Flicking:"})," The rapid, explosive movement of the crosshair to a target. It relies heavily on spatial memory and fast twitch responses."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#00ff88"},children:"Tracking:"})," Keeping the crosshair smoothly locked onto a moving target. Requires continuous visual processing."]}),e.jsxs("li",{style:{marginBottom:"0.5rem"},children:[e.jsx("strong",{style:{color:"#bf5af2"},children:"Crosshair Placement:"})," Pre-aiming at the exact height and angle where an enemy is likely to appear, minimizing the need for drastic flicks."]})]})]}),e.jsxs("section",{id:"ergonomics-grips",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Mouse Grips & Ergonomics"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"The way you interact physically with your mouse drastically impacts your aiming potential and long-term health. The Esports medical community frequently warns about Repetitive Strain Injuries (RSI) stemming from poor ergonomics."}),e.jsx("h3",{style:{fontSize:"1.4rem",color:"#fff",marginBottom:"1rem"},children:"The 3 Primary Mouse Grips"}),e.jsxs("ul",{style:{paddingLeft:"1.5rem",marginBottom:"1.5rem"},children:[e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Palm Grip:"})," The entire hand rests on the mouse. Offers high stability and smooth tracking control, but limits vertical range of motion. Great for low sensitivity players."]}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Claw Grip:"})," The base of the palm rests on the mouse, with fingers arched like a claw. Provides a hybrid of stability and quick micro-adjustment capabilities. The most popular grip among tactical shooter pros."]}),e.jsxs("li",{style:{marginBottom:"0.75rem"},children:[e.jsx("strong",{style:{color:"#fff"},children:"Fingertip Grip:"})," Only the fingertips touch the mouse. Offers maximum speed and vertical agility, but requires excellent fine motor control and can be fatiguing. Best for tracking-heavy games."]})]}),e.jsxs("div",{style:{background:"rgba(255,200,0,0.1)",borderLeft:"4px solid #ffcc00",padding:"1rem 1.5rem",borderRadius:"0 8px 8px 0"},children:[e.jsx("h4",{style:{color:"#ffcc00",marginTop:0,marginBottom:"0.5rem",fontSize:"1.1rem"},children:'Ergonomic Warning: Beware the "Death Grip"'}),e.jsx("p",{style:{color:"#cbd5e1",fontSize:"0.9rem",margin:0},children:'Squeezing your mouse too tightly (the "death grip") creates immense tension in your forearm flexors, leading to "aim shake" (micro-tremors) and significantly increasing the risk of carpal tunnel syndrome. Consciously practice a relaxed grip during aim training sessions.'})]})]}),e.jsxs("section",{id:"comparison",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"FixedAim vs. Desktop Trainers"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"How does our browser aim trainer stack up against heavy desktop clients like Aim Lab or KovaaK's?"}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:"0.9rem",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"rgba(79,195,247,0.1)",borderBottom:"1px solid rgba(79,195,247,0.3)"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",color:"#fff"},children:"Feature"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",color:"#4fc3f7"},children:"FixedAim"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",color:"#9ca3af"},children:"Desktop Trainers"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Installation Required"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88",fontWeight:"bold"},children:"No (Browser-based)"}),e.jsx("td",{style:{padding:"0.75rem",color:"#ff4444"},children:"Yes (10GB+ Downloads)"})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.01)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Account & Login"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88",fontWeight:"bold"},children:"Not Required"}),e.jsx("td",{style:{padding:"0.75rem",color:"#ff4444"},children:"Required"})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Engine Technology"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88",fontWeight:"bold"},children:"WebGL (Instant Load)"}),e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Unity / Unreal Engine"})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.01)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Custom Drills"}),e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1",fontWeight:"bold"},children:"Core fundamentals"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88"},children:"Extensive Sandbox"})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Updates & Patches"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88",fontWeight:"bold"},children:"Seamless (Always updated)"}),e.jsx("td",{style:{padding:"0.75rem",color:"#ff4444"},children:"Manual client updates"})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.01)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Performance Impact"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88",fontWeight:"bold"},children:"Ultra Lightweight"}),e.jsx("td",{style:{padding:"0.75rem",color:"#ff4444"},children:"Heavy CPU/GPU usage"})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Price"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88",fontWeight:"bold"},children:"100% Free"}),e.jsx("td",{style:{padding:"0.75rem",color:"#cbd5e1"},children:"Free or Paid"})]})]})]})})]}),e.jsxs("section",{id:"hardware",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Hardware & Settings Checklist"}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Your hardware settings determine the physical mapping between hand movement and crosshair movement. For the best training results, optimize the following:"}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:"0.9rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"rgba(0,245,255,0.08)",borderBottom:"1px solid rgba(0,245,255,0.2)"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",color:"#00f5ff"},children:"Setting / Hardware"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",color:"#00f5ff"},children:"Recommendation"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",color:"#00f5ff"},children:"Why it matters"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#fff",fontWeight:600},children:"Mouse DPI"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"400 - 1600 DPI"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"Lower DPI is standard for precision. Higher DPI reduces input delay marginally but requires very low in-game sensitivity."})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#fff",fontWeight:600},children:"Raw Input"}),e.jsx("td",{style:{padding:"0.75rem",color:"#00ff88"},children:"ON"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"Bypasses Windows mouse acceleration, ensuring 1:1 consistent mapping of physical to virtual movement."})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#fff",fontWeight:600},children:"Monitor Refresh Rate"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"144Hz+ Minimum"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"Provides more recent visual information, drastically improving tracking of fast-moving targets."})]}),e.jsxs("tr",{style:{borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"},children:[e.jsx("td",{style:{padding:"0.75rem",color:"#fff",fontWeight:600},children:"Mouse Weight"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"< 70 grams"}),e.jsx("td",{style:{padding:"0.75rem",color:"#9ca3af"},children:"Lighter mice have less inertia, making flicking and sudden stops significantly more precise."})]})]})]})})]}),e.jsxs("section",{id:"faq",style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontSize:"1.8rem",fontWeight:900,color:"#fff",marginBottom:"1.5rem",paddingLeft:"1rem",borderLeft:"4px solid rgba(0,245,255,0.7)",lineHeight:"1.2"},children:"Frequently Asked Questions"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[{q:"What is eDPI and why does it matter?",a:"eDPI (effective Dots Per Inch) is calculated by multiplying your mouse DPI by your in-game sensitivity. It acts as a universal metric allowing you to compare true sensitivities across different games and settings."},{q:"How often should I use an aim trainer?",a:"Consistency is key. 15-30 minutes daily is vastly superior to a single 3-hour session once a week. Aim for frequent, focused sessions without causing cognitive fatigue."},{q:"Can aim training improve my rank?",a:"Aim training can help elevate your mechanical baseline. However, ranking up also requires strong game sense, positioning, and team communication. Excellent mechanics complement good decision-making."},{q:"Is wrist aiming or arm aiming better?",a:"A combination is optimal. Use your arm for large, sweeping movements to protect your wrist, and use your wrist/fingertips for precise micro-adjustments."},{q:"Does mouse pad surface affect aim?",a:"Yes. Hard pads offer lower friction for faster flicks, while cloth pads offer more control and stopping power, which many players prefer for tactical shooters."},{q:'What is "aim shake" and how do I fix it?',a:"Aim shake often results from a tense grip (deathgripping) or high sensitivity. To fix it, consciously relax your hand, lower your sensitivity if necessary, and ensure proper desk ergonomics."},{q:"How long does it take to see results?",a:'While some players feel "warmed up" immediately, structural improvements to your mechanics typically take 2-4 weeks of consistent, daily practice to become noticeable in-game.'},{q:"Should I play with raw input on?",a:"Yes. Raw input bypasses Windows cursor acceleration, ensuring your sensitivity is perfectly linear at all speeds. You should enable raw input in every competitive FPS."},{q:"Does playing rhythm games help aim?",a:"Partially. Rhythm games improve hand-eye coordination and reaction speed, but the transfer is indirect compared to dedicated 3D aim training."},{q:"How does sleep affect aim?",a:"Sleep is when motor memories consolidate. Poor sleep measurably degrades reaction time and fine motor precision. Do not expect peak aiming performance if you are sleep-deprived."},{q:"What is crosshair placement?",a:"Crosshair placement is pre-aiming your crosshair at the exact height and angle where an enemy is likely to appear, significantly reducing the distance you need to flick."},{q:"Is higher FOV better for aiming?",a:"Higher FOV makes targets appear smaller and slower, while lower FOV makes them appear larger but faster. Your aim trainer FOV should exactly match your primary game for accurate muscle memory transfer."},{q:"Do heavier mice make aiming harder?",a:"Heavier mice have more inertia, making them harder to start and stop quickly. The competitive standard has largely shifted to lightweight mice (under 70g) for optimal control."}].map(({q:t,a:r},s)=>e.jsxs("details",{style:{background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"},children:[e.jsx("summary",{style:{fontSize:"1.1rem",fontWeight:700,color:"#fff",cursor:"pointer"},children:t}),e.jsx("p",{style:{marginTop:"0.75rem",color:"#cbd5e1",lineHeight:"1.6",marginBottom:0},children:r})]},s))})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:"1rem",flexWrap:"wrap",marginTop:"4rem",padding:"2rem 0",borderTop:"1px solid rgba(255,255,255,0.1)"},children:[e.jsx("a",{href:"/cps-test",style:{color:"#4fc3f7",textDecoration:"none",fontWeight:600},children:"CPS Test"}),e.jsx("span",{style:{color:"#4b5563"},children:"|"}),e.jsx("a",{href:"/reaction-time",style:{color:"#4fc3f7",textDecoration:"none",fontWeight:600},children:"Reaction Time"}),e.jsx("span",{style:{color:"#4b5563"},children:"|"}),e.jsx("a",{href:"/mouse-accuracy",style:{color:"#4fc3f7",textDecoration:"none",fontWeight:600},children:"Mouse Accuracy"}),e.jsx("span",{style:{color:"#4b5563"},children:"|"}),e.jsx("a",{href:"/typing-test",style:{color:"#4fc3f7",textDecoration:"none",fontWeight:600},children:"Typing Test"})]}),e.jsx("p",{style:{fontSize:"0.8rem",color:"#4b5563",textAlign:"center",marginTop:"2rem"},children:"This guide provides actionable insights for competitive players seeking to improve their mechanical skills through targeted practice."})]})]})}export{w as default};
