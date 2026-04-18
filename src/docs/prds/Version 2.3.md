61falsedefaultlistfalse
#### 1. 允许批量导入运单

1. 操作的sheet 独立对每个操作人生效，不同操作人仅操作自己那份数据表（举例说明：A上传运单中，不影响B 使用编辑, 上传）
2. 增加【Batch Create Waybills】按钮，点击按钮，[导入中时，点击该按钮message提示导入中，不允许操作 ];  展示批量导入弹窗（导入说明：

“**Fill in Instructions**：

1.Fields marked with "**" are mandatory; those without "*" are optional；
2. Origin and destination addresses must include the province, city, district, and detailed address. Failure to provide addresses that Google Maps can locate may result in import failure；
3. If the origin and destination match a route under this project, a standard waybill will be created;
4. Carrier information should include certified vehicles, and the truck type must have an associated price.

5. Either leave all the carrier information blank or fill it all out     update3.20   
6. Import failure may occur with duplicate rows.”
1. 批量导入运单为【planning】状态
2. 导入逻辑：（carrier info 顺序更新，增加说明update3.20   ）
- 导入字段：其中带“*”为必填，否则为非必填
- 点击【Edit data in template】跳转至Google sheet ，若为第一次进入，则为空表格，若进行了数据编辑但未进行同步，关闭弹窗，再次进入该sheet，保留原编辑数据；点击同步后，若导入成功则清空表格，导入失败则展示失败数据
- 异步导入，导入结果展示在弹窗中，点击按钮展示上次导入结果（仅结果展示，失败不必展示失败原因于此页）及导入时间；任一条数据错误，整个列表导入不成功；导入结果通知形式:slack 通知；
- 导入的地址不必回写至所匹配route中
- 补充起始地和目的地不同命中情况的匹配优先级：

- 错误提示：表格增加{Wrong Reason}, 并在该列填入错误原因，文案：{列名}+{错误原因}，当找到第一个错误列，则停止该行数据匹配；
- 非必填项未填写内容不做校验，若填写内容则需进行校验
- 错误原因：
- 任何必填字段缺失，错误原因 “missing fields”
- project name 未匹配到系统已有project，错误原因: the project cannot be found.
- project 为不能创建waybill的状态（如：preparing, canceled等），错误原因：the project is not in progress status.
- Required Delivery Time早于position time , 提示“Required Delivery Time needs to be later than position time”
- origin address/destination Address 找不到地址，提示“Unable to find the origin address on the map”
- route code 找不到，错误原因: the route code cannot be found.
- route code 对应route 和所填地址解析出的区域无法匹配：Route code does not match the origin/destination address/waypoint
- 所填地址无对应route: ：origin/destination address/waypoint does not match route【备注：地址匹配路线时，为地图所返回区域所匹配到的第一条路线】
- vendor name未匹配到，错误原因: the vendor cannot be found.
- plate No.未匹配到，错误原因: the plate No. cannot be found.
- 车辆状态不为approval，错误原因：The truck status has not been approved. 321 update
- driver name未匹配到，错误原因: the driver cannot be found.
- 时间格式有误：错误原因：Wrong position time format / Wrong required delivery time format
- carrier 信息或者全不填或者全填，错误原因：Either leave all the carrier information blank or fill it all out
- 根据project name ,查找相应客户，完善客户相关信息：customers ,customer Tag
- 根据plate no. 完善车辆信息：truck type ,capacity
- 根据 driver name, 完善司机信息：driver contact ，license No.
- 根据 Vendor name, 完善供应商信息： Vendor tag, contact,email, number
- 所填写 有route code,通过route code 找，没有route code ,则通过address解析出的省市区去寻找该project下的route,若有匹配的route，则dispatch type= standard，否则为temporary；当前不允许创建临调运单
- 导入表中waypoint 为空时，则认为该waypoint 与所有内容均可匹配，但和route lib中同样为空的匹配度更高（举例说明：route lib中 有两条路线A/B，均为 成都高新---》河南嵩山，其中A waypoint={} ，B waypoint={b} , 导入成都高新---》河南嵩山 waypoint未填写时，则优先匹配A， 若A/B waypoint均为空，则随机匹配， 若A/B waypoint 均为a, b, 同样随机匹配）
- 当前不支持多装多卸，origin/destination/waypoint 填写多个地点，则匹配错误

#### 2. 定时任务waybill list 增加字段
- 涉及表格：1.2.3.4.（TH两张，PH两张）
- 增加 external code ，POD Number及 remark 字段，顺序如下图

#### 3.Waybill导出增加字段

增加：Dispatch Type ,Customer Name, Vendor Tag, POD NO.  ,Remark;  (其中POD No. 一般情况一个运单就一个POD文件，最多3个）

调整Driver Contact 至 Truck Driver后

#### 4. Route Lib  region搜索 更新
- route detail 中 origin，destination region 搜索更新为模糊搜索，举例说明：即搜索四川省，搜索结果呈现：四川省，四川省成都市，四川省成都市高新区，搜索高新区，搜索结果呈现：四川省高新区，高新区等
- pricing version中对起始地，目的地region搜索同样

#### 5. 新增通知消息

| 触发动作 | 接收方 | TMS内部通知 | Slack通知 |
| Created Customer

完成客户信息录入 | PH：POD team leader

TH：POD 组 | xxx （操作者账号Alias Name）created new customer {customer name}
**View Details**（按钮，跳转客户详情链接） | xxx （操作者账号Alias Name） has created new customer {customer name}  **Customer link** |
| Approval Vendor

Vendor 认证成功更新为Accredited状态时

（备注：当Vendor 被从unaccredited更新为accredited状态触发， reaccredit不触发） | PH：POD team leader

TH：POD 组 | xxx （操作者账号Alias Name） accredited the vendor xxx {vendor name}
**View Details**（按钮，跳转vendor详情链接） | xxx （操作者账号Alias Name） accredited the vendor xxx {vendor name}  **Vendor link** |
| route change

运单增加type=route change 的remark时 | PH：所在项目pricer

TH：所在项目pricer | xxx （操作者账号Alias Name） change the route in the waybill {waybill number} 
**View Details**（按钮，跳转运单详情链接） | xxx （操作者账号Alias Name） change the route in the waybill {waybill number} **Waybill link** |
| 批量导入运单完成（失败） | 批量导入操作人 | xxx （操作者账号Alias Name），batch create waybills failed ，
**View Details**（按钮，跳转至运单列表页） | xxx （操作者账号Alias Name）， batch create waybills failed ，**View Details**（按钮，跳转至运单列表页 |
| 批量导入运单完成（成功） | 批量导入操作人 | xxx （操作者账号Alias Name），batch create waybills failed ，xx{成功导入运单条数} waybills have been created，**View Details** (按钮，跳转至运单列表页) | xxx （操作者账号Alias Name），batch create waybills failed ，xx{成功导入运单条数} waybills have been created，**View Details** (按钮，跳转至运单列表页) |

#### 6. 创建运单增加逻辑（5.9更新）-----

增加route lib 中， destination = all region, 的匹配逻辑；

当批量创建运单时，若该路线A---》B 未匹配到任何路线，且 route lib中有 A----》all region的路线，则允许A---》B 匹配至 A----》all region

匹配优先级： A优先匹配地址更详细的route,  省+市+区>省+市>省