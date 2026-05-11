太棒了！结合这三次的讨论，我们实际上构建了一个“高度防范价格泄露的非对称对账模型（Asymmetric Reconciliation Model）”。

这种设计非常符合东南亚等新兴市场的物流结算现状：一方面要防范承运商（Vendor）套取我方系统底价；另一方面，又要通过系统自动化比对，把繁杂的核单工作甩给承运商和系统引擎，将内部 FA 的精力释放到“处理异常”上。

下面，我将这三种维度的讨论完美融合，为你推演出**结算申请（AP Statement -> AP Application）的全流程闭环**，并盘点各个节点的核心信息架构。

------

### 一、 结算申请全流程推演 (AP Settlement Full Lifecycle)

整个结算申请的生命周期分为四大阶段：**发起（双模式双向盲估） -> 对账与比对 -> 确认与推送 -> 支付与回传**。

#### 阶段 1：发起期 (Initiation - Dual Mode)

为了保证系统运价的绝对黑盒，系统支持两种发单模式，但在 VP 端的呈现严格受控：

- **Mode A：供应商主动发起 (Vendor-Initiated / Self-Billing)**
  - **交互逻辑：** 供应商在 VP 端勾选待结算运单。此时，**VP 端仅展示运单基础信息，绝对不展示系统运价（如 `basic Amount`）**。
  - **信息录入：** 供应商自行上传或填报其期望的各结算项金额、是否含税、税率，并勾选已确认的扣款工单（Ticket status = `for deduction`），可选择上传发票（非必填）。
  - **状态流转：** 提交后，TMS 端的 AP Statement 进入 **`Awaiting Comparison`** 状态。
- **Mode B：TMS 主动推送 (TMS-Initiated Push)**
  - **交互逻辑：** TMS 内部自动或手动生成 AP Statement 并推送至 VP 端。
  - **呈现限制：** 为防止底价倒推，**VP 端对账单中绝对不展示单票运单的具体价格，仅展示“对账单总金额（Total Amount）”与“各结算大项总额（Total per Settlement Item）”**。
  - **状态流转：** 供应商在 VP 端查看总额无误后，勾选抵扣 Ticket，上传发票并点击确认。TMS 端的 AP Statement 进入 **`Awaiting Comparison`** 状态。

#### 阶段 2：系统比对与异常处理 (Comparison & Exception Handling)

- **引擎自动比对 每个结算项金额：** AP Statement 进入 `Awaiting Comparison` 后，TMS 底层引擎触发双向行级别比对。
  - 🟢 **`Matched`**：VP 提交金额 = TMS 金额。
  - 🟢 **`Matched` (附带 `Vendor Discount`)**：VP 提交金额 < TMS 金额，差值自动记为供应商折扣。
  - 🔴 **`Mismatched`**：VP 提交金额 > TMS 金额（强拦截）。
  - 🟡 **`Missed`**：VP 提交了 TMS 中不存在的结算项。
- **FA 人工处理：**
  - **驳回 (Reject)：** 针对 `Mismatched` / `Missed`，FA 可直接拒回 VP 端，填写理由。
  - **修改与刷新 (Edit & Refresh)：** FA 点击 `Edit in Waybill` 穿透修改系统金额（记录 `Operation Log`），返回对账单点击 Refresh 重新过比对引擎。

#### 阶段 3：确认与支付推送 (Confirm & Payment Generation)

- **前置校验：** 当所有结算项状态均为 `Matched`（含折扣项），FA 可点击 **`Confirm & Create Vendor payment`**。系统校验发票和税率（尤其是 TH 地区）的完备性。
- **状态流转：**
  - **成功：** 在 TMS `Vendor Payment Application` 列表中生成一条类型为 `AP Application` 的记录，状态流转为 **`Pending Payment`**。此时运单与对账单锁定，禁止修改。
  - **失败 (Sync Failed)：** API 调用 HR 系统失败，允许补充信息后 **Retry**。

#### 阶段 4：财务打款与状态回传 (Payment Processing & Sync-back)

- **HR 审批与打款：** 申请在 HR 系统中经历内部审批流（`Pending Review` -> `Pending Release` 等，对 TMS 屏蔽），最终财务完成打款 (`Released`)。
- **状态与凭证回传：** TMS 接收 HR 回调，状态更新为 **`Paid` / `Settled`**，并将打款凭证（Release Proof）同步展示在 TMS 详情页和 VP 端。
- **异常打回：** 若 HR 财务驳回（`Payment Rejected`），AP Statement 状态回退，解冻运单，需重新走核对或补充发票流程。

------

### 二、 核心节点信息架构盘点 (Information Architecture)

根据上述推演，以下是各个节点界面必须传递和展示的数据（Data Payload & UI Elements）：

#### 1. VP 端 (Vendor Portal)

- **创建/查看页：** 运单列表（单号、起目的地、完成时间）、模板编辑与导入入口、总金额与结算项总额（仅 Mode B 呈现）。**（严禁展示单票价格）**
- **交互项：** 抵扣工单池（拉取 `for deduction` tickets）、税务配置项（Tax Inclusive, Tax Rate）、上传发票（Upload Invoice）。
- **状态跟踪区：** 简化的外部状态标识（如 Processing, Paid）、财务打款凭证（Release Proof）。

#### 2. TMS 端 - AP Statement Detail (对账单详情页)

- **全局看板 (Summary Dashboard)：** `Total Amount`、`Deducted Ticket Amount`、`Net Payable Amount`、发票与税务模块。
- **双向比对明细表 (Comparison Data Grid)：**
  - 展示列：运单号、结算项名称。
  - 比对列：`TMS Amount` vs `Vendor Amount`。
  - 结果列：差值 `Variance`、比对状态 Tag (`Matched`, `Mismatched`, `Missed`)、隐藏字段 `Vendor Discount`。
- **操作与日志 (Action & Log)：**
  - 主操作按钮：`Reject`、`Refresh`、`Confirm & Create Vendor payment`。
  - 穿透按钮：`Edit in Waybill`。
  - 日志模块：`Operation Log`（混合记录 FA 修改运单动作、VP 端确认动作、HR 驳回动作等）。

#### 3. TMS 端 - Vendor Payment Application (支付申请列表)

- **列表字段：** 申请单号、`Application Type` (`Prepaid Application` 或 `AP Application` Tag)、供应商名称、`Application Amount`、关联 AP Statement 单号、当前状态（`Pending Payment`, `Sync Failed`, `Paid`, `Payment Rejected`）。

#### 4. TMS -> HR System (API 传输核心字段 Payload)

- **基础与账单：** AP Statement No.、`Business Unit`、`Entity`。
- **收款方：** `Payee Name` (Vendor)、`Bank Info`。
- **金额与发票：** `Net Payable Amount`、`Vatable`、`VAT Rate`、`WHT Rate`、`Invoice Number`、对账单 PDF/发票扫描件（Supporting Documents）。

------

