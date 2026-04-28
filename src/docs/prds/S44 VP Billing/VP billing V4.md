太棒了！你提供的这些交互优化点非常细致，且完美结合了系统现状与业务实操痛点。特别是引入了**结算项灵活勾选**、**Additional Charge 细化**以及**往来记录 (Communication Records)** 模块，极大地提升了“盲核对”模式下的沟通效率和灵活性。

基于你提供的**状态流转图**以及**VP/TMS两端的交互设计更新**，我作为 TMS PM，为你输出了这一版标准化的 PRD 模块方案。该方案严格保留了原有的业务术语，可直接作为产品需求文档对接到产研团队。

---

# 📄 东南亚 TMS 供应商自助结算流程优化 PRD (UI/UX 更新版)

## 1. 核心状态流转机制 (State Transition Logic)
根据最新的业务闭环要求，AP Statement 的状态机流转逻辑（包含 TMS 自建与 VP 端提交）统一更新如下：

* **Awaiting Comparison** (待比对)：VP 端提交自有数据后，生成的对账单初始状态。
* **Pending Payment** (待支付)：TMS 端完成金额比对且全部 `Match`，或内部调整一致并 `Confirm` 后的状态。
* **Partially Payment** (部分支付) / **Paid** (已支付)：对接 HR 系统，根据实际放款金额更新支付状态。
* **Awaiting Rebill** (待重新账单)：TMS 端审核发现重大差异并 `Reject` 后的状态，打回给发起方（VP或内部）修改。修改提交后，状态重新流转回 `Awaiting Comparison`。

---

## 2. Vendor Portal (VP) 端功能设计

### 2.1 创建对账单交互优化 (Create Statement UX/UI)
为了让供应商更灵活地上传自有数据，创建页面结构优化如下：

* **Tax settings 模块升级**：
    * 更新标题并增加**结算项过滤功能**。允许供应商勾选本次需要结算的项目（例如：仅结算 `Basic Amount` 基础运费，暂不结算其他杂费）。
* **总费用预览 (Total Amount Preview)**：
    * 需清晰展示**所有**本次所选的结算项目明细。
    * **视觉区分**：未勾选/本次不结算的项目仍需在预览区占位展示，但必须通过 UI 样式（如置灰、透明度降低或加删除线）与已选的结算项形成明确的视觉区分。
* **Additional Charge 细化填报**：
    * 允许供应商在 `Additional Charge` 下添加具体的子项（Sub-items）及对应金额。
    * 可选的子项枚举值（如 Parking fee, Toll fee 等）必须与 TMS 内部的系统配置保持强一致，便于系统进行精准匹配。
* **新增 Proof (佐证材料) 模块**：
    * 用于佐证所有未尽事项、额外费用或需要特殊说明的金额。
    * 供应商可上传多个附件，且**每个 Proof 都支持添加对应的文本说明 (Description)**。

### 2.2 查看对账单交互优化 (Statement Display UX/UI)
对账单详情页的结构进行模块化重构，提升信息获取效率：

* **独立的 Invoice 模块**：
    * 发票信息从底层抽离为单独的全局模块。
    * 列表化展示该对账单关联的每一张发票的：发票号、发票金额 (`Invoice Amount`)、发票日期 (`Invoice Date`) 及 发票附件。
* **运单/工单 Tab 视图**：
    * 底部的运单明细列表区域增加 Tab 切换设计：
        * **Tab 1: Waybill List**：展示关联的运单，字段与 `Create Statement` 时完全一致，保证核对体验连贯。
        * **Tab 2: Ticket List**：展示关联的逆向扣款单据，字段与创建时选择 `Claim Ticket`（仅限 `For Deduction` 状态）的字段保持一致。

### 2.3 Awaiting Rebill 状态处理与沟通机制
针对被 TMS 拒回的对账单，提供完整的修改与申诉闭环：

* **全量编辑权限**：处于 `Awaiting Rebill` 状态的对账单，允许供应商修改**所有**填报内容（包括发票、运单金额、Ticket、Additional Charge 子项等）。
* **新增往来记录模块 (Communication Records)**：
    * 在对账单详情页顶部或右侧侧边栏增加该模块。
    * 用于展示 TMS 审核时填写的 `Reject Reason`，以及双方历史的退回与重新提交的沟通记录（带时间戳和操作人标识），打破沟通信息差。

---

## 3. TMS 端功能设计

### 3.1 AP Statement 列表统一视图 (List View Unified)
* **数据源融合**：AP Statement 列表需同时展示 **TMS 自建 (Internal)** 和 **供应商提交 (Vendor Portal)** 的所有对账单。
* **状态列更新**：严格按照最新的状态机进行展示和过滤（`Awaiting Comparison`, `Pending Payment`, `Partially Payment`, `Paid`, `Awaiting Rebill`）。

### 3.2 Awaiting Rebill 状态与双向沟通机制
* **内部修正与打回**：与 VP 端逻辑对称，若对账单处于 `Awaiting Rebill` 状态，TMS 端的 FA 同样拥有修改该对账单所有内容的权限。
* **往来记录模块 (Communication Records)**：
    * TMS 端详情页同步新增此模块。
    * FA 可以直观看到历次打回的原因、VP 端修改的说明等。这相当于在对账单内部建立了一个“轻量级留言板”，确保每一次 Mismatch 的调整都有迹可循。

---

