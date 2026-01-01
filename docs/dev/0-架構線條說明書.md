
---

# 一、總體分層線條（先看這張）

```text
┌────────────────────────────────────┐
│            UI / Pages               │
│  (ui-composition / shared UI)       │
└───────────────▲────────────────────┘
                │ orchestration only
┌───────────────┴────────────────────┐
│            Features                 │
│  ├─ domains (BC, 真實業務)           │
│  ├─ processes (Saga / Workflow)     │
│  ├─ capabilities (平台能力)         │
│  └─ contracts (Feature Boundary)    │
└───────────────▲────────────────────┘
                │ depends-on
┌───────────────┴────────────────────┐
│               Core                  │
│  policy / contract / authz / error  │
│  result / events / audit / identity │
└───────────────▲────────────────────┘
                │ implements
┌───────────────┴────────────────────┐
│         Infrastructure / Adapter    │
│   firebase / supabase / external    │
└────────────────────────────────────┘
```

**唯一允許的依賴方向：**

```
UI → Feature → Core → Infrastructure (實作)
Infrastructure ──implements──▶ Core Interface
```

❌ **任何反向都是架構違規**

---

# 二、Core：治理中樞（不可被 Feature 污染）

> **目標對齊**
>
> * Boundary 可證明
> * Contract 可約束
> * Policy 集中治理

---

## 1️⃣ `core/policy` ——「唯一決策中心」

**線條定位**

```text
Feature / Process
      │
      ▼
Policy Engine  ──► Result / Violation
```

**硬規則**

* ❌ Feature 不得自行判斷「可不可以」
* ❌ 不准在 domain entity 裡寫 if (role === …)
* ✅ 所有「允不允許」→ `policy-engine`

**一句話定義**

> **Policy 是法律，不是建議**

---

## 2️⃣ `core/contract` ——「跨邊界穩定真理」

**負責什麼**

* DTO 結構
* Event schema
* 版本相容性

**線條**

```text
Feature A ──uses──▶ contract ◀──uses── Feature B
```

❌ Feature 之間 **不得** 直接 import 對方 domain model
✅ 只能透過 contract

---

## 3️⃣ `core/error` + `core/result`

**錯誤線條**

```text
Domain / Application
        │
        ▼
   Result<T, E>
        │
        ▼
 Error Factory → Audit / Failure Log
```

**鐵律**

* ❌ `throw new Error`
* ❌ 隱性失敗（null / undefined）
* ✅ 所有失敗 → `Result.Err`
* ✅ 錯誤一定可被 audit

---

## 4️⃣ `core/audit` & `core/events`

**事件不可逆線條**

```text
Command
  │
  ▼
Domain Change
  │
  ├─► Domain Event
  │        │
  │        ├─► Projection
  │        ├─► Audit
  │        └─► Process (Saga)
```

* audit **不是 log**
* audit 是 **治理證據**

---

# 三、Feature：唯一業務真理所在地

> **Feature = Bounded Context**

---

## 1️⃣ `features/domains/*`

```text
domain/
├── entity / value-object
├── domain-policy   (僅業務不變量)
├── repository.interface
└── domain-events
```

**線條限制**

* ❌ domain 不知道 UI
* ❌ domain 不知道 Firebase
* ❌ domain 不直接用 policy-engine（只能宣告「需要判斷」）

---

## 2️⃣ `features/domains/*/application`

```text
UseCase
  │
  ├─ load Aggregate
  ├─ call Policy Engine
  ├─ apply Domain Rule
  ├─ emit Event
  └─ return Result
```

**這裡是唯一可以：**

* 調 policy
* 調 repo
* 組合流程

---

## 3️⃣ `features/processes`（Saga / Workflow）

**線條位置（非常關鍵）**

```text
Event A ─┐
         ├─► Process Manager ─► Command B
Event C ─┘
```

* ❌ process 不擁有資料
* ❌ process 不寫 domain rule
* ✅ process 只負責「跨 domain 協調」

---

## 4️⃣ `features/capabilities`

> **平台能力 ≠ 業務**

例：notification / search / analytics

**線條**

```text
Domain Event
     │
     ▼
Capability (Projection / Dispatch)
```

* capability **永遠被動**
* 不可反向影響 domain

---

## 5️⃣ `features/contracts`

**用途**

* Feature Boundary
* 給 UI / 外部呼叫

```text
UI / Other Feature
        │
        ▼
   Feature Contract
```

❌ UI 直碰 domain = 越權

---

# 四、Infrastructure：只能是 Adapter

```text
firebase/
  ├─ firestore-repository.base.ts
  ├─ auth.mapper.ts
  └─ event-store.firebase.ts
```

**三不原則**

* ❌ 不寫 business rule
* ❌ 不判斷 policy
* ❌ 不定義 schema（只能對應 contract）

---

# 五、ESLint / Nx 必須 enforce 的規則（你這套一定要）

```text
domain        ❌ import process / ui / firebase
process       ❌ import ui
capability    ❌ import domain private model
ui            ❌ import domain
infrastructure❌ import feature
```

---

# 六、一句話總結每一層（可放 README）

* **Core**：法律與語言
* **Domain**：真實世界規則
* **Application**：怎麼做
* **Process**：跨界協調
* **Capability**：平台反射
* **UI**：呈現與編排
* **Infrastructure**：接線盒

---

## 架構師最終簽核語（升級版）

> **這不是為了讓人寫得快，而是為了讓「寫錯」變得困難、昂貴、且立即被發現。**
