1. 运单选择与数据流转 (Unbilled Waybills Selection & Data Flow)
在 Unbilled waybills list 页面，为供应商提供“双轨制”的对账单创建入口，满足不同核对习惯的供应商。

路径 A：上传自有数据 (Upload Own Data / Sync from Sheet)

交互逻辑：新增 Sync from Sheet 或 Upload Excel 按钮。供应商下载标准 Sheet 模板，在模板中维护运单号及自有财务核算的价格数据。

数据流转：供应商在模板编辑完成后点击同步（Sync），系统自动拉取 Sheet 中的数据并跳转至 Create Statement 页面。

页面回显：Create Statement 页面内的运单列表及金额，将严格按照供应商上传的自有数据进行回显渲染。

路径 B：使用系统默认价格 (Select Unbilled Waybills)

交互逻辑：针对没有自有系统或接受 TMS 价格的供应商，支持在 Unbilled waybills list 中直接勾选目标运单，点击 Create Statement。

数据流转：跳转至 Create Statement 页面后，系统自动带入被选中的运单，并使用 TMS 内部的系统价格（Contract Cost）作为结算基准。

2. 发票上传模块升级 (Invoice Upload Module)
强化发票信息的颗粒度，为后续的自动对账和税务合规（特别是泰国 TH 的 VAT/WHT 抵扣）提供结构化数据支撑。但为非必填

新增字段与必填项：

Invoice Number (发票号) - 必填，需走历史发票查重逻辑。

Invoice Amount (发票金额) - 必填，支持多币种输入。

Invoice Date (发票日期) - 必填。

Attachment (发票附件) - 必填，支持 PDF、JPG、PNG 等主流格式。

OCR 智能识别辅助：

交互优化：供应商上传 Attachment 后，系统自动触发 OCR（光学字符识别）服务，尝试提取并自动填充 Invoice Number、Invoice Amount 和 Invoice Date。

兜底机制：若 OCR 识别失败或识别有误，供应商可随时手动覆写（Override）这些字段。

3. 费用抵扣扩展 (Select Claim Ticket Tab)
在 Create Statement 页面的明细区域，引入 Claim Ticket 抵扣逻辑，实现正向运费与逆向扣款的结算闭环。

Tab 结构：在底部的明细列表中，原有的 Waybill List 旁边新增一个 Select Claim Ticket Tab。

数据范围与校验：

点击 Add Claim Ticket，弹窗仅展示状态严格为 For Deduction（待扣款）且 Responsible Party 为当前供应商的工单。

总额计算：对账单的最终结算总额（Total Amount Payable）需自动减去勾选的 Claim Ticket 扣款金额，允许选择是否含税，选择WHT,VAT的税率。 且展示每个结算项的总额（包含basic Amount, Additional charge,exception fee, Reimbursement )


在发票上传环节，如果供应商填写的 Invoice Amount（发票金额）与当前对账单中所有运单累加出来的 Total Submitted Amount（核算总额）不一致，系统给一个 Warning 提示并允许其提交审核