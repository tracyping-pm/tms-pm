这份针对预付款（Prepaid）和应付账单（AP Statement）的优化需求非常清晰，精准抓住了**“VP端盲估防泄露”**以及**“TMS端内部对账与资金流打通”**这两个核心业务痛点。将财务系统（HR Payment 模块）与业务系统（TMS）打通，是实现结算自动化闭环的关键一步。

我已经为你将这些需求梳理为**标准的 PRD 交互与功能说明**，并严格保留了所有的英文原文，融入了东南亚结算特性的 UX 建议。

---

### 1. 需求背景与优化目标 (Background & Objectives)
为了进一步提升东南亚干线及城配供应商的资金周转效率，同时保障我方业务数据的安全与对账的高效性，本次迭代将对 Vendor Portal (VP端) 的预付款申请和 TMS 端的应付对账流程进行重构。
* **VP 端核心目标：** 实现 `PrePaid Applications` 的黑盒操作，屏蔽系统基准价（`basic Amount`），要求供应商盲填申请金额，防范价格敏感信息泄露；优化前端展示，降低认知门槛。
* **TMS 端核心目标：** 统一支付申请入口为 `Vendor Payment Application`，并打通 `AP statement` 与 HR 支付模块。在 `Awaiting Comparison` 阶段引入“双向金额比对”交互，提升对账清晰度；实现账单状态随支付结果自动流转。

---

### 2. 核心功能与交互说明 (Core Features & Interaction)

#### 2.1 Vendor Portal (VP) 端交互优化

**2.1.1 新增预付款申请 (Add PrePaid Applications)**
* **价格黑盒逻辑 (Price Blackbox):** 在供应商勾选关联运单发起申请时，前端**严禁透出**运单的系统基准价（`basic Amount`）。
* **金额录入 (Amount Input):** 增加自定义金额输入框，要求供应商自行输入期望申请的预付款金额（`Application Amount`）。
* **动态银行信息 (Dynamic Bank Info):** 在 `Select Bank` 环节，除下拉选择已维护的银行卡外，在下拉列表底部增加 `+ Add New Bank Info` 的快捷操作入口，允许供应商在不阻断当前申请流程的情况下，采用侧滑抽屉或弹窗的形式临时添加并保存新的收款账户。

**2.1.2 预付款申请列表 (PrePaid Applications List)**
* **金额显示脱敏 (Currency Symbol Removal):** 列表页中的申请金额列（`Application Amount`），直接展示数值（如 `1,500.00`），**不展示任何币种符号（如 ₱, ฿, $）**，简化多币种场景下的前端展示。

**2.1.3 预付款申请详情 (PrePaid Applications Detail)**
详情页需进行模块化（Card-based）重构，清晰划分信息层级：
* **Application Information:** 展示申请单号、申请日期、申请金额等基础信息。
* **Associated Waybills:** 以列表形式展示本次申请关联的所有运单号及对应运单的运输状态。
* **Submitted Proof:** 图片/文件画廊组件，展示供应商上传的支持性凭证，支持点击放大预览。
* **Payment Status:** 引入时间轴（Timeline）或步骤条（Stepper）组件，清晰展示当前打款进度（如：Pending -> Approved -> Paid）。

---

#### 2.2 TMS 端交互优化

**2.2.1 支付申请中心重构 (Vendor Payment Application)**
* **菜单更名:** 原 `Prepaid Application` 菜单正式更名为 `Vendor Payment Application`。
* **数据范围融合 (Data Scope):** 列表需融合三种来源的支付申请数据：
    1.  VP 端供应商主动提交的 `Prepaid Application`。
    2.  TMS 内部人员手动添加的 `Prepaid Application`。
    3.  由 `AP Statement` 流转至待支付（`pending payment`）后系统自动生成的 `AP Application`。
* **类型区分 (Type Differentiation):** 列表新增 `Application Type` 字段列，以不同颜色的 Tag（标签）区分 `Prepaid Application` 和 `AP Application`，支持下拉筛选。

**2.2.2 TMS AP Statement 详情与交互流转**
围绕 `AP statement` 详情页，进行深度的对账与资金打通设计：

* **A. 账单比对台 (Awaiting Comparison Interaction):**
    * **双向数据比对 (Side-by-side View):** 当账单处于 `Awaiting Comparison` 状态时，账单明细列表需将每个结算项（Settlement Item）拆分为两列：`TMS Amount`（系统计算金额）与 `Vendor Amount`（供应商提交金额）。建议增加一列 `Variance`（差值）标红高亮异常项。
    * **穿透修改 (Deep Link Edit):** 若发现差异需要以供应商金额或协商金额为准，提供 `Edit in Waybill` 操作按钮。点击后新开 Tab 页跳转至对应的运单详情页进行修改。（**约束：** 运单层面的修改必须严格记录至该运单的 `Operation Log` 中，格式为：`[Time] [User] modified [Field] from [Old Value] to [New Value]`）。

* **B. 确认与支付打通 (Confirm & Auto-generation):**
    * 当对账无误后，详情页右上方的主操作按钮名称更新为 **`Confirm & Create Vendor payment`**。
    * 点击此按钮，系统不仅推进账单状态，同时通过 API 自动对接 HR 系统的 Payment 模块，后台无缝生成对应的支付申请单（即上文的 `AP Application`）。

* **C. 详情页模块补全 (Detail Page Modules):**
    * **Invoice Module & Proof Module:** 增加发票和凭证专属卡片模块。展示供应商或内部上传的发票扫描件、发票号（`Invoice Number`）及相关 `Proof`，支持预览与下载。
    * **状态自动化 (Status Auto-sync):** 若该 `AP statement` 已经流转至待支付状态，系统需监听关联的 `AP Application` 的支付回执。当 HR 模块完成打款，当前账单状态自动从待支付更新为已支付（`Paid` / `Settled`）。

* **D. 全局操作日志 (Operate Log):**
    * 详情页统一 `Operate Log` 抽屉/切页。日志流需混合展示两类信息：
        1.  **内部操作 (Internal Operations):** 如内部人员的 Status 变更、修改记录等。
        2.  **内外部协同往来 (Vendor Interactions):** 如 Vendor Submitted, Vendor Rejected, Customer Confirm 等交互留痕。
    * *UX建议:* 使用不同颜色的 Icon 区分“内部系统动作”与“供应商操作动作”。

---

**Expert Guide Follow-up:**
关于 `Awaiting Comparison` 阶段的“穿透修改”逻辑，当运营人员点击 `Edit in Waybill` 跳转到运单修改了金额后，原 `AP Statement` 详情页返回时自动检测并弹窗提示“运单金额已变更，是否重新比对”