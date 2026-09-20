# Pavlo Portfolio CV

Standalone portfolio / web CV (React + Vite), deployed on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5174`

## Build for production

```bash
npm run build
```

## Main files

- `src/App.jsx` — layout, seasons, particles, projects
- `src/App.css` — styling and animations
- `src/ProjectModal.jsx` — demo modal (lazy-loaded chunk)
- `index.html` — SEO meta, favicon, Open Graph, JSON-LD Person
- `public/favicon.svg` — P monogram favicon
- `public/og.png` — 1200×630 social preview (name, role, stack, URL)
- `public/Pavlo_Dorofieiev_CV.pdf` — CV download (**add manually**; Download CV button 404s until present)
- `CV_Pavlo_Dorofieiev_ENG.md` — CV text source

---

## Recent updates (changelog)

### 2026-09-20 — SEO / assets (Phase 10)
- Favicon (`public/favicon.svg`) + `og.png` (1200×630) linked via `og:image` / `twitter:image`
- Meta description updated: FlowBoard **277** tests, PatchGuard **336** tests
- `theme-color` set to winter body bg `#030d18`
- JSON-LD `Person` (name, jobTitle, url, email, sameAs GitHub + LinkedIn)
- Note: place CV PDF at `public/Pavlo_Dorofieiev_CV.pdf` manually before Download CV works

### 2026-07-16 — FlowBoard MVP + PatchGuard sync
- FlowBoard: **277** unit tests, **21** integration tests; status **MVP complete** (Sprints 1–8)
- FlowBoard bullets: Hangfire, activity log, Dapper reads, write rate limits, prod Docker / Railway / Azure **docs** (Azure still not claimed as hands-on deploy)
- Skills: added Dapper, Hangfire, Redis, MediatR
- PatchGuard: Live Monitor, Game FPS (PresentMon), safe Optimize, privacy-first AI council, **133** tests
- Hero KPIs: 277 (FlowBoard) + 133 (PatchGuard); `CV_Pavlo_Dorofieiev_ENG.md` rewritten to match
- PDF FlowCV still may lag — update separately (143 → 277 + PatchGuard section)

### 2026-07-03 — CV sync (site + markdown; PDF unchanged)
- FlowBoard: **241** unit tests, Sprint 6 features (boards, SignalR, comments, tags, email)
- Removed **Azure** from skills until deploy; added **SignalR**
- IE University dates aligned with PDF: `17/03/2025 – 11/04/2025`
- `CV_Pavlo_Dorofieiev_ENG.md` rewritten to match site

### Content & links
- Profile links aligned with GitHub **Drakonchik1**, Vercel deployment, Telegram, WhatsApp.
- Hero / contact copy tuned (professional tone, honest wording).
- Fewer link chips in the hero; secondary links under contact.

### Seasons & motion
- **Summer vs autumn** palettes separated: summer = teal dusk + gold accents; autumn = rust / earth + warm rain streaks.
- Sunflower + maple leaf colours adjusted to match.
- **Smooth transitions** when switching seasons (body, mountain SVG fills, cards, particles reset).
- **More rotation**: ambient rings, card corner rings, brand ring, side decos with slow spin + mouse tilt.
- Higher counts for side decorations and tuned particle behaviour per season.

### Performance (no visual / behaviour change)
- Mouse handling moved **inside side decorations** with **DOM-only** transform updates — no full React tree re-renders on pointer move.
- **`React.memo`** on heavy subtrees; **`React.lazy`** + **`Suspense`** for the project demo modal.
- **Vite** `manualChunks` for React vendor bundle.
- Particle canvas: **visibility pause** when the tab is hidden; resize listeners **passive** + debounced viewport updates.
- Hot loop: **season-specific draw/update functions** chosen once per effect (less branching per frame).

### Tooling
- `vite.config.js` — production chunk splitting for caching.
