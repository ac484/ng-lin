# Features – AGENTS

> **📍 Location**: `src/app/features/` – Feature Layer
> **👆 Parent**: [`../AGENTS.md`](../AGENTS.md) – App root
> **🔍 Quick Tip**: Each folder under `features/` represents a business module (user, product, order, etc.).

---

## 1️⃣ Scope

Feature layer contains **business-specific modules and flows**.
**Contents**:

* UI components (Angular components, pages)
* Feature-specific services (business logic)
* Feature-specific repositories (Firestore, REST API)
* Stores / state management (NgRx, Akita, etc.)
* Feature-specific validators, error handling

> **Note**: Should **not** include platform-wide core services (auth, logging, global guards).

---

## 2️⃣ Purpose

Enable implementation of **business logic and user-facing features** while reusing platform capabilities from `core/`.

**Examples**:

* User module: login, profile, settings
* Product module: catalog, inventory, product details
* Order module: checkout, order history
* Feature-specific Firestore repositories via `@angular/fire`
* Feature-specific services and facades

---

## 3️⃣ Constraints (Must NOT)

* ❌ Include cross-domain platform infrastructure (auth chain, global guards, logging, core services)
* ❌ Import from other features directly unless explicitly shared via a facade/port
* ❌ Put core-only repositories (shared auth or global data access) in feature modules
* ❌ Use `core/`-only DI patterns incorrectly (constructor vs `inject()` rules depend on Core)

---

## 4️⃣ Allowed Content

* ✅ Feature-specific UI (components, pages)
* ✅ Feature services (business logic, facades, stores)
* ✅ Feature repositories (Firestore, REST API)
* ✅ Feature-specific validators, domain errors
* ✅ State management (NgRx store, Akita store, or feature stores)
* ✅ Feature-level guards or interceptors **only if tied to the module**

---

## 5️⃣ Structure

```
features/
1```

---

## 6️⃣ Dependencies

* **Depends on**: `core/*` (platform services, auth chain, logging, guards)
* **Used by**: UI routes, pages, and other features via facades / ports

> **Tip**: Features should **not depend on other features directly**; use shared services or facades.

---

## 7️⃣ Key Rules

1. **Dependency direction**

   * Features → Core (allowed)
   * Core → Features (prohibited)
2. **Repository pattern**

   * Feature repositories contain Firestore or API access
   * Core repositories only contain cross-domain/global access
3. **UI separation**

   * All UI lives in features (components/pages)
   * Core contains no UI elements
4. **Async & Error Handling**

   * Use Result pattern, explicit error types per feature
5. **State management**

   * Feature stores manage feature-specific state
   * Core services manage global state only if truly cross-domain

---

## 8️⃣ Related

* `../core/AGENTS.md` – Core infrastructure reference
* `../routes/AGENTS.md` – Route integration and guards
* `../layout/AGENTS.md` – Layout and UI composition

---

**Version**: 1.0.0 | **Updated**: 2025-12-27 | **Status**: Active

---
