# Account Feature Module

**定位 / Purpose**  
提供帳戶領域的可重用功能模組（Profile、Dashboard、Settings 等），供 `routes/account/*` 或其他 Blueprint 範圍的頁面調用。  
Provides reusable account-domain building blocks (profile, dashboard, settings) that pages can compose.

**結構 / Structure**
```
features/account/
├── components/   # 共用的帳戶 UI 元件（standalone + OnPush + signals）
├── services/     # 帳戶領域服務/外觀，僅透過 core repositories 取數
├── stores/       # 信號化的本地狀態（必要時）
├── models/       # 帳戶特定型別（核心模型仍在 core/models）
├── profile/      # 個人資料相關切片
├── dashboard/    # 帳戶儀表板切片
├── settings/     # 帳戶設定切片
└── (README.md, AGENTS.md)
```

**約束 / Constraints**
- 不直接操作 Firestore；資料由 `core` 層的 repositories/服務提供。  
- 不新增 NgModules 或 `any` 型別；使用 standalone、signals、`inject()`。  
- 共用 UI 放在 `shared/`，避免把純 UI 元件留在此處。  
- 保持與路由解耦；路由僅在 `routes/account/*` 層定義。

**調用指引 / Usage**
- 路由層匯入本模組的 components/services（透過 barrel export 或直接路徑）。  
- 服務層應依賴 `core` repositories 並實作 Result/錯誤處理；避免在元件中寫查詢。  
- 需要本地狀態時優先使用 signals store，並保持單一職責。
