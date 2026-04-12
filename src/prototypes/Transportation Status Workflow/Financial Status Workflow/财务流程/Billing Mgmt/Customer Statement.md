16falsenonelisttrue
Customer Statement 为客户对账单，用以展示与客户间的款项明细，满足客户与FA部门对账及统计的需求；对账单将提供一些结算所需的信息，如向客户提供的服务列表、提供的服务收取的费用、统计周期等。

# 1. Customer Statement 状态流转

**状态说明：**
- “Pending”（未确认）：生成结算单未确认，允许取消, 确认后进入Awaiting Customer Confirmation状态
- “Awaiting Customer Confirmation”（待客户确认）：等待客户确认，允许取消与退回上个状态
- "Pending Receivable"（待收款） ：客户已确认，待收款；允许取消
- "Partially Received"（部分收到）：该笔结算单已收到部分应收费用，并未完成收齐；
- "Received"（已收到）：该笔结算单已收齐应收费用，允许多收，手动更新至该状态
- "Written Off"（冲销）：该笔结算单不再进行结算，允许Pending Receivable或Partially received 操作为该状态
- "Canceled"（已取消）：该状态需 取消运单与结算单的关联关系

# 2. Statement List

### 2.1 搜索区域

搜索区域允许用户根据多种参数来筛选客户对账单。以下是各字段及其对应的行为：

| Field Name | 类型 | 搜索逻辑 |
| Customer Name | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果。 |
| Statement Status | 下拉选择 | 默认选择“所有状态”，支持多选。 |
| Creation Time | 时间选择器 | 允许用户选择对账单创建日期的时间范围。 |
| Statement Number | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果。 |
| Invoice Number | 输入框 | like 搜索，输入2个及以上字符时进行匹配，并刷新列表结果（待与开发确认），与其他筛选条件取交集 |

- **搜索按钮（Search）**: 根据以上条件进行搜索。
- **重置按钮（Reset）**: 清除所有搜索条件。

### 2.2 列表区域

列表展示了符合搜索条件的所有客户对账单。每个对账单的每一行包含以下字段：

| Field Name | 描述 |
| Statement Number | 客户对账单的唯一标识符。生成逻辑：PH/TH（国别简称）+CS+yy-mm-dd+2位流水号（该国自增） |
| Customer Name | 客户的名称（例如：Coca-Cola Bottlers Philippines Inc.）。 |
| Invoice Number | 与该对账单关联的发票编号。有可能一个对账单多张发票，在列表中换行展示 |
| Status | 对账单的当前状态（例如：Pending, Awaiting Customer Confirmation, Pending Receivable, Partially Received, Received, Written Off, Canceled）。 |
| Total Amount Receivable | 客户对账单的应付总金额。 |
| Amount Received | 已收到的金额。 |
| Outstanding Amount | 客户仍需支付的金额。(Total Amount Receivable - Amount Received) ,若超收，则展示实际超收金额（负数） |
| Reconciliation Period | 对账单的统计周期。 |
| Creation Time |  |
| Operate | “Details”按钮，用户点击后可以查看详情。 |

- 用户可以通过点击列表视图右上角的”Add Statement”按钮去创建新的对账单。

### 2.3 排序
- 列表默认按 1. Status 状态进行排列，顺序为：Pending, Awaiting Customer Confirmation, Pending Receivable, Partially Received, Written Off, Received, Canceled     2.更新时间进行降序排列，即更晚更新的排更前。
- 允许用户可以点击“Outstanding Amount”列的标题在本页来按升序或降序排列。
- 分页参考当前waybill list分页样式

# 3. Add Statement
- 添加对账单有两种情况1. 不基于运单，2 需基于运单, 分别生成对账单，无需基于运单，则waybill Selection时，不进行相关选择即可

该功能用以为客户生成对账单。可以筛选运单，选择需要包含在对账单中的运单，最终生成该客户的对账单。生成过程包括基本设定（客户信息、统计区间、项目选择）和基于运单细节的运单筛选。

---

### 3.1 不基于运单

不基于运单生成对账单，将 Is statement  based on waybill= No , 无需基于运单生成对账单，无需进行运单相关信息的填写

运单详情展示：

不基于运单，则填写完基础信息可生成相应对账单；生成成功后进入对账单详情

### 3.2 基于运单

若Is statement  based on waybill =Yes ，则对账单需要基于运单生成；

#### 1.基本设定

Billed Project：必填，选择了相应项目，则运单加载需根据 所选项目，对应时间区间进行展示

- **Customer Name (客户名称)**: 选择需要生成对账单的客户（单选），输入两个字母后开始模糊匹配并展示匹配内容。
- **结算周期（Reconciliation Period）：**允许用户通过选择起止时间来定义对账单的结算周期。 到时间点（YYMMDD HHMMSS）, 默认为空 （最好时间选择插件可以快速选本月，上月）
- **Settlement Time Type （结算周期时间类型）：**用户选择结算周期的运单筛选类型，可选项为 (Position Time,Delivery Time,Unloading Time), 默认为空
- **Items To Be Settled  (结算项)：**多选，所展示运单需过滤掉该结算项已关联客户对账单的运单（举例说明：运单1 的Customer Basic Amount 已关联A对账单，若B对账单结算项仅有Customer Basic Amount ，则运单1需被过滤掉，否则展示运单1，**仅该运单所有结算项均为终态（written Off 、settled），该运单财务状态进行更新**），默认不选中
- **Customer Tax Mark (客户税务标记)**: 展示项，用于展示该客户税务标志，当客户税务标记发生变更，历史已生成的对账单该标志展示原状态；
- **Is the Settlement Tax-inclusive（对账单是否含税）：**单选，选择是否含税，会影响后续对账单出账计算；默认与客户税务标记一致
- **Billed Project (结算项目)**: 展示该客户所有In Progress，Suspended，Terminated，Completed,Canceled 状态项目，允许多选；按项目状态顺序展示： in progress, suspended，Completed,Terminated,Canceled, 若状态一致，按项目名字母排序
- **按钮：下一步（Next）,** 进入运单选择步骤。
- 需校验是否所有必填项已有值，否则页面标识该空值/非法值，并提示“Please enter  the correct value”

#### **2. 运单选择**

该页面提供运单筛选和选择功能，用户可以选择需要包含在对账单中的运单，并生成最终的对账单。当对账单需 基于运单计算，则该对账单需选择对应的运单

- 进入页面根据Basic setting 所选择项目及对账周期内展示对应财务状态为 Awaiting Settlement 且有未关联其他对账单的结算项 的运单，允许根据筛选条件进行二次筛选
- 运单无任何可结算项不展示
- 运单W中不可结算的结算项A在运单层更新状态（如被其他对账单释放，On hold更新状态至verified等），在W已关联的对账单中不刷新该结算项A的状态； 除非W被对账单释放
- **Waybill Number (运单编号)，Customer Code ，Positon Time, Unloading Time ，Delivery Time** 进行筛选
- 已关联其他对账单的结算项需做区别展示（@UI）
- 如果筛选条件下无匹配的运单，则不展示运单列表，展示提示：【There are no matching waybills. Please update your filter .】
- 页面展示所有符合条件的运单数及被选中的运单数
- 点击全选，选中所有筛选出的项（所有数据，不止本页数据）；

筛选后的运单列表展示在表格中，字段如下：

| Column Name (列名) | Description (描述) |
| Waybill Number | (运单编号) |
| Customer Code | 展示该运单所有客户编码，Type+code, 换行展示 |
| Position Time |  |
| Unloading Time | shipping record中最后一次Unloading Time |
| Delivery Time |  |
| Total Amount Receivable |  |
| Basic amount receivable | 基础费用，已关联其他对账单或不结算需区别展示 |
| Additional Amount Receivable | 无此项展示-, 已关联其他对账单或不结算需区别展示 |
| Customer Exception Fee | 无此项展示-, 已关联其他对账单或不结算需区别展示 |
| Customer Claim | 无此项展示-, 已关联其他对账单或不结算需区别展示 |
| Settlement Amount（Tax-in） | 该运单待结算项总额（含税） |
| Settlement Amount（Tax-ex） | 该运单待结算项总额（不含税） |
| Billing Truck Type | 运单中结算的车辆类型 |
| Plate Number | 卡车的车牌号码。 |
| Origin | 三级地址+详细地址拼接 |
| Destination (目的地位置) | 三级地址+详细地址拼接 |
| Number of Drops | 下货点数量，已有逻辑，该运单destination 数量+stop points  数量 |
| Remarks | 如有多条换行展示，需UI设定宽度，无法展示完全部分“…”代替，hover时浮窗展示 |
| Details | 点击跳转至该运单详情页 |

**排序**: 运单列表默认按Delivery Time正序排列，即最早的排最前。分页延用waybill list 插件

### 3.3 生成对账单
- **Generate ：**点击该按钮生成对账单。
- **对账单编号生成逻辑**: 对账单编号自动生成，格式为 “PH/TH +CS+ YYMMDD + 2位流水号（该国当日自增）"
- **Previous ：**允许跳转至上一步，不进行二次确认，不保留当前页面所选择内容。
- 不基于运单生成的对账单，则无该按钮
- 创建成功后，跳转至对账单详情页面，展示生成的对账单内容。

# 4.Statement Detail

## 1. Pending

Written Off，Partially received， Received, Cancelled 详情与上面一致，仅操作不同，不再示意；

Cancelled取消对账单与运单的关联关系，但依然展示原关联运单，需记录其历史版本

其中各状态所允许操作如下：

| 状态 | Confirm | Customer Confirm | Edit Invoice | Settlement Items | Edit Charge | Edit Waybill | Enter Receipt | Rexeipt History | Export Statement | Write Off | Cancel | Reject | Confirm Received | Add Proof | Operation Log | Edit Amount |
| 按钮模块 | 顶部 | 顶部 | 顶部 | Basic info. | Billing info. | Waybill  info. | 顶部 | 顶部 | 顶部 | 顶部 | 顶部 | 顶部 | 顶部 | Proof | 顶部 | Waybill  info. |
| 按钮权限说明 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 跟随页面权限 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 跟随页面权限 | 需单独设置 |
| Pending | ✔ |  | ✔ | ✔ | ✔ | ✔ |  |  |  |  | ✔ |  |  | ✔ | ✔ | ✔ |
| Awaiting Confirmation |  | ✔ |  |  |  |  |  |  | ✔ |  | ✔ | ✔ |  | ✔ | ✔ |  |
| Pending Receivable |  |  | ✔ |  |  |  | ✔ | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ | ✔ |  |
| Partially received |  |  | ✔ |  |  |  | ✔ | ✔ | ✔ | ✔ |  |  | ✔ | ✔ | ✔ |  |
| Written Off |  |  |  |  |  |  |  | ✔ | ✔ |  |  |  |  |  | ✔ |  |
| Received |  |  |  |  |  |  |  | ✔ | ✔ |  |  |  |  |  | ✔ |  |
| Canceled |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ✔ |  |

## 2. 详情页说明(基于运单为例）
- 对账单详情页，显示对账单基本信息+费用信息及进行结算的运单信息

### 2.1 基本信息

包括 ：

**Statement Number，Customer Name**，**Reconciliation Period**： 标题展示其时间类型，  **Creation Time**：对账单创建时间，**Creater：**创建人Alias Name,

**Items to be settled**：展示本次对账单所选的结算项目，**Invoice Number**，**Status**，**Project Name：**包括多个项目时，以逗号隔开，展示所有project，若固定宽度无法展示完全，hover 展示所有

### 2.2 费用信息

基于运单出账，且有单独出账部分，对账单不含税 

基于运单出账，无单独出账部分

基于运单出账，且有单独出账部分，对账单含税

不基于运单，仅单独出账，费用展示情况
#### **运单费用信息**：
- Customer Basic Amount  ：所有被选择运单的客户 Basic Amount 总和
- Customer Additional Charge :所有被选择运单的 客户Additional Charge 总和
- Customer Exception Fee   :所有被选择运单的客户 Exception Fee 总和
- Customer Claim: 所有被选择运单的客户 Claim总和
- **Total Amount Receivable （应收费用总额）：**Total Amount Receivable =Waybill Settlement Amount +Miscellaneous Charge Total Amount【即整个对账单应收金额= 运单产生的应收金额+ 非运单部分产生的应收金额】
- **Waybill Settlement Amount（运单结算项总额）:**
- 若 Is the settlement tax-inclusive = yes , 展示**Waybill Settlement Amount（Tax-in)**，计算所有运单结算项含税总额
- 若 Is the settlement tax-inclusive = No , 展示**Waybill Settlement Amount（Tax-ex)**，计算所有运单结算项不含税总额
- 由于允许Edit Amount （Settlement Amount（Tax-in）及Settlement Amount（Tax-ex）），故可能**Waybill Settlement Amount** 与各结算项之和无法对齐
- 允许增删税务项目及金额（Edit Tax）, 若有增加的税务项目，需展示在TAX项之下（展示形式：Object+Amount)
- 若Is the settlement tax-inclusive= yes ,该对账单需计算税费；则Tax Total in Waybill 展示所选运单的税费加总；
- 其中有税费的运单直接使用该税费
- 无税费的运单需按默认规则计算该单税费
- 若Is the settlement tax-inclusive= No , 该对账单无需计算税费，则Tax Total in Waybill 展示所选运单的已产生的税费加总
- 并需要删除掉该部分费用；
- 其中有税费的运单直接使用该税费
- 无税费的运单则认为不计算
- Waybill Amount  Due (运单应收金额） ：当 Is the settlement tax-inclusive = yes , 则Waybill Amount  Due=Waybill  Amount  + Tax Total in Waybill
- 当 Is the settlement tax-inclusive = No , 则Waybill Amount  Due=Waybill  Amount  - Tax Total in Waybill

税务部分说明：

PH侧税率取12%，TH侧税率取10%

| Route Lib 含税情况 | Waybill是否含税 | 对账单是否含税 | 税额记录 | **税额计算公式（**PH税率当前默认为12% ，TH 税率当前默认为10%，以下公式以12%举例**）** | 对账单计算方式（运单应付部分） | 运单应付说明 | 举例 |
| Route Lib 维护含税价 | Tax-in | 对账单需要含税 | VAT 税额汇总至 Tax Total Included in Waybill Price

其他税种金额汇总至 Tax Total Excluded from Waybill Price | 税额 T=（含税价*0.12） /1.12 , 即： （需结算项之和*0.12 ）/1.12

若运单中手动编辑，则对账单以结算项占运单总额比例计算该单税额

举例：运单总应收100，税10（6块VAT，4块手动编辑），对账单项仅结算其中50，则该单在对账单 | Waybill Amount Due=Waybill Amount+Tax Total Excluded from Waybill Price | 由于运单已含税，对账单需算税，直接取运单金额即可，但手动添加的税额需额外加上 | basic amount=60

claim=40

则：VAT=10.71

手动添加 WHT：10 |
| Route Lib 维护含税价 | Tax-in | 对账单 **无**需含税 | 税额汇总至 Tax Total Included in Waybill Price | 税额 T=（含税价*0.12） /1.12 , 即： （需结算项之和*0.12 ）/1.12

若手动编辑，以编辑后金额为准 | Waybill Amount Due=Waybill Amount -Tax Total Included in Waybill Price | 由于运单已含税，对账单无需算税，故需计算运单中的税额并减掉 |  |
| Route Lib 维护 **非**含税价 | Tax-ex | 对账单需要含税 | 税额汇总至 Tax Total Excluded from Waybill Price | 税额T=不含税价格×0.12，即：需结算项之和*0.12

若手动编辑，以编辑后金额为准 | Waybill Amount Due=Waybill Amount +Tax Total Excluded from Waybill Price | 由于运单未含税，对账单需算税，故需计算运单中的应有的税额并加上 |  |
| Route Lib 维护 **非**含税价 | Tax-ex | 对账单 **无**需含税 | 无需计算税额 | - | Waybill Amount Due=Waybill Amount | 运单未含税，对账单也无需算税，故应付金额直接取运单金额即可 |  |

#### 其他费用信息
- 根据流程所产生费用及手动添加的其他项费用
- 根据对账单是否基于运单，若不基于运单，无运单相关信息，则不展示运单费用模块, 可编辑的对账单状态下，可 edit charge
- 若无其他费用信息，则该项费用为0，可编辑状态下，可 edit charge

- 说明展示内容：
- **Total Amount Receivable**: Waybill Settlement Amount +Miscellaneous Charge Total Amount
- **Waybill Settlement Amount（Tax-ex）：**The sum of all waybill settlement  items  Amount （Tax-ex) in the statement
- **Waybill Settlement Amount（Tax-in）：**The sum of all waybill settlement  items  Amount （Tax-in) in the statement

### 2.3 其他费用流程(Miscellaneous Charge Process)

若有添加流程，则展示，否则不展示（参考waybill 中的subtask）

### 2.4 运单信息

- 若有关联运单，则展示，否则不展示 （参考不基于运单生成的对账单详情）
- 其中被无需结算项+但被其他对账单关联得结算项，On Hold 结算项 需 单独标识出来（@UI）
- 其展示逻辑为 同时为 无需结算项+On Hold 结算项， 按无需结算项UI展示
- 同时为 无需结算项+被其他对账单关联结算项， 按无需结算项UI展示
- 在页面中的运单允许进行再次筛选，筛选条件包括：
- Waybill Number，Customer Code，Truck Type，Plate Number， Delivery Tim（时间段），Unloading Time（时间段），Position Time（时间段）
- 说明：此处运单需展示该运单 Settlement Amount（Tax-in）（结算总额-含税）及Settlement Amount（Tax-ex）（结算总额-不含税）其计算方式如下
- 若该运单所在项目的lib ，其Route Pricing Tax Type =Tax-Inclusive**，**则该运单为含税价，其Settlement Amount（Tax-in）为运单中的结算项加总，其Settlement Amount（Tax-ex）= Settlement Amount（Tax-in）/1.12 ,  【注意：0.12为PH默认税率，, TH为10%默认税率，若为其他税率，该公式应进行修改】
- 若该运单所在项目的lib ，其Route Pricing Tax Type =Tax-Exclusive****，则该运单为非含税价，其Settlement Amount（Tax-ex）为运单中的结算项加总，其Settlement Amount（Tax-in）=Settlement Amount（Tax-ex）*1.12
- 运单列表操作
- 点击Details , 跳转至该运单详情页
- pending状态的对账单，允许edit waybill， 即在该对账单内对关联运单进行重新选择，故edit waybill 时，与对账单的关联关系需重新组织
- pending状态的对账单，允许Edit Amount，即在该对账单内对关联运单的Settlement Amount（Tax-in），Settlement Amount（Tax-ex）两个金额进行手动编辑，编辑时，编辑其中一个金额，无需反算另一个值得金额，无需反算对应结算项的金额，无需回写至运单-billing信息，且编辑的金额仅对该对账单生效
- 交互参考：点击Edit Amount，表格进入可编辑状态，允许编辑此两列值，Edit Amount按钮更新为【Confirm Amount】
- 点击 Confirm Amount，确认已编辑内容，表格进入不可编辑状态；已编辑值需区别展示（@UI）; 备注：每次编辑区别编辑过的值即可（与上次相比，原编辑过的标识依然保留）
- 运单列表展示

列表字段如下：

|  | 字段名称 | 说明 |
| 1 | Customer Code | 展示方式参考waybill list |
| 2 | Waybill Number |  |
| 3 | Position Time | 如2024-06-01 12:00:00 |
| 4 | Unloading Time |  |
| 5 | Delivery Time | 实际的 |
| 6 | Total Amount Receivable | 取billing中的  Customer TotalAmount，保留两位小数，为0则展示“0” |
| 7 | Basic Amount Receivable | 取billing中的 Basic Amount Receivable，保留两位小数，为0则展示“0”, |
| 8 | Additional Amount Receivable | 取billing中的 Additional Amount Receivable，保留两位小数，为0则展示“0” |
| 9 | Customer Exception Fee | 取billing中的Customer Exception Fee，保留两位小数，为0则展示“0” |
| 10 | Customer Claim | 取billing中的Customer Exception Fee，保留两位小数，为0则展示“0” |
| 11 | Settlement Amount（Tax-in） | 该运单需结算项之和（含税） |
| 12 | Settlement Amount（Tax-ex） | 该运单需结算项之和（不含税） |
| 13 | Remark | 本单所有remark，展示不完的hover展示 |
| 14 | Origin | 三级地址+详细地址 |
| 15 | Destination | 三级地址+详细地址 |
| 16 | Plate Number | 实际运输车牌号 |
| 17 | Billing Truck Type | 计费车型（如：客户结算车型为实际运输车型，则展示实际运输车型，客户结算车型为客户要求车型，则展示客户要求车型 |
| 18 | Number of Drops |  |

### 2.4 证据信息

非必填，交互参考wanybill detail中的 add POD ；总数不限制

其他附件上传限制参考当前已有组件即可

### 2.5 操作项

#### Confirm:

无需二次确认，但需进行校验：
- 要求必须有费用项目； 如有对账单流程，则必须为终态（canceled /completed）, 否则不允许确认，点击时，没有费用项提示“**No fee items available; cannot confirm.”，**有进行中的对账单流程，提示 “**An ongoing statement process ; cannot confirm.**”对账单保持原状态
- 确认成功；提示成功，并刷新对账单状态为 Awaiting Confirmation

#### Customer Confirm:

需二次确认

#### Edit Invoice ：

允许增删发票项，并填写发票号，发票号同BU不得相同；添加新行或确认时进行校验，若有重复，外框置红并提示“**This invoice number already exists.**”

#### Edit Settlement Items：
- 仅有Waybill 的对账单展示，否则不展示该按钮； 允许编辑结算项，确认后需重新计算该对账单结算金额； 若被选中运单的结算项项状态为On hold状态，则该结算项项不参与计算，结算，需下次结算

#### Edit Tax：
- 仅基于运单，且运单部分含税的对账单展示，否则不展示该按钮；允许编辑税务部分，允许自定义添加其他税种，税额（ 未填写完成条目不予保存，税种（object) 字数不大于 128, 不可重复，如有重复，标红此行并提示“ Duplicate Object”不允许重复），若填写金额（至多保留两位小数）则自动计算占比（至多保留两位小数），若填写占比（至多保留两位小数）则自动计算金额
- 占比计算：填写金额计算占比，占比=金额/Waybill Settlement Amount（Tax-ex）
- 金额计算：填写占比计算金额，金额=Waybill Settlement Amount（Tax-ex） * 占比
- 弹窗展示该对账单增值税部分，允许删除，修改；如 Waybill Settlement Amount（Tax-ex）=1000， Waybill Settlement Amount（Tax-in）=1120, 增值税（VAT）=120，进行展示，允许修改，修改后Waybill Settlement Amount（Tax-in）

#### Add Process
- 参考add finacial process
- 再该对账单创建流程，对账单号默认为当前对账单，不允许修改
- Process Type: 可选范围若为客户对账单，仅允许添加Statement Miscellaneous Charge by Customer
- 根据项目配置展示所选 process type下的process name（不允许同类型多个非终态流程），不允许被选项排序靠后且置灰
- Due Time, 根据配置固定或自行选择

#### Edit Miscellaneous Charge:
- 交互逻辑参考 edit exception fee （其中由流程所产生的费用项允许删除，不可编辑）
- 杂费费用两个来源：
- 来自流程完成后自动添加（参考运单中的addtional charge, 由于当前流程未定义，故仅保留入口，待流程明确后增加此内容）
- 允许手动添加账单费用
- 所有账单费用均按 账单项目+金额进行展示
- proof 上传后的文件存至 对账单--Proof 模块，且Type=”Miscellaneous Charge Proof”   11/04 Add
- Proof 至少需上传一个文件，最多暂不限制   11/07 Add

#### Edit Waybill:
- 仅基于Waybill 的对账单展示，否则不展示该按钮； Edit Waybill, 即允许 waybill 模块对关联运单进行重新筛选,选择（允许重新选择该客户basic setting范围内所有运单）
- 仅edit 时，展示选择框，确认选项后点击Confirm Options （该按钮非编辑状态不展示）

#### Enter Receipt :
- 填写收款记录，以下项目均为必填
- Receipt time 默认取当前时间，允许修改（不允许往后修改）
- Receipt Item， 默认取当前对账单所有需结算项目，允许修改（多选，可选项为当前对账单所有需结算项目）
- Receipt Amount，取当前国别货币单位，保留两位小数
- Proof，采用系统当前附件上传交互，附件大小控制保 持一致即可，最多份数不限制

#### Rexeipt History：
- 展示该对账单收款记录
- Received amount 为历次收款金额之和
- 点击View ,展示对应 proof 预览

#### Export Statement:
- 导出对账单

导出内容以sheet 形式导出，展示形式如下，根据所选导出项，进行展示，未选择项则不展示即可
- 其中waybills 模块 需展示所有关联运单  (注：waybill list 不展示remark ，waybill number等字段），当对账单不基于运单时，不展示该模块信息
- 具体样式需UI再进行设计

#### Write Off :
- 注销该对账单需进行二次确认，上传附件支持各形式，Written Off 状态的运单详情，该Proof 展示在运单Proof 模块中，Proof 的Type=Write off proof  11/5 add
- 若Write Off 时，多次Receipt Amount 总额 >= 对账单Total Amount Receivable， 则不允许Write Off, 点击提示【Receipts is complete; unable to write off.】

#### Cancel :
- 取消该对账单需进行二次确认
- 取消后 需展示取消结果，并刷新状态

#### Reject :
- 需进行二次确认
- reject后 需展示结果，并刷新状态

#### Confirm Received:
- 确认对账单已完成费用收齐，点击需做如下判断
- 当多次Receipt Amount =0, 对账单不更新状态，保持【Pending Receivable】，confirm 时提示【**No receipt records,  unable to confirm received**.**".**】
- 当多次Receipt Amount 总额 < 对账单Total Amount Receivable , 则对账单更新为 【Partially Received】，confirm 时提示【**The full receivables have not been collected, and the statement has been updated to "Partially Received".**】后刷新状态
- 当多次Receipt Amount 总额 >= 对账单Total Amount Receivable ,则对账单更新为 【Received】，confirm 时提示【**The full receivables have been collected, and the statement has been updated to "Received".**】后刷新状态

#### Add Proof
- Type 暂定为填写（128限制），非必填，未填写则为默认值: Statement Proof
- Document 上传采用系统统一限制逻辑（不限制图片格式）
- Type=”Miscellaneous Charge Proof” 的证据文件，不允许在Proof 模块进行编辑/删除 11/06 update

#### Opreation Log:

展示操作日志
- 记录格式：时间，操作人，操作项目
- 需记录操作：
- 创建对账单，Cancel，Confirm，reject， Confirm received , Write Off： 操作项目记为:  操作+“the statement ”， 如 xx comfirm the statement
- Customer Confirm，Edit Waybill，Edit Amount，add proof,export statement：记为:  操作, 如： xx Customer Confirm
- Edit Settlement Items，Edit Charge，Edit Tax, Enter Receipt，Edit Invoice ：操作项目记为:  操作+操作后被操作项的值,  如 xx Edit Settlement Items 111  to  222   (其中111为前值，222为后值）

Edit Amont ： 见运单列表操作说明  [运单信息](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/701333516#2.4-%E8%BF%90%E5%8D%95%E4%BF%A1%E6%81%AF)