# Three-Layer Event Model Implementation

This module implements the Three-Layer Event Model architecture as specified in the GigHub blueprint documentation.

## Overview

The Three-Layer Model ensures data integrity, traceability, and accountability:

- **L0 (Governance Layer)**: Defines rules, permissions, and scope
- **L1 (Fact Layer)**: Immutable construction events with evidence
- **L2 (Derived Layer)**: Calculated insights from L1 facts

## Architecture

```
L0 (Governance) → Defines rules for → L1 (Facts) → Source for → L2 (Derived)
```

### Data Flow Rules

1. **One-Way Flow**: L0 → L1 → L2 (never reverse)
2. **Immutability at L1**: Events cannot be modified or deleted
3. **L2 Recomputation**: Derived states can be regenerated from L1

## Components

### Models

- `layer-types.ts`: TypeScript interfaces for L0, L1, L2 events
- `result.type.ts`: Result pattern for type-safe error handling

### Services

- `PolicyValidationService`: Validates L1 event creation against L0 rules
- `WorkflowOrchestrator`: Coordinates multi-step workflows with saga pattern

### Repositories

- `BaseRepository`: Generic Firestore repository with Result pattern
- `GovernanceRepository`: L0 governance events (can be updated)
- `ConstructionEventsRepository`: L1 immutable events (append-only)
- `DerivedStateRepository`: L2 calculated states (can be recomputed)

## Usage Examples

### Creating an L1 Event with Policy Check

```typescript
import { inject } from '@angular/core';
import {
  PolicyValidationService,
  ConstructionEventsRepository,
  GovernanceRepository,
  ConstructionEvent,
  isSuccess
} from '@core';

export class TaskService {
  private policyService = inject(PolicyValidationService);
  private eventsRepo = inject(ConstructionEventsRepository);
  private governanceRepo = inject(GovernanceRepository);

  async recordConcretePour(data: Omit<ConstructionEvent, 'id'>): Promise<void> {
    // 1. Get governance rules
    const rulesResult = await this.governanceRepo.getActiveRulesForContract(
      data.contractId!
    );
    
    if (!isSuccess(rulesResult)) {
      throw new Error('Cannot load governance rules');
    }

    // 2. Validate against policy
    const policyCheck = await this.policyService.validateEventCreation(
      data,
      rulesResult.value
    );

    if (!isSuccess(policyCheck)) {
      throw policyCheck.error; // PolicyViolationError
    }

    // 3. Validate evidence
    const evidenceCheck = this.policyService.validateEvidence(data);
    if (!isSuccess(evidenceCheck)) {
      throw evidenceCheck.error;
    }

    // 4. Create immutable L1 event
    const result = await this.eventsRepo.create(data);
    
    if (!isSuccess(result)) {
      throw result.error;
    }

    console.log('Event created:', result.value);
  }
}
```

### Using Workflow Orchestrator

```typescript
import { inject } from '@angular/core';
import { WorkflowOrchestrator } from '@core';
import { EVENT_BUS } from '@core/event-bus';

export class TaskCompletionService {
  private eventBus = inject(EVENT_BUS);
  private orchestrator = inject(WorkflowOrchestrator);

  completeTask(taskId: string): void {
    // Emit event - workflow will automatically trigger
    this.eventBus.emit('task.completed', {
      taskId,
      requiresInspection: true,
      stakeholders: ['pm@example.com', 'owner@example.com']
    });

    // Orchestrator handles:
    // 1. Update progress
    // 2. Trigger QC inspection
    // 3. Notify stakeholders
  }
}
```

### Repository with Result Pattern

```typescript
import { inject } from '@angular/core';
import { ConstructionEventsRepository, isSuccess } from '@core';

export class EventQueryService {
  private eventsRepo = inject(ConstructionEventsRepository);

  async getTaskEvents(taskId: string): Promise<void> {
    const result = await this.eventsRepo.getEventsForTask(taskId);

    if (isSuccess(result)) {
      console.log('Events:', result.value);
    } else {
      console.error('Error:', result.error);
    }
  }
}
```

### Creating Correction Events

```typescript
import { inject } from '@angular/core';
import { ConstructionEventsRepository, CorrectionEvent } from '@core';

export class CorrectionService {
  private eventsRepo = inject(ConstructionEventsRepository);

  async correctLocation(originalEventId: string, newLocation: string): Promise<void> {
    // Cannot update original event - create correction
    const correctionEvent: Omit<CorrectionEvent, 'id'> = {
      type: 'construction.concrete_pour_completed',
      timestamp: new Date(),
      actor: 'engineer@example.com',
      target: {
        type: 'confirmed',
        location: newLocation
      },
      evidence: [
        {
          type: 'document',
          timestamp: new Date(),
          url: 'https://example.com/correction-form.pdf'
        }
      ],
      corrects: originalEventId,
      correctionReason: 'Location survey error in original record',
      originalEvent: {
        id: originalEventId,
        type: 'construction.concrete_pour_completed',
        timestamp: new Date() // Get from original
      }
    };

    await this.eventsRepo.create(correctionEvent);
  }
}
```

## Firestore Security Rules

L1 immutability is enforced at the database level:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // L1: Construction Events - Append-only
    match /constructionEvents/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && validateL1Event();
      allow update, delete: if false; // IMMUTABLE
    }

    function validateL1Event() {
      return request.resource.data.evidence.size() > 0 &&
             request.resource.data.target != null &&
             request.resource.data.timestamp != null;
    }
  }
}
```

## Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { PolicyValidationService, Ok, Err, isSuccess } from '@core';

describe('PolicyValidationService', () => {
  let service: PolicyValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyValidationService);
  });

  it('should validate evidence requirements', () => {
    const event = {
      type: 'construction.concrete_pour_completed',
      evidence: []
    };

    const result = service.validateEvidence(event);

    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error.name).toBe('PolicyViolationError');
    }
  });
});
```

## References

- Blueprint Documentation: `docs/strategy-governance/blueprint/system/03-three-layer-model.md`
- Event-Driven Architecture: `docs/strategy-governance/blueprint/system/04-event-driven-architecture.md`
- Quick Reference: `docs/strategy-governance/blueprint/guides/quick-reference-guide.md`
