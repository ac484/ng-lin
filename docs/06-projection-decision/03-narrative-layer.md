# 敘事層 (Narrative Layer)

## Human-Readable Narratives

將事件序列轉換為人類可讀的故事。

## 事件到敘事

```typescript
class NarrativeGenerator {
  generate(events: CausalEvent[]): string {
    return events.map(e => this.eventToSentence(e)).join(' ');
  }
  
  private eventToSentence(event: CausalEvent): string {
    const templates = {
      'IssueCreated': (e) => `${e.createdBy} created issue "${e.title}".`,
      'IssueAssigned': (e) => `Issue was assigned to ${e.assignee}.`,
      'IssueClosed': (e) => `${e.closedBy} closed the issue.`
    };
    
    return templates[event.type]?.(event) || `Event ${event.type} occurred.`;
  }
}

// 使用
const events = await eventStore.getEvents('issue:123');
const narrative = narrativeGenerator.generate(events);
// → "Alice created issue "Fix login bug". Issue was assigned to Bob. Bob closed the issue."
```

## 因果敘事

```typescript
function generateCausalNarrative(eventId: string): string {
  const chain = causalGraph.getAncestors(eventId);
  const sentences = chain.map((e, i) => {
    if (i === 0) return `Initially, ${eventToSentence(e)}`;
    return `This caused ${eventToSentence(e)}`;
  });
  
  return sentences.join(' ');
}

// → "Initially, Alice created issue. This caused notification sent. This caused email delivered."
```

## 時間軸敘事

```typescript
async generateTimeline(aggregateId: string): Promise<TimelineEntry[]> {
  const events = await eventStore.getEvents(aggregateId);
  
  return events.map(e => ({
    timestamp: e.timestamp,
    actor: this.extractActor(e),
    action: this.extractAction(e),
    description: this.eventToSentence(e)
  }));
}
```

## 審計報告

```typescript
class AuditReportGenerator {
  async generate(aggregateId: string, from: Date, to: Date): Promise<string> {
    const events = await eventStore.getEvents(aggregateId, { from, to });
    
    return `
# Audit Report
**Period**: ${from.toISOString()} - ${to.toISOString()}
**Entity**: ${aggregateId}

## Changes
${events.map(e => `- ${this.formatChange(e)}`).join('\n')}

## Summary
Total changes: ${events.length}
    `.trim();
  }
}
```

## 本地化

```typescript
class LocalizedNarrative {
  constructor(private locale: string) {}
  
  generate(events: CausalEvent[]): string {
    const templates = this.loadTemplates(this.locale);
    return events.map(e => templates[e.type](e)).join(' ');
  }
  
  private loadTemplates(locale: string) {
    // 載入特定語言的模板
    return require(`./narratives/${locale}.json`);
  }
}
```

---

**參考**: [因果圖](./causal-graph.md) | [時間查詢](./temporal-queries.md)
