16falsedecimallisttrue

# Contract Tracking

目前系统中缺乏对 **Customer Contract** 和 **Vendor Contract** 失效时间的直观预警。为了确保业务连续性，避免因合同失效导致运单算价问题，VD 和 BSD 业务人员需要一个 **Tracking List** 来快速识别、筛选并跟进即将失效（Expired / Expiring soon）的合同。

## Vendor Contract Tracking

该切页 位于 原**Vendors 列表** 模块的第二个切页，主要供 **VD Team** 使用

需对该切页进行相关的权限控制，与数据权限控制，对应Procurement PIC 可见自己所有Vendor， Add Contract 需配置功能权限

- 列表排序规则：第一优先级：合同 activety status =active 第二优先级，合同到期剩余天数 (Remaining Days) 升序，将最快失效的合同排在最前面。
- 列表数据刷新逻辑：每日凌晨进行数据刷新，页面载入进行刷新
- 列表数据范围：仅展示 in progress 项目合同情况，该项目下同一个Vendor ,仅展示一份合同情况，若有多份合同，1.优先展示到期剩余天数更长的，2 。若同一天结束，则优先展示更 新添加的 合同信息。
- 若均已过期，则按优先级2 优先展示更 新添加的 合同信息
- 合同仅展示合同状态= active，expired 状态，不展示其他状态合同
- 标题提示内容：Displays only "In Progress" projects. For multiple contracts under the same vendor within a project, only one is shown based on these priorities: 1. Longer remaining validity; 2. If ending on the same day, the most recently added one.

|  | 字段名称 | 字段说明 | 搜索说明 |
| 1 | No. | 序列编号 |  |
| 2 | Contrat Nubmer |  |  |
| 3 | Project | 项目名， | 搜索条件， |
| 4 | Project Status | 项目状态，仅  in progress |  |
| 5 | Vendor Name | 供应商名，该项目下有合同的供应商名 | 搜索条件， |
| 6 | Procurement PIC |  | 搜索条件，允许点击“只看自己” |
| 7 | Project Activity Status | 活跃情况，该项目近30天内有非cancel 的运单，则为Active， 否则为 Inactive

该字段增加说明：A project is classified as "Active" if it has non-canceled waybills within the last 30 days; otherwise, it is classified as "Inactive." | 搜索条件，单选 |
| 8 | Customer | 该项目所属客户名 | 搜索条件， |
| 9 | Customer Contract Period | 该项目最新Active 客户合同起止日期（,仅展示一份合同情况，若有多份合同，优先展示到期剩余天数更长的，若同一天结束，则优先展示更 新添加的 合同信息，若均已过期，则展示更 新添加的 合同信息） |  |
| 10 | Vendor Accreditation Status | 供应商认证状态 | 搜索条件，单选 |
| 11 | Vendor Activity Status | 活跃情况，供应商在该项目近30天内有非cancel 的运单，则为Active， 否则为 Inactive （运单按 position time 来算，以下均同）

该字段增加说明：A vendor is classified as "Active" if they have non-canceled waybills under the project within the last 30 days; otherwise, they are classified as "Inactive." | 搜索条件，单选 |
| 12 | Vendor Contract Period | 该项目该供应商最新Active合同起止日期（,仅展示一份合同情况，若有多份合同，优先展示到期剩余天数更长的，若同一天结束，则优先展示更 新添加的 合同信息） |  |
| 13 | Remaining Days | 供应商合同距离到期日天数，如1.1日到期，则1.1日为0 ，允许展示负数，1.2日则为 -1 （@ UI，可考虑用不同颜色进行区分） | 允许选择  ＞，＜， =， 填写天数进行相关匹配 |
| 14 | Note | 说明，列表添加，仅展示最近一次添加内容： 日期，添加人， 内容（200字以内）

添加后允许删除

交互可在操作列添加，可在本列添加，以UI设计为准 |  |
| 15 | Opreation | 操作，允许更新合同（ Update Contract） |  |

Update  Contract

Update  Contact 操作与原添加供应商合同的弹窗字段一致, 其中
1. 弹窗标题为 Update  Contact
2. Contract type 为供应商合同，project Name  默认为该项目 Contract Singer 默认为该供应商，均不可修改
3. 新上传合同需保存后需审核通过后更新该供应商合同有效期
4. 此处上传合同仅为创建合同的一处入口，该合同依然同原添加合同逻辑，上传后为Under Review状态
5. update contract 后，其Note ，自动增加一条内容，时间人物取 合同更新时间与更新人，内容为：Contract updated.

快速筛选

点击快速在列表中筛选相关符合的条件(@UI, 需要给一个选中的效果，单选）

已被更新且通过审核的合同 已最新的合同进入统计

## Customer Contract Tracking

该切页 位于 Customers MGMT--- Customers 菜单的第2个切页，主要供 BSD Team 使用,对在原项目上进行合同续签的情况进行追踪

需对该切页进行相关的页面权限控制，与数据权限控制，对应BD/CAM 可见自己所属客户； Add Contract 需配置功能权限

参考vendor 合同追踪
- 列表数据刷新逻辑：每日凌晨进行数据刷新，页面载入进行刷新
- 列表数据范围：仅展示 in progress 项目客户合同情况，若有多份合同，优先展示到期剩余天数更长的，若同一天结束，则优先展示更 新添加的 合同信息。
- 若均已过期，则按优先级2 优先展示更 新添加的 合同信息
- 合同仅展示合同状态= active，expired 状态，不展示其他状态合同
- 标题提示内容：Only "In Progress" customer contracts are displayed. If multiple contracts exist, priority is given to the one with more remaining days; if they expire on the same day, the most recently added one is shown.
- 快速筛选同Vendor 合同页

|  | 字段名称 | 字段说明 | 搜索说明 |
| 1 | No. | 编号 |  |
| 2 | contract number |  |  |
| 3 | Project | 项目名， | 搜索条件， |
| 4 | Project Status | 项目状态，仅  in progress |  |
| 5 | Project Activity Status | 活跃情况，该项目近30天内有非cancel 的运单，则为Active， 否则为 Inactive

该字段增加说明：A project is classified as "Active" if it has non-canceled waybills within the last 30 days; otherwise, it is classified as "Inactive." | 搜索条件，单选 |
| 6 | Customer | 该项目所属客户名 | 搜索条件， |
| 7 | BD | 客户BD，允许只看自己 | 搜索条件， |
| 8 | CAM | 客户CAM，允许只看自己 | 搜索条件， |
| 9 | Customer Contract Period | 该项目最新Active客户合同起止日期（,仅展示一份合同情况，若有多份合同，优先展示到期剩余天数更长的，若同一天结束，则优先展示更 新添加的 合同信息若均已过期，则展示更 新添加的 合同信息） |  |
| 10 | Remaining Days | 客户合同距离到期日天数，如1.1日到期，则1.1日为0 ，允许展示负数，1.2日则为 -1 （@ UI，可考虑用不同颜色进行区分） | 允许选择  ＞，＜， =， 填写天数进行相关匹配 |
| 11 | Note | 说明，列表添加，仅展示最近一次添加内容： 日期，添加人， 内容（200字以内）

添加后允许删除

交互可在操作列添加，可在本列添加，以UI设计为准 |  |
| 12 | Opreation | 操作，允许更新合同（Update  Contract） |  |

Update  Contract

Update  Contact 操作与原添加供应商合同的弹窗字段一致, 其中
1. 弹窗标题为 Update  Contact
2. project Name  默认为该项目 Contract Singer 默认为该客户，均不可修改
3. Contract type 为客户合同
4. 新上传合同需保存后需审核通过后更新该供应商合同有效期
5. 此处上传合同仅为创建合同的一处入口，该合同依然同原添加合同逻辑，上传后为Under Review状态
6. update contract 后，其Note ，自动增加一条内容，时间人物取 合同更新时间与更新人，内容为：Contract updated.

# Vendor  Accreditation Tracking
同样作为供应商相关文件即将过期的任务列表供Procurement 提前识别文件过期情况
## Truck Accreditation Tracking

该切页 位于 原**Vendors 列表** 增加**Accreditation Remaining Days**
- 展示该vendor 最近即将过期的认证文件剩余天数，允许负数。若有必填类型文件为缺失，则标注为 Missing, 若均为Permanently Valid，则标注为Permanently Valid。
- 列表数据刷新逻辑：每日凌晨进行数据刷新，页面载入进行刷新
- 列表同增加快速筛选，展示**Accreditation** 即将过期时长，
- 操作增加 **Update Accreditation**（需设置功能权限）
- 如下图弹窗，期望交互如下，可根据实际情况再行调整
- 排序按 Valid Date, 越近失效排越前(负数参与排序），Missing （该类型没有文件）排最前，Permanently Valid 排最后
- 点击编辑，弹窗内编辑对应类型文件（均认为增加新文件版本，confirm 后提交该类型），文件上传参考本图使用第一版图片上传样式（非当前线上样式）
- 弹窗内需回显原版本内容
- 更新后即刷新vendor list 里的**Accreditation Remaining Days**
- 补充交互： 类目上的Confirm 按钮更新为Submit， 提交成功后提示：xx(类目名）Submitted Successfully

同样Truck list, Crew list 做同样操作

- 将原有	Validity Period（Days） 更新名字为**Accreditation Remaining Days**
- 允许展示为 负数， Missing, Permanently Valid
- 列表同增加快速筛选
- 列表操作同增加 **Update Accreditation**

补充更新范围：包括VP端 Truck, Crew List
- 将原有	Validity Period（Days） 更新名字为**Accreditation Remaining Days**
- 允许展示为 负数， Missing, Permanently Valid

## Accreditation 切页交互更新

1. 更新范围：包括vendor, truck， Crew （VP端不展示）
2. 增加文件编号：所有Accredition 文件均增加文件编号，编号规则：ACC+实体首字母（V/C/T）+YYMMDD+XXXXX，XXXXX使用递增序列号，从00001开始
3. 增加版本概念，点击+，即新增一个版本，（弹窗参考当前编辑），增加新版本后，原历史版本可见，
4. 点击编辑，即在当前版本基础弹窗中进行更新，
5. 点击历史按钮：抽屉弹出所有历史版本（具体交互@UI 设计为准），
6. 历史数据处理：仅处理当前线上版本文件，添加ID，并展示为第一个版本，原保存的修改版本则不处理也不展示。

# Project --Team Members 交互更新

原Team members 弹窗更新为 切页形式 (按切页设置权限）
- 如图，展示两列。 左侧展示部门管理层与其所在部门
- 管理层需按账号+部门作为唯一标识，上述两个个字段中任一值不同，则视为独立数据，**分行展示。**若以上字段均相合，则不管其他信息是否一致，均进行聚合（如Allen 以角色1 在 A部门担任管理层， 以角色1在B部门同样担任管理层， 则需展示两条数据。 若他以 角色1  以及角色2 挂在两个 CAM PIC 后做管理层，则仅展示一条数据 ）
- 右侧参考原Team Members 弹窗展示该项目所有member 机器角色，部门等。增加一个字段：Department Management，展示该行所在部门所选管理层
- 所添加管理层仅作为一个字段存在，不影响原数据权限

Assign 交互更新

参考原Assign Project 弹窗，原Assign member 逻辑无变化
- 增加  Department Management 管理层选择，参考交互：每选择一个member, 则在 Management 展示该member, 并可选对应 管理层人员，其选择范围同原member
- Department Management 为非必填
- 同member type 中，管理层同一条数据若已被选中，则该数据不可再次被选中，做去重处理

# Others

## 合同文件增加编号

参考Accredition 文件，合同文件同增加文件编号，编号规则：CTR+YYMMDD+XXXXX，XXXXX使用递增序列号，从00001开始

所有合同预览渠道原文件名后增加文件编号展示，可在文件名+（文件编号） 或换行展示 ，以@UI 设计为准

历史数据处理：处理所有通过审核   未删除的合同文件，编号日期使用该合同创建日期

## Claim Ticket List 导出

导出列表增加字段，Waybill number,  在Ticket Number 之后，若不关联运单的ticket，则展示为-

## Canceled Waybill 价格清零

若运单被cancel, 状态被置为Canceled 之后，则该运单billing, Claim ， Reimbursement****Expense 客户侧及供应商侧 相关金额均被置为0 **【仅 TH 生效】**

## Batch Create Tickets
鉴于OC部门与部分客户对Claim 情况为每月一次，估可能为一次性创建多个claim工单 ,为提升相关效率，故增加该功能
[https://docs.google.com/spreadsheets/d/18J6NbulZagOZXBbXd4pXGBZJcmUsLT58XjcnVnS8A5E/edit?usp=sharing](https://docs.google.com/spreadsheets/d/18J6NbulZagOZXBbXd4pXGBZJcmUsLT58XjcnVnS8A5E/edit?usp=sharing)   在ticket 列表增加 Batch Create Tickets 按钮，需设置功能权限

所有人共用同一个 Google Sheet 模板。

批量创建不再控制数据权限，即允许拥有该创建权限的人，可创建所有项目的claim ticket， 并允许在ticket 列表查看所创建的Ticket

异步导入，导入结果展示在弹窗中，点击按钮展示上次导入结果（仅结果展示，失败不必展示失败原因于此页）及导入时间；任一条数据错误，整个列表导入不成功；

校验规则：
- 任何必填字段缺失，则提示：列号+is missing , 如：Column A is missing.
- Claim Amount为0时，OC Status 只能为Not Chargeable, 否则提示：
- 仅成功创建后，该行结果列展示 Created Successfully
- 若有失败行，则未成功写入但通过校验行 结果列展示为空

|  | 字段名称 | 字段说明 | 否则 create result 列提示 |
| 1 | ticket type | 必填。选择，仅允许external  Claims 类型 | Cloumn A Ticket Type Error |
| 2 | Claimant | 必填。需校验是否为 对应国家TMS 客户 | Cloumn B Not found Claimant |
| 3 | Responsible Party | 必填。需校验是否为 Inteluck Corporation或对应国家Vendor | Cloumn C Not found Responsible Party |
| 4 | Waybill No. | 若ticket type = others ,非必填，否则为必填
1. 需校验状态不为canceled, 否则提示状态错误
2. 需校验运单客户与供应商是否与所填写Claimant 与Responsible Party相符，负责提示错误 | 1. Cloumn D  Waybill status cannot be "Canceled."
2. Cloumn B  Claimant does not match the waybill.
1. Cloumn C Responsible Party does not match the waybill |
| 5 | Claim Details | 非必填

校验是否有特殊字符与超字数（限制200字） | Cloumn E Claim Details format Error |
| 6 | Claim Amount | 必填。 校验是否为数字 | Cloumn F Claim Amount format Error |
| 7 | OC Status | 必填。 选择项

若Responsible Party为inteluck ，则OC Status 需为 Inteluck Expense 或 Not Chargeable | Cloumn G ，If the Responsible Party is Inteluck, the OC Status must be "Inteluck Expense" or "Not Chargeable."     Del ,删除该字段，默认 OC status 为 Ongoing Validation

且在页面增加校验：
- 当工单状态=Ongoing Validation 时，进行Confirm 时，校验Proof 是否为空，若为空，则确认不成功，且提示：Please provide the proof before confirming. |
| 8 | Remark | 非必填

无需校验 |  |
| 9 | Proof link | 必填，可访问并获取相关内容并转存至ticket 相关文件夹 | Cloumn I Proof link format Error  Del ,删除该字段 |

弹窗参考：

补充消息通知    Del

|  |  |  |
| 工单为Claim Team Review 状态

且一次创建，若有多条该状态工单，仅发一条消息 | 所有Claim Team Member

取L3：Vendor & Claims | TMS+Slack 通知

xxx （操作者账号Alias Name）created a batch of tickets ,
**View Ticket List**（按钮，跳转工单列表） |

# Hotfix 需求 - 个人权限

UAM中增加个人权限配置功能，之后每个用户权限就等于个人权限+角色权限的并集。
1. UAM用户列表中增加个人权限配置按钮：personal permissions
2. 个人权限配置
1. 点击personal permissions，出现权限配置抽屉
2. 各系统权限树中需要回显该用户所有权限
1. 角色权限：权限点后面加Label，展示对应的角色名称，可能多个（多个角色都配置了该权限点）。回显的角色权限不可编辑。
2. 个人权限：可编辑，编辑方式同权限模板配置。
3. 抽屉上方需要展示分系统展示该用户所有个人权限，方便查看。
1. 点击抽屉右上角Edit按钮后，该区域中，个人权限出现删除按钮（标签右上角），支持快捷删除。也可以防止和角色权限重复配置后，无法在权限树中删除对应的个人权限。
3. 个人权限和角色权限可能重复：无需处理
1. 如果先配置了个人权限，再配置/更新角色权限后，可能导致配重复。这种重复不用处理，角色权限和个人权限的业务含义相互独立，角色权限编辑不影响个人权限是否有对应角色的配置。
3. 用户权限：返回用户权限时，需要对个人权限和角色权限进行取并集处理。