# Dashboard Slice

Purpose: Reusable account dashboard widgets/logic (summary, activity, quick links) for pages to compose.

Structure
```
dashboard/
├── components/   # widgets (standalone, OnPush, signals)
├── services/     # dashboard facades using account/core repos
├── stores/       # signal stores if required
├── models/       # view models for dashboard UI
└── (README.md, AGENTS.md)
```

Constraints
- No direct Firebase SDK usage; rely on injected services wrapping core repositories.
- Keep routing separate; dashboard pages live in `routes/account/*`.
- Avoid tight coupling; expose via barrel exports when needed.
