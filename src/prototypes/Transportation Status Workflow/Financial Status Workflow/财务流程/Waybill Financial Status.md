e
16falsenonelisttrue
项目中配置好子任务后，将在本项目运单中影响运单运输流程及财务流程流转, 以下内容主要介绍运单中的财务状态流转过程，及对应的各个状态下的可能操作

# 1.Waybill List Filter 优化

筛选条件组织规则：按信息逻辑进行组织

适用范围：waybill list

默认为收起，点击下拉，则展开；新增的条件：Financial Status

全部展开，如下图

添加 Financial status（多选）， driver name（多选）

删除 actual truck type

改名 All Type-->dispatch type

新增筛选器设置：Filters Setting ，点击Filters Setting ，展示如下弹窗
- 可保存当前筛选项作为私人筛选器，可输入筛选器名称（最大不超过200字符）
- 保存筛选器同时保留当前时间，允许筛选器无名称，则只展示保存时间, 点击【Save】,保存该filter至filters list, 停留在当前弹窗页并刷新页面；
- 最多保存10个，不校验筛选条件是否重复，若超过10个，点击“save”时提示【Fail, Save up to 10 private filters】；
- 若未选择任何筛选条件，点击【Save】，提示【Fail, No filter selected】
- 已保存筛选器按保存时间倒序排列（最新排最前），进入waybill list ,默认按最近使用筛选条件进行筛选；
- 筛选器展示选中效果，点击【Apply】应用当前filter筛选条件，并关闭弹窗回到waybill list；点击【Del】，删除该filter，停留在当前弹窗页并刷新页面；
- 注：没有设置筛选器时，原保存上次筛选条件的逻辑暂不删除，依然保留

### 1.1 Project Detail 页 waybill list 筛选器

Project Detail 页 waybill list 筛选器同更新，筛选条件如下，私人筛选器本页不可用

# 2.Waybill Detail 更新

Waybill Detail 在原基础上，微调了信息布局形式；及在原运输状态基础上，增加了财务状态，在不同的财务状态下，详情页做了对应的信息形式调整及对应不同的操作功能。

### **2.0 Waybill Detail打开方式更新**

从waybill list 列表页打开Waybill Detail ，更新为从新页面打开

### 2.1 waybill信息更新

#### 2.1.1 增加导航条
1. 导航条固定悬浮在页面，允许沿右边沿进行拖动（刷新页面不保存拖动结果）
- 点击导航条，页面跳转至该信息模块
- 导航条权限设置：若操作人无当前模块信息则导航条也不展示该菜单

#### 2.1.2 更新操作按钮位置
- 将部分操作按钮在原基础上转移至对应模块，具体如下：

| 模块 | 操作 |
| Tracks | Add record |
| Billing | additional charge、 partial payment |
| POD | Manage POD Number |

#### 2.1.3 Shipping Record 改名为：Tracks

#### **2.1.4 增加Subtask 信息模块**
- 点击详情按钮，跳转至该Subtask Detail 页
- 展示本运单中所生成的Subtask 列表
- 排序逻辑：按Due Time 正序排列，即需越早完成，则排序越靠前；Due Time一致，则按照创建时间倒序，即越晚创建排序越靠前
- 列表展示字段：

| Subtask name | Subtask result | current assignee | Due Time | Creator |
| 取该流程名称 | 取流程结果 | 取流程当前指派人 | 取要求完成时间 | 该流程添加人，若为自动参加，则为System |

#### 2.1.5 Billing模块更新
- 增加 **Edit Exception Fee** 操作，**Exception Fee** 为根据相关子任务所产生的各项费用（如： charge /claim等）将展示在billing 模块
- Exception Fee 需将明细小项进行展示 （Cusotmer  Exception Fee 为客户所有额外费用小项汇总， Vendor Exception Fee 同理）
- Exception Fee 明细项展示流程中的Field Type= Customer Charge/Vendor Charge 的Field Name字段名（原固定展示字段类型 Customer Charge/Vendor Charge)      9/26 update
- 允许分别对customer 及 Vendor 明细账单进行是否结算设置，默认开启（需结算）；
- 若任一方total bill 关闭（不进行结算），不再计算本单Gross Profit 及Gross Margin;
- 若两个total bill 均需结算，但有小项不计算，则计算Gross Profit 及Gross Margin时，需将该不结算的小项剔除后计算
- 及影响**后续**对账单功能（ 非本期功能）
- customer 及 Vendor settlement status and setting , 点击进入各项账单是否结算设置及结算状态弹窗页面   (备注：此处可能和后面整个waybill 详情中的billing 不一致，以此处为准)

- 若有项目无需结算，则billing 该项目著名无需结算，且总额（customer total amount/vendor total amount ）计算需剔除该无需结算项

**Edit Exception Fee**允许增、删、改 异常费用的条目及数值，若新增条目，条目名称允许自定义  9/26 update， 数值允许为负数

注：若为空，打开弹窗则默认展示一行空数据，允许删除所有行并提交，不允许提交空行，否则外框置为红色并提示“please fill in the fee”

- Exception Fee产生：

Subtask 设置中的fields setting 有系统所封装的特殊字段：**客户费用/供应商费用** [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/647364657/Process+Editing#3.9.%E5%AE%A2%E6%88%B7%E8%B4%B9%E7%94%A8-Custoemr-Charge](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/647364657/Process+Editing#3.9.%E5%AE%A2%E6%88%B7%E8%B4%B9%E7%94%A8-Custoemr-Charge)，在子任务到达完结节点时，需根据process 设定为**当前subtask所在waybill--billing模块--Exception Fee**添加对应的条目
- 以当前暂代类型举例： 当运单中有process type =Shipping Claims/Goods Rejection类型子任务到结束节点时
- 若为Shipping Claims 流程，执行结果是Inteluck needs to pay compensation时，将Customer Claim记录到运单--billing 模块（ps: 执行结果为BPM中的 Result 字段）
- 多个子任务产生多笔Customer Charge或Vendor Charge，均分别进行记录至exception fee

**customer 及 Vendor settlement status and setting** , 点击进入各项账单是否结算设置及结算状态弹窗页面
- 若Total customer/ vendor bill 选择 不结算，则所有子项均更新为不结算，若有子项更新为需要结算，Total customer/ vendor bill 也不被更新为需结算
- Settlement Status 为根据各子项需结算项目的对账单状态枚举获取，本迭代不进行处理，均置为默认值 “Unverified”，外层billing模块customer 及 Vendor settlement status and setting 处也展示为 “Unverified”

#### **2.1.6**POD模块更新
- 根据项目所设置POD类型 [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/649920519#POD-configuration](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/649920519#POD-configuration) ，在 pending 状态的waybill，start 成功时，POD模块，根据所设置类型生成需上传的文件类型，并根据设置展示文件形式为 Softcopy/Hardcopy，且不可删除类型，仅允许增加，删除，编辑文件本身
- 若skippable 开关为打开，则该类型POD可略过不进行上传
- 若skippable 开关为关闭，则该类型POD不可略过，必须上传文件，否则阻塞 运单confirm delivery ，并提示“Error ,Please upload the necessary POD”
- Add POD 保留当前逻辑，允许自行添加所有的POD类型，且允许可删除
- 若项目未设置POD类型，则无必传POD类型，使用ADD POD添加相应的POD文件，类型自选；原逻辑保留：*至少上传一个POD文件才允许confirm waybill*
- POD 模块展示被要求的文件类型、hard/softcopy 及需求方为by customer/ by inteluck ; 若为自行【add pod】,则不展示 hard/softcopy 或需求方为 by customer/ by inteluck 信息
- 历史数据处理：原运单保存的POD类型保留，不进行更新

- Manage POD NO.时，Type不与项目中所设置必须上传的Type关联；展示所有  “type+   {others} “   共12个枚举， 并允许每个Type 多次选择；
- 增加在外层删除该POD No. 的功能
- 增加同一个type下对number的验重，即同一个类型，不允许文件编号相同.否则提示“Duplicate POD number.”

### 2.2 财务状态

本期处理财务状态包括：**Not Started，Awaiting POD Receipt，Awaiting Information Verification，Awaiting Exception Handling, Awaiting Price Verification，Awaiting Settlement，Closed**
1. 状态流转

|  | 前序状态 | 操作 | 后序状态 |
| 1 |  | 创建运单 | Not Started |
| 2 | Not Started | Abnomal Waybill | Awaiting Information Verification |
| 3 | Not Started | Cancel Waybill | Awaiting Price Verification |
| 4 | Not Started | Cancel  Waybill | Closed |
| 5 | Not Started | Confirm Delivery & with POD receipts type subtask | Awaiting POD Receipt |
| 6 | Not Started | Confirm Delivery & POD receipts Not required | Awaiting Information Verification |
| 7 | Awaiting POD Receipt | confirm POD receipts & POD  receipts Subtask completed | Awaiting Information Verification |
| 8 | Awaiting Information Verification | confirm Verification & Subtask not completed | Awaiting Exception Handling |
| 9 | Awaiting Information Verification | confirm Verification & Subtask completed | Awaiting Price Verification |
| 10 | Awaiting Exception Handling | All  sub-tasks  ended | Awaiting Price Verification |
| 11 | Awaiting Price Verification | Reject  Price | Awaiting Information Verification |
| 12 | Awaiting Price Verification | Confirm Price | Awaiting Settlement |
| 13 | Awaiting Settlement | Reject Waybil information | Awaiting Information Verification |
| 14 | Awaiting Settlement | Reject Price | Awaiting Price Verification |

1. 按钮操作

下述是不同状态下的操作按钮可见性说明。

| 状态 | Cancel | Abnormal | Reject | Confirm POD Receipt | Confirm Verification | Confirm Price |
| Not Started | ✔ | ✔ |  |  |  |  |
| Awaiting POD Receipt |  |  |  | ✔ |  |  |
| Awaiting Information Verification |  |  |  |  | ✔ |  |
| Awaiting Exception Handling |  |  |  |  |  |  |
| Awaiting Price Verification |  |  | ✔ |  |  | ✔ |
| Awaiting Settlement |  |  | ✔ |  |  |  |

以上操作均需加入 operation log ，若有description 同加入 operation log
1. 模块操作

下述是不同状态下页面模块的可操作说明。

10.8 增加备注：POD编辑导致的Transmittal 侧的POD文件编号相应的变化，不考虑记录快照，与waybill 最新信息保持一致即可

POD: in transit(原编辑权限不变）， + delivered 按以下财务状态进行控制，cancel 的不允许编辑（保留原逻辑）

Billing: 原逻辑：additional charge + partial payment  ，再Cancel ,abnomal, completed 状态不允许编辑，当前cancel 状态不允许编辑，abnormal 状态根据其财务状态进行控制，completed 即将取消该状态，故不处理

| 状态 | Subtask | Billing | Tracks | Route | Carrier | POD | Basic Info. | Remark |
| Not Started |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting POD Receipt | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting Information Verification | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting Exception Handling | ✔ | ✔ |  |  |  |  |  |  |
| Awaiting Price Verification |  | ✔ |  |  |  |  |  |  |
| Awaiting Settlement |  |  |  |  |  |  |  |  |

新增subtask 需加入 operation log

#### 2.2.1 Not Started

在运输流程未完成之前，财务状态均为 Not Started，此时运单操作及信息同线上，不展示Subtask
- confirm delivery 运单时，该项目设置了**POD receipts** 类（Type= POD Receipt by Customer/by inteluck）子任务为**Required**，则运单财务状态从**Not Started**更新为**Awaiting POD Receipt**
- confirm delivery 运单时，当运单中无 **POD receipts** 子任务，则运单财务状态从**Not Started**更新为 **Awaiting Information Verification**
- confirm delivery 运单时，根据项目设置为required的流程生成相应子任务在本运单

Cancel /abnormal waybill

当Financial Status为 Not Started时
- 若cancel waybill ，需根据取消原因，相应的更新财务状态转为对应状态

- 若cancel reason
- Cancelled by Client (With pay) , Cancelled by Client (Without Pay Customer Reason), Cancelled by Trucker, Involved in Incident before WH arrival，No Show ，Not enough trucker :   **Awaiting Price Verification**
- Cancelled by inteluck ： **Closed（关闭）**
- 若运输状态 为delivered状态，则不允许cancel 运单（不展示 cancel按钮）
- 若abnormal waybill ，财务状态转为 **Awaiting Information Verification（待确认运单信息）**
- cancel 后其reason 及 description  按照原逻辑 加入至remark

#### 2.2.2 Awaiting POD Receipt
- waybill信息组织形式变化：
- Subtask，POD，Remark, Billing, Tracks, routes，carrier，basic
- 操作：**Confirm POD Receipt：**
- 需校验运单中所有POD receipts 类子任务到完结节点，确认成功，刷新页面；运单财务状态从**Awaiting POD Receipt** ****更新为 **Awaiting Information Verification**
- 若POD receipts 类子任务未到完结节点，则提示【Error: Please complete the POD receipts subtask】,并阻塞流程；
- ADD subtask
- 点击Add,  展示ADD subtask 弹窗

- - 弹窗字段

| waybill No. | 取当前运单号，不允许编辑 |
| Process Type | 单选

可选范围：本项目(waybill所在项目，未填写waybill No.不可选择type) 配置的所有process type（添加了process name的流程）

同一类型仅允许一个未到结束节点的该类型任务, 否则该选项不可被选中（required 类型子任务已到结束节点，允许通过手动添加同类型子任务） |
| Process Name | 根据项目配置展示所选 process type下的process name |
| Due Time | 若为required 流程，则根据所配置时间自动填入不可更改

若为optional 流程，则自行填写，不得早于当前时间, 允许选择今天 |

- 弹窗操作
- 点击Confirm，进行子任务生成相关判断（[判断逻辑](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/649920519#%E5%BD%93%E9%A1%B9%E7%9B%AE%E4%B8%AD%E7%9A%84%E5%AD%90%E4%BB%BB%E5%8A%A1%E9%85%8D%E7%BD%AE%E4%B8%BAoptional-%E6%B5%81%E7%A8%8B%E6%97%B6%EF%BC%8C%E4%B8%BAwaybill-%E6%89%8B%E5%8A%A8%E6%B7%BB%E5%8A%A0-subtask%E6%97%B6%EF%BC%8C%E8%BF%9B%E8%A1%8C%E5%88%A4%E6%96%AD%EF%BC%9A) ），创建成功，toast 提示“Subtask add success”
- 点击Cancel /关闭按钮,取消添加，关闭弹窗；

#### **2.2.3** **Awaiting Information Verification**
- waybill信息组织顺序：
- Subtask，POD，Remark, Billing, Tracks, routes，carrier，basic

- **Confirm Verification**：
- 校验运单中的子任务，若有任何处于未完成节点的子任务，则运单财务状态从**Awaiting Information Verification**更新为 **Awaiting Exception Handling**
- 若所有子任务均到结束节点，则运单财务状态从**Awaiting Information Verification**更新为 **Awaiting Price Verification**
- confirm Verification 后，则运单信息（除billing，,Subtask模块）不可被增，删，改
- **Add Subtask**允许添加所有类型的子任务，但如果存在该类型的未完成子任务，则不可再添加该类型的子任务。

#### 2.2.4 **Awaiting Exception Handling**
- waybill信息组织顺序：
- Subtask，POD，Remark, Billing, Tracks, routes，carrier，basic

当运单财务状态为 Awaiting Exception Handling， 该运单中每个子任务到 结束节点均检查该运单是否所有子任务均到结束节点；
- 若是，则更新财务状态为**“Awaiting Price Verification”**
- 若还有未到结束节点的子任务，则财务状态不更新

#### 2.2.5 Awaiting Price Verification
- waybill信息组织顺序：
- Billing ,POD,Remark,Subtask, Tracks, Route, carrier， basic

- **Reject Price ：** 需弹窗进行二次确认，拒绝原因非必填，限制2000字；拒绝成功，则财务状态从**Awaiting Price Verification**更新为**Awaiting Information Verification,**PS**:**从cancel到该状态的不允许拒绝，不展示Reject 按钮。

- **Confirm Price**：确认成功，则财务状态从**Awaiting Price Verification**更新为**Awaiting Settlement**
- 操作成功分别记录操作日志为：【xx rejected price, reject reason is{xxxx}  】若未填写reject reason , 则展示 none / xx confirmed price

#### 2.2.6 Awaiting Settlement

该状态，运单信息模块顺序为：Billing ,POD,Remark,Subtask, Tracks, Route, carrier， basic

Reject ：

根据不同操作： ▌Reject Waybil information/ ▌Reject Price 返回至不同状态， 拒绝价格则返回 Awaiting Price Verification 拒绝运单信息则返回 Awaiting Information Verification 状态；

需弹窗二次确认， 拒绝原因非必填，限制2000字

- 操作成功分别记录操作日志为：
- 选择到 Awaiting Price Verification 【xx rejected price, reject reason is{xxxx}  】若未填写reject reason , 则展示 none
- 选择到 Awaiting Information Verification【 xx rejected waybill information，reject reason is{xxx}】若未填写reject reason , 则展示 none
- 当前暂不处理statement，财务状态到Awaiting Settlement即止

增加定时任务：每日00：00导出前一天更新为**awaiting settlement 状态，且 的 运单**，导出格式参考：[https://docs.google.com/spreadsheets/d/1tuL-xE42MH2Kft-1SQNJTL5rDOnkDD_Z3GxhK2SHUR8/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1tuL-xE42MH2Kft-1SQNJTL5rDOnkDD_Z3GxhK2SHUR8/edit?usp=sharing)