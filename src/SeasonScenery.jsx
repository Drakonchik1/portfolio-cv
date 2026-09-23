import Sparrow from './Sparrow.jsx'

/** Seasonal illustration layer — silhouettes in the active palette, not photos. */
export default function SeasonScenery({ season, colors, accent, highlight, bodyBg, sky }) {
  const [far, mid, near] = colors
  const snow = highlight || accent
  const skyTint = sky || mid

  return (
    <>
      <div className="season-scenery" data-season={season} aria-hidden="true">
        <svg
          className="season-scenery__svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMin slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`sky-${season}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyTint} stopOpacity={sky ? 0.74 : 0.5} />
              <stop offset="42%" stopColor={skyTint} stopOpacity={sky ? 0.2 : 0} />
              <stop offset="58%" stopColor={bodyBg} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`fade-${season}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bodyBg} stopOpacity="0" />
              <stop offset={season === 'spring' ? '74%' : '58%'} stopColor={bodyBg} stopOpacity="0" />
              <stop
                offset={season === 'spring' ? '94%' : '88%'}
                stopColor={bodyBg}
                stopOpacity={season === 'spring' ? '0.4' : '0.5'}
              />
              <stop offset="100%" stopColor={bodyBg} stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id={`glow-${season}`} cx="70%" cy="14%" r="40%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`fuji-snow-${season}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={snow} stopOpacity="0.95" />
              <stop offset="100%" stopColor={snow} stopOpacity="0.35" />
            </linearGradient>
          </defs>

          <rect width="1440" height="900" fill={`url(#sky-${season})`} />
          <rect width="1440" height="900" fill={`url(#glow-${season})`} />

          {season === 'winter' && <WinterScene far={far} mid={mid} near={near} snow={snow} accent={accent} />}
          {season === 'spring' && (
            <SpringScene far={far} mid={mid} near={near} snow={snow} accent={accent} season={season} />
          )}
          {season === 'summer' && <SummerScene far={far} mid={mid} near={near} snow={snow} accent={accent} />}
          {season === 'autumn' && <AutumnScene far={far} mid={mid} near={near} snow={snow} accent={accent} />}

          <rect width="1440" height="900" fill={`url(#fade-${season})`} />
        </svg>
      </div>
      {season === 'spring' && <Sparrow />}
    </>
  )
}

function Cloud({ x, y, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity="0.22">
      <ellipse cx="40" cy="18" rx="40" ry="14" />
      <ellipse cx="18" cy="16" rx="18" ry="12" />
      <ellipse cx="62" cy="14" rx="22" ry="13" />
    </g>
  )
}

/** (x, y) is the foot on the ground; the tree grows up (negative y). */
function Pine({ x, y, s, fill, snow }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="11" ry="4" fill={fill} opacity="0.4" />
      <rect x="-2.2" y="-52" width="4.4" height="54" fill={fill} />
      <path d="M0 -100 L15 -64 H-15 Z" fill={fill} />
      <path d="M0 -78 L19 -42 H-19 Z" fill={fill} />
      <path d="M0 -50 L23 -8 H-23 Z" fill={fill} />
      {snow && <path d="M0 -100 L8 -88 H-8 Z" fill={snow} opacity="0.55" />}
      <ellipse cx="0" cy="3" rx="8" ry="3" fill={fill} />
    </g>
  )
}

function n1(n) {
  return (Math.round(n * 10) / 10).toFixed(1)
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Five notched petals. Built once so the trees stay a couple of paths, not hundreds of nodes. */
function sakuraBloomD(x, y, s, rotDeg) {
  const a0 = (rotDeg * Math.PI) / 180
  const tip = 5.1 * s
  const w = 1.85 * s
  const notch = 0.9 * s
  let d = ''
  for (let i = 0; i < 5; i += 1) {
    const a = a0 + (i * 2 * Math.PI) / 5
    const c = Math.cos(a)
    const sn = Math.sin(a)
    const nx = -sn
    const ny = c
    const mx = x + c * tip * 0.52
    const my = y + sn * tip * 0.52
    const tx = x + c * tip
    const ty = y + sn * tip
    const cx = x + c * (tip - notch)
    const cy = y + sn * (tip - notch)
    d += `M${n1(x)} ${n1(y)}Q${n1(mx + nx * w)} ${n1(my + ny * w)} ${n1(tx - nx * w * 0.22)} ${n1(ty - ny * w * 0.22)}Q${n1(cx)} ${n1(cy)} ${n1(tx + nx * w * 0.22)} ${n1(ty + ny * w * 0.22)}Q${n1(mx - nx * w)} ${n1(my - ny * w)} ${n1(x)} ${n1(y)}Z`
  }
  return d
}

const SAKURA_CLUSTERS = [
  { x: 0, y: -206, r: 22, n: 6 },
  { x: -36, y: -178, r: 26, n: 7 },
  { x: 40, y: -174, r: 26, n: 7 },
  { x: -62, y: -140, r: 24, n: 6 },
  { x: 66, y: -134, r: 24, n: 6 },
  { x: -12, y: -150, r: 18, n: 4 },
  { x: 16, y: -126, r: 16, n: 4 },
  { x: -44, y: -102, r: 20, n: 5 },
  { x: 52, y: -96, r: 20, n: 5 },
  { x: -70, y: -62, r: 16, n: 4 },
  { x: 86, y: -50, r: 15, n: 4 },
]

function buildSakuraField(seed) {
  const rng = mulberry32(seed)
  const pale = []
  const mid = []
  const deep = []
  const cores = []
  for (const c of SAKURA_CLUSTERS) {
    for (let i = 0; i < c.n; i += 1) {
      const ang = rng() * Math.PI * 2
      const rad = Math.sqrt(rng()) * c.r
      const x = c.x + Math.cos(ang) * rad
      const y = c.y + Math.sin(ang) * rad * 0.78
      const s = 0.7 + rng() * 0.62
      const d = sakuraBloomD(x, y, s, rng() * 360)
      const tone = rng()
      if (tone < 0.24) deep.push(d)
      else if (tone < 0.7) mid.push(d)
      else pale.push(d)
      cores.push([+x.toFixed(1), +y.toFixed(1), +(0.85 + s * 0.28).toFixed(2)])
    }
  }
  return { pale: pale.join(''), mid: mid.join(''), deep: deep.join(''), cores }
}

const SAKURA_A = buildSakuraField(0x5a1c0de)
const SAKURA_B = buildSakuraField(0xc0ffee1)

const SAKURA_BRANCHES = [
  ['M0 -108 C-16 -142 -34 -170 -42 -198', 3.3],
  ['M1 -106 C18 -140 36 -168 46 -194', 3.3],
  ['M0 -96 C-24 -118 -48 -134 -70 -146', 2.8],
  ['M0 -92 C26 -114 52 -128 74 -138', 2.8],
  ['M-1 -72 C-22 -86 -44 -98 -60 -108', 2.5],
  ['M1 -68 C24 -82 46 -92 64 -100', 2.5],
  ['M-1 -48 C-24 -58 -48 -64 -74 -58', 2.3],
  ['M2 -42 C30 -50 58 -54 90 -44', 2.3],
  ['M0 -120 C-2 -156 2 -186 0 -210', 2.2],
]

const SAKURA_MASSES = [
  { x: 0, y: -208, rx: 28, ry: 18, fill: '#f6c4d6' },
  { x: -38, y: -176, rx: 36, ry: 24, fill: '#ee93b0' },
  { x: 42, y: -172, rx: 36, ry: 24, fill: '#f4b0c6' },
  { x: -64, y: -138, rx: 32, ry: 22, fill: '#d56b90' },
  { x: 68, y: -132, rx: 32, ry: 22, fill: '#ee93b0' },
  { x: -6, y: -150, rx: 26, ry: 18, fill: '#f8c9d8' },
  { x: 18, y: -122, rx: 24, ry: 16, fill: '#f4b0c6' },
  { x: -42, y: -100, rx: 28, ry: 18, fill: '#ee93b0' },
  { x: 52, y: -94, rx: 28, ry: 18, fill: '#d56b90' },
  { x: -68, y: -60, rx: 22, ry: 15, fill: '#f4b0c6' },
  { x: 84, y: -48, rx: 22, ry: 15, fill: '#ee93b0' },
]

const SAKURA_EDGE = [
  [-78, -140, 1.45, 16],
  [82, -128, 1.4, -20],
  [2, -226, 1.55, 8],
  [-56, -192, 1.25, 36],
  [62, -190, 1.3, -14],
  [96, -46, 1.2, 28],
  [112, -30, 1.05, -12],
  [-86, -54, 1.15, -18],
]

const SAKURA_TRUNK =
  'M-5.2 8 C-6.6 -16 -5.4 -58 -2.8 -104 C-1.8 -122 -0.6 -128 0.2 -132 C1.6 -124 3 -106 4.6 -74 C6.4 -36 6.2 -10 5 8 Z'

/** Somei-yoshino: dark trunk, blossom cloud, a few crisp flowers on the silhouette. */
function SakuraTree({ x, y, s = 1, flip = false, field, delay = '0s', lean = 0 }) {
  const sx = flip ? -s : s
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${sx} ${s})`}>
      <g className="spring-sakura-sway" style={{ animationDelay: delay }}>
        <ellipse cx="6" cy="10" rx="34" ry="6" fill="#140c10" opacity="0.3" />
        <path d={SAKURA_TRUNK} fill="#4a3026" />
        <path
          d="M-0.8 4 C0 -34 0.8 -72 1.2 -114"
          fill="none"
          stroke="#7d5644"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.5"
        />
        <g fill="none" stroke="#3a261c" strokeLinecap="round">
          {SAKURA_BRANCHES.map(([d, w]) => (
            <path key={d} d={d} strokeWidth={w} />
          ))}
        </g>
        {SAKURA_MASSES.map((m) => (
          <ellipse key={`${m.x}-${m.y}`} cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill={m.fill} />
        ))}
        <path d={field.deep} fill="#c85d84" />
        <path d={field.mid} fill="#f0a4be" />
        <path d={field.pale} fill="#f8cddd" />
        {field.cores.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r={c[2]} fill="#e6b23a" />
        ))}
        {SAKURA_EDGE.map(([ex, ey, es, rot]) => (
          <g key={`${ex}-${ey}`}>
            <path d={sakuraBloomD(ex, ey, es, rot)} fill="#fde8f0" />
            <circle cx={ex} cy={ey} r={1.05 * es} fill="#e6b23a" />
          </g>
        ))}
        <g fill="none" stroke="#3a261c" strokeWidth="1.6" strokeLinecap="round">
          <path d="M-64 -140 C-80 -130 -88 -118 -82 -108" />
          <path d="M68 -132 C84 -122 92 -108 86 -98" />
          <path d="M0 -208 C-8 -224 6 -230 12 -216" />
          <path d="M86 -48 C100 -38 102 -28 94 -22" />
          <path d="M-70 -60 C-86 -50 -88 -40 -78 -36" />
        </g>
      </g>
    </g>
  )
}

/** Distant shore tree: blossom masses only, so the grove stays soft. */
function SakuraGroveTree({ x, y, s = 1, flip = false, lean = 0 }) {
  const sx = flip ? -s : s
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${sx} ${s})`}>
      <path d="M-2.2 4 C-3 -20 -1.4 -46 0 -70" fill="none" stroke="#4a3028" strokeWidth="4" strokeLinecap="round" />
      <path d="M0 -38 C-14 -52 -30 -62 -44 -56" fill="none" stroke="#4a3028" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M0 -56 C16 -72 32 -84 44 -78" fill="none" stroke="#4a3028" strokeWidth="1.9" strokeLinecap="round" />
      <ellipse cx="-32" cy="-68" rx="24" ry="15" fill="#d97896" />
      <ellipse cx="8" cy="-90" rx="26" ry="17" fill="#f3a8c2" />
      <ellipse cx="38" cy="-74" rx="20" ry="13" fill="#e48aab" />
      <ellipse cx="-2" cy="-80" rx="15" ry="10" fill="#ffe3ee" />
    </g>
  )
}

function LoosePetal({ x, y, rot, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={fill}>
      <path d="M0 -8 C2.4 -4 3.2 1.5 0 6 C-3.2 1.5 -2.4 -4 0 -8 Z" />
    </g>
  )
}

function Grass({ x, y, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={fill} fill="none" strokeLinecap="round" opacity="0.5">
      <path d="M0 0 C-1 -9 1 -14 0 -18" strokeWidth="1.5" />
      <path d="M3 0 C5 -8 4 -13 7 -16" strokeWidth="1.25" />
      <path d="M-3 0 C-6 -7 -5 -12 -8 -15" strokeWidth="1.25" />
    </g>
  )
}

function MapleLeaf({ x, y, r = 0, s = 1, fill }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path
        fill={fill}
        d="M0 18 C-1 10 -4 6 -8 3 C-16 7 -22 2 -18 -4 C-26 -8 -22 -16 -14 -13 C-16 -22 -6 -24 -2 -16 C0 -26 0 -26 0 -16 C2 -24 6 -22 14 -13 C22 -16 26 -8 18 -4 C22 2 16 7 8 3 C4 6 1 10 0 18 Z"
      />
      <path d="M0 18 V-10" stroke={fill} strokeWidth="1.15" opacity="0.55" />
    </g>
  )
}

function MapleTree({ x, y, s, trunk, leaf, leafDark }) {
  const dim = leafDark || leaf
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="18" ry="5.5" fill={trunk} opacity="0.38" />
      <path d="M0 0 C-4 -36 4 -50 0 -80" stroke={trunk} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M0 -66 C-16 -74 -34 -86 -42 -102" stroke={trunk} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M0 -62 C18 -72 36 -88 44 -104" stroke={trunk} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M0 -48 C-12 -56 -26 -60 -34 -74" stroke={trunk} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M0 -50 C14 -58 26 -64 34 -76" stroke={trunk} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M0 -72 C-6 -80 -10 -92 -8 -102" stroke={trunk} strokeWidth="2" fill="none" strokeLinecap="round" />
      <MapleLeaf x="2" y="-106" s="1.2" fill={leaf} />
      <MapleLeaf x="-20" y="-98" r="-32" s="1.05" fill={dim} />
      <MapleLeaf x="22" y="-100" r="28" s="1.08" fill={leaf} />
      <MapleLeaf x="-34" y="-86" r="-18" s="0.92" fill={leaf} />
      <MapleLeaf x="34" y="-88" r="16" s="0.95" fill={dim} />
      <MapleLeaf x="-8" y="-84" r="-8" s="0.88" fill={dim} />
      <MapleLeaf x="12" y="-82" r="10" s="0.86" fill={leaf} />
      <MapleLeaf x="-28" y="-72" r="-40" s="0.78" fill={dim} />
      <MapleLeaf x="26" y="-70" r="38" s="0.8" fill={leaf} />
      <ellipse cx="0" cy="2.5" rx="11" ry="3.4" fill={trunk} />
    </g>
  )
}

function WinterScene({ far, mid, near, snow, accent }) {
  return (
    <g>
      <g fill={snow} opacity="0.35">
        <circle cx="180" cy="70" r="1.6" />
        <circle cx="260" cy="110" r="1.2" />
        <circle cx="340" cy="58" r="1.4" />
        <circle cx="1280" cy="80" r="1.5" />
        <circle cx="1360" cy="120" r="1.1" />
      </g>
      <circle cx="1120" cy="108" r="46" fill={snow} opacity="0.2" />
      <circle cx="1120" cy="108" r="30" fill={snow} opacity="0.55" />
      <circle cx="1108" cy="98" r="8" fill={accent} opacity="0.12" />
      <path
        d="M0 400 C120 340 200 280 300 230 C380 185 450 220 520 270 C600 175 690 130 780 175 C860 95 950 70 1040 130 C1130 55 1220 95 1320 165 C1380 125 1420 155 1440 190 L1440 900 L0 900 Z"
        fill={far}
      />
      <path d="M620 185 L655 248 L700 210 L742 262 L790 192" fill="none" stroke={snow} strokeWidth="6" opacity="0.5" strokeLinejoin="round" />
      <path d="M1000 128 L1040 190 L1088 150 L1130 210" fill="none" stroke={snow} strokeWidth="5.5" opacity="0.45" strokeLinejoin="round" />
      <path
        d="M0 510 C200 450 340 420 480 460 C620 370 760 400 900 470 C1040 380 1200 420 1440 490 L1440 900 L0 900 Z"
        fill={mid}
      />
      <path
        d="M0 640 C180 600 320 620 480 650 C680 580 880 630 1100 600 C1260 580 1380 620 1440 610 L1440 900 L0 900 Z"
        fill={near}
      />
      <path
        d="M0 640 C180 600 320 620 480 650 C680 580 880 630 1100 600 C1260 580 1380 620 1440 610"
        fill="none"
        stroke={mid}
        strokeWidth="2.2"
        opacity="0.35"
      />
      <Pine x="92" y="628" s="2.2" fill={near} snow={snow} />
      <Pine x="158" y="652" s="1.65" fill={near} snow={snow} />
      <Pine x="1188" y="618" s="2.5" fill={near} snow={snow} />
      <Pine x="1272" y="638" s="1.95" fill={near} snow={snow} />
      <Pine x="1352" y="655" s="1.55" fill={near} snow={snow} />
      <Grass x="70" y="632" s="1.4" fill={snow} />
      <Grass x="180" y="656" s="1.1" fill={snow} />
      <Grass x="1220" y="624" s="1.3" fill={snow} />
    </g>
  )
}

const FUJI =
  'M868 112 C772 208 520 368 168 492 L1348 506 C1136 372 980 206 868 112 Z'
const SPRING_LAKE =
  'M438 526 C575 484 715 506 858 478 C990 454 1072 502 1112 540 C1162 586 1096 650 968 668 C798 690 568 672 484 640 C408 612 378 564 438 526 Z'

const SPRING_GROVE = [
  [214, 508, 0.64, false, -7],
  [292, 522, 0.98, true, 5],
  [378, 498, 0.5, false, 8],
  [468, 514, 0.76, false, -4],
  [1168, 496, 0.4, true, 6],
  [1242, 508, 0.52, false, -8],
]

const SPRING_PETALS = [
  [250, 150, 22, 1.25, '#f6b7cc'],
  [410, 220, -16, 0.85, '#ffe6ef'],
  [560, 128, 34, 0.7, '#f3a4be'],
  [900, 168, -28, 0.95, '#ffe6ef'],
  [1060, 118, 14, 0.75, '#f6b7cc'],
  [330, 310, 8, 0.6, '#ffe6ef'],
  [1088, 286, 40, 0.7, '#f8c6d6'],
]

/**
 * Lake Kawaguchi morning: Fuji across the water, sakura on the far shore
 * and a taller pair framing the near bank.
 */
function SpringScene() {
  return (
    <g>
      <defs>
        <linearGradient id="spring-sky" x1="0.15" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#f8d4e2" />
          <stop offset="28%" stopColor="#f4d5e0" />
          <stop offset="52%" stopColor="#e4d4e6" />
          <stop offset="76%" stopColor="#c5daf0" />
          <stop offset="100%" stopColor="#9ec3e2" />
        </linearGradient>
        <radialGradient id="spring-sun" cx="30%" cy="14%" r="32%">
          <stop offset="0%" stopColor="#fff3dc" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#ffd0c6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffd0c6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="spring-fuji" x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%" stopColor="#d5e7f6" />
          <stop offset="38%" stopColor="#8eb4d6" />
          <stop offset="100%" stopColor="#4e7098" />
        </linearGradient>
        <linearGradient id="spring-snow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="58%" stopColor="#f6eef4" />
          <stop offset="100%" stopColor="#ddd3e2" />
        </linearGradient>
        <linearGradient id="spring-lake-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7f4fb" />
          <stop offset="16%" stopColor="#9ec8e4" />
          <stop offset="55%" stopColor="#5d92bc" />
          <stop offset="100%" stopColor="#3e6f99" />
        </linearGradient>
        <clipPath id="spring-fuji-clip">
          <path d={FUJI} />
        </clipPath>
        <clipPath id="spring-lake-clip">
          <path d={SPRING_LAKE} />
        </clipPath>
      </defs>

      <rect width="1440" height="900" fill="url(#spring-sky)" />
      <rect width="1440" height="900" fill="url(#spring-sun)" />

      <g fill="#fff8f6" opacity="0.78">
        <ellipse cx="168" cy="78" rx="78" ry="16" />
        <ellipse cx="128" cy="72" rx="30" ry="13" />
        <ellipse cx="214" cy="70" rx="36" ry="12" />
        <ellipse cx="1268" cy="96" rx="34" ry="9" />
      </g>

      <path d="M0 490 C160 450 300 478 420 440 L420 560 L0 545 Z" fill="#d7e8f7" opacity="0.55" />
      <path d="M1210 370 C1320 332 1388 348 1440 318 L1440 500 L1210 488 Z" fill="#c9ddf2" opacity="0.4" />

      <path d={FUJI} fill="url(#spring-fuji)" />
      <path
        d="M868 112 C772 208 520 368 168 492"
        fill="none"
        stroke="#f7fbff"
        strokeWidth="3"
        opacity="0.35"
      />
      <g clipPath="url(#spring-fuji-clip)">
        <path
          d="M0 0 H1440 V186 C1240 228 1040 262 868 248 C640 232 280 220 0 196 Z"
          fill="url(#spring-snow)"
        />
      </g>

      <path
        d="M0 458 C220 498 500 442 740 478 C980 512 1180 448 1440 492 L1440 900 L0 900 Z"
        fill="#5d7f96"
      />

      <SakuraTree x={48} y={518} s={0.82} field={SAKURA_B} delay="-3.4s" lean={-5} />
      {SPRING_GROVE.map(([x, y, s, flip, lean]) => (
        <SakuraGroveTree key={`g-${x}`} x={x} y={y} s={s} flip={flip} lean={lean} />
      ))}

      <g clipPath="url(#spring-lake-clip)">
        <path d={SPRING_LAKE} fill="url(#spring-lake-fill)" />
        <g opacity="0.26" transform="translate(0 490) scale(1 -0.2) translate(0 -490)">
          <path d={FUJI} fill="#f5f9fc" />
        </g>
        <g fill="none" stroke="#f7fbff" strokeWidth="1.25" opacity="0.5" strokeLinecap="round">
          <path d="M520 568 Q700 556 880 572" />
          <path d="M560 618 Q740 606 920 624" />
        </g>
      </g>
      <path d={SPRING_LAKE} fill="none" stroke="#f7fbff" strokeWidth="2.2" opacity="0.8" />

      <path d="M0 900 L0 510 C36 548 78 660 108 780 C70 850 16 885 0 900 Z" fill="#120e14" />
      <path d="M1440 900 L1440 530 C1408 562 1376 620 1364 690 C1388 770 1420 840 1440 868 Z" fill="#120e14" />
      <path
        d="M0 790 C280 754 560 788 880 756 C1160 728 1310 766 1440 740 L1440 900 L0 900 Z"
        fill="#120e14"
      />

      <SakuraTree x={122} y={836} s={2.12} field={SAKURA_A} delay="0s" lean={-8} />
      <SakuraTree x={286} y={712} s={1.18} field={SAKURA_B} delay="-1.7s" lean={6} />
      <SakuraTree x={1356} y={676} s={1.08} flip field={SAKURA_A} delay="-2.9s" lean={9} />

      <Grass x={86} y={812} s={1.3} fill="#8eae78" />
      <Grass x={210} y={838} s={1.05} fill="#f2c6d4" />
      <Grass x={1318} y={668} s={0.75} fill="#8eae78" />

      {SPRING_PETALS.map(([x, y, rot, s, fill]) => (
        <LoosePetal key={`p-${x}-${y}`} x={x} y={y} rot={rot} s={s} fill={fill} />
      ))}
    </g>
  )
}

function cubicPoint(ax, ay, bx, by, cx, cy, dx, dy, t) {
  const u = 1 - t
  const uu = u * u
  const tt = t * t
  return {
    x: uu * u * ax + 3 * uu * t * bx + 3 * u * tt * cx + tt * t * dx,
    y: uu * u * ay + 3 * uu * t * by + 3 * u * tt * cy + tt * t * dy,
  }
}

function cubicTangent(ax, ay, bx, by, cx, cy, dx, dy, t) {
  const u = 1 - t
  return {
    x: 3 * u * u * (bx - ax) + 6 * u * t * (cx - bx) + 3 * t * t * (dx - cx),
    y: 3 * u * u * (by - ay) + 6 * u * t * (cy - by) + 3 * t * t * (dy - cy),
  }
}

function unit(x, y) {
  const h = Math.hypot(x, y) || 1
  return { x: x / h, y: y / h }
}

/** Tapered strap. Direction is in frond-local space. */
function pinnaPath(px, py, dx, dy, halfW) {
  const f = (n) => +n.toFixed(2)
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const tx = px + dx
  const ty = py + dy
  const mx = px + dx * 0.62
  const my = py + dy * 0.62
  const w = halfW
  return `M${f(px + nx * w)},${f(py + ny * w)}Q${f(mx + nx * w * 0.35)},${f(my + ny * w * 0.35)} ${f(tx)},${f(ty)}Q${f(mx - nx * w * 0.2)},${f(my - ny * w * 0.2)} ${f(px - nx * w * 0.45)},${f(py - ny * w * 0.45)}Z`
}

/**
 * Rachis leaves the crown and bends with gravity.
 * Straight up stays high; sideways fronds arch and hang.
 */
function frondArch(rot) {
  const rad = (rot * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = Math.cos(rad)
  const up = -dx
  let sag
  if (up > 0.82) sag = 28
  else if (up > 0.4) sag = 40 + (0.82 - up) * 50
  else if (up > -0.05) sag = 72
  else sag = 24
  const f = (n) => +n.toFixed(2)
  return {
    c1x: f(36 + dx * -8),
    c1y: f(dy * -8),
    c2x: f(86 + dx * sag * 0.4),
    c2y: f(dy * sag * 0.4),
    tipx: f(126 + dx * sag),
    tipy: f(dy * sag),
  }
}

/**
 * One frond in the crown: bare yellow petiole, then a stiff feather.
 * The rachis carries the droop; leaflets stay on the rib.
 */
function PalmFrond({ rot = 0, fill, lit, spine, s = 1, opacity = 1, pairs = 16, spread = 1 }) {
  const sun = lit || fill
  const rib = spine || lit || fill
  const { c1x, c1y, c2x, c2y, tipx, tipy } = frondArch(rot)
  const rotRad = (rot * Math.PI) / 180
  const upX = -Math.sin(rotRad)
  const upY = -Math.cos(rotRad)
  let shadeBlades = ''
  let sunBlades = ''
  const steps = pairs + 4
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    if (t < 0.3) continue
    const p = cubicPoint(0, 0, c1x, c1y, c2x, c2y, tipx, tipy, t)
    const d = cubicTangent(0, 0, c1x, c1y, c2x, c2y, tipx, tipy, t)
    const u = unit(d.x, d.y)
    const v = { x: -u.y, y: u.x }
    const along = (t - 0.3) / 0.7
    const env = along < 0.12 ? along / 0.12 : along > 0.86 ? (1 - along) / 0.14 : 1
    const len = (6 + 28 * env) * spread
    const halfW = (0.62 + 0.72 * env) * spread
    const open = 1.02 - along * 0.46
    const forward = 0.22 + along * 0.5
    const side = (sign) => {
      let bx = v.x * sign * open + u.x * forward
      let by = v.y * sign * open + u.y * forward
      const bl = Math.hypot(bx, by) || 1
      bx /= bl
      by /= bl
      const path = pinnaPath(p.x, p.y, bx * len, by * len, halfW)
      if (bx * upX + by * upY > 0) sunBlades += path
      else shadeBlades += path
    }
    side(1)
    side(-1)
  }
  const neck = cubicPoint(0, 0, c1x, c1y, c2x, c2y, tipx, tipy, 0.18)
  const bare = cubicPoint(0, 0, c1x, c1y, c2x, c2y, tipx, tipy, 0.34)
  const petD = `M0,0 Q${neck.x.toFixed(2)},${neck.y.toFixed(2)} ${bare.x.toFixed(2)},${bare.y.toFixed(2)}`
  const ribD = `M0,0 C${c1x},${c1y} ${c2x},${c2y} ${tipx},${tipy}`
  return (
    <g transform={`rotate(${rot}) scale(${s})`} opacity={opacity}>
      <path d={shadeBlades} fill={fill} />
      <path d={sunBlades} fill={sun} />
      <path d={petD} fill="none" stroke={rib} strokeWidth="2.5" strokeLinecap="round" />
      <path d={ribD} fill="none" stroke={rib} strokeWidth="0.7" strokeLinecap="round" />
    </g>
  )
}

/** Hanging fronds first, then the arch that sits in front of the nuts. */
const PALM_BACK = [
  { rot: -168, s: 0.7, opacity: 0.4 },
  { rot: -150, s: 0.82, opacity: 0.5 },
  { rot: 164, s: 0.68, opacity: 0.38 },
  { rot: 146, s: 0.78, opacity: 0.48 },
  { rot: 34, s: 0.7, opacity: 0.44 },
]

const PALM_FRONT = [
  { rot: -158, s: 0.9, opacity: 0.82 },
  { rot: -136, s: 0.98, opacity: 0.88 },
  { rot: -116, s: 1.02, opacity: 0.92 },
  { rot: -98, s: 1.06, opacity: 0.96 },
  { rot: -80, s: 1.08, opacity: 0.98 },
  { rot: -62, s: 1, opacity: 0.96 },
  { rot: -44, s: 0.96, opacity: 0.92 },
  { rot: -26, s: 0.92, opacity: 0.9 },
  { rot: -8, s: 0.86, opacity: 0.84 },
  { rot: 16, s: 0.8, opacity: 0.8 },
]

/** Ripe husk: blunt ovoid, pedicel at the top, fibers and a shaded base. */
function Coconut({ fill, shade, hi = fill, s = 1, rot = 0 }) {
  return (
    <g transform={`rotate(${rot}) scale(${s})`}>
      <path d="M-1.05 -4.7 C-0.7 -6.5 0.75 -6.5 1.1 -4.7 L0.45 -4.15 H-0.4 Z" fill={shade} />
      <path
        d="M0 -5.15 C2.7 -4.95 4.7 -3.15 5.05 -0.35 C5.4 2.45 4.45 5.05 2.5 6.25 C1.35 6.95 0 7.05 0 7.05 C0 7.05 -1.35 6.95 -2.5 6.25 C-4.45 5.05 -5.4 2.45 -5.05 -0.35 C-4.7 -3.15 -2.7 -4.95 0 -5.15 Z"
        fill={fill}
        stroke={shade}
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
      <path
        d="M1.1 -3.6 C3.3 -2.5 4.55 -0.2 4.55 2.2 C4.5 4.3 3.15 5.7 1.35 6.35 C2.7 5.15 3.55 3.2 3.4 1.1 C3.15 -0.9 2.2 -2.6 1.1 -3.6 Z"
        fill={shade}
        opacity="0.48"
      />
      <path
        d="M-0.3 2.4 C1.5 2.7 2.7 3.8 2.2 5.3 C1.2 6.2 0 6.5 -1.3 5.9 C-1.6 4.2 -1.2 2.9 -0.3 2.4 Z"
        fill={shade}
        opacity="0.28"
      />
      <path
        d="M-1.35 -3.7 C-3.05 -2.35 -3.85 -0.4 -3.55 1.35 C-2.55 0.15 -1.85 -1.55 -1.05 -2.85 Z"
        fill={hi}
        opacity="0.5"
      />
      <g fill="none" stroke={shade} strokeWidth="0.42" strokeLinecap="round" opacity="0.42">
        <path d="M-2.15 -2.6 C-2.45 -0.2 -2.15 2.4 -1.15 4.6" />
        <path d="M-0.15 -4.4 C0.25 -1.2 0.15 2.2 -0.25 5.3" />
        <path d="M1.85 -2.7 C2.35 -0.3 2.15 2.2 1.15 4.4" />
      </g>
    </g>
  )
}

function Coconuts({ fill, shade, hi }) {
  const bunch = [
    { x: -6.6, y: 6.2, rot: 20, s: 0.88 },
    { x: 7.2, y: 8.2, rot: -22, s: 0.9 },
    { x: -1.6, y: 4.2, rot: 8, s: 1.02 },
    { x: 3.6, y: 5.6, rot: -8, s: 1.08 },
    { x: 1.1, y: 10.4, rot: -1, s: 0.98 },
  ]
  return (
    <g transform="translate(0.2 2)">
      <path d="M-0.3 -4.2 C-2.8 0.2 -5.4 3.4 -6.4 5.8" fill="none" stroke={shade} strokeWidth="1.45" strokeLinecap="round" />
      <path d="M0.4 -4.2 C2.6 0.4 5.2 3.8 7 7.4" fill="none" stroke={shade} strokeWidth="1.55" strokeLinecap="round" />
      <path d="M0.15 -3.6 C0.45 1.4 0.8 5.4 1.1 9.6" fill="none" stroke={shade} strokeWidth="1.3" strokeLinecap="round" />
      {bunch.map((n) => (
        <g key={`${n.x}-${n.y}`} transform={`translate(${n.x} ${n.y})`}>
          <Coconut fill={fill} shade={shade} hi={hi} rot={n.rot} s={n.s} />
        </g>
      ))}
    </g>
  )
}

function PalmRings({ stroke }) {
  const rings = []
  for (let i = 1; i <= 16; i += 1) {
    const t = i / 17
    const p = cubicPoint(0.2, 4, -0.4, -36, 0.6, -92, 1.1, -150, t)
    const d = cubicTangent(0.2, 4, -0.4, -36, 0.6, -92, 1.1, -150, t)
    const ang = (Math.atan2(d.y, d.x) * 180) / Math.PI + 90
    const rx = 5.4 - t * 2.6
    rings.push(
      <ellipse
        key={i}
        cx="0"
        cy="0"
        rx={rx}
        ry="1.2"
        transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${ang.toFixed(1)})`}
        fill="none"
        stroke={stroke}
        strokeWidth="0.85"
        opacity={0.28 + t * 0.12}
      />
    )
  }
  return <g>{rings}</g>
}

function Palm({ x, y, s, trunk, leaf, leafDark, hi, spine, nut, nutHi, lean = -8, sway = '0s' }) {
  const shade = leafDark || leaf
  const frondProps = { fill: shade, lit: hi || leaf, spine: spine || hi || leaf }
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
      <g className="summer-palm-sway" style={{ animationDelay: sway }}>
        <ellipse cx="1" cy="6" rx="17" ry="6" fill={trunk} opacity="0.38" />
        <g fill="none" stroke={trunk} strokeLinecap="round" opacity="0.7">
          <path d="M-7 5 C-16 12 -20 22 -18 30" strokeWidth="2.1" />
          <path d="M-2 6 C-8 16 -7 26 -3 32" strokeWidth="1.8" />
          <path d="M4 6 C10 14 14 24 11 31" strokeWidth="1.9" />
          <path d="M8 4 C16 11 18 20 15 27" strokeWidth="1.6" />
        </g>
        <path
          d="M-9.4 4 C-11.2 -18 -5.8 -50 -3.4 -84 C-1.6 -116 0.2 -140 1.1 -152 C3.5 -152 5.8 -140 6.6 -108 C8 -74 9.4 -42 9.8 -16 C10 -4 8.4 4 5.8 5 Z"
          fill={trunk}
        />
        <path
          d="M2.6 3 C3.4 -18 4.4 -52 5 -88 C5.4 -120 4.8 -140 3.9 -152 L1.1 -152 C0.2 -140 -1.6 -116 -3.4 -84 C-5.8 -50 -11.2 -18 -9.4 4 C-4 3 0.6 3 2.6 3 Z"
          fill={nutHi || trunk}
          opacity="0.28"
        />
        <PalmRings stroke={nutHi || shade} />
        <g transform="translate(1.1 -148)">
          {PALM_BACK.map((f) => (
            <PalmFrond key={`b${f.rot}`} {...frondProps} {...f} />
          ))}
          <Coconuts fill={nut || trunk} shade={trunk} hi={nutHi || trunk} />
          {PALM_FRONT.map((f) => (
            <PalmFrond key={`f${f.rot}`} {...frondProps} {...f} />
          ))}
        </g>
        <ellipse cx="0.6" cy="3.4" rx="10.5" ry="3.3" fill={trunk} />
      </g>
    </g>
  )
}

function Gull({ x, y, s = 1, fill, stroke, dir = 1, delay = '0s', duration = '20s' }) {
  // Resting pose is a shallow V from the shoulders. scaleY on the wingbeat group
  // raises/lowers BOTH tips together (shared transform = hard sync).
  const wing =
    'M0 0 C8 -2 18 -9 28 -14 C32 -15.5 36 -14.5 37.5 -12 C35 -10 30 -9 24 -7.5 C14 -4.5 6 -1.5 0 0.8 Z'
  const flapStyle = { animationDelay: delay }
  const bodyStyle = { animationDelay: `calc(${delay} + 0.08s)` }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        className="summer-gull-fly"
        style={{ animationDelay: delay, animationDuration: duration, '--gull-dir': dir }}
      >
        <g className="summer-gull-body" style={bodyStyle}>
          <g className="summer-gull-wingbeat" style={flapStyle}>
            <g transform="scale(-1 1)" opacity="0.7">
              <path d={wing} fill={fill} stroke={stroke} strokeWidth="0.45" />
            </g>
            <path d={wing} fill={fill} stroke={stroke} strokeWidth="0.45" />
          </g>
          <path
            d="M-6.8 1.1 L-12.6 -1.1 L-14.8 -0.2 L-12.9 1.35 L-15.1 2.55 L-12.5 2.95 L-7 2.45 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.35"
          />
          <path
            d="M-6.2 0.7 C-3.8 -1.35 1.8 -2.15 6.4 -1.05 C8.9 0.55 6.6 2.75 1.1 3.05 C-2.8 3.05 -5.6 2.15 -6.2 0.7 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="0.4"
          />
          <ellipse cx="1.4" cy="0.15" rx="4.8" ry="1.55" fill={stroke} opacity="0.12" />
          <circle cx="7.35" cy="-0.75" r="2.15" fill={fill} stroke={stroke} strokeWidth="0.35" />
          <path d="M8.95 -1.05 L15.2 -0.15 L9.1 0.55 Z" fill={stroke} />
          <circle cx="7.95" cy="-1.15" r="0.32" fill={stroke} />
        </g>
      </g>
    </g>
  )
}

/**
 * Crab Rave is 125 BPM. One loop = 8 beats = 3.84s.
 * Beats: L claw up, R claw up, both claws in the air, side-step.
 * Each joint is a group whose transparent rect locks the bounding box,
 * so CSS transform-origin stays on the hinge while children move.
 */
const CRAB_SHELL = '#e06a3c'
const CRAB_SHELL_DEEP = '#a63c24'
const CRAB_SHELL_HI = '#ffc7a4'
const CRAB_BELLY = '#f6d2b4'
const CRAB_CLAW = '#d24e30'
const CRAB_CLAW_DEEP = '#9a341f'
const CRAB_CLAW_HI = '#ffb088'
const CRAB_LEG = '#c4472a'
const CRAB_LEG_HI = '#ee8660'

const CRAB_LEGS = [
  { x: 14, y: 6, rot: 34, delay: 0 },
  { x: 16, y: 2.5, rot: 14, delay: -0.16 },
  { x: 15, y: -0.5, rot: -4, delay: -0.32 },
  { x: 13, y: -3, rot: -18, delay: -0.48 },
]

function CrabLeg({ delay }) {
  return (
    <g className="summer-crab-leg" style={{ animationDelay: `${delay}s` }}>
      <rect x="-8" y="-24" width="50" height="42" fill="transparent" />
      <path d="M0 -1.7 C4.2 -2.2 8 -0.8 12 0.5 L12.5 3.1 C8 1.8 4.2 0.5 0 1.1 Z" fill={CRAB_LEG} />
      <circle cx="2.2" cy="0.1" r="2.15" fill={CRAB_LEG_HI} />
      <g className="summer-crab-shin" style={{ animationDelay: `${delay}s` }}>
        <rect x="6" y="-12" width="28" height="24" fill="transparent" />
        <circle cx="12" cy="1" r="1.7" fill={CRAB_CLAW_DEEP} />
        <path d="M12 -0.5 C16.2 0.2 20.4 1.8 25.2 3.3 L25.5 5.5 C20.4 4 16.2 2.5 12 2.3 Z" fill={CRAB_LEG} />
        <path d="M23.6 2.4 L29.4 1.3 L28.5 6.2 L23.2 5.1 Z" fill={CRAB_CLAW_DEEP} />
      </g>
    </g>
  )
}

function CrabLegs({ side }) {
  const left = side === 'left'
  return CRAB_LEGS.map((leg) => (
    <g
      key={`${side}-${leg.delay}`}
      transform={
        left
          ? `translate(${-leg.x} ${leg.y}) rotate(${-leg.rot}) scale(-1 1)`
          : `translate(${leg.x} ${leg.y}) rotate(${leg.rot})`
      }
    >
      <CrabLeg delay={left ? leg.delay : leg.delay - 0.24} />
    </g>
  ))
}

function CrabClaw({ side }) {
  const left = side === 'left'
  return (
    <g transform={left ? 'translate(-16 2) scale(-1.12 1.12)' : 'translate(16 2) scale(0.92)'}>
      <g className={left ? 'summer-crab-claw-l' : 'summer-crab-claw-r'}>
        <rect x="-14" y="-60" width="84" height="86" fill="transparent" />
        <path d="M0 1.2 C3.2 -0.6 7.2 -5.2 11.2 -7.6 L13.4 -4.8 C9.2 -1.8 5.2 1.4 1.5 3.5 Z" fill={CRAB_CLAW} />
        <path d="M1.2 0.2 C4 -1.2 7.6 -4.6 10.8 -6.6 L11.6 -5.2 C8.2 -3.2 5 -0.6 2.2 1.2 Z" fill={CRAB_CLAW_HI} opacity="0.6" />
        <g className="summer-crab-pincer">
          <rect x="0" y="-42" width="58" height="54" fill="transparent" />
          <circle cx="12" cy="-6" r="3.1" fill={CRAB_CLAW_DEEP} />
          <path d="M8.2 -10.2 C12.2 -16.2 20.4 -16.2 22.4 -10 C23.2 -5.6 18.4 -2.8 12.2 -3.8 C9.2 -4.6 7.4 -7 8.2 -10.2 Z" fill={CRAB_CLAW} />
          <path d="M12.4 -12.6 C15.2 -14.6 18.6 -14.2 20.2 -11.6 C17.4 -13 14.8 -12.8 12.6 -10.8 Z" fill={CRAB_CLAW_HI} opacity="0.75" />
          <path d="M18.2 -8 C24.2 -7 30.2 -10 36 -13.2 L35.2 -10.2 C29.2 -7.8 23.4 -5.6 18.2 -5.2 Z" fill={CRAB_CLAW} />
          <path d="M24 -8.4 L25.1 -10.6 L26.2 -8.1 L27.4 -10.3 L28.6 -7.7 L29.7 -9.6" fill={CRAB_SHELL_HI} />
          <g className="summer-crab-dactyl">
            <rect x="12" y="-32" width="32" height="26" fill="transparent" />
            <path d="M16.4 -12.2 C22.2 -16.2 28.4 -20.2 35.2 -23.2 L34.3 -20.2 C28.2 -17.4 22.4 -14 17.2 -10.2 Z" fill={CRAB_CLAW} />
            <path d="M22.2 -15.2 L23.2 -17.4 L24.4 -14.6 L25.6 -16.6 L26.6 -14" fill={CRAB_SHELL_HI} />
          </g>
        </g>
      </g>
    </g>
  )
}

function CrabEye({ cx, stalkClass, pupilClass, pupil }) {
  return (
    <g transform={`translate(${cx} -12)`}>
      <g className={stalkClass}>
        <rect x="-8" y="-18" width="16" height="22" fill="transparent" />
        <path d="M-1.35 0.2 C-1.55 -4.6 -1.05 -8.2 -0.5 -11 L0.5 -11 C1.05 -8.2 1.55 -4.6 1.35 0.2 Z" fill={CRAB_SHELL_DEEP} />
        <circle cx="0" cy="-12.2" r="2.85" fill="#fff8ee" />
        <circle className={pupilClass} cx="0.2" cy="-12.05" r="1.25" fill={pupil} />
        <circle cx="0.9" cy="-12.75" r="0.42" fill="#fff" />
      </g>
    </g>
  )
}

function Crab({ x, y, s, fill, highlight }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className="summer-crab-shadow" cx="0" cy="17" rx="22" ry="4.4" fill="#2a1810" />
      <g className="summer-crab">
        <rect x="-110" y="-100" width="220" height="170" fill="transparent" />
        <CrabLegs side="left" />
        <CrabLegs side="right" />
        <g className="summer-crab-body">
          <rect x="-26" y="-20" width="52" height="40" fill="transparent" />
          <ellipse cx="0" cy="8" rx="11.5" ry="5.6" fill={CRAB_BELLY} />
          <ellipse cx="0" cy="8.6" rx="7" ry="3.1" fill={highlight} opacity="0.28" />
          <path
            d="M0 -14.2 C11.2 -16.4 20.4 -10.2 21.6 -2.2 C22.8 6.2 17 13 8.4 14.6 L0 15.2 L-8.4 14.6 C-17 13 -22.8 6.2 -21.6 -2.2 C-20.4 -10.2 -11.2 -16.4 0 -14.2 Z"
            fill={CRAB_SHELL}
          />
          <path d="M-14.6 -6.4 L-18.4 -8.6 L-15.2 -3.8 Z" fill={CRAB_SHELL_DEEP} />
          <path d="M14.6 -6.4 L18.4 -8.6 L15.2 -3.8 Z" fill={CRAB_SHELL_DEEP} />
          <path
            d="M-15.5 3.2 C-11 10.4 -5.5 13.2 0 13.6 C5.5 13.2 11 10.4 15.5 3.2 C11 7.8 5.4 9.6 0 9.4 C-5.4 9.6 -11 7.8 -15.5 3.2 Z"
            fill={CRAB_SHELL_DEEP}
            opacity="0.55"
          />
          <path d="M-7.6 -11.2 C-1.2 -13.6 6.4 -12.2 10.6 -8.2 C4.2 -10.6 -1.4 -10.2 -6.6 -7.2 C-8.6 -8.6 -8.8 -10 -7.6 -11.2 Z" fill={CRAB_SHELL_HI} />
          <path d="M-6.2 -7.4 C-2.4 -1.6 -1.6 4 -2.4 9.2" fill="none" stroke={CRAB_SHELL_DEEP} strokeWidth="0.75" opacity="0.4" />
          <path d="M0 -9.4 C0.6 -2 0.5 4 0 10" fill="none" stroke={CRAB_SHELL_DEEP} strokeWidth="0.75" opacity="0.35" />
          <path d="M6.2 -7.4 C2.4 -1.6 1.6 4 2.4 9.2" fill="none" stroke={CRAB_SHELL_DEEP} strokeWidth="0.75" opacity="0.4" />
          <circle cx="-5.2" cy="-12.4" r="1.55" fill={CRAB_SHELL} />
          <circle cx="0" cy="-14.5" r="1.7" fill={CRAB_SHELL} />
          <circle cx="5.2" cy="-12.4" r="1.55" fill={CRAB_SHELL} />
          <path d="M-2.6 -5.6 L0 -3.5 L2.6 -5.6" fill="none" stroke={CRAB_SHELL_DEEP} strokeWidth="0.75" strokeLinecap="round" />
        </g>
        <CrabEye cx={-6.4} stalkClass="summer-crab-eye-l" pupilClass="summer-crab-pupil-l" pupil={fill} />
        <CrabEye cx={6.4} stalkClass="summer-crab-eye-r" pupilClass="summer-crab-pupil-r" pupil={fill} />
        <CrabClaw side="left" />
        <CrabClaw side="right" />
      </g>
    </g>
  )
}

function Shell({ x, y, rot = 0, s = 1, fill, line }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={fill} stroke={line} strokeWidth="0.55" strokeLinejoin="round">
      <path d="M0 4.6 C-7.4 4.6 -10.2 -0.6 -6.4 -5.4 C-3.6 -1.8 -1.1 -2.6 0 -6.4 C1.1 -2.6 3.6 -1.8 6.4 -5.4 C10.2 -0.6 7.4 4.6 0 4.6 Z" />
      <path d="M0 3.6 L0 -5.4" fill="none" opacity="0.65" />
      <path d="M-2.8 2.8 L-3.6 -2.8" fill="none" opacity="0.4" />
      <path d="M2.8 2.8 L3.6 -2.8" fill="none" opacity="0.4" />
    </g>
  )
}

function Starfish({ x, y, rot = 0, s = 1, fill }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={fill}>
      <path d="M0 -7.2 L1.5 -2.2 L6.8 -2.3 L2.6 1.1 L4.2 6.4 L0 3.2 L-4.2 6.4 L-2.6 1.1 L-6.8 -2.3 L-1.5 -2.2 Z" />
    </g>
  )
}

/** Light from the upper left, so the shadow lies down-right and stops at the shoreline. */
function PalmShadow({ x, y, s, clip }) {
  return (
    <g clipPath={`url(#${clip})`}>
      <g transform={`translate(${x} ${y}) rotate(26)`} fill="#2a1810" opacity="0.24">
        <ellipse cx={22 * s} cy={1.5 * s} rx={36 * s} ry={8 * s} />
      </g>
    </g>
  )
}

function SummerSun() {
  const rays = []
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    rays.push(
      <line
        key={i}
        x1={+(Math.cos(a) * 18).toFixed(2)}
        y1={+(Math.sin(a) * 18).toFixed(2)}
        x2={+(Math.cos(a) * 29).toFixed(2)}
        y2={+(Math.sin(a) * 29).toFixed(2)}
      />
    )
  }
  return (
    <g transform="translate(52 44)">
      <circle r="32" fill="#f3c56e" opacity="0.16" />
      <g stroke="#fff3d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.72">
        {rays}
      </g>
      <circle r="12" fill="#fff6d8" />
      <circle r="7.5" fill="#f3c56e" />
    </g>
  )
}

function SummerScene({ far, mid, near, snow, accent }) {
  return (
    <g>
      <defs>
        <linearGradient id="summer-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ad6f4" stopOpacity="0.62" />
          <stop offset="48%" stopColor="#3d9ed4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3d9ed4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="summer-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={snow} stopOpacity="0.22" />
          <stop offset="8%" stopColor={far} stopOpacity="0.78" />
          <stop offset="42%" stopColor={mid} stopOpacity="0.88" />
          <stop offset="100%" stopColor={near} stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="summer-sand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.82" />
          <stop offset="55%" stopColor={snow} stopOpacity="0.42" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="summer-sand-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.82" />
          <stop offset="55%" stopColor={snow} stopOpacity="0.42" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
        </linearGradient>
        <clipPath id="summer-sand-clip">
          <path d="M0 900 L0 400 C72 386 132 448 178 528 C228 638 148 778 86 900 Z" />
        </clipPath>
        <clipPath id="summer-sand-clip-r">
          <path d="M1440 900 L1440 408 C1368 394 1308 456 1262 536 C1212 646 1292 786 1354 900 Z" />
        </clipPath>
      </defs>

      <rect width="1440" height="320" fill="url(#summer-sky)" />
      <SummerSun />
      <Cloud x="148" y="102" s="1.12" fill={snow} />
      <Cloud x="1204" y="68" s="0.86" fill={snow} />

      <Gull x="18" y="158" s="1.22" fill={snow} stroke={near} delay="0s" duration="21s" />
      <Gull x="270" y="30" s="0.92" fill={snow} stroke={mid} delay="-7s" duration="24s" />
      <Gull x="1372" y="40" s="1.02" fill={snow} stroke={near} dir={-1} delay="-4s" duration="22s" />

      <ellipse cx="720" cy="292" rx="920" ry="28" fill={snow} opacity="0.1" />
      <rect x="0" y="300" width="1440" height="600" fill="url(#summer-ocean)" />
      <path d="M0 300 H1440" stroke={snow} strokeWidth="2.2" opacity="0.38" />
      <path d="M0 304 H1440" stroke={far} strokeWidth="6" opacity="0.25" />

      <g fill="none" stroke={snow} strokeWidth="1.35" opacity="0.2" strokeLinecap="round">
        <path d="M220 348 Q420 338 720 350 Q1020 338 1220 348" />
        <path d="M180 402 Q460 388 720 404 Q980 388 1260 402" />
        <path d="M240 468 Q500 454 720 470 Q940 454 1200 468" />
        <path d="M200 540 Q480 526 720 542 Q960 526 1240 540" />
        <path d="M260 612 Q520 598 720 614 Q920 598 1180 612" />
      </g>
      <g fill={snow} opacity="0.22">
        <ellipse cx="640" cy="376" rx="18" ry="2.2" />
        <ellipse cx="820" cy="430" rx="14" ry="1.8" />
        <ellipse cx="560" cy="510" rx="22" ry="2.4" />
        <ellipse cx="900" cy="498" rx="16" ry="1.9" />
      </g>

      <path
        d="M0 900 L0 400 C72 386 132 448 178 528 C228 638 148 778 86 900 Z"
        fill="url(#summer-sand)"
      />
      <path
        d="M0 400 C72 386 132 448 178 528 C228 638 148 778 86 900"
        fill="none"
        stroke={snow}
        strokeWidth="2"
        opacity="0.28"
      />
      <path
        d="M0 900 L0 500 C48 524 78 610 98 700 C72 790 28 860 0 900 Z"
        fill={accent}
        opacity="0.2"
      />
      <PalmShadow x={36} y={418} s={0.52} clip="summer-sand-clip" />
      <PalmShadow x={70} y={688} s={0.82} clip="summer-sand-clip" />
      <Grass x="10" y="462" s="0.8" fill={accent} />
      <Grass x="116" y="724" s="0.85" fill={snow} />
      <Palm x="36" y="418" s="0.52" trunk="#3a2416" leaf="#1b7a40" leafDark="#0d4a28" hi="#6fa33a" spine="#e4ef9a" nut="#4a2e1c" nutHi="#8d6244" lean={4} sway="-2.4s" />
      <Palm x="70" y="688" s="0.82" trunk="#3a2416" leaf="#166838" leafDark="#0a3a22" hi="#6fa33a" spine="#e4ef9a" nut="#4a2e1c" nutHi="#8d6244" lean={6} sway="0s" />
      <Shell x="22" y="708" rot={-18} s={0.7} fill={snow} line="#b8883e" />
      <Starfish x="128" y="724" rot={-12} s={0.5} fill="#e07a4c" />
      <Shell x="118" y="778" rot={20} s={0.58} fill={accent} line="#8d6244" />
      <Crab x="102" y="708" s="1.08" fill={near} highlight={snow} />

      <path
        d="M1440 900 L1440 408 C1368 394 1308 456 1262 536 C1212 646 1292 786 1354 900 Z"
        fill="url(#summer-sand-r)"
      />
      <path
        d="M1440 408 C1368 394 1308 456 1262 536 C1212 646 1292 786 1354 900"
        fill="none"
        stroke={snow}
        strokeWidth="2"
        opacity="0.28"
      />
      <path
        d="M1440 900 L1440 508 C1392 532 1362 618 1342 708 C1368 798 1412 868 1440 900 Z"
        fill={accent}
        opacity="0.2"
      />
      <PalmShadow x={1386} y={560} s={0.98} clip="summer-sand-clip-r" />
      <Grass x="1434" y="618" s="0.8" fill={accent} />
      <Palm x="1386" y="560" s="0.98" trunk="#3a2416" leaf="#1b7a40" leafDark="#0d4a28" hi="#6fa33a" spine="#e4ef9a" nut="#4a2e1c" nutHi="#8d6244" lean={-8} sway="-1.1s" />
      <Shell x="1340" y="692" rot={18} s={0.92} fill={snow} line="#b8883e" />
      <Shell x="1358" y="708" rot={-20} s={0.66} fill={accent} line="#8d6244" />
    </g>
  )
}

function AutumnScene({ far, mid, near, snow, accent }) {
  return (
    <g>
      <circle cx="200" cy="108" r="52" fill={snow} opacity="0.16" />
      <circle cx="200" cy="108" r="28" fill={snow} opacity="0.42" />
      <circle cx="188" cy="98" r="7" fill={accent} opacity="0.2" />
      <path
        d="M0 300 C140 230 260 250 400 180 C540 110 680 160 820 95 C980 20 1140 80 1440 40 L1440 900 L0 900 Z"
        fill={far}
      />
      <path
        d="M0 430 C180 350 360 390 540 310 C760 220 980 300 1440 250 L1440 900 L0 900 Z"
        fill={mid}
      />
      <path
        d="M0 640 C260 575 540 620 820 585 C1100 550 1300 610 1440 585 L1440 900 L0 900 Z"
        fill={near}
      />
      <path
        d="M0 640 C260 575 540 620 820 585 C1100 550 1300 610 1440 585"
        fill="none"
        stroke={mid}
        strokeWidth="2.2"
        opacity="0.38"
      />
      <MapleTree x="108" y="618" s="1.7" trunk={near} leaf={accent} leafDark={far} />
      <MapleTree x="238" y="655" s="1.22" trunk={near} leaf={far} leafDark={mid} />
      <MapleTree x="1160" y="598" s="1.85" trunk={near} leaf={accent} leafDark={far} />
      <MapleTree x="1310" y="638" s="1.32" trunk={near} leaf={far} leafDark={mid} />
      <Grass x="72" y="622" s="1.5" fill={accent} />
      <Grass x="268" y="658" s="1.2" fill={far} />
      <Grass x="1218" y="604" s="1.4" fill={accent} />
      <MapleLeaf x="980" y="168" r="-18" s="1.15" fill={accent} />
      <MapleLeaf x="1048" y="198" r="22" s="0.9" fill={far} />
      <MapleLeaf x="360" y="210" r="-30" s="0.8" fill={accent} />
    </g>
  )
}
