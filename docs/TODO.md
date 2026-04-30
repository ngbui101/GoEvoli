# TO-DO

## Features

- [ ] Task assignment (Assigned tab)
- [ ] WebSocket integration
- [ ] Drag & Drop
- [ ] Inline editing
- [ ] Bug management UI
- [ ] Mobile-optimierte Board-Ansicht fuer Touch-Nutzung

## Bugs

- [ ] **Projektuebersicht zeigt nach Login zunaechst nur Platzhalter**  
  Live-QA 2026-04-30: Nach erfolgreichem Login auf `https://go-evoli.vercel.app` zeigt `/projects` zuerst drei grosse leere Platzhalterkarten. Es gibt keinen erklaerenden Lade-, Empty- oder Fehlerzustand. Nach Navigation zu "Neues Projekt" und Abbrechen erscheint das Demo-Projekt ploetzlich.  
  Severity: Mittel. `blocksWork = false`.

- [ ] **Board Loading Hang / sehr langer Board-Ladevorgang**  
  Live-QA 2026-04-30 bestaetigt: Beim Oeffnen des Demo-Projekts bleibt die Ansicht lange bei "LADE SPIELFELD...". In einem Test war das Board erst nach ca. 30 Sekunden sichtbar. Bereits vorher war bekannt, dass das Board nach Refresh oder Navigation von Settings/Profil haengen kann.  
  Severity: Mittel bis Hoch. `blocksWork = teilweise`.

- [x] **Mobile Board Header schneidet Titel und Untertitel ab**
  Live-QA 2026-04-30: Auf einem mobilen Viewport ca. 390x844 werden Projektname und Untertitel im Board-Header stark gekuerzt, z.B. "POKE..." und "A...". Der Kontext geht verloren.  
  Behoben 2026-04-30: PageHeader stapelt Header-Inhalt auf Mobile und erlaubt Titel/Untertitel bis zu zwei Zeilen.
  Severity: Niedrig bis Mittel. `blocksWork = false`.

- [ ] **Mobile Board-Karten sind schwer nutzbar**  
  Live-QA 2026-04-30: Auf Mobile wirken Spalten und Trading Cards sehr eng. Karten ueberlagern bzw. verdecken sich optisch, rechte Spalten sind nur angeschnitten sichtbar, und es ist unklar, ob Nutzer ziehen, horizontal scrollen oder klicken sollen.  
  Severity: Mittel. `blocksWork = false`.

- [ ] **Login-Instabilitaet / Auth-Session Fehler**  
  Aelterer Befund: Der erste Login-Versuch mit korrekten Daten schlaegt gelegentlich mit "Access Denied" fehl oder zeigt faelschlicherweise eine E-Mail-Validierungsmeldung. Live-QA 2026-04-30: Login mit Testaccount funktionierte, aber beim ausgeloggten Start ist ein erwartbarer `401` auf `/api/auth/me` sichtbar. Weitere Session-Stabilitaet sollte nach Deployment-Aenderungen erneut getestet werden.

- [x] **WIP-Limit Visualisierung**
  Die Spalte "DOING" faerbt sich bereits rot, wenn das Limit genau erreicht ist, z.B. `2/2`. Ueblicherweise signalisiert Rot eine Ueberschreitung des Limits, nicht nur das Erreichen.
  Behoben 2026-04-30: WIP-Warnung wird erst bei `count > limit` angezeigt.

- [ ] **Projekt-Erstellung vollstaendig erneut testen**  
  Aelterer Befund: Im "Neues Projekt" Modal blieb der "Projekt Erstellen" Button permanent deaktiviert. Live-QA 2026-04-30: Der Button ist mit leerem Projektnamen deaktiviert, was korrekt ist. Ein echtes Speichern wurde bewusst nicht ausgefuehrt, um keine Live-Daten zu erzeugen. Bitte mit dediziertem QA-Projekt erneut pruefen.

- [ ] **Registrierung / Account-Erstellung UX pruefen**  
  Aelterer Befund: `/register` leitet auf `/login` um. Die Login-Seite besitzt jedoch einen Auto-Register-Modus nach E-Mail-Pruefung. Registrierung sollte explizit getestet werden, inklusive Fehlermeldungen, Passwortanforderungen und sichtbarer Nutzerfuehrung.

- [ ] **Board-Suche Ergebnisdarstellung verbessern**  
  Live-QA 2026-04-30: Suche nach `particle` filtert grundsaetzlich. Story-Karten bleiben sichtbar, wenn darunter passende Tasks liegen. Das ist funktional nachvollziehbar, aber visuell nicht eindeutig erklaert.

- [x] **Profil-Statistiken wirken statisch**
  Live-QA 2026-04-30: Profilseite zeigt Projekte/Tasks/XP als feste Werte wirkend. Falls die Werte dynamisch sein sollen, sollte klar sein, wann sie aktualisiert werden. Falls sie Platzhalter sind, sollte das nicht wie echte Produktmetrik wirken.
  Behoben 2026-04-30: Profilwerte werden aus Projekten, Stories und Tasks geladen; XP wird aus erledigtem Workload abgeleitet.


## Cyber Security

- [ ] **Fehlendes Rate Limiting**  
  Die API, insbesondere `/api/auth/login`, hat keinen Schutz gegen Brute-Force-Angriffe.

- [ ] **CSRF-Schutz**  
  Es gibt keine explizite CSRF-Middleware. Obwohl `SameSite=Lax` Cookies verwendet werden, ist ein zusaetzlicher Schutz, z.B. CSRF-Tokens, fuer eine produktive Cloud-Umgebung empfohlen.

- [ ] **Informationspreisgabe durch verbose Fehler**  
  Einige API-Endpoints geben interne Fehlermeldungen direkt an den Client weiter, z.B. `err.Error()`. Das kann Details ueber interne Strukturen verraten.

- [ ] **Veraltete Abhaengigkeiten**  
  `npm audit` meldet moderate Sicherheitsluecken in `esbuild`/`vite` (Dev-Dependencies).

- [ ] **Fehlende Security Headers**  
  Standard-Header wie `Content-Security-Policy`, `X-Content-Type-Options` oder `X-Frame-Options` werden vom Backend nicht explizit gesetzt.

