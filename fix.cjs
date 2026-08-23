const fs = require('fs');
const path = 'src/pages/3DAimTrainer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Replace the old const lookSensitivity + broken applyMouseMove
const oldJS = `const lookSensitivity = 0.0018;
  function applyMouseMove(dx, dy) {
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= dx * lookSensitivity;
    euler.x -= dy * lookSensitivity;`;

const newJS = `const baseLookSensitivity = 0.0018;
  let userSensMultiplier = parseFloat(localStorage.getItem('aimTrainerSens')) || 1.0;
  function applyMouseMove(dx, dy) {
    const finalSens = baseLookSensitivity * userSensMultiplier;
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= dx * finalSens;
    euler.x -= dy * finalSens;`;

if (content.includes(oldJS)) {
  content = content.replace(oldJS, newJS);
  console.log('Fix 1 applied: applyMouseMove updated');
} else {
  console.log('Fix 1 SKIPPED: target not found');
}

// Fix 2: Replace broken setupSensUI (missing otherSlider/otherVal) with correct version
const oldSetup = `const setupSensUI = (idBase) => {
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
            otherVal.textContent = userSensMultiplier.toFixed(1) + 'x';
          }
        });
      }
    };
  setupSensUI('start');
  setupSensUI('pause');`;

const newSetup = `const setupSensUI = (idBase) => {
    const slider = document.getElementById('sens-slider-' + idBase);
    const valText = document.getElementById('sens-val-' + idBase);
    if (slider && valText) {
      slider.value = userSensMultiplier;
      valText.textContent = userSensMultiplier.toFixed(1) + 'x';
      slider.addEventListener('input', (e) => {
        userSensMultiplier = parseFloat(e.target.value);
        valText.textContent = userSensMultiplier.toFixed(1) + 'x';
        localStorage.setItem('aimTrainerSens', String(userSensMultiplier));
        const otherBase = idBase === 'start' ? 'pause' : 'start';
        const otherSlider = document.getElementById('sens-slider-' + otherBase);
        const otherVal = document.getElementById('sens-val-' + otherBase);
        if (otherSlider && otherVal) {
          otherSlider.value = String(userSensMultiplier);
          otherVal.textContent = userSensMultiplier.toFixed(1) + 'x';
        }
      });
    }
  };
  setupSensUI('start');
  setupSensUI('pause');`;

if (content.includes(oldSetup)) {
  content = content.replace(oldSetup, newSetup);
  console.log('Fix 2 applied: setupSensUI fixed');
} else {
  console.log('Fix 2 SKIPPED: target not found');
}

fs.writeFileSync(path, content);
console.log('Done.');
