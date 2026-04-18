Statement的结算状态将影响其关联的运单财务状态，若waybill 所对应的 所有 Vendor Statement 及Customer  Statement 均为终态（ Written Off 、Reveived/ Paid）则所关联的 运单财务状态被更新为 Settled. (备注：**对账单允许单条目生成，但运单的所有条目均应生成对账单**）
none
## 1. Customer Detail 更新

- 增加**Tax Mark**字段，用于识别客户所需对账单是否进行含税处理， 允许客户新增时填写及通过Edit 进行编辑；字段布局参考UI设计；
- customer list 增加该筛选条件（默认全部）及列表字段
- 历史数据处理：原客户数据该字段值均置为空

## 2. Route Library 更新
- 创建library ：删除原Route Lib中 【**Create Library** 】及【**Library Detail**】中的 **Customer Tax Type**及**Vendor Tax Type** 字段
- 增加  **Customer Tax Mark** 字段展示**，**增加**Route Pricing Tax Type**字段，默认与**Customer Tax Mark**取一样的值
- **Route Pricing Tax Type**（路线价格税务类型）含义：标记该lib 中所维护的路线价格是否含税，将影响后续对账单中的税务部分
- 若为Tax -inclusive, 认为路线价格含税，反之Tax -exclusive 则认为路线价格不含税
- 历史数据处理：默认为空，需手动或上线后批量处理
- Lib Detail 展示，更新为此二字段，允许编辑

## 3. Waybill detail- Billing 模块更新

### 3.1 结算项说明

1. 九个费用大项均增加状态标志，其状态流转如下；
1. Pending, 当Billing 中产生费用，则该费用项状态为Pending (大项为0也展示其状态为Pending)
2. On Hold, 费用项待确认，根据subtask 或手动编辑可修改为该状态
3. Verified, 已确认， 当waybill 财务状态更新为 Awaiting Settlement,   则  pending 状态结算项被更新为Verified
4. Billed : 已关联对账单
5. Settled： 关联的对账单 状态为 Paid /received /Written Off，对应结算项为settled
6. 仅Verified 可关联对账单
7. 手动修改状态 允许 Pending，On Hold 间进行切换，**切换为Verified 需仅特定角色可用**（需分开设置权限，故权限树相关操作命名建议如下： pending 与 on hold 之间 切换状态：“Switch State”， 切换为Verified ：“Switch to Verified”）
2. 调整按钮顺序，每个操作均需设置相关权限（之前有的则忽略）
3. Partial Payment 计算，其百分比均按 Basic Amount Payable 进行计算
1. 不再展示于Billing, 展示与编辑均收至弹窗，弹窗样式如下：
2. 其中Basic Amount Payable (Remaining) （剩余应付基本费用）为Basic Amount Payable - Paid in advance-Handling Fee  【原逻辑也如此】
3. 其中任一结算项已关联对账单，则不再允许修改 1107补充

1. Edit Basic Amount弹窗布局更新为左右布局（与其他金额Edit 保持一致）
- 展示其状态，并不允许修改状态
- 修改Vendeor Basic Amount 状态，其被拆为 Paid in advance 及Basic Amount Payable (Remaining) 结算项状态同步更新  不允许修改t Basic Amount 的状态
- （其中任一 结算项已关联对账单，则不允许修改金额及状态）

- 1106update : 当vendor 侧 paid in advance 部分不为0 时，或某一项已关联对账单则 vendor basic amonut不再允许修改，且在基础费用编辑弹窗中展示为两项，且不允许修改
- 若有信息修改导致basic  amount 重算， 或回退到自动计算，其中已关联对账单的结算项 或 Vendor 部分 paid in advance 部分不为0，则均不再重新计算，保持已有的值不再重新计算
- 若 paid in advance 修改为无值，且未关联任何对账单；则vendor 侧依然展示为 Basic Amount Payable

1. Billing Truck Type 不再展示于Billing,展示与编辑均收至弹窗

1. 增加Claim 内容，展示Claim模块内容，Edit Claim 交互参考 Edit Exception Fee（备注：Claim 来源同样为相关subtask 及手动修改）
2. 其他费用项（addditonal charge,  Exception Fee, Basic Amount）编辑弹窗均增加状态展示及状态切换操作；
1. 增加 Linked Statement 操作
1. 展示该运单所关联的所有对账单列表
2. 点击 View, 跳转至该对账单详情页
3. 若无，展示为 - 即可

1. 增加Tax 展示，Tax 为该运单税务部分进行展示
1. 价格说明：当  **Route Pricing Tax Type =Tax-Inclusive** **,**则默认该项目所有运单的价格均为含税价，税额 T=（含税价*0.12） /1.12 , 即： （Total Amonut *0.12 ）/1.12
2. 当  **Route Pricing Tax Type =Tax-Exclusive** **,**则默认该项目所有运单的价格均为**非**含税价,               税额T=0， 即，该单不包含税额
3. Edit Tax, 则以 编辑后的税额为准
1. 其中含税运单默认展示12% 的VAT，不允许删除，允许自定义添加其他税种，税额（ 未填写完成条目不予保存）
2. 非含税运单则默认为空，允许自定义添加其他税种，税额（ 未填写完成条目不予保存）
3. 税种（object) 字数不大于 128, 不可重复，如有重复，标红此行并提示“ Duplicate Object”
4. 编辑税额对运单金额的影响：
1. 未编辑税额时，Total Amount = Basic Amount + Additional charge+ exception Fee +Claim
2. 若编辑了税额，则 含税运单 中的TAX 展示所有税额加总，Total Amount = Basic Amount + Additional charge+ exception Fee +Claim + 新增的税种金额
3. 若编辑了税额，非含税运单，Tax 展示编辑后的税额，Total Amount = Basic Amount + Additional charge+ exception Fee +Claim + TAX

### 3.1 Waybill财务状态： Awaiting Settlement

针对待结算的运单，将根据结算项情况及关联对账单的情况做是否允许回退状态的限制
- Awaiting Settlement 运单在有未关联对账单的结算项，允许运单进行reject 操作
- 否则运单不允许reject ,依然展示两个reject 按钮，并置灰，点击提示
- 运单有关联非cancelled状态的statement ：**Operation not allowed unless the waybill is unlinked from Statement { statement No.}**，其中多个对账单编号以“，”隔开
- 没有 on hold，  ：**There are no on hold claims, so the status cannot be reverted.**
- 被Reject 回上个状态的运单，其Billing 模块结算项verified 状态的被更新为pending, 允许编辑及通过 子任务添加新费用项目；
- 已关联对账单的结算项（billed及之后状态的 结算项则不允许编辑）；
- 结算项不允许编辑的情况依然展示操作按钮，点击提示：**Operation not allowed unless the settled item is unlinked from Statement    1121更新   参考UI，允许点击展示对应弹窗，并展示各明细项，并不允许编辑，展示为不可编辑态**
- Awaiting Settlement Waybill 必须其customer 及vendor 所有结算项，共9个结算项状态均为终态，则运单状态更新为Settled
- 结算项终态包含：Settled

### 3.2 Waybill财务状态： Settled
- 各处财务状态筛选需增加该状态
- Settled 为该运单已到达终态，由 Awaiting Settlement 状态运单所有的 费用项 均为终态（ Written Off 、Reveived/ Paid）则所关联的 运单财务状态被更新为 Settled
- 信息展示顺序：Basic，Billing ,POD,Remark,Subtask, Tracks, Route, Carrier,

## 4. 增加流程类型（Claim)

| Process Scope | Process Type | Dependent Fields | Field Type | Field Configuration | Process Effect |
| TH Transportation Waybill Subtask + PH Transportation Waybill Subtask | Claim | Result | Dropdown List | Option 1: No  Claim

Option 2: Need to Claim

Option 3:Can‘t Confirm Claim | 结果是1时，按Item 对应记录到运单Biliing-Claim，该Item=0,且将Claim 结算项更新为 Pending

结果是2时，需要将Customer Claim + Vendor Claim 按Item 对应记录到运单Biliing-Claim, 并将Claim 结算项状态更新为  Pending

结果是3时，按Item 对应记录到运单Biliing-Claim, 将Claim 结算项状态更新为 On Hold

备注：多个subtask 不同的Item, 不同的result, 可能会将Claim 项置为不同的结算状态，Claim 结算项状态取最近一次即可 |

- 此处新增的 Process Type，允许在project --subtask configuration中被选择
- 关联对账单的结算项 不再通过subtask 进行item 项写入或值更新
- 其他涉及billing的流程类型处理：
- Additonal Charge 及exception fee ，不管Result 什么结果，流程completed之后，对应结算项均置为 Pending 状态 （后期根据业务需求设置特定result 值 与hold状态，当前暂不处理）

## 5. 删除原批量更新价格功能

删除项目 **Batch Price Update**功能，对应权限同样进行删除

## 6. Completed 状态数据处理 (待确认）
1. 各运单筛选删除 Completed 状态
2. 历史数据（待确认）
3. 客户税务标志置特定值（待处理）