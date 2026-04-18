61truedefaultlisttrue
# Customer Analysis

客户分析旨在对客户营收进行数据分析，主要维度为以月份为单位，BD部门查看本月客户端营收，与上月数据对比，进行营收分析。及时发现营收变化趋势与潜在问题
- Statistics菜单下增加二级菜单--Customer Analysis， 该页面主要呈现客户维度的运单，收入，支出及毛利等相关统计
- 所有收入支出计算均只包含合同收入/支出（Contract Revenue ,Contract Cost); 不含税，不包含Claim, 不包含报销费用；(该规则需展示于页面，如下）
- @UI ，需展示全局提示 “All revenues and expenditures included in the statistics only cover Contract Revenue and Contract Cost“;
- 数据权限说明：customer 层面需进行数据权限控制，按customer BD/CAM PIC 进行数据权限划分，即数据权限为 自己，则仅查看自己为该customer BD/CAM PIC 的数据，部门则查看本部门customer BD/CAM PIC 的数据，(统计内容同样进行控制，仅查看权限内统计数据）相关的project 则按所属customer 进行数据权限控制
- 本页面权限暂不做更细分类，如有该页面权限，即拥有本页所有模块及操作权限

## Summary

展示本月数据
- 本月总收入：账号登录所属国家所有Position Time 在当月的 Delievered ，Abnomal 状态运单的收入【收入包含客户侧： basic amount+additional charge+exception fee,注意不含税，之后提及的收入均为该组合】
- 展示与上月相比的收入差值
- 展示与上月相比的增长率，增长率 = （本月量 - 上月量）/（上月量）* 100%，，若上月的量为0， 则增长率固定展示为100%
- @UI 绿色为增长，红色为降低（增长率的负数展示为绝对值）
- 本月总支出：账号登录所属国家所有最后一次Position  Time 在当月的 Delievered ，Abnomal  状态运单的支出【支出包含供应商侧： Paid In advance+Basic Amount Payable (Remaining)

+addional charge+exception fee,注意不含税，之后提及的支出均为该组合】
- 展示与上月相比的支出差值
- 展示与上月相比的增长率
- 本月毛利=本月总收入- 本月总支出
- 展示与上月相比的毛利差值
- 展示与上月相比的增长率
- 本月毛利率=本月毛利/ 本月收入，四舍五入保留两位小数
- 展示与上月相比的毛利率差值
- 展示与上月相比的增长率
- 本月活跃客户量：有position time 在本月的**Delivered 或 Abnormal**运单的客户数
- 同样需展示与上月相比的差值与增长率
- 本月活跃项目数：有position time 在本月的**Delivered 或 Abnormal**运单的项目数量
- 相比上月的增长率均四舍五入取整，如10%

## Overall Business Status Monitor
- 展示被选中年份，该年所有月份的数据（按月展示），支持按年选择
- 支持选择BU（取对应BU的项目的相关数据），默认展示所有BU,  BU单选
- 展示数据
- Waybill：position time 在该月的运单数（**Delivered and  Abnormal 状态）**
- Avg Daily Waybill：平均日单量=运单数/26, 保留整数，直接舍弃小数点后数字，后面所有的日均单量，均按此规则
- Revenue：本月运单所有收入，收入包含，basic Amount+additional charge+exception fee, 计算方式需展示在tooltips 上
- Cost：本月运单所有支出，支出包含，Basic Amount Payable （paid in advance + remaining）+additional charge+exception fee, 计算方式需展示在tooltips 上
- Gross Profit：毛利=本月总收入- 本月总支出
- 本月毛利率=本月毛利/ 本月收入，保留小数点后两位, 四舍五入
- 柱图需按对应月份展示收入，支出，毛利，毛利率展示折线（需展示图例，数据最好都展示在图上，不隐藏，需要展示参考线，后面的统计图均这个要求不再赘述）

## Customer Stastic
- 展示当年供应商活跃情况，允许选择其他年份（仅支持选择单年份）（参考 Capacity Stastic增加个年份筛选框  ）
- Total Active Customer： 这个月活跃的客户数 ，增加点击可跳转列表
- 活跃指的是有已完成有效运单：**position date 在当月的abnomal / delivered 运单**，其他状态运单（canceled和进行中）都不算。
- Total Active Customer = Existing Active Customere + Existing Reactive Customer + New Customer
- Existing Active Customer：这个月活跃，且上个月也活跃的客户数
- Existing Reactive Customer：上月不活跃，本月活跃的客户数 - New Customer 数量
- Loss：上个月活跃，这个月不活跃的客户数
- New Customer：第一个**abnomal / delivered**运单 的 position time 当月的客户数量
- 允许点击下图标注为绿色的数字，并进行跳转

### 跳转页面

参考下图，展示对应客户名，该客户当前PIC（当前无则展示-），当月运单数，当月日均运单数，当月运单收入，支出，毛利及毛利率
- existing active ， existing reactive ，new 展示模式均参考下图
- Lost 则展示上月数据（字段一致）. Lost 跳转页面需特别增加说明：其相关数据展示为上月说明 ，页头增加说明：**Data for "Lost" customers shows last month's figures.**
- 页面名称，相关表格字段需带上月份
- 允许按客户名进行搜索, 搜索范围仅本页已有 客户
- 允许导出（至下载中心，文件名和页面名保持一致加时间戳即可，导出字段与页面字段一致），导出不管搜索条件及排序
- 排序规则：默认按运单量从大到小（运单量一致则按毛利率   Revenue 从大到小）
- 标题说明展示排序规则：**Sorting Rule: Sort by Waybill Volume in Descending Order by Default**
- 允许自定义排序，点击对应表头按该字段进行排序
- waybill, Revenue ，Cost， GP，GM
- 考虑数据量不大（预估100以内），不进行分页( 可再根据实际数据量调整）
- 若为0，则不可点击

## Project Stastic

交互与逻辑与 Customer Stastic 保持一致

跳转页面则将customer name 更换为 project name ，删除PIC字段
- 表格允许自定义排序，点击对应表头按该字段进行排序
- Revenue ，Cost， GP，GM

## Customer Revenue

展示所有所选月份 及之前 状态变更为 in service 状态的客户信息： 客户收入，允许按月进行筛选，选择月份后（选择单个月）直接进行匹配，不再通过确认按钮进行确认，该客户数据为0依旧展示，排序在后面就行
- 标题增加注释信息：**Customer Revenue**:**Displays customers  those whose status was changed to In Service on or before the selected month.**
- 允许按以下进行排序
- 默认按客户当月收入从大到小
- 允许按客户毛利（GP）从大到小
- 按客户毛利率（GM）从大到小
- 一样则按客户名字母顺序A-Z排序
- 饼图仅展示前10数据，其他展示为others. 柱图展示全部，做成滑动效果
- 饼图仅展示收入倒序前十+others,  增加小标题 ：Top 10 Customer Revenue Ratio

## Project Revenue

展示项目开始时间（从preparing Start操作至In Progress的时间）在所选月份及之前的项目，标题增加注释（图上没有，帮我加下），注释内容： **Project Revenue : Displays projects where the project start date is on or before the selected month**
- 其他与Customer Revenue交互与逻辑一致，仅更换统计对象为project
- 项目展示
- 饼图仅展示收入倒序前十+others,  增加小标题 ：Top 10 Project Revenue Ratio

## Customer Analysis

按列表展示所有所选月份 及之前 状态变更为 in service 状态的客户营收情况，需进行分页展示
- 数据权限：允许查看自己权限范围内的数据
- 排序：默认按收入正序，再次点击倒序 ，默认按收入倒序，再次点击正序
- 允许按毛利正序/倒序排
- 允许按毛利率正序/倒序排
- 允许按毛利同比变化值（本月毛利-上月毛利 的差值）正序/倒序排
- 相同则按客户名字母正序
- 允许按Customer Type 进行筛选   Del , 且删除列表中 该字段
- 允许按customer name 进行搜索
- 允许按月份筛选，只选单月，默认当月
- 列表字段如图
- 其中project 展示该客户的项目数量，允许点击跳转至 Customer Analysis -Project 页[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#Customer-Analysis--Project-%E9%A1%B5](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#Customer-Analysis--Project-%E9%A1%B5)
- 毛利变化值，GP Change=本月毛利-上月毛利， 红色为下降（负数展示为绝对值），绿色为上升
- action 操作权限与页面权限保持一致即可
- 允许点击展开为全屏（参考Adoption dashboard交互）
- 操作
- 点击分析，跳转至分析页面[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E5%88%86%E6%9E%90%E9%A1%B5](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E5%88%86%E6%9E%90%E9%A1%B5)
- 点击 Compare , 跳转至对比页面[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E5%AF%B9%E6%AF%94%E9%A1%B5](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E5%AF%B9%E6%AF%94%E9%A1%B5)

### Customer Analysis by Project 页
- 项目开始时间（Start操作的时间）在所选月份及之前的项目，项目当月运单量为0 需进行展示
- 标题增加注释（图上没有，帮我加下），注释内容：**Customer Analysis By Project: Displays projects where the project start date is on or before the selected month, including those with zero waybill volume.**
- 项目营收收据展示为所选客户月份（须在表格字段加月份，页面标题加亦可）
- 允许自定义排序，点击对应表头按该字段进行排序
- Revenue ，Cost， GP，GM
- 默认按waybill 从大到小排序

### 分析页
- 页面名称展示该客户名
- 列表展示该客户本年度从1月至当前月份的营收数据（如下图表格）
- Total 展示截至从当年1月1日起至当日所有数据
- 且按月展示该客户相关走势图 （排布请  设计下，不一定按原型排成两排两列）
- Monthly Waybill Trend：月度运单量走势
- Monthly Revenue Trend：月度收入走势
- Monthly GP Trend ：月度毛利走势
- Monthly GM Trend：月度毛利率走势

### 对比页

该页面对特定客户不同月份营收数据进行对比
- 默认为列表所选客户，允许修改为其他客户
- 时间默认本月与上月进行对比，允许修改对比月份，允许增加被对比月份（暂不限制数量）
- 作为基准的月份则只允许选择一个
- 点击compare，进行数据对比
- 具体展示效果：参考下图，1. 展示基准月份营收数据，2. 展示对照月份数据，3.展示两组对比结果，对比结果为 基准数据 - 对照数据结果     对照月数据 - 基准月数据
- 结果表头选展示对应月份

## Project Analysis

参考Customer Analysis，展示项目开始时间（从preparing操作 Start的时间）在所选月份及之前的项目项目营收情况，包括数据为0的项目，允许按排序筛选 (筛选也可放在表头筛选，与前面UI保持一致），允许点击查看详情，允许对应不同月份数据等
- 数据权限：允许查看自己权限范围内的客户下的项目数据
- 展示说明：

# ,Vendor  Analysis
- Statistics菜单下增加二级菜单--Vendor Analysis， 该页面主要呈现供应商维度的运单，收入，支出及毛利等相关统计
- 所有收入支出计算规则和customer analysis 一致
- 数据权限说明：Vendor 层面需进行数据权限控制，按Procurement PIC 进行数据权限划分，即数据权限为 自己，则仅查看自己为该Procurement PIC 的数据，部门则查看本部门Procurement PIC 的数据，by project 则无需再进行数据权限处理，即查看所有项目，其下供应商进行控制
- 本页面权限暂不做更细分类，如有该页面权限，即拥有本页所有模块及操作权限

## Summary

同样展示本月数据概览
- 收，支，毛利，毛利率数据与customer anaysis -summary 数据一致
- 增加展示本月活跃供应商数量：有position time 在本月的delivered/ Abnormal 状态运单的供应商数量，同样展示同比上月的增量与增长率
- 增加展示本月活跃车辆数：有position time 在本月的delivered/ Abnormal 状态运单的车辆数量，需根据车牌号去重，即一辆车同时属于多个供应商需去重

## Capacity Stastic

运力分析，展示当年供应商活跃情况，允许选择其他年份（仅支持选择单年份）
- Total Active Vendor： 这个月活跃的供应商数, 增加点击可跳转列表
- 活跃指的是有已完成有效运单：**position date 在当月的abnomal / delivered 运单**，其他状态运单（canceled和进行中）都不算。
- Total Active Vendor =Existing Active Vendor+ Existing Reactive  Vendor+ New Vendor
- Existing Active Vendor ：这个月活跃，且上个月也活跃的供应商数
- Existing Reactive Vendor ：上月不活跃，本月活跃的客户数 - New Customer 数量
- Lost：上个月活跃，这个月不活跃的供应商数
- New Vendor ：自有车辆的第一个**abnomal / delivered**运单 的 position time 当月的供应商数，自有车辆为供应商与truck 的ownership = Owned Truck
- 允许点击下图标注为绿色的数字，并进行跳转

### 跳转页面

页面标题需带上所选年月

参考下图，展示对应供应商名，该供应商当前PIC（当前无则展示-），当月运单数，当月日均运单数，支出，毛利及毛利率等
- 其中Aging （Month）为该供应商自有车辆（ Owned Truck）从inteluck开始第一单的时间（第一个**abnomal / delivered 运单的 position date所在月**） 至今的时长，如2024.9 至今2024.10， 则取aging =1 month , 不管日期。 此处说明文案：**Aging (Month): The number of months from the month of the position date of the first abnormal/delivered waybill of the supplier's owned-Truck on Inteluck to the present.**
- Self-owned Trucks 为该供应商自有车辆数，不管车辆状态
- Total Trucks 则为所有车辆数
- 最前加一列序号，排序规则为按运单数量倒序，即最多排最前，标题下增加排序规则说明：**Sorting Rule: Sort by Number of Waybills in Descending Order  @April**
- 原单数量相等则按GP更高的排前面
- 允许自定义排序，点击对应表头按该字段进行排序
- waybill, Revenue ，Cost， GP，GM  ,  协助增加 revenue 字段
- 搜索供应商，其搜索范围同以上客户分析跳转页面，仅搜索本页已有供应商
- 增加一个导出本页数据操作，导出文件参考系统已有逻辑，期文件名为时间戳+ 本页面名

## Gross Profit by Vendor

展示所有当月活跃的供应商营收情况，筛选器仅允许筛选单月，如2026-01
- 模块标题需提示：Count the revenue of vendors who are active in the current month.
- 允许按月进行筛选，允许搜索供应商与对应 **Procurement PIC**
- 其中Procurement PIC 展示当前 PIC 即可
- 默认按毛利Gross profit 倒序（从大到小进行排列）
- 允许按GM，GP进行正序/倒序排序
- 待开发确认，是否可以分页但柱图需与图表数据可对应
- 表格字段：供应商名称，当前PIC，
- Project ，展示当月参与的项目数量（在该项目有position time 为本月的delivered+abnormal  状态运单），若比上月少展示红色，比上月多则展示绿色，允许点击，点击跳转至对应项目列表页[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E4%BE%9B%E5%BA%94%E5%95%86%E9%A1%B9%E7%9B%AE%E5%88%97%E8%A1%A8%E9%A1%B5](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E4%BE%9B%E5%BA%94%E5%95%86%E9%A1%B9%E7%9B%AE%E5%88%97%E8%A1%A8%E9%A1%B5)
- waybill,  展示position time 为当月delivered+abnormal 运单数量
- 收入，支出，毛利，毛利率均展示按该供应商维度进行统计的相关数据

### 供应商项目列表页

页面标题需展示供应商名及所选月份

如下图，展示该供应商在对应项目的数据，如该供应商在项目1，当月的运单数，收入支出等，具体字段见图
- 其中Aging （Month）为该供应商自有车辆（ Owned Truck）在该项目的第一单的时间（第一个**abnomal / delivered 运单的 position date所在月**） 至今的时长，如2024.9 至今2024.10， 则取aging =1 month , 不管日期。 此处说明文案：**Aging (Month): The number of months from the month of the position date of the first abnormal/delivered waybill of the supplier's owned trucks under this project to the present.**
- unqiue plate under project, 为该供应商在该项目该月完成运单的车辆数（需进行车牌去重）， 此处说明文案：**Unique Plate under Project: The count of de-duplicated trucks (license plate) for the supplier’s abnomal and delivered waybills under this project in the month.**

## Vendor Analysis By Project

以项目维度展示该项目下所有供应商情况，默认按本项目当月收入正 倒 序排序，项目下供应商则按该供应商在该项目收入正  倒 序
- 数据权限：允许查看自己权限范围内的供应商数据，可见项目不限制（即允许查看所有项目，但若该项目下无自己可见供应商，则不展示相关供应商breakdown明细）
- 时间筛选，仅允许单月，默认当月
- 允许按收入，毛利变化量 进行正序/倒序排列（项目下供应商排序保持一致）
- 允许按月份筛选，搜索项目，允许展开为全屏
- 展示所有当月活跃项目列表
- 标题增加注释（图上没有，帮我加下），注释内容：**Vendor Analysis By Project: Displays projects  who are active in the current month.**
- 点击Vendor,在本页展开该项目所有本月活跃供应商及供应商相关数据
- 相关数据字段参考之前的定义
- cost 注释内容：**All Contract Costs of Inteluck for the Following Vendors under This Project**
- Unique Plate Used**: The count of de-duplicated trucks (license plate) for the supplier’s abnomal and delivered waybills under this project in the month.** 补充注释
- Vendor breakdown中，1st delivery date 为该供应商自有车辆（ Owned Truck）在该项目完成第一单（delievered /abnormal）的时间.  该字段增加注释：The time when the vendorr's owned truck completed its first waybill (Delivered/Abnormal) for thisproject.
- 点击走势图，跳转至该供应商在在项目的年度走势页[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E5%B9%B4%E5%BA%A6%E8%B5%B0%E5%8A%BF%E9%A1%B5](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#%E5%B9%B4%E5%BA%A6%E8%B5%B0%E5%8A%BF%E9%A1%B5)

### 供应商年度走势页

展示该供应商在该项目的本年度营收情况，车辆使用情况

标题需展示供应商名及项目名称

## Vendor Analysis By Customer

以客户维度展示该客户下所有供应商情况，可参考以上Vendor Analysis By Project 逻辑及交互 [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#Vendor-Analysis-By-Project](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/955645953/S40+Customer+Analysis+Vendor+Analysis#Vendor-Analysis-By-Project)
- 数据权限：允许查看自己权限范围内的供应商数据，可见客户不限制
- 客户排序：按当月客户收入正序
- 供应商排序：默认按该供应商在本客户的所有项目的当月收入汇总正序排序
- 允许按收入，毛利变化量 进行正序/倒序排列（项目下供应商排序保持一致）
- 允许按单月份筛选，搜索客户，允许展开为全屏
- 展示所有所选月份活跃客户列表
- 标题增加注释（图上没有，帮我加下），注释内容：**Vendor Analysis By Customer: Displays customers  who are active in the current month.**
- Vendor breakdown 参考项目下Vendor breakdown
- Vendor breakdown中，1st delivery date 为该供应商自有车辆（ Owned Truck）在该客户完成第一单（delievered /abnormal）的时间.  该字段增加注释：The time when the vendorr's owned truck completed its first waybill (Delivered/Abnormal) for this customer.
- 表格在cost 后协助增加revenue 字段

### 供应商年度走势页

展示该供应商在该客户的本年度营收情况

标题需展示供应商名及客户名称

参考项目下供应商分析详情

# Hotfix  内容 2026-3-4
1. Customer +Vendor Analysis ----Summary

数据更新为默认展示上月，对比数据则为上上月， 标题同展示上月（如当前为3月，则展示2月数据与 2月与1月对比情况）
1. Customer +Vendor Analysis-----所有 revenue， cost， Gross Profit ,均展示为整数 （四舍五入方式取整）
- Gross Margin 均取两位小数，.00 需保留
2. **Customer Revenue** 及 **Project Revenue 饼图更新**
- 更新为展示前15 客户/项目 revenue
- 标题TOP 10更新为 TOP 15
-
3. Customer Analysis +Vendor Analysis
- Trend 页所有图均将数值展示在图上，代替现在的hover展示数值
- Compare 页逻辑更新
- 默认展示 与被选中月的同比结果与环比结果
- 如：列表所选中月份为基准月（2026-3），则对比页面 默认展示 2025-3 （同比）与2026-2（环比）的数据与对比结果
- 对比结果参考下图，基准月展示在页面右侧，对比结果为基准月数据- 对比月数据 （如：2026-3   减去 2025-3），有多少对比月，则对应的右侧展示多少基准月卡片
-
1. Vendor Analysis --- Capacity Statistic

增加字段 Retention Rate , 计算逻辑为：Existing Active Vendor 除以 上月 **Total Active Vendor，** 说明内容：（Existing Active Vendors / Total Active Vendors in Previous Month) × 100% ，展示在**Existing Active Vendor**字段后
- Retention Rate不保留小数，四舍五入取整，若Total Active Vendors in Previous Month 为0 ，则展示0

图上增加 Retention Rate 折线图

6. Vendor Analysis ---Gross Profit by Vendor
- 增加全屏按钮，支持该模块全屏
- 增加导出功能，允许导出该列表，导出文件命名：**Gross Profit by Vendor** + 时间戳
- 增加BU筛选条件
- 当新增 BU 筛选条件后，系统仅统计 **属于所选 BU 的项目数据**：
- 若选择 BU1，则仅汇总供应商在 BU1 下项目的运单、收入、支出等数据；
- 若未选择 BU（或选择“全部 BU”），则继续汇总供应商在所有 BU 下的项目数据（当前线上数据）
- 右侧原Gross Profit 柱图更新为 Gross Margin 的折线图 （横向展示， 且默认从小到大进行展示（包含负数））
- 此处尽量可以做到折线图追随表格数据进行更新，表格数据不用联动折线图更新（实在有难度可放弃）
- 折线图展示数据（供应商名太长可固定宽度，hover展示全部）
- 表格默认排序更新为按GM从小到大进行排序
- 增加操作：Trend
- 参考vendor Analysis By Project 里的Vendor Trend
- 此处Trend 展示该Vendor 所有运单数据，若选择了BU，则展示在该BU的运单数据
- **Unique Plate**字段为该供应商该月完成运单的车辆数（需进行车牌去重）
- Trend 图依然需展示数据
- 增加操作 ：Compare
- 参考customer compare
- 选择对应供应商对该供应商当月与去年本月和上月进行对比，并允许多选对比月与修改基准月
- 若选择了BU之后，对比的数据则为该BU，标题需增加BU：XXXX , 位置参考当前的customer status
1. **Vendor Analysis By Project** 与 **Vendor Analysis By Customer**进行位置调换，即By Customer 展示在更上面
- 增加按GM排序
- Project/ Customer 中的Vendor 也允许按GM排序
- 增加操作 ：Compare
- 参考customer compare
- 选择对应供应商对该供应商当月与去年本月和上月进行对比，并允许多选对比月与修改基准月
- 标题需增加对应项目或客户名：XXXX , 位置参考当前的customer status      Vendor Analysis-Comparison  （Under Project / Customer A)

# Hotfix  内容 2026-3-16
1. 顶部提示放到 Overrall Business Status Monitor标题的tooltip提示中。
1. vendor analysis 的这个提示直接去掉
2. **扩展 GP Change**：在Revenue列后增加 Revenue Change列，在Gross Margin列 增加 GM Change列，GP Change移动到Gross Profit后。
1. 涉及 Customer Analysis 页面的 Customer Analysis 统计和 Project Analysis 统计
2. 涉及 Vendor Analysis 页面的 Vendor Analysis By Customer 统计及其下钻vendor统计和 Vendor Analysis By Project 统计及其下钻vendor统计
3. 适当减少以上表格中 Project/Waybill/Vendor 等列宽度，给新增列增加显示空间
4. 统计逻辑与GP Change一致
5. Revenue/GM/GP Change 的 tooltip 文案统一为：Compared to previous month
6. 给扩展后的三个 XXX Change 列增加排序功能，注意排序是按照真实值（有正负号）来排序。
3. **Gross Profit by Vendor 增加Project下钻功能（嵌套列表）**，下钻列表同 Vendor Gross Profit by Project 页面（点击Project数量跳转的页面）中的Project列表。
1. Vendor Gross Profit by Project 页面中的Project列表：Project列后增加Customer列，展示对应的customer name。
4. Booking Dashboard 的 Booking Summary 统计，增加月份筛选功能
1. 默认最近12个月