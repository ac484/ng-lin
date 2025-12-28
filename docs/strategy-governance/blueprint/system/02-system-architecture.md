# System Architecture - GigHub

> **Document Type**: Technical Architecture Specification  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Audience**: Architects, Senior Developers

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layered Architecture](#layered-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Integration Architecture](#integration-architecture)

---

## Architecture Overview

### System Context Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        External Systems                         │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │ Firebase │  │ Google Cloud│  │  Vertex AI   │              │
│  │  Cloud   │  │   Storage   │  │  (OCR/ML)    │              │
│  └────┬─────┘  └──────┬──────┘  └──────┬───────┘              │
└───────┼────────────────┼─────────────────┼────────────────────┘
        │                │                 │
        └────────────────┼─────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │         GigHub Platform                  │
    │  ┌──────────────────────────────────┐  │
    │  │     Frontend (Angular 20)        │  │
    │  │  - Web App                        │  │
    │  │  - Mobile Responsive             │  │
    │  └──────────────────────────────────┘  │
    │              ↕ (HTTPS/WSS)              │
    │  ┌──────────────────────────────────┐  │
    │  │   Backend (Firebase)             │  │
    │  │  - Cloud Functions               │  │
    │  │  - Firestore                     │  │
    │  │  - Firebase Auth                 │  │
    │  │  - Cloud Storage                 │  │
    │  └──────────────────────────────────┘  │
    └─────────────────────────────────────────┘
                  ↕
    ┌─────────────────────────────────────────┐
    │          End Users                       │
    │  - Owners                                │
    │  - Contractors                           │
    │  - Inspectors                            │
    │  - Workers                               │
    └─────────────────────────────────────────┘
```

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web UI     │  │  Mobile UI   │  │   Dashboards │          │
│  │  (Angular)   │  │  (Angular)   │  │  (ng-alain)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Features (Domain Modules)                   │    │
│  │  - Account  - Issues  - Explore  - AI Assistant        │    │
│  │  - Auth     - Social  - Discussions                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                     Core/Blueprint Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Event Bus   │  │   Workflow   │  │    Audit     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Policies   │  │   Modules    │  │  Facades     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Firestore   │  │    Auth      │  │   Storage    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Functions   │  │   Vertex AI  │  │   Analytics  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layered Architecture

### Layer Responsibilities

#### 1. Presentation Layer
**Purpose**: User interface and user experience

**Components**:
- Angular 20 Components (Standalone)
- ng-alain UI Framework
- ng-zorro-antd Component Library
- Angular Signals for State Management
- Responsive Design (Desktop + Mobile)

**Responsibilities**:
- Render UI components
- Handle user interactions
- Manage local component state
- Display data from application layer
- Route navigation

**Forbidden**:
- ❌ Direct Firestore access
- ❌ Business logic implementation
- ❌ Direct event bus access (use facades)

#### 2. Application Layer (Features)
**Purpose**: Feature modules and use cases

**Components**:
- Feature modules (account, issues, explore, etc.)
- Feature-specific services
- View models and DTOs
- Route configurations

**Responsibilities**:
- Implement use cases
- Coordinate between UI and core
- Transform data for presentation
- Handle feature-specific navigation
- Manage feature state

**Communication**:
- ✅ Call facade layer for core operations
- ✅ Subscribe to relevant events
- ✅ Use shared services for cross-feature concerns

#### 3. Core/Blueprint Layer
**Purpose**: System backbone and business logic

**Sub-Layers**:

##### 3.1 Event Bus
- Event publishing and subscription
- Event routing and filtering
- Correlation ID tracking
- Event versioning

##### 3.2 Workflow Orchestrator
- Multi-step process coordination
- Saga pattern for compensations
- State machine management
- Handler registration

##### 3.3 Audit System
- Immutable audit logging
- Action tracking (who, what, when, why)
- Compliance reporting
- Traceability support

##### 3.4 Policies
- Cross-module business rules
- State transition validation
- Permission matrix logic
- System-level guards

##### 3.5 Modules
Blueprint modules implementing core domain logic:
- **Contract**: Contract lifecycle
- **Task**: Task management
- **Acceptance**: Approval workflows
- **Finance**: Financial operations
- **Warranty**: Warranty tracking
- **Issue**: Issue tracking
- **Asset**: File management
- **QA**: Quality assurance

Each module structure:
```
module-name/
├── models/          # Domain models
├── services/        # Business logic
├── repositories/    # Data access
├── events/          # Module events
├── policies/        # Module policies
├── facade/          # Public API
└── config/          # Configuration
```

##### 3.6 Facades
- Public APIs for modules
- Orchestrate multiple services
- Handle cross-module operations
- Simplify complex workflows

**Responsibilities**:
- Implement business logic
- Enforce business rules
- Coordinate workflows
- Emit domain events
- Manage domain state

**Communication**:
- ✅ Use event bus for cross-module communication
- ✅ Access infrastructure layer through repositories
- ✅ Enforce policies before operations

#### 4. Infrastructure Layer
**Purpose**: External services and data persistence

**Components**:
- Firebase services (@angular/fire)
- Firestore repositories
- Firebase Functions
- Cloud Storage access
- Authentication providers
- External API integrations

**Responsibilities**:
- Data persistence (Firestore)
- File storage (Cloud Storage)
- User authentication (Firebase Auth)
- AI/ML operations (Vertex AI)
- External integrations

**Access Pattern**:
- Only accessed by Core/Blueprint Layer
- No direct access from Presentation or Application layers

---

## Component Architecture

### Blueprint Module Architecture

```
┌─────────────────────────────────────────────────────┐
│              Module Facade (Public API)             │
│  - Simplified interface for external consumers      │
│  - Orchestrates multiple services                   │
└────────────────┬────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      ↓                     ↓
┌──────────────┐      ┌──────────────┐
│   Services   │      │   Policies   │
│  (Business   │←────→│  (Business   │
│    Logic)    │      │    Rules)    │
└──────┬───────┘      └──────────────┘
       │
       ↓
┌──────────────┐      ┌──────────────┐
│ Repositories │      │    Events    │
│ (Data Access)│      │  (Publishing)│
└──────┬───────┘      └──────┬───────┘
       │                     │
       ↓                     ↓
┌──────────────┐      ┌──────────────┐
│  Firestore   │      │  Event Bus   │
└──────────────┘      └──────────────┘
```

### Event Flow Architecture

```
User Action (UI)
     ↓
Feature Service calls Facade
     ↓
Facade validates with Policy
     ↓
Service executes business logic
     ↓
Repository persists to Firestore
     ↓
Service emits Event
     ↓
Event Bus dispatches to subscribers
     ↓
Workflow Orchestrator reacts
     ↓
Next workflow step triggered
     ↓
Audit logs the action
```

### Three-Layer Data Flow

```
┌────────────────────────────────────────────┐
│  L0: Governance Layer                      │
│  - Contract terms                          │
│  - Approval rules                          │
│  - Access control policies                 │
│  - Scope definitions                       │
└────────────────┬───────────────────────────┘
                 │ (defines rules for)
                 ↓
┌────────────────────────────────────────────┐
│  L1: Fact Layer (Immutable)                │
│  - Construction events                     │
│  - Quality inspections                     │
│  - Approvals/Rejections                    │
│  - Evidence (photos, signatures, GPS)      │
└────────────────┬───────────────────────────┘
                 │ (source for calculations)
                 ↓
┌────────────────────────────────────────────┐
│  L2: Derived Layer (Computed)              │
│  - Progress percentage                     │
│  - Payment amounts                         │
│  - Schedule variance                       │
│  - Quality metrics                         │
└────────────────────────────────────────────┘
```

**Key Rules**:
1. L0 defines what L1 events are valid
2. L1 events are IMMUTABLE (append-only)
3. L2 is COMPUTED from L1 (can be recalculated)
4. No reverse dependencies (L2 → L1 or L1 → L0)

---

## Data Flow Architecture

### Write Path (Create Construction Event)

```
1. User Action
   ↓
2. UI Component → Feature Service
   ↓
3. Feature Service → Module Facade
   ↓
4. Facade → Policy Check
   ├─ Invalid → Return Error
   └─ Valid → Continue
       ↓
5. Facade → Module Service
   ↓
6. Service → Repository.create()
   ↓
7. Repository → Firestore.add()
   ↓
8. Service → EventBus.emit('event.created')
   ↓
9. EventBus → Notify Subscribers
   ├─ Workflow Orchestrator
   ├─ Audit Service
   └─ Other Interested Modules
   ↓
10. Workflow Orchestrator → Trigger Next Step
    ↓
11. Response → Back to UI
```

### Read Path (Query Data)

```
1. UI Component → Feature Service
   ↓
2. Feature Service → Module Facade
   ↓
3. Facade → Module Service
   ↓
4. Service → Repository.find()
   ↓
5. Repository → Firestore.query()
   ↓
6. Firestore → Return Documents
   ↓
7. Repository → Map to Domain Models
   ↓
8. Service → Apply Business Logic
   ↓
9. Facade → Return DTO
   ↓
10. Feature Service → Transform for UI
    ↓
11. UI Component → Display Data
```

### Event Processing Flow

```
Event Emitted
     ↓
Event Bus Receives Event
     ↓
┌────────────────────────┐
│  Event Routing         │
│  - Filter by type      │
│  - Check subscriptions │
│  - Add correlation ID  │
└────────┬───────────────┘
         │
         ├─→ Workflow Orchestrator
         │   └─→ Check workflow state
         │       └─→ Trigger next handler
         │
         ├─→ Audit Service
         │   └─→ Log to audit collection
         │
         └─→ Interested Module Services
             └─→ Execute business logic
                 └─→ Emit secondary events
```

---

## Security Architecture

### Authentication Flow

```
User Login
     ↓
Firebase Auth
     ├─→ Email/Password
     ├─→ Google OAuth
     └─→ Anonymous (limited access)
     ↓
Auth Token (JWT)
     ↓
@delon/auth Token Service
     ↓
Store in Angular State
     ↓
Attach to all API calls
```

### Authorization Layers

```
┌────────────────────────────────────────────┐
│  Layer 1: Firebase Auth                    │
│  - User authenticated?                     │
│  - Valid token?                            │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 2: Firestore Security Rules         │
│  - Resource-level permissions              │
│  - Read/write access                       │
│  - Field-level security                    │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 3: Application Policies             │
│  - Business rule validation                │
│  - State transition rules                  │
│  - Cross-module constraints                │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 4: UI Guards                        │
│  - Route protection                        │
│  - Feature toggles                         │
│  - Role-based UI rendering                 │
└────────────────────────────────────────────┘
```

### Data Security

**Firestore Security Rules Example**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.roles.hasAny([role]);
    }
    
    // Construction events (L1) - immutable
    match /constructionEvents/{eventId} {
      // Can read if authenticated
      allow read: if isAuthenticated();
      
      // Can only create, not update or delete
      allow create: if isAuthenticated() && 
                       request.resource.data.actor == request.auth.uid;
      allow update, delete: if false; // Immutable!
    }
    
    // Contracts
    match /contracts/{contractId} {
      allow read: if isAuthenticated();
      allow create, update: if hasRole('contractor') || hasRole('owner');
      allow delete: if hasRole('admin');
    }
  }
}
```

---

## Deployment Architecture

### Firebase Hosting Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Global CDN (Firebase Hosting)         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  US-WEST   │  │  US-EAST   │  │   ASIA     │         │
│  │   (Edge)   │  │   (Edge)   │  │  (Edge)    │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└─────────────────────────┬────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │  Firebase Origin (us-central1)   │
         │  - Angular SPA                   │
         │  - Static Assets                 │
         │  - Service Worker                │
         └────────────────┬────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │  Cloud Functions (us-central1)   │
         │  - API Endpoints                 │
         │  - Workflow Handlers             │
         │  - AI Integration                │
         └────────────────┬────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │  Firestore (multi-region)        │
         │  - User data                     │
         │  - Construction events           │
         │  - Audit logs                    │
         └──────────────────────────────────┘
```

### Environment Strategy

| Environment | Purpose | Deployment | Data |
|-------------|---------|------------|------|
| **Development** | Local dev | `ng serve` | Emulators |
| **Staging** | Testing | `firebase deploy --only hosting:staging` | Test data |
| **Production** | Live | `firebase deploy --only hosting:production` | Real data |

---

## Integration Architecture

### External System Integrations

```
┌─────────────────────────────────────────────────────┐
│              GigHub Core                             │
└────────────────┬────────────────────────────────────┘
                 │
      ┌──────────┼──────────┬──────────┬──────────┐
      │          │          │          │          │
      ↓          ↓          ↓          ↓          ↓
┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Firebase │ │ Vertex │ │ Cloud  │ │ Email  │ │ SMS    │
│ Services │ │   AI   │ │ Storage│ │ Service│ │ Gateway│
└──────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### API Integration Pattern

```typescript
// Example: Vertex AI Integration via Cloud Function
export const parseContract = onCall(async (request) => {
  const { contractPdfUrl } = request.data;
  
  // 1. Download PDF from Cloud Storage
  const pdfBuffer = await downloadFromStorage(contractPdfUrl);
  
  // 2. Call Vertex AI OCR
  const ocrResult = await vertexAI.extractText(pdfBuffer);
  
  // 3. Parse structured data
  const parsedData = await vertexAI.parseContractTerms(ocrResult);
  
  // 4. Emit event
  await eventBus.emit('contract.parsed', {
    contractId: request.data.contractId,
    parsedData
  });
  
  return { success: true, parsedData };
});
```

---

## Performance Architecture

### Caching Strategy

```
┌─────────────────────────────────────────────┐
│  L1: Browser Cache (Service Worker)        │
│  - Static assets (30 days)                 │
│  - API responses (10 min)                  │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│  L2: Application State (Angular Signals)    │
│  - Current user data                        │
│  - Active project data                      │
│  - Recently accessed items                  │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│  L3: Firestore Query Cache                  │
│  - Query results (5 min default)            │
│  - Real-time subscription cache             │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────────────────────────────────┐
│  L4: Cloud Function Response Cache          │
│  - Computed results (varies)                │
│  - AI/ML predictions (1 hour)               │
└─────────────────────────────────────────────┘
```

### Query Optimization

```typescript
// ✅ GOOD: Indexed query with pagination
const eventsRef = collection(firestore, 'constructionEvents');
const q = query(
  eventsRef,
  where('contractId', '==', contractId),
  where('status', '==', 'completed'),
  orderBy('timestamp', 'desc'),
  limit(50)
);

// ❌ BAD: No index, loads all data
const q = query(
  eventsRef,
  where('metadata.customField', '==', 'value') // No composite index!
);
```

---

## Scalability Considerations

### Horizontal Scaling

- **Frontend**: CDN-based distribution (automatic with Firebase Hosting)
- **Backend**: Serverless Cloud Functions (auto-scales to demand)
- **Database**: Firestore auto-sharding and replication

### Data Partitioning Strategy

```
Collections:
- /organizations/{orgId}/contracts/{contractId}
  └─ Partitioned by organization
  
- /constructionEvents/{eventId}
  └─ Global collection with contractId index
  
- /auditLogs/{year}/{month}/{logId}
  └─ Time-based partitioning for archive
```

---

## Monitoring & Observability

### Metrics Collection

```
Firebase Analytics
    └─→ User behavior tracking
    
Cloud Logging
    └─→ Application logs
        └─→ Error tracking
        └─→ Performance logs
        
Custom Metrics (Event Bus)
    └─→ Event processing times
    └─→ Workflow completion rates
    └─→ Policy violation counts
```

---

## Disaster Recovery

### Backup Strategy

- **Firestore**: Daily automated backups (Firebase built-in)
- **Cloud Storage**: Versioning enabled for all files
- **Configuration**: Infrastructure as Code (firebase.json, security rules)

### Recovery Time Objectives

- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 24 hours

---

## References

- [Three-Layer Event Model](../../G_three-layer-event-model.md)
- [Event-Driven Architecture](./04-event-driven-architecture.md)
- [Module Catalog](./05-module-catalog.md)
- [Security Model](./08-security-model.md)

---

**Document Status**: ✅ Complete  
**Next Review**: Q1 2026  
**Maintainer**: GigHub Architecture Team
