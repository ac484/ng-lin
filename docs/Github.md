# Angular Core 模組詳解

## **auth\ - 認證授權**
**功能：** 處理使用者身份驗證和權限控制
- 登入/登出/註冊
- Token 管理 (JWT)
- 使用者狀態管理
- 權限檢查 (RBAC)
- 第三方登入 (Google, GitHub)
- 密碼重置/修改
- Session 管理

**核心服務：** AuthService, TokenService, PermissionService

---

## **audit\ - 稽核追蹤**
**功能：** 記錄使用者重要操作，提供合規證明
- 記錄誰在何時做了什麼
- 資料變更追蹤
- 操作結果記錄
- IP/裝置資訊
- 不可篡改的日誌
- 符合 GDPR/SOX 等法規

**記錄內容：** User, Action, Timestamp, IP, Result, Before/After Data

---

## **event-bus\ - 事件匯流排**
**功能：** 模組間解耦通訊，發布訂閱模式
- 跨元件通訊
- 模組間訊息傳遞
- 事件發布/訂閱
- 全域事件管理
- 避免元件緊耦合

**使用場景：** 
- 使用者登入後通知多個模組
- 購物車更新通知 Header
- 全域訊息廣播

---

## **config\ - 配置管理**
**功能：** 集中管理應用程式配置
- API 端點設定
- 環境變數 (dev/staging/prod)
- 功能開關 (Feature Toggle)
- 第三方服務金鑰
- 應用程式參數
- 動態配置載入

**配置項：** API_URL, TIMEOUT, CACHE_TTL, FEATURE_FLAGS

---

## **logger\ - 日誌記錄**
**功能：** 系統運行狀態記錄，協助除錯
- 分級記錄 (DEBUG, INFO, WARN, ERROR)
- 錯誤堆疊追蹤
- 效能監控
- API 請求記錄
- 控制台輸出/遠端上傳
- 開發/生產環境差異處理

**日誌級別：** TRACE < DEBUG < INFO < WARN < ERROR < FATAL

---

## **cache\ - 快取管理**
**功能：** 提升效能，減少重複請求
- 記憶體快取
- HTTP 請求快取
- 靜態資料快取
- 過期策略 (TTL)
- 快取失效處理
- LRU/LFU 演算法

**快取策略：** Memory Cache, LocalStorage, SessionStorage

---

## **storage\ - 本地/遠端儲存**
**功能：** 統一的資料持久化介面
- LocalStorage 封裝
- SessionStorage 封裝
- IndexedDB 操作
- Cookie 管理
- 加密儲存
- 跨瀏覽器相容性

**儲存類型：** Persistent (永久), Session (會話), Temporary (暫存)

---

## **http\ - HTTP 客戶端封裝**
**功能：** 統一的 HTTP 請求處理
- RESTful API 封裝
- 請求/回應格式化
- 錯誤統一處理
- 請求重試機制
- 請求取消
- 基礎 URL 配置
- 預設 Headers

**方法：** get(), post(), put(), delete(), patch()

---

## **interceptors\ - HTTP 攔截器**
**功能：** 攔截並處理 HTTP 請求/回應
- 自動添加 Token
- 請求/回應日誌
- Loading 狀態管理
- 錯誤統一處理
- 請求重試
- 快取控制
- API 版本控制

**常見攔截器：** AuthInterceptor, LoggingInterceptor, ErrorInterceptor

---

## **guards\ - 路由守衛**
**功能：** 控制路由訪問權限
- 登入驗證 (AuthGuard)
- 權限檢查 (RoleGuard)
- 資料預載入 (Resolve)
- 離開確認 (CanDeactivate)
- 防止重複導航

**守衛類型：** CanActivate, CanDeactivate, Resolve, CanLoad

---

## **services\ - 共用服務**
**功能：** 全應用共用的業務邏輯服務
- 通知服務 (NotificationService)
- 載入狀態服務 (LoadingService)
- 訊息服務 (MessageService)
- 下載服務 (DownloadService)
- 上傳服務 (UploadService)
- 剪貼簿服務

**特性：** Singleton, Injectable, 跨模組共用

---

## **models\ - 核心資料模型**
**功能：** 定義應用程式核心資料結構
- 使用者模型 (User)
- 回應模型 (ApiResponse)
- 分頁模型 (Pagination)
- 類別/介面定義
- 資料轉換邏輯
- 預設值設定

**範例：** User, Role, Permission, Token, ApiResponse

---

## **utils\ - 工具函數**
**功能：** 通用工具函數庫
- 日期格式化
- 字串處理
- 陣列操作
- 物件深拷貝
- 防抖/節流
- 驗證函數
- 加密/解密
- 檔案處理

**範例：** formatDate(), debounce(), deepClone(), isEmail()

---

## **constants\ - 常數定義**
**功能：** 全域常數集中管理
- API 路徑常數
- 狀態碼常數
- 錯誤訊息
- 正則表達式
- 預設配置值
- 魔術數字消除

**範例：** API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES

---

## **enums\ - 列舉定義**
**功能：** 定義固定選項集合
- 使用者角色 (Role)
- 訂單狀態 (OrderStatus)
- 權限類型 (Permission)
- HTTP 方法 (HttpMethod)
- 環境類型 (Environment)

**範例：** UserRole, OrderStatus, PaymentMethod

---

## **interfaces\ - 介面定義**
**功能：** TypeScript 介面和類型定義
- API 請求/回應介面
- 元件配置介面
- 服務介面
- 事件介面
- 泛型介面

**範例：** IUser, IApiResponse, IConfig, IEvent

---

## **validators\ - 驗證器**
**功能：** 表單和資料驗證
- 自訂驗證規則
- 非同步驗證
- 跨欄位驗證
- 正則表達式驗證
- 業務規則驗證
- 錯誤訊息處理

**範例：** emailValidator, passwordStrength, phoneValidator

---

## **decorators\ - 裝飾器**
**功能：** 增強類別、方法、屬性功能
- 日誌裝飾器 (@Log)
- 快取裝飾器 (@Cache)
- 防抖裝飾器 (@Debounce)
- 權限裝飾器 (@RequirePermission)
- 性能監控 (@Measure)

**範例：** @Cacheable, @Retry, @Timeout

---

## **pipes\ - 管道**
**功能：** 資料轉換和格式化
- 日期格式化
- 貨幣格式化
- 文字截斷
- 安全 HTML
- 排序/過濾
- 自訂轉換邏輯

**範例：** SafeHtmlPipe, TruncatePipe, TimeAgoPipe

---

## **directives\ - 指令**
**功能：** 擴展 HTML 元素行為
- 權限控制指令 (*hasPermission)
- 點擊外部指令 (clickOutside)
- 拖放指令 (dragDrop)
- 懶加載指令 (lazyLoad)
- 自動聚焦指令

**範例：** PermissionDirective, HighlightDirective

---

## **errors\ - 錯誤處理**
**功能：** 統一錯誤處理機制
- 全域錯誤處理器
- 自訂錯誤類別
- 錯誤訊息映射
- 錯誤上報
- 使用者友善提示
- 錯誤恢復策略

**錯誤類型：** NetworkError, ValidationError, AuthError

---

## **core.module.ts - 核心模組主檔**
**功能：** 整合所有核心功能
- 匯入所有核心模組
- 提供全域服務
- 配置攔截器
- 初始化應用程式
- **單次匯入原則** (只在 AppModule 匯入)

**關鍵：** `@NgModule({ providers: [...] })` + 防止重複匯入

---

## **模組關係圖**

```
AppModule
    └── CoreModule (只匯入一次)
            ├── AuthModule → guards, interceptors
            ├── HttpModule → interceptors
            ├── ConfigModule → 全域配置
            ├── LoggerModule → 日誌服務
            └── 其他核心服務
```

這些模組構成 Angular 應用的**基礎設施層**，為業務模組提供穩定可靠的底層支援。


# Angular Core 模組詳解

## **auth\ - 認證授權**
**功能：** 處理使用者身份驗證和權限控制
- 登入/登出/註冊
- Token 管理 (JWT)
- 使用者狀態管理
- 權限檢查 (RBAC)
- 第三方登入 (Google, GitHub)
- 密碼重置/修改
- Session 管理

**核心服務：** AuthService, TokenService, PermissionService

---

## **audit\ - 稽核追蹤**
**功能：** 記錄使用者重要操作，提供合規證明
- 記錄誰在何時做了什麼
- 資料變更追蹤
- 操作結果記錄
- IP/裝置資訊
- 不可篡改的日誌
- 符合 GDPR/SOX 等法規

**記錄內容：** User, Action, Timestamp, IP, Result, Before/After Data

---

## **event-bus\ - 事件匯流排**
**功能：** 模組間解耦通訊，發布訂閱模式
- 跨元件通訊
- 模組間訊息傳遞
- 事件發布/訂閱
- 全域事件管理
- 避免元件緊耦合

**使用場景：** 
- 使用者登入後通知多個模組
- 購物車更新通知 Header
- 全域訊息廣播

---

## **config\ - 配置管理**
**功能：** 集中管理應用程式配置
- API 端點設定
- 環境變數 (dev/staging/prod)
- 功能開關 (Feature Toggle)
- 第三方服務金鑰
- 應用程式參數
- 動態配置載入

**配置項：** API_URL, TIMEOUT, CACHE_TTL, FEATURE_FLAGS

---

## **logger\ - 日誌記錄**
**功能：** 系統運行狀態記錄，協助除錯
- 分級記錄 (DEBUG, INFO, WARN, ERROR)
- 錯誤堆疊追蹤
- 效能監控
- API 請求記錄
- 控制台輸出/遠端上傳
- 開發/生產環境差異處理

**日誌級別：** TRACE < DEBUG < INFO < WARN < ERROR < FATAL

---

## **cache\ - 快取管理**
**功能：** 提升效能，減少重複請求
- 記憶體快取
- HTTP 請求快取
- 靜態資料快取
- 過期策略 (TTL)
- 快取失效處理
- LRU/LFU 演算法

**快取策略：** Memory Cache, LocalStorage, SessionStorage

---

## **storage\ - 本地/遠端儲存**
**功能：** 統一的資料持久化介面
- LocalStorage 封裝
- SessionStorage 封裝
- IndexedDB 操作
- Cookie 管理
- 加密儲存
- 跨瀏覽器相容性

**儲存類型：** Persistent (永久), Session (會話), Temporary (暫存)

---

## **http\ - HTTP 客戶端封裝**
**功能：** 統一的 HTTP 請求處理
- RESTful API 封裝
- 請求/回應格式化
- 錯誤統一處理
- 請求重試機制
- 請求取消
- 基礎 URL 配置
- 預設 Headers

**方法：** get(), post(), put(), delete(), patch()

---

## **interceptors\ - HTTP 攔截器**
**功能：** 攔截並處理 HTTP 請求/回應
- 自動添加 Token
- 請求/回應日誌
- Loading 狀態管理
- 錯誤統一處理
- 請求重試
- 快取控制
- API 版本控制

**常見攔截器：** AuthInterceptor, LoggingInterceptor, ErrorInterceptor

---

## **guards\ - 路由守衛**
**功能：** 控制路由訪問權限
- 登入驗證 (AuthGuard)
- 權限檢查 (RoleGuard)
- 資料預載入 (Resolve)
- 離開確認 (CanDeactivate)
- 防止重複導航

**守衛類型：** CanActivate, CanDeactivate, Resolve, CanLoad

---

## **services\ - 共用服務**
**功能：** 全應用共用的業務邏輯服務
- 通知服務 (NotificationService)
- 載入狀態服務 (LoadingService)
- 訊息服務 (MessageService)
- 下載服務 (DownloadService)
- 上傳服務 (UploadService)
- 剪貼簿服務

**特性：** Singleton, Injectable, 跨模組共用

---

## **models\ - 核心資料模型**
**功能：** 定義應用程式核心資料結構
- 使用者模型 (User)
- 回應模型 (ApiResponse)
- 分頁模型 (Pagination)
- 類別/介面定義
- 資料轉換邏輯
- 預設值設定

**範例：** User, Role, Permission, Token, ApiResponse

---

## **utils\ - 工具函數**
**功能：** 通用工具函數庫
- 日期格式化
- 字串處理
- 陣列操作
- 物件深拷貝
- 防抖/節流
- 驗證函數
- 加密/解密
- 檔案處理

**範例：** formatDate(), debounce(), deepClone(), isEmail()

---

## **constants\ - 常數定義**
**功能：** 全域常數集中管理
- API 路徑常數
- 狀態碼常數
- 錯誤訊息
- 正則表達式
- 預設配置值
- 魔術數字消除

**範例：** API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES

---

## **enums\ - 列舉定義**
**功能：** 定義固定選項集合
- 使用者角色 (Role)
- 訂單狀態 (OrderStatus)
- 權限類型 (Permission)
- HTTP 方法 (HttpMethod)
- 環境類型 (Environment)

**範例：** UserRole, OrderStatus, PaymentMethod

---

## **interfaces\ - 介面定義**
**功能：** TypeScript 介面和類型定義
- API 請求/回應介面
- 元件配置介面
- 服務介面
- 事件介面
- 泛型介面

**範例：** IUser, IApiResponse, IConfig, IEvent

---

## **validators\ - 驗證器**
**功能：** 表單和資料驗證
- 自訂驗證規則
- 非同步驗證
- 跨欄位驗證
- 正則表達式驗證
- 業務規則驗證
- 錯誤訊息處理

**範例：** emailValidator, passwordStrength, phoneValidator

---

## **decorators\ - 裝飾器**
**功能：** 增強類別、方法、屬性功能
- 日誌裝飾器 (@Log)
- 快取裝飾器 (@Cache)
- 防抖裝飾器 (@Debounce)
- 權限裝飾器 (@RequirePermission)
- 性能監控 (@Measure)

**範例：** @Cacheable, @Retry, @Timeout

---

## **pipes\ - 管道**
**功能：** 資料轉換和格式化
- 日期格式化
- 貨幣格式化
- 文字截斷
- 安全 HTML
- 排序/過濾
- 自訂轉換邏輯

**範例：** SafeHtmlPipe, TruncatePipe, TimeAgoPipe

---

## **directives\ - 指令**
**功能：** 擴展 HTML 元素行為
- 權限控制指令 (*hasPermission)
- 點擊外部指令 (clickOutside)
- 拖放指令 (dragDrop)
- 懶加載指令 (lazyLoad)
- 自動聚焦指令

**範例：** PermissionDirective, HighlightDirective

---

## **errors\ - 錯誤處理**
**功能：** 統一錯誤處理機制
- 全域錯誤處理器
- 自訂錯誤類別
- 錯誤訊息映射
- 錯誤上報
- 使用者友善提示
- 錯誤恢復策略

**錯誤類型：** NetworkError, ValidationError, AuthError

---

## **core.module.ts - 核心模組主檔**
**功能：** 整合所有核心功能
- 匯入所有核心模組
- 提供全域服務
- 配置攔截器
- 初始化應用程式
- **單次匯入原則** (只在 AppModule 匯入)

**關鍵：** `@NgModule({ providers: [...] })` + 防止重複匯入

---

## **模組關係圖**

```
AppModule
    └── CoreModule (只匯入一次)
            ├── AuthModule → guards, interceptors
            ├── HttpModule → interceptors
            ├── ConfigModule → 全域配置
            ├── LoggerModule → 日誌服務
            └── 其他核心服務
```

這些模組構成 Angular 應用的**基礎設施層**，為業務模組提供穩定可靠的底層支援。