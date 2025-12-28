# Event Identifier System - Two-Tier Architecture

## Overview

The ng-lin event identifier system implements a two-tier architecture following GitHub's design philosophy: **Namespace + Sequence**.

This design provides:
- **Global Uniqueness**: Each event has a globally unique identifier
- **Multi-Tenant Isolation**: Natural tenant boundaries through namespaces
- **Scalability**: Independent sequence generation per namespace
- **Distributed Design**: Decentralized without global coordination

## Format

```
<namespace>#<sequence>
```

### Examples

```
qrl.trading.order#1024
acme.project-alpha.issue#1
openai.chatgpt.conversation#1287
```

## Namespace Structure

Namespaces follow a three-part dot-notation structure:

```
<tenant>.<context>.<aggregate>
```

| Component | Description | Example |
|-----------|-------------|---------|
| **tenant** | Tenant boundary (organization/user) | `qrl`, `acme`, `openai` |
| **context** | Business context within tenant | `trading`, `project-alpha`, `chatgpt` |
| **aggregate** | Aggregate/entity type | `order`, `issue`, `conversation` |

### Valid Component Names

Components must contain only:
- Alphanumeric characters (a-z, A-Z, 0-9)
- Hyphens (-)
- Underscores (_)

**Valid Examples:**
```
qrl.trading-bot.order
acme.project_alpha.issue
org-1.ctx_2.agg-3
```

**Invalid Examples:**
```
qrl.trading@bot.order    // @ not allowed
acme.project alpha.issue // space not allowed
org.ctx.agg.extra       // too many parts
```

## Sequence Numbers

- Sequences are **incremental integers** starting from 1
- Each namespace maintains its **own independent sequence**
- Sequences are **monotonically increasing** within a namespace
- Sequences **never reset** (unless explicitly cleared)

### Sequence Independence

Different namespaces maintain separate sequences:

```typescript
qrl.trading.order#1
qrl.trading.order#2
qrl.trading.order#3

acme.project.issue#1    // Independent sequence
acme.project.issue#2
acme.project.issue#3
```

## Why Two-Tier Structure?

### Comparison: Global ID vs. Namespace#Sequence

| Aspect | Global Sequential ID | Namespace#Sequence |
|--------|---------------------|-------------------|
| **Uniqueness** | ❌ Requires global coordination | ✅ Global uniqueness through namespace |
| **Coupling** | ❌ High coupling | ✅ Low coupling |
| **Autonomy** | ❌ Not divisible | ✅ Can split/merge tenants |
| **Multi-tenant** | ❌ Difficult to implement | ✅ Natural support |
| **Distributed** | ❌ Needs central authority | ✅ Fully autonomous |
| **Governance** | ❌ Difficult | ✅ Natural boundaries |

### Benefits

1. **Global Uniqueness**: Namespace ensures no collisions across tenants
2. **Tenant Isolation**: Each tenant has complete autonomy
3. **Scalability**: No bottleneck on global sequence generation
4. **Governance**: Natural boundaries for access control
5. **Human-Readable**: Easy to understand and reference
6. **Timeline**: Sequences provide temporal ordering within context

## Usage

### TypeScript Service

```typescript
import { inject } from '@angular/core';
import { EventIdentifierService } from '@core/services/event-identifier.service';

// In your component or service
const identifierService = inject(EventIdentifierService);

// Generate identifier with explicit sequence
const id1 = identifierService.generateEventId('qrl', 'trading', 'order', 1024);
// Result: { 
//   namespace: "qrl.trading.order",
//   sequence: 1024,
//   fullReference: "qrl.trading.order#1024"
// }

// Generate identifier with auto-increment
const id2 = identifierService.generateEventId('qrl', 'trading', 'order');
// Result: { namespace: "qrl.trading.order", sequence: 1025, ... }

// Parse event reference
const parsed = identifierService.parseEventId('qrl.trading.order#1024');
if (parsed.success) {
  console.log(parsed.identifier);
  // Access: parsed.identifier.namespace, parsed.identifier.sequence
}

// Validate namespace
const validation = identifierService.validateNamespace('qrl.trading.order');
if (validation.valid) {
  console.log(validation.namespace);
}

// Format reference for display
const ref = identifierService.formatEventReference('qrl', 'trading', 'order', 1024);
console.log(ref); // "qrl.trading.order#1024"
```

### Event Creation at Different Levels

```typescript
// L-1: Raw Sequence
const rawSeq = 1024;

// L0: Namespace + Sequence (Identified Event)
const id = identifierService.generateEventId('qrl', 'trading', 'order', rawSeq);
const l0Event = identifierService.createIdentifiedEvent(
  id,
  EventLevel.Identified
);

// L1: Business Semantic
const l1Event = identifierService.createIdentifiedEvent(
  id,
  EventLevel.Semantic,
  'OrderPlaced',
  { orderId: '123', amount: 100 }
);

// L2: Policy/Automation
const alertId = identifierService.generateEventId('qrl', 'risk', 'alert', 2048);
const l2Event = identifierService.createIdentifiedEvent(
  alertId,
  EventLevel.Policy,
  'RiskAlertTriggered',
  { severity: 'high' },
  { 
    triggeredBy: id.fullReference,
    action: 'SendAlert',
    policyRule: 'RiskControl.OrderLimit'
  }
);
```

## Multi-Tenant Architecture Integration

### Tenant Boundary

The namespace's **tenant** component defines the multi-tenant boundary:

```typescript
// User qrl's events
qrl.trading.order#1
qrl.trading.order#2

// User acme's events (separate tenant)
acme.trading.order#1
acme.trading.order#2
```

### Access Control

Use the tenant component for authorization:

```typescript
class EventAuthorizationService {
  canAccessEvent(userId: string, identifier: EventIdentifier): boolean {
    const tenant = identifierService.extractTenant(identifier);
    return this.userBelongsToTenant(userId, tenant);
  }
}
```

### Tenant Isolation Queries

Filter events by tenant:

```typescript
// Firestore query example
const eventsRef = collection(firestore, 'events');
const q = query(
  eventsRef,
  where('identifier.namespace', '>=', 'qrl.'),
  where('identifier.namespace', '<', 'qrl.\uffff')
);
```

## Event Levels (L-1 to L2)

The identifier system supports the four-layer event model:

### L-1: Raw Sequence
- Pure sequence number
- No namespace yet
- Used internally

```typescript
rawSeq: 1024
```

### L0: Identified Event
- Namespace + Sequence
- Global unique identifier
- Basic event metadata

```typescript
eventId: "qrl.trading.order#1024"
```

### L1: Business Semantic
- Event type added
- Business meaning
- Domain events

```typescript
eventType: "OrderPlaced"
eventId: "qrl.trading.order#1024"
payload: { orderId: "123", amount: 100 }
```

### L2: Policy/Automation/Audit
- Triggered by L1 events
- Automated decisions
- Policy enforcement

```typescript
policyRule: "RiskControl.OrderLimit"
triggeredBy: "qrl.trading.order#1024"
action: "SendAlert"
eventId: "qrl.risk.alert#2048"
```

## Sequence Management

### Auto-Increment

```typescript
// First event
const id1 = identifierService.generateEventId('qrl', 'trading', 'order');
// Sequence: 1

// Second event
const id2 = identifierService.generateEventId('qrl', 'trading', 'order');
// Sequence: 2
```

### Manual Sequence Control

```typescript
// Set sequence to specific value
identifierService.setSequence('qrl.trading.order', 1000);

// Next generated will be 1001
const id = identifierService.generateEventId('qrl', 'trading', 'order');
// Sequence: 1001

// Get current sequence
const current = identifierService.getCurrentSequence('qrl.trading.order');
// Returns: 1001

// Reset sequence
identifierService.resetSequence('qrl.trading.order');
// Next generated will be 1
```

### Sequence Configuration

```typescript
const config = identifierService.getSequenceConfig('qrl.trading.order');
// Returns:
// {
//   namespace: "qrl.trading.order",
//   currentSequence: 1001,
//   increment: 1,
//   startFrom: 1,
//   lastUpdated: Date
// }
```

## Best Practices

### 1. Namespace Design

✅ **Do:**
- Use meaningful tenant identifiers (organization/user names)
- Use clear business contexts (domain areas)
- Use specific aggregate types (entity names)

❌ **Don't:**
- Mix unrelated contexts in the same namespace
- Use generic names (data, info, stuff)
- Create too many granular namespaces

### 2. Sequence Generation

✅ **Do:**
- Use auto-increment for most cases
- Preserve sequence order for audit trails
- Document sequence resets

❌ **Don't:**
- Manually set sequences unless necessary
- Reset sequences in production
- Reuse sequence numbers

### 3. Event References

✅ **Do:**
- Always use the full reference format (namespace#sequence)
- Validate event references before use
- Store the full reference string

❌ **Don't:**
- Use only sequence numbers without namespace
- Assume namespace structure without parsing
- Hardcode namespace components

### 4. Multi-Tenant Usage

✅ **Do:**
- Use tenant component for access control
- Validate tenant membership before operations
- Filter queries by tenant namespace

❌ **Don't:**
- Allow cross-tenant event access
- Mix tenant data in queries
- Expose tenant boundaries in UI without permission

## Examples from Real-World Scenarios

### GitHub-Style Issue Tracking

```typescript
// Repository: openai/chatgpt
// Issue #1287
const issueId = identifierService.generateEventId(
  'openai',      // Organization (tenant)
  'chatgpt',     // Repository (context)
  'issue',       // Issue (aggregate)
  1287           // Issue number
);
// Result: openai.chatgpt.issue#1287
```

### Trading System

```typescript
// Order placed
const orderId = identifierService.generateEventId(
  'qrl',         // Trader
  'trading-bot', // System context
  'order',       // Order aggregate
  1024
);
// Result: qrl.trading-bot.order#1024

// Risk alert triggered
const alertId = identifierService.generateEventId(
  'qrl',
  'risk-control',
  'alert',
  2048
);
// Result: qrl.risk-control.alert#2048
```

### Project Management

```typescript
// Project task
const taskId = identifierService.generateEventId(
  'acme',          // Company
  'project-alpha', // Project
  'task',          // Task aggregate
  42
);
// Result: acme.project-alpha.task#42
```

## API Reference

See `EventIdentifierService` in `src/app/core/services/event-identifier.service.ts` for complete API documentation.

### Key Methods

- `generateEventId(tenant, context, aggregate, sequence?)`: Generate new identifier
- `parseEventId(fullReference)`: Parse reference string
- `validateNamespace(namespace)`: Validate namespace format
- `buildNamespace(tenant, context, aggregate)`: Build namespace path
- `parseNamespace(namespace)`: Parse namespace into components
- `createIdentifiedEvent(identifier, level, eventType?, payload?, metadata?)`: Create event at specific level
- `formatEventReference(tenant, context, aggregate, sequence)`: Format reference string
- `extractTenant(identifier)`: Get tenant from identifier
- `belongsToTenant(identifier, tenant)`: Check tenant membership

## Related Documentation

- [Multi-Tenant Architecture](../identity-tenancy/README.md)
- [Event Bus Documentation](../event-bus/README.md)
- [Four-Layer Event Model](../Layer%20L-1~L2.md)
- [Identity & Context](./identity-context.model.ts)
