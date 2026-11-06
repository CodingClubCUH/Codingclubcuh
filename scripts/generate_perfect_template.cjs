const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function generateBorderWaveSvg() {
  const W = 2246;
  const H = 1588;

  // Refined border waves that strictly hug the perimeter:
  // Left border: x: 0 to 115 at bottom y >= 1350
  // Right border: x: 2131 to 2246 at bottom y >= 1350
  // This guarantees 100% clearance for all three signatures:
  // - Dr. Sunil Kumar (x: 170..610) -> 55px+ margin
  // - Dr. Prithi Maratha (x: 903..1343) -> perfectly centered
  // - Dr. Nitin Goyal (x: 1620..2060) -> 71px+ margin to line, 91px+ to text!
  
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradients -->
      <linearGradient id="gDeepEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#093f2f" />
        <stop offset="35%" stop-color="#0d553f" />
        <stop offset="70%" stop-color="#137558" />
        <stop offset="100%" stop-color="#093f2f" />
      </linearGradient>

      <linearGradient id="gMidTeal" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stop-color="#137558" />
        <stop offset="50%" stop-color="#1e9673" />
        <stop offset="100%" stop-color="#2ec49b" />
      </linearGradient>

      <linearGradient id="gVibrantTeal" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#008a7e" />
        <stop offset="50%" stop-color="#00a89b" />
        <stop offset="100%" stop-color="#2ec49b" />
      </linearGradient>

      <linearGradient id="gSeafoam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2ec49b" />
        <stop offset="50%" stop-color="#5edbb8" />
        <stop offset="100%" stop-color="#8be2c9" />
      </linearGradient>

      <linearGradient id="gMintVeil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5edbb8" />
        <stop offset="50%" stop-color="#b6f5e5" />
        <stop offset="100%" stop-color="#3ccda6" />
      </linearGradient>

      <linearGradient id="gSage" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#9bc2b3" />
        <stop offset="50%" stop-color="#b8ded1" />
        <stop offset="100%" stop-color="#82baa6" />
      </linearGradient>
    </defs>

    <!-- Canvas Background -->
    <rect width="${W}" height="${H}" fill="#f9f9f9" />

    <!-- Subtle Premium Certificate Inset Borders -->
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#137558" stroke-width="1.4" stroke-opacity="0.30" rx="8" />
    <rect x="32" y="32" width="${W - 64}" height="${H - 64}" fill="none" stroke="#c88a24" stroke-width="0.9" stroke-opacity="0.40" rx="6" />

    <!-- ============================================================ -->
    <!-- LEFT BORDER WAVE SYSTEM (Strictly hugs left margin x <= 115) -->
    <!-- ============================================================ -->
    <g id="left-border-wave">
      <!-- 1. Soft Mint Outer Veil -->
      <path d="M 0,0 
               C 80,30 155,75 170,220 
               C 180,380 105,620 75,820 
               C 50,1020 85,1250 108,1420 
               C 114,1480 115,1540 115,1588 
               L 0,1588 Z"
            fill="url(#gMintVeil)" opacity="0.35" />

      <!-- 2. Mid Seafoam Ribbon -->
      <path d="M 0,0 
               C 70,25 130,68 145,200 
               C 155,350 85,600 64,800 
               C 42,1000 72,1230 96,1410 
               C 102,1470 104,1535 105,1588 
               L 0,1588 Z"
            fill="url(#gSeafoam)" opacity="0.50" />

      <!-- 3. Soft Sage Band -->
      <path d="M 0,0 
               C 60,20 110,58 120,180 
               C 128,320 74,580 50,780 
               C 32,980 60,1210 82,1400 
               C 88,1460 90,1530 90,1588 
               L 0,1588 Z"
            fill="url(#gSage)" opacity="0.55" />

      <!-- 4. Deep Emerald Core -->
      <path d="M 0,0 
               C 45,15 85,48 95,160 
               C 104,290 54,560 36,760 
               C 22,960 44,1190 64,1390 
               C 70,1450 72,1520 73,1588 
               L 0,1588 Z"
            fill="url(#gDeepEmerald)" opacity="0.88" />

      <!-- 5. Inner Accent Ribbon -->
      <path d="M 0,0 
               C 30,10 56,38 65,140 
               C 74,260 36,540 24,740 
               C 14,940 28,1170 45,1380 
               C 50,1440 52,1510 53,1588 
               L 0,1588 Z"
            fill="#093f2f" opacity="0.82" />

      <!-- 6. Vibrant Corner Arch (Top-Left Accent: strictly hugs border x: 0..148) -->
      <path d="M 0,18 
               C 50,22 110,40 148,88 
               C 128,108 90,90 52,68 
               C 24,56 0,55 0,55 Z"
            fill="url(#gVibrantTeal)" opacity="0.92" />

      <!-- 7. Hairline Accent Lines (Delicate luxury border details) -->
      <path d="M 0,8 C 50,14 100,32 142,75" 
            stroke="#ffffff" stroke-width="2.2" stroke-opacity="0.70" stroke-linecap="round" fill="none" />
      <path d="M 0,32 C 45,38 85,55 120,90" 
            stroke="#5edbb8" stroke-width="1.6" stroke-opacity="0.55" stroke-linecap="round" fill="none" />

      <path d="M 0,1320 C 30,1365 68,1440 98,1588" 
            stroke="#ffffff" stroke-width="2.2" stroke-opacity="0.70" stroke-linecap="round" fill="none" />
      <path d="M 0,1365 C 25,1405 56,1470 80,1588" 
            stroke="#72e4c4" stroke-width="1.8" stroke-opacity="0.55" stroke-linecap="round" fill="none" />
      <path d="M 0,1410 C 20,1445 42,1505 62,1588" 
            stroke="url(#gVibrantTeal)" stroke-width="2.4" stroke-opacity="0.75" stroke-linecap="round" fill="none" />
    </g>

    <!-- ============================================================ -->
    <!-- RIGHT BORDER WAVE SYSTEM (Horizontally mirrored x >= 2131)     -->
    <!-- Bilateral symmetry ensures top-right frames CUH logo perfectly  -->
    <!-- and bottom-right leaves massive 71px+ margin to Dr. Nitin Goyal-->
    <!-- ============================================================ -->
    <use href="#left-border-wave" transform="translate(2246, 0) scale(-1, 1)" />

    <!-- ============================================================ -->
    <!-- HEADER TYPOGRAPHY & GOLDEN DIVIDER                           -->
    <!-- ============================================================ -->
    <text x="1123" y="125" text-anchor="middle"
          font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-weight="900" font-size="76" fill="#0f172a" letter-spacing="1.5">CODING CLUB CUH</text>

    <text x="1123" y="176" text-anchor="middle"
          font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-weight="800" font-size="28" fill="#137558" letter-spacing="4">CENTRAL UNIVERSITY OF HARYANA</text>

    <g transform="translate(563, 225)">
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
    </g>
  </svg>
  `;
}

async function buildMasterTemplates() {
  console.log('1. Rendering border wave SVG...');
  const svg = generateBorderWaveSvg();
  const basePng = await sharp(Buffer.from(svg)).png().toBuffer();

  console.log('2. Preparing Central Watermark (CUH Emblem)...');
  const wmResized = await sharp('public/cuh-logo.png')
    .resize(null, 600)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  for (let i = 0; i < wmResized.info.width * wmResized.info.height; i++) {
    wmResized.data[i * 4 + 3] = Math.round(wmResized.data[i * 4 + 3] * 0.075);
  }
  const watermarkSubtle = await sharp(wmResized.data, {
    raw: { width: wmResized.info.width, height: wmResized.info.height, channels: 4 }
  }).png().toBuffer();

  console.log('3. Preparing PERFECT Transparent CCC Logo (No black square box!)...');
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

  // Trim to exact bounding box (includes CODING, CLUB, CUH completely!)
  const cccTrimmed = await sharp(cccAlphaBuf, {
    raw: { width: cccInfo.width, height: cccInfo.height, channels: 4 }
  }).trim().toBuffer({ resolveWithObject: true });

  const cccH = 195;
  const cccW = Math.round(cccH * (cccTrimmed.info.width / cccTrimmed.info.height)); // ~175
  const cccResized = await sharp(cccTrimmed.data, {
    raw: { width: cccTrimmed.info.width, height: cccTrimmed.info.height, channels: 4 }
  }).resize(cccW, cccH).png().toBuffer();

  // Add subtle 2px white halo and soft shadow for maximum legibility over any border
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

  console.log('4. Preparing CUH Logo...');
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

  console.log('5. Compositing master template...');
  const cccLeft = 210;
  const cccTop = 60;
  const cuhLeft = 2246 - 210 - cuhW; // 1849 (symmetric!)
  const cuhTop = 50;

  const wmLeft = Math.round((2246 - wmResized.info.width) / 2);
  const wmTop = Math.round((1588 - wmResized.info.height) / 2);

  const cleanMaster = await sharp(basePng)
    .composite([
      // Central Watermark
      { input: watermarkSubtle, left: wmLeft, top: wmTop },
      // Top-Left Clean CCC Logo
      { input: cccLogoComposite, left: cccLeft - 12, top: cccTop - 12 },
      // Top-Right Clean CUH Logo
      { input: cuhLogoComposite, left: cuhLeft - 12, top: cuhTop - 12 }
    ])
    .png()
    .toBuffer();

  // Save to public/
  fs.writeFileSync('public/certificate-template-clean.png', cleanMaster);
  fs.writeFileSync('public/certificate-template-clean-v2.png', cleanMaster);
  console.log('Saved public/certificate-template-clean.png and v2');

  // Composite blank certificate
  console.log('6. Compositing blank certificate...');
  const svgBuf = fs.readFileSync('public/blank-certificate-28-october.svg');
  const svgPng = await sharp(svgBuf).png().toBuffer();

  const blankCertificate = await sharp(cleanMaster)
    .composite([{ input: svgPng, left: 0, top: 0 }])
    .png()
    .toBuffer();

  fs.writeFileSync('public/blank-certificate-28-october.png', blankCertificate);
  console.log('Saved public/blank-certificate-28-october.png');

  console.log('Done generating perfect templates!');
}

buildMasterTemplates().catch(err => {
  console.error('Error generating template:', err);
  process.exit(1);
});
