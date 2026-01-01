# 事件模型 (Event Model)

## 核心結構

```typescript
interface CausalEvent<T = unknown> {
  readonly eventId: string;
  readonly type: string;           // 過去式命名
  readonly aggregateId: string;
  readonly version: number;
  readonly timestamp: string;      // ISO 8601
  readonly data: T;
  readonly causedBy: CausalMetadata;
  readonly correlationId: string;  // 流程識別
  readonly causationId: string;    // 因果鏈
  readonly traceId?: string;       // 分散式追蹤
}
```

## 命名規範

### 使用過去式
```typescript
// ✅ 正確
IssueCreated, IssueAssigned, IssueClosed

// ❌ 錯誤
CreateIssue, AssignIssue  // 這是命令
```

### 明確描述
```typescript
// ✅ 正確
UserEmailChanged, IssueStatusTransitioned

// ❌ 錯誤
UserUpdated, IssueChanged  // 太模糊
```

## 版本策略

```typescript
// v1.0.0
interface IssueCreatedV1 {
  type: 'IssueCreated/v1';
  data: { title: string; description: string; };
}

// v2.0.0 - Breaking change
interface IssueCreatedV2 {
  type: 'IssueCreated/v2';
  data: {
    title: string;
    description: string;
    priority: Priority;  // 新增必填
  };
}

// 向上轉換
upcast(v1: V1): V2 {
  return {
    ...v1,
    data: { ...v1.data, priority: 'medium' }
  };
}
```

## 設計原則

### 1. 包含完整資料
```typescript
// ✅ 正確
interface IssueAssigned {
  data: {
    issueId: string;
    assignee: string;
    assignedBy: string;
    previousAssignee?: string;
  };
}

// ❌ 錯誤：僅 ID
data: { assigneeId: string; }
```

### 2. 自我描述
事件應包含所有必要資訊，無需額外查詢。

### 3. 細粒度
```typescript
// ✅ 正確
IssueTitleChanged, IssueDescriptionChanged

// ❌ 錯誤
IssueUpdated  // 太粗
```

## 確定性處理

```typescript
// ✅ 確定性
apply(event: IssueEvent): void {
  this.state = {
    ...this.state,
    status: event.data.status,
    updatedAt: event.timestamp  // 用事件時間
  };
}

// ❌ 非確定性
apply(event: IssueEvent): void {
  this.state.processedAt = new Date();  // 系統時鐘！
}
```

## 事件驗證

```typescript
validate(event: CausalEvent): Result<void> {
  if (!event.type) return Err('Missing type');
  if (!isPastTense(event.type)) return Err('Must be past tense');
  if (!event.causedBy) return Err('Missing causedBy');
  return Ok();
}
```

## 儲存格式（Firestore）

```json
{
  "eventId": "evt_123",
  "type": "IssueCreated/v2",
  "aggregateId": "issue_abc",
  "version": 1,
  "timestamp": "2025-12-30T10:00:00Z",
  "data": { "title": "Bug in login", "priority": "high" },
  "causedBy": { "userId": "alice" },
  "correlationId": "flow_xyz"
}
```

---

**參考**：[因果模型](./causality-model.md) | [確定性](./determinism.md)
