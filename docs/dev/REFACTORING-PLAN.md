# features/domains/ 重構計劃

**目標**: 符合 Task.md 架構原則，Task 作為唯一業務實體

**狀態**: 🟡 進行中  
**開始日期**: 2025-12-31  
**預計完成**: 2026-01-14 (2週)

---

## 重構原則

根據 ADR-001 和 Task.md：

> **Task 是唯一業務實體 (Task is the ONLY business entity)**

### 核心決策

1. **Task** → 保留並完整重構
2. **Comment, Discussion, Attachment** → 轉為 Task Events
3. **Activity** → 刪除 (用 Task Events 追蹤)
4. **Issue** → 合併到 Task
5. **User** → 移至 Platform Layer

---

## Phase 1: 準備階段 (Day 1-2) ✅

### ✅ 已完成

- [x] 創建 ADR-001: Task 作為唯一業務實體
- [x] 創建 ADR-002: Event Sourcing + Projection 架構
- [x] 建立 Projection Engine 基礎設施
  - [x] `projection-engine.interface.ts`
  - [x] `projection-builder.ts`
  - [x] `index.ts`
  - [x] README.md

### 🔄 進行中

- [ ] 實作 Snapshot Store 介面
- [ ] 建立測試框架

### ⏳ 待完成

- [ ] Dev Tools 更新 (支援 Projection 測試)
- [ ] 建立遷移腳本骨架

---

## Phase 2: 架構重構 (Day 3-7)

### Step 1: 凍結舊結構 (Day 3)

**目標**: 標記即將刪除的代碼，禁止新功能

**行動**:
```typescript
// 在以下目錄的 index.ts 加上 @deprecated
features/domains/
├── activity/index.ts     // @deprecated 將刪除，請使用 Task Events
├── attachment/index.ts   // @deprecated 將合併到 task/events/
├── comment/index.ts      // @deprecated 將合併到 task/events/
└── discussion/index.ts   // @deprecated 將合併到 task/events/
```

**檢查清單**:
- [ ] 標記 `activity/` 為 @deprecated
- [ ] 標記 `attachment/` 為 @deprecated
- [ ] 標記 `comment/` 為 @deprecated
- [ ] 標記 `discussion/` 為 @deprecated
- [ ] 更新 ESLint 規則禁止使用這些模組

### Step 2: 建立測試基線 (Day 3-4)

**目標**: 確保重構後功能不變

**行動**:
```bash
# 為現有功能建立快照測試
npm run test -- --coverage

# 記錄當前功能清單
- Comment 功能
- Discussion 功能
- Attachment 功能
- Activity 追蹤
```

**檢查清單**:
- [ ] Comment 功能測試完整
- [ ] Discussion 功能測試完整
- [ ] Attachment 功能測試完整
- [ ] 測試覆蓋率 > 80%

### Step 3: 建立 Task Events 骨架 (Day 4-5)

**目標**: 定義 Task 的所有事件類型

**新增檔案**:
```
features/domains/task/
└── events/
    ├── task-core.events.ts          # 核心事件
    ├── task-lifecycle.events.ts     # 生命週期事件
    ├── task-comment.events.ts       # 評論事件 (來自 comment/)
    ├── task-discussion.events.ts    # 討論事件 (來自 discussion/)
    ├── task-attachment.events.ts    # 附件事件 (來自 attachment/)
    └── index.ts
```

**事件範例**:
```typescript
// task-comment.events.ts
export interface TaskCommentAddedEvent {
  eventId: string;
  type: 'TaskCommentAdded';
  aggregateId: string; // taskId
  aggregateType: 'Task';
  taskId: string;
  commentId: string;
  content: string;
  authorId: string;
  causedBy: string[];
  timestamp: Date;
}

export interface TaskCommentEditedEvent {
  eventId: string;
  type: 'TaskCommentEdited';
  aggregateId: string;
  aggregateType: 'Task';
  taskId: string;
  commentId: string;
  newContent: string;
  causedBy: string[];
  timestamp: Date;
}

export interface TaskCommentDeletedEvent {
  eventId: string;
  type: 'TaskCommentDeleted';
  aggregateId: string;
  aggregateType: 'Task';
  taskId: string;
  commentId: string;
  causedBy: string[];
  timestamp: Date;
}
```

**檢查清單**:
- [ ] TaskCommentAddedEvent
- [ ] TaskCommentEditedEvent
- [ ] TaskCommentDeletedEvent
- [ ] TaskDiscussionStartedEvent
- [ ] TaskDiscussionRepliedEvent
- [ ] TaskAttachmentUploadedEvent
- [ ] TaskAttachmentDeletedEvent
- [ ] 所有事件包含 `causedBy` 欄位

### Step 4: 遷移功能到 Task Events (Day 5-6)

**目標**: 將 Comment, Discussion, Attachment 功能轉為 Task Events

**遷移步驟**:

1. **遷移 Comment**:
   ```typescript
   // 舊代碼 (comment/application/commands/create-comment.command.ts)
   async execute(input: CreateCommentInput): Promise<Result<Comment, Error>> {
     const comment = Comment.create(input);
     await this.commentRepository.save(comment);
     return ok(comment);
   }

   // 新代碼 (task/application/commands/add-comment.command.ts)
   async execute(input: AddCommentInput): Promise<Result<void, Error>> {
     // Decision 層驗證
     const events = await this.eventStore.getStream(input.taskId);
     const decisionResult = decideAddComment(events, input);
     if (Result.isErr(decisionResult)) {
       return decisionResult;
     }

     // 發布 Event
     const event: TaskCommentAddedEvent = decisionResult.value;
     await this.eventStore.append(event);
     await this.eventBus.publish(event);

     return ok(undefined);
   }
   ```

2. **建立 Projection** (用於查詢):
   ```typescript
   // task/projections/task-comment.projection.ts
   export class TaskCommentProjectionBuilder extends ProjectionBuilder<TaskCommentState> {
     getInitialState(): TaskCommentState {
       return {
         taskId: '',
         comments: []
       };
     }

     apply(state: TaskCommentState, event: StoredEvent): TaskCommentState {
       switch (event.eventType) {
         case 'TaskCommentAdded':
           return {
             ...state,
             comments: [
               ...state.comments,
               {
                 commentId: event.data.commentId,
                 content: event.data.content,
                 authorId: event.data.authorId,
                 createdAt: event.timestamp
               }
             ]
           };

         case 'TaskCommentEdited':
           return {
             ...state,
             comments: state.comments.map(c =>
               c.commentId === event.data.commentId
                 ? { ...c, content: event.data.newContent }
                 : c
             )
           };

         case 'TaskCommentDeleted':
           return {
             ...state,
             comments: state.comments.filter(
               c => c.commentId !== event.data.commentId
             )
           };

         default:
           return state;
       }
     }
   }
   ```

**檢查清單**:
- [ ] Comment 功能遷移完成
  - [ ] Decision 層
  - [ ] Commands
  - [ ] Events
  - [ ] Projections
  - [ ] UI 更新
  - [ ] 測試通過
- [ ] Discussion 功能遷移完成
- [ ] Attachment 功能遷移完成

### Step 5: 合併 Issue 到 Task (Day 6-7)

**目標**: Issue 和 Task 合併為一個實體

**策略**: Issue 本質上是 Task，只是類型不同

```typescript
// Task Type 擴展
export type TaskType = 'Task' | 'Issue' | 'Story' | 'Bug' | 'Epic';

export interface TaskCreatedEvent {
  eventId: string;
  type: 'TaskCreated';
  aggregateId: string;
  taskId: string;
  title: string;
  taskType: TaskType; // 新增欄位
  // ...
}
```

**遷移步驟**:
1. 擴展 Task Events 支援不同類型
2. 遷移 Issue 相關功能到 Task
3. 更新 UI 支援不同 Task 類型
4. 測試確保所有 Issue 功能正常

**檢查清單**:
- [ ] Task Events 支援 TaskType
- [ ] Issue 功能完全遷移
- [ ] UI 更新完成
- [ ] 測試通過

### Step 6: 移動 User 到 Platform (Day 7)

**目標**: User 是平台實體，不是業務實體

**行動**:
```bash
# 移動目錄
mv features/domains/user/ platform/entities/user/

# 更新所有 import
# 從: import { User } from '@features/domains/user';
# 到: import { User } from '@platform/entities/user';
```

**檢查清單**:
- [ ] 目錄移動完成
- [ ] 所有 import 更新
- [ ] 測試通過
- [ ] ESLint 通過

### Step 7: 刪除舊結構 (Day 7)

**目標**: 移除違反架構的代碼

**行動**:
```bash
# 刪除目錄
rm -rf features/domains/activity/
rm -rf features/domains/attachment/
rm -rf features/domains/comment/
rm -rf features/domains/discussion/
rm -rf features/domains/issue/
```

**檢查清單**:
- [ ] 確認所有功能已遷移
- [ ] 確認所有測試通過
- [ ] 刪除 activity/
- [ ] 刪除 attachment/
- [ ] 刪除 comment/
- [ ] 刪除 discussion/
- [ ] 刪除 issue/
- [ ] 更新 tsconfig paths
- [ ] 測試完整通過

---

## Phase 3: 驗證階段 (Day 8-10)

### Step 1: 測試驗證 (Day 8)

**檢查清單**:
- [ ] 所有 Unit Tests 通過
- [ ] 所有 Integration Tests 通過
- [ ] E2E Tests 通過
- [ ] 測試覆蓋率 > 85%

### Step 2: 架構合規驗證 (Day 9)

**檢查清單**:
- [ ] ✅ Task 是唯一業務實體
- [ ] ✅ Events 是唯一事實來源
- [ ] ✅ 所有決策透過 Decision 層
- [ ] ✅ State = replay(events)
- [ ] ✅ 完整的 Causality 追蹤
- [ ] ✅ ESLint 規則通過

### Step 3: 文件更新 (Day 10)

**檢查清單**:
- [ ] 更新架構文件
- [ ] 更新 API 文件
- [ ] 更新開發者指南
- [ ] 更新 README
- [ ] 建立遷移指南

---

## 風險管理

### 風險 1: 功能遺失

**緩解**: 完整的測試覆蓋 + 漸進式遷移

**應急計劃**: 保留舊代碼直到新代碼完全驗證

### 風險 2: 效能問題

**緩解**: Snapshot 機制 + 效能測試

**應急計劃**: 優化 Projection 演算法

### 風險 3: 團隊學習曲線

**緩解**: 文件 + 範例代碼 + Code Review

**應急計劃**: Pair Programming 支援

---

## 成功標準

- [ ] 所有測試通過 (>85% 覆蓋率)
- [ ] 架構符合 Task.md 和 ADR-001
- [ ] ESLint 無警告
- [ ] 效能不低於重構前
- [ ] 文件完整更新

---

**狀態追蹤**:
- ✅ 已完成: 3 項
- 🔄 進行中: 2 項
- ⏳ 待開始: 15 項
- **完成度**: 15%

**下一步行動**: 實作 Snapshot Store 介面

---

**最後更新**: 2025-12-31  
**負責人**: 開發團隊  
**相關 ADR**: ADR-001, ADR-002
