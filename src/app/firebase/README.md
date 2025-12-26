# Firebase Infrastructure (Scaffold)

This folder centralizes @angular/fire setup for the app to avoid direct Firebase SDK usage in services/components.

## Structure
- `config/`: Firebase app options and provider wiring (use in `app.config.ts`).
- `models/`: Shared Firebase-facing data contracts.
- `guards/`: Route guards built on @angular/fire auth.
- `utils/`: Pure helpers for converters and timestamps.
- `constants/`: Centralized collection names.
- `infra/`: Reusable Firebase service facades (e.g., auth).

## Gap Summary
See [`GAP_ANALYSIS.md`](./GAP_ANALYSIS.md) for full details. Highest-priority gaps:
- Auth guard is a stub; needs authState + redirect + optional claim-based checks.
- No shared Firestore repository/converter pattern with Result-style error handling.
- App Check/Functions/Storage/Messaging facades are missing, despite providers being registered.

## TODO
- Implement auth guard with `inject(Auth)` and Result pattern for errors.
- Implement Firestore converters that stay decoupled from feature/domain logic.
- Keep all initialization in DI; never call `initializeApp`/`getAuth` directly inside services.
