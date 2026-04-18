# 知识库：财务与结算 (Finance & Billing)

本部分聚焦于运单在完成运输交付后的财务处理流程。它通过引入“财务状态”和“子任务”的概念，实现了对运单结算过程的精细化管理和追踪，确保了财务流程的准确性和高效性。

## 1. 核心概念

### 1.1. 财务状态 (Financial Status)

- **功能**: 独立于运单的“运输状态”，用于追踪运单在财务层面的进展。
- **状态机**: 运单的财务状态会根据一系列预设条件自动流转。
- **主要状态**:
    1.  **Not Started**: 运单创建时的初始财务状态。
    2.  **Awaiting POD Receipt**: (当需要POD时) 等待签收单回传。
    3.  **Awaiting Information Verification**: 等待财务人员核对运单所需的各类信息和文件（由子任务定义）。
    4.  **Awaiting Exception Handling**: 当信息核对不通过时，进入此状态等待处理。
    5.  **Awaiting Price Verification**: 信息确认无误后，等待价格的最终确认。
    6.  **Awaiting Settlement**: 价格确认后，等待被纳入对账单进行结算。
    7.  **Settled**: 运单已被对账并完成结算。
    8.  **Closed**: 已取消的运单的最终财务状态。

### 1.2. 子任务工作流 (Sub-task Workflow)

- **功能**: 允许在项目层面为运单配置一系列可自定义的子任务，作为财务状态流转的前提条件。
- **目的**: 确保在进入财务结算前，所有必需的数据和文件（如过路费发票、磅单、客户签收单等）都已收集齐全。
- **灵活性**: 子任务具有高度的可扩展性，可以适应不同项目和客户的特定需求。
- **逻辑**: 只有当所有必需的子任务都完成后，运单的财务状态才能流转到后续阶段（如从 `Awaiting Information Verification` 到 `Awaiting Price Verification`）。

## 2. 核心模块

### 2.1. 运单开票 (Waybill Billing)

- **功能**: 这是运单详情页的一个核心模块，集中展示了运单的应收（Customer Billing）和应付（Vendor Billing）费用信息。
- **费用构成**: 包括基础运费和附加费（Additional Charges）。
- **毛利计算 (Gross Profit)**: 系统在此处自动计算并展示毛利（应收 - 应付）。当毛利 ≤ 0 时，会以红色标示并触发系统通知。

### 2.2. 对账单 (Statement)

- **功能**: 将多个已进入 `Awaiting Settlement` 状态的运单批量组合，生成给客户的对账单或与供应商的对账单。
- **关键操作**: 对账单的生成和确认是驱动运单财务状态进入最终 `Settled` 状态的关键步骤。
- **相关文档**: `S34 对账单优化.md`, `Customer Statement.md`, `Vendor Statement.md` 提供了对账单功能的详细需求。

## 3. 关联文档

- `财务流程.md`: 定义了财务状态机和流转规则的核心文档。
- `需求详细说明.md`: 描述了运单毛利计算、价格版本校验等与财务密切相关的逻辑。
- `Financial Status Subtask List.md`, `S30 Financial Process Update.md`, `V1.5 Financial Process Update.md`: 提供了关于财务流程和子任务的更多细节。
