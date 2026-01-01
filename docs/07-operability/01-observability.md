# 可觀測性 (Observability)

## 三大支柱

### 1. Metrics (指標)
```typescript
class EventMetrics {
  publishRate: number;      // 事件發布速率
  processingLatency: number; // 處理延遲
  errorRate: number;        // 錯誤率
  queueDepth: number;       // 佇列深度
}

// 收集指標
metrics.record('event.published', {
  type: event.type,
  aggregateId: event.aggregateId
});
```

### 2. Logs (日誌)
```typescript
logger.info('Event published', {
  eventId: event.id,
  type: event.type,
  aggregateId: event.aggregateId,
  causedBy: event.causedBy,
  correlationId: event.correlationId
});
```

### 3. Traces (追蹤)
```typescript
// 分散式追蹤
const span = tracer.startSpan('handle-event');
span.setTag('event.type', event.type);
span.setTag('event.id', event.id);

try {
  await handler.handle(event);
  span.setTag('status', 'success');
} catch (error) {
  span.setTag('error', true);
  span.log({ error: error.message });
  throw error;
} finally {
  span.finish();
}
```

## Event Flow 監控

```typescript
class EventFlowMonitor {
  track(event: CausalEvent) {
    // 追蹤事件流轉
    this.recordLatency(event);
    this.recordThroughput(event);
    this.trackCausality(event);
  }
  
  recordLatency(event: CausalEvent) {
    const now = Date.now();
    const latency = now - event.timestamp;
    metrics.record('event.latency', latency, {
      type: event.type
    });
  }
  
  trackCausality(event: CausalEvent) {
    if (event.causedBy) {
      const parent = eventStore.getEvent(event.causedBy);
      const causalLatency = event.timestamp - parent.timestamp;
      metrics.record('causality.latency', causalLatency);
    }
  }
}
```

## Dashboard 範例

```typescript
// Real-time metrics dashboard
{
  "Event Flow": {
    "Total Events": 1234567,
    "Events/sec": 42,
    "Avg Latency": "12ms",
    "P95 Latency": "45ms"
  },
  "Causality": {
    "Avg Chain Length": 3.2,
    "Max Chain Length": 12,
    "Orphaned Events": 0
  },
  "Errors": {
    "Error Rate": "0.01%",
    "Recent Errors": [...]
  }
}
```

## 告警規則

```typescript
const alerts = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 0.05',
    action: 'notify-oncall'
  },
  {
    name: 'High Latency',
    condition: 'p95_latency > 100ms',
    action: 'investigate'
  },
  {
    name: 'Queue Backup',
    condition: 'queue_depth > 1000',
    action: 'scale-up'
  }
];
```

---

**參考**: [失敗處理](./failure-handling.md) | [Chaos Replay](./chaos-replay.md)
