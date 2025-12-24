# Features Module Agent Guide

## Title + Scope
Scope: Reusable, non-route feature modules under `src/app/features/` (e.g., module-manager or other cross-blueprint capabilities).

## Purpose / Responsibility
Define boundaries for feature-level building blocks that are more opinionated than `shared/` but not tied to a single page route. Keep modules reusable, blueprint-aware, and lazy-load friendly.

## Hard Rules / Constraints
- NO direct Firebase/Firestore access from components; data flows through services/repositories.
- NO NgModules or `any` types; use standalone components, signals, and `inject()`.
- NO coupling to layout or route-specific concerns; expose public interfaces instead.
- Keep UI pieces reusable; avoid feature logic inside `shared/`.

## Allowed / Expected Content
- Reusable domain-oriented feature modules (services, stores, components) that can be consumed by multiple routes.
- Blueprint-scoped services, guards, and facades that stay independent of specific pages.
- Documentation and tests for the feature modules.

## Structure / Organization
- `src/app/features/<feature>/` with `components/`, `services/`, `stores/`, `models/`, and local README/AGENTS when needed.
- Provide barrel exports for public APIs and keep internal helpers private to each feature folder.

## Integration / Dependencies
- Use Angular DI with `inject()`, signals for state, and Result-pattern async handling.
- Consume repositories from `core/` as needed; do not access Firestore directly from UI.
- Maintain accessibility, OnPush change detection, and modern control-flow syntax.

## Best Practices / Guidelines
- Design for lazy loading and isolation; avoid feature-to-feature imports except via explicit public interfaces.
- Keep services stateless when possible; use signals/stores for local state.
- Validate inputs, prefer batch operations, and respect Firestore Security Rules.

## Related Docs / References
- `../AGENTS.md` (app entry guidance)
- `../core/AGENTS.md`
- `../shared/AGENTS.md`
- `../../../Platform-1.md` (repository root architecture inspiration)

## Metadata
Version: 1.1.0  
Status: Active  
Audience: AI Coding Agents

---
