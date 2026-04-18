none
# 1. Booking Dashboard
Booking Dashboard 用于统计客户，项目运单量趋势 与 创建运单和已完成运输运单的对比情况。便于管理层对运输经营数据的了解
页面增加说明：Data Scope: **The data volume of waybills where the Position Time falls within the selected time range and the status is Committed or Delivered** Data Description: "Committed" refers to waybills successfully created with a position time within the selected range; 
 "Delivered" refers to all waybills whose status has been updated to "Delivered" or "Abnormal" with a position time within the selected range.
- 本表取值范围为运单position time 在所选时间范围，若为position time 在该段时间内的成功创建的运单（即除去cancel 状态的所有运单）为commited 总数
- position time 在该段时间内的成功完成运输的运单（即delivered+abnormal） 状态的所有运单）为delivered总数

## 1.  Booking Summary

- 展示该国别近12个月（包含本月）的运输情况表格
- 字段如图：Daily Avg Delivered，Total Delivered，Daily Avg Commited，Total Commited  (注：该表当前在KPI Dashboard有呈现）
- Total Commited ：本月committed总数（不包含cancel）,Daily Avg Commited : 本月日均committed数，Total Delivered ：本月delivered 总数（包括abnormal），Daily Avg Delivered：本月日均delivered数
- 日均=总量/26，不要小数取整 ，需标注在Avg 表头
- 图表展示近12月Total Commited  与Total Delivered 面积图

## 2.  Customer Booking Waybill（Commited VS Delivered)

按客户维度展示运单booking情况，按客户Commited 数从大到小顺序，展示所选时间段内有数据的所有客户 Commited 与 Delivered数量 （只展示in service 状态客户, 标题 下增加说明：**Display Only In-Service Customers**  ）
- 数据范围最多选12个月。最小一天，默认展示当月数据
- 注意：Delivered 数据条排在前面（且所有有两个该数据对比的表格，图标，均将delivered 置于前，如有图示不按此规则需修改为按此规则）
- 允许全屏查看该图

## 3.  Customer  Booking Trends

1. 左侧列表展示所有客户列表。
- 列表排序：按所选时间commited 总量进行排序
- 时间选择维度：By Day, By Month
- 若by day  则时间跨度最大允许选择某月，最少一天，by day ：时间粒度为天。    by month， 选择最多12个月，最少一个月。by Month ：时间粒度为月
- 默认展示当月（By Day)
- 若被切换为by month, 则默认展示最近12个月数据
- 影响范围为3Customer  Booking Trends所有图表
- 允许搜索客户
- 所选客户情况在右侧图中进行展示
- CustomerTrends(committed vs Delivered)，展示所选择客户在所选择时间范围的 Total commited 与Total delivered 数量面积图
- 允许全屏查看（全屏展示该图+表+Customer Project-Based Booking Details表格 ）
- 标题拼接展示被选客户名称
- 表格展示该客户相关数据（具体见图），其中Completion Rate=total deliverd / total commited   需将算法展示于该字段说明浮窗，客户名后增加客户状态（customer status) 展示
2. Customer Project-Based Booking Details
- 展示以上所选客户下所有项目（不展示preparing 项目） deliverd  与  commited 数据，项目名后增加展示该项目状态（图上没得）
- 展示时间段与客户 customer trends 一致。
- 表格固定高度，竖向滑动查看更多
3. Project Trends(Committed vs Delivered)
- 展示以上所选客户下特定项目在所选择时间范围的  commited 与 delivered 数量面积图，允许全屏查看（几个project Trends 图一起展示）
- 默认展示Customer Project-Based Booking Details 中的第一个项目，允许搜索该客户下所有项目 ，（备选项展示 项目名+项目状态）
4. Project Trends(Committed) Comparison
- 展示以上所选客户下所有项目在所选择时间范围的 commited  数量柱图对比，允许全屏查看（几个project Trends 图一起展示）
- 待确认，是否可根据 Project Trends(Committed vs Delivered) 中的项目，在以下两个对比柱图中高亮该项目，若可以则在标题中标注该项目
5. Project Trends(delivered) Comparison
- 同Project Trends(Committed) Comparison  ，展示项目(delivered) 对比情况

# 2. CRM Statistics Update
1. 删除原漏斗图，仅展示两组图表Opportunity  Tracking （新增），Opportunity Follow - up Statistics  （原图表）
2. 增加Global Filter ，全局搜索对本页均生效，搜索条件冻结至页面，默认All BU, All BD , 默认

## 1. Opportunity  Tracking

展示所选时间，所选BU，所选BD 创建与成功关闭的商机情况

数据范围：在所选时间范围所创建的商机，   Data scope: Created within the selected time period
- BD/CAM  ，创建人昵称， 取该商机的跟进BD/CAM
- Lead Customer Creation , 创建人在所选时间范围所创建的 lead 数量
- Opportunity  Creation： 创建人在所选时间范围所创建的 Opportunity 数量
- Opportunity Successful Closed：该组数据允许点击，点击跳转至 商机列表，并筛选出符合对应条件的  Opportunity
- Total Closed： 创建人在所选时间范围  Successful Closed的 Opportunity 数量
- Curr Period Created and Closed ：该Opportunity 的创建与成功关闭时间均在所选时间范围
- Prev Created Curr Closed ：该Opportunity 的创建时间不在所选时间范围， 仅关闭时间在所选时间范围
- Total 行展示以上行汇总

图表展示商机创建数，所有成功关闭数与当期创建并关闭数
- 原商机列表 增加筛选条件与列表字段：Successful Closed Time, 仅Successful Closed 状态商机展示，其余状态展示 - ， 位置放置于Creation time 之前

## 2. Opportunity Follow - up Statistics

该图表为原有图表，进行以下更新：
- 删除Creation Num，同时删除按creation 排序的条件
- 原Opportunities Num 更名为Total ，计算方式不变，取该行所有状态的商机之和（  total 列颜色需进行区分）
- 底部 Total 行增加颜色区别
- 增加数据范围说明：Data scope: Followed up within the selected time period

## 2. Create/Edit  Opportunity Upadte

创建/编辑 Opportunity 时，其中 potential requirement 字段增加枚举值： Sourcing and Supply

# 3. Tax-Rate Modify (TH)

基于TH税率的复杂性，需开放税率编辑功能，如图。
- Waybills 模块，增加Basic Amount Tax Rate (VAT,WHT)列 与Additional Charge Tax Rate (VAT,WHT) 列
- Basic Amount Tax Rate  展示原VAT 及WHT税率，点击编辑，弹窗进行税率编辑。（正整数），confirm 后更新税额 ，修改后的税额展示为蓝色字体 （再次修改回原税率，依然认为已修改，保持蓝色字体）
- Additional Charge Tax Rate ，由于Addi Char 有多个子类，故不展示税率，点击编辑按钮后，在弹窗中按子类类型展示对应税率，并允许修改。 同样confirm后更新该行税额。修改后的税额展示为蓝色字体
- 税率被修改需记入对账单 Operation Log。   **Description**记为： Edit “xx 结算项” TaxRate
- 本对账单不结算的项目，则其税率置灰不可编辑
- 仅以下对账单状态允许编辑：Under Billing Preparation，Awaiting Customer Confirmation, Awaiting Re-bill
- Under Payment Preparation , Awaiting Vendor Confirmation，Awaiting Re-bill

# 4. Crew Status
Crew 增加Blocked 状态以处理标记该Crew 被主动隔离的情况，与Inactive 的业务区别是，Blocked 不再允许被重新激活，而Inactive则只是暂时不活跃，允许再次激活

- 状态流转图：红色部分为本次新增内容

- Block 弹窗，选择原因，Remark 非必填，若reason 选了others 则必填，最多200字符。（   给个字符数说明0 /200 ），Proof 则使用最新的上传工具。均记录至 Status change record， 并将Block 原因展示在基本信息处
- 原因枚举如下：暂时TH/PH 均使用 此枚举
- Theft
Pilferage
Tampering/Falsification
Positive in Drug Test
Misconduct/Improper behavior
Others
- Blocked 状态不允许再接单，即选择crew 时，需置灰（参考inactive 逻辑）
- 该状态不允许进行其他操作（仅查看Operation Log）如下表，其中红色字体为本次新增

| 操作按钮 | 按钮位置 | 按钮权限说明 | Blocked | Unaccredited | Accredited | Inactive |
| Operation Log | 页面顶部 | 跟随页面权限 | ✔ | ✔ | ✔ | ✔ |
| Attribution | 页面顶部 | 单独设置 |  | ✔ | ✔ | ✔ |
| Accreditation Approval | 页面顶部 | 单独设置 |  | ✔ 操作时校验该truck是否有在途申请 |  |  |
| Deactivate | 页面顶部 | 单独设置 |  |  | ✔ |  |
| Activate | 页面顶部 | 单独设置 |  |  |  | ✔ 操作时校验该truck是否有在途申请 |
| Block | 页面顶部 | 单独设置 |  | ✔ | ✔ | ✔ |
| 文件编辑 | 文件模块 | 单独设置 |  | ✔ | ✔ | ✔ |

- 从其他状态block时，其transportation status 不影响block 操作
- 该Crew 是否有在途申请 同样不影响block 操作
- Blocked 状态需同步展示至 VP端，并展示Blocked 原因，该状态不允许VP端进行任何操作