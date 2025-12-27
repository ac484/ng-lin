# SETC-05: Testing Strategy - GigHub

> **Document Type**: System Engineering Technical Concept - Testing  
> **SETC Document**: 05 of 06  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Classification**: Internal Use

---

## Document Purpose

This document defines the comprehensive testing strategy for the GigHub construction site management system, covering all testing levels, methodologies, and quality gates.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Levels](#testing-levels)
3. [Test Coverage Requirements](#test-coverage-requirements)
4. [Testing Tools & Frameworks](#testing-tools--frameworks)
5. [Quality Gates](#quality-gates)

---

## Testing Overview

### Testing Pyramid

```
               ╱╲
              ╱E2E╲          10% - End-to-End Tests
             ╱────╲
            ╱ Intg ╲         20% - Integration Tests
           ╱────────╲
          ╱   Unit   ╲       70% - Unit Tests
         ╱────────────╲
```

**Principles**:
1. **Fast Feedback**: Unit tests run in milliseconds
2. **Comprehensive Coverage**: >80% code coverage
3. **Realistic Scenarios**: E2E tests mirror production
4. **Continuous Testing**: Tests run on every commit
5. **Shift Left**: Test early, test often

---

## Testing Levels

### 1. Unit Testing

**Scope**: Individual functions, classes, and components

**Coverage Target**: >80%

**Tools**:
- **Framework**: Jasmine + Karma
- **Utilities**: @testing-library/angular
- **Mocking**: jasmine.createSpy

**Example - Service Unit Test**:
```typescript
import { TestBed } from '@angular/core/testing';
import { ContractService } from './contract.service';
import { ContractRepository } from './repositories/contract.repository';
import { EventBus } from '@core/event-bus';

describe('ContractService', () => {
  let service: ContractService;
  let mockRepository: jasmine.SpyObj<ContractRepository>;
  let mockEventBus: jasmine.SpyObj<EventBus>;
  
  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('ContractRepository', ['create', 'findById', 'update']);
    mockEventBus = jasmine.createSpyObj('EventBus', ['emit']);
    
    TestBed.configureTestingModule({
      providers: [
        ContractService,
        { provide: ContractRepository, useValue: mockRepository },
        { provide: EventBus, useValue: mockEventBus }
      ]
    });
    
    service = TestBed.inject(ContractService);
  });
  
  describe('createContract', () => {
    it('should create contract and emit event', async () => {
      const contractData = {
        owner: 'owner@example.com',
        contractor: 'contractor@example.com',
        amount: 5000000
      };
      
      const mockContract = { id: 'CONTRACT-001', ...contractData };
      mockRepository.create.and.returnValue(Promise.resolve(mockContract));
      
      const result = await service.createContract(contractData);
      
      expect(mockRepository.create).toHaveBeenCalledWith(contractData);
      expect(mockEventBus.emit).toHaveBeenCalledWith('contract.created', jasmine.objectContaining({
        contractId: 'CONTRACT-001'
      }));
      expect(result).toEqual(mockContract);
    });
    
    it('should throw error when repository fails', async () => {
      mockRepository.create.and.returnValue(Promise.reject(new Error('Database error')));
      
      await expectAsync(service.createContract({})).toBeRejectedWithError('Database error');
    });
  });
});
```

**Example - Component Unit Test**:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractListComponent } from './contract-list.component';
import { ContractFacade } from '@core/modules/contract';
import { signal } from '@angular/core';

describe('ContractListComponent', () => {
  let component: ContractListComponent;
  let fixture: ComponentFixture<ContractListComponent>;
  let mockFacade: jasmine.SpyObj<ContractFacade>;
  
  beforeEach(async () => {
    mockFacade = jasmine.createSpyObj('ContractFacade', ['getContracts']);
    
    await TestBed.configureTestingModule({
      imports: [ContractListComponent],
      providers: [
        { provide: ContractFacade, useValue: mockFacade }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ContractListComponent);
    component = fixture.componentInstance;
  });
  
  it('should load contracts on init', async () => {
    const mockContracts = [
      { id: 'CONTRACT-001', status: 'active' },
      { id: 'CONTRACT-002', status: 'completed' }
    ];
    
    mockFacade.getContracts.and.returnValue(Promise.resolve(mockContracts));
    
    await component.ngOnInit();
    
    expect(component.contracts()).toEqual(mockContracts);
    expect(component.loading()).toBe(false);
  });
  
  it('should filter contracts by status', () => {
    component.contracts.set([
      { id: 'CONTRACT-001', status: 'active' },
      { id: 'CONTRACT-002', status: 'completed' }
    ]);
    component.filter.set('active');
    
    const filtered = component.filteredContracts();
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('CONTRACT-001');
  });
});
```

**Example - Policy Unit Test**:
```typescript
import { ContractPolicyService } from './contract-policy.service';

describe('ContractPolicyService', () => {
  let policyService: ContractPolicyService;
  
  beforeEach(() => {
    policyService = new ContractPolicyService();
  });
  
  describe('canCreateTask', () => {
    it('should allow task creation for active contract', () => {
      const contract = { status: 'active' };
      expect(policyService.canCreateTask(contract)).toBe(true);
    });
    
    it('should deny task creation for inactive contract', () => {
      const contract = { status: 'pending' };
      expect(policyService.canCreateTask(contract)).toBe(false);
    });
    
    it('should deny task creation for completed contract', () => {
      const contract = { status: 'completed' };
      expect(policyService.canCreateTask(contract)).toBe(false);
    });
  });
});
```

---

### 2. Integration Testing

**Scope**: Module interactions, database operations, API calls

**Coverage Target**: >70%

**Tools**:
- **Framework**: Jasmine + Karma
- **Firebase**: Firebase Emulator Suite
- **HTTP**: HttpClientTestingModule

**Example - Repository Integration Test**:
```typescript
import { TestBed } from '@angular/core/testing';
import { ContractRepositoryImpl } from './contract.repository.impl';
import { Firestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { initializeApp } from '@angular/fire/app';

describe('ContractRepositoryImpl (Integration)', () => {
  let repository: ContractRepositoryImpl;
  let firestore: Firestore;
  
  beforeAll(() => {
    // Connect to Firestore emulator
    const app = initializeApp({ projectId: 'test-project' });
    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  });
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContractRepositoryImpl,
        { provide: Firestore, useValue: firestore }
      ]
    });
    
    repository = TestBed.inject(ContractRepositoryImpl);
  });
  
  afterEach(async () => {
    // Clear test data
    const snapshot = await getDocs(collection(firestore, 'contracts'));
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
  });
  
  it('should create and retrieve contract', async () => {
    const contractData = {
      owner: 'owner@example.com',
      contractor: 'contractor@example.com',
      amount: 5000000
    };
    
    const created = await repository.create(contractData);
    expect(created.id).toBeDefined();
    
    const retrieved = await repository.findById(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.owner).toBe(contractData.owner);
  });
  
  it('should update contract', async () => {
    const contract = await repository.create({ owner: 'owner@example.com' });
    
    const updated = await repository.update(contract.id, { status: 'active' });
    
    expect(updated.status).toBe('active');
  });
});
```

**Example - Event Bus Integration Test**:
```typescript
import { TestBed } from '@angular/core/testing';
import { EnhancedEventBus } from './enhanced-event-bus.service';
import { firstValueFrom } from 'rxjs';

describe('EnhancedEventBus (Integration)', () => {
  let eventBus: EnhancedEventBus;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnhancedEventBus]
    });
    
    eventBus = TestBed.inject(EnhancedEventBus);
  });
  
  it('should emit and receive events', async () => {
    const eventPromise = firstValueFrom(eventBus.on('test.event'));
    
    eventBus.emit('test.event', { message: 'Hello' });
    
    const event = await eventPromise;
    expect(event.type).toBe('test.event');
    expect(event.data.message).toBe('Hello');
  });
  
  it('should preserve correlation ID', async () => {
    const correlationId = 'test-correlation-123';
    const eventPromise = firstValueFrom(eventBus.on('test.event'));
    
    eventBus.emit('test.event', {}, { correlationId });
    
    const event = await eventPromise;
    expect(event.correlationId).toBe(correlationId);
  });
});
```

---

### 3. End-to-End Testing

**Scope**: Complete user workflows, cross-module integration

**Coverage Target**: Critical paths (20-30 scenarios)

**Tools**:
- **Framework**: Cypress or Playwright
- **Environment**: Staging environment

**Example - E2E Test (Cypress)**:
```typescript
describe('Contract to Task Workflow', () => {
  beforeEach(() => {
    cy.login('contractor@example.com', 'password123');
  });
  
  it('should complete full workflow: Create Contract → Activate → Create Task', () => {
    // Step 1: Create Contract
    cy.visit('/contracts/new');
    cy.get('[data-testid="contract-owner"]').type('owner@example.com');
    cy.get('[data-testid="contract-contractor"]').type('contractor@example.com');
    cy.get('[data-testid="contract-amount"]').type('5000000');
    cy.get('[data-testid="submit-contract"]').click();
    
    cy.url().should('include', '/contracts/');
    cy.get('[data-testid="contract-status"]').should('contain', 'Pending Activation');
    
    // Step 2: Activate Contract (as Owner)
    cy.loginAs('owner@example.com');
    cy.visit('/contracts');
    cy.get('[data-testid="contract-item"]').first().click();
    cy.get('[data-testid="activate-contract"]').click();
    cy.get('[data-testid="confirm-activation"]').click();
    
    cy.get('[data-testid="contract-status"]').should('contain', 'Active');
    
    // Step 3: Create Task
    cy.loginAs('contractor@example.com');
    cy.get('[data-testid="create-task"]').click();
    cy.get('[data-testid="task-title"]').type('Install Rebar');
    cy.get('[data-testid="task-description"]').type('Install rebar for B1F-C3 column');
    cy.get('[data-testid="submit-task"]').click();
    
    cy.get('[data-testid="task-status"]').should('contain', 'Created');
  });
  
  it('should prevent task creation for inactive contract', () => {
    cy.visit('/contracts/new');
    // Create contract but don't activate
    
    cy.get('[data-testid="create-task"]').should('be.disabled');
  });
});
```

---

### 4. Security Testing

**Scope**: Authentication, authorization, data security

**Coverage Target**: All security-critical paths

**Example - Firestore Security Rules Test**:
```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  it('should deny unauthenticated reads', async () => {
    const db = getFirestore(); // Unauthenticated
    const docRef = doc(db, 'contracts', 'CONTRACT-001');
    
    await assertFails(getDoc(docRef));
  });
  
  it('should allow authenticated reads', async () => {
    const db = getFirestore({ uid: 'user123' }); // Authenticated
    const docRef = doc(db, 'contracts', 'CONTRACT-001');
    
    await assertSucceeds(getDoc(docRef));
  });
  
  it('should prevent L1 event updates', async () => {
    const db = getFirestore({ uid: 'user123' });
    const eventRef = doc(db, 'constructionEvents', 'EVENT-001');
    
    // Create is allowed
    await assertSucceeds(setDoc(eventRef, {
      type: 'concrete_pour',
      actor: 'user123',
      timestamp: new Date(),
      evidence: [{ type: 'photo', url: 'https://...' }]
    }));
    
    // Update is forbidden
    await assertFails(updateDoc(eventRef, { location: 'new-location' }));
    
    // Delete is forbidden
    await assertFails(deleteDoc(eventRef));
  });
});
```

---

### 5. Performance Testing

**Scope**: Load, stress, and scalability testing

**Coverage Target**: All critical operations

**Tools**:
- **Load Testing**: k6 or Locust
- **Performance Monitoring**: Lighthouse, Firebase Performance

**Example - k6 Load Test**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests < 1s
    http_req_failed: ['rate<0.01'],    // <1% error rate
  },
};

export default function () {
  // Login
  const loginRes = http.post('https://api.gighub.com/auth/login', {
    email: 'test@example.com',
    password: 'password123',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  const token = loginRes.json('token');
  
  // List contracts
  const contractsRes = http.get('https://api.gighub.com/contracts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  check(contractsRes, {
    'contracts loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
```

---

## Test Coverage Requirements

### Minimum Coverage Targets

| Test Type | Coverage | Measurement |
|-----------|----------|-------------|
| **Unit Tests** | >80% | Lines, branches |
| **Integration Tests** | >70% | Critical paths |
| **E2E Tests** | 100% | User workflows |
| **Security Tests** | 100% | Security rules |

### Coverage by Module

| Module | Unit | Integration | E2E | Priority |
|--------|------|-------------|-----|----------|
| Event Bus | 95% | 90% | N/A | P0 |
| Audit | 90% | 85% | N/A | P0 |
| Contract | 80% | 75% | ✅ | P1 |
| Task | 80% | 75% | ✅ | P1 |
| QA | 85% | 80% | ✅ | P1 |
| Acceptance | 85% | 80% | ✅ | P1 |
| Finance | 90% | 85% | ✅ | P2 |
| Warranty | 80% | 75% | ⚠️ | P2 |

---

## Testing Tools & Frameworks

### Frontend Testing

**Unit & Integration**:
- Jasmine (test framework)
- Karma (test runner)
- @testing-library/angular (utilities)
- jasmine.createSpy (mocking)

**E2E**:
- Cypress or Playwright
- Firebase Emulator Suite

**Commands**:
```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run e2e

# E2E tests (headless)
npm run e2e:headless
```

### Backend Testing

**Firebase Functions**:
- Firebase Emulator Suite
- Jest (for Cloud Functions)

**Security Rules**:
- @firebase/rules-unit-testing
- Firebase Emulator

**Commands**:
```bash
# Start emulators
npm run emulators

# Test security rules
npm run test:rules

# Test Cloud Functions
npm run test:functions
```

---

## Quality Gates

### Pre-Commit

- ✅ Linter passes (ESLint, Prettier)
- ✅ TypeScript compiles without errors
- ✅ Unit tests pass

### Pull Request

- ✅ All tests pass (unit + integration)
- ✅ Code coverage >80%
- ✅ Security tests pass
- ✅ Code review approved

### Pre-Production

- ✅ E2E tests pass
- ✅ Performance tests pass
- ✅ Security audit clean
- ✅ Accessibility tests pass (WCAG 2.1 AA)

### Production

- ✅ Smoke tests pass
- ✅ Monitoring alerts configured
- ✅ Rollback plan ready

---

## Testing Checklist

### For Every Feature

- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests for Firestore operations
- [ ] E2E tests for critical workflows
- [ ] Security tests for authorization
- [ ] Performance tests for heavy operations
- [ ] Accessibility tests (if UI)
- [ ] Error scenarios tested
- [ ] Edge cases covered

### Before Release

- [ ] All tests passing
- [ ] Coverage targets met
- [ ] Security audit clean
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Release notes prepared

---

## References

- [SETC Requirements](./SETC-02-requirements.md)
- [Implementation Plan](./SETC-04-implementation-plan.md)
- [System Architecture](../system/02-system-architecture.md)

---

**SETC Status**: ✅ Complete  
**Approval**: Pending QA Review  
**Next Review**: After Phase 1 completion
