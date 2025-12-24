# Account Settings Agent Guide

Scope: Settings slice under `features/account/settings/`; reusable settings UI/logic.

Rules
- No direct Firebase SDK; use account/core services and repositories.
- Standalone components, signals, `inject()`, OnPush; avoid NgModules/`any`.
- Keep routing out; settings pages belong to `routes/account/*`.

Structure
- `components/` settings UI elements
- `services/` settings facades consuming account/core data
- `stores/` signal state (if needed)
- `models/` view models for settings UI

References
- `../AGENTS.md`
- `../../AGENTS.md`
- `../../../Platform-1.md`

Version: 1.1.0 | Status: Active
