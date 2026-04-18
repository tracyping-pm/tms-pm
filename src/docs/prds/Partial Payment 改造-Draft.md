61truedefaultlisttrue
考虑Claim 结算的特殊性：可能在运单完成后添加该运单的Claim, 可能与运单无关的Claim, 为实现该场景，将 Claim 模块与运单模块进行解耦设计：通过独立监控 Claim 模块，并以工单作为 载体，最终实现 Claim 业务与运单业务的解耦，避免因业务关联性导致的流程阻塞或数据依赖问题。

# 流程状态
- Pending Proof
- Pending Review
- Pending Vendor Confirm

# backup

Partial Payment 改造
- 如下图，增加展示需支付的基础运费总额，及填写 Payment Request No. ，填写完成后，点击OK，需获取HR系统对应Payment申请信息并做以下校验，校验通过后允许填写Paid in advance，否则置灰不可用
- 是否为同一个Vendor, 否则外框置红并提示：Vendor doesn’t match
- Payment Category 必须为 Vendor Payment, 否则外框置红并提示：Payment Category should be Vendor Payment
- payment Request 状态必须为 Released 或 Closed, 若不是，外框置红并提示：Payment Request status should be Released / Closed
- 删除paid in advance 不超过50% 基础运费的限制，修改为paid in advance+handing fee 不得超过100% 运费
- 对账单中不再结算此项：Paid in Advance 从AP statement 中删除，且运单关闭不再依据此结算项
- RL 修改增加更新运单价格操作
- 点击 Refresh Waybill Price ，刷新该 RL 所有未delivered 状态（Planning，Pending，In Transit）运单价格
- 刷新中可按钮加加载中动效，且不可用，直到运单价格刷新完毕
- Hover,浮窗展示说明：After clicking, TMS will automatically recalculate the prices of undelivered waybills associated with this RL based on the new price.