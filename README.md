# Folio — Frontend Only

Premium CV Builder frontend. No backend. Wire your own API calls where marked with `// TODO`.

## Quick Start
```bash
npm install
npm run dev  # → http://localhost:3000
```

## Pages
| Route | Page |
|-------|------|
| `/` | Landing page |
| `/auth` | Login / Sign up |
| `/dashboard` | User workspace (mock data) |
| `/builder` | CV editor with live preview |
| `/templates` | 8 template gallery |
| `/tools/roast` | Resume Roast (stub) |
| `/tools/interview` | Interview Simulator (stub) |
| `/tools/job-match` | Job Match Analyzer (stub) |
| `/resume/slug` | Public resume share page |

## Where to Add Your API Calls
Search for `// TODO` in each page:
- `auth/page.tsx` — Google OAuth + email login
- `dashboard/page.tsx` — fetch user's CVs list
- `builder/page.tsx` — save CV, AI suggestions
- `tools/roast/page.tsx` — roast API
- `tools/interview/page.tsx` — generate questions, get feedback
- `tools/job-match/page.tsx` — match analysis

## Design System
Colors: `--cream #FAFAF5` · `--forest #1C3829` · `--gold #C8A96E` · `--ember #D4622E`
Fonts: Cormorant Garamond (headings) · DM Sans (body) · JetBrains Mono (mono)
