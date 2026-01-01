# Angular 技術選型

## 不需要的技術

❌ **NgModule** - Angular 20 使用 Standalone
❌ **肥 Service** - Signal-based Services
❌ **巨型 State Manager（NgRx）** - Signals 足夠
❌ **雙向綁定 State** - 單向數據流
❌ **CRUD Boilerplate** - Event Sourcing 簡化

## 使用的技術

✅ **Signals = Projection**
- 事件流派生響應式狀態
- 自動依賴追蹤
- 細粒度變更檢測

✅ **Event = 單一真實來源**
- 狀態變更都是事件
- 完整審計追蹤
- 時間旅行與重放

✅ **Process = 明確邊界**
- 流程定義清晰
- 狀態轉換可預測
- 易於測試維護

✅ **Governance = 不爆炸**
- 集中式決策引擎
- 明確權限控制
- 架構約束檢查

## 實踐範例

### Signal 狀態管理

```typescript
// 定義 Signal
const taskList = signal<Task[]>([]);
const selectedTask = signal<Task | null>(null);

// 計算衍生狀態
const completedTasks = computed(() => 
  taskList().filter(t => t.status === 'Completed')
);

// 響應變更
effect(() => {
  console.log('Tasks:', taskList().length);
});
```

### Event-Driven 組件

```typescript
@Component({
  selector: 'app-task-detail',
  standalone: true
})
export class TaskDetailComponent {
  // 輸出事件
  taskCompleted = output<string>();
  
  completeTask(taskId: string) {
    this.taskCompleted.emit(taskId);
  }
}
```

## 設計原則

**保持簡單** - 只在需要時引入抽象
**優先組合** - 而非繼承
**事件驅動** - 單向數據流

---

**版本**: Angular 20, TypeScript 5.9, RxJS 7.8  
**來源**: 技術.md
