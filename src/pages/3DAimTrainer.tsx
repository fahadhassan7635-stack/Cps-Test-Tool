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
  <div class="sens-control">
      <div class="sens-label">Sensitivity</div>
      <input type="range" min="0.1" max="5.0" step="0.1" value="1.0" class="sens-slider" id="sens-slider-start">
      <div class="sens-value" id="sens-val-start">1.0x</div>
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
  <div class="sens-control" style="margin-bottom: 24px;">
      <div class="sens-label">Sensitivity</div>
      <input type="range" min="0.1" max="5.0" step="0.1" value="1.0" class="sens-slider" id="sens-slider-pause">
      <div class="sens-value" id="sens-val-pause">1.0x</div>
    </div>
    <button class="btn-primary" id="btn-resume">▶ Resume</button>
  <button class="btn-secondary" id="btn-restart">Restart</button>
  <button class="btn-secondary" id="btn-pause-menu" style="margin-top: 14px;">↩ Menu</button>
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
const baseLookSensitivity = 0.0018;
let userSensMultiplier = parseFloat(localStorage.getItem('aimTrainerSens')) || 1.0;
function applyMouseMove(dx, dy) {
  const finalSens = baseLookSensitivity * userSensMultiplier;
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= dx * finalSens;
  euler.x -= dy * finalSens;
  euler.x = Math.max(-PI_2 * 0.88, Math.min(PI_2 * 0.88, euler.x));
  camera.quaternion.setFromEuler(euler);
}
const setupSensUI = (idBase) => {
    const slider = document.getElementById('sens-slider-' + idBase);
    const valText = document.getElementById('sens-val-' + idBase);
    if (slider && valText) {
      slider.value = userSensMultiplier;
      valText.textContent = userSensMultiplier.toFixed(1) + 'x';
      slider.addEventListener('input', (e) => {
        userSensMultiplier = parseFloat(e.target.value);
        valText.textContent = userSensMultiplier.toFixed(1) + 'x';
        localStorage.setItem('aimTrainerSens', userSensMultiplier);
        const otherBase = idBase === 'start' ? 'pause' : 'start';
        const otherSlider = document.getElementById('sens-slider-' + otherBase);
        const otherVal = document.getElementById('sens-val-' + otherBase);
        if (otherSlider && otherVal) {
          otherSlider.value = userSensMultiplier;
          otherVal.textContent = userSensMultiplier.toFixed(1) + 'x';
        }
      });
    }
  };
  setupSensUI('start');
  setupSensUI('pause');

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
        
        {/* Table of Contents */}
        <nav aria-label="Table of Contents" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', marginTop: 0 }}>Table of Contents</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
            <li><a href="#introduction" style={{ color: '#4fc3f7', textDecoration: 'none' }}>1. Introduction to FPS Aim Training</a></li>
            <li><a href="#fixedaim-features" style={{ color: '#4fc3f7', textDecoration: 'none' }}>2. Why Choose FixedAim?</a></li>
            <li><a href="#how-to-use" style={{ color: '#4fc3f7', textDecoration: 'none' }}>3. How to Use FixedAim</a></li>
            <li><a href="#training-plan" style={{ color: '#4fc3f7', textDecoration: 'none' }}>4. 7-Day Beginner Training Plan</a></li>
            <li><a href="#game-specific" style={{ color: '#4fc3f7', textDecoration: 'none' }}>5. Game-Specific Aim Training (CS2, Valorant, Apex)</a></li>
            <li><a href="#aim-mechanics" style={{ color: '#4fc3f7', textDecoration: 'none' }}>6. Core Aim Mechanics Explained</a></li>
            <li><a href="#ergonomics-grips" style={{ color: '#4fc3f7', textDecoration: 'none' }}>7. Mouse Grips & Ergonomics</a></li>
            <li><a href="#comparison" style={{ color: '#4fc3f7', textDecoration: 'none' }}>8. FixedAim vs. Desktop Trainers</a></li>
            <li><a href="#hardware" style={{ color: '#4fc3f7', textDecoration: 'none' }}>9. Hardware & Settings Checklist</a></li>
            <li><a href="#faq" style={{ color: '#4fc3f7', textDecoration: 'none' }}>10. Frequently Asked Questions</a></li>
          </ul>
        </nav>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>The Ultimate Guide to FPS Aim Training</h1>
        
        <section id="introduction" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Introduction to FPS Aim Training</h2>
          <p style={{ marginBottom: '1rem' }}>
            Aim training in a three-dimensional environment has revolutionized how competitive gamers prepare for tactical shooters and battle royales. Unlike simple 2D clicker games, an online aim practice tool immerses you in a simulated spatial environment that requires precise camera rotation, crosshair placement, and depth perception.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            According to principles of <a href="https://en.wikipedia.org/wiki/Motor_learning" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>motor learning</a>, the specificity of practice is paramount. When you train in a dedicated 3D space, you are engaging the exact spatial awareness mechanisms relied upon in actual gameplay. Consistent, targeted repetition may lead to structural changes in the brain that support rapid, automatic execution of complex motor tasks, commonly referred to as building "muscle memory."
          </p>
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(79,195,247,0.3)', transition: 'transform 0.2s' }}>
              Start Training Now
            </button>
          </div>
        </section>

        <section id="fixedaim-features" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Why Choose FixedAim?</h2>
          <p style={{ marginBottom: '1rem' }}>
            Built by passionate developers and competitive gamers, FixedAim provides a seamless, friction-free environment to hone your mechanics. We understand that you want to train without bloat, loading screens, or paywalls.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { title: '100% Free & Unlocked', desc: 'No premium subscriptions or hidden features.' },
              { title: 'Browser-Based', desc: 'Runs directly in your browser. Compatible with Chrome, Edge, Firefox, and Safari.' },
              { title: 'No Installation', desc: 'Zero downloads required. Get straight into the action in seconds.' },
              { title: 'Privacy First', desc: 'No login required. Your data and stats stay local to your machine.' }
            ].map((feature, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#4fc3f7', marginBottom: '0.5rem', marginTop: 0 }}>{feature.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>Live Performance Tracking</h3>
          <p style={{ marginBottom: '1rem' }}>Our tool doesn't just let you shoot targets; it tracks every micro-movement to provide real-time performance statistics, including:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00f5ff' }}>Accuracy (%):</strong> Your precision rating. Hitting 90%+ consistently is better than missing fast.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00ff88' }}>Hits & Misses:</strong> Raw hit and miss counts to evaluate your volume of fire and trigger discipline.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#bf5af2' }}>Score:</strong> An aggregated point system rewarding both speed and accuracy.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#ffd60a' }}>Session Time:</strong> A live timer to ensure you don't overtrain and hit cognitive fatigue.</li>
          </ul>
        </section>
        
        <section id="how-to-use" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>How to Use FixedAim (Step-by-Step)</h2>
          <p style={{ marginBottom: '1rem' }}>Getting started with FixedAim is incredibly simple. Follow these steps to begin your first session:</p>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Match Your Sensitivity:</strong> Before starting, ensure your mouse DPI is set to your usual gaming standard (e.g., 400, 800, or 1600 DPI).</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Start the Trainer:</strong> Click the "Start Training" button at the top of the page. Your mouse cursor will lock to the screen for a true FPS experience.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Acquire Targets:</strong> 3D targets will spawn randomly in the virtual environment. Look around using your mouse.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Shoot and Track:</strong> Left-click to shoot. For moving targets, track them smoothly across your screen before firing.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Analyze Your Stats:</strong> Press ESC at any time to pause the game and unlock your cursor. Review your Accuracy, Hits, and Misses on the HUD.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Iterate and Repeat:</strong> Hit "Resume" to continue or "Restart" to wipe the slate clean and try for a higher score!</li>
          </ol>
        </section>
        
        <section id="training-plan" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>7-Day Beginner Training Plan</h2>
          <p style={{ marginBottom: '1rem' }}>Consistency is the secret to building mechanical skill. If you are new to aim training, follow this structured 7-day routine. Spend <strong>15 to 20 minutes daily</strong> on FixedAim to build foundational muscle memory without burning out.</p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1.25rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#4fc3f7' }}>Days 1 & 2: Accuracy Over Speed</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Focus purely on hitting the target. Do not rush your clicks. Aim for a minimum of <strong>90% accuracy</strong>. If you miss, slow down. This builds the initial neural pathways.</span>
              </li>
              <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#00ff88' }}>Days 3 & 4: Micro-Corrections</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Flick to the target quickly, but pause for a split-second to verify your crosshair is centered before clicking. Try to maintain <strong>85% accuracy</strong> while increasing initial flick speed.</span>
              </li>
              <li style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#bf5af2' }}>Days 5 & 6: Pushing the Pace</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Start trusting your muscle memory. Shoot the moment you feel the crosshair is on target. Your accuracy may drop to <strong>75-80%</strong>, but your targets-per-minute (Score) should increase significantly.</span>
              </li>
              <li>
                <strong style={{ color: '#ffd60a' }}>Day 7: The Benchmark Test</strong><br/>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Treat today as a ranked match. Do a 3-minute warm-up, then do 3 serious runs. Record your highest Score and Accuracy. This is your new baseline for the following week!</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="game-specific" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Game-Specific Aim Training</h2>
          <p style={{ marginBottom: '1rem' }}>Different first-person shooters demand entirely different subsets of aiming mechanics. Tailoring your training to the game you play is critical for competitive success.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(180deg, rgba(255,70,85,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(255,70,85,0.2)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ color: '#ff4655', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4655"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
                Tactical Shooters (Valorant, CS2)
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>Tactical FPS games have extremely low Time-To-Kill (TTK). A single headshot ends the fight. Therefore, training should prioritize:</p>
              <ul style={{ paddingLeft: '1.2rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Crosshair Placement:</strong> Pre-aiming corners at head height.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Micro-Flicks:</strong> Tiny, fast adjustments from a good crosshair position directly to the target's head.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Click Timing:</strong> Firing at the exact moment you counter-strafe to an absolute stop.</li>
              </ul>
            </div>
            
            <div style={{ background: 'linear-gradient(180deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ color: '#00ff88', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00ff88"><circle cx="12" cy="12" r="10" fill="none" stroke="#00ff88" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tracking Shooters (Apex, Overwatch)
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>These games feature high TTK, fast player movement, and verticality. You cannot rely on a single flick shot. Training must focus on:</p>
              <ul style={{ paddingLeft: '1.2rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Smooth Tracking:</strong> Keeping the crosshair glued to a target that is strafing unpredictably.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Reactivity:</strong> How quickly you can change the direction of your mouse when the enemy changes strafe direction.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Target Switching:</strong> Rapidly transitioning fire from one low-HP target to another during team fights.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="aim-mechanics" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Core Aim Mechanics Explained</h2>
          <p style={{ marginBottom: '1rem' }}>Aiming is a cluster of distinct sub-skills. Identifying your weakest link can help you structure a more effective training routine.</p>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>Visualizing Aim Mechanics</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed #4fc3f7', margin: '0 auto 0.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#ff4444', borderRadius: '50%', transform: 'translate(-50%, -50%)' }}></div>
                  <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0 }}><path d="M 40,40 L 70,20" stroke="#4fc3f7" strokeWidth="2" markerEnd="url(#arrowhead)"/></svg>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Flicking</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', margin: '0 auto 0.5rem', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: '50%', left: '20%', width: '14px', height: '14px', background: '#00ff88', borderRadius: '50%', transform: 'translate(-50%, -50%)' }}></div>
                   <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0 }}><path d="M 16,40 Q 40,10 64,40" stroke="#00ff88" strokeWidth="2" fill="none"/></svg>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Tracking</span>
              </div>
            </div>
          </div>

          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00f5ff' }}>Flicking:</strong> The rapid, explosive movement of the crosshair to a target. It relies heavily on spatial memory and fast twitch responses.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#00ff88' }}>Tracking:</strong> Keeping the crosshair smoothly locked onto a moving target. Requires continuous visual processing.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#bf5af2' }}>Crosshair Placement:</strong> Pre-aiming at the exact height and angle where an enemy is likely to appear, minimizing the need for drastic flicks.</li>
          </ul>
        </section>

        <section id="ergonomics-grips" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Mouse Grips & Ergonomics</h2>
          <p style={{ marginBottom: '1rem' }}>The way you interact physically with your mouse drastically impacts your aiming potential and long-term health. The Esports medical community frequently warns about Repetitive Strain Injuries (RSI) stemming from poor ergonomics.</p>
          
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>The 3 Primary Mouse Grips</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Palm Grip:</strong> The entire hand rests on the mouse. Offers high stability and smooth tracking control, but limits vertical range of motion. Great for low sensitivity players.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Claw Grip:</strong> The base of the palm rests on the mouse, with fingers arched like a claw. Provides a hybrid of stability and quick micro-adjustment capabilities. The most popular grip among tactical shooter pros.</li>
            <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fff' }}>Fingertip Grip:</strong> Only the fingertips touch the mouse. Offers maximum speed and vertical agility, but requires excellent fine motor control and can be fatiguing. Best for tracking-heavy games.</li>
          </ul>

          <div style={{ background: 'rgba(255,200,0,0.1)', borderLeft: '4px solid #ffcc00', padding: '1rem 1.5rem', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Ergonomic Warning: Beware the "Death Grip"</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
              Squeezing your mouse too tightly (the "death grip") creates immense tension in your forearm flexors, leading to "aim shake" (micro-tremors) and significantly increasing the risk of carpal tunnel syndrome. Consciously practice a relaxed grip during aim training sessions.
            </p>
          </div>
        </section>

        <section id="comparison" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>FixedAim vs. Desktop Trainers</h2>
          <p style={{ marginBottom: '1rem' }}>How does our browser aim trainer stack up against heavy desktop clients like Aim Lab or KovaaK's?</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ background: 'rgba(79,195,247,0.1)', borderBottom: '1px solid rgba(79,195,247,0.3)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#fff' }}>Feature</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4fc3f7' }}>FixedAim</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#9ca3af' }}>Desktop Trainers</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Installation Required</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>No (Browser-based)</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Yes (10GB+ Downloads)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Account & Login</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>Not Required</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Required</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Engine Technology</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>WebGL (Instant Load)</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Unity / Unreal Engine</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Custom Drills</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1', fontWeight: 'bold' }}>Core fundamentals</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88' }}>Extensive Sandbox</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Updates & Patches</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>Seamless (Always updated)</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Manual client updates</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Performance Impact</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>Ultra Lightweight</td>
                  <td style={{ padding: '0.75rem', color: '#ff4444' }}>Heavy CPU/GPU usage</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Price</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>100% Free</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>Free or Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="hardware" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Hardware & Settings Checklist</h2>
          <p style={{ marginBottom: '1rem' }}>Your hardware settings determine the physical mapping between hand movement and crosshair movement. For the best training results, optimize the following:</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,245,255,0.08)', borderBottom: '1px solid rgba(0,245,255,0.2)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00f5ff' }}>Setting / Hardware</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00f5ff' }}>Recommendation</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00f5ff' }}>Why it matters</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Mouse DPI</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>400 - 1600 DPI</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Lower DPI is standard for precision. Higher DPI reduces input delay marginally but requires very low in-game sensitivity.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Raw Input</td>
                  <td style={{ padding: '0.75rem', color: '#00ff88' }}>ON</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Bypasses Windows mouse acceleration, ensuring 1:1 consistent mapping of physical to virtual movement.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Monitor Refresh Rate</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>144Hz+ Minimum</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Provides more recent visual information, drastically improving tracking of fast-moving targets.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>Mouse Weight</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>&lt; 70 grams</td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>Lighter mice have less inertia, making flicking and sudden stops significantly more precise.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '4px solid rgba(0,245,255,0.7)', lineHeight: '1.2' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { q: 'What is eDPI and why does it matter?', a: 'eDPI (effective Dots Per Inch) is calculated by multiplying your mouse DPI by your in-game sensitivity. It acts as a universal metric allowing you to compare true sensitivities across different games and settings.' },
              { q: 'How often should I use an aim trainer?', a: 'Consistency is key. 15-30 minutes daily is vastly superior to a single 3-hour session once a week. Aim for frequent, focused sessions without causing cognitive fatigue.' },
              { q: 'Can aim training improve my rank?', a: 'Aim training can help elevate your mechanical baseline. However, ranking up also requires strong game sense, positioning, and team communication. Excellent mechanics complement good decision-making.' },
              { q: 'Is wrist aiming or arm aiming better?', a: 'A combination is optimal. Use your arm for large, sweeping movements to protect your wrist, and use your wrist/fingertips for precise micro-adjustments.' },
              { q: 'Does mouse pad surface affect aim?', a: 'Yes. Hard pads offer lower friction for faster flicks, while cloth pads offer more control and stopping power, which many players prefer for tactical shooters.' },
              { q: 'What is "aim shake" and how do I fix it?', a: 'Aim shake often results from a tense grip (deathgripping) or high sensitivity. To fix it, consciously relax your hand, lower your sensitivity if necessary, and ensure proper desk ergonomics.' },
              { q: 'How long does it take to see results?', a: 'While some players feel "warmed up" immediately, structural improvements to your mechanics typically take 2-4 weeks of consistent, daily practice to become noticeable in-game.' },
              { q: 'Should I play with raw input on?', a: 'Yes. Raw input bypasses Windows cursor acceleration, ensuring your sensitivity is perfectly linear at all speeds. You should enable raw input in every competitive FPS.' },
              { q: 'Does playing rhythm games help aim?', a: 'Partially. Rhythm games improve hand-eye coordination and reaction speed, but the transfer is indirect compared to dedicated 3D aim training.' },
              { q: 'How does sleep affect aim?', a: 'Sleep is when motor memories consolidate. Poor sleep measurably degrades reaction time and fine motor precision. Do not expect peak aiming performance if you are sleep-deprived.' },
              { q: 'What is crosshair placement?', a: 'Crosshair placement is pre-aiming your crosshair at the exact height and angle where an enemy is likely to appear, significantly reducing the distance you need to flick.' },
              { q: 'Is higher FOV better for aiming?', a: 'Higher FOV makes targets appear smaller and slower, while lower FOV makes them appear larger but faster. Your aim trainer FOV should exactly match your primary game for accurate muscle memory transfer.' },
              { q: 'Do heavier mice make aiming harder?', a: 'Heavier mice have more inertia, making them harder to start and stop quickly. The competitive standard has largely shifted to lightweight mice (under 70g) for optimal control.' }
            ].map(({ q, a }, i) => (
              <details key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' }}>
                <summary style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                  {q}
                </summary>
                <p style={{ marginTop: '0.75rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: 0 }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/cps-test" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>CPS Test</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/reaction-time" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Reaction Time</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/mouse-accuracy" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Mouse Accuracy</a>
          <span style={{ color: '#4b5563' }}>|</span>
          <a href="/typing-test" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Typing Test</a>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#4b5563', textAlign: 'center', marginTop: '2rem' }}>
          This guide provides actionable insights for competitive players seeking to improve their mechanical skills through targeted practice.
        </p>
      </article>




    </div>
  );
}







