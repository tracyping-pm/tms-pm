16truenonelisttrue
为提升内部采购人员的供应商信息采集效率，本期将允许供应商在Vendor Portal 进行相关资源文件的自行上传，由采购人员在TMS端进行相应审核即可

同时保留原TMS端自行上传资料并审批供应商资源的流程

进行Vendor , Truck， Crew (driver+helper) 的状态厘清

# 状态说明

### 申请状态说明

### Vendor 状态说明

Accredited ：该Vendor 认证申请被通过或由TMS端添加并通过，且文件在有效期内

Unaccredited：该Vendor 认证材料过期，被动失效（不可被指派至运单）

Terminated：该Vendor 由TMS操作主动失效（不可被指派至运单）

Approved/ Not Approved：该Vendor 在Capatity pool 中的状态

---

### Truck 状态说明

Accredited ：该Truck 认证申请被通过或由TMS端添加并通过，且文件在有效期内

Unaccredited：该Truck认证材料过期，被动失效（不可被指派至运单）

Inactive：该Truck 由TMS操作主动失效（不可被指派至运单）

Approved/ Not Approved：该Truck  在Capatity pool 中的状态， Not Approved 则不可在本项目中被指派

Transit/Available ：该Truck 运输状态，是否在在途运单中
- 运单Delivered 释放对应车辆及Crew
- 运输状态不影响指派逻辑，仅作为信息查看

### Crew 状态说明

Accredited ：该Crew 认证申请被通过或由TMS端添加并通过，且文件在有效期内

Unaccredited：该Crew认证材料过期，被动失效（不可被指派至运单）

Inactive：该Crew由TMS操作主动失效（不可被指派至运单）

Approved/ Not Approved：该Crew 在Capatity pool 中的状态， Not Approved 则不可在本项目中被指派

Transit/Available ：该Crew 运输状态，是否在在途运单中
- 运单Delivered 释放对应车辆及Crew
- 运输状态不影响指派逻辑，仅作为信息查看

# Vendor Portal 侧更新

## 首页统计更新

原Driver+helper统计更新 为 All Crew, 展示该供应商Crew 数量

## 增加消息中心

状态栏增加消息中心（交互参考当前TMS，增加消息分类）

展示消息类型：
1. 审核消息：Vendor /Truck / Crew审核结果
2. 认证材料消息：
- Vendor /Truck / Crew 认证材料即将过期消息
- 该材料已过期提醒

## 增加Vendor状态展示

状态栏增加展示Vendor Accreditation Status：Unaccredited，Accredited，Terminated

## 增加Accreditation Application 菜单

- 当该供应商的 Vendor申请 未通过审核时（即该供应商为非认证状态），Vendor 端登录后
- 若有进行中的Vendor申请，则默认跳转至 Vendor申请的详情页面，并允许对该申请进行操作；
- 若**无**进行中的Vendor申请，则默认跳转至 Vendor申请的列表页面  补充
- 当供应商状态为 非认证 状态时，允许新增申请，但仅允许添加Vendor Type 类型的申请
- 且 非认证 状态，Trucks 与 Crew 菜单不可见
- 添加申请时，该供应商不允许对同一实体有多个进行中的申请，则添加申请填写完唯一识别码后，验重需同时校验该实体是否有进行中的申请，如果有，则提示：‘The object has an ongoing application (申请编号).’  补充
- 搜索条件：

**Status:** 多选，选择申请状态（Draft，Under Review，Approved，Rejected）。

**Type:** 多选，选择申请类型（Vendor，Truck，Crew）

**Object:** 申请关联的实体，供应商名称/ 车牌号/ Contact number；like匹配

**Update Start Time--End Time:** 申请更新时间范围

**Application No. ：**申请编号，模糊匹配

### 表格列

| 字段名 | 描述 |
| Application No. | 显示申请编号，系统自动生成

生成规则：Ap+V/T/C（申请类型）+yymmdd+3位随机号（允许字母，数字）

允许点击跳转申请详情页 |
| Status | 显示申请当前状态

其中Draft 状态仅在VP端可见 |
| Type | 显示申请类型（Vendor，Truck，Crew） |
| Object | 显示申请对象

允许点击跳转至对象详情页，如果还没有生成相关实体，点击提示“Review has not been approved yet.“ |
| Update Time | 显示最后更新时间 |
| 排序规则 | 1. 按状态 Under Review , 其他状态，正序排列; Under Review排最前
1. 按更新时间(update time)倒序 |
| 操作 | Draft（Edit, Submit，Delete, Details ）

Under Review(Withdraw，Details)

Approved，Rejected （Details，查看申请详情页) |

### 列表操作

**Submit**,需做二次确认
- 提交后，回到申请列表，并刷新申请数据

**Withdraw**,需做二次确认
- Withdraw后，该申请被退回至草稿状态
- Withdraw后的申请不再在TMS端展示，
- 若Withdraw时，TMS正进行审核操作，则审核结果不可提交，提示“The  Application has been withdrawed”

**Delete**,需做二次确认
- 删除该条申请数据
- 删除后回到申请列表，并刷新申请数据

**Edit ,**参考新建申请弹窗

**Details:** 跳转至详情页

---

### Add Accreditation Application

创建申请
- 可创建Type 为Truck，Crew, Vendor 的申请
- 添加Vendor Type申请
- Vendor Nama 默认为本供应商名称，不允许修改
- Serviceable Area 所添加区域为当前TMS 添加Vendor 填写三级地址的逻辑（需要选择region,province,city)， 只是此处用一个字段表示
- 其他同Crew, Vendor 申请
- 添加Truck申请
- 根据申请类型，展示不同需填写的相关信息（与新建/编辑Truck，Crew一致）；
- 必填文件则对应有效期不可为空
- 只填写有效期未上传文件则确认时不保留该信息（非必填类型文件）
- 若为已存在的Truck，Crew添加申请，则填写车牌号/ID Number 后回显原信息，允许编辑；审核通过后。覆盖原信息；
- 添加Crew申请
- 添加申请交互更新如下：
- 若为Crew 申请，需选择为modify  还是Add a New:
- 默认为Add a new, 若为新增，则页面排版如下图 2；填写ID Number 时，该空不必做es查询，仅允许输入，不做信息回填。提交申请并审批通过后，若为已有Crew, 则进行信息更新（注意: crew Type , 通过申请不减只增）
- 若为modify, 则页面排版如下图 3; 有限填写ID Number ，该空失焦后根据查询结果进行数据回显。若为新增信息同样允许提交申请，不做阻塞
- 根据Crew Type 更新认证文件类型必填性
- 其中 **Valid Primary ID**（PH）**，ID Card** （TH）文件上传后进行 ID Number OCR识别，并将识别结果填入 ID Number 中，允许修改
- **Driver's License**文件上传后进行 License Number OCR识别，并将识别结果填入 License Number  中，允许修改
- Valid Primary ID （PH），ID Card （TH），Driver's License 文件仅允许上传一张
- Lisence No. 根据Crew Type 仅区别是否必填
- 所有申请适用：
- 添加申请，需将TMS已有对象信息均进行回显，此处允许编辑，且提交申请时需对所有必填项做完整性校验
- 若信息不完整，则不允许提交，提交按钮置灰
- 点击Submit，则标红未填写的必填框，并toast 提示：“Complete the Information Please”
- 认证文件若填写有效期，其有效期需包含当天。否则失焦后该框标红并提示“The validity period  must include today.”, 且不允许提交该申请
- 若取消则不保存当前页所有信息
- 若save as draft,  则申请状态为 Draft(草稿），Draft 状态仅在VP端可见
- 若Submit ，则提交申请，状态为 Under Review
- Submit 校验该Truck，Crew是否其他供应商已有数据：
- 若为其他供应商已存在Crew，则不允许提交，并提示：This Crew is already assigned to a partner, duplicate submission is not allowed.  待更新为允许Crew 存在多个供应商
- 若为其他供应商已存在Truck，则提示“This truck has been added by other partner .if you need to submit”做二次确认，但不阻塞。
- 若忽略提示，则回显原信息，允许编辑；审核通过后。覆盖原信息；
- 通过后用新信息覆盖原信息，同时属于多家Vendor, 且Ownership 属于最新申请通过为Owned Truck的Vendor ,其他Vendor 则为 Non-Owned Truck
- 举例：若A供应商1日申请A车为Owned Truck,3日通过；B供应商2日申请A车为Owned Truck，2日通过。则A车为A供应商的Owned Truck， B供应商的 Non-Owned Truckhink>**mplete the Information Please!**

<think>**Comlete the Informaton Please!**

<thin**omlete the Information Please!**
图1

图2

图3

### Application Detail

申请详情
- 展示申请信息：**Application No.:** 显示申请编号。

**Status:** 显示当前申请状态

**Type:** 显示申请类型。

**Object:** 显示申请对象

**Update Time:** 显示最后更新时间。

**Reject Reason:** Rejected状态展示被拒绝原因
- 展示申请对象的基本信息，若为Vendor /Crew /Truck 展示其对应基本信息即可，图示以Truck ,Vendor 举例，其他对象参考对应详情即可
- 申请对象的认证信息，展示对象的认证信息及对应有效期信息
- 其中TH侧与PH侧的认证文件不同（vendor , truck, driver,helper均有对于认证文件的类型和有效期  及对应的必须性有不同的说明，具体见 [https://inteluck.atlassian.net/wiki/x/hYCIMg](https://inteluck.atlassian.net/wiki/x/hYCIMg)
- 不同状态可进行操作：
- 参考列表操作，其中Submit ，Delete，Withdraw均需进行二次确认

| Draft | Edit： 详情页得Basic 与 认证信息单独编辑，参考truck/crew 得详情页

Submit

Delete |
| Under Review | Withdraw |
| Approved，Rejected | 终态无操作 |

## Trucks list 更新

最新展示字段如下图，增加状态等字段，更新操作

表格列：仅对其中特殊字段做相关说明

排序规则： 按照更新时间倒序，即最近更新排最前

| 特殊说明字段 | 描述 |
| Plate Number | 点击跳转至对应车辆详情页 |
| Validity Period | 仅Accredited 展示，其他状态展示“-”

取当前车辆所有认证文件最近即将过期的文件距离过期的天数展示（如文件A还有8天过期，文件B还有100天，则展示8）

每日刷新 |
| Transportation Status | 仅Accredited 展示，其他状态展示“-” |
| Update Time | 显示车辆信息的最后更新时间 |
| 操作 | Accredited 状态展示Add Application

Unaccredited，Inactive 状态展示Reaccredit

Add Application与Reaccredit 均适用添加Truck类型 申请弹窗，并回显原Truck信息；, 不允许修改类型 |

### Add Truck

适用添加Truck类型 申请弹窗, 且不允许修改申请类型

### Truck Detail

Add Edit Application ,使用添加Truck类型的申请弹窗, 且不允许修改申请类型；回显该Truck 所有已有信息进行修改

申请通过后即覆盖已有Truck 信息，若其他Vendor 添加申请通过或TMS端修改Truck 信息，所有Vendor 侧该车辆信息均进行同步更新

## Crew List更新

基本逻辑与Truck List 一致

搜索条件：

| 字段 | 描述 |
| Accreditation Status | 多选

选择认证状态（Unaccredited, Accredited, Inactive）以过滤记录。 |
| Transportation Status | 多选

选择运输状态（Available, In Transit）以过滤记录。 |
| Crew Name | 输入人员名称，like查询 |
| License Number | 输入许可证号，like查询 |
| Contact | 输入联系方式，like查询 |
| Type | 选择类型（Driver, Helper） |
| Validity Period | 选择有效期范围以过滤记录，选择最大与最小值（最小为0），允许只选择其中一端，均为闭区间

若选择 x-正无穷，则筛出永久有效的选项 |
| Update Start Time—End Time | 选择更新时间范围 |

表格列：

排序规则： 按照更新时间倒序，即最近更新排最前

| 字段名 | 描述 |
| Crew Name | 显示人员名称，允许点击跳转至该人员详情页 |
| Transportation Status | 仅Accredited 展示，其他状态展示“-” |
| Validity Period(Days) | 仅Accredited 展示，其他状态展示“-”

取当前车辆所有认证文件最近即将过期的文件距离过期的天数展示（如文件A还有8天过期，文件B还有100天，则展示8）

每日刷新 |
| Update Time | 显示最后更新时间 |
| Operate | Accredited 状态展示Add Application

Unaccredited，Inactive 状态展示Reaccredit

Add Application与Reaccredit 均使用添加Crew类型 申请弹窗，并回显原Crew信息；不允许修改申请类型 |

Crew Detail

# TMS端更新

## Accreditation Application

TMS 新增认证申请(Accreditation Application)菜单，展示所有供应商申请

权限说明：拥有该菜单权限允许查看所有数据，Review 操作需单独设置按钮权限
- 排序规则：1. 按状态 Under Review , 其他状态，正序排列，Under Review排最前
1. 按更新时间(update time)倒序
2. 按申请方（Applicant ）首字母正序

- 列表字段与筛选条件参考 VP端 [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/844955675/S33+Vendor#%E5%A2%9E%E5%8A%A0Accreditation-Application-%E8%8F%9C%E5%8D%95](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/844955675/S33+Vendor#%E5%A2%9E%E5%8A%A0Accreditation-Application-%E8%8F%9C%E5%8D%95) ，相对VP端增加 Applicant （申请方）字段与筛选条件（多选，模糊匹配），Creator (创建人）字段
- Applicant 取申请发起Vendor 的Vendor Name；
- Creator 取申请创建者账号，若为系统自动创建，则取TMS侧操作者账号名
- 与VP端相比增加 Review 操作
- 以下以Truck 车辆审核为例，展示该车辆信息，可以进行通过或拒绝操作
- 提交审核结果时，需校验该申请状态，若申请已在VP端被撤回，则弹窗提示”Application Withdrawn“，该弹窗仅展示Confirm按钮，点击Confirm，回申请列表页，并刷新数据
- 其中被编辑的信息需标蓝，若为认证文件被更新，则标蓝该文件类型；
- 需在标题行增加说明“Application Update Information (Blue Content)”
- 若拒绝，需填写拒绝原因；提交后该申请更新为Rejected 状态，且该申请主体（对应车辆）更新为Unaccredited / Inactive/ Accredited状态
- 若通过，则该申请更新为Approved 状态，且检查该申请实体（对应车辆/Crew/Vendor）是否全部认证资料均齐全，若是则更新为Accredited 状态；若被申请实体的对应认证材料不完全，则对应实体的状态不更新

---

认证材料数据处理：[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/847806597?atl_f=PAGETREE](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/847806597?atl_f=PAGETREE) ， 参考该列表对TH、PH 两侧不同类型的资源（Vendor ,Truck, Crew）有不同的必填材料需求，若该材料为必填，则其有效期同样为必填；否则均为非必填
- 有效期选择为日期段，同时增加**Valid indefinitely（永久有效）** 选项，若选择Valid indefinitely ，则代表该文件不会失效

文档历史数据处理方案（待定） ：
- 当前名称可对应，则文档进行平移，有效期根据表格设置为N/A 的默认为Valid indefinitely， 其他则置空。
- 3周内每两天导出未完成文件处理的资源名称给业务方进行检查：导出格式参考：[https://docs.google.com/spreadsheets/d/1hC7_MPBoBXUXGXna6bG0UCpm5YQyszKZXcVuiZV1Z-g/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1hC7_MPBoBXUXGXna6bG0UCpm5YQyszKZXcVuiZV1Z-g/edit?gid=0#gid=0)
- 名称不可对应，则保留原Type，与文件；
- 资源有效性处理，3周时间缓冲，由业务补齐相关材料，上线3周后统一计算其是否在有效期以内，否则更新资源状态

## Create Vendor更新

增加Email 字段，同时创建该Vendor账号
- Name 失焦后校验，若该Vendor 已存在，则外框置红，提示：Existed Vendor ；confirm时阻塞创建
- Email 失焦后校验，该Email 是否重复，若重复，则外框置红，提示：Existed Email ；confirm时阻塞创建  补充
- Vendor 编辑时，允许编辑Email，但新填写Email 同不允许重复;
- 成功编辑了Email后，确认编辑后需弹窗提示新的账号与密码
- 新账号继承原账号所有数据
- 创建成功弹窗提示创建成功并返回账号密码（若未填写Email，则不展示账号密码），点击Copy，复制账号密码

点击Vendor  Accredit, 创建一个Vendor 类型的申请（状态为Draft）, 并跳转至Vendor 列表

点击Upload Accreditation，跳转至该Vendor 详情--Accreditation切页；
- 认证文件若填写有效期，其有效期需包含当天。否则失焦后该框标红并提示“The validity period must include today.”,且不允许提交，对所有对象（Vendor , Truck, Crew) 的认证文件均生效

若点击X，退出弹窗，则回到Vendor list,刷新列表； 该Vendor 为UnAccredited 状态

## Vendor list

增加筛选条件 Truck Type， 模糊匹配，多选；筛选有该车型的Vendor
- 若选择多个Truck Type， 则取交集筛选Vendor
- 位置于Trucks 后，list 列表不增加该字段

## Vendor Detail
1. 增加状态展示
1. 基础信息默认不收起
2. @ UI，基础信息是布局是否可以更紧凑？待UI确认
2. Driver + Helper 切页合并为Crew 切页
- 见图，允许进行解绑（unbind）操作，逻辑与原Driver 等保持一致
3. 增加Accreditation Application 切页，展示该Vendor 所有认证申请（包含所有Type)
- 允许在本页列表进行审核（Review), 审核弹窗参考申请页面
1. Accreditation切页更新
- 增加展示对应Vendor 类别的认证文件及其有效期
1. Operation Log
- 主要记录基本信息有编辑记录，状态修改记录，状态修改记录通过申请修改的，则操作人记作该申请编号即可
- Operation：Edited Vendor info.   简化操作记录
- 若为文件编辑，则记作：add xx file, Delete YY file (xx,yy为文件类型名）

通过申请进行的信息修改则不记录

1. 各状态对应操作说明

| 操作按钮 | 按钮位置 | 按钮权限说明 | Unaccredited | Accredited | Terminated |
| Operation Log | 页面顶部 | 跟随页面权限 | ✔ | ✔ | ✔ |
| Transfer Vendor | 页面顶部 | 单独设置 | ✔ | ✔ | ✔ |
| Accreditation Approval | 页面顶部 | 单独设置 | ✔ 操作时需校验是否有该Vendor申请 |  |  |
| Terminate | 页面顶部 | 单独设置 |  | ✔ |  |
| Reaccredit | 页面顶部 | 单独设置 |  |  | ✔ 操作时需校验是否有该Vendor申请 |
| 文件编辑 | 文件模块 | 单独设置 | ✔ | ✔ | ✔ |

1. Accreditation Approval 弹窗更新

原逻辑：先填写原因，提交时校验是否所有必填文件已完成，否则阻塞；
- 原Reason 对应详情中的mark，由于不再填写原因，故去掉Mark 字段（包含详情与Assign Truck 时的mark 展示）
- 适用vendor ，Truck ，crew均删除该Mark 字段

新逻辑：点击 **Accreditation Approval 则**校验
- 该Vendor是否有Vendor 类型且状态为 under review 的申请，有则需进行弹窗提示：The vendor has an accreditation application( 申请编号), Continue Accreditation Approval?
- 申请编号允许点击，点击跳转至申请详情
- 点击cancel ,取消弹窗
- 点击View Application，跳转至申请详情
- 点击Accreditation Approval，继续校验是否所有必填文件，必填有效期均已完成
- 若有必填文件或有效期为空，阻塞并提示 Accreditation information is incomplete
- 若有效期不包含今天，需提示 ”The validity period must include today“， 且置红非法有效期，并阻塞
- 原申请保留，若后续通过申请，则申请的信息覆盖原信息；若申请被拒，则不影响已有vendor信息
- 如果没有进行中的申请，则直接校验是否所有必填文件，及其有效期均已完成；相关提示同上
- **Reaccredit** 操作逻辑与 Accreditation Approval 一致，通过后状态更新为**Accredited**

Truck, Crew逻辑一致

## Truck list

参考Vendor Portal端Truck list. 认证状态更新，增加运输状态，有效期等字段；

| 特殊说明字段 | 描述 |
| Plate Number | 点击跳转至对应车辆详情页 |
| Validity Period | 仅Accredited 展示，其他状态展示“-”

取当前车辆所有认证文件最近即将过期的文件距离过期的天数展示（如文件A还有8天过期，文件B还有100天，则展示8）

每日刷新 |
| Transportation Status | 仅Accredited 展示，其他状态展示“-” |
| Update Time | 显示车辆信息的最后更新时间 |

## Truck Detail

同Vendor detail 一致，其认证文件增加有效期展示，增加Truck 类申请切页；

基本信息默认展开，增加状态展示。@UI，是否可以布局更紧密

Accreditation Application 页不再重复展示，参考Vendor 详情[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/844955675/S33+Vendor#Vendor-Detail](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/844955675/S33+Vendor#Vendor-Detail) 即可，仅展示该Truck 的申请

| 操作按钮 | 按钮位置 | 按钮权限说明 | Unaccredited | Accredited | Inactive |
| Operation Log | 页面顶部 | 跟随页面权限 | ✔ | ✔ | ✔ |
| Attribution | 页面顶部 | 单独设置 | ✔ | ✔ | ✔ |
| Accreditation Approval | 页面顶部 | 单独设置 | ✔ 操作时校验该truck是否有在途申请 |  |  |
| Deactivate | 页面顶部 | 单独设置 |  | ✔ |  |
| Activate | 页面顶部 | 单独设置 |  |  | ✔ 操作时校验该truck是否有在途申请 |
| 文件编辑 | 文件模块 | 单独设置 | ✔ | ✔ | ✔ |

- **Accreditation Approval**操作所选校验同Vendor Accreditation Approval 一致
- **Deactivate ，**与当前逻辑一致，Deactivate 后，状态更新为**Inactive**
- Inactive 状态的**Activate** 操作与Unaccredited状态的Accreditation Approval 操作逻辑一致
- ****Activate后，状态更新为**Accredited**
- **Operation Log** 参考vendor ，记录基本信息修改，状态修改
- Edit Truck
- 原TMS Edit Truck 功能保持原逻辑：有在途运单的车辆认证文件不可被删除，允许添加；
- 若为通过申请，导致文件更新，则不管控
- 原编辑交互逻辑不变（基本信息与文档分别编辑）

- 新增逻辑：TMS侧编辑车辆基本信息不影响车辆状态

TMS侧若更新/删除认证文件，则状态更新为 Unaccredited， 需进行**Accreditation Approval** / 相关申请通过 操作后才能更新为**Accredited**状态；

## Add Truck

Truck 依然保留在TMS侧添加车辆，增加认证文件模块，但允许不上传该信息

认证文件可不上传，若未填写完毕认证文件，则保存后该Truck为 Unaccredited 状态；
- 不考虑TMS 侧保存truck 与vendor 侧提交同时审核通过该truck 信息的场景
- Plate number 失焦后，进行查重；若TMS已有该车辆信息（车牌号作为唯一识别码），则外框置红并提示”`Existed Truck`”
- 提交时，若已有该Truck进行中申请，则弹窗提示是否保存
- 文件类型，展示所有车型的文件类型，只区别必填项
- Add Truck/Crew 对进行中的申请校验同Vendor , 但由于 Truck/Crew 可能存在多条进行中申请，若有多条，则该弹窗展示最早创建的一条
- 即TMS侧确认与申请通过的时间：
- 若申请审批晚于Truck创建，则按申请进行信息覆盖
- 若申请审批通过 早于 Truck 创建，则 Save Truck时，提示”`Existed Truck`”
- 原TMS 逻辑：Truck 分配逻辑依然保持，TMS添加的车辆进行供应商分配； 由供应商处添加的Truck申请，则该Truck 默认属于该供应商，同时允许TMS端进行自由分配

## Crew list &Detail

同Vendor detail 一致，其认证文件增加有效期展示，增加Crew 类申请切页；

**补充搜索条件，同VP端，增加Vendor Name**

| 字段 | 描述 |
| Accreditation Status | 多选

选择认证状态（Unaccredited, Accredited, Inactive）以过滤记录。 |
| Transportation Status | 多选

选择运输状态（Available, In Transit）以过滤记录。 |
| Crew Name | 输入人员名称，like查询 |
| License Number | 输入许可证号，like查询 |
| ID Number | 输入身份证号，like查询 |
| Contact | 输入联系方式，like查询 |
| Vendor Name | 单选 |
| Type | 选择类型（Driver, Helper） |
| Validity Period | 选择有效期范围以过滤记录，选择最大与最小值（最小为0），允许只选择其中一端，均为闭区间

若选择 x-正无穷，则筛出永久有效的选项 |
| Update Start Time—End Time | 选择更新时间范围 |

| 操作按钮 | 按钮位置 | 按钮权限说明 | Unaccredited | Accredited | Inactive |
| Operation Log | 页面顶部 | 跟随页面权限 | ✔ | ✔ | ✔ |
| Attribution | 页面顶部 | 单独设置 | ✔ | ✔ | ✔ |
| Accreditation Approval | 页面顶部 | 单独设置 | ✔ 操作时校验该truck是否有在途申请 |  |  |
| Deactivate | 页面顶部 | 单独设置 |  | ✔ |  |
| Activate | 页面顶部 | 单独设置 |  |  | ✔ 操作时校验该truck是否有在途申请 |
| 文件编辑 | 文件模块 | 单独设置 | ✔ | ✔ | ✔ |

Edit Crew
- 原TMS Edit Crew功能保持原逻辑：有在途运单Crew的认证文件不可被删除，允许添加；
- 若为通过申请，导致文件更新，则不管控
- 原编辑交互逻辑不变（基本信息与文档分别编辑）

新增逻辑：TMS侧编辑人员基本信息不影响Crew状态

TMS侧若更新认证文件，则状态更新为 Unaccredited， 需进行**Accreditation Approval** 操作后才能更新为**Accredited**状态；

Transfer Crew
- 本期更新至同一Crew 允许属于多个供应商
- 则list 的 **Transfer Crew** 操作需**删除，**修改为参考Truck ，在Crew Detail 页增加 **Attribution** 操作
- Crew Detail 的 **Transfer** 操作也**删除**
- Crew Detail 中的Vendor 展示可参照Truck Detail 的Vendor 进行展示，无 Owenship字段
- List 中的Vendor 也需展示多个（根据数据处理结果待定，若同一Crew/Truck 所归属Vendor过多则去掉list中的Vendor 字段）

## Add Crew

依然保留在TMS侧添加Crew, 仅选择了Type= Driver 时 Lisence No. 根据Crew Type 仅区别是否必填

其中认证文件可不上传，若未填写完毕认证文件，则保存后该Truck为 Unaccredited 状态；
- Valid Primary ID （PH），ID Card （TH），Driver's License 文件仅允许上传一张
- 若未上传文件，则不进行OCR识别
- 文件类型，展示Driver+Helper 的所有文件类型，只区别必填项
- 不考虑TMS 侧保存Crew 与vendor 侧提交同时审核通过该Crew 信息的场景
- id No.失焦后，进行查重；若TMS已有该人员信息（ID No.作为唯一识别码），，则外框置红并提示”`Existed Crew`”
- 提交时，若已有该Crew 在途申请，则弹窗提示是否保存
- TMS侧确认与申请通过的时间：
- 若申请审批晚于Crew创建，则按申请进行信息覆盖
- 若申请审批通过 早于Crew 创建，则 Save Crew时，提示”`Existed Crew`”

## 历史数据处理方案（5.29更新）
1. 原Blocked 状态Vendor数据处理方式：置为Terminated
2. 原Blocked  状态Helper,置为Inactive
3. 原Normal状态Helper,置为Accredited
4. 原Blocked 状态Driver,置为Inactive
5. 原Out of Use 状态Truck, 置为Inactive
6. 原 InUse  状态Truck, 置为Accredited
7. 运输状态都按当前运输情况进行更新即可
8. 若同名同供应商的helper有多条数据，合并至一条，若状态包含Accredited，则合并后取其正向状态（Accredited）
- 若不包含Accredited，则为Inactive
9. Crew
- 重复Contact Number且状态为Accredited 的Driver 已导出，由业务经行确认；具体见该表[https://docs.google.com/spreadsheets/d/14O3iiJDngUcBBM-ROsLnuUOiBWa798EPFm9Ya-DbzY8/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/14O3iiJDngUcBBM-ROsLnuUOiBWa798EPFm9Ya-DbzY8/edit?gid=0#gid=0)
- 参考该表格H 列被标注为Delete 的数据更新其状态为 inactive
- 被标注为 Reserve 的数据保留，并参考表格信息并参考表格信息更新原信息，主要为补充 IDNumber及 License Number
- 标注为 Reserve 但未填写 ID Number的数据，依然保留状态，当该数据进行编辑时进行 ID Number的补充
- 被标注为Modify 的数据则按表格数据进行数据更新
- Helper 与Driver 的合并
- 通过 Helper 名字+ Vendor 合并至同名且同供应商 Driver，该Crew 的Type既有Driver+Helper
- 合并helper 至Driver时，不改变原Driver 的状态
- 若Helper 无对应同名Driver , 则创建Type=Helper 的Crew
1. Truck
- 重复plate Number且状态为Accredited 的truck 已导出，由业务经行确认；具体见该表[https://docs.google.com/spreadsheets/d/1NOe494btOcO65FA07OFQDERuWKj9fSCaMBEAAubs33A/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1NOe494btOcO65FA07OFQDERuWKj9fSCaMBEAAubs33A/edit?gid=0#gid=0)
- 参考该表格 E 列被标注为Delete 的数据更新其状态为 inactive
- 被标注为 Reserve 的数据保留，并参考表格信息更新原信息

## Capacity pool 更新

基本信息默认为展开（@UI，字段是否可以排列更紧凑）

### Trucks

Trucks 增加 Access Status，即车辆允许在运力池里被标记为不可用，即进行carrier 指派时，Not Approved 状态得车辆不可被指派

筛选条件增加 Access Status

添加运力池，选择供应商后，该供应商所有车辆及Crew 均默认为Approved 状态，允许在运力池进行批量/单个 Revoke，Approve 操作

### Crew

增加Crew 切页

无需设置该切页权限，跟随Capacity pool 详情页权限即可

逻辑与Truck切页一致，即展示该运力池所有Vendor 下属Crew

添加运力池，选择供应商后，该供应商所有车辆及Crew 均默认为Approved 状态，允许在运力池进行批量/单个 Revoke，Approve 操作

## Carrier Assign 更新
- 交互不变,Driver 与 Helper选择步骤，增加Access Status字段，Access Status=Approved 的排序靠前，第二靠名字首字母排序
- 选择Driver 与 Helper, 加载该Vendor 所有的Crew 带对应Type 的数据
- 其中仅允许选择认证状态为Accredited 且在本项目运力池 Access Status为Approved的数据；
- 不可用数据同Truck处理方式 一样，置灰

## 消息提醒

增加以下消息提醒

| 触发条件 | 接收方 | 通知 |
| 供应商认证文件即将过期（包含Vendor ,Truck, Crew)
0 ≤ （供应商认证文件版本有效期末日 - 当前时间） ≤ 7天 | Vendor PIC | TMS内部通知
XX's（供应商名）YYY （文件名）is about to expire, with ZZ (剩余天数）days remaining until the validity period ends.
View Details（按钮，跳转该Vendor /Truck,/Crew 认证文件切页链接）

Slack通知
XX's（供应商名）YYY （文件名）is about to expire, with ZZ (剩余天数）days remaining until the validity period ends. |
| 该Vendor | VP端通知，消息分类为Expiration Notification
The XXX's （车牌号/Crew 名) YYY （文件名）is about to expire, with ZZ (剩余天数）days remaining until the validity period ends.
View Details（按钮，跳转该Vendor 认证信息 或Truck,/Crew 认证文件切页链接） |
| 供应商认证文件过期当日
（供应商认证文件版本有效期末日 - 当前时间）=-1 | Vendor PIC | TMS内部通知
The XXX's （对应供应商名/车牌号/Crew 名）YYY（文件名）has expired and can't be assigned.
View Details（按钮，跳转该Vendor /Truck,/Crew 认证文件切页链接）

Slack通知
The XXX's （对应供应商名/车牌号/Crew 名）YYY（文件名）has expired and can't be assigned. |
| 该Vendor | VP端通知，消息分类为Expiration Notification
The XXX 's（车牌号/Crew 名）YYY（文件名）has expired and can't be assigned.
View Details（按钮，跳转该Vendor 认证信息 或Truck,/Crew 认证文件切页链接） |
| 供应商认证申请结果通知 | 该Vendor | VP端通知，消息分类为 Application Notification

xxx(申请编号）is Rejected, Because YYY(拒绝原因）,View Details (按钮，跳转申请列表） |
| VP端通知，消息分类为 Application Notification

xxx(申请编号）is Approveded. View Details (按钮，跳转申请列表） |

# 其他

## 增加 Risk Level 字段
1. Waybill 详情页增加 Risk Level 字段
- 需处理所有（状态为in transit)数据

## Waybill list 页增加 筛选条件
- Waybill list 页增加Actual Truck Type 筛选条件
- waybill list + Project Detail waybill list 均增加该筛选条件
- 位置放在 Vendor Info行最后  Add
- like 匹配，多选

## Waybill  Cancel / Abnomal Reason 枚举值更新

Cancel 原因更新如下
- 不处理历史数据，历史数据展示其Cancel 原因依然展示原内容

|  |
| Not Enough Truck (No Penalty) |
| Cannot Support (Penalty) |
| Cannot Support (Find Replacement, Please Open Another Waybill) |
| Cancelled By Client (Without Pay) |
| Cancelled By Trucker (Without Pay) |
| Cancelled By Inteluck (Without Pay) |
| Involved In Incident (Please Copy To New Waybill) |
| Wrong Creation |

Abnomal 原因更新如下表
- 不处理历史数据，历史数据展示其Abnomal 原因依然展示原内容

| Cannot Support (Penalty) |
| Cannot Support (Penalty) |
| No Show (Not Find Replacement, Please Remark Penalty Amount) |
| No Show (Find Replacement, Please Open Another Waybill) |
| Foul - Client Pay, Not Pay Trucker |
| Foul - Client Not Pay, Pay Trucker (Please Remark Why And Amount) |
| Foul - Client Pay, And Pay Trucker |
| Redelivery (With Pay, Copy To New Waybill) |
| Backload (With Pay, Copy To New Waybill) |

Waybill Detail 的 Remark模块，枚举值也需做相应更新,  更新为新的Cancel 原因，同样不处理历史数据

## AR Statement 更新

AR Statement 客户确认增加Proof

如下图，在Customer 确认时，取消原提示，更新为如下弹窗。需上传对应Proof
- 该Proof 保存至 Statement Detail，Proof 模块
- 该Proof 类目为 Customer Confirm Proof, 不允许编辑与删除
- 该Proof 类目在客户确认后的状态置于Proof 模块第一个位置
- reject statement后，原为 Customer Confirm Proof 保留，新增Proof 文件置于同一类目下
- AP Statement 暂不处理

## Waybill 导出增加字段

Waybill 导出增加 Required Delivery Time，顺序置于Confirm Delivery Time 之前

## 增加数据需求处理-管理页面

把反复出现的、典型的数据需求，做成功能，呈现为一个单独的页面。当有相关的数据需求时，相关负责人可以通过这个页面，直接进行数据需求的自动处理，不在需求开发每次重复的写SQL、提供单进行修改。

包括以下数据需求：

1、实体 name 重命名：lead、opty、customer、project、vendor、

2、lead 删除

3、运单退回到 in transit 状态

4、修改 truck type

每一项数据需求执行时，都需要同时记录历史，页面中支持分页查询修改历史。

增加该页面权限，权限只能给产研团队配置，不能开放给业务团队成员。

## UAM 角色操作优化

1、角色用户列表增加搜索功能

搜索项：alias name 和 email

搜索方式：like 搜索

2、给角色添加用户

Add Account to Role 弹窗优化

1）去掉search按钮，模糊搜索框选中结果后，自动search，取消选择结果后，自动reset

2）多选优化：选择一个用户后，搜索框上方会出现选中用户的label项，方便看到已经选择了哪些用户。

label项展示内容：alias name 和 email

label项支持删除操作，删除该项后，列表中就会取消该对应用户勾选。无需删除确认弹窗。

3、给用户快捷删除角色功能

用户列表查看角色弹窗，该用户的角色列表：

1）增加字段，角色 BU

2）增加删除角色操作。该操作需要确认弹窗： Please confirm the deletion of the role "xxxx" for the current user(alias_name).

操作限制：同一个角色BU下，只有一个角色时，不能删除这个角色。此时点击删除，提示：Since this is the only role remaining in role BU: xxx, a quick deletion of this role is not possible..

4、角色图标更换

目前的角色图标（用户列表的角色查看操作，组织架构数的角色节点）使用的是用户图标，不是角色图标。统一换成下面这个图标：

# S33 UAT

## 财务工具

Tools 增加 FA Billing Records
- 分为两个切页：**Transportation** 与**Global Forwarding**

### **Transportation**
- 允许根据以下条件进行搜索：

| 搜索参数 | 说明及示例 |
| Company name | 输入至少2个字符后进行匹配，并展示匹配结果   允许输入至少两个字符，点击搜索后进行like 匹配 |
| Service Type | 多选：枚举值：Contract, Exportation， Importation, Importation Nfh-Reim And Others, Importation-Nfh, Importation-Reim And Others, Logistics, Reim And Others, Warehouse

大小写不敏感 |
| Client Name | 同**Company name** |
| Client Tag | 同**Company name** |
| Billing Status | 代表G列（本表格第一个）的Billing Status
枚举值：Canceled, Collected, For Approval, For Billing,For Return -With lssue, Partially Collected, Pending, Re-bill |
| Date Received (Returned)By Client | 时间范围 |
| Invoice No. | 输入全匹配数字，点击搜索后匹配相关数据 |
| Covered Period | 时间范围，若 Covered Period列填的为时间段，则按末日进行命中。如填写值为1.1-1.30， 则仅搜索包括1.30的日期能命中该项 |
| Upload time | 时间范围,该条数据上传时间, 精确到分 |

- 点击 Import Records 展示弹窗
- 展示上次导入时间及结果：成功与失败的文案如下图：
- 点击 Edit data in template，进入导数模板 [https://docs.google.com/spreadsheets/d/160L0Qog1GWBQEzUpOex_1klE21X-4hyvB4YRe5zMusE/edit?gid=393889077#gid=393889077](https://docs.google.com/spreadsheets/d/160L0Qog1GWBQEzUpOex_1klE21X-4hyvB4YRe5zMusE/edit?gid=393889077#gid=393889077)
- 点击Sync data，同步数据
- 任一条数据失败，则整表失败
- 需校验两个 Billing Status 是否为所列枚举的合法数据，否则失败
- 需校验两个 Billing Status 值是否一致，要求一致，否则失败
- 需校验Date Received (Returned)By Client 是否为日期或空值，否则失败
- 需校验Covered Period是否为日期/日期段，否则失败
- 需校验数据是否重复，（client name）+（invoice no）+（Billed Amount (Gross of CWT) based on SI）+（Covered Period）均一致，则判定有重复数据，失败
- 验重范围包括历史数据与当前表数据
- 需校验 invoice number 是否为5位数或空，否则失败
- 需校验 service type 是否为所列枚举的合法数据，否则失败
- 其他字段则无需校验
- 导入失败，则模板表数据不进行处理，保留原失败数据，sheet 增加result 列, 展示第一个被校验为失败行的结果：Failed
- 导入成功，则清空模板表数据
- 日期格式，如：1/8/2024 指2024年1月8日
- 允许Covered Period 为一段时间（1/8/2024-1/30/2024）或一个日期（1/8/2024），一段时间用“-”分割
- Tips展示文案如下图
- 点击 Export Selected  Records，导出列表所有被筛选出的数据；
- 导出结果在下载中心展示（支持sheet 预览与excel 形式）
- 列表说明：
- 列表字段：除导入字段，最后为upload time ：yymmdd hhmm 记录至分即可，该列固定。
- 列表排序：按导入的原顺序进行排列即可，需进行分页（参考当前系统运单列表页样式即可）
- 列表字段与配色（@April, 需UI支持）与样表 [https://docs.google.com/spreadsheets/d/160L0Qog1GWBQEzUpOex_1klE21X-4hyvB4YRe5zMusE/edit?gid=393889077#gid=393889077](https://docs.google.com/spreadsheets/d/160L0Qog1GWBQEzUpOex_1klE21X-4hyvB4YRe5zMusE/edit?gid=393889077#gid=393889077)  保持一致
- 日期格式展示均与系统当前日期格式保持一致
- 列表操作：
- 当Billing Status为非 Collected 状态时，Collected按钮可用，点击该按钮，修改Billing Status为 Collected 状态，并刷新页面
- Billing Status为 Collected 状态后，Collected按钮 **不**可用
- Cancel, 作废该条数据，并刷新页面
- 数据被作废后，不允许任何操作，仅展示 Canceled状态
- Cancel 需做二次确认
- 批量操作：允许多选数据，进行批量操作
- 参考运单列表，所选数据需在表头展示所选数据数量
- 批量操作时，若选取了非可操作数据，如选中 Billing Status 为 Collected 状态的数据，进行批量Collected 操作，则忽略该非法数据即可
- 批量操作进行中时，页面不可操作，允许搜索 （@UI 需设计不可操作的样式）
- 批量操作完成，需展示批量操作结果（仅操作端展示）
- Cancel 的标题为 Batch Cancel Result

### Global Forwarding (已删除）

由于业务已将该表合并至LT表，故该功能删除，页面也无需切页组件进行页面切换

逻辑与Transportation 一致，对个别字段不一致的地方进行说明
- 允许根据以下条件进行搜索：

| 搜索参数 | 说明及示例 |
| Company name | 输入至少2个字符后进行匹配，并展示匹配结果 |
| Service Type | 多选：枚举值：Contract, Exportation， Importation, Importation Nfh-Reim And Others, Importation-Nfh, Importation-Reim And Others, Logistics, Reim And Others, Warehouse

大小写不敏感 |
| Client Name | 同**Company name** |
| Shipment Number | 同**Company name** |
| Delivery Completion Date | 时间范围 |
| Status in BR（Service Charges） | 代表N列的Billing Status
枚举值：Collected, For Approval, Pending |
| Status  in BR  (Reimbursable Charges） | 本表格第二个Status  in BR
枚举值：Collected, For Approval, Pending |
| Date received By client（Service) | 时间范围, Q列的时间 |
| Invoice No.（Service) | 输入全匹配数字，点击搜索后匹配相关数据 |
| upload time | 时间范围：选至分钟 |

- 点击 Import Records 展示导入弹窗
- 导入逻辑同Transportation，弹窗样式同
- 校验字段逻辑相同：仅校验需搜索的枚举值**Status in BR（Service Charges）与 Status  in BR  (Reimbursable Charges）** service type **；发票号**invoice number 是否为5位数或空
- 需搜索的时间是否为时间格式**：Date received By client （允许为空值），Delivery Completion Date**
- 查重字段为：（client name）+（INVOICE NO.）+（AMOUNT in BR - SERVICES (FORMULA)，不允许重复数据
- 其他字段则无需校验
- 导出逻辑与Transportation一致
- 列表逻辑与Transportation一致：
- 列表字段：除导入字段，最后为upload time ：yymmdd hhmm 记录至分即可，该列固定。
- 列表排序：按导入的原顺序进行排列即可，需进行分页（参考当前系统运单列表页样式即可）
- 列表字段与配色（@April, 需UI支持）与样表 [https://docs.google.com/spreadsheets/d/160L0Qog1GWBQEzUpOex_1klE21X-4hyvB4YRe5zMusE/edit?gid=393889077#gid=393889077](https://docs.google.com/spreadsheets/d/160L0Qog1GWBQEzUpOex_1klE21X-4hyvB4YRe5zMusE/edit?gid=393889077#gid=393889077)  保持一致
- 日期格式展示均与系统当前日期格式保持一致
- 列表操作：
- 当Status in BR（Service Charges）为非 Collected 状态时，Collected(Service Charges）按钮可用，点击该按钮，修改Status in BR（Service Charges）为 Collected 状态，并刷新页面
- 同理为 Collected 状态后，相关按钮 **不**可用
- **Status  in BR  (Reimbursable Charges）**状态同理，对应按钮为：Collected(Reimbursable Charges)
- Cancel, 作废该条数据，并刷新页面
- 数据被作废后，不允许任何操作，仅展示 Canceled状态
- 批量操作同Transportation一致

## 报价查询工具 V1

在 TMS 系统中，允许用户多选车辆型号、多选行业，输入起点与终点，系统筛选出“起始/目的地城市一致、路线距离相似”的历史已完成运单，并返回价格等信息供后续人工评估。

Tool 中增加子页面：Price Inquiry Tool。用户需要输入查询信息，点击 Search，页面会呈现查询结果，包括两方面信息：结果列表和统计信息。页面默认不显示任何查询结果。查询完成后，用户可以导出相应结果。
- 搜索范围：状态为 Delivered 的所有历史运单，不包含已经软删的waybill。
- 查询字段
- Truck Type：显示对应country车型列表，可多选，必填
- Industry：对应 customer 的一级 industry，可多选，选填
- Requirement Frequency：对应 project 的 Requirement Frequency，可多选，非必填
- Origin：地址输入组件，支持地图打点，L1 和 L2 必填
- Destination：地址输入组件，支持地图打点，L1 和 L2 必填（L1选择ALL时，L2非必填）
- 地址选择和解析 L1-L3，参考 RL 的 add stop point 交互，区别在于这里不用校验 address 和 L1-L3 是否匹配
- Destination L1 支持选择 “ALL”
- Address Matching Level​：单选按钮，默认L2，分国家有不同的选项值
- PH：`L2: Province` 和 `L3: Municipality/City`
- TH：`L2: Amphoe` 和 `L3: Tambon`
- 返回列表字段
- Waybill Number
- Dispatch Type
- Basic Amount Receivable
- Basic Amount Receivable/km：保留两位小数
- Basic Amount Payable
- Basic Amount Payable/km
- Route Distance(km)
- Project：project name
- Customer:：customer name
- Vendor：vendor name
- Industry
- Requirement Frequency
- Origin：L1-3 + Address，单元内分两行，L1-3 和 Address 各占一行
- Destination：同上
- Position Time
- 列表排序：按照 Position Time 倒序排列。
- 返回统计信息：分别计算查询结果中 Basic Amount Receivable 和 Basic Amount Payable 的统计值，包括以下统计项
- Max：最大值
- Min：最小值
- Median：中位数（数据排序后位于中间的值）
- 80th Percentile：80分位数（80%数据小于或等于该值）
- Mean：平均值
- Variance：方差
- 导出：导出到Sheet中，统计信息和查询列表都需要导出，导出到下载中心。
- 导出文件命名：PH/TH Price of Delivered Waybill - yymmddhhmmssfff
- 导出模板参考：[Link](https://docs.google.com/spreadsheets/d/1llrlYCxc0N4nENK4VE-pfr0z1sbSkL-TM45AHf-wQ5g/edit?gid=0#gid=0)

## 报价查询工具 v2

业务反馈的需求整理:

1. 搜索条件优化
a.行业选择框
- 增加“全选”选项，便于快速勾选所有行业类别

b.车型选择框
- 增加“全选”选项，支持一次性勾选所有车型类型

c.customer/vendor选择框
增加单选字段，必填项。用户在“Customer”与“Vendor”两种模式间二选一：
- 决定价格数据来源（客户或供应商合同价格）；
- 决定展示结构（路线维度 vs 路线+vendor维度）

d.时间范围筛选
增加起始时间与结束时间字段；
用于筛选路线价格的生效期；
命中逻辑：只要生效期与所选时间范围有任意重叠，即视为命中。
- Customer 模式 → 使用 `Customer Validity Period`

Vendor 模式 → 使用 `Vendor Validity Period`2. 数据来源与筛选逻辑
- 主数据表：路线库价格表（Route Library）。
- 数据结构：按筛选模式分别返回：
- Customer 模式：每条记录代表一条独立路线价格条目。
- Vendor 模式：每条记录代表“路线库 + vendor”组合。
- 辅助信息：每条记录需附带Delivered 状态的 Waybill Trip 数量，即该路线价格已被引用的订单数。
1. 展示字段

a.选择 Customer 时：
每条记录对应一个路线库价格条目；
每个所选车型生成一个价格列。
字段包含：
- 项目名（来自 Route Library 基本信息）
- 客户名称（Project 关联客户）
- 客户行业（客户一级行业）
- price version status
- Origin Region（来自 Route Library）
- Destination Region（来自 Route Library）
- Customer Validity Period（来自 Route Library）
- Customer Contract Number（来自 Route Library）
- 所选车型A的价格
- 所选车型B的价格（如有）
- 所选车型...的价格（如有）
- Requirement Frequency（来自 Project 基本信息）
- Route Library Created Time（创建时间）
- Delivered Waybill Trip（引用该价格的已交付waybill的数量）

b.选择 vendor 时：
每条记录对应一个“路线库 + vendor”组合；
每个所选车型生成一个价格列；
字段包含：
- 项目名（来自 Route Library 基本信息）
- 客户名称（Project 关联客户）
- 客户行业（客户一级行业）
- price version status
- Origin Region（来自 Route Library）
- Destination Region（来自 Route Library）
- Vendor 名称（来自 Route Library）
- Vendor Validity Period来自 Route Library）
- Vendor Contract Number来自 Route Library）
- 所选车型A的价格
- 所选车型B的价格（如有）
- 所选车型...的价格（如有）
- Requirement Frequency（来自 Project 基本信息）
- Route Library Created Time（路线创建时间）
- Delivered Waybill Trip（引用该价格的已交付订单数量）

排序规则：
order by rlbvv.quotation_end desc, rlbvv.quotation_start desc, rlbvv.id desc
按照route Library version的截止时间倒序，开始时间倒序，创建时间倒序

## 报价查询工具 - 整合 V1 和 V2
- 页面合并为一个

两个 tab 页合并，在 V1 的查询条件基础上增加两个仅适用于 路线库价格查询的查询条件：

1）Pricing Mode：单选，必填，选项：Route Pricing (By Route) 和 Mileage Pricing (By Distance)，默认 Route Pricing (By Route)

2）Effective Time：来自 V2 的查询条件，非必填

注意：去掉了 V2 的 Customer / Vendor 查询条件。

两个查询按钮：Search Delivered Trips、Search Route Library
- 搜索路线库的结果列表

Search Delivered Trips 的搜索结果格式不变，Search Route Library的搜索结果调整为新的格式：[Link](https://docs.google.com/spreadsheets/d/1ZAG3rcK7CbCx9oxs-mI1qb21gFZ06q_pb7qwzhl4jrE/edit?usp=sharing)
- 已有功能优化
- V1 查询统计中，八十分位数精确到两位小数。注意：需要 check 其他小数，是否有小数点后太长的问题，都精确到两位小数。
- 方差改成标准差（Standard Deviation）。页面上该数据标题旁加一个 tooltip，解释下标准差的含义。文案：A larger standard deviation indicates greater spread of data points from the average, while a smaller value shows data is more tightly clustered around the mean.
- 查询结果说明一下排序逻辑。在列表的左上方加一行，文案格式：* Sort by position time (descending).​​
- project name 单元格：project name 的下方，换行展示 project status，UI 同 project 列表的状态
- Search Route Library 结果列表，去掉 route number 和 route library created time 字段，增加RouteCode、Origin Label、Destination Label 这三个字段
- Search Route Library时，如果输入了Effective Time，对于某些 Project 而言，可能出现搜到了 route，没有匹配到 price version的情况，这时在对应的 project 结果表上方提示：* No price version exists within the Effective Time range
- 导出：
- Gross Margin 数据后面直接写百分号，列名上不再写单位：%
- 导出的所有数据（包括金额）都加上千分位号
- 查询结果新增数据展示
- 搜索路线库查询时，显示每个路线库 vendor 的个数，展示到 route library 对应表格上方。文案：This route library contains N vendors.
- 搜索路线库的 By Distance 查询时，需要显示目标搜索路线的 distance，展示到整个搜索结果上方。文案：Distance of the entered route is N km.
- 搜索和导出记录功能
- 两种搜索和对应导出都需要生成操作记录，记录哪个用户做了什么操作。只需要记录，方便后续统计，操作记录不需要做系统展示。
- 搜索：user_role、搜索参数、搜索时间
- 导出：user_role、搜索参数、导出文件 Link、导出时间
- 搜索结果导出
- 交互设计：一个 Export 按钮支持导出两种查询的结果，分为两个 Sheet Tab 页：Result of Searching Route Library 和 Result of Searching Delivered Trips。导出一个 Sheet Tab 还是两个，取决用户是否使用了两种查询，使用了哪个就导出哪个，都查询了就导出两个 Tab 页结果。
- 导出格式：[Result of Searching Route Library](https://docs.google.com/spreadsheets/d/1ZAG3rcK7CbCx9oxs-mI1qb21gFZ06q_pb7qwzhl4jrE/edit?gid=1518945037#gid=1518945037) 和 [Result of Searching Delivered Trips](https://docs.google.com/spreadsheets/d/1ZAG3rcK7CbCx9oxs-mI1qb21gFZ06q_pb7qwzhl4jrE/edit?gid=1810771607#gid=1810771607)
- 导出文件名：PH/TH Result of Rates Inquire - yymmddhhmmssfff

## 报价查询工具 - 车型选项优化
1. Search trips 时，truck type 匹配 Customer Requested Truck Type，结果列表中 truck type 列变为 Customer Requested Truck Type 和 Actual Use Truck Type 两列；
2. Truck Type 筛选项旁，增加 Tooltip 提示：
> When searching for trips, it will match the truck type requested by the customer.
When searching the route library, it will match the truck type in the price database.

查询和导出操作需要增加完整记录，做只记录，不做页面展示