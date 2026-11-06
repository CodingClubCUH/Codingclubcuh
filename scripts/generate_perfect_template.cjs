const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildPerfectTemplate() {
  console.log('1. Loading pristine base template from git commit 4a438fd...');
  
  // Base 4a438fd: original authentic HD template (2246 x 1588) with continuous right-margin wave,
  // clean watermark, and uncorrupted CUH background.
  const buf4a = execSync('git show 4a438fd:public/certificate-template-clean.png', { maxBuffer: 30 * 1024 * 1024 });
  const { data: data4a, info } = await sharp(buf4a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const masterBuf = Buffer.from(data4a);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Eliminate Baked Signature Titles ("Instructor", "Coordinator", "Student Co-ordinator")
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('2. Eliminating baked signature titles...');

  // A. Left signature ("Instructor" at x: 250..531, y: 1483..1515) -> pure off-white (249, 249, 249)
  for (let y = 1465; y <= 1530; y++) {
    for (let x = 235; x <= 560; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // B. Center signature ("Coordinator" at x: 948..1272, y: 1483..1514) -> pure off-white (249, 249, 249)
  for (let y = 1465; y <= 1530; y++) {
    for (let x = 930; x <= 1300; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // C. Right signature ("Student Co-ordinator" at x: 1685..1997, y: 1483..1507)
  // Reconstruct seamless teal wave gradient with 2D Laplace PDE diffusion over dilated mask.
  console.log('   Inpainting Student Co-ordinator with 2D Laplace diffusion (eliminating all ghost text)...');
  const brX0 = 1620, brY0 = 1450, brW = 440, brH = 85;
  const brMask = new Uint8Array(brW * brH);
  for (let y = 0; y < brH; y++) {
    for (let x = 0; x < brW; x++) {
      const idx = ((brY0 + y) * W + (brX0 + x)) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
      const isWave = (g - r >= 12) && (b - r >= 4) && (g >= 90);
      const isBg = (r >= 246 && g >= 246 && b >= 246);
      if (!isWave && !isBg) {
        brMask[y * brW + x] = 1;
      }
    }
  }

  // Dilate mask with radius 3 (euclidean circle) to envelope 100% of anti-aliasing text fringes
  const brDilated = new Uint8Array(brW * brH);
  for (let y = 0; y < brH; y++) {
    for (let x = 0; x < brW; x++) {
      let m = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx * dx + dy * dy <= 9) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < brH && nx >= 0 && nx < brW && brMask[ny * brW + nx]) {
              m = 1;
              break;
            }
          }
        }
        if (m) break;
      }
      brDilated[y * brW + x] = m;
    }
  }

  const rArr = new Float32Array(brW * brH);
  const gArr = new Float32Array(brW * brH);
  const bArr = new Float32Array(brW * brH);
  for (let y = 0; y < brH; y++) {
    for (let x = 0; x < brW; x++) {
      const idx = ((brY0 + y) * W + (brX0 + x)) * 4;
      rArr[y * brW + x] = masterBuf[idx];
      gArr[y * brW + x] = masterBuf[idx + 1];
      bArr[y * brW + x] = masterBuf[idx + 2];
    }
  }

  // Directional initial interpolation along gradient
  for (let x = 0; x < brW; x++) {
    for (let y = 0; y < brH; y++) {
      if (brDilated[y * brW + x]) {
        let topY = y - 1, botY = y + 1;
        while (topY >= 0 && brDilated[topY * brW + x]) topY--;
        while (botY < brH && brDilated[botY * brW + x]) botY++;
        if (topY < 0) topY = botY;
        if (botY >= brH) botY = topY;
        const d1 = y - topY, d2 = botY - y;
        const total = d1 + d2 || 1;
        rArr[y * brW + x] = (rArr[topY * brW + x] * d2 + rArr[botY * brW + x] * d1) / total;
        gArr[y * brW + x] = (gArr[topY * brW + x] * d2 + gArr[botY * brW + x] * d1) / total;
        bArr[y * brW + x] = (bArr[topY * brW + x] * d2 + bArr[botY * brW + x] * d1) / total;
      }
    }
  }

  // 200 iterations of 2D Laplace diffusion (Dirichlet harmonic boundary solver)
  for (let iter = 0; iter < 200; iter++) {
    for (let y = 1; y < brH - 1; y++) {
      for (let x = 1; x < brW - 1; x++) {
        const i = y * brW + x;
        if (brDilated[i]) {
          rArr[i] = (rArr[i - 1] + rArr[i + 1] + rArr[i - brW] + rArr[i + brW]) * 0.25;
          gArr[i] = (gArr[i - 1] + gArr[i + 1] + gArr[i - brW] + gArr[i + brW]) * 0.25;
          bArr[i] = (bArr[i - 1] + bArr[i + 1] + bArr[i - brW] + bArr[i + brW]) * 0.25;
        }
      }
    }
  }

  for (let y = 0; y < brH; y++) {
    for (let x = 0; x < brW; x++) {
      const idx = ((brY0 + y) * W + (brX0 + x)) * 4;
      masterBuf[idx] = Math.round(rArr[y * brW + x]);
      masterBuf[idx + 1] = Math.round(gArr[y * brW + x]);
      masterBuf[idx + 2] = Math.round(bArr[y * brW + x]);
      masterBuf[idx + 3] = 255;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Golden Divider Line & Header Vector Ornament
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('3. Cleaning header divider area and generating crisp centered vector ornament...');
  for (let y = 238; y <= 265; y++) {
    for (let x = 550; x <= 1690; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }
  for (let y = 5; y <= 25; y++) {
    for (let x = 1070; x <= 1120; x++) {
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
  // STEP 3: Natural Continuous Wave Healing (Eliminating Notch, Preserving Right Wave)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('4. Seamlessly healing top-right wave notch without mirroring any logos...');
  // The right margin wave from y: 0..1588 along x: 2040..2246 is 100% PRESERVED.
  // We ONLY bridge the wave across the notch in y: 50..85, x: 1920..2040.
  // We strictly require sr > 70 to guarantee NO dark logo pixels are ever copied!
  for (let y = 50; y <= 85; y++) {
    for (let x = 1920; x <= 2040; x++) {
      const srcX = W - 1 - x;
      const srcIdx = (y * W + srcX) * 4;
      const dstIdx = (y * W + x) * 4;
      const sr = data4a[srcIdx], sg = data4a[srcIdx + 1], sb = data4a[srcIdx + 2];
      const dr = masterBuf[dstIdx], dg = masterBuf[dstIdx + 1], db = masterBuf[dstIdx + 2];
      
      // If destination has the notch gap and source has the matching wave ribbon
      if (dr > 238 && dg > 238 && db > 238 && (sg - sr >= 10) && sr > 70) {
        masterBuf[dstIdx] = sr;
        masterBuf[dstIdx + 1] = sg;
        masterBuf[dstIdx + 2] = sb;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: Logos with Crisp Contours & Soft Shadows
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('5. Rendering crisp logos with clean contours...');
  
  // A. CCC Logo (Top Left at x: 218, y: 73)
  const trimmed = await sharp('public/cc_black_logo.jpeg')
    .extract({ left: 63, top: 43, width: 908, height: 1011 })
    .toBuffer();

  const { data: trimData, info: trimInfo } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  const logoRgba = Buffer.alloc(trimInfo.width * trimInfo.height * 4);
  for (let i = 0; i < trimInfo.width * trimInfo.height; i++) {
    const r = trimData[i * 3];
    const g = trimData[i * 3 + 1];
    const b = trimData[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let alpha = 0;
    if (lum > 30) {
      alpha = Math.min(255, Math.round(((lum - 30) / 165) * 255));
    }
    logoRgba[i * 4] = 15;     // Deep slate #0f172a
    logoRgba[i * 4 + 1] = 23;
    logoRgba[i * 4 + 2] = 42;
    logoRgba[i * 4 + 3] = alpha;
  }

  const cccW = 166;
  const cccH = 185;
  const highResLogo = await sharp(logoRgba, { raw: { width: trimInfo.width, height: trimInfo.height, channels: 4 } })
    .resize(cccW, cccH, { fit: 'fill' })
    .png()
    .toBuffer();

  const cccHaloSvg = Buffer.from(`
    <svg width="${cccW + 30}" height="${cccH + 30}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="c6" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="6" />
          <feFlood flood-color="#ffffff" flood-opacity="1" result="WHITE" />
          <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE" />
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#0f2942" flood-opacity="0.20" result="SHADOW" />
          <feMerge>
            <feMergeNode in="SHADOW" />
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <image href="data:image/png;base64,${highResLogo.toString('base64')}" x="15" y="15" width="${cccW}" height="${cccH}" filter="url(#c6)" />
    </svg>
  `);
  const cccWithContour = await sharp(cccHaloSvg).png().toBuffer();

  // B. HD CUH Logo (Top Right at exact original position left: 1714, top: 56)
  // Perfectly overlays the original crest with zero dark/black artifacts behind it
  const cuhW = 187;
  const cuhH = 220;
  const cuhResized = await sharp('public/cuh-logo.png')
    .resize(cuhW, cuhH, { fit: 'fill' })
    .png()
    .toBuffer();

  const cuhHaloSvg = Buffer.from(`
    <svg width="${cuhW + 30}" height="${cuhH + 30}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cuh-contour" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="3" />
          <feFlood flood-color="#ffffff" flood-opacity="1" result="WHITE" />
          <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE" />
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f2942" flood-opacity="0.16" result="SHADOW" />
          <feMerge>
            <feMergeNode in="SHADOW" />
            <feMergeNode in="OUTLINE" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <image href="data:image/png;base64,${cuhResized.toString('base64')}" x="15" y="15" width="${cuhW}" height="${cuhH}" filter="url(#cuh-contour)" />
    </svg>
  `);
  const cuhWithContour = await sharp(cuhHaloSvg).png().toBuffer();

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 5: Composite Clean Master Templates
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('6. Compositing master background templates...');
  const cleanMaster = await sharp(masterBuf, { raw: { width: W, height: H, channels: 4 } })
    .composite([
      { input: linePng, left: 563, top: 245 },
      { input: cccWithContour, left: 218 - 15, top: 73 - 15 },
      { input: cuhWithContour, left: 1714 - 15, top: 56 - 15 }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('public/certificate-template-clean.png', cleanMaster);
  fs.writeFileSync('public/certificate-template-clean-v2.png', cleanMaster);
  console.log('   Saved public/certificate-template-clean.png');
  console.log('   Saved public/certificate-template-clean-v2.png');

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 6: Render Static 28-October Certificate
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('7. Rendering public/blank-certificate-28-october.png...');
  const svgBuffer = fs.readFileSync('public/blank-certificate-28-october.svg');
  const blankWithText = await sharp(cleanMaster)
    .composite([
      { input: svgBuffer, left: 0, top: 0 }
    ])
    .png()
    .toBuffer();
  fs.writeFileSync('public/blank-certificate-28-october.png', blankWithText);
  console.log('   Saved public/blank-certificate-28-october.png');

  console.log('Build completed successfully!');
}

buildPerfectTemplate().catch(console.error);
