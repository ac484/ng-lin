# Profile Slice

Purpose: Reusable account profile UI/logic (view/edit profile) that pages can compose.

Structure
```
profile/
├── components/   # profile widgets (standalone, OnPush, signals)
├── services/     # profile facades consuming account/core repos
├── stores/       # profile-specific signal stores (if needed)
├── models/       # view models for profile UI
└── (README.md, AGENTS.md)
```

Constraints
- No direct Firestore/Firebase SDK usage; go through account/core services.
- Keep routing out; `routes/account/*` owns navigation.
- Avoid tight coupling; expose via local barrel exports when needed.
