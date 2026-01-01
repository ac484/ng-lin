# 11 Architecture Enforcement Rules

**Tool**: `eslint-rules/no-architecture-violations.js`  
**Goal**: Make architecture violations structurally impossible

## Layer Isolation Rules

### Rule 1: domain ❌ cannot import process
```typescript
// ❌ Violation
import { IssueLifecycle } from '../../processes/issue-lifecycle';

// ✅ Correct: domain stays pure
```

### Rule 2: domain ❌ cannot import ui
```typescript
// ❌ Violation
import { IssueListComponent } from '../ui/issue-list.component';

// ✅ Correct: domain doesn't know UI
```

### Rule 3: domain ❌ cannot import firebase
```typescript
// ❌ Violation
import { Firestore } from '@angular/fire/firestore';

// ✅ Correct
import { IRepository } from '@app/core/infrastructure/abstractions/interfaces/repository.interface';
```

### Rule 4: process ❌ cannot import ui
```typescript
// ❌ Violation
import { IssueFormComponent } from '../../domains/issue/ui/issue-form.component';

// ✅ Correct: process orchestrates logic, not UI
```

### Rule 5: capability ❌ cannot import domain private model
```typescript
// ❌ Violation
import { IssueEntity } from '../../domains/issue/domain/entities/issue.entity';

// ✅ Correct
import { IssueContract } from '@app/features/contracts/issue.contract';
```

### Rule 6: ui ❌ cannot import domain
```typescript
// ❌ Violation
import { IssueEntity } from '../../domains/issue/domain/issue.entity';

// ✅ Correct: use contracts
import { IssueContract } from '@app/features/contracts/issue.contract';
```

### Rule 7: infrastructure ❌ cannot import feature
```typescript
// ❌ Violation
import { Issue } from '@app/features/domains/issue/models/issue.model';

// ✅ Correct: infrastructure only implements core interfaces
```

### Rule 8: feature ❌ cannot import infrastructure
```typescript
// ❌ Violation
import { FirebaseRepository } from '@app/infrastructure/firebase/repositories/base.repository';

// ✅ Correct: use DI
import { IRepository } from '@app/core/infrastructure/abstractions/interfaces/repository.interface';
import { inject } from '@angular/core';

export class IssueService {
  private repository = inject<IRepository<Issue>>(ISSUE_REPOSITORY_TOKEN);
}
```

### Rule 9: core ❌ cannot import firebase
```typescript
// ❌ Violation
import { Firestore } from '@angular/fire/firestore';

// ✅ Correct: core defines interfaces, infrastructure implements
export interface IEventStore {
  save(event: CausalEvent): Promise<void>;
}
```

## Error Handling Rules

### Rule 10: Forbidden `new Error()`
```typescript
// ❌ Violation
throw new Error('Issue not found');

// ✅ Correct
import { ErrorFactory } from '@app/core/error/error-factory';
return Result.Err(
  ErrorFactory.create({
    code: ErrorCode.NOT_FOUND,
    message: 'Issue not found'
  })
);
```

### Rule 11: Forbidden `throw` keyword
```typescript
// ❌ Violation
if (!issue) throw new Error('Not found');

// ✅ Correct
if (!issue) {
  return Result.Err(ErrorFactory.create({ code: ErrorCode.NOT_FOUND }));
}
```

## Exceptions

**Test Files (.spec.ts)**: Can use `throw` and `new Error()`  
**Infrastructure Layer**: Can use `throw` at external boundaries  
**error-factory.ts**: Can use `new Error()` in implementation

## Validation
```bash
npm run lint:ts     # Check all rules
```

## Breaking Rules
Exceptional cases require:
1. ADR documentation
2. Team approval  
3. ESLint disable comment with justification

## References
- ADR-0002: ESLint Architecture Enforcement
- Implementation: `eslint-rules/no-architecture-violations.js`
