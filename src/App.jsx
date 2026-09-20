import {
  lazy,
  memo,
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
    label: 'Winter',
    bodyBg: '#030d18',
    mtnColors: ['#1c4068', '#0e2a42', '#071c2e', '#030d18'],
    cardBg: 'rgba(8, 26, 46, 0.72)',
    sideGlow: 'rgba(200,235,255,0.45)',
    glowInner: 'rgba(160, 215, 255, 0.28)',
    glowOuter: 'rgba(200, 235, 255, 0.14)',
    accent: '#8fd8ff',
    accentSoft: '#eef7ff',
    text: '#eef7ff',
    textMuted: '#a8c4dc',
  },
  spring: {
    label: 'Spring',
    bodyBg: '#060f08',
    mtnColors: ['#1a4820', '#0e2e14', '#071a09', '#060f08'],
    cardBg: 'rgba(8, 26, 12, 0.72)',
    sideGlow: 'rgba(180,240,160,0.4)',
    glowInner: 'rgba(120, 210, 140, 0.22)',
    glowOuter: 'rgba(170, 235, 160, 0.12)',
    accent: '#8fe3b0',
    accentSoft: '#e8f8ef',
    text: '#eef8f0',
    textMuted: '#a8c9b8',
  },
  summer: {
    label: 'Summer',
    // Dusk over water: cool teal mountains, warm air — reads clearly different from autumn earth tones
    bodyBg: '#030f14',
    mtnColors: ['#1a6b7a', '#0f4a58', '#082e38', '#030f14'],
    cardBg: 'rgba(6, 38, 48, 0.78)',
    sideGlow: 'rgba(255, 214, 130, 0.38)',
    glowInner: 'rgba(90, 200, 210, 0.22)',
    glowOuter: 'rgba(255, 210, 130, 0.16)',
    accent: '#f5c66b',
    accentSoft: '#faf0d8',
    text: '#fff8ec',
    textMuted: '#c9b896',
  },
  autumn: {
    label: 'Autumn',
    // Rust, bark, wet soil — no shared red-brown band with old “volcanic” summer
    bodyBg: '#0a0504',
    mtnColors: ['#4a2c22', '#2e1a14', '#1a0f0c', '#0a0504'],
    cardBg: 'rgba(32, 18, 12, 0.76)',
    sideGlow: 'rgba(200, 95, 45, 0.36)',
    glowInner: 'rgba(210, 110, 60, 0.2)',
    glowOuter: 'rgba(160, 70, 45, 0.12)',
    accent: '#f0a35c',
    accentSoft: '#f3ebe4',
    text: '#f3ebe4',
    textMuted: '#c4b0a0',
  },
}

const NAV_SECTION_IDS = ['experience', 'projects', 'about', 'contact']

function SeasonIcon({ season, size = 18 }) {
  const label = SEASON_CONFIG[season]?.label ?? season
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-label': label,
    role: 'img',
  }

  switch (season) {
    case 'winter':
      return (
        <svg {...props}>
          <path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
          <path d="M12 6.5l1.6-1.6M12 6.5l-1.6-1.6M12 17.5l1.6 1.6M12 17.5l-1.6 1.6M6.5 12l-1.6 1.6M6.5 12l-1.6-1.6M17.5 12l1.6 1.6M17.5 12l1.6-1.6" />
        </svg>
      )
    case 'spring':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" />
          <ellipse cx="12" cy="6.2" rx="2.4" ry="3.6" />
          <ellipse cx="12" cy="17.8" rx="2.4" ry="3.6" />
          <ellipse cx="6.2" cy="12" rx="3.6" ry="2.4" />
          <ellipse cx="17.8" cy="12" rx="3.6" ry="2.4" />
        </svg>
      )
    case 'summer':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M18.95 5.05l-1.55 1.55M6.6 17.4l-1.55 1.55" />
        </svg>
      )
    case 'autumn':
      return (
        <svg {...props}>
          <path d="M12 20c0-4.5 2.2-7.5 6.5-9.5C14 8.5 12 5.5 12 2c0 3.5-2 6.5-6.5 8.5C10 12.5 12 15.5 12 20Z" />
          <path d="M12 12v8" />
        </svg>
      )
    default:
      return null
  }
}

function ResetSeasonIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Reset to current season"
      role="img"
    >
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
      <path d="M3.5 4.5v4.5H8" />
    </svg>
  )
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
  role: 'Junior .NET developer',
  location: 'Tychy, Poland',
  email: 'pavlo.dorofieiev@gmail.com',
  phone: '+48 576 468 614',
  linkedin: 'https://linkedin.com/in/pavlo-dorofieiev-596b282b1/',
  github: 'https://github.com/Drakonchik1',
  portfolio: 'https://portfolio-cv-six-indol.vercel.app',
  portfolioRepo: 'https://github.com/Drakonchik1/portfolio-cv',
  telegram: 'https://t.me/Drakon_v2',
  whatsapp: 'https://wa.me/48576468614',
  summary:
    'Junior .NET in Tychy — ASP.NET Core, EF Core, WPF. FlowBoard (Clean Architecture, SignalR, Hangfire, 277 tests) and PatchGuard (WPF diagnostics, ML, RAG, 336 tests). INF.03 / INF.04 passed.',
  tagline: 'Junior .NET developer — ASP.NET Core, EF Core, WPF',
}

const heroKpis = [
  { value: '277', label: 'FlowBoard tests' },
  { value: '336', label: 'PatchGuard tests' },
  { value: '5', label: 'projects' },
  { value: 'C1', label: 'EN/PL' },
]

const lookingFor = [
  'Junior .NET backend (ASP.NET Core)',
  'Hybrid — Katowice area',
  'Remote within Poland',
]

const skillGroups = [
  { label: 'Languages & runtime', items: ['C#', '.NET 8/10', 'SQL'] },
  {
    label: 'Backend',
    items: [
      'ASP.NET Core',
      'REST APIs',
      'EF Core',
      'Dapper',
      'SQLite',
      'MS SQL',
      'JWT',
      'Swagger / Scalar',
      'SignalR',
      'Hangfire',
      'Redis',
      'MediatR',
    ],
  },
  { label: 'Desktop & mobile', items: ['WPF', 'MVVM', '.NET MAUI'] },
  { label: 'Frontend', items: ['HTML', 'CSS', 'JavaScript', 'React'] },
  { label: 'Tools', items: ['Git', 'Visual Studio', 'VS Code', 'Docker', 'xUnit'] },
  { label: 'Familiar', items: ['Angular', 'Vue.js', 'PHP', 'Microservices', 'Event-Driven Architecture'] },
]

const softSkills = [
  'Team collaboration',
  'Clear communication',
  'Adaptability',
  'Receptiveness to feedback',
]

const categories = ['All', 'Backend', 'Full-Stack', 'Desktop']

const experiencePosts = [
  {
    company: 'Techcom',
    role: 'Programmer (Internship)',
    period: '02/2023 – 03/2023',
    location: 'Tychy, Poland',
    bullets: [
      'Developed and maintained backend features in C# — bug fixes, small modules, and API/data-layer changes',
      'Wrote and updated SQL queries (SELECT/INSERT/UPDATE) for reports, lists, and admin-style data operations',
      'Worked with relational databases — table design basics, joins, and keeping data consistent with app logic',
      'Fixed backend defects from testing/production; traced issues from UI/API down to SQL when needed',
      'Used Git for version control; deployed or tested changes with the team in short iterations',
      'Collaborated with frontend on integration — clarified endpoints, payloads, and error cases',
    ],
  },
  {
    company: 'IE University',
    role: 'VR/IT Support (Erasmus Internship)',
    period: '17/03/2025 – 11/04/2025',
    location: 'Madrid, Spain',
    bullets: [
      'Supported live educational sessions using VR headsets in a professional IT environment',
      'Prepared, configured, and tested VR equipment before each session to ensure stable, distraction-free delivery',
      'Worked alongside an experienced IT support team — troubleshooting issues, assisting facilitators, and keeping sessions on schedule',
      'Gained hands-on familiarity with VR hardware setup, calibration, and day-to-day operational workflows',
    ],
  },
]

const education = [
  {
    school: 'WSB Merito w Chorzowie',
    program: 'Programmer (C#/.NET)',
    period: '2026',
    location: 'Chorzów, Poland',
    focus: 'Admitted to 1st year of studies.',
    certificates: [],
  },
  {
    school: 'TEB Technikum Edukacja w Tychach',
    program: 'Programmer',
    period: '2020 – 2026',
    location: 'Tychy, Poland',
    focus:
      'Obtained the professional title of Technik Programista. INF.03/INF.04 exams and matura; portfolio backends (FlowBoard, PatchGuard) while preparing for junior .NET roles.',
    certificates: ['INF.03 — 100% practice', 'INF.04 — 100% practice'],
  },
]

const languages = [
  'Russian — mother tongue',
  'Ukrainian — mother tongue',
  'English — C1',
  'Polish — C1',
]

const projectPosts = [
  {
    title: 'FlowBoard: Flagship Backend (MVP complete)',
    excerpt:
      'Multi-user Kanban API — Clean Architecture, JWT refresh rotation, workspace RBAC, boards + cards (Dapper reads), SignalR, Hangfire jobs, activity log, comments/tags/email, 277 xUnit + 21 integration tests.',
    stack: '.NET 10 · ASP.NET Core · EF Core · SQL Server · SignalR · Redis · Hangfire · Docker',
    category: 'Backend',
    status: 'MVP complete',
    flagship: true,
    proof: 'GitHub · 277 unit · 21 integration · CI',
    link: 'https://github.com/Drakonchik1/FlowBoard',
    demo: {
      type: 'api',
      github: 'https://github.com/Drakonchik1/FlowBoard',
      howItWorks: [
        { step: 1, title: 'Register or log in', desc: 'POST /api/auth/register or /login → short-lived JWT access token + refresh token (BCrypt passwords, 5 req/min per IP).' },
        { step: 2, title: 'Create a workspace', desc: 'Authenticated POST /api/workspaces — you become Owner. Each workspace is an isolated tenant for boards and projects.' },
        { step: 3, title: 'Boards, cards, real-time', desc: 'Kanban lists/cards with fractional-index ordering; SignalR CardMoved / CommentAdded; optional Redis backplane for multi-instance.' },
        { step: 4, title: 'Jobs + activity', desc: 'Hangfire sends assignment emails and cleans expired refresh tokens; card activity log via Dapper reads.' },
      ],
      flow: 'Auth → Workspace RBAC → Boards/Cards → SignalR → Hangfire email / activity log',
      tryLocal: [
        'docker compose up -d sqlserver',
        'dotnet run --project src/FlowBoard.API',
        '# Open http://localhost:5248/scalar/v1',
        'dotnet test   # 277 unit tests (+ 21 integration with Docker)',
      ],
      endpoints: [
        { method: 'POST', path: '/api/auth/register', desc: 'Create account → JWT + refresh token' },
        { method: 'POST', path: '/api/auth/refresh', desc: 'Rotate refresh token (family-based)' },
        { method: 'POST', path: '/api/workspaces', desc: 'Create workspace (Bearer token)' },
        { method: 'POST', path: '/api/cards/{id}/move', desc: 'Move card (SignalR CardMoved)' },
        { method: 'GET', path: '/api/cards/{id}/activity', desc: 'Card activity log' },
        { method: 'GET', path: '/health/ready', desc: 'Readiness (SQL + Redis)' },
      ],
      sampleLabel: 'Request → layers (from README)',
      sample: `HTTP POST /api/workspaces  (Authorization: Bearer …)
  → API controller
  → MediatR command handler
  → FluentValidation pipeline
  → EF Core → SQL Server

Response: workspace id + your role = Owner`,
      highlights: [
        'Clean Architecture — zero-deps Domain layer',
        'MediatR CQRS + FluentValidation behaviors',
        'JWT 15 min + 7-day refresh with family rotation',
        'RBAC: Owner > Admin > Member > Viewer',
        'Kanban boards + cards · SignalR CardMoved / CommentAdded',
        'Hangfire jobs · card activity log · write rate limits',
        'Comments, tags, assignment emails · Redis SignalR backplane',
        'Prod Docker Compose · Railway / Azure Container Apps docs · CI',
      ],
    },
  },
  {
    title: 'TaskManagerAPI: REST Task Backend',
    excerpt:
      'ASP.NET Core CRUD API with filtering, sorting, pagination, validation, global exception middleware, and EF Core + SQLite.',
    stack: '.NET 10 · ASP.NET Core · EF Core · SQLite · Swagger',
    category: 'Backend',
    proof: 'Runnable · Swagger',
    link: 'https://github.com/Drakonchik1/TaskManagerAPI',
    demo: {
      type: 'api',
      github: 'https://github.com/Drakonchik1/TaskManagerAPI',
      howItWorks: [
        { step: 1, title: 'Start the API', desc: 'dotnet run creates SQLite DB and seeds sample tasks automatically.' },
        { step: 2, title: 'List with filters', desc: 'GET /api/tasks?priority=High&progress=InProgress&page=1&pageSize=10 — search text and due-date range supported.' },
        { step: 3, title: 'Create or update', desc: 'POST validates title (required, max 160) and priority/progress enums; PUT updates fields and sets CompletedAtUtc when done.' },
        { step: 4, title: 'Errors stay consistent', desc: 'Validation failures and exceptions pass through global middleware → same JSON error shape every time.' },
      ],
      flow: 'Client → Controller → Service → EF Core → SQLite',
      tryLocal: [
        'git clone https://github.com/Drakonchik1/TaskManagerAPI',
        'dotnet run',
        '# Swagger UI: http://localhost:5264/swagger',
      ],
      endpoints: [
        { method: 'GET', path: '/api/tasks', desc: 'Filter · sort · paginate task list' },
        { method: 'GET', path: '/api/tasks/{id}', desc: 'Single task by id' },
        { method: 'POST', path: '/api/tasks', desc: 'Create with validation' },
        { method: 'PUT', path: '/api/tasks/{id}', desc: 'Update priority, progress, due date' },
        { method: 'DELETE', path: '/api/tasks/{id}', desc: 'Remove task' },
      ],
      sampleLabel: 'Create task (POST /api/tasks)',
      sample: `{
  "title": "Ship MVP",
  "description": "Finalize API and update README.",
  "priority": "High",
  "dueDateUtc": "2026-03-29T10:00:00Z"
}

→ 201 Created with id, progress: "Todo", createdAtUtc`,
      highlights: [
        'Controller → Service → Data layering',
        'Query params: priority, progress, search, due range, sort, page',
        'JsonStringEnumConverter — enums as readable strings in JSON',
        'Rate limit 120 req/min per IP on API',
      ],
    },
  },
  {
    title: 'Booking System Application',
    excerpt:
      'Full-stack booking app: overlap detection, status workflow (Scheduled → Confirmed → Completed), ASP.NET Core API + vanilla JS UI.',
    stack: 'ASP.NET Core · EF Core · SQLite · JavaScript',
    category: 'Full-Stack',
    proof: 'Runnable · UI + API',
    link: 'https://github.com/Drakonchik1/BookingSystemAPI',
    demo: {
      type: 'api',
      github: 'https://github.com/Drakonchik1/BookingSystemAPI',
      howItWorks: [
        { step: 1, title: 'Load the catalog', desc: 'GET /api/catalog returns seeded service types (duration, price) and providers — the UI fills dropdowns from this.' },
        { step: 2, title: 'Book a slot', desc: 'POST /api/bookings with provider, service, start time. Server calculates end time from service duration.' },
        { step: 3, title: 'Conflict check', desc: 'Before save, service queries overlapping bookings for that provider. Overlap → 409 Conflict, nothing written.' },
        { step: 4, title: 'Manage status', desc: 'PATCH /api/bookings/{id}/status moves Scheduled → Confirmed → Completed (or Cancelled). Same UI and Swagger can drive it.' },
      ],
      flow: 'Catalog → POST booking → overlap check → save OR 409 → PATCH status',
      tryLocal: [
        'git clone https://github.com/Drakonchik1/BookingSystemAPI',
        'dotnet run',
        '# App UI:  http://localhost:5283',
        '# Swagger: http://localhost:5283/swagger',
      ],
      endpoints: [
        { method: 'GET', path: '/api/catalog', desc: 'Services + providers for the form' },
        { method: 'POST', path: '/api/bookings', desc: 'Create — auto end time + conflict check' },
        { method: 'PATCH', path: '/api/bookings/{id}/status', desc: 'Scheduled → Confirmed → Completed' },
        { method: 'GET', path: '/api/bookings', desc: 'Filter by day, provider, or status' },
      ],
      sampleLabel: 'Conflict response (409)',
      sample: `POST /api/bookings  — provider already booked 10:00–11:00

{
  "error": "Time slot is already booked for this provider."
}

No row inserted — rule enforced in BookingService, not only in UI.`,
      highlights: [
        'wwwroot vanilla JS calls the same API as Swagger',
        'Relational model: bookings ↔ service types ↔ providers',
        'End time derived from service duration',
        'Sample data seeded on first run for instant demo',
      ],
    },
  },
  {
    title: 'WeatherApp: WPF Weather Dashboard',
    excerpt:
      'WPF desktop dashboard — OpenWeatherMap + IMGW APIs, charts, date filters, CSV export, async HTTP with cancellation-friendly loading.',
    stack: '.NET 8 · WPF · REST APIs',
    category: 'Desktop',
    proof: 'WPF · dual weather APIs',
    link: 'https://github.com/Drakonchik1/WeatherApp',
    demo: {
      type: 'app',
      github: 'https://github.com/Drakonchik1/WeatherApp',
      howItWorks: [
        { step: 1, title: 'Pick a city', desc: 'Enter a location — app can query OpenWeatherMap (optional apikey.txt) and IMGW public data (no key needed for Poland).' },
        { step: 2, title: 'Fetch in parallel', desc: 'Async HTTP calls with cancellation — UI stays responsive while both sources load.' },
        { step: 3, title: 'Compare on dashboard', desc: 'Charts show temperature, humidity, pressure, rainfall. Each row is tagged with which API supplied it.' },
        { step: 4, title: 'Filter & export', desc: 'Date filter loads historical OpenWeather samples; one click exports the current view to CSV.' },
      ],
      tryLocal: [
        'git clone https://github.com/Drakonchik1/WeatherApp',
        'dotnet run --project WeatherApp/WeatherApp.csproj',
        '# Optional: WeatherApp/apikey.txt for OpenWeatherMap',
        '# Screenshots: docs/screenshots/ in repo',
      ],
      screens: [
        { label: 'Main dashboard', desc: 'Live readings + charts — screenshot in repo README' },
        { label: 'Source toggle', desc: 'Switch OpenWeatherMap vs IMGW or compare side by side' },
        { label: 'Date filter', desc: 'Historical samples for a chosen day range' },
        { label: 'CSV export', desc: 'Spreadsheet file with a column for data source' },
      ],
      sampleLabel: 'Data path',
      sample: `City input
  ├─ OpenWeatherMap REST (api key in apikey.txt)
  └─ IMGW public API (Polish institute data)
        ↓
  View models → bound charts (MVVM)
        ↓
  Export → CSV with source label per row`,
      highlights: [
        'Real dual-source integration — not mocked data',
        'MVVM binding between services and charts',
        'Cancellation-friendly async loads',
        'README includes setup + screenshots',
      ],
    },
  },
  {
    title: 'PatchGuard: WPF Health & Performance Desktop',
    excerpt:
      'Windows health tool — live hardware monitor, game FPS (PresentMon), safe optimizer, read-only diagnostics, ML anomaly detection, local RAG with 16 playbooks, multi-provider AI council (Ollama / OpenAI / Azure / Rules), sensor history + alerts, guided fixes, DPAPI secrets, 336 automated tests.',
    stack: '.NET 10 · WPF · MVVM · EF Core SQLite · LibreHardwareMonitor · PresentMon · Microsoft.ML · Ollama',
    category: 'Desktop',
    proof: 'Runnable · 336 tests',
    link: 'https://github.com/Drakonchik1/PatchGuard',
    demo: {
      type: 'app',
      github: 'https://github.com/Drakonchik1/PatchGuard',
      howItWorks: [
        { step: 1, title: 'Diagnose', desc: 'Pick a scenario (full audit, game check, after Windows Update, quick health) — read-only modules scan OS, disk, memory, temps, CPU/GPU, Event Log, updates.' },
        { step: 2, title: 'Monitor & FPS', desc: 'Live CPU/GPU sensors via LibreHardwareMonitor with sensor history (SQLite, 7-day rolling); game FPS (avg / 1% low / 0.1% low) via Intel PresentMon. ML anomaly detection (Z-score + Isolation Forest + Microsoft.ML RandomizedPCA).' },
        { step: 3, title: 'Alerts & guided fixes', desc: 'Threshold alert engine for CPU/GPU temp + load; alerts UI (active + resolved). Guided-fix pipeline: preview → confirm → execute → verify → record.' },
        { step: 4, title: 'Optimize safely', desc: 'One-click reversible boost: trim working sets, clear temp, empty Recycle Bin, flush DNS — no Windows settings changes.' },
        { step: 5, title: 'AI council (optional)', desc: 'Multi-provider: Azure OpenAI → OpenAI → Ollama (local) → Rules fallback. Four-agent council with agentic graph, local RAG (16 playbooks), DPAPI secrets, provenance labels. No cloud key required for Ollama/Rules.' },
      ],
      flow: 'Scan → findings + health score → history → alerts → guided fixes → optional AI guide · Monitor / FPS / Optimize in sidebar',
      tryLocal: [
        'git clone https://github.com/Drakonchik1/PatchGuard',
        'dotnet run --project PatchGuard/PatchGuard.csproj',
        'dotnet test PatchGuard.Tests/PatchGuard.Tests.csproj   # 336 tests',
        '# Optional: ollama pull llama3.2:3b for local AI',
      ],
      screens: [
        { label: 'Dashboard', desc: 'Health score, next action, scan history trends, live snapshot, alert summary' },
        { label: 'Diagnose', desc: 'Scenario → scan → findings → optional AI guidance with collapsible agent trace' },
        { label: 'Live Monitor / Game FPS', desc: 'Hardware sensors + sensor history + ML anomaly banner + PresentMon FPS' },
        { label: 'Alerts', desc: 'Active + recently resolved threshold alerts' },
        { label: 'Optimize / Settings', desc: 'Safe boost actions + provider radio (Cloud/Ollama/Rules) + Azure fields + DPAPI' },
      ],
      sampleLabel: 'What PatchGuard covers',
      sample: `Diagnostics (read-only): OS, disk, memory, temps, CPU/GPU, WU, Event Log
Live monitor: LibreHardwareMonitor sensors + 7-day sensor history (SQLite)
ML anomaly: Z-score + Isolation Forest + Microsoft.ML RandomizedPCA
Game FPS: PresentMon (avg / 1% low / 0.1% low)
Alerts: threshold engine (CPU/GPU temp + load) + guided-fix pipeline
Optimize: reversible only — trim, temp, Recycle Bin, DNS
AI: multi-provider council (Azure/OpenAI/Ollama/Rules) + local RAG (16 playbooks)
Secrets: DPAPI — no plaintext keys in config

336 xUnit tests — navigation, scoring, history, AI privacy, ML, cloud boundaries, UI contracts.`,
      highlights: [
        'MVVM (CommunityToolkit) + DI · modular diagnostic pipeline',
        'Deterministic health score (risk-capped-v1) + EF Core SQLite history',
        'ML anomaly detection: Z-score + Isolation Forest + Microsoft.ML',
        'Multi-provider AI: Azure OpenAI / OpenAI / Ollama / Rules with agentic graph',
        'Local RAG with 16 playbooks + hybrid keyword+embedding retrieval',
        'DPAPI secret storage — keys migrate from config to encrypted store',
        'Sensor history + threshold alerts + guided-fix pipeline',
        'Privacy by default — sanitized categories, provenance labels, consent controls',
        '336 automated tests covering core flows, ML, cloud boundaries, security',
      ],
    },
  },
]

const approachPillars = [
  {
    title: 'Backends',
    body: 'Clean Architecture where it pays off — validate early, consistent JSON errors, EF Core queries that do not surprise you in production.',
  },
  {
    title: 'Desktop',
    body: 'WPF with MVVM: async I/O off the UI thread, charts that reflect real API data, diagnostics that stay read-only and safe.',
  },
  {
    title: 'Team habits',
    body: 'Git in short iterations, trace bugs from UI down to SQL, clarify API contracts with frontend — same rhythm as Techcom.',
  },
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

/** Coarse pointer or low core count → halve decoration / particle density. */
function decorDensityScale() {
  if (typeof window === 'undefined') return 1
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 8
  return coarse || cores <= 4 ? 0.5 : 1
}

/** Prefer left/right edges so center content stays clearer. */
const genXEdge = (rng, W) => (rng() < 0.5 ? rng() * W * 0.3 : W - rng() * W * 0.3)

// Season placement config — used inside SideDecorations via useMemo
const SEASON_PLACEMENT = {
  winter: { count: 70, minSz: 14, maxSz: 52, gap: 1.2,
    genX: genXEdge,
    genY: (rng, H) => rng() * H,
  },
  spring: { count: 80, minSz: 12, maxSz: 40, gap: 1.0,
    genX: genXEdge,
    genY: (rng, H) => H * (0.04 + Math.pow(rng(), 0.6) * 0.92),
  },
  summer: { count: 60, minSz: 20, maxSz: 46, gap: 1.25,
    genX: genXEdge,
    genY: (rng, H) => rng() * H * 0.96 + H * 0.02,
  },
  autumn: { count: 70, minSz: 12, maxSz: 48, gap: 1.0,
    genX: genXEdge,
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
    const n = Math.max(1, Math.round(8 * decorDensityScale()))
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

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      const ctx0 = canvas.getContext('2d', { alpha: true })
      if (ctx0) {
        ctx0.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

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
    // Autumn: many thin streaks; other seasons: fewer, larger motes (−25% vs prior non-autumn bases)
    const baseCount = season === 'autumn' ? 150 : season === 'winter' ? 71 : 66
    const COUNT = Math.max(1, Math.round(baseCount * decorDensityScale()))
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
    const count = Math.max(1, Math.round(cfg.count * decorDensityScale()))

    const placed = []  // { x, y, r }
    const out    = []
    let id = 0

    for (let i = 0; i < count; i++) {
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

function truncateTitle(title) {
  const idx = title.indexOf(':')
  return idx === -1 ? title : title.slice(0, idx).trim()
}

const ProjectCard = memo(function ProjectCard({ post, onOpenDemo }) {
  const stackTags = post.stack.split(' · ').filter(Boolean)

  return (
    <article
      className={`project-card${post.flagship ? ' project-card--flagship' : ''}`}
    >
      <div className="project-card-accent" aria-hidden="true" />
      <div className="project-card-body">
        <div className="post-tags">
          <span className="post-tag">{post.category}</span>
          {post.flagship ? (
            <span className="post-tag post-tag--flagship">Flagship · MVP complete</span>
          ) : (
            post.status && <span className="post-tag post-tag--status">{post.status}</span>
          )}
        </div>
        <h3>{truncateTitle(post.title)}</h3>
        <p className="project-excerpt">{post.excerpt}</p>
        <div className="stack-cloud project-stack">
          {stackTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="project-card-footer">
          {post.link !== '#' && (
            <a
              className="btn btn--ghost"
              href={post.link}
              target="_blank"
              rel="noreferrer"
            >
              GitHub↗
            </a>
          )}
          {post.demo && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => onOpenDemo(post)}
            >
              How it works
            </button>
          )}
        </div>
      </div>
    </article>
  )
})

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDemo, setActiveDemo] = useState(null)
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [season, setSeason] = useState(autoSeason)
  // true = user manually chose a season (overrides auto-sync)
  const [userPicked, setUserPicked] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const copyToastTimer = useRef(null)

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

  const copyEmail = useCallback(async () => {
    const openMailto = () => {
      window.location.href = `mailto:${profile.email}`
    }

    try {
      if (!navigator.clipboard?.writeText) {
        openMailto()
        return
      }
      await navigator.clipboard.writeText(profile.email)
      setEmailCopied(true)
      window.clearTimeout(copyToastTimer.current)
      copyToastTimer.current = window.setTimeout(() => setEmailCopied(false), 1500)
    } catch {
      openMailto()
    }
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(copyToastTimer.current)
  }, [])

  // Apply season palette → CSS vars (accent/text + card/glow); transitions smooth changes
  useEffect(() => {
    const cfg = SEASON_CONFIG[season]
    document.body.style.backgroundColor = cfg.bodyBg
    const root = document.documentElement
    root.style.setProperty('--bg', cfg.bodyBg)
    root.style.setProperty('--card-season-bg', cfg.cardBg)
    root.style.setProperty('--surface', cfg.cardBg)
    root.style.setProperty('--season-glow-inner', cfg.glowInner)
    root.style.setProperty('--season-glow-outer', cfg.glowOuter)
    root.style.setProperty('--accent', cfg.accent)
    root.style.setProperty('--accent-soft', cfg.accentSoft)
    root.style.setProperty('--accent-text', cfg.accent)
    root.style.setProperty('--accent-muted', `${cfg.accent}38`)
    root.style.setProperty('--accent-strong', cfg.accentSoft)
    root.style.setProperty('--text', cfg.text)
    root.style.setProperty('--text-muted', cfg.textMuted)
    document.body.style.color = cfg.text
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

  // Highlight nav link for the section currently in view
  useEffect(() => {
    const links = Array.from(document.querySelectorAll('.top-links a[href^="#"]'))
    if (!links.length) return

    const linkById = new Map(
      links
        .map((a) => [a.getAttribute('href')?.slice(1), a])
        .filter(([id]) => id && NAV_SECTION_IDS.includes(id)),
    )

    const sections = NAV_SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!sections.length) return

    const visible = new Set()

    const setActive = (id) => {
      linkById.forEach((link, sectionId) => {
        link.classList.toggle('is-active', sectionId === id)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const active = NAV_SECTION_IDS.find((id) => visible.has(id))
        if (active) setActive(active)
      },
      {
        root: null,
        rootMargin: '-80px 0px -55% 0px',
        threshold: 0,
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
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
          {(() => { const [c0, c1, c2] = SEASON_CONFIG[season].mtnColors; return (
            <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 110 L160 28 L300 95 L480 18 L640 88 L800 32 L960 100 L1120 22 L1280 85 L1440 45 L1440 380 L0 380 Z" fill={c0}/>
              <path d="M0 165 L140 78 L280 155 L450 55 L620 148 L790 70 L960 140 L1130 60 L1300 150 L1440 95 L1440 380 L0 380 Z" fill={c1}/>
              <path d="M0 220 L180 140 L360 210 L540 125 L720 200 L900 135 L1080 205 L1260 130 L1440 190 L1440 380 L0 380 Z" fill={c2}/>
            </svg>
          )})()}
        </div>
      </div>

      <div id="season-visual-portal" className="season-visual-mount">
        <SeasonVisualLayer season={season} viewport={viewport} />
      </div>

      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <main className="page" id="main-content">
        <div className="bg-glow bg-glow-left" />
        <div className="bg-glow bg-glow-right" />

        <header className="topbar card">
          <p className="brand">
            <span className="brand-rotor" aria-hidden="true" />
            Pavlo.dev
          </p>
          <div className="top-links">
            <a href="#experience">Experience</a>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="season-picker" role="group" aria-label="Season theme">
            {SEASON_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className={`season-btn${season === s ? ' season-btn--active' : ''}${s === autoSeason() && !userPicked ? ' season-btn--auto' : ''}`}
                onClick={() => pickSeason(s)}
                title={`${SEASON_CONFIG[s].label}${s === autoSeason() ? ' (current season)' : ''}`}
                aria-pressed={season === s}
              >
                <SeasonIcon season={s} size={18} />
              </button>
            ))}
            {userPicked && (
              <button
                type="button"
                className="season-btn season-btn-reset"
                onClick={resetToAuto}
                title="Reset to current real season"
              >
                <ResetSeasonIcon size={18} />
              </button>
            )}
          </div>
        </header>

      <section className="hero card hero-with-rotors">
        <span className="card-rotor card-rotor--tl" aria-hidden="true" />
        <span className="card-rotor card-rotor--br" aria-hidden="true" />
        <p className="status-badge">
          <span className="status-dot" aria-hidden="true" />
          Available now · Katowice hybrid / remote PL
        </p>
        <h1>{profile.name}</h1>
        <p className="hero-tagline">{profile.tagline}</p>
        <p className="summary hero-summary">{profile.summary}</p>
        <div className="hero-cta">
          <a className="btn btn--primary" href="#projects">
            View projects
          </a>
          <a
            className="btn btn--ghost"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
          <a className="btn btn--ghost" href="/Pavlo_Dorofieiev_CV.pdf" download>
            Download CV
          </a>
        </div>
        <div className="kpi-strip" role="list">
          {heroKpis.map((kpi) => (
            <div key={kpi.label} className="kpi-cell" role="listitem">
              <p className="kpi-value">{kpi.value}</p>
              <p className="kpi-label">{kpi.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card experience section-with-rotors" id="experience">
        <span className="card-rotor card-rotor--tl" aria-hidden="true" />
        <div className="experience-columns">
          <div className="experience-col">
            <h2>Experience</h2>
            <ul className="timeline">
              {experiencePosts.map((job) => (
                <li key={job.company + job.role}>
                  <p className="timeline-date">{job.period}</p>
                  <h3>{job.role}</h3>
                  <p className="timeline-org">
                    {job.company} · {job.location}
                  </p>
                  <ul className="experience-bullets">
                    {job.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div className="experience-col">
            <h2>Education</h2>
            <ul className="timeline">
              {education.map((edu) => (
                <li key={edu.school}>
                  <p className="timeline-date">{edu.period}</p>
                  <h3>{edu.program}</h3>
                  <p className="timeline-org">
                    {edu.school} · {edu.location}
                  </p>
                  <p className="education-focus">{edu.focus}</p>
                  {edu.certificates.length > 0 && (
                    <div className="timeline-tags">
                      {edu.certificates.map((cert) => (
                        <span key={cert} className="tag">
                          {cert.includes('—') ? cert.split('—')[0].trim() : cert}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card projects section-with-rotors" id="projects">
        <span className="card-rotor card-rotor--bl" aria-hidden="true" />
        <div className="section-head projects-head">
          <h2>Projects</h2>
          <div className="filter-chips" role="group" aria-label="Filter projects by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="projects-grid">
          {filteredPosts.map((post) => (
            <ProjectCard key={post.title} post={post} onOpenDemo={setActiveDemo} />
          ))}
        </div>
      </section>

      <section className="card skills section-with-rotors" id="skills">
        <span className="card-rotor card-rotor--br-small" aria-hidden="true" />
        <h2>Skills</h2>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className={`skill-group${group.label === 'Familiar' ? ' skill-group--familiar' : ''}`}
            >
              <p className="skill-group-label">{group.label}</p>
              <div className="stack-cloud">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card about section-with-rotors" id="about">
        <span className="card-rotor card-rotor--tr" aria-hidden="true" />
        <div className="about-grid">
          <div className="about-col">
            <h2>How I work</h2>
            <div className="approach-stack">
              {approachPillars.map((item) => (
                <article key={item.title} className="approach-item">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="about-col">
            <h2>Open to</h2>
            <ul className="looking-list">
              {lookingFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="about-col">
            <h2>Languages</h2>
            <ul className="language-list">
              {languages.map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>
            <h2 className="about-subhead">Soft skills</h2>
            <ul className="looking-list">
              {softSkills.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card cta section-with-rotors" id="contact">
        <span className="card-rotor card-rotor--tl" aria-hidden="true" />
        <h2>Contact</h2>
        <p className="summary contact-lead">
          Open to junior .NET roles — hybrid Katowice area or remote within Poland.
        </p>
        <div className="contact-actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={copyEmail}
            aria-label={`Copy email ${profile.email}`}
          >
            Email
          </button>
          <a className="btn btn--ghost" href="/Pavlo_Dorofieiev_CV.pdf" download>
            Download CV
          </a>
        </div>
        <div className="contact-icons">
          <a
            className="btn btn--icon"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
          <a
            className="btn btn--icon"
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
          <a
            className="btn btn--icon"
            href={profile.telegram}
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Telegram
          </a>
          <a
            className="btn btn--icon"
            href={profile.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <a
            className="btn btn--icon"
            href={`tel:${profile.phone.replace(/\s/g, '')}`}
            aria-label={`Phone ${profile.phone}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Phone
          </a>
        </div>
        {emailCopied && (
          <div className="copy-toast" role="status" aria-live="polite">
            Copied
          </div>
        )}
      </section>

        <footer className="footer">
          <p>
            © {new Date().getFullYear()} · {profile.name} · Built with React + Vite ·{' '}
            <a href={profile.portfolioRepo} target="_blank" rel="noreferrer">
              Source ↗
            </a>
          </p>
        </footer>
      </main>

      <div className="peaks-layer peaks-layer--bottom" aria-hidden="true">
        <div className="mtn-band mtn-band-bottom">
          {(() => { const [c0, c1, c2] = SEASON_CONFIG[season].mtnColors; return (
            <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 270 L160 352 L300 285 L480 362 L640 292 L800 348 L960 280 L1120 358 L1280 295 L1440 335 L1440 0 L0 0 Z" fill={c0}/>
              <path d="M0 215 L140 302 L280 225 L450 325 L620 232 L790 310 L960 240 L1130 320 L1300 230 L1440 285 L1440 0 L0 0 Z" fill={c1}/>
              <path d="M0 160 L180 240 L360 170 L540 255 L720 180 L900 245 L1080 175 L1260 250 L1440 190 L1440 0 L0 0 Z" fill={c2}/>
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
