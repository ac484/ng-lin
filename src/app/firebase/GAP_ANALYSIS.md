# Firebase Base Layer Gap Analysis

This document captures the current coverage and missing pieces of the @angular/fire foundation so feature teams can wire Firebase services with minimal effort.

## Scope
- Files reviewed: `config/`, `constants/`, `guards/`, `infra/`, `models/`, `utils/` under `src/app/firebase`.
- Goal: Identify gaps that block simple, consistent usage of Firebase across the app.

## Current Coverage
- **Config:** App options, App Check, analytics, auth, Firestore (with local cache), database, functions (hardcoded to asia-east1), messaging, performance, storage, remote config, Vertex AI providers.
- **Infra:** `FirebaseAuthService` exposes sign-in/up/out, password reset, auth state signal via `AuthState`, and Delon token sync.
- **Models/Utils:** Minimal user and base model interfaces, timestamp helper, and generic Firestore converter builder.
- **Constants/Guards:** Centralized collection names and a placeholder auth guard.

## Identified Gaps (prioritized)
1. **Route protection not implemented (P0):** `firebaseAuthGuard` is a stub; lacks authState check, redirect handling, or custom-claim/role guards.
2. **No shared Firestore data access pattern (P0):** Only a generic converter exists; there is no base repository, typed converters, or Result-pattern error handling to standardize CRUD and multi-tenant constraints.
3. **App Check and token surfacing (P1):** Providers enable App Check but there is no helper to expose the token or enforce verification on callable functions/storage requests.
4. **Functions/Storage/Messaging facades (P1):** Providers are registered but there are no lightweight services for common operations (callable functions with region, signed uploads/downloads, topic/FCM token management) to hide SDK details from features.
5. **Analytics/Performance ergonomics (P2):** Tracking services are registered yet no wrapper utilities exist for event logging, screen views, traces, or error correlation.
6. **Timestamp and converter consistency (P2):** `toDateOrNull` and `buildConverter` are unused; there is no shared mapping for server timestamps, soft-delete fields, or audit metadata on reads/writes.
7. **Collection name safety (P3):** `COLLECTION_NAMES` covers only a subset of domain collections and offers no builder/helpers for subcollections or multi-tenant path composition.
8. **Testing and samples (P3):** No unit tests or usage examples showing how to consume the Firebase base layer, making adoption harder.

## Recommended Next Steps
- Implement an auth guard using `authState(auth)` + Router tree redirects; add optional claim-based pipes for admin/owner checks.
- Introduce a Firestore base repository pattern (with typed converters, soft-delete, timestamps, retries, and Result return type) and share it across features.
- Add thin facades for Functions, Storage, and Messaging that encapsulate region, App Check, error mapping, and retry/backoff.
- Provide analytics/performance helpers (trace wrappers, event logger) to keep UI code free of SDK calls.
- Standardize converters and timestamp helpers; add utilities for path composition using `COLLECTION_NAMES`.
- Supply minimal unit tests and a short cookbook snippet in `README.md` to demonstrate intended usage.
