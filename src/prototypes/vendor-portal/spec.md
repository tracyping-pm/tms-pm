# Vendor Portal（VP）供应商自助结算 规格文档 V5

## 概述

VP Billing 基于"**盲核对**"设计原则：供应商在不可见 TMS 合同金额的情况下，自行填报每张运单的账单金额，TMS 侧接收后进行比对。

**核心页面**（左侧 FINANCE 菜单）：
1. **PrePaid Application**（预付申请，V5 价格黑盒 + 模块化详情）
2. **Unbilled Waybills**（待出账运单列表）
3. **Claim Tickets**（索赔工单，供应商视角）
4. **My Statements**（我的对账单）

**设计原则**：极简提单、绝对数据隔离（不展示任何 TMS 金额）、清晰的状态指引。

**预览地址**：`http://localhost:51720/prototypes/vendor-portal/`

相关方案与 PRD：
- `src/docs/prds/S44 VP Billing/VP billing V2.md`
- `src/docs/prds/S44 VP Billing/VP billing V3.md`
- `src/docs/prds/S44 VP Billing/VP billing V7.md`
- `src/docs/prds/S44 VP Billing/VP billing V8.md`
- `src/docs/prds/S38 Claim Ticket.md`

---

## 菜单与可点击性

| 菜单分组 | 菜单项 | 可点击 |
|---|---|---|
| MAIN | Home / Vendor Info / Trucks / Crew | 否（占位） |
| FINANCE | **PrePaid Application** | 是 |
| FINANCE | **Unbilled Waybills** | 是 |
| FINANCE | **Claim Tickets** | 是 |
| FINANCE | **My Statements** | 是 |

> **V7 变更**：`Accreditation Application`（认证申请）已从 FINANCE 菜单移除，统一归口至 `Procurement Mgmt` → `Application` 模块。

---

## 页面结构

```
index.tsx（顶层状态机：menu → 子视图）
  ├── VendorPortalShell（可点击切换 FINANCE 三个子菜单）
  │
  ├── [Unbilled Waybills]
  │     ├── UnbilledWaybillsList（双轨制入口）
  │     │     ├── Path A · Upload Own Data
  │     │     │     ├── Download Template 按钮
  │     │     │     └── Sync from Sheet 按钮（模拟上传 → 跳转 CreateStatementForm，mode='upload'）
  │     │     └── Path B · Use System Prices
  │     │           └── 复选框勾选运单 → Create Statement（mode='system-price'）
  │     └── CreateStatementForm（mode: 'upload' | 'system-price' | 'edit'）
  │           ├── 顶部 mode 标签（Path A Upload / Path B System Price）
  │           ├── Section 1: Invoice（非必填，可选添加）
  │           │     ├── + Add Invoice → AddInvoiceDialog
  │           │     │     ├── Attachment 上传（触发 OCR 自动识别）
  │           │     │     ├── Invoice No.（必填，提交时查重）
  │           │     │     ├── Invoice Amount（必填，多币种）
  │           │     │     └── Invoice Date（必填）
  │           │     └── Invoice Amount ≠ Total 时展示 Warning（可继续提交）
  │           ├── Section 2: Billing Details（Tab 结构）
  │           │     ├── Waybill List Tab：每行输入 Basic / Additional / Exception / Reimbursement
  │           │     └── Claim Tickets Tab：仅展示 For Deduction 工单，Add 后从总额扣除
  │           ├── Section 3: Tax Settings（VAT 税率 + WHT 税率选择器）
  │           └── Summary Hero：逐项金额分解（Basic/Additional/Exception/Reimbursement/Claim/Tax）+ Total Amount Payable
  │
  ├── [Claim Tickets]
  │     ├── ClaimTicketList（KPI + 筛选）
  │     ├── ClaimTicketDetail（只读 + Confirm / Dispute）
  │     └── DisputeClaimDialog
  │
  └── [My Statements]
        ├── StatementList（状态：Awaiting Comparison / Awaiting Re-bill / Pending Payment / Paid）
        │     └── Awaiting Re-bill 行：红底高亮 + Edit & Resubmit 按钮
        ├── StatementDetail（只读）
        │     └── Awaiting Re-bill 状态：顶部红色 TMS Reject Reason 横幅 + Edit & Resubmit 按钮
        └── CreateStatementForm（mode='edit'：顶部展示拒回原因，可修改后重新提交）
```

---

## 核心流程

```
[Unbilled Waybills]
    ├── Path A: Download Template → 填写自有价格 → Sync from Sheet
    │         → CreateStatementForm (mode='upload', 供应商价格预填)
    └── Path B: 勾选运单 → Create Statement
              → CreateStatementForm (mode='system-price', TMS合同价预填，可修改)

[CreateStatementForm]
  ① Invoice（可选）: 上传附件 → OCR自动识别 → 手动校正
  ② Waybill List Tab: 逐行输入 Basic / Additional / Exception / Reimbursement
  ③ Claim Tickets Tab: 选择 For Deduction 工单 → 自动从总额扣除
  ④ Tax: 选择 VAT / WHT 税率
  ⑤ Summary: 逐项分解 → Total Amount Payable
  ⑥ Submit → 确认弹窗（含 Invoice 金额不一致 Warning）

[My Statements]
    ↓ Awaiting Re-bill
  CreateStatementForm (mode='edit', 顶部展示 TMS Reject Reason)
  修改金额 → 重新提交
```

---

## 状态机总览

### PrePaid Application 状态（V7/V8）

| 状态 | 说明 | VP 可操作 |
|---|---|---|
| `Pending Review` | 已提交，等待 TMS FA 审核 | 仅 View |
| `Approved` | FA 已批准，HR 系统已**自动生成支付单** | 仅 View（展示 HR 支付提示） |
| `Paid` | HR 支付单状态变为 Released/Closed，自动回传 | 仅 View |
| `Rejected` | FA 拒绝，展示拒绝原因 | View + Resubmit |

> **V7 核心逻辑**：`Approved` 状态由 FA 在 TMS 端点击 Approve 触发，系统**自动调用 HR Payment 接口**生成 `Vendor Payment` 支付单。VP 端 `Approved` 状态下应展示提示："A Vendor Payment request has been automatically generated in the HR system."

### Vendor Statement 状态

| 状态 | 说明 | VP 可操作 |
|---|---|---|
| `Awaiting Comparison` | 已提交，TMS 比对中 | 仅 View |
| `Awaiting Re-bill` | TMS 拒回，需修改 | Edit & Resubmit（展示 Reject Reason） |
| `Pending Payment` | 比对通过，等待付款 | 仅 View |
| `Paid` | 已付款 | 仅 View |

---

## Unbilled Waybills 页面

### 双轨制入口（V3 新增）

| 路径 | 触发 | CreateStatementForm mode |
|---|---|---|
| **Path A · Upload Own Data** | 下载模板 → 填写自有价格 → `Sync from Sheet` | `'upload'`（供应商价格预填） |
| **Path B · Use System Prices** | 勾选运单 → `Create Statement` | `'system-price'`（TMS合同价预填，可修改） |

### 列表字段
`Waybill No. / Unloading Time / Actual Truck Type / Origin / Destination / Status`

**⚠️ 关键约束**：**绝对不展示任何金额字段**（包括 Basic Amount、Contract Cost 等）。

### 操作
- Path A 区：`↓ Download Template` + `↑ Sync from Sheet`（含同步动画，自动跳转）
- Path B 区：复选框多选 → 卡片标题右侧显示 `N Selected · Clear · Create Statement`
- 已包含在待审核对账单中的运单：`Statement Pending` tag，opacity 0.55，禁止勾选

---

## CreateStatementForm（V3 全面升级）

### Mode 说明
| mode | 来源 | 金额预填行为 |
|---|---|---|
| `'upload'` | Path A Sync from Sheet | 供应商 Sheet 价格预填（可修改） |
| `'system-price'` | Path B 勾选运单 | TMS 合同价预填（可修改） |
| `'edit'` | My Statements Awaiting Re-bill | 空行（需重新填写） |

### Section 1: Invoice（非必填 · 可添加多张）
- `+ Add Invoice` → AddInvoiceDialog（弹窗内联创建）
  - **Attachment**（必填）：拖拽上传 → 触发 OCR 自动识别（1.5s 模拟）
    - OCR 成功：自动填充 Invoice No. / Invoice Amount / Invoice Date
    - OCR 失败：提示手动填写
  - **Invoice No.**（必填）：文本输入，提交时走查重逻辑提示
  - **Invoice Amount**（必填）：数字 + 币种选择（PHP / USD / THB）
    - 实时提示：与 Waybill Subtotal 不一致时展示 Warning（非阻断）
  - **Invoice Date**（必填）：日期选择
- 列表已添加的发票：表格展示 + OCR 状态标签 + Remove 操作
- **Invoice Amount 不一致 Warning**：合计发票金额 ≠ Total Submitted Amount 时，列表顶部及提交弹窗中展示橙色警告（允许提交）

### Section 2: Billing Details（Tab）
**Waybill List Tab**
- 每行输入：`Basic Amount` / `Additional Charge` / `Exception Fee` / **`Reimbursement`**（V3 新增）
- 行尾实时计算 Subtotal
- 工具栏：`↓ Download Template` + `↑ Upload Excel`

**Claim Tickets Tab（V3 新增）**
- `+ Add Claim Ticket` → 弹窗仅展示 `deductionForVendor = 'For Deduction'` 且 `responsibleParty = 'Vendor'` 的工单
- 已添加的工单：表格展示 + Remove
- Claim 金额作为**扣减项**参与总额计算

### Section 3: Tax Settings（V3 新增）
- **VAT Rate**：0% / 7% / 12%
- **WHT Rate**：0% / 1% / 2%
- 实时展示税额预估

### Summary Hero（V3 升级）
逐项金额分解：
- Basic Amount 合计
- Additional Charge 合计
- Exception Fee 合计
- Reimbursement 合计（有数值时显示）
- Waybill Subtotal
- Claim Deductions（选择了 Claim 时显示，红色）
- VAT（设置了税率时显示，绿色）
- WHT（设置了税率时显示，红色）
- **Total Amount Payable**（最终应付金额）

### 底部操作
- `Save as Draft` + `Submit to TMS`（无强制校验，均可点击）
- 提交确认弹窗：展示完整金额汇总 + Invoice 不一致 Warning

### 编辑模式（mode='edit'，Awaiting Re-bill）
- 顶部红色 TMS Rejection Reason 横幅
- 结构同创建模式，支持修改后重新提交

---

## My Statements 列表

### 字段
`Statement No. / Total Submitted Amount / Waybills / Invoice No. / Status / Created At / Actions`

### 状态规则
- `Awaiting Comparison`：仅 View
- `Awaiting Re-bill`：红底高亮行，Actions 列展示 `View` + `Edit & Resubmit`；列表中预览拒回原因（截断）
- `Pending Payment` / `Paid`：仅 View

---

## StatementDetail（对账单详情）

- 基础信息：Statement No. / Submitted At / Invoice No. / Invoice Proof / Waybills 数 / Total Submitted Amount
- **Awaiting Re-bill** 状态：
  - 顶部红色横幅展示 TMS Rejection Reason
  - 右上角展示 `Edit & Resubmit` 橙色按钮
- Waybill Amount Details 表格（只读）：展示供应商填报的 Basic / Additional / Exception / Subtotal

---

## 数据层

| 文件 | 导出 | 说明 |
|---|---|---|
| `components/UnbilledWaybillsList.tsx` | inline mock | 7 条待出账运单（含 2 条 Statement Pending）；`SHEET_SYNC_WAYBILLS` 模拟 Path A 同步结果 |
| `components/CreateStatementForm.tsx` | `TMS_PRICES` / `UPLOAD_PRICES` | TMS 合同价（Path B）、供应商 Sheet 价格（Path A）各 5 条 mock |
| `components/StatementList.tsx` | `SAMPLE` | 4 条对账单，覆盖 4 种状态 |
| `components/StatementDetail.tsx` | `STATEMENT_DATA` | 按 Statement No. 返回详情，含运单明细 |
| `data/claimTickets.ts` | `CLAIM_TICKETS` | Claim Tickets 模块 mock；For Deduction 筛选：`deductionForVendor='For Deduction'` AND `responsibleParty='Vendor'` |

---

## 编号规则

| 类型 | 格式 | 示例 |
|---|---|---|
| Vendor Statement | `VS + YYMM + 3 位流水` | VS2604001 |
| Claim Ticket | `PH/THCT + YYMMDD + 4 位流水 + 2 位随机码` | PHCT26041501AB |

---

## 色彩与样式

- 主色 `#00b96b`（VP 品牌绿）
- Awaiting Re-bill 高亮行：`#fff1f0` 背景 + `#ffa39e` 边框（`.rebill-row`）
- Reject Reason 横幅：`#fff1f0` 背景 + `#ff4d4f` 左边框（`.alert-danger`）
- 浮动操作栏：`.floating-action-bar`（fixed bottom, white card + shadow）
- 表格内输入框：`.table-amount-input`（右对齐，focus 绿色边框）
- 上传区：`.upload-zone`（dashed 边框，hover/dragging 变绿）
- 确认弹窗：`.dialog-overlay` + `.dialog` + `.dialog-header/body/footer`

### V3 新增样式类

| 类 | 用途 |
|---|---|
| `.dual-path-banner` / `.dual-path-card` | 双轨制入口 Banner |
| `.dual-path-label` / `.dual-path-badge` | 路径标题与标签（蓝色 Path A / 绿色 Path B） |
| `.dual-path-divider` | OR 分割线 |
| `.ocr-spinner` | OCR 旋转图标动画 |
| `.summary-breakdown` / `.summary-bd-row` / `.summary-bd-subtotal` | Hero 金额逐项分解列表 |

### 状态标签对应
| 状态 | 样式类 |
|---|---|
| Awaiting Comparison | `tag-under-review`（蓝色） |
| Awaiting Re-bill | `tag-rejected`（红色） |
| Pending Payment | `tag-partial`（橙色） |
| Paid | `tag-approved`（绿色） |
| Statement Pending（运单） | `tag-settlement-pending`（灰色） |

---

## V8 变更说明

### PrePaid Application 创建（PrePaidApplicationForm）

| 变更项 | 说明 |
|---|---|
| **价格黑盒** | 运单选择列表**不展示** Basic Amount，防止系统基准价泄露 |
| **选中提示** | 只显示"N waybill(s) selected."，不显示金额汇总 |
| **动态银行账户** | 银行 Select 下方新增 `+ Add New Bank Info` 链接，弹窗填写 Bank Name / Account Number / Account Holder Name，保存后自动追加并选中 |

### PrePaid Application 列表（PrePaidApplicationList）

| 变更项 | 说明 |
|---|---|
| **金额去符号** | PrePaid Amount / VAT Amount / Total Amount 列只显示纯数字（如 `1,500.00`），不显示 PHP/THB/USD 等币种前缀 |

### PrePaid Application 详情（index.tsx detail view）

详情页改为 4 卡片模块化布局：

| 卡片 | 内容 |
|---|---|
| **Application Information** | 基础信息 grid：Application No. / Date / Status badge / Waybills / 金额（无币种符号） |
| **Associated Waybills** | 运单号 + Transport Status 表格（Delivered / In Transit / Planning / Pending，各色 badge） |
| **Submitted Proof** | 文件画廊，点击预览；无凭证时显示"No proof submitted." |
| **Payment Status** | 横向步骤条：Pending Review → Approved → Paid；Rejected 时显示红色分叉节点 |
