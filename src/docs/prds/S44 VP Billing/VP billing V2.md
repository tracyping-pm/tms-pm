太棒了！作为 TMS PM，我非常赞同现在切入 UI/UX 交互设计阶段。这能帮助开发和 UI 团队直观地理解“盲核对”与“支付打通”机制的落地细节。

以下是我针对 **Vendor Portal (VP)** 和 **TMS** 核心页面的 UI/UX 交互设计方案，重点突出了数据隔离与对比效率：

---

### 一、 Vendor Portal (VP) 端交互设计

设计原则：**极简上传、绝对数据隔离、清晰的状态指引。**

#### 1. 待出账运单列表 (Unbilled Waybills List)
* **页面布局**：标准的表格视图。
* **字段展示**：`Waybill No.`、`Unloading Time`、`Actual Truck Type`、`Origin`、`Destination`。
    * **⚠️ UX 关键**：**绝对不可展示任何金额字段**（如 Contract Cost）。
* **交互操作**：
    * 左侧提供**复选框 (Checkbox)**，支持跨页勾选。
    * 勾选后，顶部悬浮操作栏出现 `Generate Statement` 按钮，并在旁边提示已选的运单数量（例如：*5 Waybills Selected*）。

#### 2. 对账单数据填报页 (Upload Own Data / Create Statement)
* **页面布局**：分为“基础信息”与“运单金额明细”两部分。
* **基础信息模块**：
    * 填写/上传发票：`Invoice No.`（支持多个）、`Invoice Proof`（必填，拖拽上传组件）。
* **运单金额明细模块 (List View)**：
    * 展示刚刚选中的运单列表。
    * 为每行运单提供金额输入框：`Basic Amount`、`Additional Charge`、`Exception Fee`。
    * **快捷交互 (Bulk Action)**：提供 `Download Template` 和 `Upload Excel` 功能。供应商可下载选定运单的空模板，本地填好金额后一键上传覆盖，提升大量运单的操作效率。
* **底部操作**：`Save as Draft`（保存草稿）与 `Submit to TMS`（提交）。提交后弹出二次确认：“*提交后将无法修改，是否确认？*”

#### 3. 供应商对账单列表 (Generated Statement List)
* **页面布局**：列表视图，按创建时间倒序排列。
* **字段展示**：`Statement No.`、`Total Submitted Amount`（供应商自己填报的总额）、`Creation Time`、`Status`。
* **状态与交互 (Status & Actions)**：
    * `Awaiting Comparison` (待比对)：仅可 `View`。
    * `Awaiting Re-bill` (被 TMS 拒回)：高亮显示（如红字），操作列提供 `Edit` 按钮。点击进入后，顶部醒目展示 TMS 的 `Reject Reason`，供应商可修改金额后重新提交。
    * `Pending Payment` / `Paid`：不可修改，仅供查询付款进度。

---

### 二、 TMS 端交互设计

设计原则：**高亮差异、提升比对效率、闭环支付链路。**

#### 1. TMS 对账单列表 (AP Statement List)
* **新增筛选器**：
    * `Source`：下拉单选 `TMS Internal` 或 `Vendor Portal`。
    * `Comparison Status`：下拉多选 `Match`、`Has Mismatch`、`Has Miss`。
* **列表高亮**：若对账单包含 `Mismatch` 或 `Miss` 项，在 `Statement No.` 旁边增加一个黄色的 `[⚠️ 异常]` 徽标，提醒 FA 优先处理。

#### 2. 对账单详情页 (Statement Detail) - 核心比对视图
这是 FA 工作最高频的页面，必须针对“盲核对”做特殊设计。

* **运单明细模块 (Waybill Billing Information)**：采用**双行对比 (Split View)** 或 **双列对比 (Side-by-side)** 布局。
    * **展示逻辑**：每一行结算项（如 Basic Amount），同时展示 **TMS Amount** 和 **Vendor Amount**。
    * **状态徽章 (Badges)**：
        * 金额完全一致：展示绿色的 `<Match>` 标签。
        * 金额不一致：展示红色的 `<Mismatch>` 标签，并将差值标红（如 *Diff: ₱ 500*）。
        * TMS 缺失该项（例如供应商报销过路费，但 TMS 无此 Additional Charge）：展示橙色的 `<Miss>` 标签。
* **操作交互 (Actions)**：
    * **单行修正 (Internal Modification)**：针对 Mismatch 的运单，提供 `Edit Amount` 按钮。点击后弹窗修改 TMS 金额，保存时**强制要求填写备注并上传凭证**（Operation Log 同步记录）。修改后差值为 0，标签自动变为 `<Match>`。
    * **全局拒回 (Reject to VP)**：若差异无法内部消化，点击顶部的 `Reject` 按钮，弹窗强制填写 `Reject Reason`，随后该账单退回至 VP。
    * **全局确认 (Confirm)**：**只有当列表中所有项均为 `<Match>` 时，`Confirm` 按钮才高亮可用**。点击后对账单状态变更为 `Pending Payment`。

#### 3. 支付打通与列表 (Payment Integration & List)
* **一键发起支付**：
    * 在状态为 `Pending Payment` 的对账单详情页顶部，出现蓝色的 `Create Payment Request` 按钮。
    * 点击后，系统自动提取对账单数据（Payee Name, Bank Account, Net Amount 等）填充至创建弹窗，FA 仅需补充必要审批信息即可提交。
* **支付申请列表 (Payment Request List - 同步 HR)**：
    * **列表字段**：`Payment No.`、`Associated Statement No.`、`Amount`、`HR Status` (如 Pending Approval, Released, Closed)。
    * **状态联动**：一旦此处列表的 `HR Status` 变为 `Released` / `Closed`，系统自动将对应的 AP Statement 状态更新为 `Paid`，并在 Operation Log 中打上系统日志：“*Status auto-updated to Paid via HR Payment integration.*”

---

这个 UI/UX 框架旨在最大程度减少双方的沟通摩擦成本。针对 TMS 详情页的比对视图，你倾向于使用**上下双行展示（TMS在上，Vendor在下）**，还是**左右双列展示（左TMS，右Vendor）**来呈现 Mismatch 的金额？