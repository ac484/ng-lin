# 失敗處理 (Failure Handling)

## 失敗分類

### 1. 暫時性失敗
- 網路超時
- 服務暫時不可用
- 資源暫時耗盡

**策略**: 重試 + 指數退避

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  throw lastError;
}
```

### 2. 永久性失敗
- 資料格式錯誤
- 業務規則違反
- 權限不足

**策略**: 立即失敗 + 記錄錯誤 + 通知

```typescript
class PermanentError extends Error {
  constructor(message: string, public readonly event: CausalEvent) {
    super(message);
  }
}

// 處理
try {
  await handler.handle(event);
} catch (error) {
  if (error instanceof PermanentError) {
    logger.error('Permanent failure', { event: error.event });
    await deadLetterQueue.send(error.event);
    notifier.alert('Permanent failure detected');
  }
}
```

### 3. 毒丸事件 (Poison Pill)
事件導致處理器持續失敗。

**策略**: Dead Letter Queue + 手動介入

```typescript
class DeadLetterQueue {
  async send(event: CausalEvent, reason: string) {
    await storage.save('dlq', {
      event,
      reason,
      timestamp: Date.now(),
      retryCount: 0
    });
  }
  
  async replay(eventId: string) {
    const entry = await storage.get('dlq', eventId);
    try {
      await handler.handle(entry.event);
      await storage.delete('dlq', eventId);
    } catch (error) {
      entry.retryCount++;
      await storage.update('dlq', eventId, entry);
    }
  }
}
```

## Circuit Breaker

```typescript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= 5) {
      this.state = 'open';
    }
  }
}
```

## 優雅降級

```typescript
class GracefulDegradation {
  async handleEvent(event: CausalEvent) {
    try {
      // 嘗試完整處理
      await this.fullHandler.handle(event);
    } catch (error) {
      logger.warn('Full handler failed, degrading', { error });
      // 降級到簡化處理
      await this.degradedHandler.handle(event);
    }
  }
}
```

---

**參考**: [可觀測性](./observability.md) | [Chaos Replay](./chaos-replay.md)
