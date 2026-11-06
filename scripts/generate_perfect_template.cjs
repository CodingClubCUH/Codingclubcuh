const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function generate4SidedWaveSvg() {
  const W = 2246;
  const H = 1588;

  // Layered 4-Sided Continuous Wave Border System
  // Surrounds all 4 sides of the certificate (Top, Bottom, Left, Right)
  // Layer 1: Mint Veil (Softest, widest)
  // Layer 2: Seafoam Ribbon
  // Layer 3: Sage Tone
  // Layer 4: Deep Emerald Core Frame
  // Layer 5: Top Corner Vibrant Petal Accents
  // Layer 6: Continuous Hairline Luxury Filaments encircling all 4 sides

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

    <!-- Subtle Luxury Inset Framing -->
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#137558" stroke-width="1.4" stroke-opacity="0.30" rx="8" />
    <rect x="32" y="32" width="${W - 64}" height="${H - 64}" fill="none" stroke="#c88a24" stroke-width="0.9" stroke-opacity="0.40" rx="6" />

    <!-- ===================================================================== -->
    <!-- 4-SIDED CONTINUOUS WAVE FRAME                                         -->
    <!-- Top: y: 0..48 | Bottom: y: 1540..1588 | Left: x: 0..115 | Right: x: 2131..2246 -->
    <!-- Guaranteed 100% clearance:                                            -->
    <!-- - Header text "CODING CLUB CUH": 18px clearance                       -->
    <!-- - CCC Logo: 18px top, 62px left clearance                             -->
    <!-- - CUH Logo: 18px top, 62px right clearance                            -->
    <!-- - All 3 Signatures: 44px+ vertical clearance, 55px+ horizontal clear -->
    <!-- ===================================================================== -->

    <!-- LAYER 1: Mint Veil Outer Cushion (fills perimeter outer 4 sides) -->
    <path d="
      M 0,0 
      L ${W},0 
      L ${W},${H} 
      L 0,${H} 
      Z 
      M 160,48
      C 420,24 720,46 1123,28
      C 1526,46 1826,24 2086,48
      C 2125,52 2165,100 2170,220
      C 2175,380 2200,620 2205,820
      C 2210,1020 2185,1250 2168,1420
      C 2162,1480 2125,1538 2086,1540
      C 1826,1564 1526,1542 1123,1560
      C 720,1542 420,1564 160,1540
      C 121,1538 84,1480 78,1420
      C 61,1250 36,1020 41,820
      C 46,620 71,380 76,220
      C 81,100 121,52 160,48
      Z"
      fill="url(#gMintVeil)" opacity="0.32" fill-rule="evenodd" />

    <!-- LAYER 2: Seafoam Flow Ribbon -->
    <path d="
      M 0,0 
      L ${W},0 
      L ${W},${H} 
      L 0,${H} 
      Z 
      M 145,36
      C 400,16 700,38 1123,22
      C 1546,38 1846,16 2101,36
      C 2138,40 2174,86 2178,200
      C 2183,350 2206,600 2211,800
      C 2216,1000 2193,1230 2178,1410
      C 2172,1470 2138,1548 2101,1552
      C 1846,1572 1546,1550 1123,1566
      C 700,1550 400,1572 145,1552
      C 108,1548 74,1470 68,1410
      C 53,1230 30,1000 35,800
      C 40,600 63,350 68,200
      C 72,86 108,40 145,36
      Z"
      fill="url(#gSeafoam)" opacity="0.44" fill-rule="evenodd" />

    <!-- LAYER 3: Soft Sage Band -->
    <path d="
      M 0,0 
      L ${W},0 
      L ${W},${H} 
      L 0,${H} 
      Z 
      M 130,28
      C 380,10 680,28 1123,16
      C 1566,28 1866,10 2116,28
      C 2148,32 2182,72 2186,180
      C 2191,320 2212,580 2216,780
      C 2220,980 2200,1210 2186,1400
      C 2182,1460 2148,1556 2116,1560
      C 1866,1578 1566,1560 1123,1572
      C 680,1560 380,1578 130,1560
      C 98,1556 64,1460 60,1400
      C 46,1210 26,980 30,780
      C 34,580 55,320 60,180
      C 64,72 98,32 130,28
      Z"
      fill="url(#gSage)" opacity="0.48" fill-rule="evenodd" />

    <!-- LAYER 4: Deep Emerald Core Frame -->
    <path d="
      M 0,0 
      L ${W},0 
      L ${W},${H} 
      L 0,${H} 
      Z 
      M 110,20
      C 360,6 660,20 1123,10
      C 1586,20 1886,6 2136,20
      C 2160,24 2192,60 2195,160
      C 2199,290 2218,560 2222,760
      C 2225,960 2208,1190 2196,1390
      C 2192,1450 2160,1564 2136,1568
      C 1886,1582 1586,1568 1123,1578
      C 660,1568 360,1582 110,1568
      C 86,1564 54,1450 50,1390
      C 38,1190 21,960 24,760
      C 28,560 47,290 51,160
      C 54,60 86,24 110,20
      Z"
      fill="url(#gDeepEmerald)" opacity="0.85" fill-rule="evenodd" />

    <!-- LAYER 5: Corner Accents (Top Corner Vibrant Petal Accents) -->
    <!-- Top-Left Corner Arch -->
    <path d="M 0,16 C 50,20 105,38 140,84 C 122,104 86,86 50,66 C 22,54 0,52 0,52 Z"
          fill="url(#gVibrantTeal)" opacity="0.90" />
    <!-- Top-Right Corner Arch -->
    <path d="M ${W},16 C ${W - 50},20 ${W - 105},38 ${W - 140},84 C ${W - 122},104 ${W - 86},86 ${W - 50},66 C ${W - 22},54 ${W},52 ${W},52 Z"
          fill="url(#gVibrantTeal)" opacity="0.90" />

    <!-- LAYER 6: Continuous Hairline Luxury Filaments encircling all 4 sides -->
    <!-- 1. White Crisp Contour Line -->
    <path d="
      M 125,24
      C 370,12 670,24 1123,14
      C 1576,24 1876,12 2121,24
      C 2155,26 2185,55 2188,170
      C 2192,300 2212,570 2215,770
      C 2218,970 2202,1200 2190,1395
      C 2185,1455 2155,1560 2121,1564
      C 1876,1576 1576,1564 1123,1574
      C 670,1564 370,1576 125,1564
      C 91,1560 61,1455 56,1395
      C 44,1200 28,970 31,770
      C 34,570 54,300 58,170
      C 61,55 91,26 125,24
      Z"
      stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.70" stroke-linecap="round" fill="none" />

    <!-- 2. Vibrant Seafoam Contour Line -->
    <path d="
      M 140,32
      C 390,18 690,32 1123,20
      C 1556,32 1856,18 2106,32
      C 2142,34 2176,68 2180,185
      C 2184,330 2206,590 2209,790
      C 2212,990 2195,1220 2182,1405
      C 2176,1465 2142,1552 2106,1556
      C 1856,1570 1556,1556 1123,1568
      C 690,1556 390,1570 140,1556
      C 104,1552 70,1465 64,1405
      C 51,1220 34,990 37,790
      C 40,590 62,330 66,185
      C 70,68 104,34 140,32
      Z"
      stroke="#5edbb8" stroke-width="1.5" stroke-opacity="0.60" stroke-linecap="round" fill="none" />

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
  console.log('1. Rendering 4-sided wave SVG...');
  const svg = generate4SidedWaveSvg();
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

  // Add subtle 2.5px white halo and soft shadow for maximum legibility
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

  console.log('Done generating perfect 4-sided templates!');
}

buildMasterTemplates().catch(err => {
  console.error('Error generating template:', err);
  process.exit(1);
});
