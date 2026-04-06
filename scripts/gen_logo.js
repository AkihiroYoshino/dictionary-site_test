// logo_test JPEG generator
// Porsche 911 silhouette + Nike swoosh hybrid harness + rear-engine → shaft → front diff
const sharp = require('sharp');
const fs = require('fs');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="512" height="512">
  <rect width="128" height="128" fill="white"/>

  <!--
    Porsche 911 (992) side profile — facing RIGHT
    LEFT  = rear (engine behind rear axle)
    RIGHT = front (low nose, frunk)
    Rear wheel ≈ x34  |  Front wheel ≈ x92
  -->

  <!-- ===== 1. Car Outline — 911 silhouette ===== -->
  <g id="car-outline" stroke="#111" stroke-width="2.8" fill="none"
     stroke-linecap="round" stroke-linejoin="round">

    <!-- upper body: rear tail → fastback → roof → windshield → low hood → nose -->
    <path d="
      M 10 80
      C 12 78, 14 74, 18 68
      C 22 60, 28 50, 36 42
      C 42 36, 50 33, 58 33
      C 64 33, 68 34, 72 38
      C 76 42, 78 48, 82 56
      C 86 62, 92 68, 100 72
      C 106 74, 112 76, 118 80
    "/>

    <!-- lower body + wheel arches -->
    <path d="
      M 10 80
      L 12 84
      L 18 87
      C 20 84, 26 80, 34 80
      C 42 80, 48 84, 50 87
      L 76 87
      C 78 84, 84 80, 92 80
      C 100 80, 106 84, 108 87
      L 114 84
      L 118 80
    "/>

    <!-- rear ducktail spoiler hint -->
    <path d="M 10 80 C 8 79, 8 78, 10 77" stroke-width="1.8"/>

    <!-- window glass line -->
    <path d="
      M 40 44
      C 48 40, 56 38, 62 38
      C 68 39, 72 42, 76 48
    " stroke-width="1" opacity="0.45"/>

    <!-- door seam -->
    <line x1="62" y1="38" x2="62" y2="80" stroke-width="0.7" opacity="0.35"/>

    <!-- headlight -->
    <ellipse cx="114" cy="76" rx="3" ry="1.5" stroke-width="0.8" opacity="0.5"/>
    <!-- taillight -->
    <line x1="10" y1="77" x2="13" y2="77" stroke-width="1.5" opacity="0.5"/>
  </g>

  <!-- ===== 2. Wheels (rear=left, front=right) ===== -->
  <g id="wheels" stroke="#111" fill="none">
    <!-- rear wheel (wider — 911 signature) -->
    <circle cx="34" cy="92" r="11" stroke-width="2.6"/>
    <circle cx="34" cy="92" r="5.5" stroke-width="1.2"/>
    <line x1="34" y1="86" x2="34" y2="98" stroke-width="0.7"/>
    <line x1="28" y1="92" x2="40" y2="92" stroke-width="0.7"/>
    <line x1="30" y1="88" x2="38" y2="96" stroke-width="0.5"/>
    <line x1="38" y1="88" x2="30" y2="96" stroke-width="0.5"/>

    <!-- front wheel -->
    <circle cx="92" cy="92" r="11" stroke-width="2.6"/>
    <circle cx="92" cy="92" r="5.5" stroke-width="1.2"/>
    <line x1="92" y1="86" x2="92" y2="98" stroke-width="0.7"/>
    <line x1="86" y1="92" x2="98" y2="92" stroke-width="0.7"/>
    <line x1="88" y1="88" x2="96" y2="96" stroke-width="0.5"/>
    <line x1="96" y1="88" x2="88" y2="96" stroke-width="0.5"/>
  </g>

  <!-- ===== 3. Chassis Frame Rail ===== -->
  <g id="chassis-frame" stroke="#111" stroke-width="0.9" fill="none"
     stroke-linecap="round" opacity="0.5">
    <line x1="20" y1="78" x2="112" y2="78"/>
    <line x1="44" y1="76" x2="44" y2="80"/>
    <line x1="56" y1="76" x2="56" y2="80"/>
    <line x1="68" y1="76" x2="68" y2="80"/>
    <line x1="80" y1="76" x2="80" y2="80"/>
  </g>

  <!-- ===== 4. Powertrain: Rear flat-6 → prop shaft → front diff ===== -->
  <g id="powertrain" stroke="#111" fill="none"
     stroke-linecap="round" stroke-linejoin="round">

    <!-- Rear-mounted flat-six engine (behind rear axle, x < 34) -->
    <rect x="12" y="66" width="16" height="9" rx="1.5" stroke-width="1.4"/>
    <line x1="16" y1="66" x2="16" y2="75" stroke-width="0.7"/>
    <line x1="20" y1="66" x2="20" y2="75" stroke-width="0.7"/>
    <line x1="24" y1="66" x2="24" y2="75" stroke-width="0.7"/>

    <!-- Engine → rear axle connection -->
    <line x1="28" y1="71" x2="34" y2="71" stroke-width="1.2"/>

    <!-- Propeller shaft (rear axle → front axle) -->
    <line x1="34" y1="71" x2="88" y2="71" stroke-width="1.2"
          stroke-dasharray="3,2"/>

    <!-- Front differential (at front axle x≈92) -->
    <circle cx="92" cy="71" r="4.5" stroke-width="1.4"/>
    <line x1="89" y1="71" x2="95" y2="71" stroke-width="0.8"/>
    <line x1="92" y1="68" x2="92" y2="74" stroke-width="0.8"/>

    <!-- Half-shafts: diff → front wheels -->
    <line x1="92" y1="75.5" x2="92" y2="86" stroke-width="1" opacity="0.65"/>

    <!-- Rear axle stub (engine side to rear wheel) -->
    <line x1="28" y1="71" x2="28" y2="75" stroke-width="0.8" opacity="0.5"/>
    <line x1="34" y1="75" x2="34" y2="86" stroke-width="1" opacity="0.5"/>
  </g>

  <!-- ===== 5. Nike Swoosh — thick, dynamic energy flow ===== -->
  <!--
    Classic Nike swoosh shape:
    • Thick rounded tail at rear (engine origin)
    • Sweeping upward curve with BODY/MASS
    • Tapers to sharp thin tip at front (energy delivery)
  -->
  <g id="hv-swoosh">
    <path d="
      M 14 82
      C 14 86, 18 88, 24 88
      C 36 88, 52 84, 68 76
      C 80 70, 92 62, 108 52
      L 110 51
      C 94 58, 80 64, 68 70
      C 54 77, 38 80, 24 80
      C 18 80, 14 78, 14 82
      Z
    " fill="#ff7a00" stroke="none" opacity="0.9"/>
  </g>

</svg>`;

// Generate JPEG with white background
sharp(Buffer.from(svg))
  .resize(512, 512)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .jpeg({ quality: 95 })
  .toFile('images/logo_test.jpg')
  .then(info => {
    console.log('logo_test.jpg created:', info.width + 'x' + info.height, info.size + ' bytes');
  })
  .catch(err => console.error('Error:', err));
