# Process 流程系統

## Process 系統的核心價值

### 什麼是 Process

Process 是一套「標準化的工作流程定義」,描述事情應該如何流動。

**與 Task 的差異:**
- Process: 定義「應該怎麼做」(What should be done)
- Task: 記錄「實際在做什麼」(What is being done)

**範例:**
```
Process: SCADA 機櫃標準安裝流程
  Step 1: 現場勘查與測量
  Step 2: 材料進場檢驗
  Step 3: 機櫃搬運定位
  Step 4: 內部設備組裝
  Step 5: 配線施工
  Step 6: 測試調試
  Step 7: 驗收交付

這是「標準流程」,不是「實際任務」
```

### Process 的作用

**1. 提供建議**
```
Event: SS-A01 機櫃定位完成
  ↓
Process 引擎判斷: 下一步應該是「內部設備組裝」
  ↓
系統建議: "建議建立 SS-A01 內部組裝 Task"
  ↓
主管決定: 接受/修改/拒絕
```

**2. 保持一致性**
```
多個類似工作包都遵循相同的 Process:
- WP-SS-A01: SCADA 安裝流程
- WP-SS-A02: SCADA 安裝流程 (相同)
- WP-SS-A03: SCADA 安裝流程 (相同)

好處:
- 減少規劃負擔
- 確保品質一致
- 經驗可複製
```

**3. 累積經驗**
```
執行 100 次 SCADA 安裝流程後:
  → 分析哪些步驟經常出問題
  → 哪些步驟可以合併
  → 哪些地方需要加強
  → 優化 Process 定義
```

## Process 定義結構

### 基本 Process 定義

```typescript
interface ProcessDefinition {
  processId: string;
  processName: string;
  description: string;
  version: number;
  
  // 流程步驟
  steps: ProcessStep[];
  
  // 適用條件
  applicableConditions?: Condition[];
  
  // 變體支援
  variants?: ProcessVariant[];
}

interface ProcessStep {
  stepId: string;
  stepName: string;
  description: string;
  
  // 步驟類型
  stepType: 'Manual' | 'Automated' | 'Decision' | 'Parallel';
  
  // 前置條件
  preconditions?: Condition[];
  
  // 後置條件
  postconditions?: Condition[];
  
  // 下一步
  nextSteps: NextStep[];
  
  // 建議產生的 Task
  suggestedTask?: TaskTemplate;
  
  // 驗收標準
  acceptanceCriteria?: AcceptanceCriteria[];
}
```

### 範例: SCADA 安裝 Process

```typescript
const scadaInstallationProcess: ProcessDefinition = {
  processId: "process-scada-installation",
  processName: "SCADA 機櫃標準安裝流程",
  version: 1,
  steps: [
    {
      stepId: "step-1",
      stepName: "現場勘查",
      stepType: "Manual",
      suggestedTask: {
        title: "{location} 現場勘查",
        estimatedDuration: 4,
        requiredSkills: ["測量", "規劃"]
      },
      nextSteps: [{ stepId: "step-2" }]
    },
    {
      stepId: "step-2",
      stepName: "材料進場",
      stepType: "Manual",
      preconditions: [
        { type: "Event", eventType: "step-1-completed" }
      ],
      suggestedTask: {
        title: "{location} 材料進場檢驗",
        estimatedDuration: 2
      },
      nextSteps: [{ stepId: "step-3" }]
    },
    // ... 更多步驟
  ]
};
```

## Process 執行引擎

### Process Instance (流程實例)

```typescript
interface ProcessInstance {
  instanceId: string;
  processDefinitionId: string;
  processVersion: number;
  
  // 關聯的業務實體
  relatedEntityId: string;  // 例如: workPackageId
  relatedEntityType: string;
  
  // 當前狀態
  currentStep: string;
  status: 'Running' | 'Completed' | 'Suspended' | 'Cancelled';
  
  // 執行歷史
  executionHistory: StepExecution[];
  
  // 開始/結束時間
  startedAt: Date;
  completedAt?: Date;
}

interface StepExecution {
  stepId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped';
  
  // 關聯的 Task (如果有)
  relatedTaskId?: string;
  
  // 執行結果
  result?: any;
  notes?: string;
}
```

### Process 與 Event 的整合

```typescript
class ProcessEngine {
  async handleEvent(event: DomainEvent): Promise<void> {
    // 1. 找出受影響的 Process Instances
    const instances = await this.findAffectedInstances(event);
    
    for (const instance of instances) {
      // 2. 更新 Process Instance 狀態
      await this.updateInstanceState(instance, event);
      
      // 3. 判斷下一步
      const nextSteps = await this.determineNextSteps(
        instance, 
        event
      );
      
      // 4. 產生建議
      for (const step of nextSteps) {
        await this.suggestNextAction(instance, step);
      }
    }
  }
  
  private async suggestNextAction(
    instance: ProcessInstance,
    step: ProcessStep
  ): Promise<void> {
    if (step.suggestedTask) {
      // 建議建立 Task
      await this.taskSuggestionService.suggest({
        processInstanceId: instance.instanceId,
        stepId: step.stepId,
        taskTemplate: step.suggestedTask
      });
    }
  }
}
```

## Process 變體處理

### 為什麼需要變體

**情境: 相似但不完全相同的流程**
```
標準 SCADA 安裝流程:
  現場勘查 → 材料進場 → 搬運定位 → 
  內部組裝 → 配線 → 測試 → 驗收

簡化版 (已有現場資料):
  材料進場 → 搬運定位 → 
  內部組裝 → 配線 → 測試 → 驗收
  (跳過現場勘查)

快速版 (緊急安裝):
  材料進場 → 搬運定位 → 配線 → 驗收
  (合併組裝與配線)
```

### 變體定義

```typescript
interface ProcessVariant {
  variantId: string;
  variantName: string;
  baseProcessId: string;
  
  // 變更類型
  modifications: ProcessModification[];
  
  // 適用條件
  applicableWhen: Condition[];
}

interface ProcessModification {
  type: 'Skip' | 'Add' | 'Replace' | 'Merge';
  targetStepId: string;
  
  // 根據 type 有不同的欄位
  newStep?: ProcessStep;
  mergeWith?: string;
}
```

### 變體選擇

```typescript
class ProcessSelector {
  async selectProcess(
    context: ProcessContext
  ): Promise<ProcessDefinition> {
    // 1. 取得基礎 Process
    const baseProcess = await this.getBaseProcess(
      context.processType
    );
    
    // 2. 檢查是否有適用的變體
    const applicableVariants = 
      await this.findApplicableVariants(
        baseProcess, 
        context
      );
    
    // 3. 如果有變體,應用變更
    if (applicableVariants.length > 0) {
      return this.applyVariant(
        baseProcess, 
        applicableVariants[0]
      );
    }
    
    return baseProcess;
  }
}
```

## Process 與 Task 的協作

### 協作模式 A: Process 建議,人工確認

```
1. Process 監聽 Events
2. 判斷下一步
3. 產生 Task 建議
4. 主管確認
5. 建立 Task
6. 執行
7. 產生新 Event
8. Process 繼續監聽
```

### 協作模式 B: Process 自動執行

```
某些步驟可以自動執行:
  - 自動發送通知
  - 自動更新狀態
  - 自動產生報表
  
不需要建立 Task
```

### 協作模式 C: 人工調整 Process

```
主管可以:
  - 跳過某些步驟
  - 調整順序
  - 加入額外步驟
  
系統記錄所有偏離:
  Event: ProcessDeviation
    reason: "現場條件不符,跳過勘查"
    deviatedBy: "工地主管"
```

## Process 優化與演進

### 收集執行數據

```typescript
interface ProcessMetrics {
  processId: string;
  
  // 執行統計
  totalExecutions: number;
  successfulExecutions: number;
  failureRate: number;
  
  // 時間統計
  averageDuration: number;
  medianDuration: number;
  
  // 步驟統計
  stepMetrics: StepMetrics[];
  
  // 常見問題
  commonIssues: Issue[];
}

interface StepMetrics {
  stepId: string;
  
  // 執行次數
  executionCount: number;
  skipCount: number;
  
  // 時間
  averageDuration: number;
  
  // 問題
  issueCount: number;
  commonIssues: string[];
}
```

### 分析與改進

```
分析發現:
  Step 3 (搬運定位): 
    - 平均耗時 4 小時
    - 50% 的案例會延誤
    - 常見問題: 吊車調度不及時
    
改進建議:
  - 提前 1 天預約吊車
  - 在 Step 2 完成後立即通知吊車
  - 建議 Step 2 與 Step 3 之間加入緩衝時間
  
Process 更新:
  version: 2
  changes:
    - Step 2 後加入 "吊車預約" 子步驟
    - Step 2 與 Step 3 間建議間隔 1 天
```

## 總結

Process 系統的核心:
1. **標準化** - 定義標準流程
2. **建議性** - 提供建議,不強制
3. **可變體** - 支援流程變化
4. **持續優化** - 基於數據改進
5. **Event 驅動** - 與 Event 系統整合
