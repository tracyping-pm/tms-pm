# TMS Vendor Payment Application & AP Statement 规格文档（V8）

## 概述

TMS 端 **Vendor Payment Application**（支付申请中心）和 **AP Statement**（应付对账单）管理原型，兼容 V5–V8 设计。

**核心功能：**
- **Vendor Payment Application**（原 Prepaid Application，V8 改名）：统一展示 Prepaid Application 与 AP Application 两种类型，FA 审核，Approve 自动调用 HR Payment 接口
- **AP Statement**：VP 提交后自动同步（初始 `Awaiting Confirmation`），TMS 内部也可创建；Awaiting Comparison 阶段双向金额比对，确认后自动生成 AP Application

**V7 菜单变更**：`Accreditation Application` 已从 `Financial Mgmt` 删除，归口至 `Procurement Mgmt`。  
**V8 菜单变更**：`Prepaid Application` 正式更名为 `Vendor Payment Application`。

**预览地址**：`http://localhost:51720/prototypes/tms-accreditation-application-extended/`

相关方案与 PRD：
- `src/docs/prds/S44 VP Billing/VP billing V5.md` §3
- `src/docs/prds/S44 VP Billing/VP billing V6.md` §1–§2
- `src/docs/prds/S44 VP Billing/VP billing V7.md` §1–§3
- `src/docs/prds/S44 VP Billing/VP billing V8.md` §2.2
- `src/docs/prds/S33Vendor 认证材料处理.md`（既有申请审核框架）
- `src/docs/prds/S34 对账单优化.md`（Edit Billed Amount + Discrepancy Proof 底层接口）
- `src/docs/prds/S36Procurement财务.md`（Procurement PIC 数据权限）

---

## 页面结构

```
index.tsx（视图状态机）
  ├── TmsShell（TMS 全局布局：左侧菜单 + 顶部面包屑）
  ├── ApplicationList（扩展申请列表：Type 新增 Settlement/Modification）
  ├── SettlementReviewDetail（Settlement 申请审核详情：整体 Approve/Reject）
  └── ModificationReviewDetail（Modification 申请审核详情：逐行 Approve/Reject）
```

---

## 视图导航

### Prepaid Application

| 视图 state | 组件 | 触发方式 |
|-----------|------|---------|
| `list` | ApplicationList | 默认视图（Procurement Mgmt → Prepaid Application） |
| `detail` | PrepaidReviewDetail | 点击申请单查看详情、审核 |
| `create` | CreatePrepaidForm | 点击 Create New |

### AP Statement

| 视图 state | 组件 | 触发方式 |
|-----------|------|---------|
| `list` | ApStatementList | Financial Management → AP Statement |
| `detail` | ApStatementDetail | 点击对账单 ID 进入详情 / 比对视图 |

---

## Type 扩展

原有：`Vendor` / `Truck` / `Crew`
新增：
- **`Settlement`**：供应商提交的结算申请。Approve → 自动生成 Vendor Statement (Pending)；Reject → 运单释放
- **`Modification`**：供应商对运单结算项金额发起的修改申请。**逐行**Approve/Reject，全部决策完后申请进终态

Tag 样式：
- `tag-settlement`（绿底）
- `tag-modification`（橙底）
- `tag-vendor`（紫底，Vendor/Truck/Crew 共用）

---

## 关键数据

### 申请样本（ApplicationList）
| AP No. | Type | Status | Amount |
|---|---|---|---|
| ApM260416001 | Modification | Under Review | 1,900 |
| ApS260416002 | Settlement | Under Review | 42,300 |
| ApS260415008 | Settlement | Approved | 68,800 |
| ApV260414003 | Vendor | Approved | — |
| ApT260414001 | Truck | Under Review | — |
| ApM260412011 | Modification | Partially Approved | 3,400 |
| ApC260411002 | Crew | Approved | — |
| ApS260410003 | Settlement | Rejected | 21,500 |

### 状态机
- Vendor / Truck / Crew / Settlement：`Draft → Under Review → Approved / Rejected`（整体决策）
- Modification：`Draft → Under Review → Approved / Partially Approved / Rejected`（所有行决策完成后终结）

### 数据权限
沿用 S36 `Procurement PIC` 过滤规则：审核人只看到自己负责供应商的申请。

---

## Settlement 审核（SettlementReviewDetail）

### 上方黄色提示
若选中运单含未决 Discrepancy，顶部警示：
> This vendor has **N** unresolved price discrepancies on selected waybills. Consider requesting the vendor to resolve via Price Modification first.

### 决策区
- **Approve & Auto-Generate Statement**：
  - 校验运单仍在 `Awaiting Settlement`（防并发）
  - 生成 `PHVS+YYMMDD+流水` 编号，Source=`Vendor Request`，状态 Pending
  - 通知 Vendor（VP 消息中心）
- **Reject**：
  - 必填 Reject Reason（按钮 disabled 直到有内容）
  - 运单释放，Vendor 收到通知

---

## Modification 审核（ModificationReviewDetail）

### 行样式
每行以 `.review-row` 卡片形式展示，边框色随决策：
- `pending`：左边框橙
- `approved`：左边框绿 + 浅绿背景
- `rejected`：左边框红 + 浅红背景

### 行字段
Waybill / Settlement Item / TMS Amount（删除线灰）/ Vendor Amount（蓝）/ Delta（绿） + Approve/Reject 按钮 + Review Note 输入框

### 操作
- **Approve 单行**：调用 `Edit Billed Amount` 接口（S34 现成），更新运单对应结算项的金额，同步写入 Discrepancy Proof，Operation Log 记 `Modified by Application {Ap-No.}`
- **Reject 单行**：保留原 TMS 金额，填拒绝原因
- **Undo**：恢复为 pending

### 终态
所有行决策完后：
- 全部 Approved → `Approved`
- 全部 Rejected → `Rejected`
- 混合 → `Partially Approved`

底部绿色 success 条提示总结：
> All rows decided. Application status: **Partially Approved**. 2 approved line(s) will trigger Edit Billed Amount with Discrepancy Proof attached, and log "Modified by Application ApM260416001".

### 顶部 Summary
- Vendor / Submitted / Rows (approved · pending · rejected) / Approved Delta / Total Delta
- Vendor Reason（2000 字符）
- Proof 附件（点击可下载）

---

## 色彩与样式

沿用 AR Statement 绿色主题 `#00b96b`，新增类型 Tag：
- `tag-settlement` `#e6f7ef` 绿
- `tag-modification` `#fff7e6` 橙
- `tag-vendor` `#f9f0ff` 紫

差异金额：
- TMS Amount `#666` + 删除线
- Vendor Amount `#1890ff` 蓝
- Delta 正值 `#389e0d`，负值 `#cf1322`

---

## AP Statement（V6/V7/V8）

### 列表字段

| 字段 | 说明 |
|---|---|
| Statement No. | 对账单编号，点击进入详情 |
| **Source** | `Vendor Portal`（绿色）/ `Internal`（灰色）（V6 新增） |
| Vendor | 供应商名称 |
| Waybills | 运单数量 |
| Total Amount | 对账总金额 |
| Collected | 已收款金额 |
| Status | 状态（见下表） |
| Created At / By | 创建时间与创建人 |
| Action | `Compare`（待处理）/ `Details` |

### AP Statement 状态机

| 状态 | 来源 | 说明 |
|---|---|---|
| `Awaiting Confirmation` | VP 提交 | VP 对账单进入 TMS 后的初始状态（橙色高亮，提示 FA 介入）（V7） |
| `Awaiting Comparison` | VP / Internal | FA 介入进行 Match / Mismatch 比对中 |
| `Pending Payment` | 比对通过 | 等待付款 |
| `Partially Payment` | 部分付款 | — |
| `Paid` | 完全付款 | — |
| `Awaiting Rebill` | 比对不通过 | 拒回 VP 重新提单 |

### 核心 UI 要点（V7）

- 列表顶部蓝色 info 提示：VP 来源对账单以 `Awaiting Confirmation` 入场，点击进入**盲核对视图**（Match / Mismatch）
- `Awaiting Confirmation` 状态使用橙色标签，提醒 FA 这是需要介入核对的新单据
- 过滤器支持按 `Source` 和 `Status` 筛选
- KPI 卡片：Total Statements / Needs Action / Awaiting Confirmation / Awaiting Comparison / From Vendor Portal

### Vendor Payment Application 审核（V7/V8）

- **Approve 确认弹窗**：点击 Approve 必须弹出确认框，提示：
  > *Approval will automatically trigger a Payment Request in the HR system. Do you wish to proceed?*
- **Approve 动作**：调用 HR Payment 接口，自动生成类型为 `Vendor Payment` 的支付申请单（Payment Request），带入金额、币种、供应商银行账户及关联运单号
- **状态回传**：HR 支付单状态变为 `Released` 或 `Closed` → 状态自动更新为 `Paid`
- **操作按钮**（详情页顶部）：`Approve` / `Reject` / `Edit`（仅 Pending Review 状态可见）

---

## V8 变更说明

### Vendor Payment Application 列表（ApplicationList）

| 变更项 | 说明 |
|---|---|
| **菜单改名** | `Prepaid Application` → `Vendor Payment Application` |
| **新增 Application Type 字段** | `Prepaid Application`（蓝色）/ `AP Application`（粉色） |
| **数据来源融合** | 列表同时展示：① VP 提交的 Prepaid、② TMS 内部创建的 Prepaid、③ AP Statement 流转至 Pending Payment 后系统自动生成的 AP Application |
| **类型筛选** | 下拉筛选器支持按 Application Type 过滤 |

### AP Statement 详情（ApStatementDetail）—— V8 新增

#### Awaiting Comparison 比对台升级

| 变更项 | 说明 |
|---|---|
| **Variance 列** | 每行显示 `(Vendor合计) − (TMS合计)`；差值>0 红底，<0 橙底，=0 绿色 `—` |
| **Edit in Waybill** | Mismatch 行右侧出现 `Edit in Waybill` 按钮，点击弹出 toast 提示（原型模拟跳转） |
| **主操作按钮改名** | `Finalise Comparison` → `Confirm & Create Vendor Payment` |
| **成功 banner** | 全部匹配时提示："AP Application auto-generated and statement moved to Pending Payment." |

#### 新增卡片模块

| 卡片 | 说明 |
|---|---|
| **Invoice** | 表格展示 Invoice No. / Amount / Date / Status（Verified 绿色，Pending Verification 橙色） |
| **Supporting Proof** | 文件列表 + 下载链接，无凭证时显示"No proof uploaded." |
| **Operation Log** | 混合日志流：内部操作（绿色圆点）+ 供应商交互（蓝色圆点），按时间倒序；交互动作（Confirm/Reject/Matched）实时追加至顶部 |
