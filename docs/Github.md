# Source Layout Overview

Concise snapshot of the application source tree to help readers find the right code and accompanying docs. Refer to each folder’s README for deeper guidance.

## Core (`src/app/core`)
- `auth/` — Firebase-auth backed facade/state.
- `event-bus/` — in-memory event bus interfaces, implementations, and examples.
- `audit/` — audit collectors, events, and integrations.
- `net/` — HTTP helpers/interceptors.
- `i18n/` — translation service.
- `startup/` — startup wiring.
- `start-page.guard.ts` — guard for landing flows.

## Firebase scaffolding (`src/app/firebase`)
- `config/`, `constants/`, `guards/`, `models/`, `utils/` — shared Firebase wiring; see `src/app/firebase/README.md` for usage.

## Feature & layout shells
- `layout/` — application shell and widgets.
- `features/` — feature routes and components.

## Conventions
- Standalone components with `inject()` and Angular signals.
- Three-layer flow: UI → Service/Facade → Repository/Infra as described in `docs/README.md`.
