61truedefaultlisttrue

在FA对系统的深入使用过程中，对系统的操作体验提出了更深入的需求，据此本期将主要对对账单模块进行相关优化

# Statement Update

## Reimbursement Expense

增加报销费用项目，用以描述运费之外产生的需报销的费用，该费用参考Claim ,不参与运单revenue，cost, gross profit 计算。故将其在运单中以独立模块呈现，以便和合同费用进行区分

其产生，结算逻辑参考Claim：
- 业务层面该费用产生由subtask 进行记录，
- 所生成报销费用同样需在运单层记录，
- 结算流程同在对账单选择该费用项进行结算，
- AR dashboard 统计需增加该报销费用项

### Reimbursement Expense Subtask

Subtask 需增加类型为Reimbursement Expense 的subtask

该类型子任务参考Claim,Additional charge，需增加自定义字段报销费用类型；
- PH：由于暂未确定报销类型，故均统称为报销费用：Reimburse Expense；同样分为客户侧与供应商侧 ：Customer Reimbursement Expense,Vendor Reimbursement Expense，类型为Customer charge 与Vendor charge. 默认+
- 同additional charge ,若报销金额不为0必须上传对应支持文件：Supporting File
- 需填写remark: 非必填，限制字数1000
- TH：报销类型 Advance Payment; 分为客户侧与供应商侧 ：Customer  Advance Payment,Vendor  Advance Payment，类型为Customer charge 与Vendor charge. 默认+
- 若报销金额额不为0必须上传对应支持文件：Supporting File
- 需填写remark: 非必填，限制字数1000
- 配置：操作流程填写报销费用金额（OCO 角色操作）；
- 审批流程（返回上一节点，拒绝，通过）
- 审批角色为OCD角色
- 由于搜集处理人需要一定时间，可能需要上线后一定时间才能进行相关配置
- 项目中的subtask config 暂定由业务侧自行进行配置
- 结果回写：PH/TH， Result 默认取：Reimbursable
- Result选项: Reimbursable  （可报销） , Non-reimbursable（不可报销）
- 若为Non-reimbursable（不可报销），则该子任务所有信息不写入运单  Add
- 当审批结果通过 Approve， 则将对应的报销费用写入运单，且状态为Verified
- 若结果为拒绝则丢弃该报销金额

### Reimbursement Expense in Waybill

运单增加 Reimburse Expense 模块，用以展示报销费用
- 该模块需单独配置权限，无权限不可查看
- Subtask 产生的报销费用金额分别计入Customer Reimbursement Expense 与 Vendor Reimbursement Expense
- 允许直接编辑报销费用：Edit Reimbursement Expense，该操作需设置权限
- 参考Additional Charge 弹窗权限，分为 金额编辑与状态权限切换控制， 权限点分别命名为 Amount Edit, Status Edit
- 允许编辑状态,下图示意为TH/PH 不同的object
-
- linked Statement 展示该结算项所关联的对账单，参考Claim ，不再赘述
- 同需单独设置按钮权限

### Reimbursement Expense in Statement
- 创建对账单时增加结算项目：Reimbursement Expense，其他展示结算项位置均需增加该结算项 （如：对账单详情，对账单列表）

注意：则运单完成结算（settled）的条件增加Reimbursement Expense 已结算的场景
- Statement--Waybill--Billed Amount--9/18 Add
- Billed Amount 中的 Reimbursement Expense 增加一列 Actual Reimbursement Expense （逻辑同basic amount等）
- 即 Reimbursement Expense 列进行显示运单中的报销金额，Actual Reimbursement Expense 则进行编辑，编辑后的金额不回写到运单，但dashboard 使用编辑后的值

以下内容，HotFix 已处理

说明：仅对关联运单的对账单生效，不包含独立对账单
- Biling --Others
- 增加Reimbursement Expense 项目，且Others 说明更新为： Others = Reimbursement Expense + Miscellaneous Charge + WHT + VAT (lf the statement does not include tax, then it is exclusive of VAT)
- Others 值增加报销费用项金额
- Waybill
- 增加Reimbursement Expense 列，置于**Customer Claim** **列**之后
- 与Claim一样，Reimbursement Expense 不影响VAT/WHT的值

### AR Dashboard
1. AR Overview
- Claim 列后增加Reimbursement Expense 列，金额展示对应报销费用金额
- 导出表同Claim 列后增加Reimbursement Expense 列，金额展示对应报销费用金额   Add
- Amount 更新为Amount = Contract Revenue + Miscellaneous Charge + Claim +Reimbursement Expense+ VAT + WHT
- AR Overview 标题说明文案更新为：Amount = Contract Revenue + Miscellaneous Charge + Claim +Reimbursement Expense+ VAT + WHT
- 新增的 Reimbursement Expense 实收分配顺序更新：  Add
原逻辑：WHT**→**Claim**→ VAT → Basic Amount → Additional Charge → Exception Fee → Miscellaneous Charge**
**新逻辑：**WHT**→**Claim**→ Reimbursement Expense -> VAT → Basic Amount → Additional Charge → Exception Fee → Miscellaneous Charge**
- TH侧中的VAT 和WHT ，原逻辑由于TH侧税率需关联对账单后才知道，故Under billing preparation 税额为Without Tax rate（如下图）, 但S36后，TH侧所有税率根据车型已明确，故此处应更新为按运单实际税率计算
- 注意：按照billed truck type 计算税率
1. AR Breakdown
- 所有的Amount 均需加上 Reimbursement Expense

## Statement--Remove/add  Waybill

允许对账单在Under Payment/Billing Preparation  + Awaiting Vendor/Customer Confirmation 状态进行添加运单/解绑已有运单
- waybill 模块新增Associated Waybill 操作
- 点击跳转至Associated Waybill 页面
- 该按钮需单独配置权限

Associated Waybill 页面执行运单添加/解绑操作
- 该页面所有运单不分页，若数据较多，可进行分步加载
- 添加waybill，点击Add Waybill, 弹窗填写需添加的 Waybill No.  / customer code
- 该行填写完毕需校验所添加的运单 是否在该 vendor(AP), Customer(AR) 或所选项目下，是否在所选对账周期内，且该运单是否为Awaiting settlement 状态
- 如果不符合以上条件，则标红该行并分别提示为：**The waybill is not associated with current customer   / Vendor , The waybill is not associated with selected projects**，**The waybill is not  within selected  Reconciliation Period   , Waybill status is not 'Awaiting Settlement**
- Remove waybill, 则在页面进行选择后，点击Remove, 则从对账单移除该运单，被移除运单与对账单取消关联关系
- 移除运单若为所添加Claim 的唯一 Vendor(AR) 或唯一Cusotmer (AP), 则需进行提示，**Removing this waybill will cause the system to remove the Claim where this vendor is the Responsible Party.**
- 若确认移除运单，则需删除所添加的 Responsible Party 为该Vendor (AR)的 Claim , 或Claiment 为该Cusotmer (AP) 的Claim
- 移除需进行二次确认，弹窗**“Whether to remove the selected 24 waybills”** （24为所选运单数量）

## Invoice/收付款记录 添加日期

### 添加发票更新
- 每组发票号需填写对应发票日期
- 该发票日期同时展示于发票详情，展示方式@UI
- 发票日期需导出（见后需求）

添加收款/付款记录更新
- 该收据号与日期同样需展示于收款详情
- AP中的付款记录一致，文案为：Payment Voucher date/Payment Voucher number
- 同样需导出（见后需求）

### 导出对账单更新
- 增加 导出 Invoice Number and Date	，Receipt Voucher Number and Date（Payment Voucher Number and Date）字段
- Waybill 模块增加导出 Route Code，Reimbursement Expense，origin label/destination label字段
- 可参考该表 [https://docs.google.com/spreadsheets/d/1kokNvVe7ua0d7u6kd8wUyOqQxX63EqaifOaFp-vOBu4/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1kokNvVe7ua0d7u6kd8wUyOqQxX63EqaifOaFp-vOBu4/edit?gid=0#gid=0)

# Others

补充一些其他类型的小型需求

## Waybill 搜索

参考Pricing Check 增加 waybill list --Project Name的正选/反选功能，默认为正选
- 搜索框宽度需前端和UI 确认

## Crew增加认证材料类型

Crew--Accreditation新增类型：**Recent Personal Photo** ，

顺序至于当前材料首位，为必填项

历史数据处理：存量Crew不进行处理，但编辑Crew 时则校验所有必填字段

## AR/AP Statement 展示关联 Project
1. 详情页基础信息部分，增加 Project 字段，显示 Project Name
2. 列表页增加 Project Name 字段，位置在 Customer/Vendor Name 后面
1. 列表筛选项增加 Project Name
3. 列表字段顺序调整
1. Settlement Item：调整到 Project Name 字段后面
2. Invoice Number：调整到 Creation Time 字段前面
4. 详情页和列表页中结算项展示：逗号分隔符后面，增加空格

## Customer/Vendor 详情页增加 Trip 统计

Customer/Vendor 详情页的基础信息表格最后，增加一列，展示以下信息：
1. First Delivery Date，以 Confirm Delivery 操作时间为准
1. 格式：`yyyy-mm-dd (K years M months N days ago)`
2. Latest Delivery Date，以 Confirm Delivery 操作时间为准
1. 格式：同上
3. Total Trips
1. 格式：M (N ongoing)，M 统计除了 Canceled 状态的属于该 Customer/Vendor 的所有 waybill 数量，N 只包括其中 Planning、Pending 和 In Transit 状态的 waybill 数量。

# Hotfix 需求

## UAM - SSO 支持系统多开
1. SSO 当前只支持同时访问一个系统（且使用同一角色），且直接访问其他系统的链接时，会重定向到 403 页面，然后用户点击进入角色选择页，进而访问不同系统。
1. 支持系统多开，角色切换后新开 tab 页访问对应角色和对应系统
2. 多个 tab 页可以同时操作多个角色和对应系统，不再需要来回切换
3. 直接访问 SSO 范围内不同系统链接时，
1. 存在对应 UAM BU 的上一次访问角色或者该 UAM BU 下用户只有一个角色，且该角色还存在，用该角色直接打开
2. 其他情况，重定向到 403 页面
2. 角色切换UI优化，包括两个地方：系统右上角切换角色，Change Role 页面
1. 增大窗口宽度，每个系统占一列。窗口能够一目了然，减少滚动操作。

## Statement 导出

对账单列表增加导出功能，按钮位置如下图示意

允许导出筛选出的对账单列表，下载任务同在下载中心进行查看。 下载文件名格式为： AR/AP+YYMMDD+3位SN+1位随机码    如下载ARstatment 即为 AR251022001K

导出样表：[https://docs.google.com/spreadsheets/d/1imAe0Re42LVCWqmOF_hZhkIUttuhnJ3jACqR9s7Fe4Y/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1imAe0Re42LVCWqmOF_hZhkIUttuhnJ3jACqR9s7Fe4Y/edit?usp=sharing)

## 其他优化

### waybill 详情页
1. 基础信息，Customers 字段名改为：Customer。同时，支持点击跳转，同 Project 字段效果。
2. Waybill Billing 展示结算车型
1. remark 增加创建人信息：remark 信息卡片上展示添加人
1. 格式：`Added_by: xxxx (yyyy)`，xxxx 是 nick_name，yyyy 是 user_role
2. 位置：Time 信息上方
1. Route 信息增加Label展示

如下图所示，Route 增加展示 Origin Label  与Destination Label , 具体展示位置与宽度需 UI 确认 ，若该位置无 label ，则展示 “-”

### waybill 导出更新
1. waybill 列表页的 waybill 导出：remark 字段，更新为两列（Remark-Type 与 Remark-Description）,将当前remark 中的Type 与 Description分开展示。
- 若为多条Remark，需分行展示，每行展示该remark 及对应description
- 不处理历史数据
2. 增加字段：Customer,Vendor Reimbursement, 展示对应的报销费用
3. 导出增加字段（位置在最后四列） :Linked AR Statement and Status,Linked AP Statement and Status
- 展示该运单所关联的所有对账单， AR和AP 分别列出，并展示对账单状态
- 一个对账单一行，同一行的AR和AP 无对应关系
- [https://docs.google.com/spreadsheets/d/146vet6TbxCQ91Z6fWPfM4uY1O3gsUtSD/edit?gid=548491550#gid=548491550](https://docs.google.com/spreadsheets/d/146vet6TbxCQ91Z6fWPfM4uY1O3gsUtSD/edit?gid=548491550#gid=548491550)
4. 金额格式统一
- 以下字段的金额，均右对齐，保留两位小数

| Customer Total Amount | Basic Amount Receivable | Customer Additional Charge | Customer Exception Fee | Customer Claim | Customer Reimbursement | Vendor Total Amount | Vendor Paid In advance | Vendor Basic Amount Payable (Remaining) | Vendor Additional Charge | Vendor Exception Fee | Vendor Claim | Vendor Reimbursement |

1. 前端自定义导出列（优先级不高，时间足够可做。）
- 点击导出运单下拉按钮，展示Custom Export Fields，点击 Custom Export Fields , 展示字段弹窗
- 所有运单导出按钮均增加该下拉（包括 导出所有，导出全部，项目列表处导出及运单列表处导出）
- 设置后将保存该设置，账号每次导出均适用
- 初始配置默认全字段
- 允许全选，点击全选后，允许取消全选
- 允许按信息组进行全选及取消全选
- 其中 Finacial 信息中的  billing 金额，Claim 金额， 及**Reimbursement Expense** 金额依然需按照 运单页面权限进行控制，即无该模块权限，则不展示对应金额字段 。
- 如: 无Claim 模块权限，则该弹窗不展示 Vendor Claim 及 Customer Claim 字段。 默认不导出该字段 （由于临调和标准运单 两份权限，故该字段取或关系，有任意一种运单权限，则展示，只是通过导出金额权限控制不展示无权限类型运单的相关金额） 补充
- 无 该模块查看金额权限，则弹窗展示对应字段，但导出金额为 ”**”
- 增加运单导出时的金额查看权限：分为标准运单和临调运单两份的权限点控制： standardWaybillExportViewAmount    temporaryWaybillExportViewAmount   update
- @ UI， 可灵活调整字段组顺序，以便达成较易看的效果
- 其中Basic Info --Waybill NO. 必选,不可取消---add
- 其他模块相关信息暂不做必选

1. 在以上基础上导出数据增加 **Customer Miscellaneous Charge , 与Vendor Miscellaneous Charge** ,该数据源从Collected / Write off AR    和 Paid / Write off  AP Statement 中获取  Add
1. 导出表加至 Customer Reim 与Vendor Reim 后列
2. 字段选取弹窗同样加至Financial Info. 中的 Customer Reim 与Vendor Reim 后
3. 若该运单管关联多个终态对账单中均填写了杂费项目，则将所有杂费相加
4. 该字段权限与billing 一样即可
2. 其他结算项在导出 时，根据结算项所关联的对账单状态，若对账单状态为 write off 和 paid /collected 状态， 则 导出的 所有费用项均从 对账单取其actual 的值   Add
1. 备注：Customer / Vendor Total Amount 可删除该两个字段，计算上担心误会

| Basic Amount Receivable | Customer Additional Charge | Customer Exception Fee | Customer Claim | Customer Reimbursement | Vendor Paid In advance | Vendor Basic Amount Payable (Remaining) | Vendor Additional Charge | Vendor Exception Fee | Vendor Claim | Vendor Reimbursement |

### Statement--Invoice 优化

Add

添加发票号禁止填写特殊符号，仅允许填写数字，字母，否则外框标红并提示“Only one invoice number can be entered at a time. Only numbers and letters are supported. Special characters are not allowed.”

历史数据暂不处理

### AR/AP Statement 关联 Project 的展示 UI 优化

见设计稿