# Despliegue

Este código vive en dos lugares distintos, y es fácil confundirlos:

- **Acá** (`migration/frontend` en el repo `jventas`) es donde se desarrolla. Historial completo, worktree compartido con el resto del proyecto original.
- **`https://github.com/ferd9/jventas-frontend`** es una copia estandalone, con su propio historial limpio (sin el proyecto Swing original de 2021 que arrastra este repo), pensada solo para desplegar. Un GitHub Action ahí dispara el deploy a Firebase Hosting en cada push a `main`.

## Cómo publicar un cambio

1. Comitear acá primero (`git add frontend/... && git commit`) — el paso siguiente exporta el último *commit*, no el working tree.
2. Exportar el snapshot limpio, **desde adentro de esta carpeta** (`D:/fun/jventas/frontend`, no desde el nivel de arriba):
   ```bash
   git archive migration/frontend | tar -x -C /ruta/a/jventas-frontend-repo
   ```
   Si se corre desde el nivel de arriba (`D:/fun/jventas`), `git archive` deja de quedar scopeado a esta subcarpeta y vuelca el árbol completo del worktree — incluyendo los archivos del proyecto Swing original de 2021 (`Desert.jpg`, `Thumbs.db`, `nbproject/`, `.java` viejos) mezclados dentro de `src/`. Si pasa, todo lo que agrega queda sin trackear en el repo de destino (`git status --porcelain` muestra `??`) y se puede borrar sin riesgo antes de reintentar bien.
3. En `jventas-frontend-repo`: `git add` de los archivos que cambiaron, commit, `git push origin main` — dispara el deploy automático. (`.firebase/` y `.firebaserc` quedan siempre sin trackear a propósito, son artefactos locales del CLI de Firebase.)

## Infraestructura

- **Firebase Hosting**, mismo proyecto GCP (`jventas-app`) — `https://jventas-app.web.app`. `firebase.json` tiene un *rewrite* que manda `/api/**` al servicio de Cloud Run `jventas-backend` (mismo origen para el navegador, sin CORS).
- **CI/CD**: autenticación sin claves vía Workload Identity Federation, misma cuenta de servicio que el backend (`github-actions-deployer@jventas-app.iam.gserviceaccount.com`).
- El presupuesto de bundle inicial en `angular.json` está en `1MB`/`1.5MB` (warning/error), subido desde el default de Angular CLI (`500kB`/`1MB`) porque ng-zorro-antd por sí solo ya lo supera.

## Gotcha de `gcloud`/`firebase` en Windows

`gcloud`/`firebase` en Windows son en realidad `.cmd` (scripts por lotes) — comas sin comillas en un valor de flag se tratan como separadores de argumento. En el workflow de CI, `npx firebase deploy` falla con "could not determine executable to run" si no se instala `firebase-tools` explícito antes (`npm install -g firebase-tools`) — `npx` no puede auto-instalar en modo no interactivo.
