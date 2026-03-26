import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'

const ProjectModal = lazy(() => import('./ProjectModal.jsx'))

// Single global rAF + monotonic session — avoids shared useRef missing the handle to cancel.
let __particleCanvasSession = 0
let __particleRafId = 0

function cancelParticleRaf() {
  cancelAnimationFrame(__particleRafId)
  __particleRafId = 0
}

// ─── Season System ────────────────────────────────────────────────────────────
const SEASON_CONFIG = {
  winter: {
    label: 'Winter', icon: '❄️',
    bodyBg: '#030d18',
    mtnColors: ['#1c4068', '#0e2a42', '#071c2e', '#030d18'],
    cardBg: 'rgba(8, 26, 46, 0.72)',
    sideGlow: 'rgba(200,235,255,0.45)',
    glowInner: 'rgba(160, 215, 255, 0.28)',
    glowOuter: 'rgba(200, 235, 255, 0.14)',
  },
  spring: {
    label: 'Spring', icon: '🌸',
    bodyBg: '#060f08',
    mtnColors: ['#1a4820', '#0e2e14', '#071a09', '#060f08'],
    cardBg: 'rgba(8, 26, 12, 0.72)',
    sideGlow: 'rgba(180,240,160,0.4)',
    glowInner: 'rgba(120, 210, 140, 0.22)',
    glowOuter: 'rgba(170, 235, 160, 0.12)',
  },
  summer: {
    label: 'Summer', icon: '🌻',
    // Dusk over water: cool teal mountains, warm air — reads clearly different from autumn earth tones
    bodyBg: '#030f14',
    mtnColors: ['#1a6b7a', '#0f4a58', '#082e38', '#030f14'],
    cardBg: 'rgba(6, 38, 48, 0.78)',
    sideGlow: 'rgba(255, 214, 130, 0.38)',
    glowInner: 'rgba(90, 200, 210, 0.22)',
    glowOuter: 'rgba(255, 210, 130, 0.16)',
  },
  autumn: {
    label: 'Autumn', icon: '🍂',
    // Rust, bark, wet soil — no shared red-brown band with old “volcanic” summer
    bodyBg: '#0a0504',
    mtnColors: ['#4a2c22', '#2e1a14', '#1a0f0c', '#0a0504'],
    cardBg: 'rgba(32, 18, 12, 0.76)',
    sideGlow: 'rgba(200, 95, 45, 0.36)',
    glowInner: 'rgba(210, 110, 60, 0.2)',
    glowOuter: 'rgba(160, 70, 45, 0.12)',
  },
}
const SEASON_ORDER = ['winter', 'spring', 'summer', 'autumn']

function autoSeason() {
  const m = new Date().getMonth()
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'autumn'
  return 'winter'
}

const profile = {
  name: 'Pavlo Dorofieiev',
  role: '.NET developer · APIs, WPF, MAUI, and web where it fits',
  location: 'Tychy, Poland',
  email: 'pavlo.dorofieiev@gmail.com',
  phone: '+48 576 468 614',
  linkedin: 'https://www.linkedin.com/in/pavlo-dorofieiev-596b282b1/',
  github: 'https://github.com/Drakonchik1',
  portfolio: 'https://portfolio-cv-six-indol.vercel.app',
  portfolioRepo: 'https://github.com/Drakonchik1/portfolio-cv',
  telegram: 'https://t.me/Drakon_v2',
  whatsapp: 'https://wa.me/48576468614',
  summary:
    "I work mostly in C#: ASP.NET Core for APIs, WPF for desktop, MAUI when the same codebase needs to hit mobile. I keep layouts and naming straightforward so teammates can find things quickly, return errors that are useful in logs, and use async properly so the UI stays responsive during I/O.",
}

const techStack = ['C#', '.NET', 'ASP.NET Core', 'EF Core', 'SQLite', 'WPF', 'MAUI', 'React', 'REST APIs']
const categories = ['All', 'Backend', 'Full-Stack', 'Desktop', 'Mobile']

const projectPosts = [
  {
    title: 'TaskManagerAPI: Production-Style Task Backend',
    excerpt:
      'A complete ASP.NET Core task API with filtering, pagination, sorting, validation, global exception handling, and SQLite persistence.',
    stack: 'ASP.NET Core · EF Core · SQLite · Swagger',
    category: 'Backend',
    link: '#',
    demo: {
      type: 'api',
      endpoints: [
        { method: 'GET',    path: '/api/tasks',      desc: 'List tasks — filter by status/priority, sort, paginate' },
        { method: 'POST',   path: '/api/tasks',      desc: 'Create task with validation' },
        { method: 'PUT',    path: '/api/tasks/{id}', desc: 'Update title, priority, progress' },
        { method: 'DELETE', path: '/api/tasks/{id}', desc: 'Remove task' },
      ],
      sample: `// GET /api/tasks?status=InProgress&priority=High&page=1
{
  "items": [
    {
      "id": 3,
      "title": "Fix authentication middleware",
      "priority": "High",
      "status": "InProgress",
      "createdAt": "2024-03-10T09:15:00Z",
      "dueDate": "2024-03-15T18:00:00Z"
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}`,
      highlights: [
        'Global exception middleware — consistent error envelope',
        'Pagination + multi-field sorting on every list endpoint',
        'Enum serialized as strings (JsonStringEnumConverter)',
        'EF Core query optimisation with compiled indexes',
      ],
    },
  },
  {
    title: 'BookingSystemAPI: Full Booking Application',
    excerpt:
      'A full-stack booking app with conflict detection, status workflows, seeded data, API endpoints, and integrated web UI.',
    stack: 'ASP.NET Core · EF Core · SQLite · JavaScript',
    category: 'Full-Stack',
    link: '#',
    demo: {
      type: 'api',
      endpoints: [
        { method: 'GET',   path: '/api/catalog',           desc: 'Browse providers and service types' },
        { method: 'POST',  path: '/api/bookings',          desc: 'Create booking — conflict detection included' },
        { method: 'PATCH', path: '/api/bookings/{id}/status', desc: 'Advance status: Pending → Confirmed → Completed' },
        { method: 'DELETE',path: '/api/bookings/{id}',     desc: 'Cancel booking' },
      ],
      sample: `// POST /api/bookings
{
  "serviceTypeId": 2,
  "providerId": 1,
  "clientName": "Anna Kowalska",
  "startTime": "2024-04-20T10:00:00",
  "endTime":   "2024-04-20T11:00:00"
}

// 409 Conflict if slot is already taken:
{
  "error": "Time slot is already booked for this provider."
}`,
      highlights: [
        'Overlap detection: rejects double-bookings at service layer',
        'Status machine: Pending → Confirmed → Completed / Cancelled',
        'Integrated vanilla JS front-end served from wwwroot',
        'Seeded catalog (providers + service types) on first run',
      ],
    },
  },
  {
    title: 'WeatherApp: API-Driven Desktop Analytics',
    excerpt:
      'Desktop weather dashboard with OpenWeatherMap + IMGW integration, data source tracking, date filters, and CSV export.',
    stack: '.NET 8 · WPF · REST APIs · JSON',
    category: 'Desktop',
    link: '#',
    demo: {
      type: 'app',
      screens: [
        { label: 'Dashboard',    desc: 'Live temperature, humidity, wind speed and pressure charts updated every 15 min.' },
        { label: 'Date Filter',  desc: 'Custom date range picker — loads historical data from both OpenWeatherMap and IMGW APIs.' },
        { label: 'Data Sources', desc: 'Toggle between sources; side-by-side comparison mode shows API discrepancies.' },
        { label: 'CSV Export',   desc: 'One-click export of the current view to a spreadsheet-ready CSV file.' },
      ],
      highlights: [
        'Dual API integration — OpenWeatherMap + Polish IMGW',
        'MVVM pattern with data-binding throughout',
        'Async fetch with cancellation tokens (no UI freeze)',
        'Auto-retry on network failure with exponential back-off',
      ],
    },
  },
  {
    title: 'Budzik: Cross-Platform Alarm Scheduler',
    excerpt:
      'Alarm application featuring Android notification channels, exact scheduling behavior, and platform-specific implementation details.',
    stack: '.NET MAUI · C# · Android APIs',
    category: 'Mobile',
    link: '#',
    demo: {
      type: 'app',
      screens: [
        { label: 'Alarm List',   desc: 'All alarms with next-trigger time, enable/disable toggle and swipe-to-delete.' },
        { label: 'Add Alarm',    desc: 'Time picker, repeat pattern (once / daily / weekdays) and custom label.' },
        { label: 'Notification', desc: 'Heads-up notification with Dismiss and Snooze actions, exact scheduling via AlarmManager.' },
        { label: 'Settings',     desc: 'Default snooze duration, ringtone selection, vibration toggle.' },
      ],
      highlights: [
        'Android AlarmManager.setExactAndAllowWhileIdle for precision',
        'Notification channels with importance levels (API 26+)',
        'Background service survives app close and device restart',
        'Platform-specific code via MAUI dependency injection',
      ],
    },
  },
  {
    title: 'ReflexGame: Event-Driven Mobile Logic',
    excerpt:
      'Reaction game with robust state transitions, timer mechanics, false-start detection, and persistent local ranking.',
    stack: '.NET MAUI · C# · UX State Logic',
    category: 'Mobile',
    link: '#',
    demo: {
      type: 'app',
      screens: [
        { label: 'Ready Screen', desc: 'Countdown before the stimulus — random delay 1–4 s prevents anticipation.' },
        { label: 'Reaction',     desc: 'Tap as fast as possible after the green flash. Timer precision: ±1 ms.' },
        { label: 'False Start',  desc: 'Tap before the stimulus → penalty round displayed with explanation.' },
        { label: 'Leaderboard',  desc: 'Top 10 personal scores stored with SQLite, sortable by date or time.' },
      ],
      highlights: [
        'Finite state machine: Idle → Waiting → Active → Result → Ranked',
        'CancellationToken-backed timer — no leaking async operations',
        'False-start detection with ≤ 100 ms threshold',
        'Persistent local ranking via SQLite + EF Core',
      ],
    },
  },
]

const approachPillars = [
  {
    title: 'Backends',
    body: "I validate input before it wanders too deep. If something throws, I'd rather the client gets a clear JSON message than a silent 500.",
  },
  {
    title: 'Desktop & phones',
    body: 'WPF and MAUI taught me to watch async/await and the UI thread — the boring stuff that stops windows from locking up mid-request.',
  },
  {
    title: 'Git history',
    body: 'I split work into smaller commits when I can. Makes it easier for someone else to read, and easier for me to roll back a bad idea.',
  },
]

const technicalFocus = [
  'EF Core — trying not to trip over N+1 queries',
  'Booking logic and “this slot is already taken” cases',
  'Two weather APIs in one WPF app without lying in the chart',
  'Android alarms: channels, permissions, the usual headache',
  'Lists with filters + paging that still behave',
]

// ─── Koch fractal snowflake generator ────────────────────────────────────────
// Starts from 6 arms at 60° intervals. Each arm recursively sprouts two
// sub-branches at ±60° from its own direction at the midpoint — exactly the
// Koch branching rule that produces dendritic ice-crystal shapes.
function buildKochFlake(cx, cy, r, depth) {
  const segs = []
  const branch = (x1, y1, x2, y2, d) => {
    segs.push({ x1, y1, x2, y2, sw: 0.35 + (d / (depth || 1)) * 1.25 })
    if (d === 0) return
    const mx = (x1 + x2) * 0.5
    const my = (y1 + y2) * 0.5
    const a = Math.atan2(y2 - y1, x2 - x1)
    const l = Math.hypot(x2 - x1, y2 - y1) * 0.44
    branch(mx, my, mx + l * Math.cos(a + Math.PI / 3), my + l * Math.sin(a + Math.PI / 3), d - 1)
    branch(mx, my, mx + l * Math.cos(a - Math.PI / 3), my + l * Math.sin(a - Math.PI / 3), d - 1)
  }
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 2
    branch(cx, cy, cx + r * Math.cos(a), cy + r * Math.sin(a), depth)
  }
  return segs
}

// Precompute two detail levels — reused across all snowflake instances
const FLAKE_D3 = buildKochFlake(50, 50, 44, 3) // full crystal detail
const FLAKE_D2 = buildKochFlake(50, 50, 44, 2) // simpler / distant

// ─── Seasonal decoration SVGs ─────────────────────────────────────────────────
// Spring: 5-petal apple blossom
function AppleBlossomSVG({ size }) {
  const cx = 50, cy = 50, off = 19
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {[0,72,144,216,288].map((deg, i) => {
        const a = (deg - 90) * Math.PI / 180
        const px = cx + off * Math.cos(a), py = cy + off * Math.sin(a)
        return (
          <ellipse key={i} cx={px} cy={py} rx="9" ry="19"
            transform={`rotate(${deg},${px},${py})`}
            fill="rgba(255,215,225,0.88)" stroke="rgba(220,140,165,0.5)" strokeWidth="0.8"/>
        )
      })}
      <circle cx={cx} cy={cy} r="7.5" fill="rgba(255,228,65,0.92)" stroke="rgba(200,158,28,0.55)" strokeWidth="0.9"/>
      {[0,72,144,216,288].map((deg, i) => {
        const a = (deg - 90) * Math.PI / 180
        return <line key={i} x1={cx} y1={cy} x2={cx + 8*Math.cos(a)} y2={cy + 8*Math.sin(a)}
          stroke="rgba(210,160,40,0.6)" strokeWidth="0.7"/>
      })}
    </svg>
  )
}

// Summer: sunflower
function SunflowerSVG({ size }) {
  const cx = 50, cy = 50, off = 20, n = 13
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {Array.from({ length: n }, (_, i) => {
        const deg = i * (360 / n)
        const a = (deg - 90) * Math.PI / 180
        const px = cx + off * Math.cos(a), py = cy + off * Math.sin(a)
        return (
          <ellipse key={i} cx={px} cy={py} rx="7" ry="17"
            transform={`rotate(${deg},${px},${py})`}
            fill="rgba(255,205,72,0.9)" stroke="rgba(200,140,28,0.5)" strokeWidth="0.7"/>
        )
      })}
      <circle cx={cx} cy={cy} r="13" fill="rgba(42,28,12,0.92)" stroke="rgba(24,16,6,0.55)" strokeWidth="0.8"/>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * Math.PI / 180
        return <circle key={i} cx={cx + 8*Math.cos(a)} cy={cy + 8*Math.sin(a)} r="1.5"
          fill="rgba(255,228,140,0.78)"/>
      })}
    </svg>
  )
}

// Autumn: maple leaf
// 3 colour variants: 0=orange, 1=red-orange, 2=golden-yellow
const LEAF_PALETTES = [
  { fill: 'rgba(175,82,38,0.92)', stroke: 'rgba(110,48,22,0.55)', vein: 'rgba(90,42,20,0.45)' },
  { fill: 'rgba(132,48,52,0.92)', stroke: 'rgba(85,28,32,0.55)', vein: 'rgba(70,24,28,0.45)' },
  { fill: 'rgba(168,118,42,0.92)', stroke: 'rgba(105,78,28,0.55)', vein: 'rgba(88,62,22,0.45)' },
]

function MapleLeafSVG({ size, variant = 0 }) {
  const { fill, stroke, vein } = LEAF_PALETTES[variant % 3]
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <path
        d="M50 6 L53 22 L66 16 L59 30 L76 26 L66 40 L80 44 L66 50 L74 64 L58 56 L58 74 L50 66 L42 74 L42 56 L26 64 L34 50 L20 44 L34 40 L24 26 L41 30 L34 16 L47 22 Z"
        fill={fill} stroke={stroke} strokeWidth="0.9"/>
      <line x1="50" y1="66" x2="50" y2="90" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="50" y1="38" x2="34" y2="50" stroke={vein} strokeWidth="0.7"/>
      <line x1="50" y1="38" x2="66" y2="50" stroke={vein} strokeWidth="0.7"/>
      <line x1="50" y1="52" x2="38" y2="62" stroke={vein} strokeWidth="0.6"/>
      <line x1="50" y1="52" x2="62" y2="62" stroke={vein} strokeWidth="0.6"/>
    </svg>
  )
}

function SeasonDecoSVG({ season, size, detail, id = 0 }) {
  switch (season) {
    case 'spring': return <AppleBlossomSVG size={size} />
    case 'summer': return <SunflowerSVG size={size} />
    case 'autumn': return <MapleLeafSVG size={size} variant={id % 3} />
    default:       return <KochSnowflakeSVG size={size} detail={detail} />
  }
}

function KochSnowflakeSVG({ size, detail = 3 }) {
  const segs = detail === 3 ? FLAKE_D3 : FLAKE_D2
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {/* Tiny center hexagon */}
      <polygon
        points="50,43.5 56.5,47 56.5,53 50,56.5 43.5,53 43.5,47"
        stroke="rgba(220,245,255,0.70)"
        strokeWidth="0.9"
        fill="none"
      />
      {segs.map((s, i) => (
        <line
          key={i}
          x1={s.x1} y1={s.y1}
          x2={s.x2} y2={s.y2}
          stroke="rgba(230,248,255,0.92)"
          strokeWidth={s.sw}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

// Seeded LCG — deterministic "random", stable across re-renders
function lcg(seed) {
  let s = seed >>> 0
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967295 }
}

// Season placement config — used inside SideDecorations via useMemo
const SEASON_PLACEMENT = {
  winter: { count: 135, minSz: 14, maxSz: 52, gap: 1.2,
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => rng() * H,
  },
  spring: { count: 165, minSz: 12, maxSz: 40, gap: 1.0,
    // x: full canvas — flowers appear everywhere, not just at edges
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => H * (0.04 + Math.pow(rng(), 0.6) * 0.92),
  },
  summer: { count: 128, minSz: 20, maxSz: 46, gap: 1.25,
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => rng() * H * 0.96 + H * 0.02,
  },
  autumn: { count: 135, minSz: 12, maxSz: 48, gap: 1.0,
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => {
      const r = rng()
      return H * (r < 0.28 ? rng() * 0.27 : r < 0.52 ? 0.73 + rng() * 0.24 : 0.15 + rng() * 0.60)
    },
  },
}

const AMBIENT_ROT_SEED = { winter: 0xa11b001, spring: 0xa11b002, summer: 0xa11b003, autumn: 0xa11b004 }

function AmbientRotors({ season }) {
  const items = useMemo(() => {
    const rng = lcg(AMBIENT_ROT_SEED[season])
    const n = 16
    return Array.from({ length: n }, (_, i) => ({
      id: `${season}-ar-${i}`,
      topPct: 4 + rng() * 90,
      leftPct: 2 + rng() * 96,
      px: 20 + Math.floor(rng() * 58),
      sec: 18 + rng() * 36,
      rev: rng() > 0.47,
      dashed: rng() > 0.52,
    }))
  }, [season])

  return (
    <div className="ambient-rotors" aria-hidden="true">
      {items.map((r) => (
        <div
          key={r.id}
          className="ambient-rotor-anchor"
          style={{ top: `${r.topPct}%`, left: `${r.leftPct}%` }}
        >
          <div
            className={`ambient-rotor-ring${r.dashed ? ' ambient-rotor-ring--dashed' : ''}`}
            style={{
              width: r.px,
              height: r.px,
              animationDuration: `${r.sec}s`,
              animationDirection: r.rev ? 'reverse' : 'normal',
            }}
          />
        </div>
      ))}
    </div>
  )
}

function ParticleField({ season }) {
  const canvasRef = useRef(null)

  // One <canvas> instance for the whole app lifetime; [season] only swaps the sim + rAF (no remount).
  useLayoutEffect(() => {
    cancelParticleRaf()
    const session = ++__particleCanvasSession

    const canvas = canvasRef.current
    if (!canvas) return

    const wrap = canvas.closest('.particle-season-wrap')
    wrap?.querySelectorAll('canvas.snow-field').forEach((c) => {
      if (c !== canvas) c.remove()
    })
    const w0 = window.innerWidth
    const h0 = window.innerHeight
    // Reset bitmap so no previous season pixels linger on the same element
    canvas.width = w0
    canvas.height = h0
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    const particles = []
    // Autumn: many thin streaks; other seasons: fewer, larger motes
    const COUNT = season === 'autumn' ? 240 : season === 'winter' ? 95 : 88
    const isAutumn = season === 'autumn'

    let alive = true

    const seedParticles = () => {
      particles.length = 0
      const w = canvas.width
      const h = canvas.height
      if (w < 1 || h < 1) return
      for (let i = 0; i < COUNT; i++) {
        if (isAutumn) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            // line width (px) — keep thin so it reads as water, not scratches
            size: 0.35 + Math.random() * 0.55,
            speed: 12 + Math.random() * 18,
            drift: -1.4 + Math.random() * 2.8,
            rot: 0,
            rotV: 0,
            hue: Math.random(),
            phase: Math.random() * 6.28,
            // streak length along velocity; scales a bit with screen height
            len: (14 + Math.random() * 26) * (1 + Math.min(h, 1200) / 2400),
          })
        } else {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 1 + Math.random() * 2.8,
            speed: 0.2 + Math.random() * 0.6,
            drift: (Math.random() - 0.5) * 0.4,
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.04,
            hue: Math.random(),
            phase: Math.random() * 6.28,
          })
        }
      }
    }

    seedParticles()

    const resize = () => {
      if (session !== __particleCanvasSession) return
      const w = window.innerWidth
      const h = window.innerHeight
      const dimsChanged = canvas.width !== w || canvas.height !== h
      if (dimsChanged) {
        canvas.width = w
        canvas.height = h
      }
      if (dimsChanged || particles.length === 0) {
        seedParticles()
      }
    }

    window.addEventListener('resize', resize, { passive: true })

    // Pick once per season — avoids branching inside the hot loop (hundreds of particles × 60fps)
    const drawParticle =
      season === 'winter'
        ? (p, t) => {
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot)
            ctx.fillStyle = 'rgba(223,246,255,0.62)'
            const d = p.size * 0.9
            ctx.fillRect(-d * 0.5, -d * 0.5, d, d)
            ctx.restore()
          }
        : season === 'spring'
          ? (p, t) => {
              ctx.save()
              ctx.translate(p.x, p.y)
              ctx.rotate(p.rot)
              const g = Math.floor(150 + p.hue * 80)
              ctx.fillStyle = `rgba(50,${g},40,0.72)`
              ctx.beginPath()
              ctx.ellipse(0, 0, p.size * 0.55, p.size * 2.2, 0, 0, Math.PI * 2)
              ctx.fill()
              ctx.strokeStyle = `rgba(30,${g - 30},20,0.45)`
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(0, -p.size * 2.2)
              ctx.lineTo(0, p.size * 2.2)
              ctx.stroke()
              ctx.restore()
            }
          : season === 'summer'
            ? (p, t) => {
                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate(t * 0.00035 + p.phase)
                const alpha = 0.28 + 0.42 * Math.abs(Math.sin(t * 0.002 + p.phase))
                const r = p.size * 0.75
                const g = Math.floor(210 + p.hue * 45)
                const rd = Math.floor(230 + p.hue * 25)
                ctx.shadowColor = 'rgba(255,248,200,0.75)'
                ctx.shadowBlur = 9
                ctx.fillStyle = `rgba(${rd},${g},90,${alpha})`
                ctx.beginPath()
                ctx.arc(0, 0, r, 0, Math.PI * 2)
                ctx.fill()
                ctx.shadowBlur = 0
                ctx.restore()
              }
            : (p, t) => {
                // Rain: align streak with fall vector (drift, speed), cool desaturated blue-grey
                const mag = Math.hypot(p.drift, p.speed) || 1
                const ux = p.drift / mag
                const uy = p.speed / mag
                const half = p.len * 0.5
                const alpha = 0.14 + p.hue * 0.38
                ctx.strokeStyle = `rgba(168,184,208,${alpha})`
                ctx.lineWidth = p.size
                ctx.lineCap = 'round'
                ctx.beginPath()
                ctx.moveTo(p.x - ux * half, p.y - uy * half)
                ctx.lineTo(p.x + ux * half, p.y + uy * half)
                ctx.stroke()
              }

    const updateParticle =
      season === 'summer'
        ? (p, t, cw, ch) => {
            p.x += p.drift * 0.5 + Math.sin(t * 0.0007 + p.phase) * 0.45
            p.y -= p.speed * 0.35 + Math.cos(t * 0.0009 + p.phase) * 0.25
            if (p.y < -10) { p.y = ch + 10; p.x = Math.random() * cw }
            if (p.y > ch + 10) p.y = -10
            if (p.x < -10) p.x = cw + 10
            if (p.x > cw + 10) p.x = -10
          }
        : (p, t, cw, ch) => {
            p.y += p.speed
            p.x += p.drift
            p.rot += p.rotV
            if (p.y > ch + 10) { p.y = -10; p.x = Math.random() * cw }
            if (p.x < -10) p.x = cw + 10
            if (p.x > cw + 10) p.x = -10
          }

    const loop = (t) => {
      if (session !== __particleCanvasSession || !alive) return
      if (document.visibilityState === 'hidden') {
        cancelParticleRaf()
        return
      }
      const cw = canvas.width
      const ch = canvas.height
      ctx.clearRect(0, 0, cw, ch)
      if (cw >= 1 && ch >= 1) {
        for (let i = 0, n = particles.length; i < n; i++) {
          const p = particles[i]
          updateParticle(p, t, cw, ch)
          drawParticle(p, t)
        }
      }
      if (alive && session === __particleCanvasSession) {
        __particleRafId = requestAnimationFrame(loop)
      }
    }

    const onVisibility = () => {
      if (session !== __particleCanvasSession || !alive) return
      cancelParticleRaf()
      if (document.visibilityState === 'visible') {
        __particleRafId = requestAnimationFrame(loop)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    __particleRafId = requestAnimationFrame(loop)

    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onVisibility)
      cancelParticleRaf()
      window.removeEventListener('resize', resize)
      try {
        if (canvas.width > 0 && canvas.height > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      } catch {
        /* canvas may be detached */
      }
    }
  }, [season])

  return <canvas ref={canvasRef} className="snow-field" aria-hidden="true" />
}

function SideDecorations({ viewport, season }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const glow = SEASON_CONFIG[season].sideGlow

  useEffect(() => {
    let raf = 0
    let latest = { x: 0, y: 0 }
    const flush = () => {
      raf = 0
      setMouse({ x: latest.x, y: latest.y })
    }
    const onMove = (e) => {
      latest = { x: e.clientX, y: e.clientY }
      if (!raf) raf = requestAnimationFrame(flush)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Rejection-sampling packer: place each decoration randomly, retry if it
  // overlaps anything already placed (using actual pixel distances).
  const flakes = useMemo(() => {
    const { width: W, height: H } = viewport
    if (!W || !H) return []

    const cfg   = SEASON_PLACEMENT[season]
    const SEEDS = { winter: 0x5f3759, spring: 0x9a2b1c, summer: 0x4e7f3d, autumn: 0xb3c921 }
    const rng   = lcg(SEEDS[season])

    const placed = []  // { x, y, r }
    const out    = []
    let id = 0

    for (let i = 0; i < cfg.count; i++) {
      const size = cfg.minSz + rng() * (cfg.maxSz - cfg.minSz)
      const r    = size * 0.5 * cfg.gap   // collision radius (includes padding)

      let ok = false
      for (let attempt = 0; attempt < 60 && !ok; attempt++) {
        const x = cfg.genX(rng, W)
        const y = cfg.genY(rng, H)

        // Reject if overlaps any already-placed item
        let collides = false
        for (const p of placed) {
          if (Math.hypot(x - p.x, y - p.y) < r + p.r) { collides = true; break }
        }

        if (!collides) {
          placed.push({ x, y, r })
          out.push({
            id: id++, x, y,
            baseAngle: (rng() - 0.5) * 80,
            size: Math.round(size),
            detail: rng() > 0.35 ? 3 : 2,
            opacity: 0.60 + rng() * 0.35,
          })
          ok = true
        }
      }
      // If 60 attempts all collided, that decoration is simply skipped
    }
    return out
  }, [season, viewport.width, viewport.height])

  return (
    <div className="side-snowflakes season-deco-enter" aria-hidden="true">
      {flakes.map((flake) => {
        const dist = Math.hypot(mouse.x - flake.x, mouse.y - flake.y)
        const angle =
          dist < 220
            ? (Math.atan2(mouse.y - flake.y, mouse.x - flake.x) * 180) / Math.PI
            : flake.baseAngle
        const spinSec = 14 + (flake.id % 22)

        return (
          <div
            key={`${season}-flake-${flake.id}`}
            className="side-flake"
            style={{
              left:    `${flake.x}px`,
              top:     `${flake.y}px`,
              opacity: flake.opacity,
              filter:  `drop-shadow(0 0 5px ${glow})`,
            }}
          >
            <div
              className="side-flake-inner"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`,
              }}
            >
              <div
                className="side-flake-spin"
                style={{
                  animationDuration: `${spinSec}s`,
                  animationDirection: flake.id % 2 === 0 ? 'normal' : 'reverse',
                }}
              >
                <SeasonDecoSVG season={season} size={flake.size} detail={flake.detail} id={flake.id} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Fixed layer between mountain art (z-0) and .page (z-3). No createPortal — avoids mount races.
 * ParticleField stays mounted; decor remounts per season.
 */
function SeasonVisualLayer({ season, viewport }) {
  return (
    <div className="season-visual-root" data-season={season}>
      <div className="particle-season-wrap">
        <ParticleField season={season} />
      </div>
      <div key={season} className="season-decor-layer">
        <AmbientRotors season={season} />
        <SideDecorations viewport={viewport} season={season} />
      </div>
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDemo, setActiveDemo] = useState(null)
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [season, setSeason] = useState(autoSeason)
  // true = user manually chose a season (overrides auto-sync)
  const [userPicked, setUserPicked] = useState(false)

  // Hourly re-sync: update to real calendar season unless user manually overrode
  useEffect(() => {
    const sync = () => { if (!userPicked) setSeason(autoSeason()) }
    const id = setInterval(sync, 60 * 60 * 1000) // check every hour
    return () => clearInterval(id)
  }, [userPicked])

  const pickSeason = (s) => {
    setSeason(s)
    setUserPicked(s !== autoSeason()) // only flag as manual if it differs from calendar
  }

  const resetToAuto = () => {
    setSeason(autoSeason())
    setUserPicked(false)
  }

  const closeDemo = useCallback(() => setActiveDemo(null), [])

  // Apply season-specific body bg + card tint + ambient glows (CSS transitions handle smoothing)
  useEffect(() => {
    const cfg = SEASON_CONFIG[season]
    document.body.style.backgroundColor = cfg.bodyBg
    const root = document.documentElement
    root.style.setProperty('--card-season-bg', cfg.cardBg)
    root.style.setProperty('--season-glow-inner', cfg.glowInner)
    root.style.setProperty('--season-glow-outer', cfg.glowOuter)
  }, [season])

  useEffect(() => {
    let debounceId = 0
    const onResize = () => {
      window.clearTimeout(debounceId)
      debounceId = window.setTimeout(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight })
      }, 120)
    }

    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.clearTimeout(debounceId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') {
      return projectPosts
    }
    return projectPosts.filter((post) => post.category === activeCategory)
  }, [activeCategory])

  return (
    <>
      {/* Peaks = back-most art; particles portal mounts above this, .page above both */}
      <div className="peaks-layer peaks-layer--top" aria-hidden="true">
        <div className="mtn-band mtn-band-top">
          {(() => { const [c0,c1,c2,c3] = SEASON_CONFIG[season].mtnColors; return (
            <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 92  Q350 8   720 98  Q1050 8   1440 85  L1440 380 L0 380 Z" fill={c0}/>
              <path d="M0 148 Q450 62  720 155 Q1100 62  1440 140 L1440 380 L0 380 Z" fill={c1}/>
              <path d="M0 202 Q300 118 640 208 Q980  118 1440 195 L1440 380 L0 380 Z" fill={c2}/>
              <path d="M0 258 Q480 175 720 262 Q1050 178 1440 248 L1440 380 L0 380 Z" fill={c3}/>
            </svg>
          )})()}
        </div>
      </div>

      <div id="season-visual-portal" className="season-visual-mount">
        <SeasonVisualLayer season={season} viewport={viewport} />
      </div>

      <main className="page">
        <div className="bg-glow bg-glow-left" />
        <div className="bg-glow bg-glow-right" />

        <header className="topbar card">
          <p className="brand">
            <span className="brand-rotor" aria-hidden="true" />
            Pavlo.dev
          </p>
          <div className="top-links">
            <a href="#approach">Approach</a>
            <a href="#projects">Work</a>
            <a href="#categories">Filter</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="season-picker" role="group" aria-label="Season theme">
            {SEASON_ORDER.map((s) => (
              <button
                key={s}
                className={`season-btn${season === s ? ' season-btn--active' : ''}${s === autoSeason() && !userPicked ? ' season-btn--auto' : ''}`}
                onClick={() => pickSeason(s)}
                title={`${SEASON_CONFIG[s].label}${s === autoSeason() ? ' (current season)' : ''}`}
                aria-pressed={season === s}
              >
                {SEASON_CONFIG[s].icon}
              </button>
            ))}
            {userPicked && (
              <button
                className="season-btn season-btn-reset"
                onClick={resetToAuto}
                title="Reset to current real season"
              >
                🔄
              </button>
            )}
          </div>
        </header>

      <section className="hero card hero-with-rotors">
        <span className="card-rotor card-rotor--tl" aria-hidden="true" />
        <span className="card-rotor card-rotor--br" aria-hidden="true" />
        <div className="hero-main">
          <p className="eyebrow">C#, APIs, desktop &amp; mobile</p>
          <h1>{profile.name}</h1>
          <p className="role">{profile.role}</p>
          <p className="summary">{profile.summary}</p>
          <div className="chips">
            <span>{profile.location}</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
        <aside className="hero-side">
          <p className="eyebrow">Quick numbers</p>
          <div className="stats-grid">
            <article>
              <p className="kpi-value">5</p>
              <p className="kpi-label">projects with demos on this page</p>
            </article>
            <article>
              <p className="kpi-value">.NET</p>
              <p className="kpi-label">where I’m most at home</p>
            </article>
            <article>
              <p className="kpi-value">mix</p>
              <p className="kpi-label">APIs, WPF, MAUI, a bit of web</p>
            </article>
          </div>
          <p className="availability">
            Based in Tychy. Hybrid nearby is fine; remote works if our hours overlap with CET reasonably well.
          </p>
        </aside>
      </section>

      <section className="card approach section-with-rotors" id="approach">
        <span className="card-rotor card-rotor--tr" aria-hidden="true" />
        <h2>What I actually care about</h2>
        <p className="approach-lead">
          Not a manifesto — just habits that show up in the projects underneath.
        </p>
        <div className="approach-grid">
          {approachPillars.map((item) => (
            <article key={item.title} className="approach-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-layout">
        <section className="card feed section-with-rotors" id="projects">
          <span className="card-rotor card-rotor--bl" aria-hidden="true" />
          <h2>Projects</h2>
          <div className="feed-list">
            {filteredPosts.map((post) => (
              <article key={post.title} className="feed-item">
                <span className="post-tag">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <p className="meta-line">{post.stack}</p>
                <div className="feed-actions">
                  {post.link !== '#' && (
                    <a className="read-more" href={post.link} target="_blank" rel="noreferrer">
                      Open project
                    </a>
                  )}
                  {post.demo && (
                    <button className="read-more demo-btn" onClick={() => setActiveDemo(post)}>
                      View demo
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="sidebar">
          <section className="card sticky section-with-rotors" id="categories">
            <span className="card-rotor card-rotor--tr-small" aria-hidden="true" />
            <h2>Categories</h2>
            <div className="category-grid">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? 'category-btn active' : 'category-btn'}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Stuff I’ve dug into</h2>
            <ol className="popular-list">
              {technicalFocus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="card section-with-rotors">
            <span className="card-rotor card-rotor--br-small" aria-hidden="true" />
            <h2>Core stack</h2>
            <div className="stack-cloud">
              {techStack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="card cta" id="contact">
        <h2>Contact</h2>
        <p className="summary">
          If you’re hiring for .NET, desktop, or MAUI work — or something close — email or LinkedIn is fine. I’ll
          reply.
        </p>
        <div className="chips">
          <a href={`mailto:${profile.email}`}>Email</a>
          <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>Phone</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <p className="contact-secondary">
          <a href={profile.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <span className="contact-dot" aria-hidden="true">
            ·
          </span>
          <a href={profile.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <span className="contact-dot" aria-hidden="true">
            ·
          </span>
          <a href={profile.portfolioRepo} target="_blank" rel="noreferrer">
            Portfolio source
          </a>
        </p>
      </section>

        <footer className="footer">
          <p>
            © {new Date().getFullYear()} {profile.name} · {profile.location} · React &amp; Vite
          </p>
        </footer>
      </main>

      <div className="peaks-layer peaks-layer--bottom" aria-hidden="true">
        <div className="mtn-band mtn-band-bottom">
          {(() => { const [c0,c1,c2,c3] = SEASON_CONFIG[season].mtnColors; return (
            <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 305 Q350 362 720 298 Q1050 360 1440 312 L1440 0 L0 0 Z" fill={c0}/>
              <path d="M0 250 Q450 300 720 244 Q1100 298 1440 255 L1440 0 L0 0 Z" fill={c1}/>
              <path d="M0 196 Q300 242 640 190 Q980  240 1440 200 L1440 0 L0 0 Z" fill={c2}/>
              <path d="M0 145 Q480 188 720 148 Q1050 185 1440 152 L1440 0 L0 0 Z" fill={c3}/>
            </svg>
          )})()}
        </div>
      </div>

      {activeDemo && (
        <Suspense fallback={null}>
          <ProjectModal project={activeDemo} onClose={closeDemo} />
        </Suspense>
      )}
    </>
  )
}

export default App
