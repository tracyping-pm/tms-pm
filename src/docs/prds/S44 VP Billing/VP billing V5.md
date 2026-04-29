

---

# 📄 供应商自助预付申请流程 (PrePaid Application Flow)

## 1. 核心业务逻辑 (Core Business Logic)
将预付款（Paid in Advance）流程起点前置至 Vendor Portal (VP)。供应商可针对**尚未完成运输**的运单，主动发起预付款申请，并附带税务与收款信息。TMS 端集中管理审核，并在审核通过后打通后续支付链路。

---

## 2. Vendor Portal (VP) 端交互设计

### 2.1 菜单与列表视图
* **新增菜单**：在财务/结算模块下新增 `PrePaid Application` 菜单。
* **列表展示**：展示供应商自己提交的所有预付申请记录，包含字段：`Application No.`、`Application Date`、`Total Amount`、`Status` (如 Pending Review, Approved, Rejected, Paid)。

### 2.2 创建预付申请交互 (Create PrePaid Application)
采用分步引导或区块化表单的形式，确保信息填写完整：

* **区块 1：选择运单 (Select Waybills)**
    * 提供运单选择弹窗或下拉列表。
    * **数据范围限制**：仅允许选择**未完成运输**的运单（如状态为 `Planning`, `Pending`, `In Transit` 的运单）。
* **区块 2：金额与税务填写 (Amount & Tax Information)**
    * `PrePaid Amount`：输入申请提前支付的金额。
    * `VAT Rate` / `WHT Rate`：提供输入框或下拉选项，允许供应商填写对应的增值税与预扣税比例。
    * **自动计算 (Auto-Calculation)**：系统根据输入的 PrePaid Amount 和税率，实时计算并展示对应的 `Tax Amount` 和最终的 `Total Amount`。
* **区块 3：收款信息 (Payee Information)**
    * 下拉选择该供应商已在系统中维护的收款账户（Bank Name, Bank Account Number 等）。
* **区块 4：佐证材料 (Proof & Remark)**
    * `Proof`：提供附件上传入口（支持图片、PDF 等），用于上传预付申请所需的凭证或业务单据。
    * `Remark`：文本输入框，供供应商补充说明。
* **提交校验**：点击 `Submit` 时，系统前端可进行初步的预付比例拦截（如校验申请金额是否符合业务规则上限）。

---

## 3. TMS 端交互设计

### 3.1 预付申请管理视图 (Vendor PrePaid Application)
* **新增菜单**：在 AR&AP Mgmt 或对应财务模块下，新增 `Vendor PrePaid Application` 菜单。
* **统一列表池 (Unified List)**：
    * 展示所有的预付申请，包括 **VP 端提交**的以及 **TMS 端内部创建**的申请。
    * **新增字段**：增加 `Source` 字段区分来源（VP / TMS Internal），并展示 `Vendor Name`、`Associated Waybill`、`Total Amount`、`Status` 等关键信息。

### 3.2 审核与状态流转 (Review & Workflow)
* **详情查看**：FA 在 TMS 端点击进入申请详情，可查看供应商填写的所有金额、税率、收款账户及 Proof 附件。
* **系统强校验提示**：在详情页，系统底层需自动校验并提示该运单的预付额度健康度（例如触发规则：`Paid in advance + Handling fee ≤ 100% 基础运费`），辅助 FA 决策。
* **操作交互**：
    * **Approve (通过)**：确认无误后点击通过，状态流转至待支付环节。
    * **Reject (拒回)**：若金额或资料有误，点击 Reject，**必须填写 Reject Reason**。VP 端该申请状态变为 Rejected，并展示拒回原因，供应商可修改后重新提交。
    * **Edit (内部修正)**：对于微小的金额或税率误差，允许 FA 在 TMS 端直接修改（保留 Operation Log 记录）后确认。

---

TMS 端在对这个 `PrePaid Application` 审核通过（Approve）后，直接对接 HR 的 Payment 模块自动生成支付申请单