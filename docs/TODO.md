# TO-DO

## Features
- [ ] Task assignment (Assigned tab)
- [ ] WebSocket integration
- [ ] Drag & Drop
- [ ] Inline editing
- [ ] Bug management UI

## Bug
- [ ] **CORS Port Sensitivity**: Der Backend-Server erlaubt nur `localhost:5173` und `localhost:5178`. Wenn das Frontend auf einem anderen Port (z.B. 5174) startet, schlagen API-Anfragen fehl.
- [ ] **Board Loading Hang**: Das Board bleibt nach einem Page-Refresh oder nach der Navigation von den Einstellungen/Profil oft bei "Lade Spielfeld..." hängen. Ein manueller Reload ist erforderlich.
- [ ] **Fehlende Move-Buttons**: Laut Dokumentation sollen Tasks via Buttons verschiebbar sein. Diese Buttons sind weder auf der Karte noch in der Task-Detail-Ansicht auffindbar. Drag & Drop ist ebenfalls noch nicht aktiv.
- [ ] **Login-Instabilität**: Der erste Login-Versuch mit korrekten Daten schlägt gelegentlich mit "Access Denied" fehl. Zudem wird oft fälschlicherweise "Bitte geben Sie eine gültige E-Mail-Adresse ein" angezeigt, obwohl das Format korrekt ist.
- [ ] **WIP-Limit Visualisierung**: Die Spalte "DOING" färbt sich bereits rot, wenn das Limit genau erreicht ist (z.B. 2/2). Üblicherweise signalisiert Rot eine Überschreitung des Limits.
- [ ] **Projekt-Erstellung defekt**: Im "Neues Projekt" Modal bleibt der "Projekt Erstellen" Button permanent deaktiviert. Ein Senden des Formulars ist somit über die UI nicht möglich.
- [ ] **Registrierung blockiert**: Die Route `/register` leitet automatisch auf `/login` um. Es gibt keine sichtbare oder funktionale Möglichkeit, einen neuen Account über die Oberfläche zu erstellen.
- [ ] **Auth-Session Fehler**: Trotz Login treten sporadisch `401 Unauthorized` Fehler bei API-Anfragen (z.B. `/api/auth/me`) auf, was auf Probleme bei der Cookie-Handhabung oder Session-Validierung hindeutet.

## Cyber Security
- [ ] **Fehlendes Rate Limiting**: Die API (insbesondere `/api/auth/login`) hat keinen Schutz gegen Brute-Force-Angriffe.
- [ ] **CSRF-Schutz**: Es gibt keine explizite CSRF-Middleware. Obwohl `SameSite=Lax` Cookies verwendet werden, ist ein zusätzlicher Schutz (z.B. CSRF-Tokens) für eine produktive Cloud-Umgebung empfohlen.
- [ ] **Informationspreisgabe (Verbose Errors)**: Einige API-Endpoints geben interne Fehlermeldungen direkt an den Client weiter (z.B. `err.Error()`), was Details über die Datenbankstruktur verraten könnte.
- [ ] **Veraltete Abhängigkeiten**: `npm audit` meldet moderate Sicherheitslücken in `esbuild`/`vite` (Dev-Dependencies).
- [ ] **Fehlende Security Headers**: Standard-Header wie `Content-Security-Policy` (CSP), `X-Content-Type-Options` oder `X-Frame-Options` werden vom Backend nicht explizit gesetzt.
