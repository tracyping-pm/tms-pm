# Vendor Portal（VP）供应商自助结算 规格文档

## 概述

将供应商自助结算三大能力统一到一个 VP 入口下，由左侧 FINANCE 菜单切换：
1. **Price Reconciliation**（价格核对）
2. **Settlement Application**（结算申请）
3. **My Statements**（我的对账单）

**预览地址**：`http://localhost:51720/prototypes/vendor-portal/`

相关方案与 PRD：
- `/Users/tracy/.claude/plans/unified-cuddling-hare.md`（主方案）
- `src/docs/prds/Vendor Statement.md`
- `src/docs/prds/S33Vendor 认证材料处理.md`
- `src/docs/prds/S34 对账单优化.md`
- `src/docs/prds/财务流程.md`

---

## 菜单与可点击性

| 菜单分组 | 菜单项 | 可点击 |
|---|---|---|
| MAIN | Home / Vendor Info / Trucks / Crew | 否（占位） |
| FINANCE | Accreditation Application | 否（占位） |
| FINANCE | **Price Reconciliation** | 是 |
| FINANCE | **Settlement Application** | 是 |
| FINANCE | **My Statements** | 是 |

---

## 页面结构

```
index.tsx（顶层状态机：menu → 子视图）
  ├── VendorPortalShell（可点击切换 FINANCE 三个子菜单）
  │
  ├── [Price Reconciliation]
  │     ├── WaybillReconciliationList（待核对运单）
  │     ├── ImportSheetDialog（Sheet 导入弹窗）
  │     ├── DiffView（差异视图）
  │     ├── RaiseModificationDialog（发起修改申请）
  │     ├── ModificationList（修改申请列表）
  │     └── ModificationDetail（申请详情）
  │
  ├── [Settlement Application]
  │     ├── SettlementList（结算申请列表）
  │     ├── SettlementCreate（新建申请）
  │     └── SettlementDetail（申请详情）
  │
  └── [My Statements]
        ├── StatementList（对账单列表）
        ├── StatementDetail（对账单详情）
        ├── ConfirmDialog（Vendor Confirm 弹窗）
        └── RejectDialog（Reject 弹窗）
```

---

## 三大流程串联

```
[价格核对]                [结算申请]                [对账确认]
Waybill List              Settlement List           Statement List
    ↓                          ↓                         ↓
Diff View                 Settlement Create          Statement Detail
    ↓                          ↓                    ├─ Vendor Confirm → Pending Payable
Raise Modification        Submit → Under Review     └─ Reject → Pending
    ↓
Modification List
    ↓
Modification Detail
```

---

## 状态机总览

### Modification Request（价格修改申请）
`Draft → Under Review → Approved / Partially Approved / Rejected`
- TMS 侧**逐行**审核，更新运单 Billing Amount

### Settlement Application（结算申请）
`Draft → Under Review → Approved / Rejected`
- Approve → 自动生成 Vendor Statement（Source = Vendor Request）

### Vendor Statement（对账单）
`Pending → Awaiting Confirmation → Pending Payable → Partially Paid / Paid`
- VP 侧可操作：Awaiting Confirmation 状态下 Vendor Confirm / Reject

---

## 编号规则

| 类型 | 格式 | 示例 |
|---|---|---|
| Price Modification | `ApM + YYMMDD + 3 位随机码` | ApM260416001 |
| Settlement | `ApS + YYMMDD + 3 位随机码` | ApS260416002 |
| Vendor Statement | `PH/THVS + YYMMDD + 2 位流水` | PHVS26041602 |

---

## 色彩与样式

- 主色 `#00b96b`（VP 品牌绿）
- 链接 / Vendor Amount `#1890ff`
- Delta 正 `#389e0d`、负 `#cf1322`
- TMS Amount `#666` + 删除线
- 状态标签 `.tag-matched / .tag-discrepancy-pending / .tag-discrepancy-resolved / .tag-draft / .tag-under-review / .tag-approved / .tag-rejected / .tag-partial`
