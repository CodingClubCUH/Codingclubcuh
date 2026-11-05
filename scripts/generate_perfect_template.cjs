const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildPerfectTemplate() {
  console.log('1. Loading base templates from git history...');
  
  // Base 4267a98 (clean dynamic template with correct dimensions 2246 x 1588)
  const buf42 = execSync('git show 4267a98:public/certificate-template-clean-v2.png', { maxBuffer: 30 * 1024 * 1024 });
  const { data: data42, info } = await sharp(buf42).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const masterBuf = Buffer.from(data42);

  // Base 4a438fd (for pristine bottom-right wave with full original colors)
  const buf4a = execSync('git show 4a438fd:public/certificate-template-clean.png', { maxBuffer: 30 * 1024 * 1024 });
  const { data: data4a } = await sharp(buf4a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Golden divider line cleanup & crisp vector replacement
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('2. Cleaning header divider area and generating crisp vector ornament...');
  for (let y = 240; y <= 305; y++) {
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
  // STEP 2: Perfect Continuous Top-Right Wave (Eliminating Notch / Cuts)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('3. Synthesizing perfectly continuous top-right wave from clean top-left...');
  // Mirror top-left wave (x: 0..650) to top-right (x: 1596..2245)
  for (let y = 0; y < 450; y++) {
    for (let x = 1596; x < W; x++) {
      const srcX = W - 1 - x;
      const srcIdx = (y * W + srcX) * 4;
      const dstIdx = (y * W + x) * 4;
      
      let blend = 1.0;
      if (x < 1646) {
        blend = (x - 1596) / 50;
      }
      if (y > 400) {
        blend = Math.min(blend, (450 - y) / 50);
      }
      
      masterBuf[dstIdx] = Math.round(masterBuf[dstIdx] * (1 - blend) + data42[srcIdx] * blend);
      masterBuf[dstIdx + 1] = Math.round(masterBuf[dstIdx + 1] * (1 - blend) + data42[srcIdx + 1] * blend);
      masterBuf[dstIdx + 2] = Math.round(masterBuf[dstIdx + 2] * (1 - blend) + data42[srcIdx + 2] * blend);
      masterBuf[dstIdx + 3] = 255;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: Perfect Continuous Bottom-Right Wave (Eliminating Washed-Out Box)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('4. Restoring seamless bottom-right wave from pristine original...');
  // In 4a438fd, the bottom-right wave is intact and rich in color.
  // We inpaint the thin text letters in x: 1600..2050, y: 1440..1520 so no rectangular patch exists.
  const isDarkText = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return false;
    const idx = (y * W + x) * 4;
    const r = data4a[idx], g = data4a[idx+1], b = data4a[idx+2];
    return (r < 125 && g < 125 && b < 125 && Math.abs(r - g) < 20);
  };

  const brCleanBuf = Buffer.from(data4a);
  for (let iter = 0; iter < 5; iter++) {
    for (let y = 1440; y <= 1520; y++) {
      for (let x = 1600; x <= 2050; x++) {
        if (isDarkText(x, y)) {
          let topY = y - 1, botY = y + 1;
          while (topY > 1430 && isDarkText(x, topY)) topY--;
          while (botY < 1530 && isDarkText(x, botY)) botY++;
          
          const topIdx = (topY * W + x) * 4;
          const botIdx = (botY * W + x) * 4;
          const dTop = y - topY;
          const dBot = botY - y;
          const totalD = dTop + dBot;
          
          const idx = (y * W + x) * 4;
          brCleanBuf[idx] = Math.round((brCleanBuf[topIdx] * dBot + brCleanBuf[botIdx] * dTop) / totalD);
          brCleanBuf[idx+1] = Math.round((brCleanBuf[topIdx+1] * dBot + brCleanBuf[botIdx+1] * dTop) / totalD);
          brCleanBuf[idx+2] = Math.round((brCleanBuf[topIdx+2] * dBot + brCleanBuf[botIdx+2] * dTop) / totalD);
          brCleanBuf[idx+3] = 255;
        }
      }
    }
  }

  // Copy pristine BR wave into masterBuf for x: 1546..2246, y: 1150..1588 with smooth edge blending
  for (let y = 1150; y < H; y++) {
    for (let x = 1546; x < W; x++) {
      const idx = (y * W + x) * 4;
      let blend = 1.0;
      if (x < 1620) {
        blend = (x - 1546) / (1620 - 1546);
      }
      if (y < 1200) {
        blend = Math.min(blend, (y - 1150) / 50);
      }
      masterBuf[idx] = Math.round(masterBuf[idx] * (1 - blend) + brCleanBuf[idx] * blend);
      masterBuf[idx + 1] = Math.round(masterBuf[idx + 1] * (1 - blend) + brCleanBuf[idx + 1] * blend);
      masterBuf[idx + 2] = Math.round(masterBuf[idx + 2] * (1 - blend) + brCleanBuf[idx + 2] * blend);
      masterBuf[idx + 3] = 255;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: Logos with Crisp Contours & Soft Shadows
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('5. Rendering crisp logos...');
  
  // CCC Logo (Top Left)
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

  // HD CUH Logo (Top Right)
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
          <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="3.5" />
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

  // Symmetrical coordinates: CCC left = 218, top = 73
  // CUH symmetric left = 2246 - 218 - 187 = 1841, top = 73
  console.log('6. Compositing master background...');
  const cleanMaster = await sharp(masterBuf, { raw: { width: W, height: H, channels: 4 } })
    .composite([
      { input: linePng, left: 563, top: 245 },
      { input: cccWithContour, left: 218 - 15, top: 73 - 15 },
      { input: cuhWithContour, left: 1841 - 15, top: 73 - 15 }
    ])
    .png()
    .toBuffer();

  // Save clean templates
  fs.writeFileSync('public/certificate-template-clean.png', cleanMaster);
  fs.writeFileSync('public/certificate-template-clean-v2.png', cleanMaster);
  console.log('Successfully written clean master templates!');

  // Generate previews for verification
  // 1. Top-Right CUH Wave preview (x: 1600..2246, y: 0..400)
  await sharp(cleanMaster)
    .extract({ left: 1600, top: 0, width: 646, height: 400 })
    .toFile('public/preview-tr-perfect-wave.png');

  // 2. Bottom-Right Nitin Goyal Wave preview (x: 1546..2246, y: 1350..1588)
  await sharp(cleanMaster)
    .extract({ left: 1546, top: 1350, width: 700, height: 238 })
    .toFile('public/preview-br-perfect-wave.png');

  // 3. Full Blank Certificate 28 October (master + SVG text overlay)
  const svgBuffer = fs.readFileSync('public/blank-certificate-28-october.svg');
  const blankWithText = await sharp(cleanMaster)
    .composite([
      { input: svgBuffer, left: 0, top: 0 }
    ])
    .png()
    .toBuffer();
  fs.writeFileSync('public/blank-certificate-28-october.png', blankWithText);
  console.log('Successfully written public/blank-certificate-28-october.png!');
}

buildPerfectTemplate().catch(console.error);
