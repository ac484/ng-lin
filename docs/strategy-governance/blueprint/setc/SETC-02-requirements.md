# SETC-02: Requirements Specification - GigHub

> **Document Type**: System Engineering Technical Concept - Requirements  
> **SETC Document**: 02 of 06  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Classification**: Internal Use

---

## Document Purpose

This document specifies the complete functional and non-functional requirements for the GigHub construction site management system.

---

## Table of Contents

1. [Functional Requirements](#functional-requirements)
2. [Non-Functional Requirements](#non-functional-requirements)
3. [User Requirements](#user-requirements)
4. [System Requirements](#system-requirements)
5. [Constraints & Assumptions](#constraints--assumptions)

---

## Functional Requirements

### FR-1: Contract Management

#### FR-1.1: Contract Creation & Registration
**Priority**: HIGH  
**Status**: ⚠️ Partial

**Requirements**:
- **FR-1.1.1**: System SHALL allow users to upload contract documents (PDF, images)
- **FR-1.1.2**: System SHALL extract contract metadata using OCR/AI (optional manual entry)
- **FR-1.1.3**: System SHALL store owner, contractor, amount, scope, and terms
- **FR-1.1.4**: System SHALL require user confirmation of parsed data
- **FR-1.1.5**: System SHALL create immutable audit trail for contract creation

**Acceptance Criteria**:
- Upload PDF/image files up to 50MB
- Parse key fields with >80% accuracy (AI-assisted)
- Manual entry fallback available
- All contracts have unique ID and creation timestamp

#### FR-1.2: Contract Lifecycle Management
**Priority**: HIGH  
**Status**: ❌ Missing

**Requirements**:
- **FR-1.2.1**: System SHALL support contract states: Draft, Uploaded, Parsing, Parsed, Pending Activation, Active, Suspended, Completed, Terminated
- **FR-1.2.2**: System SHALL enforce state transition rules via policies
- **FR-1.2.3**: System SHALL only allow task creation for Active contracts
- **FR-1.2.4**: System SHALL record all state changes as L0 (Governance) events
- **FR-1.2.5**: System SHALL support contract amendments and change orders

**Acceptance Criteria**:
- State machine enforced at policy layer
- Only approved state transitions allowed
- Audit log records all transitions
- Change orders create new governance events

### FR-2: Task & Construction Management

#### FR-2.1: Task Creation & Assignment
**Priority**: HIGH  
**Status**: ⚠️ Partial

**Requirements**:
- **FR-2.1.1**: System SHALL allow task creation linked to contract items
- **FR-2.1.2**: System SHALL require task assignment to user or team
- **FR-2.1.3**: System SHALL enforce policy: tasks only for Active contracts
- **FR-2.1.4**: System SHALL support task priority, due date, and location
- **FR-2.1.5**: System SHALL track task lifecycle: Created, Assigned, In Progress, Submitted, Confirmed, Completed

**Acceptance Criteria**:
- Tasks linked to contract line items
- Policy prevents task creation for inactive contracts
- Assignment notifications sent automatically
- Task status tracked through workflow

#### FR-2.2: Construction Event Recording
**Priority**: HIGH  
**Status**: ✅ Complete

**Requirements**:
- **FR-2.2.1**: System SHALL record construction events as L1 (Fact) immutable events
- **FR-2.2.2**: System SHALL require timestamp, actor, location for all events
- **FR-2.2.3**: System SHALL require at least one evidence item (photo, signature, GPS, sensor)
- **FR-2.2.4**: System SHALL prevent modification or deletion of L1 events
- **FR-2.2.5**: System SHALL support correction events for errors

**Acceptance Criteria**:
- All events have required fields
- Events stored in append-only collection
- Firestore rules prevent updates/deletes
- Correction events link to original via ID

### FR-3: Quality Assurance Workflows

#### FR-3.1: QC Task Management
**Priority**: HIGH  
**Status**: ✅ Complete

**Requirements**:
- **FR-3.1.1**: System SHALL auto-create QC task when construction task marked complete
- **FR-3.1.2**: System SHALL assign QC task to inspector based on rules
- **FR-3.1.3**: System SHALL provide mobile-friendly QC inspection interface
- **FR-3.1.4**: System SHALL support Pass/Fail decision with evidence
- **FR-3.1.5**: System SHALL create defect reports for failed QC

**Acceptance Criteria**:
- QC task created within 1 minute of task completion
- Inspector receives notification
- Mobile interface supports photo capture and signature
- Defect workflow triggered on failure

#### FR-3.2: Defect Management
**Priority**: MEDIUM  
**Status**: ⚠️ Partial

**Requirements**:
- **FR-3.2.1**: System SHALL create defect report with description, severity, location
- **FR-3.2.2**: System SHALL assign defect to responsible party for remediation
- **FR-3.2.3**: System SHALL track remediation progress
- **FR-3.2.4**: System SHALL require re-inspection after remediation
- **FR-3.2.5**: System SHALL close defect only after successful re-inspection

**Acceptance Criteria**:
- Defects categorized by severity (Critical, High, Medium, Low)
- Remediation workflow tracked in system
- Re-inspection creates new QC task
- Closure requires approval evidence

### FR-4: Acceptance Workflows

#### FR-4.1: Acceptance Process
**Priority**: HIGH  
**Status**: ✅ Complete

**Requirements**:
- **FR-4.1.1**: System SHALL create acceptance after QC passed
- **FR-4.1.2**: System SHALL support multi-stakeholder review (Owner, Contractor, Architect)
- **FR-4.1.3**: System SHALL allow Approve, Reject, or Conditional acceptance
- **FR-4.1.4**: System SHALL require evidence for approval decision
- **FR-4.1.5**: System SHALL archive accepted work as L1 event

**Acceptance Criteria**:
- Acceptance created automatically after QC pass
- Multiple reviewers can comment and approve
- Conditional acceptance tracks outstanding issues
- Archived data immutable

#### FR-4.2: Issue Tracking
**Priority**: MEDIUM  
**Status**: ✅ Complete

**Requirements**:
- **FR-4.2.1**: System SHALL create issues for rejected or conditional acceptance
- **FR-4.2.2**: System SHALL support GitHub-style issue lifecycle
- **FR-4.2.3**: System SHALL link issues to tasks, contracts, or locations
- **FR-4.2.4**: System SHALL support issue priority, labels, and assignees
- **FR-4.2.5**: System SHALL track issue resolution

**Acceptance Criteria**:
- Issues created from acceptance rejection
- Issue lifecycle: Open, In Progress, Resolved, Closed
- Issues searchable and filterable
- Resolution tracked with evidence

### FR-5: Financial Operations

#### FR-5.1: Billing & Payment
**Priority**: HIGH  
**Status**: ✅ Complete

**Requirements**:
- **FR-5.1.1**: System SHALL auto-calculate billable amounts from accepted work
- **FR-5.1.2**: System SHALL support progress-based billing
- **FR-5.1.3**: System SHALL create separate Owner billing and Contractor payment views
- **FR-5.1.4**: System SHALL support multi-currency
- **FR-5.1.5**: System SHALL track payment approval workflow

**Acceptance Criteria**:
- Amounts calculated from L1 completed events
- Billing accuracy >98%
- Owner/Contractor views show correct perspectives
- Payment status tracked: Draft, Submitted, Review, Approved, Paid

#### FR-5.2: Cost Tracking
**Priority**: MEDIUM  
**Status**: ⚠️ Partial

**Requirements**:
- **FR-5.2.1**: System SHALL track actual costs vs. budget
- **FR-5.2.2**: System SHALL calculate cost variance and CPI
- **FR-5.2.3**: System SHALL provide cost breakdown by contract item
- **FR-5.2.4**: System SHALL alert on budget overruns
- **FR-5.2.5**: System SHALL generate cost reports

**Acceptance Criteria**:
- Real-time cost tracking
- Variance calculations accurate
- Alerts triggered at configurable thresholds
- Reports exportable to CSV/PDF

### FR-6: Warranty Management

#### FR-6.1: Warranty Period Tracking
**Priority**: MEDIUM  
**Status**: ✅ Complete

**Requirements**:
- **FR-6.1.1**: System SHALL auto-enter warranty period after final acceptance
- **FR-6.1.2**: System SHALL track warranty start and end dates
- **FR-6.1.3**: System SHALL send notifications before warranty expiration
- **FR-6.1.4**: System SHALL support warranty extension
- **FR-6.1.5**: System SHALL prevent warranty closure until all issues resolved

**Acceptance Criteria**:
- Warranty period begins on acceptance date
- Notifications sent 30, 14, 7 days before expiration
- Extension requires approval
- Issues prevent closure

### FR-7: Audit & Compliance

#### FR-7.1: Audit Logging
**Priority**: HIGH  
**Status**: ✅ Complete

**Requirements**:
- **FR-7.1.1**: System SHALL log all user actions with timestamp, actor, action, resource
- **FR-7.1.2**: System SHALL log all L0, L1, L2 events
- **FR-7.1.3**: System SHALL use correlation IDs for traceability
- **FR-7.1.4**: System SHALL prevent audit log modification or deletion
- **FR-7.1.5**: System SHALL support audit log search and export

**Acceptance Criteria**:
- 100% of actions logged
- Logs immutable (append-only)
- Correlation IDs link related events
- Search supports date range, actor, action filters
- Export to CSV/JSON

#### FR-7.2: Compliance Reporting
**Priority**: MEDIUM  
**Status**: ❌ Missing

**Requirements**:
- **FR-7.2.1**: System SHALL generate compliance reports on demand
- **FR-7.2.2**: System SHALL provide complete audit trail for any event
- **FR-7.2.3**: System SHALL support regulatory report templates
- **FR-7.2.4**: System SHALL export reports in required formats
- **FR-7.2.5**: System SHALL digitally sign reports for authenticity

**Acceptance Criteria**:
- Reports generated <30 seconds
- Audit trail complete and accurate
- Templates configurable
- Exports to PDF, Excel, JSON
- Digital signatures verifiable

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1**: Page Load Time  
- **Requirement**: 95% of page loads SHALL complete in <3 seconds
- **Measurement**: Google Lighthouse, Web Vitals
- **Target**: LCP <2.5s, FID <100ms, CLS <0.1

**NFR-1.2**: API Response Time  
- **Requirement**: 95% of API calls SHALL respond in <1 second
- **Measurement**: Firebase Performance Monitoring
- **Target**: P95 latency <1000ms

**NFR-1.3**: Concurrent Users  
- **Requirement**: System SHALL support 1,000+ concurrent users
- **Measurement**: Load testing with k6 or Locust
- **Target**: No degradation up to 1,000 users

**NFR-1.4**: Event Processing  
- **Requirement**: Events SHALL be processed in <5 seconds
- **Measurement**: Event bus latency monitoring
- **Target**: P95 event-to-action latency <5s

### NFR-2: Reliability

**NFR-2.1**: System Uptime  
- **Requirement**: System SHALL be available 99.5% of time
- **Measurement**: Firebase Hosting uptime monitoring
- **Target**: <43 hours downtime per year

**NFR-2.2**: Data Durability  
- **Requirement**: Zero data loss for L1 (Fact) events
- **Measurement**: Firestore backup verification
- **Target**: 100% data integrity

**NFR-2.3**: Error Rate  
- **Requirement**: Error rate SHALL be <0.5%
- **Measurement**: Cloud Logging error tracking
- **Target**: <0.5% of requests result in errors

### NFR-3: Scalability

**NFR-3.1**: Data Volume  
- **Requirement**: System SHALL handle 1M+ events per project
- **Measurement**: Firestore query performance monitoring
- **Target**: Query latency <1s for 1M+ documents

**NFR-3.2**: Storage Growth  
- **Requirement**: System SHALL handle 1TB+ files per organization
- **Measurement**: Cloud Storage monitoring
- **Target**: No performance degradation up to 1TB

**NFR-3.3**: Horizontal Scaling  
- **Requirement**: System SHALL scale automatically with demand
- **Measurement**: Firebase auto-scaling metrics
- **Target**: Transparent scaling to demand

### NFR-4: Security

**NFR-4.1**: Authentication  
- **Requirement**: All users SHALL authenticate via Firebase Auth
- **Measurement**: Auth success/failure rates
- **Target**: 100% authenticated access

**NFR-4.2**: Authorization  
- **Requirement**: All operations SHALL be authorized per Firestore Security Rules
- **Measurement**: Security rule test coverage
- **Target**: 100% rule coverage, zero unauthorized access

**NFR-4.3**: Data Encryption  
- **Requirement**: All data SHALL be encrypted in transit and at rest
- **Measurement**: TLS/SSL certificate verification, Firestore encryption confirmation
- **Target**: TLS 1.3+, AES-256 encryption

**NFR-4.4**: Audit Trail  
- **Requirement**: All actions SHALL be logged immutably
- **Measurement**: Audit log completeness verification
- **Target**: 100% action coverage

### NFR-5: Usability

**NFR-5.1**: Mobile Support  
- **Requirement**: System SHALL be fully functional on mobile devices
- **Measurement**: Mobile usability testing
- **Target**: 100% features available on mobile

**NFR-5.2**: Offline Support  
- **Requirement**: System SHALL support offline mode for field workers
- **Measurement**: PWA offline functionality testing
- **Target**: Critical functions work offline, sync on reconnect

**NFR-5.3**: Accessibility  
- **Requirement**: System SHALL meet WCAG 2.1 Level AA standards
- **Measurement**: Accessibility audit tools
- **Target**: Zero Level A/AA violations

**NFR-5.4**: Internationalization  
- **Requirement**: System SHALL support multiple languages (English, Chinese)
- **Measurement**: i18n coverage testing
- **Target**: 100% UI text translated

### NFR-6: Maintainability

**NFR-6.1**: Code Quality  
- **Requirement**: Code SHALL maintain >80% test coverage
- **Measurement**: Code coverage reports
- **Target**: >80% unit test coverage, >70% integration test coverage

**NFR-6.2**: Documentation  
- **Requirement**: All modules SHALL have API documentation
- **Measurement**: Documentation coverage
- **Target**: 100% public APIs documented

**NFR-6.3**: Deployment  
- **Requirement**: Deployment SHALL be automated
- **Measurement**: CI/CD pipeline success rate
- **Target**: Zero manual deployment steps

---

## User Requirements

### UR-1: Owner Requirements

**UR-1.1**: Real-time project visibility  
**UR-1.2**: Quality assurance before payment approval  
**UR-1.3**: Transparent cost tracking  
**UR-1.4**: Approval workflows for major decisions  
**UR-1.5**: Audit trails for compliance  

### UR-2: Contractor Requirements

**UR-2.1**: Streamlined task management  
**UR-2.2**: Easy progress reporting  
**UR-2.3**: Faster payment processing  
**UR-2.4**: Mobile evidence capture  
**UR-2.5**: Issue tracking and resolution  

### UR-3: Inspector Requirements

**UR-3.1**: Mobile inspection tools  
**UR-3.2**: Structured checklists  
**UR-3.3**: Photo annotation  
**UR-3.4**: Offline mode for field work  
**UR-3.5**: Defect tracking  

---

## System Requirements

### SR-1: Platform Requirements

- **Frontend**: Angular 20+, TypeScript 5.9+, ng-alain 20+
- **Backend**: Firebase (Firestore, Functions, Storage, Auth)
- **Deployment**: Firebase Hosting, Cloud Functions
- **Browser Support**: Chrome 100+, Safari 15+, Edge 100+
- **Mobile**: iOS 14+, Android 10+

### SR-2: Infrastructure Requirements

- **Database**: Firestore (document-based, real-time)
- **Storage**: Cloud Storage (file hosting)
- **Authentication**: Firebase Auth (Email, Google, Anonymous)
- **Functions**: Cloud Functions (Node.js 20+)
- **AI/ML**: Vertex AI (OCR, document parsing)

---

## Constraints & Assumptions

### Constraints

1. **Budget**: <$200K for Phase 1 development
2. **Timeline**: Launch MVP within 6 months
3. **Team**: 3-5 developers
4. **Technology**: Must use Firebase ecosystem
5. **Compliance**: Must meet local construction regulations

### Assumptions

1. Users have basic computer/smartphone literacy
2. Field workers have reliable internet connectivity
3. Contracts are in standard formats (PDF, image)
4. Quality standards are predefined
5. Payment processes follow standard workflows

---

## References

- [SETC-01: System Overview](./SETC-01-system-overview.md)
- [System Architecture](../system/02-system-architecture.md)
- [Three-Layer Model](../system/03-three-layer-model.md)

---

**SETC Status**: ✅ Complete  
**Approval**: Pending Product Review  
**Next Review**: After requirements validation
