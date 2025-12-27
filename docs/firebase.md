# Firebase Scaffold Snapshot

All Firebase-specific wiring lives in `src/app/firebase` so features can inject @angular/fire services without re-initializing SDKs.

## Current layout
- `config/` — `firebase.config.ts`, `firebase.providers.ts` for app-wide providers used from `app.config.ts`.
- `constants/` — shared constants such as collection names.
- `guards/` — route guards built on Firebase Auth.
- `models/` — Firebase-facing models (`firebase-user`, `firestore-base`).
- `utils/` — helpers like Firestore converters and timestamp utilities.
- `README.md` — folder-level guidance.

## Usage notes
- Keep initialization in DI providers; avoid calling `initializeApp`/`getAuth` directly inside features.
- Share converters/helpers from this folder instead of duplicating per feature.
- If you add new Firebase helpers, update this file and `src/app/firebase/README.md` to keep the scaffold accurate.
