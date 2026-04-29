# Projekt-Workflow für KI-Agenten

## Git-Regeln (Kritisch)
- **Keine direkten Commits auf `master`**: Alle Änderungen müssen in Feature-Branches entwickelt werden.
- **Branch-Namenskonvention**: `feature/beschreibung`, `fix/beschreibung` oder `docs/beschreibung`.
- **Pull Requests**: Nach Abschluss der Arbeit im Branch einen PR-Simulationsbericht erstellen (oder den User bitten, den Merge durchzuführen).

## Deployment-Hinweise
- **Backend (Render)**: Deployt automatisch bei Push auf `master`.
- **Frontend (Vercel)**: Deployt automatisch bei Push auf `master`.
- **Wichtig**: Da Commits auf `master` direkt das Live-System beeinflussen, ist die Einhaltung der Branch-Regel essenziell für die Stabilität.

## Dokumentation
- Änderungen an der Architektur oder neuen Features müssen immer in `docs/PROJEKT_DOKUMENTATION.md` nachgeführt werden.
- Bugs und Sicherheitsrisiken werden in `docs/TODO.md` dokumentiert.
