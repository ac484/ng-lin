# Account Dashboard Agent Guide

Scope: Dashboard slice under `features/account/dashboard/`; reusable dashboard widgets/logic.

Rules
- No direct Firebase SDK; use account/core services and repositories.
- Standalone components, signals, `inject()`, OnPush; avoid NgModules/`any`.
- Keep decoupled from routing; pages orchestrate data loading.

Structure
- `components/` dashboard widgets
- `services/` dashboard facades consuming account/core data
- `stores/` dashboard state (signals)
- `models/` dashboard view models

References
- `../AGENTS.md`
- `../../AGENTS.md`
- `../../../Platform-1.md`

Version: 1.1.0 | Status: Active
