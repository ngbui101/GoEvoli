# Architecture.md

## 1. Ziel der Architektur

Diese Anwendung ist ein webbasiertes Kanban-System im Evoli-inspirierten Kartenstil. Ziel ist es, User Stories, Tasks, Subtasks und Bugs visuell darzustellen und deren Entwicklungszustand nachvollziehbar abzubilden.

Die Anwendung unterstützt mehrere Projekte, rollenbasierte Rechte, ein responsives Frontend sowie eine REST-basierte Backend-Kommunikation.

---

## 2. Techstack

### Frontend

- React
- TypeScript
- React Router
- Zustand oder Redux Toolkit für State Management
- React Query oder TanStack Query für API-Kommunikation
- CSS Modules, Tailwind CSS oder vergleichbare Styling-Lösung
- Responsive Design für Desktop, Tablet und Mobile

### Backend

- Go
- REST API
- Gin, Fiber oder Echo als Webframework
- JWT-basierte Authentifizierung
- Middleware für Authentifizierung und Autorisierung
- Strukturierte Validierung von Requests
- Logging und Fehlerbehandlung

### Datenbank

- MongoDB
- Dokumentenorientiertes Datenmodell
- Collections für User, Projects, Roles, Permissions, UserStories, Tasks, Bugs, Comments und ActivityLogs

---

## 3. Systemübersicht

Die Anwendung besteht aus drei Hauptschichten:

```text
Client Browser
    |
    | HTTPS / REST
    |
React Frontend
    |
    | REST API Calls
    |
Go Backend
    |
    | MongoDB Driver
    |
MongoDB Database