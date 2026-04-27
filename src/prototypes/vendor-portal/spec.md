# Vendor Portal（VP）供应商自助结算 规格文档 V2

## 概述

VP Billing V2 基于"**盲核对**"设计原则：供应商在不可见 TMS 合同金额的情况下，自行填报每张运单的账单金额，TMS 侧接收后进行比对。

**核心页面**（左侧 FINANCE 菜单）：
1. **Unbilled Waybills**（待出账运单列表）
2. **Claim Tickets**（索赔工单，供应商视角）
3. **My Statements**（我的对账单）

**设计原则**：极简提单、绝对数据隔离（不展示任何 TMS 金额）、清晰的状态指引。

**预览地址**：`http://localhost:51720/prototypes/vendor-portal/`

相关方案与 PRD：
- `src/docs/prds/S44 VP Billing/VP billing V2.md`
- `src/docs/prds/S38 Claim Ticket.md`

---

## 菜单与可点击性

| 菜单分组 | 菜单项 | 可点击 |
|---|---|---|
| MAIN | Home / Vendor Info / Trucks / Crew | 否（占位） |
| FINANCE | Accreditation Application | 否（占位） |
| FINANCE | **Unbilled Waybills** | 是 |
| FINANCE | **Claim Tickets** | 是 |
| FINANCE | **My Statements** | 是 |

---

## 页面结构

```
index.tsx（顶层状态机：menu → 子视图）
  ├── VendorPortalShell（可点击切换 FINANCE 三个子菜单）
  │
  ├── [Unbilled Waybills]
  │     ├── UnbilledWaybillsList（待出账运单，无价格字段；复选框 + 浮动 Generate Statement 操作栏）
  │     └── CreateStatementForm（对账单数据填报页）
  │           ├── 基础信息：Invoice No.（多张）+ Invoice Proof（拖拽上传，必填）
  │           ├── 运单金额明细：每行输入 Basic Amount / Additional Charge / Exception Fee
  │           ├── Download Template + Upload Excel（批量填写）
  │           └── Save as Draft + Submit to TMS（提交前二次确认弹窗）
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
        └── CreateStatementForm（编辑模式：顶部展示拒回原因，可修改后重新提交）
```

---

## 核心流程

```
[Unbilled Waybills]                         [My Statements]
运单列表（无价格）                            对账单列表
    ↓ 勾选运单 → Generate Statement               ↓
CreateStatementForm                          StatementDetail（只读）
  填写: Invoice No. + Invoice Proof（必填）        │
  填写: 每张运单的 Basic/Additional/Exception       │ Awaiting Re-bill
    ↓ Submit to TMS                              ↓
  确认弹窗 → 提交                           CreateStatementForm（编辑模式）
    ↓                                        展示 TMS Reject Reason
  跳转到 My Statements 列表                   修改金额 → 重新提交
```

---

## 状态机总览

### Vendor Statement 状态

| 状态 | 说明 | VP 可操作 |
|---|---|---|
| `Awaiting Comparison` | 已提交，TMS 比对中 | 仅 View |
| `Awaiting Re-bill` | TMS 拒回，需修改 | Edit & Resubmit（展示 Reject Reason） |
| `Pending Payment` | 比对通过，等待付款 | 仅 View |
| `Paid` | 已付款 | 仅 View |

---

## Unbilled Waybills 页面

### 字段
`Waybill No. / Unloading Time / Actual Truck Type / Origin / Destination / Status`

**⚠️ 关键约束**：**绝对不展示任何金额字段**（包括 Basic Amount、Contract Cost 等）。

### 操作
- 复选框多选（跨页勾选）
- 已包含在待审核对账单中的运单：显示 `Statement Pending` tag，opacity 0.55，禁止勾选
- 选中后底部浮动操作栏：`N Waybills Selected` + `Clear Selection` + `Generate Statement`

---

## CreateStatementForm（对账单数据填报页）

### Section 1：基础信息
- **Invoice No.**（必填）：支持多个（`+ Add Another Invoice`）
- **Invoice Proof**（必填）：拖拽上传组件；上传后显示文件名 + Remove

### Section 2：运单金额明细
- 展示所选运单列表（只读路由信息）
- 每行输入框：`Basic Amount` / `Additional Charge` / `Exception Fee`（数字输入，右对齐）
- 行尾实时计算 `Subtotal`
- 工具栏：`↓ Download Template` + `↑ Upload Excel`

### 底部操作栏（Hero 卡片）
- 显示 `Total Submitted Amount`（供应商自填金额之和）
- `Save as Draft`（草稿保存）
- `Submit to TMS`（需 Invoice No. 已填 + Invoice Proof 已上传才可点击）
  - 点击后弹出确认弹窗："提交后将无法修改，是否确认？"

### 编辑模式（Awaiting Re-bill 编辑）
- 顶部展示红色 TMS Rejection Reason 横幅
- 内容结构与创建模式相同，支持修改后重新提交

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
| `components/UnbilledWaybillsList.tsx` | inline mock | 7 条待出账运单（含 2 条 Statement Pending） |
| `components/CreateStatementForm.tsx` | inline mock lookup | 按 waybill no. 返回路由信息 |
| `components/StatementList.tsx` | `SAMPLE` | 4 条对账单，覆盖 4 种状态 |
| `components/StatementDetail.tsx` | `STATEMENT_DATA` | 按 Statement No. 返回详情，含运单明细 |
| `data/claimTickets.ts` | `CLAIM_TICKETS` | Claim Tickets 模块 mock |

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

### 状态标签对应
| 状态 | 样式类 |
|---|---|
| Awaiting Comparison | `tag-under-review`（蓝色） |
| Awaiting Re-bill | `tag-rejected`（红色） |
| Pending Payment | `tag-partial`（橙色） |
| Paid | `tag-approved`（绿色） |
| Statement Pending（运单） | `tag-settlement-pending`（灰色） |
