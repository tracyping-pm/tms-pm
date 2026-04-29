

---

### 🚀 供应商自助结算与预付流程优化方案 (最终整合版)

#### 1. 供应商预付申请 (Vendor PrePaid Application) 闭环
为提升资金周转效率，预付流程将实现从申请到支付的完全自动化：
* [cite_start]**自动化生成支付单**：当 FA 在 TMS 端的 `Vendor PrePaid Application` 模块点击 **Approve (通过)** 后，系统将**直接调用 HR Payment 接口**，自动生成一笔类型为 `Vendor Payment` 的支付申请单（Payment Request） [cite: 237, 248]。
* [cite_start]**数据同步**：自动生成的支付单将带入预付申请中的金额、币种、供应商银行账户及关联运单号 [cite: 244, 265]。
* [cite_start]**状态回传**：一旦 HR 系统中的支付单状态变为 `Released` 或 `Closed`，TMS 端的 `PrePaid Application` 状态将自动更新为 **Paid (已支付)** [cite: 310]。

#### 2. TMS 端 AP Statement 交互优化
TMS 端将作为所有结算单据的集中处理中心：
* [cite_start]**对账单统一展示**：在 `AP Statement` 列表中，除了 TMS 内部自建的对账单，将新增展示来自 **Vendor Portal (VP)** 提交的对账单 [cite: 224]。
* **初始状态定义**：所有由供应商从 VP 端提交的对账单，进入 TMS 后的初始状态统一设定为 **Awaiting Confirmation (待确认)**。
* [cite_start]**盲核对入口**：FA 点击该状态的对账单进入详情页，即可触发“系统金额 vs 供应商金额”的对比视图，进行后续的 `Match / Mismatch` 处理 [cite: 225]。

#### 3. 菜单结构调整 (Menu Refinement)
为了优化财务模块的专注度，减少功能冗余：
* **删除菜单**：从原型设计的 `Financial Mgmt` (财务管理) 一级菜单下，正式**删除 `Accreditation Application` (认证申请) 子菜单**。
* [cite_start]**逻辑归属**：所有供应商/车辆/人员的认证申请将统一归口至 `Procurement Mgmt` (采购管理) 下的 `Application` 模块进行管理，避免财务人员与采购人员的功能重叠 [cite: 199, 218]。

---

### 🎨 UI/UX 交互设计要点说明

#### 1. TMS - AP Statement 列表 (AP Statement List)
* [cite_start]**新增字段**：`Source` (来源：VP / Internal) [cite: 224]。
* **状态高亮**：`Awaiting Confirmation` 状态建议使用蓝色或橙色标识，提醒 FA 这是需要介入核对的新单据。

#### 2. TMS - 预付申请审核 (PrePaid Application Review)
* [cite_start]**操作按钮**：详情页顶部仅保留核心动作：`Approve`、`Reject`、`Edit` [cite: 277]。
* **Approve 触发提示**：点击 `Approve` 确认弹窗增加提示：“*Approval will automatically trigger a Payment Request in the HR system. Do you wish to proceed?*”

#### 3. VP - 预付申请状态追踪 (PrePaid Tracking in VP)
* [cite_start]**状态流转**：供应商提交后为 `Pending Review` -> TMS 审核后为 `Approved` -> 支付单生成并放款后为 `Paid` [cite: 310]。

---

*