# Pavlo Dorofieiev

**Junior .NET developer**  
Tychy, Poland  
pavlo.dorofieiev@gmail.com · (+48) 576 468 614  
https://portfolio-cv-six-indol.vercel.app · https://linkedin.com/in/pavlo-dorofieiev-596b282b1 · https://github.com/Drakonchik1

## About myself

Junior .NET developer in Tychy — ASP.NET Core, EF Core, WPF. FlowBoard MVP: Clean Architecture, Kanban, SignalR, Hangfire, JWT, 277 unit tests. PatchGuard: WPF diagnostics, ML anomaly detection, local RAG, multi-provider AI council, 336 tests. INF.03/INF.04 passed. Available immediately. Hybrid Katowice area or remote within Poland.

## Work experience

### Programmer (Internship) — Techcom · Tychy, Poland · 02/2023 – 03/2023

- Developed and maintained backend features in C# — bug fixes, small modules, and API/data-layer changes
- Wrote and updated SQL queries (SELECT/INSERT/UPDATE) for reports, lists, and admin-style data operations
- Worked with relational databases — table design basics, joins, and keeping data consistent with app logic
- Fixed backend defects from testing/production; traced issues from UI/API down to SQL when needed
- Used Git for version control; deployed or tested changes with the team in short iterations
- Collaborated with frontend on integration — clarified endpoints, payloads, and error cases

### VR/IT Support (Erasmus Internship) — IE University · Madrid, Spain · 17/03/2025 – 11/04/2025

- Supported live educational sessions using VR headsets in a professional IT environment
- Prepared, configured, and tested VR equipment before each session to ensure stable, distraction-free delivery
- Worked alongside an experienced IT support team — troubleshooting issues, assisting facilitators, keeping sessions on schedule
- Gained hands-on familiarity with VR hardware setup, calibration, and day-to-day operational workflows

## Education & training

**Programmer (C#/.NET) — WSB Merito w Chorzowie · 2026 · Chorzów, Poland**

- Admitted to 1st year of studies.

**Programmer — TEB Technikum Edukacja w Tychach · 2020 – 2026 · Tychy, Poland**

- Obtained the professional title of Technik Programista.
- INF.03/INF.04 exams and matura; portfolio backends (FlowBoard, PatchGuard) while preparing for junior .NET roles
- Certificates: INF.03 — 100% practice · INF.04 — 100% practice

## Skills

**Languages & runtime:** C#, .NET 8/10, SQL  
**Backend:** ASP.NET Core, REST APIs, EF Core, Dapper, SQLite, MS SQL, Swagger/Scalar, JWT, SignalR, Hangfire, Redis, MediatR  
**Desktop & mobile:** WPF, MVVM, .NET MAUI  
**Frontend:** HTML, CSS, JavaScript, React  
**Tools:** Git, Visual Studio, VS Code, Docker, xUnit  
**Familiar:** Angular, Vue.js, PHP, Microservices, Event-Driven Architecture  
**Soft skills:** Team collaboration, clear communication, adaptability, receptiveness to feedback

## Languages

Russian — mother tongue · Ukrainian — mother tongue · English — C1 · Polish — C1

## Projects

### FlowBoard — .NET 10, ASP.NET Core, EF Core, SQL Server (MVP complete)

- Flagship backend: Clean Architecture (Domain / Application / Infrastructure / API)
- Auth: JWT + family-based refresh-token rotation, BCrypt, rate limiting on auth and writes
- Workspaces: multi-tenant workspaces, invites, RBAC (Owner / Admin / Member / Viewer)
- Kanban boards + cards (Dapper reads, fractional-index ordering); SignalR real-time; optional Redis backplane
- Comments, tags, assignment emails; Hangfire background jobs; card activity log
- CQRS with MediatR + FluentValidation; Scalar/OpenAPI; Docker Compose (dev + prod); Railway / Azure deploy docs
- 277 xUnit tests; 21 integration tests with Docker / TestContainers; CI

### PatchGuard — .NET 10, WPF, MVVM, EF Core, Microsoft.ML, Ollama

- Windows health & performance desktop: Dashboard, Diagnose, Live Monitor, Game FPS, Alerts, Optimize, Settings
- Read-only diagnostics (OS, disk, memory, temps, CPU/GPU, Event Log, Windows Update); deterministic health score
- Live hardware sensors (LibreHardwareMonitor) with 7-day sensor history (SQLite); game FPS via Intel PresentMon
- ML anomaly detection: Z-score + Isolation Forest + Microsoft.ML RandomizedPCA (inference-only, bundled models)
- Threshold alert engine (CPU/GPU temp + load) with guided-fix pipeline (preview → confirm → execute → verify)
- Safe reversible optimizer (trim, temp, Recycle Bin, DNS) — no Windows settings changes
- Multi-provider AI council: Azure OpenAI / OpenAI / Ollama (local) / Rules fallback; agentic graph with 4 agents
- Local RAG: 16 playbooks with hybrid keyword+embedding retrieval; provenance labels in UI
- DPAPI secret storage — API keys migrate from config to encrypted store; no plaintext in repo
- EF Core SQLite scan history; 336 automated tests (navigation, scoring, ML, cloud boundaries, AI privacy, security)

### TaskManagerAPI — .NET 10, ASP.NET Core, EF Core

- REST CRUD API with filtering, sorting, and pagination on list endpoints
- Input validation and global exception middleware — consistent JSON error responses
- EF Core + SQLite with seed data; enums serialized as strings in JSON
- Swagger/OpenAPI for interactive testing

### Booking System Application

- Full-stack booking app: overlap detection and status workflow (Scheduled → Confirmed → Completed)
- ASP.NET Core + EF Core + SQLite; service-layer validation before save
- Vanilla JS UI in wwwroot wired to the API

### WeatherApp — .NET 8, WPF

- WPF desktop dashboard — charts for temperature, humidity, pressure, rainfall
- Dual API integration: OpenWeatherMap + IMGW (Polish public weather data)
- Async HTTP calls with cancellation-friendly loading; date filter for historical samples
- CSV export of the current dataset; source label per row (which API supplied data)
