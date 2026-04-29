# GoEvoli – Projektdokumentation & Konventionen

> Sammelkarten-inspirierte Kanban-Anwendung für agiles Projektmanagement.

---

## Architektur-Überblick

| Schicht | Technologie | Pfad |
|---------|------------|------|
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS | `frontend/` |
| **Backend** | Go + Chi Router | `backend/` |
| **Datenbank** | MongoDB Atlas | via `MONGO_URI` in `.env` |
| **Styling** | TailwindCSS + Custom CSS (`index.css`) | `frontend/src/index.css` |

### Starten

```bash
# Backend
cd backend && go run cmd/server/main.go

# Frontend
cd frontend && npm run dev

# Seed-Daten
cd backend && go run cmd/seed/main.go
```

---

## Design-System & Konventionen

### Farbpalette (CSS-Variablen in `:root`)

| Variable | Hex | Verwendung |
|----------|-----|------------|
| `--goevoli-bg` | `#F7E6B2` | Hintergrund aller Seiten |
| `--goevoli-primary` | `#925D3B` | Primärfarbe (Buttons, Titel, Akzente) |
| `--goevoli-secondary` | `#EBD8B1` | Sekundär-Hintergrund |
| `--goevoli-text` | `#4D3122` | Textfarbe |
| `--goevoli-card-surface` | `#FFF6DD` | Kartenoberfläche |
| `--goevoli-card-inner` | `#F3DFB8` | Karteninnenfläche |
| `--goevoli-border` | `#7A4A2D` | Kartenrahmen |

### Typografie

- **Font**: `Outfit` (primär), `Inter` (fallback)
- **Stil**: `font-black uppercase tracking-widest` für Labels
- **Kleine Labels**: `text-[7px]` bis `text-[10px]`
- Alle Formularelemente erben die Font-Familie via `index.css`

### Card-Shell (`CardShell.tsx`)

Jede Ansicht im Detailmodus nutzt `CardShell` als Rahmen:
- **Seitenverhältnis**: `63:88` (Sammelkarten-Standard)
- **Board-Größe**: `160×223px` (fest)
- **Active-Größe**: `min(92vw, 360px)` (responsive)
- **5 Sektionen**: Header (12%) → Artwork (28%) → Meta (8%) → Body (flex) → Footer (15%)
- **3D-Tilt**: Mouseover-Effekt nur im Active-Modus

### CardArtwork (`CardArtwork.tsx`)

6-Layer Compositing: Hintergrund-Gradient → Partikel-SVG → PNG-Artwork → Holo-Foil → Prisma-Sweep → Vignette

**Artwork-Zuweisung:**

| Kontext | Bild | Status-Hintergrund |
|---------|------|-------------------|
| Story (Backlog) | `egg.png` | `EGG` (Wiesengrün) |
| Story (In Arbeit) | `evoli.png` | `EVOLVING` |
| Story (Fertig) | `flamara/aquana/...` | `FINAL_EVOLUTION` |
| Task: Function | `thunderstone.png` | `TASK` |
| Task: Design | `firestone.png` | `TASK` |
| Task: Stability | `waterstone.png` | `TASK` |
| Trainer-Profil | `trainer1-3.png` | `NEUTRAL` (Steingrau) |

### CardOverlay (`CardOverlay.tsx`)

Fullscreen-Overlay mit Backdrop-Blur. Schließbar per X-Button oben rechts.

### CSS-Klassen (in `index.css`)

| Klasse | Beschreibung |
|--------|-------------|
| `.playmat-pattern` | Grid-Hintergrundmuster für Board |
| `.holographic-shine` | Holo-Glanzeffekt |
| `.custom-scrollbar` | Schmale Scrollbar im Evoli-Stil |
| `.card-ornament` | Dekorativer Kartenrahmen |
| `.evoli-select` | Einheitlicher Dropdown-Stil mit Custom-Arrow |
| `.card-artwork-img` | Schwebende Animation für PNG-Artworks |
| `.card-holo-foil` | Hologramm-Overlay (Hover-aktiviert) |
| `.card-holo-sweep` | Prismatischer Sweep-Effekt |

### Hilfsfunktionen

| Funktion | Pfad | Beschreibung |
|----------|------|-------------|
| `cn()` | `utils/cn.ts` | `clsx` + `tailwind-merge` Wrapper |
| `resolveStoryArtwork()` | `CardArtwork.tsx` | Bestimmt Bild/Holo anhand Story-Status |
| `resolveTaskArtwork()` | `CardArtwork.tsx` | Bestimmt Stein-Bild anhand Task-Typ |
| `deterministicIndex()` | `CardArtwork.tsx` | Hash-basierter Index für konsistente Zuweisung |

---

## Seiten

### 1. Login (`/login`)

- **Layout**: Zentrierte `CardShell` mit zufälliger Evoli-Evolution als Artwork
- **Logik**: Auto-Erkennung ob Login oder Register via `authApi.checkEmail()`
- **Felder**: Email (mit Blur-Check) + Passwort (mit Toggle-Sichtbarkeit)
- **API**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/check-email`
- **Auth-State**: `AuthContext` speichert User, JWT via HttpOnly Cookie

### 2. Projekte (`/projects`)

- **Layout**: Grid aus `CardShell`-Karten (1–3 Spalten responsive)
- **Artwork**: Deterministische Evoli-Evolution pro Projekt-ID
- **Leerer Zustand**: Placeholder mit "Erstes Projekt erstellen" Button
- **API**: `GET /api/projects/`
- **Navigation**: Klick auf Karte → Board (`/projects/:id/board`)

**Projekt erstellen** (`/projects/new`):
- CardShell-Overlay mit Name + Beschreibung
- `POST /api/projects/`

### 3. Board / Spielfeld (`/projects/:projectId/board`)

- **Layout**: Horizontales Kanban mit Swimlanes pro Story
- **Spalten**: `BACKLOG → NEXT → DOING → TEST → DONE`
- **WIP-Limits**: Visuelles Warnsystem (rot) bei Überschreitung
- **Suche**: Filtert Stories & Tasks live
- **Header**: Suchfeld + Settings-Button + "Neue Karte"-Button

#### Swimlane (`Swimlane.tsx`)

- Links: `StoryCard` als "User Story"-Zone
- Rechts: 5 Spalten mit `TaskStack` pro Status
- Drag & Drop: Buttons zum Verschieben (kein dnd-kit aktiv)

#### Story-Card (`StoryCard.tsx`)

- **Board-Modus**: Kompakte Karte (160px), Titel + Artwork
- **Detail-Modus** (via `StoryDetailModal`): Tabs:
  - **BESCHREIBUNG**: Story-Text
  - **LÖSCHEN**: Bestätigungsdialog mit rotem Button
- **Artwork**: Dynamisch je nach Story-Status (Egg → Evoli → Evolution)
- **Footer**: Erstelldatum links, Autor rechts
- **API**: `DELETE /api/stories/:storyId`

#### Task-Card (`TaskCard.tsx`)

- **Board-Modus**: Kompakte Karte mit Stein-Artwork je Typ
- **Detail-Modus** (via `TaskDetail`-Seite): Tabs:
  - **ZUSAMMENFASSUNG**: Satz-Beschreibung mit Typ, Workload, Priorität, Status
  - **BESCHREIBUNG**: Aufgabentext
  - **ASSIGNED**: Zugewiesene Trainer (max 5)
  - **LÖSCHEN**: Bestätigungsdialog
- **Navigation**: Klick → `/projects/:projectId/tasks/:taskId`
- **API**: `DELETE /api/tasks/:taskId`

#### Neue Karte erstellen (`/projects/:projectId/stories/new`)

- **Standard**: Task-Modus (umschaltbar zu User Story via Dropdown oben rechts)
- **Tabs**:
  - **BESCHREIBUNG**: Story-Auswahl (bei Task) + Beschreibungsfeld
  - **DETAILS**: Priorität, Typ, Workload
  - **ASSIGNED**: Platzhalter (noch nicht implementiert)
- **Artwork**: Ändert sich dynamisch je nach gewähltem Typ (Stein-Bilder)
- **API**: `POST /api/projects/:projectId/stories` oder `POST /api/stories/:storyId/tasks`

### 4. Trainer-Profil (`/profile`)

- **Layout**: `CardShell` mit Trainer-Avatar (1–3, deterministisch per User-ID)
- **Hintergrund**: `NEUTRAL` (Steingrau)
- **Infos**: E-Mail, Sicherheitslevel, Mitglied seit
- **Footer**: Statistiken (Projekte/Tasks/XP) + XP-Fortschrittsbalken

### 5. Projekt-Einstellungen (`/projects/:projectId/settings`)

- WIP-Limit Konfiguration für NEXT und DOING Spalten
- `PATCH /api/projects/:projectId/wip-limits`

---

## Backend API-Übersicht

### Auth
| Methode | Route | Beschreibung |
|---------|-------|-------------|
| POST | `/api/auth/login` | Login mit Email+Passwort |
| POST | `/api/auth/register` | Neuen User anlegen |
| POST | `/api/auth/check-email` | Prüft ob Email existiert |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Aktuellen User abrufen |

### Projekte
| Methode | Route | Beschreibung |
|---------|-------|-------------|
| GET | `/api/projects/` | Alle Projekte |
| POST | `/api/projects/` | Neues Projekt |
| GET | `/api/projects/:id` | Projekt nach ID |
| PATCH | `/api/projects/:id/wip-limits` | WIP-Limits ändern |

### Stories
| Methode | Route | Beschreibung |
|---------|-------|-------------|
| GET | `/api/projects/:id/stories` | Stories eines Projekts |
| POST | `/api/projects/:id/stories` | Neue Story |
| DELETE | `/api/stories/:storyId` | Story löschen |
| POST | `/api/stories/:id/pass-test` | Test bestanden |
| POST | `/api/stories/:id/complete` | Story abschließen |

### Tasks
| Methode | Route | Beschreibung |
|---------|-------|-------------|
| GET | `/api/stories/:storyId/tasks` | Tasks einer Story |
| POST | `/api/stories/:storyId/tasks` | Neuer Task |
| DELETE | `/api/tasks/:taskId` | Task löschen |
| POST | `/api/tasks/:taskId/move` | Task verschieben |

### Bugs
| Methode | Route | Beschreibung |
|---------|-------|-------------|
| GET | `/api/projects/:id/bugs` | Bugs eines Projekts |
| POST | `/api/projects/:id/bugs` | Neuer Bug |
| POST | `/api/bugs/:id/close` | Bug schließen |

---

## Datenmodelle (TypeScript)

```typescript
// Story-Status-Lebenszyklus:
// EGG → EVOLVING → READY_FOR_TEST → FINAL_EVOLUTION → DONE
//                                                    ↘ BLOCKED

// Task-Status-Lebenszyklus:
// BACKLOG → NEXT → DOING → TEST → DONE
//                               ↘ BLOCKED

// Task-Typen bestimmen das Artwork:
// FUNCTIONALITY → Donnerstein (thunderstone.png)
// UI_UX         → Feuerstein  (firestone.png)
// STABILITY     → Wasserstein (waterstone.png)
// BUG           → Bug         (bug.png)
```

---

## Bild-Assets (`/public/img/`)

| Datei | Verwendung |
|-------|-----------|
| `egg.png` | Story im Backlog (Status: EGG) |
| `evoli.png` | Story in Arbeit (Status: EVOLVING) |
| `flamara.png`, `aquana.png`, `blitza.png`, `psiana.png`, `nachtara.png`, `glaziola.png`, `folopurba.png` | Fertige Stories (FINAL_EVOLUTION/DONE) |
| `thunderstone.png`, `firestone.png`, `waterstone.png` | Task-Typ-Steine |
| `bug.png` | Bug-Karten |
| `trainer1.png`, `trainer2.png`, `trainer3.png` | Trainer-Profilbilder |

---

## Lösch-Mechanismus (temporär)

Story- und Task-Löschung nutzt aktuell `window`-Callbacks:
- `(window as any).onDeleteStory`
- `(window as any).onDeleteTask`

---

## Noch nicht implementiert

- [ ] **Assigned-Tab im CardEditor**: Trainer einem Task zuweisen
- [ ] **Dynamische Profildaten**: Projekte/Tasks/XP aus der Datenbank
- [ ] **Drag & Drop**: dnd-kit Integration für Task-Verschiebung
- [ ] **Bearbeiten-Funktion**: Stories/Tasks inline editieren
- [ ] **Bug-Management UI**: Bug-Karten auf dem Board anzeigen

---

## Git-Workflow & Konventionen

Um die Stabilität der Live-Umgebung (Render & Vercel) zu gewährleisten, gilt ab sofort:

1. **Keine direkten Commits auf `master`**: Alle Entwicklungen müssen in separaten Feature-Branches erfolgen.
2. **Branching-Modell**: 
   - `feature/...` für neue Funktionen.
   - `fix/...` für Bugfixes.
   - `docs/...` für Dokumentationsänderungen.
3. **Review**: Änderungen werden erst nach erfolgreichem Test in den `master` gemerged.
