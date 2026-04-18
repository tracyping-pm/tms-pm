61truedefaultlisttrue
# Procurement相关更新

## Procurement Mgmt-- Application 增加数据权限控制

Application 需增加按申请的供应商（Applicant)的所属PIC进行数据权限控制

根据角色数据权限控制其可见的供应商申请数据：如角色数据权限为仅userRole  Only, 则仅允许查看 自己为Vendor PIC 的供应商申请数据

## 增加消息提醒

| 触发动作 | 接收方 | 通知 |
| 供应商提交申请

Add Procurement Application | 对应供应商 Vendor PIC | TMS内部通知, Slack通知

xxx （Applicant submitted an application **Application No.**（按钮，跳转项目详情链接） |

## 增加文件历史版本

涉及范围：TMS：Crew, Truck, Vendor 的所有Accreditation文件

样式：如下图，点击历史，浮窗展示历史版本，逆序展示（最新最前），历史版本不展示当前

每次被供应商上传并通过/ TMS上传则记作一个版本（不管为修改/新增，按修改时间记录）

需记录文件上传人，供应商名/TMS上传人昵称

历史数据需处理：仅处理driver license 及**Valid Primary ID**，根据原历史被删除文件的状态确认展示形式（暂定所有被删除文件认为一个版本）

## Crew 增加历史状态变更记录
1. 如下图，Crew增加状态变更记录
- 展示内容：时间，操作人昵称，当前状态，状态变更原因（包括Proof）
- 历史数据不处理
2. Deactivate Crew 二次确认弹窗增加原因填写
- Reason: 必填，限制2000字符
- Proof 非必填，不限制张数, 大小限制总200M以内
3. Activate Crew 同增加原因
- 由于Activate Crew 还有前序校验（如文件是否齐全等），填写原因弹窗则在所有校验通过后，进行弹窗，（参考deactivate 样式）
- Activate 弹窗所有字段均非必填，主按钮文案为 Activate

## 非认证状态Vendor操作更新

原逻辑: 非认证状态供应商仅允许进行供应商进行供应商申请相关操作（原逻辑 ），现取消该限制；跳转逻辑保持

即非认证状态供应商允许添加所有类型申请，允许查看Trucks 及 Crew 菜单

# 财务相关更新

## 税率更新(TH)
由于TH侧税率与车型，费用类型均有关联关系，原通过发票设置税率覆盖面有限，考虑到不断增加的费用类型，故优化为扩展性更强的方案以解决该问题
### 增加税率设置菜单

该菜单仅TH展示，PH侧不展示

权限：拥有该菜单权限则允许查看所有数据，Edit 权限需单独管理

初始数据：展示所有TH车型，税率均置为空，涉及的TH侧对账单均不处理，由业务侧自行处理历史对账单

筛选条件：Truck Type(多选，默认空则为全部车型），Item( 所有结算项，多选），Status（ Enablement，Disablement）

Item 枚举值为所有基础费用与additional charge小项，exception fee 具体如下：
- Basic Amount
Extra rate

Waiting fee

Demurrage

Overtime fee

Drop fee

Manpower fee

Cancellation fee

Backhaul / Return

Overnight charge

Chassis overnight charge (for trailer)

Transportation fee to get back the chassis (for trailer)
- 每个费用项都分为Customer 与Vendor 侧两类，其税率一致，如：Extra rate 税率为1%， 则customer additional charge 中的Extra rate 税率为1%，Vendor additional charge 中的Extra rate 税率也为1%
- Basic Amount 对应Vendor 侧为Paid in advanve 与 Basic Amount Payable (Remaining)
- Exception fee TH暂时未用到
- 表头所有Item 均增加（VAT，WHT），展示该车型该Item 的VAT 和WHT

### Edit TaxRate

@ UI ，按照UI建议，不使用弹窗编辑，而在页面进行编辑，此处不再示意

允许任意税率为空，若状态为Enablement ，则为可用状态，否则为不可用状态，不可用则该对应 Item  不计算税额

### 运单billing 模块更新
- 展示影响：
- Billing 展示对应结算项VAT 及WHT ，若税率为空，则该税额展示 “—”
- 数字展示右对齐
- 税额不参与毛利，毛利率计算，计算方式与原来一致
- 历史数据处理：展示形式均按照最新形式进行展示【TH+PH】，税额部分展示为“—”，当触发价格计算时，进行税额计算并展示
- TH：计算用该运单计费车型与对应Item 税率进行税额计算
- PH 侧税额与原来一致，用固定税率计算
- 运单税额保留4位小数，在对账单里则汇总后保留2位小数
- TH：Additional Charge  Object 枚举更新，如下
- Extra rate

Waiting fee

Demurrage

Overtime fee

Drop fee

Manpower fee

Cancellation fee

Backhaul / Return

Overnight charge

Chassis overnight charge (for trailer)

Transportation fee to get back the chassis (for trailer)
- TH侧该枚举影响项目运单价格批量更新，需将批量价格更新模板中的Additional Charge （收/付）均更新为当前的枚举值
- PH 则保持原枚举值如下（收/付）：
- Demurrage，Addtl Drop，Boom Truck，Manpower，Backload
- TH+PH： Edit Additional Charge 交互配合更新：
- Object 原为自行填写，更新为单选，选项则为不同国家各自的枚举
- 历史数据处理：TH侧 Additional Charge 若有原自定义的 charge Object , 保持不变；
- 若为可编辑状态，编辑时，原自定义object 则不再允许编辑，通过开发进行处理
- 允许编辑，但只允许选取新的枚举值  update

### 对账单相关更新（AR+AP）
- 添加发票（Add Invoice）TH 侧不再填写税率，与PH侧保持一致（如下图）
- TH 历史非终态对账单 ：可编辑发票的状态则均采用新逻辑不填写税率的逻辑，不可编辑发票的状态则由 @PM团队 Push业务在上线之前终结或取消相关对账单
- 运单模块关联发票不再影响税额，税额金额取**该对账单所结算项目**在运单中税额的汇总，如该对账单结算项为，**Basic Amount Receivable**， 则税额仅展示**Basic Amount Receivable** 的税额（TH+PH）
- VAT 与WHT 字段增加说明文案（PH+TH）：Only display the tax amount of the settlement items in this Statement.
- Billing info. 模块增加 Additional Charge Detai 按钮, 点击展示每条运单的 Additional Charge 项目与值（参考Claim Detail）（TH+PH）
- 注意PH,TH Additional Charge 项目不一样
- 历史数据不处理  更新
- billing 模块税额计算，同原逻辑, 只是税率不再从发票取而根据TH 的车型，项目取，其中杂费项目（Miscellaneous Charge）由于可能的项目未知，所以未进行税率设置，这里也无需对该项目进行税额计算
- 增加说明文案（PH+TH）：
- AR:   Customer Reject,    AP: Vendor Reject 操作增加说明文案：
- Customer Reject ：If rejected, the statement status will be updated to "Awaiting Re-bill”
- AP-Awaiting Vendor Confirmation状态下的  Reject ：If rejected, the statement status will be updated to "Awaiting Re-bill”
- Cancel:  If canceled, the statement status will be updated to "canceled" , and all associated waybills will be disassociated from the Statement and return to "Awaiting Settlement" status.

## Subtask 更新

### 字段更新

增加Additional Charge Type （仅TH使用, 命名为 Additional Charge Object），原Additional Charge Type 不变，TH使用的更新枚举值
- Additional Charge Type 中的枚举值更新为以下，
- Extra rate

Waiting fee

Demurrage

Overtime fee

Drop fee

Manpower fee

Cancellation fee

Backhaul / Return

Overnight charge

Chassis overnight charge (for trailer)

Transportation fee to get back the chassis (for trailer)
- Customer Additional Charge Type, 与Vendor Additional Charge Type 在以上枚举值加对应前缀Customer /Vendor
- 补充：不增加Customer /Vendor前缀，且删除原前缀（需处理历史数据，考虑自动生成的subtask 无法避免，上线后一周需再处理一次历史数据，将有/无 前缀的 费用项目进行合并）  add
- 配置注意：请把Vendor Additional Charge Type 放置在Customer Additional Charge Type 之前
- 审核方更新为Pricing 所有人
- 历史数据处理：TH侧已生成的在途子任务不做处理，需对新生成的子任务进行字段更新（模板上的字段直接更新为新字段）

# 交互更新

## 文件上传交互更新

Waybill--POD 模块文件上传交互更新

更新为点击弹窗内confirm 后，开始上传，上传进度在页面进行展示

取消文件缩略图展示，具体参考UI设计

若有余力，希望Vendor 相关（TMS：Crew, Truck, Vendor 的所有Accreditation文件 及VP侧 上传Crew, Truck, Vendor 的所有Accreditation文件 ）均采用此种交互

## 文案更新
1. Create Opportunity 时 Pricing PIC，Procurement PIC 选项中的 所有 admin 角色排序均排至最后
- 多个admin的排序则按姓名首字母正序
2. Pricing PIC 更新文案为：Strategy PIC
- 历史Opportunity 中Vendor PIC 文案需更新为Procurement PIC ，Pricing PIC文案需更新为Strategy PIC
- project--Team member
- Vendor PIC 文案需更新为Procurement PIC, 历史数据进行同样处理
- Pricing PIC 更新为Strategy PIC，并增加 Rates PIC（允许不填，历史数据置为空）
- 历史数据处理：原Pricing PIC 均处理为Strategy PIC
- Rates PIC与Strategy PIC 的权限，选取逻辑均与原Pricing PIC 保持一致
- Assign Team member时，Admin  角色排序均排至最后
- 多个admin的排序则按姓名首字母正序
3. Statement 对账单状态文案更新
- AR Statement:  Not Collected 更新为 Pending Collection
- AP Statement:  Not Paid 更新为 Pending Payment
- 历史对账单状态，对账单状态变更记录需进行同步处理

## 相关时间记录

考虑后续相关PIC KPI统计需求，需进行以下时间记录
1. 记录 Customer Transfer 及Create 时间及对应时间的 BD PIC/ CAM PIC
- 如2020-1-1 10:00 创建了A客户，BD为a,  2021-1-1 10:00 A客户被转移给了BD b
- 后续统计2020 KPI ，则a 客户+1， 2021KPI ，则为b 的客户+1
- 页面展示：BD/CAM 字段增加说明展示历史记录，如下图：
1. 记录Project 中 Team members 加入及更新时间(格式参考1）
1. 仅展示在oprearation log里即可
2. 历史数据无需处理

## Route Library列表更新

列表增加字段：
1. No. of Routes（路线条数）:展示该route lib下所有Approved 状态的路线条数
2. No. of Customer PV (Active/ Total)（有效客户价格版本数/总数）：展示该RL下 有效的客户价格版本数量与总的客户价格版本数量，用“/” 分隔开 ，如 5 / 100
3. No. of Vendor PV (Active/ Total/ )（有效供应商价格版本数/总数）：同客户加个版本一样，展示为10 / 100

考虑列表加载性能，可每日凌晨刷新相关数据

历史RL 均需按新规则进行相关展示

## Tool --waybill automation 更新
- 运单列表中的 Update Waybills （更新运单信息）挪到waybill automation 中，且适用范围更新为Shopee and Flash 两个客户的所有项目（同Confirm Verification
- 若非该两个客户得项目，则跳过该条数据（ 并提示“非Shopee and Flash运单”）
- sync results 增加 Update Waybills 结果
- 原update waybill 弹窗删除  Update Waybills 操作
- 

# Hotfix 内容

## 1. Pricing Check
- 增加列表字段：Unloading / Abnomal Time ,Delivered 运单展示 最后一次Unloading time, Abnomal 运单展示Abnomal Time,  位置在Position time 之后
- 筛选条件： 增加 Customer Total Amount、Vendor Total Amount、Gross Margin， Wabyll No.
- Customer Total Amount、Vendor Total Amount、Gross Margin 均为范围搜索，允许只输入任意一侧值，若只输入左侧，则搜索大于大于该数值，反之（仅输入右侧）亦然
- 同时填写搜索闭区间
- 允许输入负数，支持输入小数（两位小数）
- 增加导出功能，允许导出该页筛选后数据，字段为增加字段后的所有列表字段。
- 导出文件至下载中心
- 文件名为 Pricing Check YYMMDDHHMM 如：“Pricing Check 2508141544”
- 增加批量 Confirm功能
- 该按钮需单独控制权限
- 选择运单后进行价格批量确认（交互可参考waybill list,批量submit 操作），无需二次确认
- 未选中运单时，置灰不可操作
- 操作中时，需锁定页面状态操作
- 提交后显示全局遮罩层 + 进度条
- 禁用其他页面操作直到结果返回
- 若中途运单状态被其他用户修改,则跳过该运单
- 关闭页面，不影响操作持续进行，若未完成操作，该账户进入则依然展示遮罩层与进度
- 若已完成操作（则下一次进入时，展示结果弹窗）
- 被成功操作的数据从列表移除
- 被成功确认的数据同样需纪录操作日志至该运单（与页面操作日志内容一致）
- 补充：若状态为不可操作的状态，单个操作时提示：“`The waybill has been confirmed`”    add
- 批量操作时不可操作的状态，忽略即可

## 2. Waybill Confirm Delivery
- Waybill Automation --增加  Confirm Delivery ，针对 Shopee and Flash 客户所有项目可用
- 为避免识别问题，对不同操作范围的按钮进行分组识别（原型仅示意，具体参考UI设计），均单独配置权限，与其他操作一致
- 表格模板：[https://docs.google.com/spreadsheets/d/1rkMz0JZVNDd9TGTBtdyWtQnO2YRgT26q8mK2sT1ZSw4/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1rkMz0JZVNDd9TGTBtdyWtQnO2YRgT26q8mK2sT1ZSw4/edit?usp=sharing)  ，多人打开仅用同一张表进行操作
- 被操作运单仅允许in transit  被更新为下一状态（Delivered）,否则失败原因为：**Incorrect Waybill Status**
- 运单客户必须为Shopee, Flash(SHOPEE**(THAILAND) COMPANY LIMIT, Flash Express (Thailand) Co. Ltd.) ,**否则失败原因为：**Incorrect Customer**
- 其他confirm 需校验信息正常校验，如POD 文件是否上传，价格信息是否完整等，任何信息缺失，则提示 “Lack of xx information” ,xx= route/carrier/price….
- 一行失败不影响其他行操作，整表完成前端同步按钮需展示完成状态
- 交互不再赘述，参考S34 ，批量确认POD一致S35(运单批量操作)

## 3. Reimbursement Expense
由于业务需求需填写报销费用，实际系统使用中将 billed Amount 编辑中的杂费项目用于 报销费用填写，但报销费用实际不含税，而杂费将计算其税费。为满足实际需求，新增该临时需求。- AR/AP Statement --waybill  模块新增 Reimbursement Expense 字段：位于 **Claim** **列**后
- Billed Amount 页 同新增字段 Reimbursement Expense 字段，位于 Billed Amount 列后 （参考下图）
- 新增 Edit  Reimbursement Expense 按钮，原Edit 控制不变, Edit  Reimbursement Expense 则仅允许编辑新字段 Reimbursement Expense
- 若编辑了 Reimbursement Expense ，同样需在Discrepancy 列填写对应Proof
- Reimbursement Expense 金额不参与billed Amount 金额计算。编辑完后展示在AR/AP Statement --waybill  模块新增的 Reimbursement Expense 列
- 数据处理：原在对账单--billed amount edit 中编辑产生的杂费金额则无需处理
- Reimbursement Expense 在 AR dashboard 中的呈现暂不处理（新S37将会处理）
- AR/AP Statement --waybill  模块新增说明 **Billed Amount (VAT-in) = Billed Amount (VAT-ex)+VAT**
- AR/AP Statement--Biling --Others
- 增加Reimbursement Expense 项目，且Others 说明更新为： Others = Reimbursement Expense + Miscellaneous Charge + WHT + VAT (lf the statement does not include tax, then it is exclusive of VAT)
- Others 值增加报销费用项金额