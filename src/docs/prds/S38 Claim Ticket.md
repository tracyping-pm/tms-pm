61truedefaultlisttrue考虑Claim 结算的特殊性：可能在运单完成后添加该运单的Claim, 可能与运单无关的Claim, 为实现该场景，将 Claim 模块与运单模块进行解耦设计：通过独立监控 Claim 模块，并以工单（Ticket）作为 载体，最终实现 Claim 业务与运单业务的解耦，避免因业务关联性导致的流程阻塞或数据依赖问题。
# Claim Ticket 流转

流程图说明：
note284ed49c-9549-4ae9-af50-b457cd837242
红色线条：正向流程

黑色线条：逆向流程

蓝色线条：取消

圆形：开始节点

矩形：过程节点

圆角矩形：终态节点

菱形：判断节点

红色线条：正向流程

黑色线条：逆向流程

蓝色线条：取消

圆形：开始节点

矩形：过程节点

圆角矩形：终态节点

菱形：判断节点

### Ticket 状态流转说明：

|  | 起始状态 | **操作**按钮 | 操作 | 操作后状态 |
| 1 | 创建 | Submit | OC 判定 oc status为Not Chargeable/Inteluck Expense/Proceed to Deduct | Claim team review |
| 2 | 创建 | -- | OC 创建时 oc status选择还需确认Ongoing Validation | Ongoing Validation |
| 3 | Ongoing Validation | Confirm | OC判定  oc status为Not Chargeable/Inteluck Expense/Proceed to Deduct

需与其他confirm 区分开，该confirm 操作按钮为OC 操作，单独创建相关权限（权限数命名为OC Confirm）. 
 仅在Ticket status为ongoing    OC status 为非ongoing时   就展示 OC confirm

Ticket status为ongoing   OC status为ongoing  ，则不展示confirm 按钮 | Claim team review |
| 4 | Ongoing Validation | Cancel Ticket | 工单创建错误 | Canceled |
| 5 | Claim team review | Confirm | Claim Team 确认，且 OC Status 为 Inteluck Expense | For Deduction |
| 6 | Claim team review | Confirm | Claim Team 确认，且 OC Status 为 Not Chargeable(工单不关联AR） | Closed |
| 7 | Claim team review | Confirm | Claim Team 确认，且 OC Status 为 Not Chargeable（工单关联AR） | For Deduction  Add |
| 8 | Claim team review | Ongoing Validation | Claim Team 认为该机存存在争议 | Ongoing Validation |
| 9 | Claim team review | Confirm | Claim Team 无异议 | Pending Vendor Confirm |
| 10 | Pending Vendor Confirm | Cancel Ticket | 工单创建错误 | Canceled |
| 11 | Pending Vendor Confirm | Ongoing Validation | 供应商反馈有争议，需再确认 | Ongoing Validation |
| 12 | Pending Vendor Confirm | Vendor Disputed | 供应商反馈争议，Pending 在供应商处 | Vendor Disputed |
| 13 | Vendor Disputed | Ongoing Validation | 争议问题需修改工单 | Ongoing Validation |
| 14 | Vendor Disputed | Confirm | 争议问题无需修改工单 | For Deduction |
| 15 | Vendor Disputed | Cancel Ticket | 工单创建错误 | Canceled |
| 16 | Pending Vendor Confirm | Confirm | 供应商无争议 | For Deduction |
| 17 | For Deduction | Completed | 根据工单关联AR与AP 对账单情况进行工单状态关闭 | Closed |

# Claim Ticket List

新增Claim Ticket 菜单

Claim Ticket 列表页展示相关搜索条件及Ticket 列表。允许新建工单及导出工单列表
- 列表排序逻辑：按创建时间倒序
- 工单列表数据权限控制
- 若该工单有关联项目，则仅允许该项目member进行查看 ，操作
- 若该工单未关联项目，则允许所有该菜单权限人进行查看，所有操作权限人进行操作
- 特殊角色： 不在项目 member 中的角色： 如IT, FA ，若有相关查看，操作权限，需允许查看及操作 所有工单数据

### 列表字段及搜索条件：

备注：由于改图的不及时性，若有图片与文档说明字段对不上的，均已文档为准

|  | 字段 | 含义 | 字段说明 | 是否搜索条件 | 搜索说明 |
| 1 | Ticket Number | 工单编号 | 自动生成，

Claim Ticket: 国别+CT+YYMMDD+4位流水号+2随机码
Refund Ticket :国别+RT+YYMMDD+4位流水号+2随机码

如 PHRT2511130001LT | Y | 模糊搜索，输入两位及以上模糊匹配，参考运单号 |
| 2 | Affiliated Project | 关联项目 | Claim 所属项目 | Y | 模糊搜索，输入两位及以上模糊匹配

若该工单无关联项目，则展示为“-” |
| 3 | Claim Type | 索赔类型 |  | Y | 多选，两级，允许只选择一级，即搜索该一级类目下所有二级类目 |
| 4 | Claim Amount | 金额 | 索赔金额，不支持负值，均保留两位小数，且右对齐 | N |  |
| 5 | Claimant | 索赔方 | 客户 / 内部（Inteluck） | Y | 模糊搜索，输入两位及以上模糊匹配，参考customer name ,  范围为 Inteluck corporation + 所有客户 |
| 6 | Responsible Party | 责任方 | 供应商 / 内部（Inteluck） | Y | 模糊搜索，输入两位及以上模糊匹配，参考Vendor name ,  范围为 Inteluck corporation+ 所有供应商 |
| 7 | Deduction f or Customer | 客户侧扣款状态 | Deducted  ：工单已关联AR 对账单，且对账单状态为终态：Collected

Written Off：工单已关联AR 对账单，且对账单状态为终态：Written Off

For Deduction：工单已关联AR 对账单，且对账单状态为 **非**终态

Not Linked AR： 工单未关联AR 对账单 | Y | 单选，为空则默认全部 |
| 8 | Deduction for Vendor | 供应商侧扣款状态 | Deducted ：工单已关联AP 对账单，且对账单状态为终态（Paid）

Written Off：工单已关联AR 对账单，且对账单状态为终态：Written Off

For Deduction：工单已关联AP 对账单，且对账单状态为 **非**终态

Not Linked AP： 工单未关联AP 对账单 | Y | 单选，为空则默认全部 |
| 9 | Creation Time | 创建时间 | 自动生成 | Y | 参考运单创建时间 |
| 10 | Creator | 创建人 | nick name | Y | 多选，输入两位及以上模糊匹配， 搜索范围是否局限本list 所有已有创建人 |
| 11 | Ticket Status | 工单状态 | 参考状态表格 | Y | 多选 |

### Export Ticket

导出筛选出的工单列表，导出字段与列表字段一致，不再另行说明

与运单一样，进行数量限制，暂定30,000条

### Create Claim Ticket

以下图片分别为不同的Claim Type 创建Claim Ticket, 字段有些许不同，请注意

UI 布局需重新设计，仅参考字段即可
- **Claim Type： 单选，**可选项为 Internal Claims ------二级： GPS，DDC Training Fee，Crew Uniform Charges  ，Inteluck Insurance，Coupon Fees，Stuffing Fee - CDC，Equipment Fee ，Medical Fee
- External Claims --------二级：Delivery Claims, KPI Claims ，Theft Incident,  Others
- **Claim Type= External Claim 时**，需选择 Is Claim based on Waybill , 填写Affiliated Project
- Delivery Claims 时，Is Claim based on Waybill = Yes，不可修改
- Is Claim based on Waybill = No， 则**无**需选择关联运单号，需填写Claim Details （限制200字）与金额
- Is Claim based on Waybill = Yes , 若为Yes, 则需选择关联运单号
- 模糊搜索运单，选中运单后带出该运单相关信息。 若运单信息有更新，载入Ticket 详情页进行一次刷新
- Waybill No. , 可选运单为该运单 客户与供应商与该工单所填写责任方与索赔方不冲突。 即索赔方为运单客户或ITK，责任方为运单供应商或ITK，若所选运单客户或供应商与 工单中的索赔方/责任方冲突需进行提示  Add
- 运单号外框置红并提示：The waybill vendor does not match the selected responsible party. 【供应商与责任方不符, 且责任方不为ITK】
- The waybill customer does not match the selected claimant【客户与索赔方不符， 且索赔方不为ITK】
- 两个均不符，则提示【客户与索赔方不符】即可
- 运单无供应商情况也适用
- Delivery Date，Confirm Delivered 日期，若还未Delivered 则 展示“ - ”
- External Code，展示Type+Code , 若有多条，换行展示。为空则 展示“ - ”
- 图中的External Code， 更新为Customer Code。//  update
- 填写Claim Details （限制200字）与金额
- 若该运单已被其他external工单  关联过，则提示“The waybill has been associated with another ticket.” ，但允许关联
- 不限制运单状态，除Canceled 运单不可被关联，提示：Canceled waybills cannot be linked to Claims.
- **Affiliated Project**为非必填； 需为所选 Claimant 客户下项目，项目暂不限制状态
- 项目名输入两个及以上字母时展示该客户下匹配项目可选
- 若先填写项目，未选择****Claimant ，则项目无可匹配内容
- 填写运单与项目关联关系不控制
- **Claimant**:  必填项
- Internal Claim时， Claimant 默认为 Inteluck Corporation，不允许修改
- External Claim 时， **Claimant** 可选范围为TMS 所有客户，模糊搜索模糊搜索，输入两位及以上模糊匹配，参考customer name
- **Responsible Party**:  必填项，可选项为 Inteluck Corporation+ TMS 所有Vendor
- 若Responsible Party为inteluck ，则OC Status 被置为 Inteluck Expense，且 不 允许修改  为 Not Chargeable 。（除非修改responsible party)  Del
- 点击 OC Status 提示：**Responsible Party: Inteluck. Update Responsible Party first to modify OC Status.**
- 但不允许Claimant 与 Responsible Party 均为inteluck ，则红框且提示“**The Claimant and Responsible Party cannot both be Inteluck**”
- **Claim Type= Internal Claim** ,根据二级类目不同，Descripction 需填写不同的信息。所有不限制内容的部分，限制 200个字符长度
- GPS，需填写安装月份与车牌，如图
- DDC Training Fee， Site 不限制，DDC Schedule 填写日期，Driver's Full Name（暂不限制是否为TMS Crew)
- Crew Uniform Charges , Requestor Name 暂不限制，Size 选XS,S,M,L,XL,XXL,XXXL,XXXXL，Qty 需正整数，不大于9999
- Inteluck Insurance，Plate No. 暂不限制，允许TMS以外的车牌， Insurance Company 与Coverage Type 均不限制，不允许特殊符号
- Coupon Fees，Plate No.  暂不限制，允许TMS以外的车牌，RDD 填写日期，Qty需正整数，不大于9999
- Medical Fee，Name暂不限制是否为TMS Crew，Position (Driver/Helper)，选择，选项为 Driver，Helper
- Equipment Fee， Installed Date 选择日期，Item不限制 内容，Requested By 暂不限制是否为TMS Crew，Location暂不限制
- Stuffing Fee， 填写Waybill No. 失焦后 带出该运单信息。Delivery Date，Plate No.，Truck Type（实际使用的车型），Driver。FO需自行填写，暂不限制内容
- 该费用展示在运单详情-Claim 处--Vendor 侧  Add
- Claim Type 由于根据登录角色进行控制，即OC 创建一些类型，Procument 可创建一些内部类型，且为考虑后期如果角色权限变动的灵活性，不进行写死。是否可以将Type 定义为权限资源在UAM 中进行配置
- 如若不行，则进行前端控制，根据登录角色进行可选Type 控制
- 需Basic Info ( Claim Type , Claimant ,Responsible Party ,Affiliated Project 等 Description 之前的信息) 填写完毕，才允许操作Description
- 根据所填Claim Amount，每行description 中的各金额失焦后即计算Total Claim Amount
- Claim Amount 不支持负数，仅允许正数/ 0
- 若Total Claim Amount =0 ，则OC Status =Not Chargeable，且不允许修改。（除非修改Claim Amount )
- 点击 OC Status 提示：**Total Claim Amount = 0. Update to non-zero first to modify OC Status.**
- **OC Status** :必填，单选，仅 Description 填写完毕可进行操作。 可选项为：Not Chargeable，Inteluck Expense，Ongoing Validation，Proceed to Deduct
- Edit 工单，允许Description 完整，可编辑OC status
- 选Ongoing Validation，则点击确认后，该工单状态置为Ongoing Validation
- Proceed to Deduct，Inteluck Expense,Not Chargeable 则点击确认后，该工单状态置为Claim team review
- **Remark**：说明，非必填，允许1000字以内；允许后续持续添加多条。 包括Closed 状态依然允许添加
- **Proof**:  OC Status 为 Ongoing Validation 为非必填
- OC Status 不为 Ongoing Validation ， 则 必填，允许多个附件，大小限制与其他附件上传保持一致即可

External Claim 类型的工单创建 页面示意：
- External Claim 类型的工单允许创建 Refund Ticket

Internal Claim 类型的工单创建 页面示意：
- 以下创建根据ClaimType 不同，字段有不同点
- 提交按钮 采用 Submit 文案代替图中的Confirm
Claim Type = Internal xxxx ,  创建页,  二级类目请参考图片

# Claim Ticket Details

- .参考HR系统，详情页单独展示并在详情页展示列表（列表字段可只展示编号，claimt , responsible party ,和Ticket Status字段）//  ，由于detail 信息字段不多，考虑从列表选中，从页面右侧呼出详情页。允许在该页列表点击工单号，即展示不同工单详情
- 若页面宽度不够，可考虑列表侧此时隐藏部分展示字段
- 未关联对账单时，不展示 linked Statment  字段
- 不是由 Claim request 自动创建的工单，不展示 Linked  Claim request
- 未关联Refund Ticket 时，不展示 Linked Refund Ticket
- 操作日志记录内容：
- 操作时间， 操作人昵称， 操作内容
- 由系统自动关闭的，操作人记录为System
- Export DM ，不同Claim Type 导出格式参考对应创建字段。具体样式参考 样表链接（Sheet 1 为DM 格式，sheet 2 为该工单Proof , 导出需导出两个sheet )
- 导出内容至 下载中心，导出文件命名为 DMYYMMDD+下载流水号

[https://docs.google.com/spreadsheets/d/1mVKABow8bbv70KYQO5Cf48SS4NUlQFWOmWfdhL1p1iI/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1mVKABow8bbv70KYQO5Cf48SS4NUlQFWOmWfdhL1p1iI/edit?gid=0#gid=0)
- Cancel ticket，需对工单的关联情况进行校验：
- 若为系统创建工单（有关联Claim Request ），则不允许取消 , Cancel 按钮置灰，点击提示：Tickets created by AR cannot be canceld. Please contact the PD team for assistance.
- 暂不支持业务上需取消，编辑的场景，该场景较为小众，但需处理较复杂逻辑。 若有需求后台进行相关处理
- 若工单已关联（非取消状态）退款工单（Refund Ticket) 则需移除关联后才能取消工单  Add
- 提示：The ticket cannot be canceled directly. This ticket is associated Refund Ticket， [RT编码].  Please remove the association of this ticket from the refund ticket, and then try to cancel it.
- 允许点击该RT编码，跳转至对应退款工单
- 工单未关联AR/AP ，可直接取消工单，需弹窗二次确认：**Should the ticket be canceled?**      No     Yes, cancel
- 工单已关联AR或AP ，其中AR,AP 均未到终态（Colletced ,Paid, Write Off) 则需移除关联后才能取消工单
- 提示：The ticket cannot be canceled directly. This ticket is associated with the unfinished  statement [对账单编码]. Please remove the association of this ticket from the statement, and then try to cancel it.
- 允许点击该对账单编码，跳转至对应对账单，若有AR/AP 两个对账单，则展示两个对账单编码
- 工单已关联AR或AP ，其中AR,AP 任一到终态（Colletced ,Paid, Write Off) ，则不允许取消工单
- 提示：This ticket is associated with statement [Statement No.], which has been settled. Therefore, the ticket cannot be canceled.
- 不同状态可操作按钮如下表：
- Edit 工单Description 信息，@ UI. 参考创建页面，弹窗修改
- Edit 工单时还需判断:
1. 若为系统创建工单（有关联Claim Request ），则不允许Edit , Edit按钮置灰，点击提示 **Tickets created by AR cannot be edited. Please contact the PD team for assistance.**
2. 该工单若已关联AR ，则需所关联AR statement 状态为Under Billing Preparation，Awaiting Customer Confirnation, Awaiting Re-bill 才允许修改金额   Del
3. deducted /write off 状态，若关联对账单已终态，则不再允许编辑金额( 主要针对AR 创建工单）
4. 该工单是否关联了 refund 工单，若关联了refund ,需取消refund 才能编辑原工单
- 提示文案：Disassociate the refund ticket (CRXXXXXXX) to enable editing

|  | Ongoing Validation | Claim team review | Pending Vendor Confirm | Vendor Disputed | For Deduction | Closed | Canceled |
| Edit Ticket info | 1 |  |  |  |  |  |  |
| Edit OC status | 1 |  |  |  |  |  |  |
| Add Remark | 1 | 1 | 1 | 1 | 1 |  |  |
| Add Proof | 1 | 1 | 1 | 1 | 1 |  |  |
| Create Refund | 1 | 1 | 1 | 1 | 1 | 1 |  |
| Cancel Ticket | 1 |  | 1 | 1 |  |  |  |
| Submit | 1 |  |  |  |  |  |  |
| Confirm | 1 | 1 | 1 | 1 |  |  |  |
| Ongoing Validation |  | 1 | 1 | 1 |  |  |  |
| Vendor Disputed |  |  | 1 |  |  |  |  |
| Completed |  |  |  |  | 1 |  |  |
| Export Debit Memo |  |  | 1 | 1 | 1 | 1 |  |

- 当工单状态为 For Deduction ,  点击Completed **：**
- 若 Responsible Party 为Inteluck,（ITK赔付给客户） 则该工单只需关联 AR，则 Deduction for Customer =Deducted，Written Off 时，工单状态更新为Closed Completed
- Claimant 为Inteluck( ITK向供应商索赔）, 则该工单只需关联 AP，则 Deduction for Vender =Deducted，Written Off 时，工单状态更新为Closed Completed
- 若 Responsible Party 与Claimant  均为第三方（供应商赔付给客户），则需Deduction for Vender/ customer 均 =Deducted，Written Off 时，工单更新为 Closed Completed
- 若OC Status 为Not Chargeable，工单关联了AR，且Claim 金额不为0， 则该工单需关联至少1个一状态为 Closed 的退款工单才能关闭，（暂不考虑claim 金额是否与refund 金额相等）。否则点击completed 时提示：For tickets marked as "Not Chargeable" with a non-zero Claim Amount, they must be associated with a Closed Refund Ticket before being closed.
- 若OC Status 为Not Chargeable，工单 未 关联AR。 则 confirm 后，该工单直接关闭（Closed） Add
- 若Responsible Party 与Claimant  均为 ITK, 则无需关联AR和AP，点击Completed则更新为Completed  Add
- 若不满足以上条件，则无法关闭，进行提示：The ticket cannot be completed because the associated statement has not be deducted

### Refund Ticket

Refund Ticket List

列表字段及搜索条件：

|  | 字段 | 含义 | 字段说明 | 是否搜索条件 | 搜索说明 |
| 1 | Ticket Number | 工单编号 | 自动生成，国别+RT+YYMMDD+4位流水号+2随机码

如 PHRT2511130001LT    更新 | Y | 模糊搜索，输入两位及以上模糊匹配，参考运单号 |
| 2 | Total Redund Amount | 退款金额 | 本工单退款总额 | N |  |
| 3 | Refunding Party | 退款方 | 客户 / 内部（Inteluck） | Y | 模糊搜索，输入两位及以上模糊匹配，参考customer name ,  范围为 Inteluck corporation + 所有客户 |
| 4 | Payee | 收款方 | 供应商 / 内部（Inteluck） | Y | 模糊搜索，输入两位及以上模糊匹配，参考Vendor name ,  范围为 Inteluck corporation+ 所有供应商 |
| 5 | Refund for Customer | 客户侧退款状态 | Refund = ：工单已关联AR 对账单，且对账单状态为终态：Collected

Written Off：工单已关联AR 对账单，且对账单状态为终态：Written Off

Refunding ：工单已关联AR 对账单，且对账单状态为 **非**终态

Not Linked AR： 工单未关联AR 对账单 | Y | 单选，为空则默认全部 |
| 6 | Refund for Vendor | 供应商侧退款状态 | Refund ：工单已关联AP 对账单，且对账单状态为终态（Paid）

Written Off：工单已关联AR 对账单，且对账单状态为终态：Written Off

Refunding：工单已关联AP 对账单，且对账单状态为 **非**终态

Not Linked AP： 工单未关联AP 对账单 | Y | 单选，为空则默认全部 |
| 7 | Linked Claim Ticket | 关联的Claim Ticket number | 允许从列表处点击并跳转 | Y |  |
| 8 | Creation Time | 创建时间 | 自动生成 | Y | 参考运单创建时间 |
| 9 | Creator | 创建人 | nick name | Y | 多选，输入两位及以上模糊匹配， 搜索范围是否局限本list 所有已有创建人 |
| 10 | Ticket Status | 工单状态 | 参考状态表格 | Y | 多选 |

Create Refund Ticket
- Create Refund, 创建入口为 Claim Ticket Detail 及列表
- 若从 Claim Ticket Detail 创建，则默认关联该工单
- 若从列表创建，填写完Linked Claim Ticket 后，需校验该工单是否为External Claim  ticket
- 仅关联的 External Claim 可创建Refund Ticket
- 若为 internal Claim ticket , 则外框置红并提示：Only External Claims  ticket can create associated Refund Ticket.
- 若为 canceld cliam ticket 则外框置红并提示：Associating cancelled claim tickets is not supported.
- Refunding Party 默认为原Claim Ticket 的 Claimant ,Payee 取原  Claim Ticket 中的Responsible Party ; 允许修改，将其中任一方修改为Inteluck corporration
- 不允许两方均为Inteluck corporration
- Affiliated Project 从原Claim Ticket ，不允许修改。 原为空，则依然保持为空即可
- Total Refund Amount 参考Claim Ticket  中的 Total Claim Amount 进行计算
- Claim Details 与Claim Amount 从原Claim Ticket 中获取，不允许修改
- Refund Amount 仅允许填写正数或0 ，与原Claim Amount 不做校验，关联
- OC Status  选项为： Ongoing Validation 或 Proceed to Refund
- Ongoing Validation ，submit 后保持Ongoing Validation  状态
- Proceed to Refund ，submit 后到Claim team review 状态

Refund Ticket Detail

参考Claim Ticket Detail, 列表页呼出进行展示

- 未关联对账单时，不展示 linked Statment  字段
- Cancel ticket，需对工单的关联情况进行校验(与Claim Ticket一样） ：
- 工单未关联AR/AP ，可直接取消工单，需弹窗二次确认：**Should the ticket be canceled?**      No     Yes, cancel
- 工单已关联AR或AP ，其中AR,AP 均未到终态（Colletced ,Paid, Write Off) 则需移除关联后才能取消工单
- 提示：The ticket cannot be canceled directly. This ticket is associated with the unfinished  statement [对账单编码]. Please remove the association of this ticket from the statement, and then try to cancel it.
- 允许点击该对账单编码，跳转至对应对账单，若有AR/AP 两个对账单，则展示两个对账单编码
- 工单已关联AR或AP ，其中AR,AP 任一到终态（Colletced ,Paid, Write Off) ，则不允许取消工单
- 提示：This ticket is associated with statement [Statement No.], which has been settled. Therefore, the ticket cannot be canceled.   Del
- 不同状态可操作按钮如下表：
- Edit 工单 信息，@ UI. 参考创建页面，弹窗修改（Description仅修改Refund Details和Refund Amount）
- Edit 工单时还需判断，该工单Refund for customer 或 Refund for Vendor 不为Refund /write off 状态，若关联对账单已终态，则不再允许编辑金额

|  | Ongoing Validation | Claim team review | For  Refund | Closed | Canceled |
| Edit Ticket info | 1 |  |  |  |  |
| Edit OC status | 1 |  |  |  |  |
| Add Remark | 1 | 1 | 1 |  |  |
| Add Proof | 1 | 1 | 1 |  |  |
| Cancel Ticket | 1 |  |  |  |  |
| Submit | 1 |  |  |  |  |
| Confirm |  | 1 |  |  |  |
| Ongoing Validation |  | 1 |  |  |  |
| Completed |  |  | 1 |  |  |

- 当工单状态为 For Refund ,  点击Completed **：**
- 若 Refunding Party 为Inteluck,（ITK退款给供应商） 则该工单只需关联 AP，则 Refund for Vendor =Refund，Written Off 时，工单状态更新为Closed
- Payee  为Inteluck( 客户退款给ITK）, 则该工单只需关联 AR，则Refund forCustomer =Refund，Written Off 时，工单状态更新为Closed
- 若 Refunding Party 与Payee  均为第三方（客户退款给供应商），则需Refund for Vendor / customer 均 =Deducted，Written Off 时，工单更新为 Closed
- 若不满足以上条件，则无法关闭，进行提示：The ticket cannot be completed because the associated statement has not be Refund

# Claim in Waybill

### Claim Ticket

若为关联运单的Claim ,  且OC status  不为 Not Chargeable 需将对应Claim 回显至对应运单   update
- Closed状态与canceld 状态的工单值则不展示在运单侧（工单更新为该状态时，从运单侧删除该工单） Add
- 若Claimant 为Inteluck，Responsible Party 为供应商 ( 供应商赔付给ITK） ， 则运单Claim 模块仅展示 Vendor 侧
- Claimant 为客户，Responsible Party 为Inteluck （ITK 赔付给客户）,  则运单Claim 模块仅展示 Customer 侧   update
- 若 Responsible Party 与Claimant  均为第三方（供应商赔付给客户），则两侧均展示
- 若Responsible Party 与Claimant  均为ITK， 则两侧均不展示  Add
- Internal Claim中的Stuffing Fee 是关于运单的，所以需在对应运单中进行展示，展示在Vendor 侧
- 若对应Claim Ticket 被取消，则运单刷新同样不展示对应Claim 信息
- linked工单与对账单，参考其他结算项关联 对账单展示方式进行展示与跳转
- 关联工单弹窗展示内容：工单类型+工单编号。 如：Claim Ticket :11111.   Rufund Ticket: 2222222.  Add
- 关联对账单弹窗展示内容 ：工单类型+ AR对账单编号 （标题 AR Statement)  + AP对账单编号（标题 AP Statement)。  如：Claim Ticket :AR11111   AP11111111.      点击跳转查看   update
- 一个运单允许关联多个工单，且运单终态后仍允许关联工单，故Claim 处可能有多个关联工单的claim
- 展示内容：Claim Type + 金额
- 同一claim type 需聚合为一条，明细则通过linked 工单查看
- claim 内容展示在前，refund 展示再后。   Add

### Refund Ticket

关联运单的ClaimTicket  的Refund 部分，同样需 回显至对应运单
- 客户退款给供应商，则运单Claim 模块 Vendor，Claim 侧 均按进行展示， 注意此处需展示为负数   ( refund 金额展示为正数，但总Claim 应为减去该数字） （原Redund 工单为正数），且Claim 总额为 Claim 金额- Refund 金额
- 客户退款给 Inteluck, Payee 为Inteluck,  则退款金额仅在customer 侧展示
- Inteluck 退款给供应商，, Payee 为供应商， 则退款金额仅在vendor 侧展示
- 展示内容：Refund ticket + 关联claim ticket 的cliam type + (  金额）//

若工单金额为0 则不在运单进行展示  Add

### Create Ticket
- 允许从运单--claim 模块处 创建Claim 工单 【暂不支持创建RefundTicket  】
- 此入口创建工单，仅支持External Type, 且Affiliated Project ，关联运单默认为该运单相关信息，不可修改
- Claimant 及 Responsible Party ，默认为本单相关信息，允许修改其中一个为inteluck
- 创建成功需弹窗提示已创建成功并展示 工单编号，允许点击跳转

### 历史数据处理
- 将Claim Subtask （已完结状态Sutask） 处理为工单类型
- 按原subtask 一个类型转为一个工单（且Vendor 侧和客户侧分别生成工单）
- 工单状态根据关联的对账单 ：若已终态，则该工单为Closed Completed
- 若关联的对账单未终态，或未关联工单，则该工单为For Deduction
- 该工单remark 均添加一条：**Historical Data**
- 原subtask 则无需处理，保留在subtask 列表即可
- 若处理为subtask 形式，则页面需兼容原Claim 的展示都不用再进行展示（注意页面内容 @前端  ）
- 在途sutask 不处理，且不进行金额回写（至运单）
- 由业务确认后，通过工单形式自行处理
- 需删除 在途Claim subtask 对运单状态的影响  Add
- 原Claim Subtask 项目中的配置需取消, 即不再自动生成Claim 类型 Subtask
- Claim in Dashboard 暂不处理，下期 Claim Dashboard 再处理这块逻辑
- 补充：相关表格数据处理：//  Add
- 1. 导出运单Claim 值，依然导出该运单所关联的客户侧及供应商侧 Claim，其值为 claim 金额- refund 金额。 历史数据不处理
- 2. 对账单详情导出: 运单 Claim同上
- 对账单列表导出：Claim 依然取该对账单Claim 总额即可
- Batch  Price update ;删除所有Claim 列，即不再允许批量修改Claim
- ITK作为责任方/ 索赔方 为虚拟对象，不取当前系统已存在的ITK客户/供应商。 所有工单，父工单统一新建 **Inteluck Corporation (Virtual)  ,**作为记录ITK作为工单主体一方的载体。 Add
- 进行相关选择时，统一置为第一个选择项

### 关联处理   Add

说明与工单/对账单等有关联的单据处理方案：
- 运单关联了工单（refund, claim ticket），取消运单：
- 若工单全已终态（closed, completed），则该运单允许取消，取消时需提示：There is an associated Ticket ,  Confirm cancellation?   按钮： Yes, Cancel waybill ,     No, Close
- 若关联工单为 canceld，该运单不受影响
- 若关联工单有未终态，则不允许取消，取消时需提示：This waybill is linked to Ticket【工单号】; the Ticket association needs to be removed.     工单号，点击跳转对应详情
- 运单关联了工单，重新分派供应商（Assign Carrier）, 同取消运单操作：
- 若工单全已终态（closed, completed），则该运单重新派供应商，Assign时需提示：There are associated tickets. Confirm  reassign the carrier? 按钮： Yes,   reassign,     No, Close
- 若关联工单全为 canceld，该运单不受影响
- 若关联工单有未终态，则不允许取消，取消时需提示：There is an associated ticket【工单号】. the Ticket association needs to be removed.
- 对账单关联了父工单（Request），取消对账单：
- Request 状态全为 pending OC, 允许取消，且取消该父工单，取消对账单时提示：The associated Request【Request 编号】 will be cancelled synchronously. Confirm cancelling the statement。按钮： Yes, Cancel statement      No, Close
- Request 状态全为 Split Failed , 该对账单不受影响
- Request 状态有为 Split，Spliting    由于当前该状态不允许取消，需联系开发进行手动取消，并取消所有拆分出的工单可取消该对账单。提示：Request【Request 编号】 is associated.  Statement Cancellation is not allowed—please contact the development team for handling.
- 备注request拆分出的工单，不可与该对账单解绑并关联其他对账单
- 结算项关联了对账单的运单，相关编辑:
- 结算项已关联非canceled 状态 AP 或 AR ，则不允许Assign Carrier, ,Assgn时提示：The settlement item is associated with a statement . Reassigning  carrier is not allowed.
- 结算项已关联非canceled 状态 AP 或 AR ，不允许编辑被关联结算项金额，置灰不可编辑（ 已有逻辑）
- 结算项已关联非canceled 状态 AP 或 AR，不允许编辑该运单 billing Truck Type, 该弹窗置灰，并提示：The settlement item is associated with a statement .Editing the billing truck type is not allowed.
- 以上message 提示，由于较长，都需要展示3S及以上，具体前端可再自行查看判断

# Claim in Statement

Claim 结算需与AR/AP进行关联，逻辑参考运单其他结算项
- 创建对账单时，不保留Claim 结算项，若有在途Subtask，需业务确认后通过工单进行重新提交，并关闭原Subtask
- Claim 在对账单中的展示
- 对账单详情中的运单列表不再展示Claim 列（包括导出，编辑均不再展示Claim列)  Add
- 历史数据(方案待定）（来自运单中的Claim）展示按原逻辑
- Claim / refund Ticket 数据，通过Claim Ticket Detail 进行工单数据关联/解绑，查看
- 总和展示依然参考原逻辑, 增加前缀（ticket type ）：（Claim Ticket）+Claim Type(仅展示二级类目） + 金额 , （Refund Ticket） + 金额( refund 金额展示为正数，但总Claim 应为减去该数字）
- Total Amount Receivable = Waybill Contract Revenue - Claim+ Others ,
- AP Statement 同理，Total Amount Payment =****Waybill Contract Cost****- Claim+ Others 。

### Claim Ticket Detail
- Claim Ticket Detail 下拉展示 Claim Detail ,展示原从运单获取的Claim Detail
- 点击Claim Ticket Detail 则参照 Claim Detail  在新页面展示从Ticket 获取的Claim 来源细节
- Remove 可移除该工单与对账单的关联关系，
- 关联AR 的不展示Deduction for Customer,    不展示Claimant
- 关联AP 的不展示Deduction forVendor , 不展示 Responsible Party
- 仅对账单处于**under billing / payment preparation** ，**Awaiting Customer/ Vendor  Confirmation /awaiting re-bill**时允许 Add 与Remove 工单，其他状态对账单，不展示此两个按钮 。
- 且此两个按钮均需设置权限
- Refund Ticket 在另个Tab 展示，参考本表即可
- Add Ticket 添加关联工单，参考添加关联运单交互
- 填写需添加 工单 编号， 输入两位数后开始匹配，选择对应工单
- 所选工单必须为 For Deduction / For Refund 状态才允许 关联，否则外框置红并提示：只允许关联 For Deduction / For Refund 状态的工单
- 需校验所选工单，是否Claimant 为该AR的 客户 或 Responsible Party 为AP 的供应商； 否则外框置红并提示：The claimant of this ticket does not match.     或 The Responsible Party of this ticket does not match
- 若添加Refund 工单，则校验Refunding Party是否为该AR的 客户 或Payee 是否 为AP 的供应商； 否则外框置红并提示
- 校验所选工单是否已关联 其他AR/AP ，一个工单仅允许关联1个 AR/AP    ， 否则外框置红并提示：This ticket is already associated with another AR Statement.   或 This ticket is already associated with another AP Statement.
- 若为AP关联，则还需限制Claim 工单状态必须为 For Decuction才允许关联
- 否则外框置红并提示 ：The ticket status must be "For Deduction".
- 若为Refund 工单，需工单状态为For Refund 才允许关联
- 添加弹窗说明 在AR 处为：Only Claim Tickets of this client can be added, and they must not be associated with any other AR statements
- AP处为Only Claim Tickets confirmed by this supplier can be added, and they must not be associated with any other AP statements.
- 为适应用户习惯，新的Claim 工单金额中的Claim 金额已正数进行记录和流转（后续退款工单为负数）。与原运单/subtask 处所添加的Claim金额相反
- 历史数据中不处理运单，subtask 及对账单waybill 模块处的数据符号。 但到对账单billing 模块，需对所有 历史 Claim 数据做 取反 操作。
- 举例：对账单两个运单，即从运单1 取出一笔500， 运单2 一笔-1000， 该对账单 Claim为-500， Billing 模块取反为 500，然后计算总额时，账单应收/应付总额 = 常规费用总额 -500
- 若有极端情况，即历史数据为 +600 （客户向我们赔付）， 则billing 取反为 -600，然后计算总额时，账单应收/应付总额 = 常规费用总额 -（-600）= 常规费用总额+600
- AR Dashboard 中的Claim 列的历史数据, 也需取反。且Aomunt 列计算逻辑 从 原+ Claim ,更新为 - Claim
- AR Dashboard 中的Claim 列 后续取来自工单的数据则正常获取
- 对账单Billing 模块 Total Amount Receivable/ Total Amount Payment  , 对于Claim 数据，均为减去该数据。 账单应收/应付总额 = 常规费用总额 + ( - Claim金额的绝对值 )

# Claim  Request

业务场景为：AR团队收款时才被告知的扣款，需由AR 团队创建该工单，故该功能仅AR statement 才有，AP 无。因为AR 团队创建时无法得知工单更详细信息，且可能涉及到多个供应商，故此处不直接创建工单，而创建一个Claim Request 单据 (父工单），但需系统处理为正常工单

### Claim Request List

列表字段参考Claim Ticket, Claim Request No. 生成规则一样，首字母取CR

Split Ticket 为该父工单所拆出的所有工单.
- 列表排序按创建时间倒序，暂不进行数据权限控制，即有该页权限，即允许查看所有数据
- 列表不展示Claim detail 字段  Add
- 列表增加 AR statement No. 字段，位置在Creation Time 之前
- 操作权限需单独控制

### Create  Claim  Request
- 创建入口为AR 对账单--biling 模块  Add
- 对账单状态为以下可创建Claim Request：**under billing preparation**, **Awaiting Customer Confirmation,awaiting re-bil**
- 对账单做 customer confirm 操作时，增加判断，是否有关联的spliting 的Claim Request.   若有，则当下confirm 失败。 提示：“There is an ongoing Claim Request 【CR编号】  being split. Please confirm later.”
- Claimant 自动获取为本对账单客户
- Responsible Party , 不限制是否本对账单运单承运方，输入两个字母开始匹配，匹配范围（intelcuck corporation + 所有供应商）
- Claim Type，可选 external claim 所有选项
- Waybill , 非必填，不限制是否本对账单所选运单， 输入两个字母开始匹配，匹配范围 本客户所有运单（除 canceled 状态）。
- waybill 失焦后进行校验，是否本客户运单，状态是否符合。若不符合外框标红并提示  更新
- 若填写了Waybill ， Responsible Party 自动带入该运单供应商  补充
- 编辑request时，若编辑后信息导致Waybill 供应商与Responsible Party 不符（责任方为ITK除外）。需将Responsible Party 外框置红，并提示：The responsible party should match the vendor of the waybill.
- 补充：waybill 供应商为空情况，同样适用 ：供应商与Responsible Party 不符（责任方为ITK除外）
- 若Waybill 供应商与Responsible Party 不符，需Responsible Party 自动更新为该运单供应商。 需waybill 选中后校验，若需更换需toast 提示下：The Responsible Party has been changed to the waybill vendor
- 若 Responsible Party 为 intelcuck corporation ，则不更新
- Claim Details ,非必填，限制200字符

### Claim  Request Detail

填写供应商与Interluck 各自占比后，点击Confirm 即生成工单

- 生成工单规则：
- 同一个 Responsible Party ，同一个 Claim Type，同关联了运单 /或同不关联运单 的数据整合为一个工单
- 不同的责任方 需拆为两个工单
- 如: 行一： Delivery Claim ，运单1。 供应商1承担100 ，inteluck 承担20
- 行二： KPI claim , 供应商1承担100
- 行三： Delivery Claim ，运单2。 供应商2承担70 ，inteluck 承担30
- 则需拆成行一的 Inteluck 20+ 行三的inteluck 30 处理为工单1 （如果不好处理，可以接受处理为两个工单  ）
- 行二： KPI claim , 供应商1承担100处理为工单2
- 行一 的 供应商1 承担100， 处理为工单3
- 行三的 供应商2承担70， 处理为工单4
- 如果责任方是ITK, 则，默认为全部金额 都为ITK Expense
- 根据是否有运单关联该工单，自动配置 is Claim based on waybill  的值
- OC Status= ongoing Validation
- 若为Delivery Claims 时，则要求必填关联运单，填写运单号。否则该 waybill 字段置红，并提示：Delivery Claims must link to a waybill.
- 系统生成工单，Creator 默认为确认创建Claim 工单的账号
- 该工单默认与该AR 关联， 不允许取消与该AR statement的关联
- 生成工单的Proof , 共用该处上传的Proof (Global Proof), 所生成的每个工单均可查看该Proof , 但不可删除, 可另行上传该工单的特定proof

- Pending OC 状态允许进行编辑后，点击confirm。 Confirm需二次确认并开始自动创建工单，创建完成，进行相关提示。
- 二次确认提示内容：**Confirm content and generate Claim Ticket? No modifications allowed after generation.   【最好分成两行】**
- 编辑时，若Request 所关联AR 状态为 Under Billing Preparation，Awaiting Customer Confirnation, Awaiting Re-bill ，可编辑金额。 否则不允许修改Total Claim Amount
- cancel request, 需进行二次确认。样式与文案参考工单取消即可  Add
- 若分拆工单失败也给出提示：Split failed. Please check the request list for details. Del
- 将该提示作为全局提示，即离开该页面后 依然在顶部展示拆分过程 与拆分结果提示

|  | Pending OC | Spliting | Split | Split Failed |
| Edit Request | 1 |  |  |  |
| Add Proof | 1 |  |  |  |
| Cancel Request | 1 |  |  |  |
| Confirm | 1 |  |  |  |
| Retry |  |  |  | 1 |

# Ticket Notification

工单消息通知

| 触发动作 | 接收方 | 通知 |
| AR 创建Claim Request | 所有OC

需根据运单所属项目的BU进行以下区分，即项目包含该BU，则通知对应BU 的OC部门所有人（若该request 无运单，则通知以下两个BU OC）

L2： Operation & Coordination Department 部门所有人（BU含Trucking and Transportation）
L2：Operations Department 部门所有人（BU含 Global Forwarding） | TMS+Slack 通知

xxx （操作者账号Alias Name）created Claim Request。
**View Details**（按钮，跳转工单列表 |
| 工单更新为Claim Team Review 状态 | 所有Claim Team Member

取L3：Vendor & Claims | TMS+Slack 通知

xxx （操作者账号Alias Name）Confirmed the Claim / Refund Ticket。
**View Details**（按钮，跳转工单详情）

待确认：是否能再工单列表打开该工单详情 |
| Claim工单更新为 Vendor  状态Disputed | 该工单创建人，该创建人已离职等找不到的情况，则不发通知 | TMS+Slack 通知

The ticket you created is marked as "Vendor disputed". Please handle it.
**View Details**（按钮，跳转工单详情） |
| Claim工单更新为 For Deduction | 该工单创建人，该创建人已离职等找不到的情况，则不发通知 | TMS+Slack 通知

The ticket you created is marked as " For Deduction ". Please handle it.
**View Details**（按钮，跳转工单详情） |
| Refund工单更新为 For Refund | 该工单创建人，该创建人已离职等找不到的情况，则不发通知 | TMS+Slack 通知

The ticket you created is marked as " For  Refund ". Please handle it.
**View Details**（按钮，跳转工单详情） |

# uat更新
1. ticket detail 增加跳转

允许linked waybill 点击跳转至该运单详情
1. 增加通知类型

| 触发动作 | 接收方 | 通知 |
| Claim工单更新为Pendign Vendor  Confirm 状态 | 所有 procurement 部门人员

需根据运单所属项目的BU进行以下区分，即项目包含该BU，则通知对应BU 的Pcorucement部门所有人

BU: Trucking & Transportation  ------L3： Procurement Development

BU:Global Forwarding--------L3: Procurement | TMS+Slack 通知

There is a  ticket  is marked as "Pendign Vendor  Confirm ". Please handle it.
**View Details**（按钮，跳转工单详情） |