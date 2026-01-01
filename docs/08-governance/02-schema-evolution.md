# Schema Evolution

## 事件 Schema 演化

事件一旦發布就不可變，但 Schema 需要演化。

## 版本策略

### 1. 向後相容變更
```typescript
// V1
class IssueCreatedEvent {
  aggregateId: string;
  title: string;
}

// V2 - 新增可選欄位（向後相容）
class IssueCreatedEvent {
  aggregateId: string;
  title: string;
  priority?: 'low' | 'medium' | 'high'; // 新增，可選
}
```

### 2. 向前相容變更
```typescript
// Upcasting: V1 → V2
class EventUpcaster {
  upcast(event: any): CausalEvent {
    if (event.version === 1) {
      return {
        ...event,
        version: 2,
        priority: 'medium' // 預設值
      };
    }
    return event;
  }
}
```

### 3. 破壞性變更
```typescript
// V1
class IssueAssignedEvent {
  assignee: string; // user ID
}

// V2 - 結構變更（破壞性）
class IssueAssignedEvent {
  assignee: {
    id: string;
    name: string;
    email: string;
  };
}

// Migration
class EventMigrator {
  migrate(event: any): IssueAssignedEvent {
    if (typeof event.assignee === 'string') {
      const user = await userService.get(event.assignee);
      return {
        ...event,
        version: 2,
        assignee: {
          id: event.assignee,
          name: user.name,
          email: user.email
        }
      };
    }
    return event;
  }
}
```

## Schema Registry

```typescript
class SchemaRegistry {
  private schemas = new Map<string, EventSchema[]>();
  
  register(eventType: string, version: number, schema: EventSchema) {
    if (!this.schemas.has(eventType)) {
      this.schemas.set(eventType, []);
    }
    this.schemas.get(eventType)!.push(schema);
  }
  
  validate(event: CausalEvent): Result<void> {
    const schemas = this.schemas.get(event.type);
    const schema = schemas?.find(s => s.version === event.version);
    
    if (!schema) {
      return Result.Err(`Unknown schema: ${event.type} v${event.version}`);
    }
    
    return schema.validate(event);
  }
}
```

## 演化原則

1. **永不刪除欄位** - 標記為 deprecated
2. **新欄位必須可選** - 或提供預設值
3. **版本號遞增** - 語義化版本
4. **保留所有版本** - 支援歷史事件讀取

---

**參考**: [Contract Versioning](../adr/003-contract-versioning-strategy.md)
