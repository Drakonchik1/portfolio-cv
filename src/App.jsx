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

const NAV_SECTION_IDS = ['experience', 'projects', 'approach', 'contact']

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
    'Junior .NET developer in Tychy — ASP.NET Core, EF Core, WPF. FlowBoard MVP: Clean Architecture, Kanban, SignalR, Hangfire, JWT, 277 unit tests. PatchGuard: WPF diagnostics, ML anomaly detection, local RAG, multi-provider AI council, 336 tests. INF.03 / INF.04 passed. Available immediately — hybrid Katowice area or remote within Poland.',
}

const heroKpis = [
  { value: '277', label: 'xUnit tests (FlowBoard)' },
  { value: '336', label: 'tests (PatchGuard)' },
  { value: 'Now', label: 'Available immediately' },
]

const currentlyBuilding = {
  title: 'FlowBoard',
  link: 'https://github.com/Drakonchik1/FlowBoard',
  lines: [
    'MVP complete (Sprints 1–8) · Hangfire jobs · card activity log',
    'Kanban + SignalR · Redis backplane · prod Docker / Railway / Azure docs',
    '277 unit tests · 21 integration tests (TestContainers)',
  ],
}

const lookingFor = [
  'Available immediately',
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
            <a href="#approach">Approach</a>
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
        <div className="hero-main">
          <p className="eyebrow">Junior .NET · ASP.NET Core, EF Core, WPF</p>
          <h1>{profile.name}</h1>
          <p className="role">{profile.role}</p>
          <p className="summary">{profile.summary}</p>
          <div className="chips">
            <span>{profile.location}</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </div>
        </div>
        <aside className="hero-side">
          <p className="eyebrow">At a glance</p>
          <div className="stats-grid">
            {heroKpis.map((kpi) => (
              <article key={kpi.label}>
                <p className="kpi-value">{kpi.value}</p>
                <p className="kpi-label">{kpi.label}</p>
              </article>
            ))}
          </div>
          <p className="availability">
            Available immediately. Hybrid Katowice area or remote within Poland.
          </p>
        </aside>
      </section>

      <section className="card experience section-with-rotors" id="experience">
        <span className="card-rotor card-rotor--tl" aria-hidden="true" />
        <h2>Experience</h2>
        <div className="experience-list">
          {experiencePosts.map((job) => (
            <article key={job.company + job.role} className="experience-item">
              <div className="experience-head">
                <div>
                  <h3>{job.role}</h3>
                  <p className="experience-org">
                    {job.company} · {job.location}
                  </p>
                </div>
                <span className="experience-date">{job.period}</span>
              </div>
              <ul className="experience-bullets">
                {job.bullets.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
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
                <div className="post-tags">
                  <span className="post-tag">{post.category}</span>
                  {post.status && <span className="post-tag post-tag--status">{post.status}</span>}
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <p className="meta-line">{post.stack}</p>
                {post.proof && <p className="proof-line">{post.proof}</p>}
                <div className="feed-actions">
                  {post.link !== '#' && (
                    <a className="read-more" href={post.link} target="_blank" rel="noreferrer">
                      Open project
                    </a>
                  )}
                  {post.demo && (
                    <button className="read-more demo-btn" onClick={() => setActiveDemo(post)}>
                      How it works
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

          <section className="card building-card">
            <h2>Building now</h2>
            <p className="building-title">
              <a href={currentlyBuilding.link} target="_blank" rel="noreferrer">
                {currentlyBuilding.title}
              </a>
            </p>
            <ul className="building-list">
              {currentlyBuilding.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="card section-with-rotors">
            <span className="card-rotor card-rotor--br-small" aria-hidden="true" />
            <h2>Skills</h2>
            {skillGroups.map((group) => (
              <div key={group.label} className="skill-group">
                <p className="skill-group-label">{group.label}</p>
                <div className="stack-cloud">
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Soft skills</h2>
            <ul className="looking-list">
              {softSkills.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Open to</h2>
            <ul className="looking-list">
              {lookingFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Education</h2>
            {education.map((edu) => (
              <div key={edu.school} className="education-entry">
                <p className="education-school">{edu.school}</p>
                <p className="education-meta">{edu.program}</p>
                <p className="education-meta">{edu.period} · {edu.location}</p>
                <p className="education-focus">{edu.focus}</p>
                {edu.certificates.length > 0 && (
                  <ul className="education-certs">
                    {edu.certificates.map((cert) => (
                      <li key={cert}>{cert}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Languages</h2>
            <ul className="language-list">
              {languages.map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>

      <section className="card approach section-with-rotors" id="approach">
        <span className="card-rotor card-rotor--tr" aria-hidden="true" />
        <h2>How I work</h2>
        <p className="approach-lead">
          Habits from Techcom and personal projects — not repeated elsewhere on this page.
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

      <section className="card cta" id="contact">
        <h2>Contact</h2>
        <p className="summary">
          Available immediately for junior .NET roles — hybrid Katowice area or remote within Poland.
          Code on GitHub under each project.
        </p>
        <div className="chips">
          <a href={`mailto:${profile.email}`}>Email</a>
          <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>Phone</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
        </div>
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
