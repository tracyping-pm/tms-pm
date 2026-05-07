详情页应该展示的核心信息与可执行操作：

1. Under Payment Preparation (付款准备中)
业务场景： TMS 内部人员（FA）主动创建的对账单草稿。

页面核心信息：

基础信息： 对账单号、对账单状态，供应商名称、创建时间、总金额,创建人。

结算明细表： FA 手动勾选或系统带入的运单列表、Ticket 列表、各项费用明细。

税务/发票： Add Invoice（上传发票）、税务配置（税率）。

可用核心操作：

添加/移除 Waybill / 添加/移除 Ticket（灵活调整账单内容）


Cancel（直接作废）

Confirm & Create Vendor Payment（核对无误，直接推 HR 支付）

2. Awaiting Comparison (待比对)
业务场景： VP 端供应商提交了结算申请（或重新修改后提交），等待 TMS 内部双向对账。这是最核心的对账工作台。

页面核心信息：

全局看板： 供应商申请总额、抵扣 Ticket 总额、应付净额。

双向比对明细表 (重点)： 必须并排展示 TMS Amount vs Vendor Amount，并高亮 Variance (差值)。

状态标签： 每一行显示 🟢 Matched, 🔴 Mismatched, 🟡 Missed。

展示Statement Basic Info ,发票信息, Amount Summary ,Proof
Operation log


可用核心操作：

Reject： 发现恶意高报且沟通无果，直接驳回（需填 Reject Reason），状态变为 Awaiting re-bill。

Edit Waybill Amount： 穿透至底层运单修改价格，修改后需刷新重新比对。

Confirm & Create Vendor Payment： 全部明细 Matched（或系统自动容差）后，生成 HR 支付单，并展示支付详情，允许修改支付金额。

3. Awaiting re-bill (待重新开单/待修改)
业务场景： FA 驳回了账单，球在供应商那边，等待 VP 端修改后重新提交。

页面核心信息：

展示Statement Basic Info 

只读展示上一轮的waybill比对数据， ticket list 和发票信息。
展示 Amount Summary ,Proof
Operation log

可用核心操作：

状态基本锁定，TMS 端主要动作为“等”。

仅保留 Cancel（若双方决定彻底作废此账单）。(注意：移除 Reject 权限)
Opreation LOG中展示：Reject Reason (驳回原因) 及 Reject Proof，提醒当前等待外部处理。

4. Pending Payment (支付处理中)
业务场景： 已经成功推送至 HR 系统，财务正在走付款审批流。

页面核心信息：

payment: 支付状态跟进： 显示关联的 AP Application No. (HR 支付单号) 及 HR 返回的实时状态。

所有运单、金额、发票明细全部置灰只读 (Read-only)，防范数据篡改。

可用核心操作：

业务操作彻底锁定（不可修改运单、不可移除 Ticket）。

仅保留财务向操作：Void Invoice (作废发票)、Add AP Application (手动添加一条HR支付申请)、Write Off (特殊情况下的坏账核销)、Export。

5. Partially Payment (部分已支付)
业务场景： HR 财务因资金或其他原因，仅支付了账单的部分金额。

页面核心信息：

Payment： 显示关联的 AP Application, 重点展示 Total Amount、Paid Amount (已付金额)、Outstanding Amount (待付余额)。

打款凭证： 展示 HR 传回的第一次打款的 Release Proof（水单）。

可用核心操作：

Write Off (核销剩余尾款，直接终结账单)。

Add AP Application(记录后续的尾款支付情况)。

6. Paid (已支付 - 终态)
业务场景： 账单金额已全额结清，流程完美闭环。

页面核心信息：

满屏的绿色成功标识。

完整的打款时间线、发票、完整的打款凭证 (Release Proof)。

可用核心操作：

纯只读状态。仅保留 Export 及查看 Operation Log 的权限。

7. Written Off (已核销 - 终态)
业务场景： 无论是在 Pending 还是 Partially Payment 阶段，因业务原因（如供应商失联、尾款抹零）手动终止了剩余金额的支付。

页面核心信息：

顶部醒目展示：Write-Off Reason (核销原因) 与核销操作人。

展示核销的差额数据。

可用核心操作：

纯只读状态。仅保留 Export 权限。

8. Canceled (已作废 - 终态)
业务场景： 账单在进入支付流之前被手动彻底作废。

页面核心信息：

顶部醒目展示：Cancel Reason。

底层关联的运单和 Ticket 被自动释放，可重新进入其他对账单。

可用核心操作：

纯只读状态。仅保留 Export 权限。