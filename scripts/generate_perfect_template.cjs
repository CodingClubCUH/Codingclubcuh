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
  // A. HEAL TOP-LEFT CCC LOGO ZONE (Restoring authentic triple silk ribbon)
  // -------------------------------------------------------------------
  console.log('2. Healing top-left CCC logo zone (zero notches, continuous silk ribbons)...');

  // Exact trajectory points measured from pristine authentic ribbons:
  const tealPoints = [
    { x: 100, y: 77.0, th: 14 },
    { x: 125, y: 83.0, th: 16 },
    { x: 150, y: 86.5, th: 18 },
    { x: 175, y: 88.0, th: 19 },
    { x: 200, y: 88.5, th: 20 },
    { x: 225, y: 85.0, th: 21 },
    { x: 250, y: 82.0, th: 22 },
    { x: 275, y: 76.0, th: 23 },
    { x: 300, y: 69.5, th: 24 },
    { x: 325, y: 64.0, th: 26 },
    { x: 350, y: 56.5, th: 28 },
    { x: 375, y: 48.0, th: 30 },
    { x: 400, y: 39.5, th: 31 },
    { x: 425, y: 30.5, th: 32 },
    { x: 450, y: 23.5, th: 28 },
    { x: 475, y: 19.0, th: 20 },
    { x: 500, y: 14.5, th: 12 },
    { x: 525, y: 10.0, th: 6 }
  ];

  const mintPoints = [
    { x: 100, y: 92.0, th: 12 },
    { x: 125, y: 101.0, th: 12 },
    { x: 150, y: 106.0, th: 12 },
    { x: 175, y: 111.0, th: 13 },
    { x: 200, y: 116.0, th: 13 },
    { x: 225, y: 119.0, th: 14 },
    { x: 250, y: 121.0, th: 14 },
    { x: 275, y: 122.0, th: 14 },
    { x: 300, y: 120.0, th: 14 },
    { x: 325, y: 117.5, th: 14 },
    { x: 350, y: 114.5, th: 14 },
    { x: 375, y: 111.0, th: 14 },
    { x: 400, y: 107.0, th: 13 },
    { x: 425, y: 101.0, th: 13 },
    { x: 450, y: 94.0, th: 12 },
    { x: 475, y: 85.0, th: 11 },
    { x: 500, y: 76.0, th: 10 }
  ];

  function interp(pts, x) {
    if (x <= pts[0].x) return { y: pts[0].y, th: pts[0].th };
    if (x >= pts[pts.length - 1].x) return { y: pts[pts.length - 1].y, th: pts[pts.length - 1].th };
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i].x && x <= pts[i + 1].x) {
        const t = (x - pts[i].x) / (pts[i + 1].x - pts[i].x);
        return {
          y: pts[i].y * (1 - t) + pts[i + 1].y * t,
          th: pts[i].th * (1 - t) + pts[i + 1].th * t
        };
      }
    }
    return { y: 0, th: 0 };
  }

  // Pure white wipe below mint ribbon in CCC area (y >= mintBot + 2, x: 190..420)
  for (let x = 190; x <= 420; x++) {
    const mint = interp(mintPoints, x);
    const cutoffY = Math.round(mint.y + mint.th / 2 + 2);
    for (let y = cutoffY; y <= 285; y++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  // Smooth ribbon restoration and blend across x: 190..420
  for (let x = 190; x <= 420; x++) {
    const teal = interp(tealPoints, x);
    const mint = interp(mintPoints, x);

    const tealTop = teal.y - teal.th / 2;
    const tealBot = teal.y + teal.th / 2;
    const mintTop = mint.y - mint.th / 2;
    const mintBot = mint.y + mint.th / 2;

    // Weight fades in from 190 to 220, fades out from 380 to 420
    let w = 1.0;
    if (x < 220) w = 0.5 * (1 - Math.cos(Math.PI * (x - 190) / 30));
    else if (x > 380) w = 0.5 * (1 + Math.cos(Math.PI * (x - 380) / 40));

    // 1. Teal Ribbon with antialiased edges
    for (let y = Math.round(tealTop - 3); y <= Math.round(tealBot + 3); y++) {
      const idx = (y * W + x) * 4;
      const distInside = Math.min(y - tealTop, tealBot - y);
      let targetR, targetG, targetB;
      if (distInside >= 1.5) {
        targetR = 0; targetG = 169; targetB = 157;
      } else if (distInside >= -1.0) {
        const alpha = (distInside + 1.0) / 2.5;
        targetR = Math.round(0 * alpha + 249 * (1 - alpha));
        targetG = Math.round(169 * alpha + 249 * (1 - alpha));
        targetB = Math.round(157 * alpha + 249 * (1 - alpha));
      } else {
        targetR = 249; targetG = 249; targetB = 249;
      }
      masterBuf[idx] = Math.round(targetR * w + masterBuf[idx] * (1 - w));
      masterBuf[idx + 1] = Math.round(targetG * w + masterBuf[idx + 1] * (1 - w));
      masterBuf[idx + 2] = Math.round(targetB * w + masterBuf[idx + 2] * (1 - w));
    }

    // 2. White gap between Teal and Lower Mint Ribbon
    for (let y = Math.round(tealBot + 3); y < Math.round(mintTop - 2); y++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = Math.round(249 * w + masterBuf[idx] * (1 - w));
      masterBuf[idx + 1] = Math.round(249 * w + masterBuf[idx + 1] * (1 - w));
      masterBuf[idx + 2] = Math.round(249 * w + masterBuf[idx + 2] * (1 - w));
    }

    // 3. Lower Mint Ribbon with antialiased edges
    for (let y = Math.round(mintTop - 2); y <= Math.round(mintBot + 2); y++) {
      const idx = (y * W + x) * 4;
      const distInside = Math.min(y - mintTop, mintBot - y);
      let targetR, targetG, targetB;
      if (distInside >= 1.0) {
        targetR = 155; targetG = 194; targetB = 179;
      } else if (distInside >= -1.0) {
        const alpha = (distInside + 1.0) / 2.0;
        targetR = Math.round(155 * alpha + 249 * (1 - alpha));
        targetG = Math.round(194 * alpha + 249 * (1 - alpha));
        targetB = Math.round(179 * alpha + 249 * (1 - alpha));
      } else {
        targetR = 249; targetG = 249; targetB = 249;
      }
      masterBuf[idx] = Math.round(targetR * w + masterBuf[idx] * (1 - w));
      masterBuf[idx + 1] = Math.round(targetG * w + masterBuf[idx + 1] * (1 - w));
      masterBuf[idx + 2] = Math.round(targetB * w + masterBuf[idx + 2] * (1 - w));
    }
  }

  // 15 passes relaxation in top-left for seamless silk texture
  for (let iter = 0; iter < 15; iter++) {
    for (let y = 30; y <= 145; y++) {
      for (let x = 185; x <= 425; x++) {
        const idx = (y * W + x) * 4;
        const idxL = (y * W + (x - 1)) * 4;
        const idxR = (y * W + (x + 1)) * 4;
        const idxU = ((y - 1) * W + x) * 4;
        const idxD = ((y + 1) * W + x) * 4;
        for (let c = 0; c < 3; c++) {
          masterBuf[idx + c] = Math.round(((masterBuf[idxL + c] + masterBuf[idxR + c]) * 5 + (masterBuf[idxU + c] + masterBuf[idxD + c]) * 2 + masterBuf[idx + c] * 2) / 16);
        }
      }
    }
  }

  // -------------------------------------------------------------------
  // B. PERFECT SYMMETRICAL MATCH FOR TOP-RIGHT WAVE
  // -------------------------------------------------------------------
  console.log('3. Mirroring pristine top-left wave to top-right for perfect symmetrical match...');
  for (let y = 0; y <= 400; y++) {
    for (let x = 0; x <= 720; x++) {
      const srcIdx = (y * W + x) * 4;
      const dstX = W - 1 - x;
      const dstIdx = (y * W + dstX) * 4;

      // Vertical blend into authentic right border wave at y: 280..400
      let weight = 1.0;
      if (y > 280) {
        weight = 0.5 * (1 + Math.cos(Math.PI * (y - 280) / 120));
      }
      // Horizontal edge blend near center
      if (x > 640) {
        weight *= (720 - x) / 80;
      }

      for (let c = 0; c < 3; c++) {
        masterBuf[dstIdx + c] = Math.round(masterBuf[srcIdx + c] * weight + masterBuf[dstIdx + c] * (1 - weight));
      }
    }
  }

  // -------------------------------------------------------------------
  // C. WIPE BOTTOM-LEFT PROGRAM INSTRUCTOR PRESERVING CONTINUOUS SILK WAVE
  // -------------------------------------------------------------------
  console.log('4. Wiping bottom-left legacy title with 100% continuous silk ribbons (no white box!)...');
  function getWaveY(px) {
    if (px <= 270) return 1450;
    if (px >= 420) return 1538;
    return 1450 + (px - 270) * (88 / 150);
  }

  // Outside wave ribbon: x >= 425, y: 1465..1530 to pure background 249
  for (let y = 1465; y <= 1530; y++) {
    for (let x = 425; x <= 600; x++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  for (let x = 360; x <= 425; x++) {
    const wy = getWaveY(x);
    for (let y = 1465; y < wy; y++) {
      const idx = (y * W + x) * 4;
      masterBuf[idx] = 249;
      masterBuf[idx + 1] = 249;
      masterBuf[idx + 2] = 249;
      masterBuf[idx + 3] = 255;
    }
  }

  const textMask = new Uint8Array(W * H);
  for (let y = 1472; y <= 1525; y++) {
    for (let x = 235; x <= 425; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 192 || (lum < 215 && (g - r) < 8)) {
        textMask[y * W + x] = 1;
      }
    }
  }

  const dilatedText = new Uint8Array(W * H);
  for (let y = 1470; y <= 1527; y++) {
    for (let x = 233; x <= 427; x++) {
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
      dilatedText[y * W + x] = m;
    }
  }

  for (let y = 1470; y <= 1527; y++) {
    for (let x = 233; x <= 427; x++) {
      if (dilatedText[y * W + x]) {
        const waveY = getWaveY(x);
        if (y < waveY) {
          const idx = (y * W + x) * 4;
          masterBuf[idx] = 249;
          masterBuf[idx + 1] = 249;
          masterBuf[idx + 2] = 249;
          dilatedText[y * W + x] = 0;
        }
      }
    }
  }

  const blSlope = 0.33;
  for (let y = 1470; y <= 1527; y++) {
    for (let x = 233; x <= 427; x++) {
      if (dilatedText[y * W + x]) {
        let c1 = null, c2 = null;
        for (let s = 1; s <= 20; s++) {
          const x1 = Math.round(x + s);
          const y1 = Math.round(y + s * blSlope);
          if (x1 < W && y1 < H && !dilatedText[y1 * W + x1] && !textMask[y1 * W + x1]) {
            const idx = (y1 * W + x1) * 4;
            c1 = [data4a[idx], data4a[idx + 1], data4a[idx + 2], s];
            break;
          }
        }
        for (let s = 1; s <= 20; s++) {
          const x2 = Math.round(x - s);
          const y2 = Math.round(y - s * blSlope);
          if (x2 >= 0 && y2 >= 0 && !dilatedText[y2 * W + x2] && !textMask[y2 * W + x2]) {
            const idx = (y2 * W + x2) * 4;
            c2 = [data4a[idx], data4a[idx + 1], data4a[idx + 2], s];
            break;
          }
        }
        const idx = (y * W + x) * 4;
        if (c1 && c2) {
          const t = c1[3] / (c1[3] + c2[3]);
          masterBuf[idx] = Math.round(c1[0] * (1 - t) + c2[0] * t);
          masterBuf[idx + 1] = Math.round(c1[1] * (1 - t) + c2[1] * t);
          masterBuf[idx + 2] = Math.round(c1[2] * (1 - t) + c2[2] * t);
        } else if (c1) {
          masterBuf[idx] = c1[0]; masterBuf[idx + 1] = c1[1]; masterBuf[idx + 2] = c1[2];
        } else if (c2) {
          masterBuf[idx] = c2[0]; masterBuf[idx + 1] = c2[1]; masterBuf[idx + 2] = c2[2];
        }
      }
    }
  }

  for (let iter = 0; iter < 20; iter++) {
    for (let y = 1471; y <= 1526; y++) {
      for (let x = 234; x <= 426; x++) {
        if (dilatedText[y * W + x]) {
          const idx = (y * W + x) * 4;
          const idxL = (y * W + (x - 1)) * 4;
          const idxR = (y * W + (x + 1)) * 4;
          const idxU = ((y - 1) * W + x) * 4;
          const idxD = ((y + 1) * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            masterBuf[idx + c] = Math.round(((masterBuf[idxL + c] + masterBuf[idxR + c]) * 5 + (masterBuf[idxU + c] + masterBuf[idxD + c])) / 12);
          }
        }
      }
    }
  }

  // Wipe center Coordinator to pure 249
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
  // D. BOTTOM-RIGHT WAVE (INPAINT 'Student Co-ordinator', KEEP CONTINUOUS WAVE)
  // -------------------------------------------------------------------
  console.log('5. Inpainting Student Co-ordinator with continuous silk wave...');
  const brTextMask = new Uint8Array(W * H);
  for (let y = 1475; y <= 1525; y++) {
    for (let x = 1680; x <= 2040; x++) {
      const idx = (y * W + x) * 4;
      const r = masterBuf[idx], g = masterBuf[idx + 1], b = masterBuf[idx + 2];
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
            leftC = [masterBuf[idx], masterBuf[idx + 1], masterBuf[idx + 2], step];
            break;
          }
        }
        for (let step = 1; step <= 50; step++) {
          const sx = Math.round(x + step * 2.5);
          const sy = Math.round(y - step * 0.7);
          if (sx >= 0 && sx < W && sy >= 0 && sy < H && !dilatedBR[sy * W + sx]) {
            const idx = (sy * W + sx) * 4;
            rightC = [masterBuf[idx], masterBuf[idx + 1], masterBuf[idx + 2], step];
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
            masterBuf[idx + c] = Math.round(((masterBuf[idxL + c] + masterBuf[idxR + c]) * 5 + (masterBuf[idxU + c] + masterBuf[idxD + c]) * 2) / 14);
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
