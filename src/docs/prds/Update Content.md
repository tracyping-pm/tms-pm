更新内容汇总
16falsedefaultlisttrue
# 11/08 case 评审涉及更新内容

## 1. 对账单list 金额排序修改

原文档链接：[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#2.3-%E6%8E%92%E5%BA%8F](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#2.3-%E6%8E%92%E5%BA%8F)
- 允许用户可以点击“Outstanding Amount”列的标题在本页来按升序或降序排列。

删除 允许用户点击该列进行排序

## 2. on hold 项标示更新--UI

见UI设计

## 3. 创建对账单加锁（超时未释放场景）提示

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#3.3-%E7%94%9F%E6%88%90%E5%AF%B9%E8%B4%A6%E5%8D%95](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#3.3-%E7%94%9F%E6%88%90%E5%AF%B9%E8%B4%A6%E5%8D%95)

更新后逻辑：生成对账单时检查所关联的结算项是否有更新状态/金额， 若有更新，则提示 “The settlement items have been updated, please recheck and generate the statement”  （备注：被其他对账单关联了结算项也属于状态更新） ，阻塞该对账单生成，确认提示后停留此页面并刷新页面，原选择项被清除；

## 4. 添加杂费交互更新

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#Edit-Miscellaneous-Charge%3A](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#Edit-Miscellaneous-Charge%3A)

更新后逻辑：删除原Proof 列，即添加杂费项无需必传证据内容，改由人工自行在Proof 模块添加自定义类型的证据文件

杂费添加交互如下，仅添加费用即可，并支持回显历史添加的费用项，并允许编辑

## 5. pending 对账单删除 编辑结算项， 编辑运单操作

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#Edit-Waybill%3A](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#Edit-Waybill%3A) [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#Edit-Settlement-Items%EF%BC%9A](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#Edit-Settlement-Items%EF%BC%9A)

更新后逻辑： 不允许编辑结算项，删除原Edit Settlement Items 操作

不允许重新选择运单，删除原Edit waybill 操作

## 6. 运单结算项金额修改标识逻辑补充
- 点击 Confirm Amount，确认已编辑内容，表格进入不可编辑状态；已编辑值需区别展示（@UI）; 备注：每次编辑区别编辑过的值即可（与上次相比，原编辑过的标识依然保留）
- 更新为：仅与初始值进行比较，若与初始值一致，则为未编辑过的标识，否则展示编辑过的标识

## 7. 补充导出sheet模板（待定）

## 8. receipts proof 文案更新

原Proof 更新为 Receipt ，参考下图

## 9. 运单列表删除时间筛选条件

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#2.4-%E8%BF%90%E5%8D%95%E4%BF%A1%E6%81%AF](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/701333516/Customer+Statement#2.4-%E8%BF%90%E5%8D%95%E4%BF%A1%E6%81%AF)

生成对账单选择运单时，删除原时间相关筛选

对账单详情运单列表同删除原时间相关筛选

# 11/11 case 评审涉及更新内容

## 1. route lib 的税务标志更新为不可变

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/720142340/Statement+related+content+update#2.-Route-Library-%E6%9B%B4%E6%96%B0](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/720142340/Statement+related+content+update#2.-Route-Library-%E6%9B%B4%E6%96%B0)

更新后逻辑：confirm后不再允许修改 route pricing tax type

## 2. waybill detail--Billing模块权限更新

权限树：waybill detail--Billing --增加 “View Amount” 权限，若拥有此权限，则billing 模块查看所有内容，否则billing 模块所有金额均展示为“ **** ”，备注：编辑金额弹窗不受影响，且standard waybill 与 temporary waybill 都均增加该权限控制

## 3. waybill detail--Billing模块增加说明内容

文案如下：

The status definitions for each settlement item are as follows:
- **Pending**: Amount not yet confirmed.
- **On Hold**: Expense items that require confirmation from the customer or vendor.
- **Verified**: Amount confirmed by the Pricing department.
- **Billed**: Amount linked to the statement.
- **Settled**: The status of the linked statement is Paid / Received / Written Off

## 4. Linked Statement 弹窗增加展示字段

增加展示对应对账单所关联的结算项，若未关联则展示“-”， 参考以下UI

## 5. 结算项补充说明

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/720142340#3.1-Waybill%E8%B4%A2%E5%8A%A1%E7%8A%B6%E6%80%81%EF%BC%9A-Awaiting-Settlement](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/720142340#3.1-Waybill%E8%B4%A2%E5%8A%A1%E7%8A%B6%E6%80%81%EF%BC%9A-Awaiting-Settlement)
- 原逻辑：被Reject 回上个状态的运单，其Billing 模块结算项verified 状态的被更新为pending, 允许编辑及通过 子任务添加新费用项目；已关联对账单的结算项（billed及之后状态的 结算项则不允许编辑）；不允许编辑的情况依然展示操作按钮，点击提示：**Operation not allowed unless the settled item is unlinked from Statement**
- 说明：其中“其Billing 模块结算项verified 状态的被更新为pending”， 无论什么财务状态的运单，其被reject 回之后，其中verified 状态的结算项将被更新为pending 状态；

# 11/12 更新

[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/720142340/Statement+related+content+update#3.1-%E7%BB%93%E7%AE%97%E9%A1%B9%E8%AF%B4%E6%98%8E](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/720142340/Statement+related+content+update#3.1-%E7%BB%93%E7%AE%97%E9%A1%B9%E8%AF%B4%E6%98%8E)

更新内容：补充结算项被手动确认后可能被非pricing 角色修改金额的场景；即当结算项状态= verified 之后，则该结算项不允许修改其金额（包含修改金额的情况：1.手动修改，2. 通过子任务修改 3. baisc amount 的回退至自动计算功能；以上3种情况均不允许修改已确认状态的结算项金额）

# 11/15 补充

**涉及功能：**导出运单sheet ，运单定时任务（delivered)

**原逻辑：**有两个Tax Type, 取值逻辑为对应route lib 里的customer 及vendor tax type

**更新为**一个字段： Route Pricing Tax Type，取值逻辑为对应route lib 里的 Route Pricing Tax Type 即可，位置可保留在 waybill payable Amount 列后