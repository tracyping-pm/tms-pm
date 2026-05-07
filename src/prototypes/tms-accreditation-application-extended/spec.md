# TMS Vendor Payment Application & AP Statement 规格文档（V10）

## 概述

TMS 端 **Vendor Payment Application**（支付申请中心）和 **AP Statement**（应付对账单）管理原型，兼容 V5–V10 设计。

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
- `src/docs/prds/S44 VP Billing/VP billing V10.md`（V10 AP Statement 详情页 8 状态规格）
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

## AP Statement（V10）

参考 PRD：`src/docs/prds/S44 VP Billing/VP billing V10.md`

### 列表字段

| 字段 | 说明 |
|---|---|
| Statement No. | 对账单编号，点击进入详情 |
| **Source** | `Vendor Portal`（绿色）/ `Internal`（灰色） |
| Vendor | 供应商名称 |
| Waybills | 运单数量 |
| Total Amount | 对账总金额 |
| Collected | 已收款金额 |
| Status | 状态（见下表，8 种） |
| Created At / By | 创建时间与创建人 |
| Action | `Compare`（Awaiting Comparison）/ `Edit`（Payment Preparation）/ `Details`（其他） |

### AP Statement 状态机（V10 — 8 状态）

| # | 状态 | 场景 | 可用操作 |
|---|---|---|---|
| 1 | `Payment Preparation` | FA 内部创建草稿 | 添加/移除 Waybill & Ticket、Cancel、Confirm & Create VP |
| 2 | `Awaiting Comparison` | VP 提交，TMS 双向对账 | Reject、Edit Waybill Amount、Confirm & Create VP |
| 3 | `Awaiting Re-bill` | 驳回后等待 VP 修改 | 仅 Cancel |
| 4 | `Pending Payment` | 已推送 HR 系统 | Void Invoice、Add AP Application、Write Off、Export |
| 5 | `Partially Payment` | 部分已支付 | Write Off、Add AP Application |
| 6 | `Paid` | 全额结清（终态） | 纯只读，仅 Export |
| 7 | `Written Off` | 核销（终态） | 纯只读，仅 Export |
| 8 | `Canceled` | 作废（终态） | 纯只读，仅 Export |

### 匹配规则
- `Vendor Amount == TMS Amount` → Matched
- `Vendor Amount < TMS Amount`（供应商让利）→ Matched
- `Vendor Amount > TMS Amount` → Mismatched

### 终态展示
- **Paid**：绿色成功横幅，完整打款时间线与凭证
- **Written Off**：橙色横幅，显示核销原因、操作人、核销差额
- **Canceled**：红色横幅，显示作废原因，底层运单和 Ticket 被释放

### 核心 UI 要点（V10）

- 列表顶部蓝色 info 提示：VP 来源对账单以 `Awaiting Comparison` 入场进行盲核对；内部草稿以 `Payment Preparation` 入场
- 过滤器支持按 `Source` 和 `Status` 筛选
- KPI 卡片：Total Statements / Needs Action / Payment Preparation / Awaiting Comparison / From Vendor Portal
- 终态（Paid / Written Off / Canceled）数据全部置灰只读

### Confirm & Create Vendor Payment 弹窗
- 展示供应商、币种、运单数、Ticket 数
- **支付金额可编辑**，默认为计算总额
- 确认后创建 AP Application 并推送 HR 系统

### Write Off 弹窗
- 显示总金额、已付金额、待核销金额
- 必填核销原因

### Cancel 弹窗
- 提示关联运单和 Ticket 将被释放
- 必填作废原因

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

---

## V9 变更说明

### AP Statement 全流程闭环（ApStatementDetail）

#### 比对结果：4 态自动计算（替换手动 toggle）

| 比对结果 Tag | 触发条件 | 视觉 |
|---|---|---|
| `Matched` | Vendor 合计 = TMS 合计 | 绿色 |
| `Matched (Vendor Discount)` | Vendor 合计 < TMS 合计（供应商打折）| 绿色 + 折扣金额提示 |
| `Mismatched` | Vendor 合计 > TMS 合计（强拦截）| 红色 |
| `Missed` | TMS 无对应结算项（tmsBasic=0 且 tmsAdditional=0，但 VP 有金额）| 橙黄色 |

- 行背景色：Mismatched→红底，Missed→黄底，Matched(Discount)→浅绿底
- `Edit in Waybill` 按钮：Mismatched 或 Missed 行可见，点击弹出 toast（原型模拟穿透跳转）

#### Refresh 按钮
- FA 修改运单金额后返回，点击 `↻ Refresh` 重新触发比对引擎（原型模拟 1 秒加载）
- 刷新完成后显示 toast："Comparison refreshed."

#### Confirm & Create Vendor Payment 前置校验
- 仅当所有行结果均为 `Matched` 或 `Matched (Vendor Discount)` 时按钮可点击
- 否则显示红色提示："Resolve all Mismatched / Missed items first."

#### Amount Summary 新增 Net Payable
- `Net Payable` = Vendor Total − Deductions（当前无扣款时等于 Vendor Total）

### Vendor Payment Application 列表（ApplicationList）—— V9 新增

| 变更项 | 说明 |
|---|---|
| **新状态** | `Sync Failed`（粉红色）：API 推送 HR 失败，可 Retry；`Payment Rejected`（深红色）：HR 财务驳回 |
| **Associated AP Stmt.** | AP Application 类型行显示关联的 AP Statement 单号（蓝色链接） |
| **Retry / Review 操作** | Sync Failed → Retry 按钮；Payment Rejected → Review 按钮 |

### VP My Statements（StatementList）—— V9 对外状态简化

| 内部状态 | VP 对外展示 | 说明 |
|---|---|---|
| `Awaiting Comparison` | **Processing** | 隐藏内部比对细节 |
| `Pending Payment` | **Processing** | 隐藏支付流程细节 |
| `Awaiting Re-bill` | **Action Required** | 提示供应商需操作 |
| `Paid` | **Paid** | 不变 |

- **Release Proof**：`Paid` 状态行新增 Release Proof 列，展示打款凭证文件链接

---

## V10 变更说明

### AP Statement 操作栏进入详情页调整

#### Statement Info 字段与布局

详情页 `Statement Info` 固定展示 9 个字段，采用 3 列网格对齐：

| 字段 | 说明 |
|---|---|
| Statement NO | 对账单编号 |
| Statement Status | 当前 AP Statement 状态 |
| Statement Tax Mark | 税标识，原型默认 `VAT-ex` |
| Total Amount Payable | 本次应付总额 |
| Total Invoice Amount | 已上传 Invoice 金额合计 |
| Paid Amount | 已支付金额，部分支付状态读取已支付申请合计 |
| Vendor | 供应商 |
| Create date | 创建日期 |
| Create By | 创建人 |

#### Amount Summary

按用户示意图改为财务摘要面板，并升级为双口径对比：
- 顶部大行展示 `Total Amount Payable`，同时显示 `TMS / VP / Diff`
- 下方三列分别为 `Waybill Contract Cost`、`Claim`、`Others`，每行均显示 `TMS / VP / Diff`
- `Waybill Contract Cost` 内展示 `Basic Amount`、`Additional Charge`、`Exception Fee`
- `Claim` 内展示 `KPI Claim`
- `Others` 内展示 `VAT`、`WHT`
- 本页面所有价格字段均不显示币种前缀，仅展示数值

#### Waybill List (Vendor-Submitted)

该区块改为标签页：
- `Waybill List ({count})`
- `Claim Ticket ({count})`

Waybill 主表按供应商提交口径展示，每行支持点击展开/收起：

| 主表字段 | 说明 |
|---|---|
| Waybill | 运单号，带展开箭头 |
| TMS Amount | TMS 运单金额合计 |
| VP Amount | Vendor Portal 提交金额合计 |
| Status | 金额一致展示 `Match`，不一致展示 `Discrepancy` |
| Discrepancy | `Match` 时为 `0.00`，不一致时展示 VP − TMS 的差异额 |
| Position Time | 车辆到位时间 |
| Unloading Time | 卸货时间 |
| Truck Type | 车型 |
| Origin | 起点 |
| Destination | 终点 |
| Actions | `Status=Discrepancy` 时展示 `Edit Price`，点击后固定跳转 `https://rc.gaia.inteluck.com/project/waybill/detail/2530248` 新页；`Match` 时为空 |

展开区展示 Waybill 项目金额对比：
- `Basic Amount`
- `Additional Charge`
- `Exception Fee`

每个项目均展示 `TMS Amount`、`VP Amount`、`Difference`，用于快速定位具体差异项。

#### Claim Ticket 标签页

Claim Ticket 表格按用户示意图展示：

| 字段 | 说明 |
|---|---|
| Ticket No. | Claim Ticket 编号 |
| Claim Type | Claim 类型，如 Damage / KPI Claim |
| Customer | 客户 + 供应商信息 |
| Claim Amount | Claim 金额，红色强调 |
| Claim Reason | Claim 原因 |
| Status | 状态标签，Approved 使用绿色胶囊标签 |
| Created Date | 创建日期 |
| Created By | 创建人 |
| Actions | 删除图标按钮，原型中点击后移除当前行 |
