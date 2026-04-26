# Partial Payment 流程优化讨论纪要

> 本文档汇总了关于"供应商预付运费（Partial Payment）"流程优化的多轮讨论，包含业务背景、流程方案、规则细节，以及与 HR 系统集成的架构权衡。可作为后续 PRD 评审与原型设计的输入材料。

---

## 1. 需求背景

在东南亚跨境与本土物流业务中，供应商常要求在运输任务开始后预支部分基础运费。当前 TMS 的实现存在以下痛点：

- **操作分散**：`Paid in advance` 当前记录在单笔运单层级，但实际财务核算与支付往往是按"供应商一批运单（Batch）"集中处理。
- **风控缺失**：缺少与 HR / 财务系统支付状态的联动校验，存在超额支付或供应商不匹配的风险。
- **核销冗余**：预付款项在后期 AP Statement（供应商对账单）中重复计算，增加财务平账复杂度。

---

## 2. 优化目标

1. 从"逐单预付"转变为"批量 / 系统化预付"。
2. 引入外部系统单据校验（HR System Integration），确保支付合规。
3. 解耦预付款与对账单结算流程，简化 AP Statement 逻辑。

---

## 3. 目标流程（最终版）

> 以"预付款申请单（Partial Payment Application）"为载体，承载从业务发起到财务执行的完整闭环。

1. **创建申请**：在 `Financial Process` 菜单下新增"预付款申请"模块。
2. **关联运单**：选择供应商后，系统拉取该供应商下状态为 `Planning / Pending / In Transit` 的运单。
3. **录入数据**：填写预付金额或比例、是否含税、税额，并上传 Proof。
4. **校验逻辑**：预付总额（含税）不得超过所选运单的基础运费（Basic Amount）之和。
5. **分摊回写**：审核通过后，系统按比例将总额分摊至各运单的 `Paid in advance` 字段。
6. **系统集成**：申请单同步至 HR 系统，并从 HR 同步回支付状态（`Released` / `Closed`）。
7. **后期结算**：AP Statement 自动剔除已预付金额，仅结算余额。

---

## 4. 功能详情

### 4.1 预付款申请模块（Partial Payment Application）

- **入口**：`Financial Process → Partial Payment Application → Create Request`
- **基础信息**：
  - `Vendor Name`：必填，单选
  - `Allocation Mode`：按总额（Total Amount） / 按比例（Percentage）
  - `Prepaid Amount / Ratio`
  - `Tax Info`：是否含税（Tax-Inclusive / Exclusive）、税额
  - `Proof`：支持多文件上传
- **关联运单**：展示所选供应商的可选运单列表，显示每单的 `Basic Amount Payable`。
- **限制**：`Total Prepaid Amount ≤ Σ Waybill Basic Amount`。

### 4.2 运单层分摊逻辑（Allocation Logic）

- **反算公式**：
  - `单笔运单预付金额 = (该运单基础运费 / 关联运单总基础运费) × 申请单总预付金额`
- **回写**：分摊结果自动写入运单 Billing 模块的 `Paid in advance` 字段。
- **限额更新**：删除原 50% 的限制，调整为 `Paid in advance + Handling fee ≤ 100% 运费`。

### 4.3 差异化税率（TH / PH 本地化）

- **默认税率代入**：
  - **TH（Thailand）**：默认 `VAT 7%`、`WHT 1%`（Transportation）
  - **PH（Philippines）**：默认 `VAT 12%`、`WHT 2%`（Service）
- **人工修改**：`VAT Rate` / `WHT Rate` 允许根据实际发票手动调整。
- **计算公式**：
  - `Prepaid Amount (Net) = Base Amount × Ratio`
  - `VAT Amount = Prepaid Amount (Net) × VAT Rate`
  - `WHT Amount = Prepaid Amount (Net) × WHT Rate`
  - `Total Payable to Vendor = Prepaid Amount (Net) + VAT Amount − WHT Amount`

### 4.4 HR 系统集成

- **下行同步**：申请单提交后，自动在 HR 系统创建一条 `Payment Request`，携带 TMS `Application No.`。HR 仅需总额信息，无需运单明细。
- **上行回写**：HR 完成支付后通过 Webhook 通知 TMS：
  - `Released / Closed` → TMS 申请单置为 `Paid`，正式激活运单层 `Paid in advance` 抵扣。
  - 拒绝 → 申请单置为 `Rejected`，释放被锁定的运单，允许重新编辑或删除。
- **附件透传**：TMS 上传的 Proof 应随接口同步至 HR，便于财务直接审计。

### 4.5 异常场景：运单取消与预付转移

针对"已回写预付款且已同步 HR"的运单发生 `Cancel` 时，要求"以单换单"完成资金转移：

- **触发条件**：用户对带有 `Paid in advance` 金额的运单执行 `Cancel`。
- **强制补入**：弹窗提示 `Prepayment detected. Please associate a new waybill to transfer the prepaid amount.`，必须从待处理池选择新运单关联。
- **金额校验**：`Σ New Waybills' Basic Amount ≥ Cancelled Waybill's Basic Amount`，否则报错 `New waybill freight amount must be greater than or equal to the cancelled waybill.`
- **金额重分配**：原取消运单 `Paid in advance` 清零，按比例分摊至新关联运单，并更新 Billing 记录。

### 4.6 对账单逻辑解耦（Statement Integration）

- **AP Statement 字段调整**：
  - 删除原对账明细中的 `Paid in Advance` 字段。
  - 新增 `Previously Paid (Prepaid)` 列，仅展示用，不参与待结算项。
- **结算项计算**：`Basic Amount Payable (Remaining) = Total Basic Amount − Paid in advance`
- **状态解耦**：运单 `Settled / Closed` 状态不再依赖预付款的核销结果。

---

## 5. 业务规则总览

| 场景 | 规则 | 关键术语 |
|------|------|----------|
| 税率计算 | 允许按业务实际手动调整系统代入的税率，实时重算总支付额 | Manual VAT / WHT |
| 预付限额 | 预付总额（含税）必须在关联运单的总资产范围内 | Total prepaid incl. tax |
| 运单取消 | 严禁直接删除带预付金额的运单，须通过"以单换单"完成资金转移 | Waybill Replacement Logic |
| 差额处理 | 新补入的运单必须具备足够运费价值核销已付资金 | New amount ≥ Cancelled amount |
| 对账解耦 | 预付款项不再进入对账环节 | Deleted from AP statement |

---

## 6. 验收标准

1. **金额阻塞**：录入总金额超过所选运单基础运费总和时，系统报错并阻塞提交。
2. **分配准确性**：分摊到运单层的金额之和等于申请单总额（允许小数位舍入）。
3. **状态联动**：HR 未反馈 `Released / Closed` 前，运单层预付金额处于"待生效"状态，不可用于结算。
4. **税率测试**：TH 供应商场景下，将 VAT 手动从 7% 改为其他值，`Total Payable` 须正确重算。
5. **取消拦截**：直接取消带预付款的运单时，系统拦截并跳转至"选择补入运单"界面。
6. **金额对比**：用 $500 新单替换原运费 $800 的取消单时，弹出 `Amount mismatch` 错误。
7. **审计可追溯**：资金转移记录在 `Financial Audit Log` 中清晰标注 `Old Waybill No. → New Waybill No.`。
8. **对账剔除**：新创建的 AP Statement 及其导出表格中，不再出现 `Paid in Advance` 相关金额列。

---

## 7. 架构权衡：TMS 是否应保留申请实体？

> 背景：HR 系统已存在 `Payment Request`，是否还需要在 TMS 侧建立独立的"预付款申请实体"？

**结论：必须保留。** 该实体不是冗余，而是承载业务追踪与分摊逻辑的"抓手"。

### 7.1 不建实体的风险

- **分摊逻辑黑盒化**：HR 只记录"付给供应商 A 多少钱"，不关心分摊到哪些运单；后期对账无法回溯计算依据。
- **运单锁定缺失**：审批期间无法防止运单被重复申请预付或被错误取消。
- **业务/财务耦合**：HR 关注合规与现金流，TMS 关注运费构成与运单状态，需要"翻译器"承接双方语言。

### 7.2 双实体职责分工

| 维度 | TMS 预付款申请（Partial Payment Application） | HR 支付申请（Payment Request） |
|------|----------------------------------------------|-------------------------------|
| 核心职责 | 谁、哪些单、预付多少、怎么分 | 何时付、走哪个账户、是否合规 |
| 核心字段 | Waybill List、Allocation Ratio、Tax、Basic Amount | Bank Account、Cost Center、Payee、Budget Check |
| 数据源 | 运单基础运费（Logistics Data） | TMS 同步的总金额（Financial Data） |
| 状态流转 | Draft → Synced → Paid / Cancelled | Reviewing → Released → Closed |

### 7.3 推荐的交互模式："TMS 提单，HR 执行"

1. **TMS 发起**：勾选运单 → 生成 `Partial Payment Application`，内部完成分摊计算，状态 `Unconfirmed`。
2. **同步 HR**：调用接口在 HR 创建 `Payment Request`，仅传总额、税额、Proof。
3. **HR 回传**：支付完成后通过 Webhook 通知，TMS 申请单置 `Paid`，正式扣减运单层余额。
4. **异常处理**：HR 拒绝时，TMS 释放运单关联，允许重新编辑或删除。

### 7.4 东南亚场景特化建议

- **多对一关联**：支持"一个 TMS 申请单 → 一个 HR 支付单"，但 TMS 单可包含数百个 Waybill，减轻 HR 系统的单据压力。
- **Proof 透传**：减少 HR 财务跨系统查阅。
- **WHT 在 TMS 计算**：避免 HR 因不熟悉物流税率而重算导致差额。

---

## 8. 待确认事项

1. **二次/多次转移**：若新补入的运单后续也发生取消，是否允许二次、三次转移？是否需要在多次转移后触发人工财务审批？
2. **HR 系统能力评估**：若 HR 系统强势要求接管分摊逻辑，是否需要为 TMS 设计"轻量级镜像"的备选方案？
3. **Refresh Waybill Price 联动**：调价后，已生成预付款申请但尚未支付的运单价格刷新规则。

---

## 9. 关联资料

- `src/docs/requirement/Partial Payment 改造-Draft.md`
- `src/docs/requirement/S30 Financial Process Update.md`
- `src/docs/requirement/S34 对账单优化.md`
- `src/docs/requirement/Billing Mgmt.md`
