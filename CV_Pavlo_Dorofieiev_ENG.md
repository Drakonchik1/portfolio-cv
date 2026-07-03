# Pavlo Dorofieiev

**Junior .NET developer**  
Tychy, Poland  
pavlo.dorofieiev@gmail.com · (+48) 576 468 614  
https://portfolio-cv-six-indol.vercel.app · https://linkedin.com/in/pavlo-dorofieiev-596b282b1 · https://github.com/Drakonchik1

## About myself

Junior .NET developer in Tychy — ASP.NET Core, EF Core, WPF. FlowBoard: Clean Architecture, Kanban boards, SignalR, JWT, 241 unit tests. INF.03/INF.04 passed. Available immediately. Hybrid Katowice area or remote within Poland.

## Work experience

### Programmer — Techcom · Tychy, Poland · 02/2023 – 03/2023

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

**Programmer — TEB Technikum Edukacja w Tychach · 2020 – 2026 · Tychy, Poland**

- 2024–2026: INF.03/INF.04 exams and matura; portfolio backends (FlowBoard, PatchGuard) while preparing for junior .NET roles
- Certificates: INF.03 — 100% practice · INF.04 — 100% practice

## Skills

**Languages & runtime:** C#, .NET 8/10, SQL  
**Backend:** ASP.NET Core, REST APIs, EF Core, SQLite, Swagger/Scalar, JWT, MS SQL, SignalR  
**Desktop & mobile:** WPF, MVVM, .NET MAUI  
**Frontend:** HTML, CSS, JavaScript, React  
**Tools:** Git, Visual Studio, VS Code, Docker, xUnit  
**Familiar:** Angular, Vue.js, PHP, Microservices, Event-Driven Architecture  
**Soft skills:** Team collaboration, clear communication, adaptability, receptiveness to feedback

## Languages

Russian — mother tongue · Ukrainian — mother tongue · English — C1 · Polish — C1

## Projects

### FlowBoard — .NET 10, ASP.NET Core, EF Core, SQL Server (in progress)

- Flagship backend: Clean Architecture (Domain / Application / Infrastructure / API)
- Auth: JWT + family-based refresh-token rotation, BCrypt, rate limiting on auth endpoints
- Workspaces: multi-tenant workspaces, invites, RBAC (Owner / Admin / Member / Viewer)
- Kanban boards + cards; SignalR real-time (`CardMoved`, `CommentAdded`); optional Redis backplane
- Comments, tags, queued email notifications (Sprint 6)
- CQRS with MediatR + FluentValidation pipeline; Scalar/OpenAPI docs
- 241 xUnit tests (handlers + domain); 13 integration tests with Docker / TestContainers

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

### PatchGuard — .NET 10, WPF, MVVM, EF Core

- WPF health checker: read-only Windows diagnostics (Event Log, updates, services, disk)
- MVVM + DI + EF Core SQLite scan history; modular diagnostic pipeline
- Multi-agent AI council (analyze → research → debate → chief verdict) for manual repair guides
