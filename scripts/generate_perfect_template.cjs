const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildFlawlessMaster() {
  console.log('1. Loading authentic base HD template from commit 4a438fd...');
  const buf4a = execSync('git show 4a438fd:public/certificate-template-clean.png', { maxBuffer: 50 * 1024 * 1024 });
  const { data: data4a, info } = await sharp(buf4a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  const masterBuf = Buffer.from(data4a);

  // -------------------------------------------------------------------
  // A. HEAL TOP-LEFT CCC LOGO ZONE (so wave behind logo is 100% continuous)
  // -------------------------------------------------------------------
  console.log('2. Healing top-left CCC logo zone...');
  for (let y = 150; y <= 275; y++) {
    for (let x = 200; x <= 400; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // Detect old dark C glyph pixels & old ODING text in y: 58..150, x: 200..390
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

  // -------------------------------------------------------------------
  // B. FLAWLESS TOP-RIGHT WAVE (eliminating notch and seam permanently!)
  // -------------------------------------------------------------------
  console.log('3. Synthesizing flawless top-right wave via symmetrical mirror...');
  for (let y = 0; y <= 450; y++) {
    for (let x = 0; x <= 620; x++) {
      const srcIdx = (y * W + x) * 4;
      const dstX = W - 1 - x;
      const dstIdx = (y * W + dstX) * 4;

      let weight = 1.0;
      if (y > 380) {
        weight *= (450 - y) / 70;
      }
      if (dstX < 1685) {
        weight *= (dstX - 1625) / 60;
      }

      masterBuf[dstIdx] = Math.round(masterBuf[srcIdx] * weight + masterBuf[dstIdx] * (1 - weight));
      masterBuf[dstIdx + 1] = Math.round(masterBuf[srcIdx + 1] * weight + masterBuf[dstIdx + 1] * (1 - weight));
      masterBuf[dstIdx + 2] = Math.round(masterBuf[srcIdx + 2] * weight + masterBuf[dstIdx + 2] * (1 - weight));
      masterBuf[dstIdx + 3] = 255;
    }
  }

  // -------------------------------------------------------------------
  // C. WIPE BOTTOM-LEFT & BOTTOM-CENTER TITLES
  // -------------------------------------------------------------------
  console.log('4. Wiping bottom-left and center legacy titles...');
  // Wipe Program Instructor in x: 280..600, y: 1465..1530 to pure background
  for (let y = 1465; y <= 1530; y++) {
    for (let x = 280; x <= 600; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // Inpaint the 'P' and 'r' in x: 245..280, y: 1475..1520 seamlessly along wave
  const pMask = new Uint8Array(W * H);
  for (let y = 1475; y <= 1520; y++) {
    for (let x = 245; x <= 280; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 205 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
        pMask[y * W + x] = 1;
      }
    }
  }

  const dilatedP = new Uint8Array(W * H);
  for (let y = 1473; y <= 1522; y++) {
    for (let x = 243; x <= 282; x++) {
      let m = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (pMask[(y + dy) * W + (x + dx)]) { m = 1; break; }
        }
        if (m) break;
      }
      dilatedP[y * W + x] = m;
    }
  }

  for (let y = 1473; y <= 1522; y++) {
    for (let x = 243; x <= 282; x++) {
      if (dilatedP[y * W + x]) {
        let leftC = null, rightC = null;
        for (let dx = 1; dx <= 30; dx++) {
          if (x - dx >= 0 && !dilatedP[y * W + (x - dx)]) {
            const idx = (y * W + (x - dx)) * 4;
            leftC = [masterBuf[idx], masterBuf[idx + 1], masterBuf[idx + 2], dx];
            break;
          }
        }
        for (let dx = 1; dx <= 30; dx++) {
          if (x + dx < W && !dilatedP[y * W + (x + dx)]) {
            const idx = (y * W + (x + dx)) * 4;
            rightC = [masterBuf[idx], masterBuf[idx + 1], masterBuf[idx + 2], dx];
            break;
          }
        }
        if (leftC && rightC) {
          const t = leftC[3] / (leftC[3] + rightC[3]);
          const idx = (y * W + x) * 4;
          masterBuf[idx] = Math.round(leftC[0] * (1 - t) + rightC[0] * t);
          masterBuf[idx + 1] = Math.round(leftC[1] * (1 - t) + rightC[1] * t);
          masterBuf[idx + 2] = Math.round(leftC[2] * (1 - t) + rightC[2] * t);
        }
      }
    }
  }

  for (let iter = 0; iter < 80; iter++) {
    for (let y = 1473; y <= 1522; y++) {
      for (let x = 243; x <= 282; x++) {
        if (dilatedP[y * W + x]) {
          const idx = (y * W + x) * 4;
          const idxL = (y * W + (x - 1)) * 4;
          const idxR = (y * W + (x + 1)) * 4;
          const idxU = ((y - 1) * W + x) * 4;
          const idxD = ((y + 1) * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            masterBuf[idx + c] = Math.round(((masterBuf[idxL + c] + masterBuf[idxR + c]) * 4 + (masterBuf[idxU + c] + masterBuf[idxD + c]) * 2) / 12);
          }
        }
      }
    }
  }

  for (let y = 1465; y <= 1530; y++) {
    for (let x = 930; x <= 1320; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // -------------------------------------------------------------------
  // D. FLAWLESS BOTTOM-RIGHT WAVE (INPAINT 'Student Co-ordinator', KEEP WAVE 100% CONTINUOUS!)
  // -------------------------------------------------------------------
  console.log('5. Inpainting Student Co-ordinator with continuous silk wave...');
  const brTextMask = new Uint8Array(W * H);
  for (let y = 1475; y <= 1525; y++) {
    for (let x = 1680; x <= 2040; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx+1], b = masterBuf[idx+2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 215 && (Math.abs(r - g) < 35 || (r < 75 && g < 85 && b < 95))) {
        brTextMask[y * W + x] = 1;
      }
    }
  }

  const dilatedBR = new Uint8Array(W * H);
  for (let y = 1473; y <= 1527; y++) {
    for (let x = 1678; x <= 2042; x++) {
      let m = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy <= 5) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < H && nx >= 0 && nx < W && brTextMask[ny * W + nx]) {
              m = 1; break;
            }
          }
        }
        if (m) break;
      }
      dilatedBR[y * W + x] = m;
    }
  }

  for (let y = 1473; y <= 1527; y++) {
    for (let x = 1678; x <= 2042; x++) {
      if (dilatedBR[y * W + x]) {
        let leftC = null, rightC = null;
        for (let step = 1; step <= 50; step++) {
          const sx = Math.round(x - step * 2.5);
          const sy = Math.round(y + step * 0.7);
          if (sx >= 0 && sx < W && sy >= 0 && sy < H && !dilatedBR[sy * W + sx]) {
            const idx = (sy * W + sx) * 4;
            leftC = [masterBuf[idx], masterBuf[idx+1], masterBuf[idx+2], step];
            break;
          }
        }
        for (let step = 1; step <= 50; step++) {
          const sx = Math.round(x + step * 2.5);
          const sy = Math.round(y - step * 0.7);
          if (sx >= 0 && sx < W && sy >= 0 && sy < H && !dilatedBR[sy * W + sx]) {
            const idx = (sy * W + sx) * 4;
            rightC = [masterBuf[idx], masterBuf[idx+1], masterBuf[idx+2], step];
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

  for (let iter = 0; iter < 100; iter++) {
    for (let y = 1473; y <= 1527; y++) {
      for (let x = 1678; x <= 2042; x++) {
        const i = y * W + x;
        if (dilatedBR[i]) {
          const idx = i * 4;
          const idxL = (y * W + (x - 1)) * 4;
          const idxR = (y * W + (x + 1)) * 4;
          const idxU = ((y - 1) * W + x) * 4;
          const idxD = ((y + 1) * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            masterBuf[idx + c] = Math.round(((masterBuf[idxL+c] + masterBuf[idxR+c]) * 5 + (masterBuf[idxU+c] + masterBuf[idxD+c]) * 2) / 14);
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------
  // E. CLEAN HEADER DIVIDER & CENTERED VECTOR ORNAMENT
  // -------------------------------------------------------------------
  console.log('6. Cleaning header divider area and generating ornament...');
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

  // -------------------------------------------------------------------
  // F. 100% TRANSPARENT CCC LOGO (NO BLACK BOX!)
  // -------------------------------------------------------------------
  console.log('7. Preparing transparent CCC logo...');
  const { data: cccRaw, info: cccInfo } = await sharp('public/cc_black_logo.jpeg').raw().toBuffer({ resolveWithObject: true });
  const cccAlphaBuf = Buffer.alloc(cccInfo.width * cccInfo.height * 4);
  for (let i = 0; i < cccInfo.width * cccInfo.height; i++) {
    const r = cccRaw[i * 3], g = cccRaw[i * 3 + 1], b = cccRaw[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let alpha = 0;
    if (lum > 35) {
      alpha = Math.min(255, Math.round(((lum - 35) / 160) * 255));
    }
    cccAlphaBuf[i * 4] = 15;
    cccAlphaBuf[i * 4 + 1] = 23;
    cccAlphaBuf[i * 4 + 2] = 42;
    cccAlphaBuf[i * 4 + 3] = alpha;
  }

  const cccTrimmed = await sharp(cccAlphaBuf, {
    raw: { width: cccInfo.width, height: cccInfo.height, channels: 4 }
  }).trim().toBuffer({ resolveWithObject: true });

  const cccH = 195;
  const cccW = Math.round(cccH * (cccTrimmed.info.width / cccTrimmed.info.height));
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

  // -------------------------------------------------------------------
  // G. CUH LOGO WITH CRISP CONTOUR
  // -------------------------------------------------------------------
  console.log('8. Preparing CUH logo with clean contour...');
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

  // -------------------------------------------------------------------
  // H. COMPOSITE CLEAN MASTER TEMPLATE
  // -------------------------------------------------------------------
  console.log('9. Compositing clean master template...');
  const cccLeft = 212, cccTop = 72;
  const cuhLeft = 1714, cuhTop = 56;

  const baseSharp = sharp(masterBuf, { raw: { width: W, height: H, channels: 4 } });
  const finalCleanBuf = await baseSharp.composite([
    {
      input: linePng,
      left: Math.round(1123 - 1120 / 2),
      top: 245
    },
    {
      input: cccLogoComposite,
      left: cccLeft - 12,
      top: cccTop - 12
    },
    {
      input: cuhLogoComposite,
      left: cuhLeft - 12,
      top: cuhTop - 12
    }
  ]).png().toBuffer();

  // -------------------------------------------------------------------
  // I. COMPOSITE BLANK CERTIFICATE
  // -------------------------------------------------------------------
  console.log('10. Compositing blank certificate...');
  const svgBuf = fs.readFileSync('public/blank-certificate-28-october.svg');
  const svgPng = await sharp(svgBuf).resize(W, H).png().toBuffer();

  const finalBlankCert = await sharp(finalCleanBuf)
    .composite([{ input: svgPng, left: 0, top: 0 }])
    .png()
    .toBuffer();

  fs.writeFileSync('public/certificate-template-clean.png', finalCleanBuf);
  fs.writeFileSync('public/certificate-template-clean-v2.png', finalCleanBuf);
  fs.writeFileSync('public/blank-certificate-28-october.png', finalBlankCert);
  console.log('   All templates written successfully!');
}

buildFlawlessMaster().catch(err => {
  console.error(err);
  process.exit(1);
});
