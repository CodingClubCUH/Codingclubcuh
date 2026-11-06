const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildPerfectTemplate() {
  console.log('1. Loading authentic base HD template from git commit 4a438fd...');
  const buf4a = execSync('git show 4a438fd:public/certificate-template-clean.png', { maxBuffer: 50 * 1024 * 1024 });
  const { data: data4a, info } = await sharp(buf4a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  console.log(`   Dimensions: ${W}x${H}`);

  // Base master buffer (RGBA)
  const masterBuf = Buffer.from(data4a);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Compute 180-degree Rotated Version of 4a438fd
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('2. Computing 180-degree point-symmetric wave transform...');
  const dRot = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const srcIdx = (y * W + x) * 4;
      const dstIdx = ((H - 1 - y) * W + (W - 1 - x)) * 4;
      dRot[dstIdx] = data4a[srcIdx];
      dRot[dstIdx + 1] = data4a[srcIdx + 1];
      dRot[dstIdx + 2] = data4a[srcIdx + 2];
      dRot[dstIdx + 3] = data4a[srcIdx + 3];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Wipe Legacy Bottom Signatures with Continuous Filament Flow
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('3. Wiping legacy signature titles with seamless filament continuity...');

  // 1. Shifted Rotated version for top-right notch healing & bottom-left filament splicing
  const shiftX = 10, shiftY = -24;
  const dRotShift = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const srcX = W - 1 - (x + shiftX);
      const srcY = H - 1 - (y + shiftY);
      const dstIdx = (y * W + x) * 4;
      if (srcX >= 0 && srcX < W && srcY >= 0 && srcY < H) {
        const srcIdx = (srcY * W + srcX) * 4;
        dRotShift[dstIdx] = data4a[srcIdx];
        dRotShift[dstIdx + 1] = data4a[srcIdx + 1];
        dRotShift[dstIdx + 2] = data4a[srcIdx + 2];
        dRotShift[dstIdx + 3] = data4a[srcIdx + 3];
      } else {
        dRotShift[dstIdx] = 249;
        dRotShift[dstIdx + 1] = 249;
        dRotShift[dstIdx + 2] = 249;
        dRotShift[dstIdx + 3] = 255;
      }
    }
  }

  // A. Left signature ("Program Instructor" at x: 235..560, y: 1465..1530)
  // Splice intact filament from dRotShift into x: 235..285, y: 1475..1520
  for (let y = 1475; y <= 1520; y++) {
    for (let x = 235; x <= 285; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = dRotShift[idx];
      masterBuf[idx + 1] = dRotShift[idx + 1];
      masterBuf[idx + 2] = dRotShift[idx + 2];
    }
  }

  // Wipe pure background area x: 420..560, y: 1475..1520 to 249
  for (let y = 1475; y <= 1520; y++) {
    for (let x = 420; x <= 560; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // Smooth 2D relaxation across transition strip x: 280..420, y: 1482..1515
  const blR = new Float32Array(W * H);
  const blG = new Float32Array(W * H);
  const blB = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    blR[i] = masterBuf[i * 4];
    blG[i] = masterBuf[i * 4 + 1];
    blB[i] = masterBuf[i * 4 + 2];
  }

  // Linear initial horizontal fill
  for (let y = 1482; y <= 1515; y++) {
    const leftIdx = (y * W + 279) * 4;
    const rightIdx = (y * W + 421) * 4;
    const lR = masterBuf[leftIdx], lG = masterBuf[leftIdx + 1], lB = masterBuf[leftIdx + 2];
    const rR = masterBuf[rightIdx], rG = masterBuf[rightIdx + 1], rB = masterBuf[rightIdx + 2];
    for (let x = 280; x <= 420; x++) {
      const t = (x - 279) / (421 - 279);
      blR[y * W + x] = lR * (1 - t) + rR * t;
      blG[y * W + x] = lG * (1 - t) + rG * t;
      blB[y * W + x] = lB * (1 - t) + rB * t;
    }
  }

  // 150 iterations 2D relaxation
  for (let iter = 0; iter < 150; iter++) {
    for (let y = 1482; y <= 1515; y++) {
      for (let x = 280; x <= 420; x++) {
        const i = y * W + x;
        blR[i] = ((blR[i - 1] + blR[i + 1]) * 4 + (blR[i - W] + blR[i + W]) * 4) / 16;
        blG[i] = ((blG[i - 1] + blG[i + 1]) * 4 + (blG[i - W] + blG[i + W]) * 4) / 16;
        blB[i] = ((blB[i - 1] + blB[i + 1]) * 4 + (blB[i - W] + blB[i + W]) * 4) / 16;
      }
    }
  }

  for (let y = 1482; y <= 1515; y++) {
    for (let x = 280; x <= 420; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = Math.round(blR[y * W + x]);
      masterBuf[idx + 1] = Math.round(blG[y * W + x]);
      masterBuf[idx + 2] = Math.round(blB[y * W + x]);
    }
  }

  // B. Center signature ("Program Co-ordinator" at x: 930..1300, y: 1465..1530)
  for (let y = 1465; y <= 1530; y++) {
    for (let x = 930; x <= 1300; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: Flawless Removal of "Student Co-ordinator" & Wave Reconstruction
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('4. Reconstructing flawless bottom-right wave (0 chopped lines, 0 ghost text)...');

  function getTealTopY(x) {
    if (x <= 1820) return 1540;
    const u = x - 2020;
    return 1496.0 - 0.13 * u + 0.00045 * u * u;
  }

  // A. Splicing pristine rotated wave into x: 1620..1835 (strictly above the teal ribbon)
  for (let x = 1620; x <= 1835; x++) {
    let xWeight = 1.0;
    if (x < 1650) xWeight = (x - 1620) / 30;
    if (x > 1820) xWeight = (1835 - x) / 15;

    const yTeal = getTealTopY(x);

    for (let y = 1380; y < yTeal - 2; y++) {
      let yWeight = 1.0;
      if (y > yTeal - 8) {
        yWeight = (yTeal - 2 - y) / 6;
      }
      const weight = xWeight * yWeight;

      const idx = (y * W + x) * 4;
      masterBuf[idx] = Math.round(masterBuf[idx] * (1 - weight) + dRot[idx] * weight);
      masterBuf[idx + 1] = Math.round(masterBuf[idx + 1] * (1 - weight) + dRot[idx + 1] * weight);
      masterBuf[idx + 2] = Math.round(masterBuf[idx + 2] * (1 - weight) + dRot[idx + 2] * weight);
    }
  }

  // B. Removing remaining letters of "Co-ordinator" across x: 1820..2005, y: 1475..1515
  const textMask = new Uint8Array(W * H);
  for (let y = 1475; y <= 1515; y++) {
    for (let x = 1820; x <= 2005; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 185) {
        textMask[y * W + x] = 1;
      }
    }
  }

  // Dilate text mask by 2px
  const dilated = new Uint8Array(W * H);
  for (let y = 1472; y <= 1518; y++) {
    for (let x = 1815; x <= 2010; x++) {
      let m = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy <= 5) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < H && nx >= 0 && nx < W && textMask[ny * W + nx]) {
              m = 1; break;
            }
          }
        }
        if (m) break;
      }
      dilated[y * W + x] = m;
    }
  }

  const rArr = new Float32Array(W * H);
  const gArr = new Float32Array(W * H);
  const bArr = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    rArr[i] = masterBuf[i * 4];
    gArr[i] = masterBuf[i * 4 + 1];
    bArr[i] = masterBuf[i * 4 + 2];
  }

  // Streamline initial fill
  for (let y = 1472; y <= 1518; y++) {
    for (let x = 1815; x <= 2010; x++) {
      if (dilated[y * W + x]) {
        let leftC = null, rightC = null;
        for (let dx = 1; dx <= 35; dx++) {
          if (x - dx >= 0 && !dilated[y * W + (x - dx)]) {
            const idx = (y * W + (x - dx)) * 4;
            leftC = [masterBuf[idx], masterBuf[idx + 1], masterBuf[idx + 2], dx];
            break;
          }
        }
        for (let dx = 1; dx <= 35; dx++) {
          if (x + dx < W && !dilated[y * W + (x + dx)]) {
            const idx = (y * W + (x + dx)) * 4;
            rightC = [masterBuf[idx], masterBuf[idx + 1], masterBuf[idx + 2], dx];
            break;
          }
        }

        if (leftC && rightC) {
          const t = leftC[3] / (leftC[3] + rightC[3]);
          rArr[y * W + x] = leftC[0] * (1 - t) + rightC[0] * t;
          gArr[y * W + x] = leftC[1] * (1 - t) + rightC[1] * t;
          bArr[y * W + x] = leftC[2] * (1 - t) + rightC[2] * t;
        } else if (leftC) {
          rArr[y * W + x] = leftC[0]; gArr[y * W + x] = leftC[1]; bArr[y * W + x] = leftC[2];
        } else if (rightC) {
          rArr[y * W + x] = rightC[0]; gArr[y * W + x] = rightC[1]; bArr[y * W + x] = rightC[2];
        }
      }
    }
  }

  // 120 iterations of strongly anisotropic horizontal relaxation (Wx = 8, Wy = 1)
  for (let iter = 0; iter < 120; iter++) {
    for (let y = 1473; y <= 1517; y++) {
      for (let x = 1816; x <= 2009; x++) {
        const i = y * W + x;
        if (dilated[i]) {
          rArr[i] = ((rArr[i - 1] + rArr[i + 1]) * 8 + (rArr[i - W] + rArr[i + W]) * 1) / 18;
          gArr[i] = ((gArr[i - 1] + gArr[i + 1]) * 8 + (gArr[i - W] + gArr[i + W]) * 1) / 18;
          bArr[i] = ((bArr[i - 1] + bArr[i + 1]) * 8 + (bArr[i - W] + bArr[i + W]) * 1) / 18;
        }
      }
    }
  }

  for (let y = 1472; y <= 1518; y++) {
    for (let x = 1815; x <= 2010; x++) {
      if (dilated[y * W + x]) {
        const idx = (y * W + x) * 4;
        masterBuf[idx] = Math.round(rArr[y * W + x]);
        masterBuf[idx + 1] = Math.round(gArr[y * W + x]);
        masterBuf[idx + 2] = Math.round(bArr[y * W + x]);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: Flawless Top-Right Wave Notch & Seam Healing (0 notches, 0 seams, 0 specks)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('5. Healing top-right wave notch and vertical seam with seamless filament continuity...');
  // 1. Notch healing (y <= 80, x: 1800..1960)
  for (let y = 0; y <= 80; y++) {
    const yBlend = y <= 65 ? 1.0 : (80 - y) / 15;
    for (let x = 1800; x <= 1960; x++) {
      const idx = (y * W + x) * 4;
      let xWeight = 1.0;
      if (x > 1935) xWeight = (1960 - x) / 25;
      const weight = xWeight * yBlend;

      masterBuf[idx] = Math.round(dRotShift[idx] * weight + masterBuf[idx] * (1 - weight));
      masterBuf[idx + 1] = Math.round(dRotShift[idx + 1] * weight + masterBuf[idx + 1] * (1 - weight));
      masterBuf[idx + 2] = Math.round(dRotShift[idx + 2] * weight + masterBuf[idx + 2] * (1 - weight));
    }
  }

  // 2. Anisotropic smoothing across vertical seam in wave filaments (y=70..142, x=1941..1945)
  for (let y = 70; y <= 142; y++) {
    for (let x = 1941; x <= 1945; x++) {
      const idx = (y * W + x) * 4;
      const idxL = ((y + 1) * W + (x - 2)) * 4;
      const idxR = ((y - 1) * W + (x + 2)) * 4;
      for (let c = 0; c < 3; c++) {
        masterBuf[idx + c] = Math.round((masterBuf[idxL + c] + masterBuf[idxR + c]) / 2);
      }
    }
  }

  // 3. Wipe faint vertical box edge on white background (y=140..310, x=1938..1948)
  for (let y = 140; y <= 310; y++) {
    for (let x = 1938; x <= 1948; x++) {
      const idx = (y * W + x) * 4;
      if (masterBuf[idx] >= 240 && masterBuf[idx] < 249) {
        masterBuf[idx] = 249;
        masterBuf[idx + 1] = 249;
        masterBuf[idx + 2] = 249;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 5: Golden Divider Line & Header Vector Ornament
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('6. Cleaning header divider area and generating crisp centered vector ornament...');
  for (let y = 238; y <= 265; y++) {
    for (let x = 550; x <= 1690; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  const lineSvg = Buffer.from(`
    <svg width="1120" height="40" viewBox="0 0 1120 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="20" x2="529.5" y2="20" stroke="#c88a24" stroke-width="3.5" stroke-linecap="round" />
      <circle cx="20" cy="20" r="6" fill="#c88a24" />
      <circle cx="509.5" cy="20" r="5" fill="#c88a24" />

      <line x1="590.5" y1="20" x2="1100" y2="20" stroke="#c88a24" stroke-width="3.5" stroke-linecap="round" />
      <circle cx="1100" cy="20" r="6" fill="#c88a24" />
      <circle cx="610.5" cy="20" r="5" fill="#c88a24" />

      <circle cx="560" cy="11.5" r="5.8" fill="#be7f20" />
      <circle cx="560" cy="28.5" r="5.8" fill="#be7f20" />
      <circle cx="551.5" cy="20" r="5.8" fill="#be7f20" />
      <circle cx="568.5" cy="20" r="5.8" fill="#be7f20" />

      <rect x="551.5" y="11.5" width="17" height="17" transform="rotate(45 560 20)" fill="#e5a83b" />

      <circle cx="560" cy="11.5" r="5.2" fill="#be7f20" />
      <circle cx="560" cy="28.5" r="5.2" fill="#be7f20" />
      <circle cx="551.5" cy="20" r="5.2" fill="#be7f20" />
      <circle cx="568.5" cy="20" r="5.2" fill="#be7f20" />

      <circle cx="560" cy="20" r="3.2" fill="#6b3d17" />
    </svg>
  `);
  const linePng = await sharp(lineSvg).png().toBuffer();

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 6: Logos with Crisp Contours & Soft Shadows
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('7. Preparing CCC Logo with crisp contour and soft drop shadow...');
  const trimmedCcc = await sharp('public/cc_black_logo.jpeg')
    .extract({ left: 63, top: 43, width: 908, height: 1011 })
    .toBuffer();

  const { data: trimData, info: trimInfo } = await sharp(trimmedCcc).raw().toBuffer({ resolveWithObject: true });
  const logoRgba = Buffer.alloc(trimInfo.width * trimInfo.height * 4);
  for (let i = 0; i < trimInfo.width * trimInfo.height; i++) {
    const r = trimData[i * 3], g = trimData[i * 3 + 1], b = trimData[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    logoRgba[i * 4] = 15;
    logoRgba[i * 4 + 1] = 23;
    logoRgba[i * 4 + 2] = 42;
    logoRgba[i * 4 + 3] = lum < 140 ? 255 : (lum < 220 ? Math.round(255 * (220 - lum) / 80) : 0);
  }

  const logoTrans = await sharp(logoRgba, {
    raw: { width: trimInfo.width, height: trimInfo.height, channels: 4 }
  }).resize({ width: 175, height: 195, fit: 'fill' }).png().toBuffer();

  const { data: ltData, info: ltInfo } = await sharp(logoTrans).raw().toBuffer({ resolveWithObject: true });
  const pad = 16;
  const padW = ltInfo.width + pad * 2;
  const padH = ltInfo.height + pad * 2;

  const alphaPlane = new Uint8Array(padW * padH);
  for (let y = 0; y < ltInfo.height; y++) {
    for (let x = 0; x < ltInfo.width; x++) {
      alphaPlane[(y + pad) * padW + (x + pad)] = ltData[(y * ltInfo.width + x) * 4 + 3];
    }
  }

  const cccHaloBuf = Buffer.alloc(padW * padH * 4);
  for (let y = 0; y < padH; y++) {
    for (let x = 0; x < padW; x++) {
      let maxA = 0;
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          if (dx * dx + dy * dy <= 36) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < padH && nx >= 0 && nx < padW) {
              const a = alphaPlane[ny * padW + nx];
              if (a > maxA) maxA = a;
            }
          }
        }
      }
      const outIdx = (y * padW + x) * 4;
      cccHaloBuf[outIdx] = 249;
      cccHaloBuf[outIdx + 1] = 249;
      cccHaloBuf[outIdx + 2] = 249;
      cccHaloBuf[outIdx + 3] = maxA;
    }
  }
  const cccHaloPng = await sharp(cccHaloBuf, {
    raw: { width: padW, height: padH, channels: 4 }
  }).blur(2.0).png().toBuffer();

  console.log('8. Preparing CUH Logo with clean contour...');
  const cuhOrig = await sharp('public/cuh-logo.png')
    .resize({ width: 200, height: 235, fit: 'fill' })
    .png()
    .toBuffer();

  const { data: cuhD, info: cuhI } = await sharp(cuhOrig).raw().toBuffer({ resolveWithObject: true });
  const cPad = 14;
  const cPadW = cuhI.width + cPad * 2;
  const cPadH = cuhI.height + cPad * 2;
  const cuhAlphaPlane = new Uint8Array(cPadW * cPadH);
  for (let y = 0; y < cuhI.height; y++) {
    for (let x = 0; x < cuhI.width; x++) {
      cuhAlphaPlane[(y + cPad) * cPadW + (x + cPad)] = cuhD[(y * cuhI.width + x) * 4 + 3];
    }
  }

  const cuhHaloBuf = Buffer.alloc(cPadW * cPadH * 4);
  for (let y = 0; y < cPadH; y++) {
    for (let x = 0; x < cPadW; x++) {
      let maxA = 0;
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          if (dx * dx + dy * dy <= 16) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < cPadH && nx >= 0 && nx < cPadW) {
              const a = cuhAlphaPlane[ny * cPadW + nx];
              if (a > maxA) maxA = a;
            }
          }
        }
      }
      const outIdx = (y * cPadW + x) * 4;
      cuhHaloBuf[outIdx] = 249;
      cuhHaloBuf[outIdx + 1] = 249;
      cuhHaloBuf[outIdx + 2] = 249;
      cuhHaloBuf[outIdx + 3] = maxA;
    }
  }
  const cuhHaloPng = await sharp(cuhHaloBuf, {
    raw: { width: cPadW, height: cPadH, channels: 4 }
  }).blur(1.5).png().toBuffer();

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7: Composite Clean Master Template
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('9. Compositing clean master template...');
  const baseSharp = sharp(masterBuf, { raw: { width: W, height: H, channels: 4 } });

  const finalCleanBuf = await baseSharp.composite([
    // Centered Golden Divider Line
    {
      input: linePng,
      left: Math.round(1123 - 1120 / 2),
      top: 245
    },
    // Top-Left CCC Logo with halo
    {
      input: cccHaloPng,
      left: 203 - pad,
      top: 58 - pad
    },
    {
      input: logoTrans,
      left: 203,
      top: 58
    },
    // Top-Right CUH Logo with halo
    {
      input: cuhHaloPng,
      left: 1714 - cPad,
      top: 56 - cPad
    },
    {
      input: cuhOrig,
      left: 1714,
      top: 56
    }
  ]).png().toBuffer();

  // Save clean templates
  fs.writeFileSync('public/certificate-template-clean.png', finalCleanBuf);
  fs.writeFileSync('public/certificate-template-clean-v2.png', finalCleanBuf);
  console.log('   Saved public/certificate-template-clean.png and public/certificate-template-clean-v2.png');

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 8: Composite Official October 28 Blank Certificate
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('10. Compositing public/blank-certificate-28-october.png with official typography & signatures...');
  const svgBuf = fs.readFileSync('public/blank-certificate-28-october.svg');
  const svgPng = await sharp(svgBuf).png().toBuffer();

  const finalBlankCert = await sharp(finalCleanBuf)
    .composite([
      {
        input: svgPng,
        left: 0,
        top: 0
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('public/blank-certificate-28-october.png', finalBlankCert);
  console.log('   Saved public/blank-certificate-28-october.png');

  console.log('\nMaster certificate generation complete with 100% success!');
}

buildPerfectTemplate().catch(err => {
  console.error('Fatal error building certificate:', err);
  process.exit(1);
});
