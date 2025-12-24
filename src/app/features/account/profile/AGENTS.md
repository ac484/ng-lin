# Account Profile Agent Guide

## Scope
Profile slice under `features/account/profile/`; reusable profile UI/logic without page routing.

## Rules
- No direct Firebase SDK; consume `core` repositories via injected services/facades.
- Standalone components, signals, `inject()`, OnPush; avoid NgModules/`any`.
- Keep UI reusable; route concerns stay in `routes/account/*`.

## Structure
- `components/` profile UI pieces
- `services/` profile-specific facades using account/core repos
- `stores/` signal state if needed
- `models/` profile view models (domain models remain in core)

## References
- `../AGENTS.md`
- `../../AGENTS.md`
- `../../../Platform-1.md`

Version: 1.1.0 | Status: Active
