# 開發工具 (Development Tools)

## 健康檢查儀表板 (Health Dashboard)

### 核心價值主張

**問題**: 架構侵蝕是隱形的
- 依賴違規在 PR review 時才發現
- 事件流問題難以追蹤
- Feature 完成度無法即時掌握

**解決方案**: 開發時即時可視化架構健康度

```typescript
if (開發環境) {
  顯示即時架構違規警告;
  追蹤事件因果鏈;
  監控錯誤模式;
  計算 Feature 完成度;
}
```

## 組成模組

### 1. Architecture Rules Checker

**檢查項目**:
- ✅ Rule #9: Core 層不直接依賴 Firebase
- ✅ Rule #10: 所有檔案 < 4000 字元
- ✅ Features → core/abstractions 依賴方向
- ✅ 循環依賴檢測

**實作技術**:
```typescript
// 使用 dependency-cruiser
import { cruise } from 'dependency-cruiser';

const config = {
  forbidden: [
    {
      name: 'no-firebase-in-core',
      from: { path: '^src/app/core' },
      to: { path: 'firebase' }
    }
  ]
};

const violations = cruise(['src'], config);
```

**UI 顯示**:
```
[⚠️ 架構違規檢測]
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Rule #9: 無違規
❌ Rule #10: 3 個檔案超標
  - issue.aggregate.ts (9,324 chars)
  - app.component.ts (4,125 chars)
  - health-dashboard.component.ts (4,003 chars)

📊 依賴圖: 正常 | 🔗 查看詳情
```

### 2. Event Flow Monitor

**功能**:
- 即時事件流時間軸
- 因果關係追蹤 (causationId → correlationId)
- 事件類型過濾
- Replay 能力

**實作**:
```typescript
export class EventFlowMonitor {
  private events = signal<CausalEvent[]>([]);
  
  constructor(private eventBus: EventBusService) {
    // 訂閱所有事件
    this.eventBus.events$.subscribe(event => {
      this.events.update(list => [...list, event]);
    });
  }
  
  // 建構因果圖
  buildCausalGraph(): CausalNode[] {
    const nodes = this.events().map(e => ({
      id: e.id,
      type: e.type,
      causedBy: e.causedBy,
      timestamp: e.timestamp
    }));
    return buildGraphFromNodes(nodes);
  }
}
```

**UI 視圖**:
```
[📊 事件流時間軸]
━━━━━━━━━━━━━━━━━━━━━━━━━━
12:30:45 → IssueCreated (issue:123)
  ├─ 12:30:46 → PolicyChecked
  ├─ 12:30:47 → NotificationSent
  └─ 12:30:48 → AuditLogCreated

🔍 過濾: [所有類型] | 🎬 Replay
```

### 3. Error Monitor

**監控指標**:
- `Result<T, E>` 錯誤率
- 錯誤類型分布
- 錯誤發生頻率
- 堆疊追蹤記錄

**實作**:
```typescript
export class ErrorMonitor {
  private errors = signal<ErrorRecord[]>([]);
  
  trackError(error: Error, context: ErrorContext): void {
    this.errors.update(list => [...list, {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date()
    }]);
  }
  
  // 錯誤統計
  getErrorStats() {
    return computed(() => {
      const errors = this.errors();
      return {
        total: errors.length,
        byType: groupBy(errors, 'context.type'),
        recent: errors.slice(-10)
      };
    });
  }
}
```

**UI 顯示**:
```
[🚨 錯誤監控]
━━━━━━━━━━━━━━━━━━━━━━━━━━
總計: 23 個錯誤 (最近 1 小時)

分類:
  ValidationError: 12
  NotFoundError: 8
  PermissionError: 3

最近錯誤:
  ❌ 12:35:12 - IssueAggregate.validate()
     "Title cannot be empty"
```

### 4. Feature Status Tracker

**功能**:
- 自動掃描 `features/` 目錄
- 計算實作完成度
- 顯示缺失層級
- 生成開發建議

**實作**:
```typescript
interface FeatureStatus {
  name: string;
  layers: {
    domain: boolean;
    application: boolean;
    events: boolean;
    projection: boolean;
    infrastructure: boolean;
    acl: boolean;
    ui: boolean;
  };
  completeness: number;  // 0-100%
}

function scanFeatures(): FeatureStatus[] {
  const featureDirs = fs.readdirSync('src/app/features/domains');
  
  return featureDirs.map(name => ({
    name,
    layers: {
      domain: fs.existsSync(`features/domains/${name}/domain`),
      application: fs.existsSync(`features/domains/${name}/application`),
      // ...
    },
    completeness: calculateCompleteness(layers)
  }));
}
```

**UI 顯示**:
```
[📦 Feature 進度]
━━━━━━━━━━━━━━━━━━━━━━━━━━
Issue Domain: ████████░░ 80%
  ✅ domain, application, events, infrastructure, ui
  ⏳ projection, acl

User Domain: ███░░░░░░░ 30%
  ✅ domain, application
  ⏳ events, projection, infrastructure, acl, ui

💡 建議: Issue Domain 優先完成 projection 層
```

### 5. Dependency Graph

**視覺化**:
- 模組依賴關係圖
- 違規高亮標示
- 循環依賴警告
- 分層架構驗證

**實作技術**:
- **@antv/g6** - 圖形渲染
- **madge** - 依賴分析
- **ts-morph** - AST 操作

**範例**:
```typescript
import * as madge from 'madge';

const dependencies = await madge('src/app');

// 檢測循環依賴
const circular = dependencies.circular();
if (circular.length > 0) {
  console.warn('發現循環依賴:', circular);
}

// 生成圖形數據
const graphData = {
  nodes: dependencies.obj().map(file => ({ id: file })),
  edges: /* ... */
};
```

## 訪問方式

### 開發環境路由
```typescript
// app.routes.ts
{
  path: '__dev__',
  canActivate: [isDevEnvironment],
  children: [
    { path: 'health', component: HealthDashboardComponent }
  ]
}
```

**URL**: `http://localhost:4200/__dev__/health`

### 浮動面板 (FAB)
```typescript
// app.component.ts
@Component({
  template: `
    @if (isDevMode) {
      <button 
        nz-button 
        nzType="primary" 
        nzShape="circle"
        class="dev-panel-fab"
        (click)="toggleHealthPanel()">
        ❤️
      </button>
      
      <nz-drawer 
        [(nzVisible)]="healthPanelVisible"
        nzPlacement="right"
        nzWidth="600">
        <app-health-dashboard />
      </nz-drawer>
    }
  `
})
```

**位置**: 右下角懸浮球

## 技術工具

### dependency-cruiser
**依賴分析引擎**

```bash
npm install -D dependency-cruiser

# 生成依賴報告
depcruise src --output-type json > deps.json
```

### madge
**循環依賴檢測**

```bash
npm install -D madge

# 檢查循環依賴
madge --circular src/app
```

### ts-morph
**TypeScript AST 操作**

```typescript
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json'
});

// 分析檔案大小
const sourceFiles = project.getSourceFiles();
sourceFiles.forEach(file => {
  const charCount = file.getFullText().length;
  if (charCount > 4000) {
    console.warn(`檔案超標: ${file.getFilePath()} (${charCount} chars)`);
  }
});
```

### @antv/g6
**關係圖視覺化**

```typescript
import G6 from '@antv/g6';

const graph = new G6.Graph({
  container: 'mountNode',
  width: 800,
  height: 600,
  layout: {
    type: 'dagre',
    rankdir: 'TB'
  }
});

graph.data({
  nodes: [...],
  edges: [...]
});

graph.render();
```

## 實施階段

### Phase 1: MVP (已完成)
- ✅ Architecture Rules Checker
- ✅ Event Flow Monitor
- ✅ Error Monitor
- ✅ Feature Status Tracker

### Phase 2: 動態監控
- ⏳ 即時依賴圖更新
- ⏳ 效能指標追蹤
- ⏳ 記憶體使用監控

### Phase 3: 進階分析
- ⏳ AI 驅動的架構建議
- ⏳ 自動重構建議
- ⏳ 技術債務量化

## 效益

1. **即時反饋**: 開發時立即發現違規
2. **可視化**: 抽象概念具象化
3. **學習工具**: 新人快速理解架構
4. **質量保證**: 防止架構侵蝕
5. **生產力**: 減少 debug 時間

---

**參考文檔**:
- 可觀測性: `docs/07-operability/observability.md`
- 架構規則: `docs/ARCHITECTURE_RULES.md`
- 事件系統: `docs/04-core-model/event-model.md`
