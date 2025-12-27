# SETC-01: System Overview - GigHub

> **Document Type**: System Engineering Technical Concept  
> **SETC Document**: 01 of 06  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Classification**: Internal Use

---

## Document Purpose

This System Engineering Technical Concept (SETC) provides a comprehensive overview of the GigHub construction site management system. It serves as the primary technical reference for stakeholders, architects, developers, and project managers to understand the system's mission, capabilities, constraints, and technical approach.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Mission & Objectives](#system-mission--objectives)
3. [System Capabilities](#system-capabilities)
4. [System Context](#system-context)
5. [Key Stakeholders](#key-stakeholders)
6. [System Constraints](#system-constraints)
7. [Success Criteria](#success-criteria)
8. [Risk Summary](#risk-summary)

---

## Executive Summary

### What is GigHub?

**GigHub** is a GitHub-inspired construction site progress tracking and management platform that applies proven software development governance patterns to the construction industry. By treating construction projects as "repositories" and construction events as "commits," GigHub provides transparency, automation, and accountability throughout the entire construction lifecycle.

### Core Innovation

GigHub's innovation lies in applying the **Three-Layer Event Model** to construction:

```
L0 (Governance) → Contracts, Approvals, Policies
L1 (Facts) → Construction Events (Immutable)
L2 (Derived) → Progress, Costs, Analytics
```

This model ensures:
- **Immutable Audit Trail**: Every action is permanently recorded
- **Event-Driven Automation**: Workflows trigger automatically based on events
- **Real-Time Transparency**: All stakeholders see live project status
- **Compliance by Design**: Built-in audit logs and regulatory compliance

### Key Value Propositions

| Stakeholder | Value Proposition |
|-------------|-------------------|
| **Owners** | Real-time progress visibility, transparent costs, quality assurance before payment |
| **Contractors** | Streamlined workflows, automated approvals, faster payments |
| **Inspectors** | Mobile inspection tools, automated scheduling, defect tracking |
| **Workers** | Clear task assignments, easy progress reporting, mobile evidence capture |

### System Scale

- **Users**: 100-10,000+ users per organization
- **Projects**: 10-1,000 concurrent construction projects
- **Events**: 10,000-1,000,000+ construction events per project
- **Files**: 1GB-1TB+ documents, photos, and drawings per project

### Technology Stack

- **Frontend**: Angular 20 + ng-alain + Firebase SDK
- **Backend**: Firebase (Firestore, Functions, Storage, Auth)
- **AI/ML**: Google Vertex AI for document parsing
- **Deployment**: Firebase Hosting + Cloud Functions
- **Mobile**: Progressive Web App (PWA)

---

## System Mission & Objectives

### Mission Statement

*"To provide construction industry professionals with the same level of transparency, automation, and accountability that GitHub provides to software developers, enabling better project outcomes through event-driven workflows and immutable audit trails."*

### Primary Objectives

#### 1. Establish Immutable Fact Layer
**Goal**: Record every construction activity as an immutable event with evidence.

**Success Metrics**:
- 95%+ of construction activities captured as L1 events
- 100% of events have timestamp, actor, and evidence
- Zero data loss or tampering

**Implementation**:
- Append-only event store in Firestore
- Mandatory evidence requirements (photo/signature/GPS)
- Firestore Security Rules prevent updates/deletes

#### 2. Enable Real-Time Visibility
**Goal**: Provide all stakeholders with live project status and progress.

**Success Metrics**:
- <5 second dashboard refresh time
- Real-time event notifications
- 99.5%+ system uptime

**Implementation**:
- Firestore real-time subscriptions
- Angular Signals for reactive UI updates
- Progressive Web App for offline support

#### 3. Automate Quality & Approval Workflows
**Goal**: Reduce manual coordination through automated workflow orchestration.

**Success Metrics**:
- 80%+ of quality checks triggered automatically
- <24 hours average approval cycle time
- 40%+ reduction in coordination overhead

**Implementation**:
- Event-driven workflow orchestrator
- Automated QC task creation on completion
- Multi-stage approval workflows

#### 4. Ensure Compliance & Traceability
**Goal**: Provide complete audit trail for regulatory compliance and dispute resolution.

**Success Metrics**:
- 100% of actions logged to audit trail
- Complete event correlation (who, what, when, why)
- <30 minutes to generate compliance reports

**Implementation**:
- Immutable audit log collection
- Correlation IDs for event tracing
- Automated compliance report generation

#### 5. Accelerate Financial Operations
**Goal**: Reduce payment cycles through automated progress-based billing.

**Success Metrics**:
- 40%+ faster payment processing
- 98%+ accuracy in auto-calculated amounts
- <5% billing disputes

**Implementation**:
- Auto-calculate billable amounts from L1 events
- Progress-based billing workflows
- Owner/Contractor separate payment views

---

## System Capabilities

### Core Capabilities Matrix

| Capability | Description | Priority | Status |
|------------|-------------|----------|--------|
| **Contract Management** | Upload, parse, activate, manage contracts | HIGH | ⚠️ Partial |
| **Task Management** | Create, assign, track construction tasks | HIGH | ⚠️ Partial |
| **Quality Assurance** | QC workflows, inspections, defect tracking | HIGH | ✅ Complete |
| **Acceptance Workflows** | Multi-stage approvals, conditional acceptance | HIGH | ✅ Complete |
| **Financial Operations** | Billing, payment, cost tracking | HIGH | ✅ Complete |
| **Warranty Management** | Warranty period tracking, defect handling | MEDIUM | ✅ Complete |
| **Issue Tracking** | GitHub-style issue management | MEDIUM | ✅ Complete |
| **Asset Management** | Document repository, file versioning | MEDIUM | ❌ Missing |
| **Audit & Compliance** | Immutable audit logs, compliance reports | HIGH | ✅ Complete |
| **Analytics & Reporting** | Progress dashboards, cost analysis | MEDIUM | ⚠️ Partial |
| **Mobile Access** | PWA for field workers | HIGH | ✅ Complete |
| **AI Document Parsing** | OCR/AI contract parsing | LOW | ❌ Missing |

### Functional Capabilities

#### 1. Contract Lifecycle Management

**Workflow**:
```
Upload PDF → Parse with AI → Confirm Terms → 
Activate Contract → Create Tasks → Track Progress → 
Complete Contract → Archive
```

**Features**:
- PDF upload and OCR parsing (AI-assisted)
- Manual term entry and confirmation
- Contract activation/deactivation
- Change order management
- Contract status tracking

**User Roles**:
- **Owner**: Approve contracts and change orders
- **Contractor**: Submit contracts and change requests
- **Admin**: Manage contract lifecycle

#### 2. Task & Construction Phase Management

**Workflow**:
```
Create Task → Assign Team → Execute Work → 
Submit Completion → Manager Confirm → 
Trigger QC → Proceed to Acceptance
```

**Features**:
- Task creation linked to contract items
- Team/individual assignment
- Progress tracking with status updates
- Evidence capture (photos, signatures, GPS)
- Manager confirmation before QC

**User Roles**:
- **Project Manager**: Create and assign tasks
- **Worker**: Execute and report completion
- **Supervisor**: Confirm completion

#### 3. Quality Assurance & Acceptance

**QC Workflow**:
```
Task Completed → Auto-create QC Task → 
Assign Inspector → Conduct Inspection → 
Pass → Acceptance | Fail → Create Defect → Remediation
```

**Acceptance Workflow**:
```
QC Passed → Create Acceptance → Owner Review → 
Approve → Archive | Reject → Create Issues → Resolution
```

**Features**:
- Automated QC task creation
- Inspector mobile app for inspections
- Pass/Fail with evidence
- Defect tracking and remediation
- Multi-stakeholder acceptance
- Conditional acceptance with issues

**User Roles**:
- **Inspector**: Conduct QC inspections
- **Owner**: Final acceptance authority
- **Contractor**: Respond to defects/issues

#### 4. Financial Operations

**Billing Workflow**:
```
Acceptance Finalized → Calculate Billable Amount → 
Create Billing Request → Owner Review → 
Approve → Invoice → Payment
```

**Features**:
- Auto-calculate amounts from completed work
- Progress-based billing
- Owner/Contractor separate views
- Multi-currency support
- Payment approval workflows
- Cost tracking and analysis

**User Roles**:
- **Finance Manager**: Create billing requests
- **Owner**: Approve payments
- **Contractor**: Submit invoices
- **Accountant**: Process payments

#### 5. Warranty & Issue Management

**Warranty Workflow**:
```
Acceptance → Enter Warranty Period → 
Defect Occurs → Create Issue → Assign → 
Repair → Close | Warranty Expires → Final Closure
```

**Features**:
- Automatic warranty period tracking
- Defect reporting during warranty
- Repair workflows with evidence
- Warranty expiration notifications
- Final closure and sign-off

**User Roles**:
- **Owner**: Report warranty defects
- **Contractor**: Repair warranty issues
- **Inspector**: Verify repairs

---

## System Context

### System Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    External Systems                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Firebase   │  │  Vertex AI   │  │   Cloud      │  │
│  │   Platform   │  │   (OCR/ML)   │  │   Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │      GigHub System Boundary     │
        │  ┌───────────────────────────┐  │
        │  │   Core/Blueprint Layer    │  │
        │  │  - Event Bus              │  │
        │  │  - Workflow Orchestrator  │  │
        │  │  - Modules (Contract,     │  │
        │  │    Task, Finance, etc.)   │  │
        │  │  - Audit System           │  │
        │  │  - Policies               │  │
        │  └───────────────────────────┘  │
        │             ↕                    │
        │  ┌───────────────────────────┐  │
        │  │   Application/Features    │  │
        │  │  - Account Management     │  │
        │  │  - Issues                 │  │
        │  │  - Explore                │  │
        │  │  - AI Assistant           │  │
        │  └───────────────────────────┘  │
        │             ↕                    │
        │  ┌───────────────────────────┐  │
        │  │   Presentation Layer      │  │
        │  │  - Web UI (Angular)       │  │
        │  │  - Mobile PWA             │  │
        │  └───────────────────────────┘  │
        └─────────────────────────────────┘
                      ↕
        ┌─────────────────────────────────┐
        │         End Users                │
        │  - Owners                        │
        │  - Contractors                   │
        │  - Inspectors                    │
        │  - Workers                       │
        └─────────────────────────────────┘
```

### External Interfaces

| Interface | Type | Purpose | Protocol |
|-----------|------|---------|----------|
| **Firebase Auth** | Authentication | User authentication | HTTPS/OAuth |
| **Firestore** | Database | Data persistence | gRPC/HTTPS |
| **Cloud Storage** | File Storage | Document/photo storage | HTTPS |
| **Cloud Functions** | Compute | Backend logic | HTTPS/Events |
| **Vertex AI** | AI/ML | Document parsing, OCR | HTTPS/gRPC |
| **Firebase Analytics** | Monitoring | User behavior tracking | SDK |
| **Cloud Logging** | Logging | Application logs | SDK |

### Data Flows

**Primary Data Flows**:
1. **User → UI → Core → Firestore** (Write path)
2. **Firestore → Core → UI → User** (Read path)
3. **Core → Event Bus → Workflow → Core** (Event processing)
4. **Core → Audit → Firestore** (Audit logging)
5. **UI → Cloud Functions → Vertex AI → Firestore** (AI parsing)

---

## Key Stakeholders

### Internal Stakeholders

| Role | Responsibilities | Success Criteria |
|------|------------------|------------------|
| **Product Owner** | Define requirements, prioritize features | User satisfaction >4.0/5.0 |
| **Tech Lead** | Architecture decisions, code quality | 80%+ test coverage, <10 critical bugs |
| **Development Team** | Implement features, fix bugs | Sprint velocity, code reviews passed |
| **QA Team** | Test quality, regression testing | <5 bugs per release, >95% pass rate |
| **DevOps Team** | Deployment, monitoring, SRE | 99.5%+ uptime, <30min deploy time |

### External Stakeholders

| Role | Needs | Success Criteria |
|------|-------|------------------|
| **Construction Owners** | Visibility, quality assurance, cost control | <24h approval cycles, >98% billing accuracy |
| **General Contractors** | Workflow automation, faster payments | 40%+ faster payments, <20% overhead |
| **Subcontractors** | Clear tasks, fair compensation | Task completion tracking, transparent billing |
| **Inspectors** | Mobile tools, defect tracking | <30min inspection reports, 100% digital records |
| **Regulatory Auditors** | Compliance, traceability | <30min compliance reports, 100% audit trail |

---

## System Constraints

### Technical Constraints

| Constraint | Description | Impact | Mitigation |
|------------|-------------|--------|------------|
| **Firestore Limits** | 1 write/sec per document | Write throughput | Use batch writes, shard collections |
| **Cloud Function Cold Start** | 1-5 sec first invocation | Initial latency | Keep functions warm, minimize dependencies |
| **Client SDK Size** | Large bundle size impacts load time | Performance | Code splitting, lazy loading |
| **Offline Support** | Limited offline functionality in PWA | User experience | Service worker caching, local-first patterns |
| **Real-time Subscription Limits** | Cost increases with subscriptions | Operating cost | Use pagination, unsubscribe on unmount |

### Business Constraints

| Constraint | Description | Impact | Mitigation |
|------------|-------------|--------|------------|
| **Multi-Tenancy** | Must support multiple organizations | Complexity | Firestore security rules, tenant isolation |
| **Data Privacy** | Must comply with GDPR, local regulations | Legal risk | Data encryption, user consent, right to deletion |
| **Mobile Network** | Field workers may have poor connectivity | User experience | Offline support, optimistic updates, sync on reconnect |
| **Language Support** | Multi-language UI required | Development effort | i18n from day one, RTL support |
| **Legacy Integration** | May need to integrate with existing systems | Complexity | API-first design, webhook support |

### Operational Constraints

| Constraint | Description | Impact | Mitigation |
|------------|-------------|--------|------------|
| **Budget** | Cloud costs must stay within budget | Financial | Monitor usage, set quotas, optimize queries |
| **Team Size** | Limited development resources | Velocity | Prioritize features, use no-code tools where possible |
| **Timeline** | Aggressive delivery schedule | Quality risk | MVP approach, phased rollout |
| **Support** | 24/7 support may not be feasible initially | User satisfaction | Self-service documentation, community forum |

---

## Success Criteria

### Project Success Criteria

- [ ] **Scope**: All high-priority capabilities delivered
- [ ] **Schedule**: Launched within 6 months
- [ ] **Budget**: <$200K development cost in Phase 1
- [ ] **Quality**: <10 critical bugs at launch
- [ ] **Adoption**: 80%+ of pilot users actively using system within 3 months

### Technical Success Criteria

- [ ] **Performance**: <3 sec average page load time
- [ ] **Reliability**: 99.5%+ uptime
- [ ] **Scalability**: Support 1,000+ concurrent users
- [ ] **Security**: Zero security incidents in first year
- [ ] **Maintainability**: <2 days to onboard new developer

### Business Success Criteria

- [ ] **User Satisfaction**: >4.0/5.0 average rating
- [ ] **Adoption Rate**: 80%+ of target users onboarded
- [ ] **Process Efficiency**: 40%+ reduction in approval cycle time
- [ ] **Financial Accuracy**: >98% accuracy in automated calculations
- [ ] **Compliance**: 100% audit trail for all actions

---

## Risk Summary

### High-Impact Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Firestore Scalability** | Medium | High | Design with sharding, test at scale early |
| **User Adoption** | High | High | User training, change management, pilot program |
| **Data Migration** | Medium | High | Phased rollout, parallel systems during transition |
| **Regulatory Compliance** | Low | Critical | Legal review, built-in audit logs |
| **AI Parsing Accuracy** | High | Medium | Human review workflow, continuous model improvement |

### Risk Response Strategy

For each high-impact risk:
1. **Monitor**: Track metrics and early warning indicators
2. **Mitigate**: Implement preventive measures
3. **Contingency**: Have fallback plans ready
4. **Communicate**: Keep stakeholders informed

---

## Next Steps

### For Architects & Developers
- Review [SETC-02: Requirements](./SETC-02-requirements.md) for detailed specifications
- Study [SETC-03: Architecture Decisions](./SETC-03-architecture-decisions.md) for design rationale
- Check [SETC-04: Implementation Plan](./SETC-04-implementation-plan.md) for roadmap

### For Project Managers
- Review [SETC-04: Implementation Plan](./SETC-04-implementation-plan.md) for timeline
- Study [SETC-06: Deployment](./SETC-06-deployment.md) for rollout strategy

### For QA Engineers
- Review [SETC-05: Testing Strategy](./SETC-05-testing-strategy.md) for test approach

---

## References

- [System Architecture](../system/02-system-architecture.md)
- [Three-Layer Event Model](../../G_three-layer-event-model.md)
- [GitHub Repository Design Concept](../../GITHUB_REPOSITORY_DESIGN_CONCEPT.md)

---

**SETC Status**: ✅ Complete  
**Approval**: Pending Architecture Review  
**Next Review**: Q1 2026
