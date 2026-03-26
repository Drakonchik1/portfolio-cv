import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// ─── Season System ────────────────────────────────────────────────────────────
const SEASON_CONFIG = {
  winter: {
    label: 'Winter', icon: '❄️',
    bodyBg: '#030d18',
    mtnColors: ['#1c4068', '#0e2a42', '#071c2e', '#030d18'],
    cardBg: 'rgba(8, 26, 46, 0.72)',
    sideGlow: 'rgba(200,235,255,0.45)',
  },
  spring: {
    label: 'Spring', icon: '🌸',
    bodyBg: '#060f08',
    mtnColors: ['#1a4820', '#0e2e14', '#071a09', '#060f08'],
    cardBg: 'rgba(8, 26, 12, 0.72)',
    sideGlow: 'rgba(180,240,160,0.4)',
  },
  summer: {
    label: 'Summer', icon: '🌋',
    bodyBg: '#0e0502',
    mtnColors: ['#6b1e06', '#3d0e03', '#1e0701', '#0e0502'],
    cardBg: 'rgba(40, 12, 4, 0.75)',
    sideGlow: 'rgba(255,100,25,0.55)',
  },
  autumn: {
    label: 'Autumn', icon: '🍂',
    bodyBg: '#0f0804',
    mtnColors: ['#5a2a10', '#381808', '#1e0d04', '#0f0804'],
    cardBg: 'rgba(30, 14, 6, 0.72)',
    sideGlow: 'rgba(230,110,30,0.4)',
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
            fill="rgba(255,85,18,0.92)" stroke="rgba(200,50,10,0.5)" strokeWidth="0.7"/>
        )
      })}
      <circle cx={cx} cy={cy} r="13" fill="rgba(160,28,8,0.92)" stroke="rgba(120,18,4,0.55)" strokeWidth="0.8"/>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * Math.PI / 180
        return <circle key={i} cx={cx + 8*Math.cos(a)} cy={cy + 8*Math.sin(a)} r="1.5"
          fill="rgba(255,140,40,0.75)"/>
      })}
    </svg>
  )
}

// Autumn: maple leaf
// 3 colour variants: 0=orange, 1=red-orange, 2=golden-yellow
const LEAF_PALETTES = [
  { fill: 'rgba(235,105,18,0.92)', stroke: 'rgba(185,75,10,0.55)', vein: 'rgba(185,75,10,0.45)' },
  { fill: 'rgba(200,55,20,0.92)',  stroke: 'rgba(155,38,12,0.55)', vein: 'rgba(155,38,12,0.45)' },
  { fill: 'rgba(238,155,18,0.92)', stroke: 'rgba(190,118,10,0.55)', vein: 'rgba(190,118,10,0.45)' },
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
  winter: { count: 90, minSz: 14, maxSz: 52, gap: 1.2,
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => rng() * H,
  },
  spring: { count: 110, minSz: 12, maxSz: 40, gap: 1.0,
    // x: full canvas — flowers appear everywhere, not just at edges
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => H * (0.04 + Math.pow(rng(), 0.6) * 0.92),
  },
  summer: { count: 88, minSz: 20, maxSz: 46, gap: 1.25,
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => rng() * H * 0.96 + H * 0.02,
  },
  autumn: { count: 90, minSz: 12, maxSz: 48, gap: 1.0,
    genX: (rng, W) => rng() * W,
    genY: (rng, H) => {
      const r = rng()
      return H * (r < 0.28 ? rng() * 0.27 : r < 0.52 ? 0.73 + rng() * 0.24 : 0.15 + rng() * 0.60)
    },
  },
}

function ParticleField({ season }) {
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = document.getElementById('particle-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const particles = []
    // Autumn gets many more particles for a dense rain effect
    const COUNT = season === 'autumn' ? 220 : 60

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (!particles.length) {
        for (let i = 0; i < COUNT; i++) {
          const isAutumn = season === 'autumn'
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: isAutumn ? 0.8 + Math.random() * 1.2 : 1 + Math.random() * 2.8,
            speed: isAutumn ? 4 + Math.random() * 6 : 0.2 + Math.random() * 0.6,
            drift: isAutumn ? (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 0.4,
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.04,
            hue: Math.random(),
            phase: Math.random() * 6.28,
          })
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const drawParticle = (p, t) => {
      ctx.save()
      ctx.translate(p.x, p.y)

      if (season === 'winter') {
        ctx.fillStyle = 'rgba(223,246,255,0.62)'
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()

      } else if (season === 'spring') {
        // Small elongated leaf, rotated
        ctx.rotate(p.rot)
        const g = Math.floor(150 + p.hue * 80)
        ctx.fillStyle = `rgba(50,${g},40,0.72)`
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 0.55, p.size * 2.2, 0, 0, Math.PI * 2)
        ctx.fill()
        // Central vein
        ctx.strokeStyle = `rgba(30,${g - 30},20,0.45)`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(0, -p.size * 2.2)
        ctx.lineTo(0, p.size * 2.2)
        ctx.stroke()

      } else if (season === 'summer') {
        // Lava ember — glowing orange spark that pulses
        const alpha = 0.3 + 0.45 * Math.abs(Math.sin(t * 0.0025 + p.phase))
        const r = p.size * 0.85
        const g = Math.floor(40 + p.hue * 80)   // 40-120 green channel → orange→yellow
        ctx.shadowColor = `rgba(255,${g},10,0.95)`
        ctx.shadowBlur = 10
        ctx.fillStyle = `rgba(255,${g},15,${alpha})`
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

      } else if (season === 'autumn') {
        // Autumn rain — angled streaks, varying opacity for depth
        const alpha = 0.18 + p.hue * 0.32
        ctx.strokeStyle = `rgba(160,195,230,${alpha})`
        ctx.lineWidth = p.size * 0.7
        ctx.lineCap = 'round'
        const len = p.size * 12        // streak length
        const slant = len * 0.18       // slight rightward slant
        ctx.beginPath()
        ctx.moveTo(-slant * 0.5, -len * 0.5)
        ctx.lineTo( slant * 0.5,  len * 0.5)
        ctx.stroke()
      }

      ctx.restore()
    }

    const render = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        if (season === 'summer') {
          // Lava embers — drift upward (heat rising) with gentle sway
          p.x += p.drift * 0.6 + Math.sin(t * 0.0008 + p.phase) * 0.5
          p.y -= p.speed * 0.5 + Math.cos(t * 0.001 + p.phase) * 0.2  // RISE
          if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
          if (p.y > canvas.height + 10) p.y = -10
        } else {
          p.y += p.speed
          p.x += p.drift
          p.rot += p.rotV
          if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width }
        }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        drawParticle(p, t)
      }
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [season])

  return <canvas id="particle-canvas" className="snow-field" aria-hidden="true" />
}

function SideDecorations({ mouse, viewport, season }) {
  const glow = SEASON_CONFIG[season].sideGlow

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
    <div className="side-snowflakes" aria-hidden="true">
      {flakes.map((flake) => {
        const dist  = Math.hypot(mouse.x - flake.x, mouse.y - flake.y)
        const angle = dist < 220
          ? (Math.atan2(mouse.y - flake.y, mouse.x - flake.x) * 180) / Math.PI
          : flake.baseAngle

        return (
          <div
            key={flake.id}
            className="side-flake"
            style={{
              left:      `${flake.x}px`,
              top:       `${flake.y}px`,
              opacity:   flake.opacity,
              transform: `translate(-50%,-50%) rotate(${angle.toFixed(1)}deg)`,
              filter:    `drop-shadow(0 0 5px ${glow})`,
            }}
          >
            <SeasonDecoSVG season={season} size={flake.size} detail={flake.detail} id={flake.id} />
          </div>
        )
      })}
    </div>
  )
}

// ─── Project Demo Modal ───────────────────────────────────────────────────────
const METHOD_COLOR = { GET: '#4caf50', POST: '#2196f3', PUT: '#ff9800', PATCH: '#9c27b0', DELETE: '#f44336' }

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!project?.demo) return null
  const { demo } = project

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <p className="eyebrow">{project.category} · Private Demo</p>
        <h2 className="modal-title">{project.title.split(':')[0]}</h2>
        <p className="modal-sub">{project.excerpt}</p>

        <div className="modal-chips">
          {project.stack.split(' · ').map((t) => <span key={t}>{t}</span>)}
        </div>

        {/* API projects — endpoints + sample response */}
        {demo.type === 'api' && (
          <>
            <h3 className="modal-section-head">Endpoints</h3>
            <div className="endpoint-list">
              {demo.endpoints.map((ep) => (
                <div key={ep.path + ep.method} className="endpoint-row">
                  <span className="ep-method" style={{ background: METHOD_COLOR[ep.method] }}>{ep.method}</span>
                  <span className="ep-path">{ep.path}</span>
                  <span className="ep-desc">{ep.desc}</span>
                </div>
              ))}
            </div>
            <h3 className="modal-section-head">Sample Response</h3>
            <pre className="demo-code">{demo.sample}</pre>
          </>
        )}

        {/* Desktop / mobile apps — screens + highlights */}
        {demo.type === 'app' && (
          <>
            <h3 className="modal-section-head">App Screens</h3>
            <div className="screen-grid">
              {demo.screens.map((s) => (
                <div key={s.label} className="screen-card">
                  <p className="screen-label">{s.label}</p>
                  <p className="screen-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <h3 className="modal-section-head">Key Technical Highlights</h3>
        <ul className="highlight-list">
          {demo.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </div>
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDemo, setActiveDemo] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
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

  // Apply season-specific body bg + card tint as CSS vars
  useEffect(() => {
    const cfg = SEASON_CONFIG[season]
    document.body.style.background = cfg.bodyBg
    document.documentElement.style.setProperty('--card-season-bg', cfg.cardBg)
  }, [season])

  useEffect(() => {
    let frameId = 0

    const onPointerMove = (event) => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        setMouse({ x: event.clientX, y: event.clientY })
      })
    }

    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
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
      {/* ── Top mountain band – scrolls with page, full viewport width ── */}
      <div className="mtn-band mtn-band-top" aria-hidden="true">
        {(() => { const [c0,c1,c2,c3] = SEASON_CONFIG[season].mtnColors; return (
          <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 92  Q350 8   720 98  Q1050 8   1440 85  L1440 380 L0 380 Z" fill={c0}/>
            <path d="M0 148 Q450 62  720 155 Q1100 62  1440 140 L1440 380 L0 380 Z" fill={c1}/>
            <path d="M0 202 Q300 118 640 208 Q980  118 1440 195 L1440 380 L0 380 Z" fill={c2}/>
            <path d="M0 258 Q480 175 720 262 Q1050 178 1440 248 L1440 380 L0 380 Z" fill={c3}/>
          </svg>
        )})()}
      </div>

      <main className="page">
      <ParticleField season={season} />
      <SideDecorations mouse={mouse} viewport={viewport} season={season} />
        <div className="bg-glow bg-glow-left" />
        <div className="bg-glow bg-glow-right" />

        <header className="topbar card">
          <p className="brand">Pavlo.dev</p>
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

      <section className="hero card">
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

      <section className="card approach" id="approach">
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
        <section className="card feed" id="projects">
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
          <section className="card sticky" id="categories">
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

          <section className="card">
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

      {/* ── Bottom mountain band – scrolls with page, full viewport width ── */}
      <div className="mtn-band mtn-band-bottom" aria-hidden="true">
        {(() => { const [c0,c1,c2,c3] = SEASON_CONFIG[season].mtnColors; return (
          <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 305 Q350 362 720 298 Q1050 360 1440 312 L1440 0 L0 0 Z" fill={c0}/>
            <path d="M0 250 Q450 300 720 244 Q1100 298 1440 255 L1440 0 L0 0 Z" fill={c1}/>
            <path d="M0 196 Q300 242 640 190 Q980  240 1440 200 L1440 0 L0 0 Z" fill={c2}/>
            <path d="M0 145 Q480 188 720 148 Q1050 185 1440 152 L1440 0 L0 0 Z" fill={c3}/>
          </svg>
        )})()}
      </div>

      {activeDemo && <ProjectModal project={activeDemo} onClose={() => setActiveDemo(null)} />}
    </>
  )
}

export default App
