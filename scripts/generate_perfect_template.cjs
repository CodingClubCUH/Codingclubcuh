const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function generateWavePaths() {
  // Canvas is 2246 x 1588.
  // Left side waves hug the left margin:
  // Top-left corner sweeps out to x ≈ 480, y ≈ 160.
  // Middle hugs border (x: 0..90).
  // Bottom-left corner hugs margin (x: 0..230 at y: 1450..1588), keeping signature area x >= 235 completely clear.
  
  return `
    <!-- 1. Ambient Mint Soft Veil (Broadest, lowest opacity) -->
    <path d="M 0,0 
             C 140,40 340,70 460,160 
             C 380,260 200,450 140,700 
             C 90,950 150,1200 210,1420 
             C 225,1480 232,1540 235,1588 
             L 0,1588 Z"
          fill="url(#gradMintVeil)" opacity="0.32" />

    <!-- 2. Mid Seafoam Flow Ribbon -->
    <path d="M 0,0 
             C 120,35 300,60 410,140 
             C 330,230 160,440 115,690 
             C 75,940 130,1210 185,1430 
             C 195,1480 205,1540 210,1588 
             L 0,1588 Z"
          fill="url(#gradSeafoam)" opacity="0.48" />

    <!-- 3. Soft Sage/Mint Layer -->
    <path d="M 0,0 
             C 100,30 250,50 350,120 
             C 280,210 135,430 95,680 
             C 65,930 110,1220 160,1440 
             C 170,1485 180,1540 185,1588 
             L 0,1588 Z"
          fill="url(#gradSage)" opacity="0.55" />

    <!-- 4. Deep Emerald Core Ribbon -->
    <path d="M 0,0 
             C 80,25 210,40 290,105 
             C 230,190 105,420 75,670 
             C 50,920 90,1230 135,1450 
             C 145,1490 155,1545 160,1588 
             L 0,1588 Z"
          fill="url(#gradDeepEmerald)" opacity="0.88" />

    <!-- 5. Inner Accent Ribbon (Dark Emerald Base) -->
    <path d="M 0,0 
             C 60,20 160,30 220,90 
             C 170,170 75,410 50,660 
             C 32,910 65,1240 105,1460 
             C 115,1500 120,1550 125,1588 
             L 0,1588 Z"
          fill="#0a4635" opacity="0.82" />

    <!-- 6. Dynamic Vibrant Swoosh Arch (Top-Left Corner Header Accent) -->
    <path d="M 0,25 
             C 130,30 310,65 440,145 
             C 390,185 260,150 150,115 
             C 75,90 0,80 0,80 Z"
          fill="url(#gradVibrantTeal)" opacity="0.95" />

    <!-- 7. Translucent Turquoise Secondary Arch -->
    <path d="M 0,60 
             C 110,68 260,100 370,175 
             C 320,215 210,175 120,140 
             C 60,115 0,108 0,108 Z"
          fill="url(#gradSeafoam)" opacity="0.60" />

    <!-- 8. Delicate Hairline Accent Striations (Sweeping across curves) -->
    <path d="M 0,10 C 140,18 290,48 420,125" 
          stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.65" stroke-linecap="round" fill="none" />
    <path d="M 0,45 C 120,52 250,82 360,155" 
          stroke="#b6f5e5" stroke-width="1.8" stroke-opacity="0.55" stroke-linecap="round" fill="none" />
    
    <path d="M 0,1320 C 65,1370 140,1450 200,1588" 
          stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.65" stroke-linecap="round" fill="none" />
    <path d="M 0,1360 C 55,1405 120,1480 170,1588" 
          stroke="#72e4c4" stroke-width="2.0" stroke-opacity="0.55" stroke-linecap="round" fill="none" />
    <path d="M 0,1405 C 45,1445 100,1515 140,1588" 
          stroke="#ffffff" stroke-width="1.6" stroke-opacity="0.50" stroke-linecap="round" fill="none" />
    <path d="M 0,1450 C 40,1485 80,1540 110,1588" 
          stroke="url(#gradVibrantTeal)" stroke-width="2.8" stroke-opacity="0.75" stroke-linecap="round" fill="none" />
  `;
}

function buildCleanCertificateSvg() {
  const W = 2246;
  const H = 1588;

  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradients -->
      <linearGradient id="gradDeepEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#093f2f" />
        <stop offset="40%" stop-color="#0f5c45" />
        <stop offset="75%" stop-color="#147c60" />
        <stop offset="100%" stop-color="#093f2f" />
      </linearGradient>

      <linearGradient id="gradVibrantTeal" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stop-color="#008a7e" />
        <stop offset="50%" stop-color="#00a89b" />
        <stop offset="100%" stop-color="#2ec49b" />
      </linearGradient>

      <linearGradient id="gradSeafoam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#148365" />
        <stop offset="45%" stop-color="#2ec49b" />
        <stop offset="85%" stop-color="#5edbb8" />
        <stop offset="100%" stop-color="#8be2c9" />
      </linearGradient>

      <linearGradient id="gradMintVeil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5edbb8" />
        <stop offset="50%" stop-color="#b6f5e5" />
        <stop offset="100%" stop-color="#3ccda6" />
      </linearGradient>

      <linearGradient id="gradSage" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#9bc2b3" />
        <stop offset="50%" stop-color="#b8ded1" />
        <stop offset="100%" stop-color="#82baa6" />
      </linearGradient>
    </defs>

    <!-- 1. Pure Crisp Off-White Background: rgb(249, 249, 249) = #f9f9f9 -->
    <rect width="${W}" height="${H}" fill="#f9f9f9" />

    <!-- 2. Left Wave Group -->
    <g id="left-wave-system">
      ${generateWavePaths()}
    </g>

    <!-- 3. Right Wave Group (Point-Symmetric via 180 deg rotation about center 1123, 794) -->
    <g id="right-wave-system" transform="rotate(180 1123 794)">
      ${generateWavePaths()}
    </g>

    <!-- 4. Centered Header Typography -->
    <text x="1123" y="125" text-anchor="middle"
          font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-weight="900" font-size="76" fill="#0f172a" letter-spacing="1.5">CODING CLUB CUH</text>

    <text x="1123" y="176" text-anchor="middle"
          font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-weight="800" font-size="28" fill="#137558" letter-spacing="4">CENTRAL UNIVERSITY OF HARYANA</text>

    <!-- 5. Centered Golden Divider Line & Diamond Ornament -->
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

async function buildPerfectTemplate() {
  console.log('1. Rendering pure vector wave background and header...');
  const svg = buildCleanCertificateSvg();
  const basePng = await sharp(Buffer.from(svg)).png().toBuffer();

  console.log('2. Preparing Central Watermark (CUH Emblem without letterbox)...');
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

  console.log('3. Preparing Top-Left CCC Logo with White Halo Contour & Drop Shadow...');
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

  const cccW = 166, cccH = 185;
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
  const cccLogoComposite = await sharp(cccHaloSvg).png().toBuffer();

  console.log('4. Preparing Top-Right CUH Logo with White Halo Contour & Drop Shadow...');
  const cuhW = 187, cuhH = 220;
  const cuhClean = await sharp('public/cuh-logo.png')
    .resize(cuhW, cuhH, { fit: 'contain' })
    .png()
    .toBuffer();

  const cuhHaloSvg = Buffer.from(`
    <svg width="${cuhW + 30}" height="${cuhH + 30}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="c4" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="3" />
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
      <image href="data:image/png;base64,${cuhClean.toString('base64')}" x="15" y="15" width="${cuhW}" height="${cuhH}" filter="url(#c4)" />
    </svg>
  `);
  const cuhLogoComposite = await sharp(cuhHaloSvg).png().toBuffer();

  console.log('5. Compositing master clean template...');
  const cuhLeft = 1714;
  const wmLeft = Math.round((2246 - wmResized.info.width) / 2);
  const wmTop = Math.round((1588 - wmResized.info.height) / 2);

  const cleanMaster = await sharp(basePng)
    .composite([
      // Central Watermark (no bars)
      { input: watermarkSubtle, left: wmLeft, top: wmTop },
      // Top-Left CCC Logo
      { input: cccLogoComposite, left: 218 - 15, top: 73 - 15 },
      // Top-Right CUH Logo
      { input: cuhLogoComposite, left: cuhLeft - 15, top: 56 - 15 }
    ])
    .png()
    .toBuffer();

  // Save production clean templates
  fs.writeFileSync('public/certificate-template-clean.png', cleanMaster);
  fs.writeFileSync('public/certificate-template-clean-v2.png', cleanMaster);
  console.log('Saved public/certificate-template-clean.png and v2');

  // Render blank certificate with SVG overlay
  console.log('6. Compositing blank certificate...');
  const svgBuf = fs.readFileSync('public/blank-certificate-28-october.svg');
  const svgPng = await sharp(svgBuf).png().toBuffer();

  const blankCertificate = await sharp(cleanMaster)
    .composite([{ input: svgPng, left: 0, top: 0 }])
    .png()
    .toBuffer();

  fs.writeFileSync('public/blank-certificate-28-october.png', blankCertificate);
  console.log('Saved public/blank-certificate-28-october.png');

  console.log('Done!');
}

buildPerfectTemplate().catch(err => {
  console.error('Error generating template:', err);
  process.exit(1);
});
