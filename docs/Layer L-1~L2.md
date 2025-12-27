## L-1/L0/L1/L2 正確架構實現

Based on blueprint documentation and your correction, here's the complete architecture:

### 完整層級架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│  L-1: Contract Layer (Foundation) - "專案存在的法律基礎"          │
│  Purpose: Legal & commercial project foundation                 │
│  Examples: Contract terms, scope, budget, timeline, parties     │
│  Mutability: Requires bilateral agreement (amendment process)   │
│  法律效力: Legally binding between parties                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (provides context to)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  L0: Governance Layer - "Who can do what?"                      │
│  Purpose: Define rules, permissions, and operational scope      │
│  Examples: Approval rules, access control, workflow policies    │
│  Mutability: Can be changed (but creates audit trail)           │
│  依賴: References contractId, operates within Contract scope     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (defines rules for)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  L1: Fact Layer - "What actually happened?"                     │
│  Purpose: Record immutable construction events                  │
│  Examples: Concrete pour, inspection, material delivery         │
│  Mutability: IMMUTABLE - append-only                            │
│  依賴: Must reference contractId, comply with L0 rules           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (source for calculations)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  L2: Derived Layer - "How we understand it?"                    │
│  Purpose: Calculate insights from L1 facts                      │
│  Examples: Progress %, cost variance, quality metrics           │
│  Mutability: Can be recomputed, discarded, regenerated          │
│  依賴: Derived from L1, within Contract boundaries               │
└─────────────────────────────────────────────────────────────────┘
```

### TypeScript 完整實現

```typescript
// ===== L-1: Contract Layer (Foundation) =====
interface Contract {
  id: string;
  contractNumber: string;  // e.g., "CONTRACT-2025-001"
  
  // Parties (Legal entities)
  parties: {
    owner: Party;
    contractor: Party;
    witnesses?: Party[];
  };
  
  // Project Foundation
  scope: ProjectScope;
  budget: Budget;
  timeline: Timeline;
  
  // Legal Terms
  terms: LegalTerms;
  amendments: Amendment[];
  
  // Lifecycle
  status: 'draft' | 'signed' | 'active' | 'suspended' | 'completed' | 'terminated';
  signedAt?: Date;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  completedAt?: Date;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// ===== L0: Governance Layer =====
interface GovernanceEvent {
  id: string;
  type: GovernanceEventType;
  timestamp: Date;
  actor: string;
  
  // Contract Context (REQUIRED - L0 depends on L-1)
  contractId: string;
  
  // Governance-specific
  scope?: {
    locations?: string[];
    teams?: string[];
  };
  
  rules?: {
    approvalRequired?: boolean;
    approvers?: string[];
    conditions?: Record<string, any>;
  };
  
  metadata?: {
    reason?: string;
    approvedBy?: string;
    effectiveDate?: Date;
  };
}

// ===== L1: Fact Layer =====
interface ConstructionEvent {
  // Core fields
  id: string;
  type: ConstructionEventType;
  timestamp: Date;
  actor: string;
  
  // Contract Context (REQUIRED - L1 depends on L-1)
  contractId: string;
  
  // Location
  target: {
    projectId: string;
    locationId: string;
    coordinates?: GeoPoint;
  };
  
  // Evidence (REQUIRED for L1)
  evidence: {
    photos?: string[];
    signatures?: Signature[];
    gps?: GeoPoint;
    sensors?: SensorData[];
  };
  
  // Metadata
  correlationId?: string;
  parentEventId?: string;
  metadata?: Record<string, any>;
}

// ===== L2: Derived Layer =====
interface ProjectMetrics {
  id: string;
  
  // Contract Context (REQUIRED - L2 depends on L-1)
  contractId: string;
  
  // Calculated from L1
  completionRate: number;
  costVariance: number;
  scheduleVariance: number;
  qualityScore: number;
  
  // Calculation metadata
  calculatedAt: Date;
  calculatedFrom: {
    l1EventCount: number;
    startDate: Date;
    endDate: Date;
  };
  
  // Can be regenerated
  version: number;
}
```

### Firestore Collection Structure

```typescript
// L-1: Contract Collection (Foundation)
/contracts/{contractId}
{
  id: "CONTRACT-2025-001",
  contractNumber: "CONTRACT-2025-001",
  parties: {
    owner: { name: "ABC Corp", contact: "..." },
    contractor: { name: "XYZ Construction", contact: "..." }
  },
  scope: { ... },
  budget: { total: 5000000, currency: "TWD" },
  timeline: { start: Timestamp, end: Timestamp },
  status: "active",
  signedAt: Timestamp,
  createdAt: Timestamp
}

// L0: Governance Events (depends on L-1)
/governanceEvents/{govEventId}
{
  id: "GOV-20251227-001",
  contractId: "CONTRACT-2025-001",  // References L-1
  type: "governance.approval_rule_created",
  timestamp: Timestamp,
  actor: "owner@example.com",
  rules: {
    approvalRequired: true,
    approvers: ["owner@example.com", "pm@contractor.com"]
  }
}

// L1: Construction Events (depends on L-1 + L0)
/constructionEvents/{eventId}
{
  id: "EVT-20251227-001",
  contractId: "CONTRACT-2025-001",  // References L-1
  type: "construction.concrete_pour",
  timestamp: Timestamp,
  actor: "worker@contractor.com",
  target: {
    projectId: "PROJECT-001",
    locationId: "B1F-C4"
  },
  evidence: {
    photos: ["photo1.jpg", "photo2.jpg"],
    gps: GeoPoint(...)
  }
}

// L2: Derived Metrics (calculated from L1, within L-1 scope)
/projectMetrics/{metricsId}
{
  id: "METRICS-20251227-001",
  contractId: "CONTRACT-2025-001",  // References L-1
  completionRate: 75.5,
  costVariance: -50000,
  calculatedAt: Timestamp,
  calculatedFrom: {
    l1EventCount: 1234,
    startDate: Timestamp,
    endDate: Timestamp
  },
  version: 5  // Can be regenerated
}
```

### 關鍵依賴關係

```typescript
// L-1 is INDEPENDENT (Foundation)
class ContractService {
  async createContract(data: CreateContractDTO): Promise<Result<Contract>> {
    // No dependencies on L0/L1/L2
  }
}

// L0 DEPENDS ON L-1
class GovernanceService {
  constructor(private contractService: ContractService) {}
  
  async createGovernanceRule(rule: GovernanceRule): Promise<Result<void>> {
    // Must validate against Contract context
    const contract = await this.contractService.getContract(rule.contractId);
    if (!contract) return failure('CONTRACT_NOT_FOUND');
    
    // Validate rule is within contract scope
    if (!this.isWithinContractScope(rule, contract)) {
      return failure('OUTSIDE_CONTRACT_SCOPE');
    }
    
    // Create governance rule
  }
}

// L1 DEPENDS ON L-1 + L0
class ConstructionEventService {
  constructor(
    private contractService: ContractService,
    private governanceService: GovernanceService
  ) {}
  
  async recordEvent(event: ConstructionEvent): Promise<Result<void>> {
    // 1. Validate Contract exists (L-1)
    const contract = await this.contractService.getContract(event.contractId);
    if (!contract) return failure('CONTRACT_NOT_FOUND');
    if (contract.status !== 'active') return failure('CONTRACT_NOT_ACTIVE');
    
    // 2. Validate against Governance rules (L0)
    const canRecord = await this.governanceService.checkPermission(
      event.actor, 'record_event', event.target
    );
    if (!canRecord) return failure('PERMISSION_DENIED');
    
    // 3. Record immutable event
    await this.repository.append(event);
  }
}

// L2 DEPENDS ON L1 (and transitively on L-1)
class MetricsCalculationService {
  constructor(
    private eventRepository: ConstructionEventRepository,
    private contractService: ContractService
  ) {}
  
  async calculateMetrics(contractId: string): Promise<ProjectMetrics> {
    // 1. Get Contract context (L-1)
    const contract = await this.contractService.getContract(contractId);
    
    // 2. Query L1 events within contract
    const events = await this.eventRepository.findByContract(contractId);
    
    // 3. Calculate metrics
    return {
      contractId,
      completionRate: this.calculateCompletion(events, contract),
      costVariance: this.calculateCostVariance(events, contract.budget),
      // ...
      calculatedAt: new Date(),
      version: 1
    };
  }
}
```

這就是完整的L-1/L0/L1/L2架構實現,Contract作為L-1 Foundation是整個系統的法律與商業基礎。


> @copilot 
> 查看相關文件後把
> L-1/L0/L1/L2正確架構實現
...

查看了相關文件後,發現現有文檔只記錄了 L0/L1/L2,並未包含 L-1。以下是正確的完整架構實現:

## L-1/L0/L1/L2 正確架構

```
┌─────────────────────────────────────────────────────────┐
│  L-1: Contract Layer (合約基礎層) - Foundation          │
│  Purpose: 定義專案存在本身                                 │
│  Examples: 合約條款、範圍、雙方權責、預算、工期              │
│  Mutability: 需雙方同意修約                                │
│  Location: src/app/core/contract/                      │
└────────────────────┬────────────────────────────────────┘
                     │ (provides context to)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  L0: Governance Layer (治理層) - Rules & Permissions    │
│  Purpose: 定義執行規則 (在合約範圍內)                      │
│  Examples: 審批流程、權限矩陣、政策規則                     │
│  Mutability: 可調整 (在合約範圍內，建立審計追蹤)             │
│  Location: src/app/core/blueprint/policies/            │
└────────────────────┬────────────────────────────────────┘
                     │ (defines rules for)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  L1: Fact Layer (事實層) - Immutable Events            │
│  Purpose: 記錄實際發生的事件                              │
│  Examples: 混凝土澆築、檢查、材料交付                       │
│  Mutability: IMMUTABLE - 只能新增,不能修改或刪除           │
│  Location: src/app/core/three-layer-model/            │
└────────────────────┬────────────────────────────────────┘
                     │ (source for calculations)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  L2: Derived Layer (衍生層) - Calculated Insights      │
│  Purpose: 從 L1 計算出的見解                              │
│  Examples: 完成率、成本差異、品質指標                       │
│  Mutability: 可重新計算、丟棄、重新生成                     │
│  Location: src/app/core/three-layer-model/            │
└─────────────────────────────────────────────────────────┘
```

## 實現架構

```typescript
// L-1: Contract (Foundation)
interface Contract {
  id: string;
  contractNumber: string;
  parties: { owner: Party; contractor: Party };
  scope: ProjectScope;
  budget: Budget;
  timeline: Timeline;
  terms: LegalTerms;
  status: ContractStatus;
}

// L0: Governance (uses Contract context)
interface GovernanceRule {
  id: string;
  contractId: string;  // 參考 L-1
  type: 'approval' | 'permission' | 'policy';
  rule: ApprovalRule | PermissionRule | PolicyRule;
  scope: string[];  // 必須在合約範圍內
}

// L1: Facts (within Contract + Governance framework)
interface ConstructionEvent {
  id: string;
  contractId: string;  // 屬於哪個合約 (L-1)
  type: string;
  timestamp: Date;
  actor: string;
  evidence: Evidence[];
  // 必須符合 L0 規則,在 L-1 範圍內
}

// L2: Derived (calculated from L1, within Contract boundaries)
interface ProjectMetrics {
  contractId: string;
  completionRate: number;  // 從 L1 計算
  budgetVariance: number;  // 與 L-1 預算比較
  calculatedAt: Date;
}
```

## 目錄結構

```
src/app/core/
├── contract/                    # L-1: Foundation Layer
│   ├── models/
│   │   ├── contract.model.ts
│   │   ├── party.model.ts
│   │   └── scope.model.ts
│   ├── services/
│   │   └── contract.service.ts
│   └── repository/
│       └── contract.repository.ts
│
├── blueprint/
│   ├── policies/                # L0: Governance Layer
│   │   ├── policy-engine.service.ts
│   │   ├── models/
│   │   │   ├── governance-rule.model.ts
│   │   │   └── approval-rule.model.ts
│   │   └── validators/
│   │       └── policy.validator.ts
│   └── modules/                 # Other blueprint modules
│
└── three-layer-model/           # L0/L1/L2 (依賴 Contract)
    ├── l0-services/
    ├── l1-repositories/
    └── l2-services/
```
