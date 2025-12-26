# Firebase Integration Map

This page pinpoints where Firebase configuration, models, and helpers live in the repository.

## App Code (`src/app/firebase/`)
- **config/** — `firebase.config.ts`, `firebase.providers.ts` for initialization and DI wiring.
- **guards/** — `auth.guard.ts` for route protection.
- **infra/** — `firebase-auth.service.ts` for authentication helpers.
- **models/** — `firebase-user.model.ts`, `firestore-base.model.ts` base shapes used by repositories.
- **utils/** — `firestore-converter.util.ts`, `timestamp.util.ts` shared helpers.
- **constants/** — `collection-names.const.ts` centralizes Firestore collection keys.
- **README & AGENTS** — local guidance for Firebase-specific agents and usage.

## Firebase Project Config (`src/firebase/`)
- `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `firebase.json` — security rules, indexes, and project config shipped with the repo.

## Usage Notes
- Services and repositories inject @angular/fire primitives directly (Firestore/Auth/Storage) using providers above; no wrapper services are introduced.
- When adding new Firebase features, colocate helpers under `src/app/firebase/` and update collection constants to avoid drift.
