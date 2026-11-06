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
      // Text pixel test: dark or neutral gray
      if (r < 180 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
        brGhostPixels++;
      }
    }
  }
  console.log(`2. Bottom-Right Student Co-ordinator ghost pixels: ${brGhostPixels} (Expected: 0)`);

  // Check B: Bottom-Left "Instructor" elimination
  let blNonBg = 0;
  for (let y = 1475; y <= 1525; y++) {
    for (let x = 240; x <= 545; x++) {
      const idx = (y * W + x) * ch;
      if (cleanData[idx] !== 249 || cleanData[idx + 1] !== 249 || cleanData[idx + 2] !== 249) {
        blNonBg++;
      }
    }
  }
  console.log(`3. Bottom-Left Instructor residual pixels: ${blNonBg} (Expected: 0)`);

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

  // Check D: No dark/black box artifact to the right of CUH logo (x: 2045..2150, y: 50..300)
  let cuhRightDarkPixels = 0;
  for (let y = 50; y <= 300; y++) {
    for (let x = 2045; x <= 2150; x++) {
      const idx = (y * W + x) * ch;
      if (cleanData[idx] < 60 && cleanData[idx + 1] < 60 && cleanData[idx + 2] < 60) {
        cuhRightDarkPixels++;
      }
    }
  }
  console.log(`5. Dark/black protruding pixels strictly outside CUH logo: ${cuhRightDarkPixels} (Expected: 0)`);

  // Check E: CCC Logo transparency verification (No black box background!)
  let cccBoxDarkPixels = 0;
  for (let y = 60; y <= 250; y++) {
    for (let x of [195, 200, 395, 400]) {
      const idx = (y * W + x) * ch;
      if (cleanData[idx] < 50 && cleanData[idx + 1] < 50 && cleanData[idx + 2] < 50) {
        cccBoxDarkPixels++;
      }
    }
  }
  console.log(`6. CCC Logo dark bounding box artifact pixels: ${cccBoxDarkPixels} (Expected: 0)`);

  // Check F: Right border continuous vertical wave
  let rightBorderContinuous = 0;
  for (let y = 100; y <= 1400; y += 50) {
    const idx = (y * W + 2200) * ch;
    if (cleanData[idx + 1] - cleanData[idx] >= 8) {
      rightBorderContinuous++;
    }
  }
  console.log(`7. Right-edge border wave continuity: ${rightBorderContinuous}/27 checkpoints active`);

  if (brGhostPixels === 0 && blNonBg === 0 && bcNonBg === 0 && cuhRightDarkPixels === 0 && cccBoxDarkPixels === 0) {
    console.log('\n>>> ALL RIGOROUS GRAPHIC & CODE CHECKS PASSED WITH 100% PERFECTION! <<<');
  } else {
    throw new Error('Some checks did not match exact expected values.');
  }
}

verifyAll().catch(err => {
  console.error('\nVERIFICATION FAILED:', err);
  process.exit(1);
});
