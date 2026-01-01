# Governance: Event Versioning & Schema Evolution

> **How to evolve events safely over time.**

## Event Schema Evolution

### The Problem
Events are immutable, but business requirements change.

### Example Scenario
```typescript
// Version 1: Simple title
{ type: 'TaskCreated', title: 'Fix bug' }

// Version 2: Add description (new field)
{ type: 'TaskCreated', title: 'Fix bug', description: 'Details here' }

// Version 3: Rename title → name (breaking change)
{ type: 'TaskCreated', name: 'Fix bug', description: 'Details here' }
```

**Challenge**: Old events must still be replayable.

---

## Event Versioning Strategies

### Strategy 1: Additive Changes Only (Recommended)
Only add new optional fields, never remove or rename.

```typescript
// V1
interface TaskCreatedV1 {
  type: 'TaskCreated';
  title: string;
}

// V2: Add description (optional)
interface TaskCreatedV2 {
  type: 'TaskCreated';
  title: string;
  description?: string; // New field, optional
}

// Replay handles both versions
function apply(state, event) {
  if (event.type === 'TaskCreated') {
    return {
      ...state,
      title: event.title,
      description: event.description || '' // Default for V1 events
    };
  }
}
```

**Pros**: Simple, backward compatible
**Cons**: Schema grows over time

---

### Strategy 2: Explicit Version Field
Add version field to events.

```typescript
interface TaskCreated {
  type: 'TaskCreated';
  version: number;
  data: TaskCreatedV1 | TaskCreatedV2 | TaskCreatedV3;
}

function apply(state, event) {
  if (event.type === 'TaskCreated') {
    switch (event.version) {
      case 1:
        return applyV1(state, event.data as TaskCreatedV1);
      case 2:
        return applyV2(state, event.data as TaskCreatedV2);
      case 3:
        return applyV3(state, event.data as TaskCreatedV3);
    }
  }
}
```

**Pros**: Explicit versioning, clear migration
**Cons**: More complex handlers

---

### Strategy 3: Upcasting
Convert old events to new format on load.

```typescript
function upcast(event: DomainEvent): DomainEvent {
  // V1 → V2: Add description
  if (event.type === 'TaskCreated' && !event.data.description) {
    return {
      ...event,
      data: {
        ...event.data,
        description: '' // Default value
      }
    };
  }
  
  // V2 → V3: Rename title → name
  if (event.type === 'TaskCreated' && event.data.title && !event.data.name) {
    return {
      ...event,
      data: {
        name: event.data.title, // Rename
        description: event.data.description
      }
    };
  }
  
  return event;
}

// Use upcaster during replay
function replay(events) {
  const upcastedEvents = events.map(upcast);
  return replayUpcastedEvents(upcastedEvents);
}
```

**Pros**: Centralized migration, clean handlers
**Cons**: Performance cost on every replay

---

## Breaking Change Procedures

### When Breaking Changes are Unavoidable

**Option 1: New Event Type**
```typescript
// Old event (deprecated)
TaskCreated { title, description }

// New event (replacement)
TaskCreatedV2 { name, description }

// Projection handles both
function apply(state, event) {
  if (event.type === 'TaskCreated' || event.type === 'TaskCreatedV2') {
    return {
      ...state,
      name: event.name || event.title // Support both
    };
  }
}
```

**Option 2: Event Migration**
```typescript
// One-time migration script
async function migrateEvents() {
  const oldEvents = await loadEvents({ type: 'TaskCreated', version: 1 });
  
  for (const oldEvent of oldEvents) {
    const newEvent = {
      ...oldEvent,
      version: 2,
      data: {
        name: oldEvent.data.title, // Migrate field
        description: oldEvent.data.description
      }
    };
    
    // Store migrated event (careful: not always possible)
    await updateEvent(oldEvent.id, newEvent);
  }
}
```

**⚠️ Warning**: Updating events violates immutability. Only use as last resort.

---

## Event Naming Conventions

### Naming Rules
✅ **Past tense**: TaskCreated (not CreateTask)
✅ **Business language**: OrderPlaced (not SaveOrderClicked)
✅ **Specific**: TaskAssigned (not TaskUpdated)
✅ **Avoid generics**: No EntityModified, DataChanged

### Examples
```typescript
// ✅ GOOD
TaskCreated
TaskStarted
TaskCompleted
TaskCommentAdded
TaskAssigned

// ❌ BAD
CreateTask        // Not past tense
TaskChanged       // Too generic
UpdateTaskStatus  // Not business language
ModifyTask        // Not specific
```

---

## Code Review Checklist for Events

### Before Committing New Events

- [ ] **Name is past tense** (TaskCreated, not CreateTask)
- [ ] **Business-meaningful** (understandable by non-developers)
- [ ] **Specific** (not generic like EntityUpdated)
- [ ] **Has causedBy field** (for causality tracking)
- [ ] **Backward compatible** (additive changes only)
- [ ] **Documented** (purpose and fields explained)
- [ ] **Tested** (replay works with new event)

### Before Modifying Existing Events

- [ ] **Is change additive?** (new optional fields only)
- [ ] **Tested with old events** (replay still works)
- [ ] **Migration plan** (if breaking change unavoidable)
- [ ] **Rollback plan** (if migration fails)
- [ ] **Versioning strategy** (explicit version or upcasting)

---

## Event Whitelist Enforcement

### Principle
Only approved events can be emitted.

### Implementation
```typescript
const ALLOWED_EVENT_TYPES = [
  'TaskCreated',
  'TaskStarted',
  'TaskCompleted',
  'TaskCommentAdded',
  'TaskAssigned',
  // ... full catalog
];

function validateEvent(event: DomainEvent): void {
  if (!ALLOWED_EVENT_TYPES.includes(event.type)) {
    throw new Error(`Event type '${event.type}' not in whitelist`);
  }
}
```

### Why Whitelist?
- Prevent accidental "garbage" events
- Enforce naming conventions
- Enable migration planning
- Document event catalog

---

## Deprecation Process

### Step 1: Mark as Deprecated
```typescript
/**
 * @deprecated Use TaskCreatedV2 instead
 */
interface TaskCreated {
  type: 'TaskCreated';
  title: string;
}
```

### Step 2: Add Warning
```typescript
function apply(state, event) {
  if (event.type === 'TaskCreated') {
    console.warn('TaskCreated is deprecated, use TaskCreatedV2');
    // ... handle event
  }
}
```

### Step 3: Migration Period
- Keep old event support for 6+ months
- Log usage metrics
- Notify teams of deprecation

### Step 4: Remove Support
- After migration period
- Remove old event handlers
- Keep upcaster for historical events

---

## Event Catalog Maintenance

### Event Registry
```typescript
interface EventCatalog {
  type: string;
  version: number;
  description: string;
  fields: Field[];
  since: string;
  deprecated?: string;
}

const EVENT_CATALOG: EventCatalog[] = [
  {
    type: 'TaskCreated',
    version: 1,
    description: 'Task was created by a user',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: false }
    ],
    since: '2025-01-01'
  },
  // ... more events
];
```

### Documentation
- Maintain event catalog in `docs/99-appendix/event-catalog.md`
- Update on every new event or schema change
- Review quarterly for deprecated events

---

## Location

```
src/app/features/task/events/
├── task.events.ts              # Event definitions
├── task-event-versioning.ts    # Upcasters
├── task-event-whitelist.ts     # Allowed event types
└── index.ts
```

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
