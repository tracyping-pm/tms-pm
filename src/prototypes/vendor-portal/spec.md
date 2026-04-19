# Vendor Portal（VP）供应商自助结算 规格文档

## 概述

将供应商自助结算能力统一到一个 VP 入口下，由左侧 FINANCE 菜单切换：
1. **Price Reconciliation**（价格核对）
2. **Claim Tickets**（索赔工单，供应商视角）
3. **Settlement Application**（结算申请）
4. **My Statements**（我的对账单）

业务语义由"运单金额核对"升级为 **"运单 + Claim + Invoice 三实体协同"**，与 TMS 侧 S34（Statement 编辑）/ S38（Claim Ticket）对齐。

**预览地址**：`http://localhost:51720/prototypes/vendor-portal/`

相关方案与 PRD：
- `/Users/tracy/.claude/plans/unified-cuddling-hare.md`（主方案）
- `/Users/tracy/.claude/plans/ticklish-purring-stream.md`（7 点修改）
- `src/docs/prds/Vendor Statement.md`
- `src/docs/prds/S33Vendor 认证材料处理.md`
- `src/docs/prds/S34 对账单优化.md`
- `src/docs/prds/S38 Claim Ticket.md`

---

## 菜单与可点击性

| 菜单分组 | 菜单项 | 可点击 |
|---|---|---|
| MAIN | Home / Vendor Info / Trucks / Crew | 否（占位） |
| FINANCE | Accreditation Application | 否（占位） |
| FINANCE | **Price Reconciliation** | 是 |
| FINANCE | **Claim Tickets** | 是 |
| FINANCE | **Settlement Application** | 是 |
| FINANCE | **My Statements** | 是 |

---

## 页面结构

```
index.tsx（顶层状态机：menu → 子视图）
  ├── VendorPortalShell（可点击切换 FINANCE 四个子菜单）
  │
  ├── [Price Reconciliation]
  │     ├── WaybillReconciliationList（待核对运单；已发起结算运单置灰）
  │     ├── ImportSheetDialog
  │     ├── DiffView（差异视图 · 批量 Match / Raise Modification）
  │     ├── RaiseModificationDialog
  │     ├── ModificationList
  │     └── ModificationDetail
  │
  ├── [Claim Tickets]
  │     ├── ClaimTicketList（KPI + 筛选）
  │     ├── ClaimTicketDetail（只读 + Confirm / Dispute）
  │     └── DisputeClaimDialog
  │
  ├── [Settlement Application]
  │     ├── SettlementList
  │     ├── SettlementCreate
  │     │     ├── StepTimeline（装饰性步骤条）
  │     │     ├── Sub-tabs: Waybills | Claim Tickets
  │     │     ├── AddClaimTicketDialog
  │     │     ├── AddInvoiceDialog
  │     │     └── 底部三列统计栏（Waybill / Claim / Others）+ 绿色 Hero 总额
  │     └── SettlementDetail
  │           ├── Sub-tabs: Waybill Breakdown | Claim Tickets | Invoice
  │           └── Waybill 行展开：Route / Truck / POD / Billing (Original→Current)
  │
  └── [My Statements]
        ├── StatementList
        ├── StatementDetail
        │     ├── Sub-tabs: Waybill Breakdown | Claim Tickets | Invoice | Payment History
        │     └── Waybill 行展开（同 SettlementDetail）
        ├── ConfirmDialog（Invoice 列表 + 多张支持；无 Invoice 无法确认）
        └── RejectDialog
```

---

## 三大流程串联

```
[价格核对]                                      [结算申请]                        [对账确认]
Waybill List                                    Settlement List                   Statement List
    ↓                                               ↓                                 ↓
Diff View ──(Create Settlement from Matched)──> Settlement Create                 Statement Detail
    │                                               ↓                             ├─ Vendor Confirm (必录 Invoice) → Pending Payable
    │                                          Submit → Under Review              └─ Reject → Pending
    ↓
Raise Modification
    ↓
Modification List / Detail
```

---

## 状态机总览

### Modification Request（价格修改申请）
`Draft → Under Review → Approved / Partially Approved / Rejected`
- TMS 侧**逐行**审核，更新运单 Billing Amount
- Approved 后，运单 Billing Line 显示 **Original → Current** 黄底对比（展开 Waybill 查看）

### Settlement Application（结算申请）
`Draft → Under Review → Approved / Rejected`
- Approve → 自动生成 Vendor Statement（Source = Vendor Request）
- 运单一旦纳入 Settlement，在 Price Reconciliation 列表中标记 **Settlement Pending** 并置灰，不可重复发起

### Vendor Statement（对账单）
`Pending → Awaiting Confirmation → Pending Payable → Partially Paid / Paid`
- VP 侧可操作：Awaiting Confirmation 状态下 Vendor Confirm / Reject
- Vendor Confirm 需至少 1 张 Invoice + Confirm Proof 文件

### Claim Ticket（VP 可见状态子集）
`Pending Vendor Confirm → Vendor Disputed / For Deduction → Closed`
- VP 可见：Pending Vendor Confirm / Vendor Disputed / For Deduction / Claim team review / Closed
- VP 可操作：**Pending Vendor Confirm** 状态下发起 Dispute（需附理由 + 证据文件）

---

## 跨模块导航：从 Diff View 到 Settlement Create

Price Reconciliation → Diff View → 勾选若干 **Matched** 行 → 点击 **Create Settlement from Selected (N)**：

1. `index.tsx` 将所选运单号写入 `settledWaybills`（映射到预生成的 `ApS...` 结算单号）
2. 将运单号写入 `prefillWaybills` 并跳转 `menu = 'settlement'`、`settlementView = 'create'`
3. SettlementCreate 收到 `prefillWaybills` prop，自动在 Waybills 子 Tab 中预选这些行
4. 返回 Price Reconciliation 时，这些运单以 **Settlement Pending** tag 置灰展示（opacity 0.55 + 不可勾选）
5. SettlementCreate 提交或取消时清空 `prefillWaybills`

**模式互斥**：DiffView 中首行选中后锁定 Settlement / Modification 二选一模式，跨模式选择给出视觉警告（禁止同一申请混入 Matched 与 Discrepancy 行）。

---

## Invoice 实体

- **Invoice 由供应商录入**，无系统编号（使用供应商自填的 `invoiceNo`）
- **1:N 关系**：一个 Settlement / Statement 可关联多张 Invoice（不同税率拆单、分批开票）
- **录入时机**：
  - **可选**：SettlementCreate → Invoice Section → `+ Add Invoice`（走 `AddInvoiceDialog`）
  - **必录**：ConfirmDialog（Statement 状态为 Awaiting Confirmation 时）— 若发票列表为空则 `Confirm & Submit` 按钮 disabled
- **查看时机**：SettlementDetail / StatementDetail 的 Invoice Tab **只读**展示

### Invoice 字段
`invoiceNo / invoiceDate / amount / currency / documentFileName / remark / linkedSettlementApNo / linkedStatementNo`

---

## Claim Ticket（VP 视角）

### 列表字段
`Ticket No. / Claim Type (L1+L2) / Claim Amount / Claimant / Responsible Party / Related Waybill / Deduction for Vendor / Status / Creation Time`

### 筛选项
- Keyword（Ticket No. / Claim Type L2）
- Claim Type L1（External / Internal / All）
- Status（多选 chip，默认隐藏 Closed / Canceled）
- Deduction for Vendor（Deducted / For Deduction / Not Linked AP / Written Off / All）
- Creation Time

### KPI 行
Total / Pending Vendor Confirm / Vendor Disputed / For Deduction

### 详情页操作
- **Pending Vendor Confirm** 状态：展示 `[Confirm]` + `[Dispute]` 双按钮
- Dispute 走 `DisputeClaimDialog`：必填 Reason（≤2000 字符）+ 至少 1 份 Discrepancy Proof 文件
- 提交后状态预期变为 Vendor Disputed（原型中仅关闭弹窗）

### Claim Ticket 与 Settlement/Statement 的关系
- SettlementCreate 的 Claim Tickets Tab 可选择 **未关联** 且非 Closed/Canceled 的 ticket 加入申请
- SettlementDetail / StatementDetail 的 Claim Tickets Tab 展示已关联的 ticket 列表，行可跳转到 ClaimTicketDetail（通过 `onOpenClaimTicket` prop）
- Claim 金额作为 **扣减项** 参与总额计算：`Total = Σ Waybill − Σ Claim [+ Others]`

---

## Waybill Breakdown 展开交互

SettlementDetail 与 StatementDetail 的 Waybill Breakdown Tab 中，点击行头的 `▸ / ▾` 展开：

**展开内容**：
- 基础信息：Position / Delivery / Unloading Time / POD
- Billing Breakdown 表：`Billing Item | Original | Current | Edited (by / at / reason)`
- 若某 Billing Line `editedBy === 'TMS Ops'`，该行底色为 **黄底** (`.amount-diff-row`)，Current 金额以橙色加粗并附 `(+/− delta)` 小字
- 若存在 TMS 编辑，行头 Waybill No. 旁展示 **TMS Edited** 橙底 tag
- 可选 notes 以黄底提示条展示

**数据来源**：`data/waybillDetails.ts` 的 `WAYBILL_DETAILS`

---

## 数据层

| 文件 | 导出 | 说明 |
|---|---|---|
| `data/claimTickets.ts` | `ClaimTicket` / `CLAIM_TICKETS` | 6 条覆盖各状态的 mock |
| `data/invoices.ts` | `Invoice` / `INVOICES` | 3 条（关联 settlement / statement） |
| `data/waybillDetails.ts` | `WaybillDetail` / `BillingLine` / `WAYBILL_DETAILS` | 6 条；WB2604002 含 TMS Ops 编辑对比 |

---

## 编号规则

| 类型 | 格式 | 示例 |
|---|---|---|
| Price Modification | `ApM + YYMMDD + 3 位随机码` | ApM260416001 |
| Settlement | `ApS + YYMMDD + 3 位随机码` | ApS260416002 |
| Vendor Statement | `PH/THVS + YYMMDD + 2 位流水` | PHVS26041602 |
| Claim Ticket | `PH/THCT + YYMMDD + 4 位流水 + 2 位随机码` | PHCT26041501AB |
| Invoice | 由供应商录入，无系统编号 | INV-2026-00157 |

---

## 色彩与样式

- 主色 `#00b96b`（VP 品牌绿）
- 链接 / Vendor Amount `#1890ff`
- Delta 正 `#389e0d`、负 `#cf1322`
- TMS Amount `#666` + 删除线
- TMS 编辑对比 `#fff7e6 / #fffbe6` 黄底 + `#d46b08` 橙字
- 状态标签：`.tag-matched / .tag-discrepancy-pending / .tag-discrepancy-resolved / .tag-draft / .tag-under-review / .tag-approved / .tag-rejected / .tag-partial / .tag-settlement-pending`

### 新增样式类

| 类 | 用途 |
|---|---|
| `.step-timeline` / `.step-timeline-node` / `.step-timeline-dot.{done,current,todo}` / `.step-timeline-line` | SettlementCreate 顶部装饰性步骤条 |
| `.summary-hero-card` / `.summary-hero-title` / `.summary-hero-value` | SettlementCreate 底部绿色 Hero 总额 |
| `.summary-grid-3col` / `.summary-col` | 三列统计栏 |
| `.waybill-expand-row` | 展开行底色与左侧蓝边 |
| `.amount-diff-row` / `.amount-diff` | TMS 编辑过的 Billing Line 黄底 |
| `.tag-settlement-pending` | Price Reconciliation 已发起结算行 |
| `.detail-grid` / `.detail-item` / `.detail-label` / `.detail-value` | ClaimTicketDetail 信息面板 |
