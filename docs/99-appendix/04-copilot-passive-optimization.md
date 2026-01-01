# Context7 驅動的 Copilot Agent 被動/自動優化配置（2025+）

> 來源：Visual Studio Code GitHub Copilot Customization（Context7 ID: `/websites/code_visualstudio_copilot_customization`，2025+ 功能：Prompt Files、Custom Agents、Workspace Instructions）
>
> 目標：讓 Copilot agent 在不打擾開發者的情況下，持續以「事件溯源 + 因果驅動的流程」思維給出可落地建議。

## 被動/自動優化原則
- **低干擾、強守則**：保持被動提示，但強化上下文來源，確保回覆必須遵循 `.github/instructions/*.md` 的治理規則（taming-copilot、security、angular、spec-driven）。
- **事件優先的語境**：提示時預先提供 `docs/04-core-model/`、`docs/05-process-layer/`、`docs/06-projection-decision/`，讓 Copilot 默認採用事件模型、因果鏈、投影決策的語言。
- **作業系統化**：將「分析→設計→實作→驗證」拆成 agent 子任務；若信心 < 99.99% 必須查詢 Context7 來源並附上引用（遵守需求）。

## 建議配置步驟
1) **Workspace 指令模板（被動）**  
   - 在 Copilot Chat 啟動前，貼上「工作空間提示」：  
     - 優先閱讀 `.github/instructions/`（特別是 taming-copilot、security-and-owasp、angular、performance-optimization、spec-driven-workflow-v1）。  
     - 事件語境：預載 `docs/04-core-model/*.md`、`docs/05-process-layer/*.md`、`docs/06-projection-decision/*.md`。  
     - 程式語境：`src/app/core/`（event-bus、guards、audit、notification）、`src/app/features/`。  
   - 這些路徑可存成 VS Code Copilot 工作區預設提示（Prompt File），保持被動但高一致性。

2) **Agent 子任務拆分（Sequential-Thinking）**  
   - 要求 Copilot 先輸出「任務分解 + 信心評分」，不足 99.99% 時自動查 Context7（`resolve-library-id` + `get-library-docs`）。  
   - 子任務範例：  
     - **事件語境檢核**：事件名/因果鏈/投影是否對齊 docs 模型。  
     - **流程治理**：是否遵守 `.github/instructions/spec-driven-workflow-v1.instructions.md` 的需求/設計/任務文件。  
     - **安全/可運維**：守住 security-and-owasp、performance-optimization。

3) **Angular/Event-Sourced 預設回答模板（被動提示）**  
   - 回答時預設加入：  
     - 事件模型與事件命名檢查（來源：`docs/04-core-model/01-event-model.md`）。  
     - Handler/Process Manager 是否遵守 `05-process-layer/` 的補償、冪等與因果序。  
     - Event Bus/Notification/Audit 是否與 `src/app/core/event-bus`、`src/app/core/audit` 介面相容。  
   - 這些提示可放入 Copilot Prompt File 以被動套用（不需要每次手動輸入）。

4) **治理與驗證（被動巡檢）**  
   - 要求 Copilot 自動附上：  
     - 「已檢查的 instruction 清單 + 引用」  
     - 「信心 >99.99% 或已查 Context7」標記  
     - 「建議的文件更新位置」：需求（requirements.md）、設計（design.md）、任務（tasks.md）或 `docs/` 對應章節。  
   - 若為代碼路徑，附上「觀察/測試建議」而非直接提交大改，以符合 minimal-change 原則。

## 快速運行手冊
- 在 Copilot Chat 中建立「Workspace Prompt」：貼上上述路徑與治理規則，並保存為預設，讓 agent 在背景被動遵循。
- 新任務時先讓 Copilot 跑一次「Sequential-Thinking」→「信心檢查」→ 不足時自動 Context7 查詢。
- 輸出格式：`摘要 → 檢查過的規則/文件 → 建議/風險 → 下一步與驗證（含測試/觀察點）`。

## 為什麼對本專案有用
- 提前把事件語境與治理規範注入 Copilot，被動建議就能維持「事件溯源 + 因果驅動」的一致性。  
- 透過 Context7 查詢與信心門檻，避免過時建議；同時不需要手動反覆提醒（被動自動套用）。  
- 與現有核心（event-bus、audit、notification、guards）一致，降低 agent 提出不相容修改的風險。
