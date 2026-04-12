本模板由 Atlassian 的项目和事务跟踪器 Jira 为您提供。您可以利用团队在每次冲刺中使用的信息和资源来自定义此模板，以节省准备时间。
---
32pipe
---

## 1.本次优化功能
1. Route 的origin 和 destination 分别增加一个Label ；用以路线规划时能更加明确路线情况
2. 进行waybill 调度时，调整waypoint 与 destination 的选择顺序；背景：当前waypoint过多，实际操作中起点和目的地对应更合理，所以调整选择顺序
3. 对waybill 进行路线规划时，允许在路途中增加多个停靠点（stopping point）；支持实际业务中一个运单需要在中途多次上货及卸货的场景
4. Waybill 中允许维护及搜索相关单据编号；背景：POD上传POD时，无法快速对应相关waybill, oc会提前输入相关单据编号

## 2.详述

### 2.1 需求及对应需调整页面

| 需求名称 | 涉及页面 |
| Route 的origin 和 destination 分别增加Label | route lib detail--add route |
| route lib detail--modify route |
| route lib detail-- route list |
| route lib detail--manage sheet |
| route lib detail--pricing version |
| waybill  list |
| Standard dispatch--plan route |
| 调度waybill,调整waypoint 与 destination 的选择顺序 | Waybill detail --plan route(standard dispatch) |
| route中增加停靠点 | waybill detail--plan route(standard dispatch) |
| Waybill detail --plan route(Temporary dispatch) |
| waybill --export waybill |
| Waybill 中允许维护及搜索相关单据编号 | Waybill detail--basic info. |
| waybill list |

### 2.2 增加 point label
1. Route lib detail--Add route 时增加origin 及destination 的label
- 增加字段：分别在Origin 及 Destination 中增加origin label 及destination label；均为非必填字段
- label支持数字，字母，特殊字符输入，数量限制1000个字符
- Cancel 不做信息保存，不做二次确认，Confirm做信息校验
- 查重逻辑更新：同地点校验。保持当前逻辑，即不对同地点做重复性校验；
route重复性校验：新建路线与Library中的存量路线进行重复校验。如果出现9项信息（Origin的PAD、SAD、TAD、Origin Label，Waypoint，Destination的PAD、SAD、TAD，Destination Label）一致；空值加入比较；保存时同样需校验所有route详细地址与地区的匹配性；
1. Route lib detail--modify route 时增加origin 及destination 的label

- 增加字段：分别在Origin 及 Destination 中增加origin label 及destination label；均为非必填字段
- 查重逻辑同Add route
- Cancel 不做信息保存，不做二次确认，Confirm做信息校验
1. Route lib details-- route list
- route list 增加两个字段：Origin Label 及Destination Label,
- 筛选条件增加该两个条件；搜索范围为本 project
- UI attention: 注意字段顺序
1. route lib detail--manage sheet
- 同步route的表格字段增加Origin Label 及Destination Label，表格导入做查重校验时增加 Label字段，参考新增

1. waybill  list
- waybills list 增加两个字段：Origin Label 及Destination Label,
- 筛选条件增加该两个条件
1. route lib detail--pricing version
- pricing version 列表增加两个字段：Origin Label 及Destination Label,
- 筛选条件增加该两个条件，搜索范围本project
1. **Standard dispatch--plan route-Select points，select address**
- Select Points 页origin及destination增加 对应label列及搜索框，搜索范围为本 project；
- Select Address 页 增加label 展示，若label为空，则展示“-”

### 2.3 route中增加停靠点(Stop point)

1. project中维护stop point：允许在project中维护Stop points，该project的waybill（运单调度）中调用该point , 也允许在waywill 中维护 points 至project

- Project detail页增加Stop points tab, 该页面展示本project下所有Stop points列表, 允许增，删，查，改操作；查询label：like 查询
- 进行Stop points删除需进行二次确认弹窗, 若Stop points在本project的非完结状态waybill中被使用【非完结状态包括：planning ,pending，in transit ,delivered】，则不允许删除并提示“The stop point is in use”，若在完结状态【完结状态包括：completed, abnormal，canceled】删除，不影响该waybill的detail展示stop point label情况（理解为快照）
- 添加/编辑Stop point：地址及三级地址均为必填项，地址允许使用地图定位寻找也允许直接输入详细地址；进行解析，解析出对应三级地址；参考现有逻辑；保存时需校验详细地址是否在三级地址范围内，若未在范围内进行提示（同当前逻辑）; label为必填项，字符数限制1000
- 查重逻辑： label+三级地址（address不加入查重，空值加入判断）在project中不允许重复；否则提交时提示“The stop point is duplicated with others, please fill in a different one” ;
1. **Waybill detail --plan route(Temporary dispatch**)

select points

- Temporary dispatch 选择points时，增加：add  stop point 按钮
- 原origin/destination point 不变， stop point与origin/destination point的顺序可任意调整；后续路径规划根据点顺序进行规划
- Add Stop Point 弹窗中，允许通过label ，三级地址及详细地址进行point 筛选，允许point多选；已被选中point仅允许取消选择
- 弹窗展示本project下所有stop point, 不做分页，默认最多展示10条数据，超过10条可用滚动条进行查看；
- 弹窗中点击【create stop point】，再次弹窗创建一个停靠点，样式逻辑同project中创建停靠点
- Cancel 不做信息保存，不做二次确认； Confirm 时进行将选中stop point 与已填写地址的origin/ destination point 进行查重，不允许重复；否则提示“{stop point label} is duplicated with the{origin point name} ,please modify it”； point查重字段：label+三级地址（address不加入查重，空值加入判断）
- stop point展示，允许调整顺序，或移除该point
- 临调的其他逻辑不变

2. **Waybill detail --plan route（Standard dispatch）**

Select address

- Standard dispatch 进行route plan选择address时，在origin point及destination point 增加 add  stop point；
- Add Stop Point 弹窗中，与临调添加停靠点逻辑一致
- origin/destination point 与Stop point 顺序调整，一起进行调整；影响后续路线规划；从第一步选点过来的origin/destination point 名称根据顺序调整为origin/destination point 1、2、3… ，与 Stop point的不同顺序不影响名称
- Confirm 时进行将选中stop point 与已填写地址的origin/ destination point 进行查重，不允许重复，否则提示“{stop point label} is duplicated with the{origin point name} ,please modify it”label+三级地址（address不加入查重，空值加入判断）
- Cancel 不做信息保存，不做二次确认；
- Next 操作逻辑与当前保持一致
1. Standard waybill detail

- shipping record 增加stop point 轨迹及图标展示
- Route 增加stop point 到达记录，其中drop off  point 展示在Destination侧；pick up point展示在Origin侧；若有多个点，允许通过滑动条进行下拉；前端attention：需保留2.5条数据高度
- A shipping records 的action 增加2个类型：arrival at pick up point， arrival at drop off point;   Action 为输入框筛选:  顺序为：arrival at pick up point在arrival at origin 后，  arrival at drop off point放在arrival at destination前
- UI attention:  轨迹可优化展示（规划路线与实际路线）

3. export waybills

所导出waybill中的No. of drops数量需增加destination 这边stop points的数量

### 2.4 调度waybill,调整waypoint 与 destination 的选择顺序
1. Waybill detail --plan route（Standard dispatch）

Select points
- Destination 和Waypoint 互换位置； 根据所选择Origin加载route中对应Destination，根据所选destination再加载对应waypoint，若waypoint为none，则选完destination后则默认选中（与之前逻辑保持一致，选中最后一个可选项则默认选中）
- 交互变化: 增加被选中点提示可点击，点击弹窗展示被选中点（包括origin，waypoint及destination）

### 2.5  Waybill 增加POD相关文件编号
1. Waybill detail 增加填写POD相关文件number（in transit 及 delivered 状态waybill）
- 允许【in transit ,delivered】状态展示【Add POD No.】按钮
- 点击add POD No. ，弹窗选择POD Number Type: 枚举值Shipment Number，Delivery Receipt Number，Transport Order Number，Delivery Trip Ticket Number (DTT)，Trip Ticket Number，Hauling Trip Ticket Number (HTT)，FO Number，Sales Invoice，Shipping Request Form，Proof of Van Dispatching，Linehaul Trip Runsheet； 选项顺序按首字母排序；   每个type仅允许被选择一次； 该弹窗回显原填写内容，允许通过弹窗实现增删改功能
- 筛选框允许搜索；
- 点击“+” 新增一行，点击“—”删除该行； 仅一条数据不展示“—”
- POD Number 输入限制为字母/数字，字符数限制200位
1. Waybill detail 中字段展示
- Waybill detail--POD中增加展示所添加POD No. Type及相应NO. ，若无则不展示
1. Waybill list 列表字段及筛选条件
- Waybill list 列表中增加展示Required delivery time字段，若无则展示 “-”， 该字段为原已有字段，仅增加相关展示及筛选，Required delivery time进行筛选为时间段筛选
- 增加筛选条件：POD Number，允许通过该搜索框输入所有POD 类型的号码进行搜索，号码精确搜索

## 3.权限更新
1. 增加：project  增加stop points 的页面权限与该页面中Create stop point Label 及 modify ,delete 的操作权限
2. waybill 中standard dispach--route plan--select address 页面中的 add /delete/ edit    stop point 的操作权限及temporary dispach--route plan--select point页面中的 add /delete /edit      stop point 的操作权限 同当前一致，能通过plan route按钮权限进入当前页面则有该页面所有按钮权限
3. 增加：waybill detail 页面 增加add POD No. 的操作权限

## 4.历史数据处理

本迭代无需历史数据处理