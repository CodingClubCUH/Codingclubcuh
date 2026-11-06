const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildAuthenticMaster() {
  console.log('1. Loading authentic base HD template from commit 4a438fd...');
  const buf4a = execSync('git show 4a438fd:public/certificate-template-clean.png', { maxBuffer: 50 * 1024 * 1024 });
  const { data: data4a, info } = await sharp(buf4a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  console.log(`   Dimensions: ${W}x${H}`);

  const masterBuf = Buffer.from(data4a);

  // 180-degree Rotated Version of 4a438fd for seamless filament transforms
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

  // Shifted Rotated version for top-right notch healing & bottom-left filament splicing
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

  console.log('3. Healing old CCC logo zone in 4a438fd (zero ghost letters)...');
  // 1. Wipe pure background below y=150 in the old logo zone x: 200..400
  for (let y = 150; y <= 275; y++) {
    for (let x = 200; x <= 400; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // 2. Detect old dark C glyph pixels & old ODING text in y: 58..150, x: 200..390
  const cMask = new Uint8Array(W * H);
  for (let y = 58; y < 150; y++) {
    for (let x = 200; x <= 390; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 210 && (Math.abs(r - g) < 25 || (r < 70 && g >= 100 && g <= 180))) {
        cMask[y * W + x] = 1;
      }
    }
  }

  // Dilate by 2px to catch all edge antialiasing
  const dilatedCMask = new Uint8Array(W * H);
  for (let y = 56; y <= 152; y++) {
    for (let x = 198; x <= 392; x++) {
      let m = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy <= 5) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < H && nx >= 0 && nx < W && cMask[ny * W + nx]) {
              m = 1; break;
            }
          }
        }
        if (m) break;
      }
      dilatedCMask[y * W + x] = m;
    }
  }

  // Streamline interpolation
  for (let y = 56; y <= 152; y++) {
    for (let x = 198; x <= 392; x++) {
      if (dilatedCMask[y * W + x]) {
        let leftC = null, rightC = null;
        for (let dx = 1; dx <= 70; dx++) {
          if (x - dx >= 0 && !dilatedCMask[y * W + (x - dx)]) {
            const idx = (y * W + (x - dx)) * 4;
            leftC = [masterBuf[idx], masterBuf[idx+1], masterBuf[idx+2], dx];
            break;
          }
        }
        for (let dx = 1; dx <= 70; dx++) {
          if (x + dx < W && !dilatedCMask[y * W + (x + dx)]) {
            const idx = (y * W + (x + dx)) * 4;
            rightC = [masterBuf[idx], masterBuf[idx+1], masterBuf[idx+2], dx];
            break;
          }
        }
        if (leftC && rightC) {
          const t = leftC[3] / (leftC[3] + rightC[3]);
          const idx = (y * W + x) * 4;
          masterBuf[idx] = Math.round(leftC[0] * (1 - t) + rightC[0] * t);
          masterBuf[idx+1] = Math.round(leftC[1] * (1 - t) + rightC[1] * t);
          masterBuf[idx+2] = Math.round(leftC[2] * (1 - t) + rightC[2] * t);
        }
      }
    }
  }

  // 120 iterations 2D relaxation along streamline
  for (let iter = 0; iter < 120; iter++) {
    for (let y = 57; y <= 151; y++) {
      for (let x = 199; x <= 391; x++) {
        const i = y * W + x;
        if (dilatedCMask[i]) {
          const idx = i * 4;
          const idxL = (y * W + (x - 1)) * 4;
          const idxR = (y * W + (x + 1)) * 4;
          const idxU = ((y - 1) * W + x) * 4;
          const idxD = ((y + 1) * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            masterBuf[idx + c] = Math.round(((masterBuf[idxL+c] + masterBuf[idxR+c]) * 6 + (masterBuf[idxU+c] + masterBuf[idxD+c]) * 1) / 14);
          }
        }
      }
    }
  }

  console.log('4. Wiping legacy titles and healing signature background...');
  // A. Left signature ("Program Instructor" at x: 235..560, y: 1465..1530)
  for (let y = 1475; y <= 1520; y++) {
    for (let x = 235; x <= 285; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = dRotShift[idx];
      masterBuf[idx + 1] = dRotShift[idx + 1];
      masterBuf[idx + 2] = dRotShift[idx + 2];
    }
  }

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

  // C. Right signature ("Student Co-ordinator" elimination & 100% clearance for Dr. Nitin Goyal)
  console.log('5. Wiping Student Co-ordinator & ensuring 100% signature clearance for Dr. Nitin Goyal...');
  // Clear x: 1600..2075, y: 1440..1525 to pure #f9f9f9
  for (let y = 1440; y <= 1525; y++) {
    for (let x = 1600; x <= 2075; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
    // Smooth transition from x: 2075 to 2125 into the authentic border wave
    for (let x = 2076; x <= 2125; x++) {
      const t = (x - 2075) / 50;
      const smoothT = t * t * (3 - 2 * t);
      const idx = (y * W + x) * 4;
      masterBuf[idx] = Math.round(249 * (1 - smoothT) + masterBuf[idx] * smoothT);
      masterBuf[idx + 1] = Math.round(249 * (1 - smoothT) + masterBuf[idx + 1] * smoothT);
      masterBuf[idx + 2] = Math.round(249 * (1 - smoothT) + masterBuf[idx + 2] * smoothT);
    }
  }

  // Remove any remaining ghost letters in x: 1680..2020, y: 1475..1520
  for (let y = 1475; y <= 1520; y++) {
    for (let x = 1680; x <= 2020; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
      if (r < 235 && g < 235 && b < 235) {
        masterBuf[idx] = 249;
        masterBuf[idx + 1] = 249;
        masterBuf[idx + 2] = 249;
      }
    }
  }

  // Top-Right Wave Notch & Seam Healing
  console.log('6. Healing top-right wave notch and vertical seam...');
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

  // Header divider area clean & centered ornament
  console.log('7. Cleaning header divider area and generating crisp centered vector ornament...');
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

  // PERFECT Transparent CCC Logo (No black square box!)
  console.log('8. Preparing PERFECT Transparent CCC Logo (No black square box!)...');
  const { data: cccRaw, info: cccInfo } = await sharp('public/cc_black_logo.jpeg').raw().toBuffer({ resolveWithObject: true });
  const cccAlphaBuf = Buffer.alloc(cccInfo.width * cccInfo.height * 4);
  for (let i = 0; i < cccInfo.width * cccInfo.height; i++) {
    const r = cccRaw[i * 3], g = cccRaw[i * 3 + 1], b = cccRaw[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let alpha = 0;
    if (lum > 35) {
      alpha = Math.min(255, Math.round(((lum - 35) / 160) * 255));
    }
    // Deep slate #0f172a
    cccAlphaBuf[i * 4] = 15;
    cccAlphaBuf[i * 4 + 1] = 23;
    cccAlphaBuf[i * 4 + 2] = 42;
    cccAlphaBuf[i * 4 + 3] = alpha;
  }

  const cccTrimmed = await sharp(cccAlphaBuf, {
    raw: { width: cccInfo.width, height: cccInfo.height, channels: 4 }
  }).trim().toBuffer({ resolveWithObject: true });

  const cccH = 195;
  const cccW = Math.round(cccH * (cccTrimmed.info.width / cccTrimmed.info.height)); // ~175
  const cccResized = await sharp(cccTrimmed.data, {
    raw: { width: cccTrimmed.info.width, height: cccTrimmed.info.height, channels: 4 }
  }).resize(cccW, cccH).png().toBuffer();

  const cccHaloSvg = Buffer.from(`
    <svg width="${cccW + 24}" height="${cccH + 24}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cSoft" x="-15%" y="-15%" width="130%" height="130%">
          <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="2.5" />
          <feFlood flood-color="#ffffff" flood-opacity="0.95" result="WHITE" />
          <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE" />
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f2942" flood-opacity="0.16" result="SHADOW" />
          <feMerge>
            <feMergeNode in="SHADOW" />
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <image href="data:image/png;base64,${cccResized.toString('base64')}" x="12" y="12" width="${cccW}" height="${cccH}" filter="url(#cSoft)" />
    </svg>
  `);
  const cccLogoComposite = await sharp(cccHaloSvg).png().toBuffer();

  // CUH Logo with clean contour
  console.log('9. Preparing CUH Logo with clean contour...');
  const cuhW = 187, cuhH = 220;
  const cuhClean = await sharp('public/cuh-logo.png')
    .resize(cuhW, cuhH, { fit: 'contain' })
    .png()
    .toBuffer();

  const cuhHaloSvg = Buffer.from(`
    <svg width="${cuhW + 24}" height="${cuhH + 24}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cSoftCUH" x="-15%" y="-15%" width="130%" height="130%">
          <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="2" />
          <feFlood flood-color="#ffffff" flood-opacity="0.95" result="WHITE" />
          <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE" />
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f2942" flood-opacity="0.16" result="SHADOW" />
          <feMerge>
            <feMergeNode in="SHADOW" />
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <image href="data:image/png;base64,${cuhClean.toString('base64')}" x="12" y="12" width="${cuhW}" height="${cuhH}" filter="url(#cSoftCUH)" />
    </svg>
  `);
  const cuhLogoComposite = await sharp(cuhHaloSvg).png().toBuffer();

  console.log('10. Compositing clean master template...');
  const baseSharp = sharp(masterBuf, { raw: { width: W, height: H, channels: 4 } });

  const cccLeft = 212;
  const cccTop = 72;
  const cuhLeft = 1714;
  const cuhTop = 56;

  const finalCleanBuf = await baseSharp.composite([
    // Centered Golden Divider Line
    {
      input: linePng,
      left: Math.round(1123 - 1120 / 2),
      top: 245
    },
    // Top-Left CCC Logo with halo (NO black box!)
    {
      input: cccLogoComposite,
      left: cccLeft - 12,
      top: cccTop - 12
    },
    // Top-Right CUH Logo with halo
    {
      input: cuhLogoComposite,
      left: cuhLeft - 12,
      top: cuhTop - 12
    }
  ]).png().toBuffer();

  fs.writeFileSync('public/certificate-template-clean.png', finalCleanBuf);
  fs.writeFileSync('public/certificate-template-clean-v2.png', finalCleanBuf);
  console.log('   Saved public/certificate-template-clean.png and v2');

  console.log('11. Compositing blank certificate...');
  const svgBuf = fs.readFileSync('public/blank-certificate-28-october.svg');
  const svgPng = await sharp(svgBuf).png().toBuffer();

  const finalBlankCert = await sharp(finalCleanBuf)
    .composite([{ input: svgPng, left: 0, top: 0 }])
    .png()
    .toBuffer();

  fs.writeFileSync('public/blank-certificate-28-october.png', finalBlankCert);
  console.log('   Saved public/blank-certificate-28-october.png');
}

buildAuthenticMaster().catch(err => {
  console.error(err);
  process.exit(1);
});
