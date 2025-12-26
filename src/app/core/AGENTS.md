# Core – AGENTS

> **📍 Location**: `src/app/core/` – Infrastructure Layer
> **👆 Parent**: [`../AGENTS.md`](../AGENTS.md) – App root
> **🔍 Quick Tip**: Working in `core/blueprint/` or `core/net/`? Read their AGENTS.md first.

---

## 1️⃣ Scope

Platform infrastructure layer (`src/app/core/`).
**Contents**:

* Authentication & authorization
* Data access (cross-domain only)
* Interceptors, guards
* Startup & initialization
* Shared constants, models, types
* Logging, validation, permission services

> **Note**: No feature-specific UI or business flows should reside here.

---

## 2️⃣ Purpose

Provide **platform-level capabilities** that features consume via facades or ports.
Keep **infrastructure** separate from **business features**.

**Examples**:

* Auth chain (`auth.facade.ts`, `auth.port.ts`, `infra/firebase-auth.service.ts`)
* Global guards (`authGuard`, `permissionGuard`)
* Network interceptors and utilities
* Shared logging, validation, and permission services
* Cross-domain models, constants, and error types

---

## 3️⃣ Constraints (Must NOT)

* ❌ Include feature-specific UI, flows, or state
* ❌ Import anything from `features/*` (one-way dependency only)
* ❌ Access `DA_SERVICE_TOKEN` outside the auth chain (only inside `auth.facade.ts` / `auth.port.ts`)
* ❌ Put feature Firestore repositories here (belongs in `features/`)
* ❌ Use constructor injection (use `inject()` instead)

---

## 4️⃣ Allowed Content

* ✅ Auth chain (`auth.facade.ts`, `auth.port.ts`, `infra/firebase-auth.service.ts`)
* ✅ Guards (route guards like `authGuard`, `permissionGuard`, `moduleEnabledGuard`)
* ✅ Interceptors (HTTP, error handling)
* ✅ Startup services / initialization logic
* ✅ Logging, validation, permission services
* ✅ Shared repositories (**only if truly cross-domain**, usable by multiple features)
* ✅ Cross-domain errors, constants, and models
* ✅ Domain-only logic (context, events, validators, error types)

---

## 5️⃣ Structure

```
core/
├── auth/                     # Auth chain (Firebase → @delon/auth)
├── guards/                   # Route guards
├── interceptors/             # HTTP interceptors
├── net/                      # Network utilities
├── startup/                  # App initialization
├── services/                 # Platform services (logging, validation, permission)
├── blueprint/                # Blueprint domain only (no data layer)
├── models/                   # Shared domain models
└── errors/                   # Shared error types
```

---

## 6️⃣ Dependencies

* **Depends on**: `@angular/fire`, `@delon/auth`, Angular DI (for platform services)
* **Used by**: `features/*`, `routes/*`, `layout/*`

> **Tip**: Pure domain modules (models, errors) do **not** require Angular.

---

## 7️⃣ Key Rules

1. **Core vs Features**

   * **Core**: Cross-domain reusable modules, global singletons, auth/authorization, network, logging, configuration, pure domain rules
   * **Features**: Business flows + UI (routes/components/stores/services), feature-specific Firestore repositories
2. **Layering**
   UI → Service / Facade → Repository (Firestore only in features’ repositories)
3. **Auth Chain Flow**
   `@angular/fire/auth` → `@delon/auth` → `DA_SERVICE_TOKEN`
4. **No feature data in core**
   Blueprint / Account Firestore repositories belong in `features/`
5. **Async & Error Handling**
   Use Result pattern, explicit error types
6. **Dependency Injection**
   Use `inject()` exclusively, avoid constructor injection

---

## 8️⃣ Related

* `../features/AGENTS.md` – When to use features
* `../routes/AGENTS.md` – Route guards integration
* `blueprint/AGENTS.md` – Blueprint domain vs data layer
* `net/AGENTS.md` – Network utilities

---

**Version**: 1.2.1 | **Updated**: 2025-12-27 | **Status**: Active

---
