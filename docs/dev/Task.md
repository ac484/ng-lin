> **前提鐵則**
>
> * 任務（Task）是**唯一業務實體**
> * 事件是**唯一事實來源**
> * 多視圖 = 多 Projection，而不是多模型
>
> **實作狀態**: ✅ Core架構已完成（ADR-0005, ADR-0006）
> * ✅ Task Domain 完整實作（18 files, 2211 lines）
> * ✅ Event Sourcing + Projection Engine 完整實作
> * ✅ Snapshot Store (Firebase + Supabase) 完整實作
> * ❌ UI Components 待實作（~50 files）
> * 參考: `src/app/features/domains/task/README.md`

---

# Task 作為唯一業務的「多視圖結構圖」

```
┌──────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ │
│  │ List │ │Board │ │Detail│ │ Why  │ │Comment │ │Timeline│ │
│  └───▲──┘ └───▲──┘ └───▲──┘ └───▲──┘ └────▲───┘ └────▲───┘ │
│      │        │        │        │         │          │      │
└──────┼────────┼────────┼────────┼─────────┼──────────┼──────┘
       │ Signals (reactive state updates)   │          │
┌──────┴────────┴────────┴────────┴─────────┴──────────┴──────┐
│                  Projection Layer                            │
│                                                              │
│  task-list   task-board   task-why   task-discussion       │
│  task-comment   task-attachment   task-timeline            │
│                                                              │
│  (all derived from same event stream via replay)           │
└───────────────────────┬──────────────────────────────────────┘
                        │ replay(TaskEvents[])
┌───────────────────────▼──────────────────────────────────────┐
│               Process / Decision Layer                       │
│                                                              │
│  Commands → Decisions → Events                              │
│                                                              │
│  CreateTask  → decideCreateTask(events)  → TaskCreated      │
│  StartTask   → decideStartTask(events)   → TaskStarted      │
│  AddComment  → decideAddComment(events)  → TaskCommentAdded │
│  Complete    → decideCompleteTask(events)→ TaskCompleted    │
│                                                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                    Event Layer                               │
│                                                              │
│  TaskCreated, TaskStarted, TaskCompleted, TaskArchived      │
│  TaskCommentAdded, TaskCommentEdited, TaskCommentDeleted    │
│  TaskDiscussionStarted, TaskDiscussionReplied               │
│  TaskAttachmentUploaded, TaskAttachmentDeleted              │
│  TaskPriorityChanged, TaskAssigneeChanged                   │
│                                                              │
│  (append-only, immutable, causally ordered)                 │
│                                                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                   Event Store                                │
│                                                              │
│   Firebase / IndexedDB / In-memory                          │
│   With causality tracking (causation_id, correlation_id)   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 關鍵設計說明（不要跳過）

### 1️⃣ **Task 不是 Model，是 Event Stream**

❌ 不存在「Task entity」
✅ 只有 `events(taskId)`

```ts
Task = replay(TaskEvents[])
```

---

### 2️⃣ 多視圖 = 多 Projection（不是多狀態）

| View          | 關心什麼        |
| ------------- | ----------- |
| TaskListView  | 任務存在嗎？現在狀態？ |
| TaskBoardView | 任務在哪一欄？     |
| TaskWhyView   | 為什麼是這個狀態？   |

👉 **每個 Projection 都是一次 replay**
👉 彼此完全不共享 state

---

### 3️⃣ Projection 只能做三件事

```ts
type Projection = {
  init(): State
  apply(state, event): State
  result(state): ViewModel
}
```

🚫 不查 DB
🚫 不做 decision
🚫 不發 event

---

### 4️⃣ Decision 是唯一「會阻止事情發生」的地方

```ts
function decideCompleteTask(events: TaskEvent[]) {
  const state = replay(events)
  if (state.status !== 'Doing') {
    return reject('Task must be Doing')
  }
  return emit(TaskCompleted)
}
```

👉 沒有 if scattered anywhere else

---

### 5️⃣ 為什麼這個結構能「映射多視圖」

因為：

* **同一條事件流**
* **多個不同的 replay 規則**
* **每個 view 都是「觀點」不是「真相」**

> 真相只有事件。

---

## 完整目錄結構（可落地實作）

```
src/app/features/domains/task/
│
├── events/                          # 事件層（10 files）
│   ├── task.events.ts               # 核心事件定義
│   ├── task-lifecycle.events.ts     # 生命週期事件
│   ├── task-comment.events.ts       # 評論事件
│   ├── task-discussion.events.ts    # 討論事件
│   ├── task-attachment.events.ts    # 附件事件
│   └── index.ts
│
├── decisions/                       # 決策層（10 files）
│   ├── task.decisions.ts            # decideStartTask, decideCompleteTask...
│   ├── comment.decisions.ts         # decideAddComment, decideEditComment...
│   ├── discussion.decisions.ts      # decideStartDiscussion, decideReply...
│   ├── attachment.decisions.ts      # decideUploadAttachment, decideDelete...
│   └── index.ts
│
├── projections/                     # 投影層（10 files）
│   ├── task-list.projection.ts      # flat summary of all tasks
│   ├── task-board.projection.ts     # tasks grouped by status columns
│   ├── task-why.projection.ts       # explanation from event history
│   ├── task-discussion.projection.ts # discussion thread view
│   ├── task-comment.projection.ts   # comments view
│   ├── task-attachment.projection.ts # attachments list
│   ├── task-timeline.projection.ts  # chronological event view
│   └── index.ts
│
├── processes/                       # 流程層（5 files）
│   ├── task-lifecycle.process.ts    # manage state transitions
│   ├── task-collaboration.process.ts # cross-platform collaboration
│   └── index.ts
│
├── commands/                        # 命令層（10 files）
│   ├── task.commands.ts             # CreateTask, StartTask, CompleteTask...
│   ├── comment.commands.ts          # AddComment, EditComment, DeleteComment
│   ├── discussion.commands.ts       # StartDiscussion, ReplyToDiscussion
│   ├── attachment.commands.ts       # UploadAttachment, DeleteAttachment
│   └── index.ts
│
├── models/                          # 讀模型（5 files）
│   ├── task.model.ts                # Task DTO/read model
│   ├── task-comment.model.ts        # Comment DTO
│   ├── task-discussion.model.ts     # Discussion DTO
│   └── index.ts
│
├── ui/                              # UI組件（50 files）
│   └── components/
│       ├── task-list/               # List view component
│       ├── task-board/              # Board view component
│       ├── task-detail/             # Detail view component
│       ├── task-why/                # Why view component
│       ├── task-discussion/         # Discussion component
│       ├── task-comment/            # Comment component
│       ├── task-timeline/           # Timeline component
│       └── index.ts
│
├── README.md                        # Task domain architecture
└── index.ts                         # Unified exports

Total: ~100 files
```

---

## 一句你可以當設計裁判的話

> **如果一個功能不能被表達為
> 「對 Task 事件流的一種重播觀點」，
> 那它不屬於這個系統。**

---
下面是一個**可以直接貼進 README.md 的〈Architecture〉章節**，內容已經幫你**對齊「任務作為唯一業務 + 多視圖映射 + 因果事件」**，而且刻意寫成「設計憲法型文件」，不是技術炫技文。

你可以原封不動用，或當基準再裁剪。

---

## Architecture

This system is intentionally designed around **a single real business domain: Task**.
All architectural decisions serve one goal:

> **Represent tasks as immutable facts, derive multiple views deterministically, and always explain *why* a task is in its current state.**

---

### Architectural Invariants (Non-Negotiable)

The following rules define the system boundary and **must not be violated**:

1. **Task is the only business entity**
2. **Events are the only source of truth**
3. **State is always derived by replay**
4. **Multiple views are projections, never models**
5. **Decisions are centralized and explicit**

If a feature cannot be expressed within these constraints, it does not belong in this system.

---

## Layered Structure

The system follows a strict, causality-oriented layering:

```
UI → Projection → Decision → Event → Event Store
```

Each layer has a single responsibility and a one-way dependency.

---

### 1. Event Layer (Facts)

The **Event Layer** represents immutable facts that have already happened.

Examples:

* `TaskCreated`
* `TaskStarted`
* `TaskCompleted`
* `TaskArchived`
* `TaskReopened`

Characteristics:

* Append-only
* Immutable
* Ordered per task
* Never deleted or mutated

> There is no `Task` object.
> A task **is the replay of its events**.

---

### 2. Decision Layer (Causality Enforcement)

The **Decision Layer** is the only place where the system can say **“no”**.

Responsibilities:

* Load a task’s event stream
* Replay it into a transient state
* Enforce business invariants
* Emit zero or more new events

Example rules:

* A task cannot be completed unless it is `Doing`
* A task cannot be started if it is `Archived`

No UI, service, or projection is allowed to enforce rules.

---

### 3. Projection Layer (Views)

The **Projection Layer** derives read-only views by replaying events.

Each projection represents **one perspective**, not shared truth.

Examples:

| Projection    | Purpose                      |
| ------------- | ---------------------------- |
| TaskListView  | Flat overview of tasks       |
| TaskBoardView | Tasks grouped by status      |
| TaskWhyView   | Explanation of current state |

Rules:

* Projections never emit events
* Projections never make decisions
* Projections do not share state
* All projections are deterministic

> Multiple views exist because **observers have different questions**,
> not because the domain has multiple truths.

---

### 4. UI Layer (Observation)

The **UI Layer** consumes projections only.

It:

* Renders derived state
* Dispatches commands
* Never infers business rules
* Never mutates state directly

In Angular v20, projections are exposed as **Signals**, ensuring reactive but deterministic updates.

---

## Multi-View Mapping (Single Truth)

```
Same Event Stream
        │
        ├─ TaskListProjection  → List View
        ├─ TaskBoardProjection → Board View
        └─ TaskWhyProjection   → Detail / Explanation View
```

All views observe the **same events**, but answer different questions.

There is no synchronization logic between views — consistency is guaranteed by replay.

---

## Event Flow Summary

```
User Action
   ↓
Command
   ↓
Decision (replay + validation)
   ↓
Event(s)
   ↓
Event Store
   ↓
Projection Replay
   ↓
UI Update
```

Every visible change can be traced back to **a specific event and its cause**.

---

## Expansion Rule

This architecture evolves under a strict constraint:

> **The system must fully serve one real task lifecycle
> before any abstraction or additional domain is introduced.**

New abstractions are only allowed when:

* The existing task flow cannot be expressed clearly
* Replay becomes ambiguous
* Causality can no longer be explained

Premature generalization is considered an architectural violation.

---

## Design Philosophy (One Sentence)

> **If a feature cannot be modeled as a deterministic replay of task events, it does not belong here.**

---
