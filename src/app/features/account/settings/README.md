# Settings Slice

Purpose: Reusable account settings UI/logic (preferences, security, notifications) for composition in account routes.

Structure
```
settings/
├── components/   # settings UI (standalone, OnPush, signals)
├── services/     # settings facades wrapping account/core repos
├── stores/       # signal stores when needed
├── models/       # view models for settings UI
└── (README.md, AGENTS.md)
```

Constraints
- No direct Firebase SDK usage; rely on injected services that use core repositories.
- Keep routing concerns in `routes/account/*`.
- Avoid tight coupling; expose via barrel exports as needed.
