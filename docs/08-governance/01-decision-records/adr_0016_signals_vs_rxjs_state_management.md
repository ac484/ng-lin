# ADR-0016: Signals vs RxJS 狀態管理策略

## Status
✅ Accepted (2025-12-31)

## Context (事實)
Angular 20 引入 Signals 作為新的反應式原語，與既有的 RxJS 形成兩套反應式系統：

**現有技術**：
- **RxJS 7.8**：Observable、Subject、Operators
- **@ngrx/signals**：Signal Store、Computed、Effect
- **Angular Signals**：signal()、computed()、effect()

**問題**：
- 兩套反應式系統可能導致混亂
- 沒有明確指導何時用 Signals 何時用 RxJS
- 可能過度依賴其中一種導致程式碼不一致

## Decision

### 核心決策：Signals 優先用於 UI State，RxJS 用於 Async Operations

#### 1️⃣ 決策矩陣（When to Use What）

| 場景 | 使用技術 | 原因 |
|-----|---------|------|
| **UI 狀態（同步）** | ✅ Signals | 更簡單、效能更好、與 Angular 深度整合 |
| **表單狀態** | ✅ Signals | 即時反應、無需訂閱管理 |
| **計算屬性** | ✅ computed() | 自動追蹤依賴、延遲計算 |
| **副作用（UI）** | ✅ effect() | 自動清理、與 Zone.js 整合 |
| **非同步操作** | ✅ RxJS | 豐富的 operators、錯誤處理、取消機制 |
| **HTTP 請求** | ✅ RxJS | HttpClient 返回 Observable |
| **WebSocket/SSE** | ✅ RxJS | 連續資料流 |
| **Event Store 訂閱** | ✅ RxJS | Firestore real-time subscription |
| **複雜狀態流** | ✅ RxJS + Signals | RxJS 處理邏輯，Signals 存結果 |
| **NgRx Store** | ✅ RxJS | Store 基於 Observable |

#### 2️⃣ UI 狀態管理（Signals 優先）

##### Component Local State
```typescript
// ✅ GOOD: 使用 Signals
@Component({
  selector: 'app-task-list',
  template: `
    <div>
      <h2>Tasks ({{ totalTasks() }})</h2>
      <input [(ngModel)]="searchTerm" />
      <ul>
        @for (task of filteredTasks(); track task.id) {
          <li>{{ task.title }}</li>
        }
      </ul>
    </div>
  `
})
export class TaskListComponent {
  // Signals for UI state
  tasks = signal<Task[]>([]);
  searchTerm = signal('');

  // Computed property
  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.tasks().filter(t => 
      t.title.toLowerCase().includes(term)
    );
  });

  totalTasks = computed(() => this.tasks().length);

  // Effect for side effects
  logEffect = effect(() => {
    console.log('Tasks updated:', this.tasks().length);
  });

  // Update from async operation (mix with RxJS)
  async loadTasks() {
    const result = await this.taskService.getTasks();
    if (Result.isOk(result)) {
      this.tasks.set(result.value);  // 更新 Signal
    }
  }
}
```

##### Signal Store (Global State)
```typescript
// ✅ GOOD: 使用 Signal Store
import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState({
    tasks: [] as Task[],
    loading: false,
    error: null as Error | null
  }),
  withComputed(({ tasks }) => ({
    totalTasks: computed(() => tasks().length),
    completedTasks: computed(() => 
      tasks().filter(t => t.status === 'completed')
    )
  })),
  withMethods((store, taskService = inject(TaskService)) => ({
    async loadTasks() {
      patchState(store, { loading: true });
      const result = await taskService.getTasks();
      
      if (Result.isOk(result)) {
        patchState(store, { 
          tasks: result.value, 
          loading: false 
        });
      } else {
        patchState(store, { 
          error: result.error, 
          loading: false 
        });
      }
    }
  }))
);

// Component usage
export class TaskComponent {
  readonly store = inject(TaskStore);

  ngOnInit() {
    this.store.loadTasks();
  }
}

// Template
@if (store.loading()) {
  <div>Loading...</div>
}
@if (store.error()) {
  <div>Error: {{ store.error()!.message }}</div>
}
@for (task of store.tasks(); track task.id) {
  <div>{{ task.title }}</div>
}
```

#### 3️⃣ 非同步操作（RxJS 優先）

##### HTTP Requests
```typescript
// ✅ GOOD: RxJS for HTTP
export class TaskService {
  private http = inject(HttpClient);

  getTasks(): Observable<Result<Task[], ApplicationError>> {
    return this.http.get<Task[]>('/api/tasks').pipe(
      map(tasks => ok(tasks)),
      catchError(error => of(err(
        ErrorFactory.application.queryFailed('GetTasks', error.message, error)
      )))
    );
  }

  createTask(command: CreateTaskCommand): Observable<Result<Task, ApplicationError>> {
    return this.http.post<Task>('/api/tasks', command).pipe(
      map(task => ok(task)),
      catchError(error => of(err(
        ErrorFactory.application.commandFailed('CreateTask', error.message, error)
      )))
    );
  }
}
```

##### Event Store Subscription
```typescript
// ✅ GOOD: RxJS for real-time events
export class EventStoreService {
  private firestore = inject(Firestore);

  subscribeToEvents(aggregateId: string): Observable<DomainEvent[]> {
    return collectionData(
      query(
        collection(this.firestore, 'events'),
        where('aggregateId', '==', aggregateId),
        orderBy('timestamp', 'asc')
      )
    ).pipe(
      map(docs => docs.map(doc => doc as DomainEvent)),
      catchError(error => {
        console.error('Event subscription error:', error);
        return of([]);
      })
    );
  }
}
```

#### 4️⃣ Signals + RxJS 混合使用（Best Practice）

##### Pattern 1: RxJS to Signal
```typescript
// ✅ GOOD: RxJS Observable → Signal
export class TaskComponent {
  private taskService = inject(TaskService);
  
  // Signal to hold async result
  tasks = signal<Task[]>([]);
  loading = signal(false);
  error = signal<Error | null>(null);

  ngOnInit() {
    this.loadTasks();
  }

  private loadTasks() {
    this.loading.set(true);
    
    this.taskService.getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.loading.set(false);
          if (Result.isOk(result)) {
            this.tasks.set(result.value);
          } else {
            this.error.set(result.error);
          }
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err);
        }
      });
  }
}
```

##### Pattern 2: toSignal() Helper
```typescript
// ✅ GOOD: 使用 toSignal 轉換
import { toSignal } from '@angular/core/rxjs-interop';

export class TaskComponent {
  private taskService = inject(TaskService);

  // 自動轉換 Observable 為 Signal
  tasks = toSignal(
    this.taskService.getTasks().pipe(
      map(result => Result.isOk(result) ? result.value : [])
    ),
    { initialValue: [] }
  );

  // Template 直接使用
  // {{ tasks().length }}
}
```

##### Pattern 3: Signal to Observable
```typescript
// ✅ GOOD: Signal → Observable (較少使用)
import { toObservable } from '@angular/core/rxjs-interop';

export class TaskComponent {
  searchTerm = signal('');

  // 轉換為 Observable 以使用 RxJS operators
  searchTerm$ = toObservable(this.searchTerm);

  filteredTasks$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.taskService.search(term))
  );
}
```

#### 5️⃣ 反模式（Anti-Patterns）

##### ❌ 錯誤 1: UI State 用 RxJS
```typescript
// ❌ BAD: 過度使用 RxJS
export class TaskComponent {
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  updateSearchTerm(term: string) {
    this.searchTermSubject.next(term);
  }
}

// ✅ GOOD: 使用 Signals
export class TaskComponent {
  searchTerm = signal('');
  
  updateSearchTerm(term: string) {
    this.searchTerm.set(term);
  }
}
```

##### ❌ 錯誤 2: 同步操作用 RxJS
```typescript
// ❌ BAD: 簡單計算用 RxJS
filteredTasks$ = combineLatest([this.tasks$, this.searchTerm$]).pipe(
  map(([tasks, term]) => tasks.filter(t => t.title.includes(term)))
);

// ✅ GOOD: 使用 computed()
filteredTasks = computed(() => 
  this.tasks().filter(t => t.title().includes(this.searchTerm()))
);
```

##### ❌ 錯誤 3: 忘記 takeUntilDestroyed
```typescript
// ❌ BAD: 記憶體洩漏
ngOnInit() {
  this.taskService.getTasks().subscribe(tasks => {
    this.tasks.set(tasks);
  });
}

// ✅ GOOD: 自動取消訂閱
private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.taskService.getTasks()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(tasks => this.tasks.set(tasks));
}
```

#### 6️⃣ 遷移策略（從 RxJS 到 Signals）

##### Phase 1: 新程式碼優先使用 Signals
- 新 Component 的 local state 用 Signals
- 新 computed property 用 computed()
- 保留現有 RxJS 程式碼不動

##### Phase 2: 逐步遷移簡單狀態
- 識別純 UI 狀態的 BehaviorSubject
- 替換為 Signal
- 使用 toSignal() 作為過渡

##### Phase 3: 保留 RxJS 核心場景
- HTTP 請求保持 Observable
- Event Store 訂閱保持 Observable
- 複雜非同步流保持 Observable

## Rationale (為什麼)

### Signals 的優勢

| 優勢 | 說明 |
|-----|------|
| **更簡單** | 無需訂閱/取消訂閱 |
| **更快** | Zone.less change detection |
| **更直觀** | `count()` vs `count$ \| async` |
| **自動追蹤** | computed() 自動追蹤依賴 |
| **記憶體安全** | 無訂閱洩漏風險 |

### RxJS 的優勢

| 優勢 | 說明 |
|-----|------|
| **豐富 Operators** | debounceTime, switchMap, retry... |
| **錯誤處理** | catchError, retry, retryWhen |
| **取消機制** | unsubscribe, takeUntil |
| **多值流** | 適合事件流、WebSocket |
| **生態系統** | NgRx, HttpClient 基於 Observable |

### 為何不能只用一種？

#### 只用 Signals 的問題
- 缺少非同步操作的 operators
- 與現有生態系統不相容（HttpClient, NgRx）
- 複雜流程難以表達

#### 只用 RxJS 的問題
- UI 狀態管理過於複雜
- 需要手動管理訂閱
- 效能不如 Signals（Zone.js 開銷）
- 程式碼冗長（async pipe, subscribe）

## Consequences (後果)

### 正面影響
- **清晰分工**：Signals 管 UI，RxJS 管非同步
- **最佳效能**：各司其職，發揮所長
- **簡化程式碼**：UI 狀態更簡潔
- **向前相容**：符合 Angular 未來方向

### 負面影響
- **學習曲線**：需要理解兩套系統
- **轉換開銷**：Signal ↔ Observable 轉換
- **混亂風險**：可能濫用或混用

### 對 L0/L1/L2 的影響
- **L0 (Core)**：定義 Signal-based State 介面
- **L1 (Infrastructure)**：RxJS 處理非同步 I/O
- **L2 (Features)**：Signals 管 UI，RxJS 管業務流

## Follow-up / Tracking (追蹤)

### 實施檢查點
- [x] Angular Signals 啟用
- [x] @ngrx/signals 安裝
- [ ] 團隊培訓（Signals vs RxJS 決策）
- [ ] 建立遷移指南
- [ ] Code Review Checklist
- [ ] 逐步遷移現有 BehaviorSubject

### 決策流程圖

```
需要反應式狀態？
    ↓
是否為非同步操作？
    ↓ No                      ↓ Yes
是否為 UI 狀態？           使用 RxJS
    ↓ Yes        ↓ No           ↓
使用 Signals    是否為計算屬性？  HTTP / WebSocket / Events
                    ↓ Yes    ↓ No
                computed()   是否需要豐富 operators？
                                ↓ Yes      ↓ No
                             使用 RxJS   可用 Signals + effect()
```

### Code Review Checklist

- [ ] UI Local State 是否使用 Signal？
- [ ] 計算屬性是否使用 computed()？
- [ ] HTTP 請求是否使用 Observable？
- [ ] RxJS 訂閱是否有 takeUntilDestroyed？
- [ ] 是否避免濫用 toObservable() / toSignal()？
- [ ] 是否避免混用導致混亂？

### 重新檢視時機
- Angular 新版本發布時
- @ngrx/signals 重大更新時
- 團隊反饋混亂或困惑時
- 每半年 review 使用狀況

### 相關 ADR
- ADR-0010: Angular & NgRx 技術棧選型
- ADR-0013: Result Pattern Error Handling
- ADR-0015: Testing Strategy & Quality Gates

---

**實施程度**: 70% (Signals 已使用，策略待統一)
**參考文件**: 
- Angular Signals 官方文件
- @ngrx/signals 文件
- RxJS 官方文件
