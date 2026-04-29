# GoEvoli

GoEvoli ist ein agiles Kanban-Board speziell entwickelt für die Verwaltung von Pokémon-Entwicklungsstufen und Aufgaben, inspiriert durch moderne Scrum- und Kanban-Prinzipien. Das Projekt demonstriert eine Full-Stack-Architektur mit Go, React, Vite und MongoDB.

## Technologie-Stack

- **Backend:** Go (Golang), Chi Router, MongoDB Go Driver
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, dnd-kit
- **Datenbank:** MongoDB
- **Styling:** Tailwind CSS (keine zusätzlichen UI-Bibliotheken)
- **Authentifizierung:** JWT über httpOnly Cookies, bcrypt Passwort-Hashing

## Voraussetzungen

Stelle sicher, dass folgende Software auf deinem System installiert ist:
- **Go** (Version 1.20+)
- **Node.js** (Version 18+)
- **MongoDB** (Lokal oder als Atlas-Cluster)
- **Docker** & **Docker Compose** (optional, für Container-Deployment)

## Installation & Start

1. **Repository klonen**
   *(Repository muss lokal vorliegen)*

2. **Umgebungsvariablen konfigurieren**
   Kopiere die Datei `.env.example` und benenne sie in `.env` um.
   Trage deinen `MONGO_URI` Connection-String ein.
   ```bash
   cp .env.example .env
   ```

3. **Backend & Seed-Daten starten**
   ```bash
   cd backend
   go run ./cmd/seed  # Erstellt Demo-Projekt und Benutzer
   go run ./cmd/server
   ```
   *Das Backend läuft nun unter `http://localhost:8080`*

4. **Frontend starten**
   ```bash
   cd frontend
   npm install
   npm run build
   npm run dev
   ```
   *Das Frontend ist erreichbar unter `http://localhost:5173`*

5. **Alternativ: Docker Compose**
   ```bash
   docker compose up -d
   ```

## Seed-Benutzer

Beim Ausführen des Seed-Scripts werden folgende Benutzer erstellt. Das Passwort für alle lautet **`password123`**:
- `admin@example.com` (Admin / Product Owner im Demo Projekt)
- `po@example.com` (Product Owner)
- `scrum@example.com` (Scrum Master)
- `dev@example.com` (Developer)
- `tester@example.com` (Tester)
- `viewer@example.com` (Viewer)

## Bekannte Einschränkungen & Roadmap
- **WebSocket Echtzeit-Updates:** Derzeit nicht implementiert. Das Frontend nutzt optimistisches Rendering und Refetching.
- **Benutzerprofil-Ansicht:** Keine separate Ansicht zum Bearbeiten von Nutzerdaten.
- **Projektverwaltung:** Projekte können über API, aber derzeit nur grundlegend über das UI erstellt werden.
- **Subtask UI:** Subtasks werden in der Backend-API unterstützt (inkl. `required` Validierungen), haben aber noch kein dediziertes UI-Formular in der Story-Detailansicht.
- **Auth Token Expiration:** Token-Refresh-Logik muss noch nachgerüstet werden.
