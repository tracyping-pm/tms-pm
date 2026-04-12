none
# 1. Waybill Detail-- Billing 更新

## 1.1 独立Claim 模块

上期已将Claim 从 Gross Profit , Gross Margin 中拆出来，本期将在前端展示将本部分独立

Claim作为结算项其对运单财务状态的影响不变

Claim 模块作为一个单独的信息模块需
1. 导航中增加Claim （另：导航条需默认为展开形式）
2. Claim 所关联的 对账单信息（Linked Statement)在此模块进行单独展示，操作权限同样需单独控制
1. 权限点说明：Claim 模块权限
2. Edit Claim 弹窗权限（若以下两个权限都没有，则依然不展示 Edit Claim ）
1. Edit金额 权限( object edit: 包含金额，项目编辑）
2. 结算项状态修改权限
3. View Amount（查看金额权限）
4. Linked Statement（Claim关联的对账单）
3. Edit Claim 挪至该模块（其编辑逻辑不变）
4. Confirm Price 不更新Claim项的状态
5. Customer Claim 及 Vendor Claim 状态改变逻辑需更新：
- 原逻辑：若subtask 中更新了Claim小项状态，则按最新的 subtask结果更新 对应Claim 结算项的状态
- 更新后逻辑：任一subtask执行结果将Claim置为On hold 状态，则 对应Customer Claim 或 Vendor Claim 则为On Hold状态（需手动更新至其他状态）

Claim项目的状态转化如下：
- 若更新为 Verified之后，则subtask 执行结果不再改变 Claim项的值及状态
- 手动修改状态与通过Subtask 修改状态说明举例：
- 当subtask S1 将Claim 置为 on hold, 此时除非手动更新否则Claim 将永远处于 on hold ,
- 当手动修改至 pending ,S2 再次on hold ,则Claim 为on hold,
- 当手动修改至 Verified，S3再次on hold， Claim不再更新，保持为Verified，且值不根据S3进行更新

注意UAM中 Claim 作为独立模块需更新相关权限树 2025/2/8 add

## 1.2 Claim 编辑弹窗权限点更新
1. 弹窗权限
1. Edit 权限
2. 状态修改权限 （允许 pending , verified , on hold 状态互相切换）

即允许编辑Claim的弹窗里，状态修改与金额修改可单独控制。
1. 修改状态或修改/添加/删除金额均需记录至Operation Log
1. 修改状态： xxx modified Vendor Claim status to yyy 【xxx为操作人alias name ,yyy 为修改后该Claim结算项新状态】
2. 修改金额：xxx modified KPI Claim amount  to yyy1, theft claim amonut to yyy2. 【xxx为操作人alias name ,KPI Claim 为Claim object , yyy 为修改后该小项金额】
3. 添加claim 项：xxx add KPI Claim , amount yyy1, theft claim, amonut  yyy2. 【xxx为操作人alias name ,KPI Claim 为Claim object , yyy 为小项金额】
4. 删除claim 项：xxx delete KPI Claim , amount yyy1, theft claim, amonut  yyy2. 【xxx为操作人alias name ,KPI Claim 为Claim object , yyy 为小项金额】

## 1.3 Billing-Paid in advance

提前支付部分不得超过Basic Amount 的50%，Paid in advance 失焦时进行相关校验，若大于50%则进行相关提示：“The advance payment  can't exceed 50% of basic amount.”

在confirm 时若超过50% 未修改 则阻塞，无法confirm

## 1.4 增加运单列表字段
1. 增加按照 运单 **Unloading Completion Time**进行运单筛选的条件
- Unloading Time Start--Unloading Time End ：选择日期起止
- 范围：waybill list 及 project detail 中的waybill 切页
1. 增加筛选该运单是否有待结算Claim项的筛选条件：On Hold Claim Items
- 选中该项，则筛选运单中有On Hold 状态的Claim项的运单
- 范围：waybill list 及 project detail 中的waybill 切页均增加
2. 调整 cutomer code 筛选条件位置至On Hold Claim Items 之前（具体见UI图）2025/2/7 add
3. 运单list，增加 **Unloading  Time**字段，展示该运单的 Unloading Completion Time ，若无，则展示为“-”即可
- 范围：waybill list 及 project detail 中的waybill 切页均增加

## 1.5 运单导出字段调整

具体见如下sheet , 主要调整为：
- 增加运单小项费用导出
- 费用信息需分角色导出，以UAM 的user-role 为权限控制点。拥有 [Biling--View Amount] 权限的人允许导出值展示费用项目（具体见表格标注），否则展示为--
- 需考虑年后版本分拆Claim 项，对于Claim 内容的展示权限控制将更新   2025/1/17 update
- Claim 拆为单独项目   2025/2/7 update
- 调整部分字段顺序

[https://docs.google.com/spreadsheets/d/1hqwGoXgDn6BH50057bCayYTgfji-wXscTC8qHyT6DLs/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1hqwGoXgDn6BH50057bCayYTgfji-wXscTC8qHyT6DLs/edit?usp=sharing)

## 1.6 定时任务删除

删除当前每日写入Delivered 状态运单至对应Sheet 的定时任务

## 1.7 Claim项删除自定义项
1. Claim type 的subtask删除Claim自定义项，仅保留固定枚举项目，
1. 客户侧：KPl Claims，Delivery Claims，Theft Incident，Inteluck Expense
2. Vendor 侧：KPl Claims，Delivery Claims，Theft Incident
2. Edit Claim 删除自定义项，保留以上枚举项目；且金额部分±号，默认为负号
1. Batch Price Upada 表，删除Claim允许自定义项与原the others项
- Claim大项列不允许添加新的Claim小项列

## 1.8 Waybill Detail 模块调整

备注：有调整的部分删除线展示原逻辑，红字展示新逻辑，以便对照识别

其中subtask 由于在deliver之前允许手动添加，则生成项目所配置required型subtask 时需做以下校验：
- 若该运单已存在该Type的subtask，且subtask 状态为 In progress，Completed，则不再自动生成该类型子任务
- Start 运单时，根据项目配置生成相关required 的subtask ;2025/2/11 update
- Cancel 运单则关闭该运单所有subtask    2025/2/11update
- Subtask list 创建subtask时，增加允许选择 in transit 运单进行 subtask 的关联（原逻辑：仅允许delivered 及之后的状态）   2025/2/10 Update
- 若为copy 运单，原运单的 subtask 同样进行copy , 若因为subtask 模版原因或其他原因，导致其中一个waybill  无法成功Copy ,则本次Copy 均失败，并提示“Copy Failed, Waybill subtask failed” 2025/2/11 Add

POD 模块则根据项目配置，在生成运单时即生成项目所配置 POD   2025/2/8 Add

| 模块 | Subtask | Billing | Claim | Tracks | Route | Carrier | POD | Basic Info. | Remark |
| 模块操作 | Add subtask | Linked Statement | Edit Basic Amount | Edit Additional Charge | Edit Exception Fee | Partial Payment | Billing Truck Type | Edit Claim | Linked Statement | Add Record | Plan Route | Assign Carrier | Add POD | Edit Customer Code | Edit Info. | Project members | Add Remark |
| 财务状态 |
| Not Started( Planning） | 无该模块信息
展示模块但不允许操作 |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  | 无该模块信息
展示模块但不允许操作 | ✔ | ✔ | 无该模块信息
展示模块且允许操作
✔ | ✔ | ✔ | ✔ | ✔ |
| Not Started( Pending） | 无该模块信息
展示模块但不允许操作 |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  | 无该模块信息
展示模块但不允许操作 | ✔ | ✔ | 无该模块信息
展示模块且允许操作
✔ | ✔ | ✔ | ✔ | ✔ |
| Not Started(in transit) | 无该模块信息
展示模块且允许操作
✔ |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting POD HardCopy | ✔ |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting POD Verification | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ |
| Awaiting Exception Handling | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |  |  |  | ✔ |  |
| Awaiting Price Verification |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |  |  |  | ✔ |  |
| Awaiting Settlement |  | ✔ |  |  |  |  |  |  | ✔ |  |  |  |  |  |  | ✔ |  |
| Settled |  | ✔ |  |  |  |  |  |  | ✔ |  |  |  |  |  |  | ✔ |  |
| Closed |  | ✔ |  |  |  |  |  |  | ✔ |  |  |  |  |  |  | ✔ |  |

# 2. Statement 状态流转更新

## 2.1 AR Statement 状态流转

状态说明：

“Pending”（未确认）：生成结算单未确认，允许取消, 确认后进入Awaiting Customer Confirmation状态

“Awaiting Confirmation”（待客户确认）：等待客户确认，允许取消与退回上个状态

"Not Collected（待收款） ：客户已确认，待收款；允许取消

"Partially Collected"（部分收到）：该笔结算单已收到金额小于应收费用；根据收款额自动更新

"Over Collected"（超收）：该笔结算单已收金额大于应收金额；根据收款额自动更新

"Fully Collected"（完全收到）：该笔结算单已收到金额等于应收金额；根据收款额自动更新

"Collected"（已收到）：该笔结算单已收齐应收费用；手动更新至该状态

"Written Off"（冲销）：该笔结算单不再进行结算，允许Not Collected或Partially Collected 操作为该状态

"Canceled"（已取消）：该状态需 取消运单与结算单的关联关系

### 相关逻辑更新

列表按状态排序逻辑：1. Status 状态进行排列，顺序为：Pending, Awaiting Confirmation, Not Collected，Partially Collected，Over Collected，Fully Collected，Written Off，Collected，Canceled

各处相关列表的筛选等同需更新相关选项

## 2.2 AP Statement 状态流转

**状态说明：**

“Pending”（未确认）：生成结算单未确认，允许取消, 确认后进入Awaiting Customer Confirmation状态

“Awaiting Confirmation”（待供应商确认）：等待供应商确认，允许取消与退回上个状态

"Not Paid（待付款） ：供应商已确认，待付款；允许取消

"Partially Paid"（部分付款）：该笔结算单已支付金额小于应付费用；根据付款额自动更新

"Fully Paid"（完全支付）：该笔结算单已支付金额等于应付金额；根据付款额自动更新

"Paid"（已支付）：该笔结算单已支付完成应付费用；手动更新至该状态，不允许超付

"Written Off"（冲销）：该笔结算单不再进行结算，允许Not Paid或Partially, paid 操作为该状态

"Canceled"（已取消）：该状态需 取消运单与结算单的关联关系

### 相关逻辑更新

列表按状态排序逻辑：1. Status 状态进行排列，顺序为：Pending, Awaiting Confirmation, Not Paid, Partially Paid, Fully Paid, Written Off, Paid,Canceled

各处相关列表的筛选等同需更新相关选项

# 3. Statement Detail Upadte

对页面进行重新排版，及将收付款与发票内容进行模块化处理, Billing infomation--Claim 进行拆分展示等；

## 3.1 AR Statement Detail Upadte

具体参考原型+UI：

### 3.1.1 页面排版
- Basic 信息增加费用展示，删除部分字段
- Billing 信息拆分Claim，并增加Claim Detail 操作，进行Claim 详情展示
- 导出对账单中的Claim 也需进行独立展示，具体可参考样表 [https://docs.google.com/spreadsheets/d/1GgAdWNKN9uYYVwbf79u0hy2431vDTrsnruD7LJ8aqt0/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1GgAdWNKN9uYYVwbf79u0hy2431vDTrsnruD7LJ8aqt0/edit?gid=0#gid=0)  2025. 2.12 add
- Billing 中分别展示Claim , Miscellaneous Charge,Waybill Settlement Amount 总额即可

图示如下图红框部分，AR/AP一致，AP不再单独说明
- Claim 历史数据处理方案：2025. 2.14 add
- 需将所有历史运单中 Claim 部分从原来Billing模块中的**Customer Total Amount 和Vendor Total Amount** 总金额中减出
- 关注导出数据中的**Customer Total Amount 和Vendor Total Amount** 需处理
- Collection， 增加收款模块；原添加收款操作，更新为模块化展示
- Invoice, 增加发票模块；原添加发票操作，更新为模块化展示

不同状态对应展示及操作说明如下表：

| 操作按钮 | 按钮所在模块 | 按钮权限说明 | Pending | Awaiting Confirmation | Not Collected | Partially Collected | Over Collected | Fully Collected | Collected | Written Off | Canceled |
| Operation Log | 顶部 | 跟随页面权限 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Confirm | 顶部 | 需单独设置 | ✔ |  |  |  |  |  |  |  |  |
| Customer Confirm | 顶部 | 需单独设置 |  | ✔ |  |  |  |  |  |  |  |
| Reject | 顶部 | 需单独设置 |  | ✔ |  |  |  |  |  |  |  |
| Export Statement | 顶部 | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Cancel | 顶部 | 需单独设置 | ✔ | ✔ | ✔ |  |  |  |  |  |  |
| Write Off | 顶部 | 需单独设置 |  |  | ✔ | ✔ |  |  |  |  |  |
| Confirm Collected | 顶部 | 需单独设置 |  |  |  | 展示按钮但不可用 | ✔ | ✔ |  |  |  |
| Add Invoice | Invoice | 需单独设置 | 不展示该模块 | 不展示该模块 | ✔ | ✔ | ✔ | ✔ |  |  |  |
| Add Receipt | Collection | 需单独设置 | 不展示该模块 | 不展示该模块 | ✔ | ✔ | ✔ | ✔ |  |  |  |
| Claim Detail | Billing info. | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Edit Miscellaneous Charge | Billing info. | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |
| Add Proof | Proof | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |
| Edit Amount | Waybill info. | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |

以Pending 状态为例的页面展示

### 3.1.2 Claim Detail

新增的Claim Detail 操作，点击跳转至该页面

展示该对账单所有有Claim 项目的运单列表，需分页展示

允许导出，导出任务交互参考当前statement 导出，新页面打开对应sheet waybill 导出至下载中心 2025/2/11 update

| Field Name | 描述 |
| Waybill Number | 运单号，点击跳转至运单详情 |
| Customer Claim Amount | 该运单Claim 总额,

排序根据 Claim 总额从大到小排序 （1/22 update) |
| Claim Item | 索赔项目，展示该运单所有Claim  Item金额 |
| Subtask Link | 该运单Claim Item 所对应的Subtask 链接，

允许点击，点击跳转至对应subtask detail页

多个subtask 换行展示 （注意行距的设置 ）

展示文案为对应subtask 的name |

### 3.1.3 Edit Amount

单个金额校验
- 对账单Waybill 模块，编辑金额时，当该金额输入框编辑后失焦需校验 其金额是否低于编辑前原金额，不允许低于原金额；
- 若低于原金额，则回退至原金额，并提示：“Do not accept any amount lower than the settlement amount; please reject this waybill”

金额编辑证据
- 当有编辑成功的金额，Confirm 时需上传相关支持文件，并保存至 **Proof**模块-【Settlement Amount Edit Supporting】,
- 该proof 类目【Settlement Amount Edit Supporting】，不允许删除与编辑
- 文件支持多文件格式（大小与具体格式与当前TMS保持一致即可）

### 3.1.4 Add Invoice

添加发票

单个发票号不允许超过100个字符，允许一次填写多个发票号，用“,”隔开；
- 每个发票号需对应至少一个文件，同样支持多格式（大小与具体格式与当前TMS保持一致即可）
- 多个invoice 情况展示需考虑
- 允许编辑与删除
- 其中发票号查重逻辑更新：若对账单已canceled, 则取消已填写发票号与对应对账单的关联关系（对账单进行发票查重时，不再对已Cancel 的对账单发票进行查重） 2/6update
- 操作记录：xxx add invoice
- xxx edit  invoice
- xxx delete  invoice

### 3.1.5 Add Receipt
- 添加收款记录弹窗与当前系统一致，无更新
- 收款逻辑有更新，confirm 收款之后，需增加收款总金额校验：
- 历次添加的收款总金额>应收金额（Total Amount Payable) ,则状态更新为 Over Collected
- 历次添加的收款总金额=应收金额（Total Amonut Receivable) ,则状态更新为 Fully Collected
- 历次添加的收款总金额<应收金额（Total Amonut Receivable) ,则状态更新为 Partially Collected
- Over Collected,Fully Collected 状态点击Statement Detail 页头的 Confirm Collected, 状态更新为 Collected【核心逻辑，不允许少收，可以多收】
- Partially Collected状态， Confirm Collected 按钮置灰不可用，点击提示：The amount received can’t  be less than the total amount receivable
- 需展示历次收款金额，收款时间及相关证据
- 收付款记录不允许删除，不可编辑

操作记录：xxx add Receipt

### 3.1.6 AR Statement List 增加筛选条件

增加是否编辑过结算金额项的筛选，用以识别被修改过结算金额的对账单
- 若选择 yes, 则筛选出对账单中)任一运单结算金额（Settlement Amount（Tax-in）或Settlement Amount（Tax-ex）被修改过的对账单
- 允许取消选择，若取消选择，则删除该筛选条件

## 3.2 AP Statement Detail Upadte

### 3.2.1 页面排版

同AR Statement Detail [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/776077313#3.1.1-%E9%A1%B5%E9%9D%A2%E6%8E%92%E7%89%88](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/776077313#3.1.1-%E9%A1%B5%E9%9D%A2%E6%8E%92%E7%89%88) 一样，做了以下排版更新：
- Basic 信息增加费用展示，删除部分字段
- Billing 信息拆分Claim，并增加Claim Detail 操作，进行Claim 详情展示
- Payment， 增加付款模块；原添加付款操作，更新为模块化展示
- Invoice, 增加发票模块；原添加发票操作，更新为模块化展示

不同状态对应展示及操作说明如下表：

| 操作按钮 | 按钮所在模块 | 按钮权限说明 | Pending | Awaiting Confirmation | Not Paid | Partially Paid | Fully Paid | Paid | Written Off | Canceled |
| Operation Log | 顶部 | 跟随页面权限 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Confirm | 顶部 | 需单独设置 | ✔ |  |  |  |  |  |  |  |
| Vendor Confirm | 顶部 | 需单独设置 |  | ✔ |  |  |  |  |  |  |
| Reject | 顶部 | 需单独设置 |  | ✔ |  |  |  |  |  |  |
| Export Statement | 顶部 | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Cancel | 顶部 | 需单独设置 | ✔ | ✔ | ✔ |  |  |  |  |  |
| Write Off | 顶部 | 需单独设置 |  |  | ✔ | ✔ |  |  |  |  |
| Confirm Paid | 顶部 | 需单独设置 |  |  | ✔ | ✔ | ✔ |  |  |  |
| Add Invoice | Invoice | 需单独设置 | 不展示该模块 | 不展示该模块 | ✔ | ✔ | ✔ |  |  |  |
| Add Payment | Payment | 需单独设置 | 不展示该模块 | 不展示该模块 | ✔ | ✔ | ✔ |  |  |  |
| Claim Detail | Billing info. | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Edit Miscellaneous Charge | Billing info. | 需单独设置 | ✔ | ✔ |  |  |  |  |  |  |
| Add Proof | Proof | 需单独设置 | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |
| Edit Amount | Waybill info. | 需单独设置 | ✔ | ✔ |  |  |  |  |  |  |

以Pending 状态为例的页面展示

以 partially paid  状态为例的页面展示

### 3.2.2 Claim Detail

逻辑参考AR Statement[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/776077313#3.1.2-Claim-Detail](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/776077313#3.1.2-Claim-Detail) ，页面信息 Customer Claim Amount 更新为Vendor Claim Amount

### 3.2.3 Edit Amount

单个金额校验

同AR对账单，一样，同样需对编辑结算金额的数值进行校验
- 对账单Waybill 模块，编辑金额时，当该金额输入框编辑后失焦需校验 其金额是否低于编辑前原金额，不允许**高**于原金额；（不允许多付）
- 若高于原金额，则回退至原金额，并提示：“Do not accept any amount**higher** than the settlement amount; please reject this waybill”
- AP对账单多一项Claim 列校验，展示逻辑为：若该运单Customer Claim 不为空，但Vendor Claim 为空，则标记展示 @UI

金额编辑证据

同AR对账单，同样需对编辑结算金额上传相关支持文件
- 当有编辑成功的金额，Confirm 时需上传相关支持文件，并保存至 **Proof**模块-【Settlement Amount Edit Supporting】,
- 该proof 类目【Settlement Amount Edit Supporting】，不允许删除与编辑
- 文件支持多文件格式（大小与具体格式与当前TMS保持一致即可）

### 3.2.4 Add Invoice

参考AR对账单[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/776077313/S30+Financial+Process+Update#3.1.4-Add-Invoice](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/776077313/S30+Financial+Process+Update#3.1.4-Add-Invoice) 弹窗样式，字段，基本逻辑均一致，不再赘述

### 3.2.5 Add Payment

参考AR对账单
- 添加收款记录弹窗与当前系统一致，无更新
- 收款逻辑有更新，confirm 收款之后，需增加收款总金额校验：
- 历次添加的付款总金额>应付金额（Total Amonut Payable) , 金额栏失焦后提示，confirm时需阻塞
- 历次添加的付款总金额=应付金额（Total Amonut Payable) ，confirm后，状态更新为 Fully Paid
- 历次添加的付款总金额<应付金额（Total Amonut Payable)  ,confirm后，状态更新为 Partially Paid
- Fully Paid， Partially Paid 状态点击Statement Detail 页头的 Confirm Paid, 状态更新为 Paid
- 需展示历次收款金额，收款时间及相关证据
- 收付款记录不允许删除，不可编辑
- 操作记录：xxx add payment

### 3.2.6 AP Statement List 增加筛选条件

参考AR list 增加是否编辑过结算金额项的筛选，不再赘述