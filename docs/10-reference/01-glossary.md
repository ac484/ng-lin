# 術語表 (Glossary)

## A

**Aggregate（聚合根）**  
DDD 中的一致性邊界，管理一組相關實體的生命週期。

**Anti-Pattern（反模式）**  
常見但有害的設計或實作模式。

## C

**Causal Event（因果事件）**  
包含因果元數據（causedBy）的事件，明確記錄觸發來源。

**Causality（因果關係）**  
事件之間的因果關聯，透過 causedBy、correlationId、causationId 記錄。

**causationId（因果鏈識別碼）**  
追蹤因果鏈路的唯一識別碼。

**Command（命令）**  
表達意圖或請求的訊息，可能成功或失敗。

**correlationId（流程識別碼）**  
群組相關事件到同一業務流程的識別碼。

**CQRS（命令查詢職責分離）**  
分離讀取（Query）和寫入（Command）的架構模式。

## D

**DDD（領域驅動設計）**  
以業務領域為中心的軟體設計方法。

**Determinism（確定性）**  
相同輸入必然產生相同輸出的特性。

**Domain Event（領域事件）**  
描述業務領域中已發生事實的事件。

## E

**Event Sourcing（事件溯源）**  
將所有狀態變更記錄為事件序列的模式。

**Event Store（事件儲存）**  
持久化事件的儲存系統。

**Event Bus（事件匯流排）**  
事件發布/訂閱的訊息系統。

## I

**Idempotency（冪等性）**  
重複執行相同操作產生相同結果的特性。

**Immutability（不可變性）**  
一旦創建就無法修改的特性。

## P

**Projection（投影）**  
從事件衍生的讀模型或視圖。

**Process Manager（流程管理器）**  
編排多個聚合根之間協作的組件。

## R

**Replay（重播）**  
從事件序列重建狀態的過程。

**Result Pattern（結果模式）**  
明確表達成功或失敗的錯誤處理模式。

## S

**Saga（長事務）**  
協調跨多個聚合根的業務流程。

**Snapshot（快照）**  
某時間點的狀態快照，用於優化重播性能。

**State Machine（狀態機）**  
定義狀態轉換規則的模型。

## T

**Temporal Query（時間查詢）**  
查詢特定時間點或時間範圍的狀態。

**traceId（追蹤識別碼）**  
分散式追蹤的唯一識別碼。

## V

**Value Object（值物件）**  
無識別性、以值為基礎的領域概念。

**Version（版本）**  
事件或聚合根的版本號，用於樂觀鎖。

---

**相關文件**：
- [系統定義](../02-paradigm/system-definition.md)
- [核心原則](../02-paradigm/core-principles.md)
- [事件模型](../04-core-model/event-model.md)
