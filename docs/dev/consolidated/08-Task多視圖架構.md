# Task 多視圖架構

> **核心理念**：Task 是唯一業務實體，事件是唯一事實來源

## 前提鐵則

* 任務（Task）是**唯一業務實體**
* 事件是**唯一事實來源**
* 多視圖 = 多 Projection，不是多模型

## Task 架構層次

```
UI Layer (List/Board/Detail/Why/Comment/Timeline)
    ↓ Signals (reactive)
Projection Layer (replay events)
    ↓ replay(TaskEvents[])
Decision Layer (Commands → Events)
    ↓
Event Layer (TaskCreated, TaskStarted...)
    ↓
Event Store (Firebase/IndexedDB)
```

## 關鍵設計

### 1. Task = Event Stream

❌ 不存在「Task entity」
✅ 只有 `events(taskId)`

```ts
Task = replay(TaskEvents[])
```

### 2. 多視圖 = 多 Projection

| View          | 關心什麼        |
| ------------- | ----------- |
| TaskListView  | 任務存在？狀態？    |
| TaskBoardView | 任務在哪一欄？     |
| TaskWhyView   | 為什麼是這個狀態？   |

👉 每個 Projection 都是一次 replay
👉 彼此完全不共享 state

### 3. Projection 三要素

```ts
type Projection = {
  init(): State
  apply(state, event): State
  result(state): ViewModel
}
```

🚫 不查 DB / 不做 decision / 不發 event

### 4. Decision 層職責

```ts
function decideCompleteTask(events: TaskEvent[]) {
  const state = replay(events)
  if (state.status !== 'Doing') {
    return reject('Task must be Doing')
  }
  return emit(TaskCompleted)
}
```

### 5. 多視圖映射原理

* **同一條事件流**
* **多個不同的 replay 規則**
* **每個 view 是「觀點」不是「真相」**

> 真相只有事件

## 目錄結構

```
task/
├── events/        # 事件層
├── decisions/     # 決策層
├── projections/   # 投影層
├── processes/     # 流程層
├── commands/      # 命令層
├── models/        # 讀模型
└── ui/            # UI組件
```

## 設計裁判

> **功能必須能表達為「對 Task 事件流的重播觀點」**

---

**版本**: 1.0  
**來源**: Task.md
