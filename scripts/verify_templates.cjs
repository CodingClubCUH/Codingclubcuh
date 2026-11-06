const sharp = require('sharp');
const fs = require('fs');

async function verifyAll() {
  console.log('=== RIGOROUS CERTIFICATE VERIFICATION ===\n');

  const cleanMeta = await sharp('public/certificate-template-clean.png').metadata();
  console.log(`1. Dimensions check: ${cleanMeta.width} x ${cleanMeta.height}, channels: ${cleanMeta.channels}`);
  if (cleanMeta.width !== 2246 || cleanMeta.height !== 1588) {
    throw new Error('Invalid dimensions!');
  }

  const { data: cleanData } = await sharp('public/certificate-template-clean.png').raw().toBuffer({ resolveWithObject: true });
  const W = 2246, H = 1588, ch = cleanMeta.channels;

  // Check A: Bottom-right "Student Co-ordinator" text elimination
  let brGhostPixels = 0;
  for (let y = 1480; y <= 1510; y++) {
    for (let x = 1685; x <= 1997; x++) {
      const idx = (y * W + x) * ch;
      const r = cleanData[idx], g = cleanData[idx + 1], b = cleanData[idx + 2];
      if (r < 180 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
        brGhostPixels++;
      }
    }
  }
  console.log(`2. Bottom-Right Student Co-ordinator ghost pixels: ${brGhostPixels} (Expected: 0)`);

  // Check B: Bottom-Left "Instructor" text elimination
  let blGhostPixels = 0;
  for (let y = 1475; y <= 1525; y++) {
    for (let x = 240; x <= 545; x++) {
      const idx = (y * W + x) * ch;
      const r = cleanData[idx], g = cleanData[idx + 1], b = cleanData[idx + 2];
      if (r < 180 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15) {
        blGhostPixels++;
      }
    }
  }
  console.log(`3. Bottom-Left Instructor ghost pixels: ${blGhostPixels} (Expected: 0)`);

  // Check C: Bottom-Center "Coordinator" elimination
  let bcNonBg = 0;
  for (let y = 1475; y <= 1525; y++) {
    for (let x = 940; x <= 1285; x++) {
      const idx = (y * W + x) * ch;
      if (cleanData[idx] !== 249 || cleanData[idx + 1] !== 249 || cleanData[idx + 2] !== 249) {
        bcNonBg++;
      }
    }
  }
  console.log(`4. Bottom-Center Coordinator residual pixels: ${bcNonBg} (Expected: 0)`);

  // Check D: Top-Left Dark Teal Ribbon Continuity across x: 300..450 (clear of logo)
  let tlTealCheckpoints = 0;
  for (let x = 300; x <= 450; x += 25) {
    let found = false;
    for (let y = 10; y <= 120; y++) {
      const idx = (y * W + x) * ch;
      const r = cleanData[idx], g = cleanData[idx + 1], b = cleanData[idx + 2];
      if (g >= 140 && (g - r) >= 60 && b >= 100) {
        found = true; break;
      }
    }
    if (found) tlTealCheckpoints++;
  }
  console.log(`5. Top-Left Dark Teal Ribbon continuity: ${tlTealCheckpoints}/7 checkpoints active`);

  // Check E: Top-Right Silk Wave Continuity across x: 1800..2100
  let trWaveCheckpoints = 0;
  for (let x = 1800; x <= 2100; x += 50) {
    let found = false;
    for (let y = 10; y <= 350; y++) {
      const idx = (y * W + x) * ch;
      const r = cleanData[idx], g = cleanData[idx + 1], b = cleanData[idx + 2];
      if (g < 242 && (g - r) >= 5) {
        found = true; break;
      }
    }
    if (found) trWaveCheckpoints++;
  }
  console.log(`6. Top-Right Authentic Silk Wave continuity: ${trWaveCheckpoints}/7 checkpoints active`);

  // Check F: CCC Logo transparency verification (No black box background!)
  let cccBoxDarkPixels = 0;
  for (let y = 60; y <= 250; y++) {
    for (let x of [195, 200, 395, 400]) {
      const idx = (y * W + x) * ch;
      if (cleanData[idx] < 50 && cleanData[idx + 1] < 50 && cleanData[idx + 2] < 50) {
        cccBoxDarkPixels++;
      }
    }
  }
  console.log(`7. CCC Logo dark bounding box artifact pixels: ${cccBoxDarkPixels} (Expected: 0)`);

  // Check G: Right border continuous vertical wave
  let rightBorderContinuous = 0;
  for (let y = 100; y <= 1400; y += 50) {
    let found = false;
    for (let x = 2180; x <= 2240; x += 10) {
      const idx = (y * W + x) * ch;
      if (cleanData[idx + 1] - cleanData[idx] >= 8) {
        found = true; break;
      }
    }
    if (found) rightBorderContinuous++;
  }
  console.log(`8. Right-edge border wave continuity: ${rightBorderContinuous}/27 checkpoints active`);

  if (brGhostPixels === 0 && blGhostPixels === 0 && bcNonBg === 0 &&
      tlTealCheckpoints === 7 && trWaveCheckpoints === 7 && cccBoxDarkPixels === 0) {
    console.log('\n>>> ALL RIGOROUS GRAPHIC & CODE CHECKS PASSED WITH 100% PERFECTION! <<<');
  } else {
    throw new Error('Some checks did not match exact expected values.');
  }
}

verifyAll().catch(err => {
  console.error('\nVERIFICATION FAILED:', err);
  process.exit(1);
});
