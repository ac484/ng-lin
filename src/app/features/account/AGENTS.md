# Account Feature Module Agent Guide

## Title + Scope
Scope: Account feature building blocks under `src/app/features/account/`, reused across routes without embedding page-specific logic.

## Purpose / Responsibility
- Provide reusable account domain capabilities (profile, dashboard, settings) for routes to compose.
- Keep UI pieces reusable; delegate data access to services that rely on `core` repositories.
- Maintain separation of concerns to avoid tight coupling with layout or routing.

## Hard Rules / Constraints
- NO direct Firestore/@angular/fire usage in components; go through injected services that wrap `core` repositories.
- NO NgModules or `any` types; use standalone components, signals, and `inject()`.
- NO cross-feature coupling; expose public APIs via local barrel exports (`index.ts`) when needed.
- Avoid shared-level UI drift: generic UI belongs in `shared/`, not here.

## Structure / Organization
- `components/` reusable account UI pieces (standalone, OnPush, signals).
- `services/` account domain services/facades consuming `core` repositories.
- `stores/` signal-based state where local state is required.
- `models/` account-specific types (domain models stay in `core/models`).
- `profile/`, `dashboard/`, `settings/` folders for vertical slices; keep README/AGENTS locally if they grow.

## Integration / Dependencies
- Consume data via `core` repositories/services; do not access Firestore directly.
- Use signals for state; use Result-pattern async handling and `takeUntilDestroyed()` for observables.
- Keep routing concerns in `routes/account/*`; this feature module should remain route-agnostic.

## Best Practices / Guidelines
- Keep components small and single-purpose; favor composition.
- Validate inputs and respect Firestore Security Rules via repository layer.
- Design for lazy loading; avoid side effects in module entry points.
- Maintain accessibility (a11y) and use modern Angular control flow.

## Related Docs / References
- `../AGENTS.md` (features root)
- `../../AGENTS.md` (app entry)
- `../../core/AGENTS.md`
- `../../shared/AGENTS.md`
- `../../../Platform-1.md` (reference architecture)

## Metadata
Version: 1.1.0  
Status: Active  
Audience: AI Coding Agents

---
