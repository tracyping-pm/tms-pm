16falselistbracketsfalse
#### 1. 添加shipping record 增加枚举项目

添加shipping record时，action type 增加选项：

Pre-position

Pick up(CY empty)

Pick up(CY loaded)

#### 2.Cancel/Abnomal Waybill 原因更新为选取内容
1. reason更新为选择：

cancel 选项值：

Foul trip 
Canceled      
Can‘t support

Abnormal 选项值：
No Show        
Irregular

1. 增加 description 说明，限制2000字符，获取焦点需展示字数统计，超过字数不允许继续输入
2. 写到remark时，reason更新为remark的 type ,descreption为remark的说明

#### 3. 添加运单时允许填写Truck Type
1. 影响页面：创建运单： 创建运单增加  Required Truck Type 字段，为必填项
1. 可选范围为：standard dispatch为 该project下route lib已添加的truck type,
2. temporary dispatch可选所有truck type
3. 若数据为空，提示“No data, You can add truck types in Route Libraries”

1. copy运单，弹窗不变，所copy运单中的required truck type 和 actual truck type 均带到新运单中
2. 批量创建运单，增加 Required Truck Type字段，必填
1. 当所填写truck type不为该project下已添加的truck type时，错误原因： Required Truck Type is not among the project truck type
2. Required Truck Type 和carrier info中的truck type不一致，导入时不做提示
3. 编辑运单：
1. 编辑运单，其他逻辑不变，允许编辑Required Truck Type，编辑选择truck type 逻辑同新建；
2. 当编辑truck type时，需触发运单算价，且修改后Required Truck Type≠actual truck type ，发slack消息通知项目pricer+on site OC
3. 该项目未填写，提交时校验，并外框置红提示“Please select Required Truck Type”
1. select Truck: 展示 Required Truck Type， 不允许编辑；
1. 待选列增加字段Truck Type Consistency ：展示当前待选车型与需求车型是否一致；一致“Consistent”不一致： “Inconsistent”； 一致的车型排序展示到前面，再为其他排序逻辑
2. 点击next, 若 Required Truck  Type ≠ Actual Truck  Type，toast 提示 “Customer Required Truck  Type is inconsistent with Actual Truck Types ”  3S
3. 当confirm carrier信息时，若车辆类型不一致，则给该项目 pricer+On site OC 发送 slack 信息: “ {waybill no. } Customer required truck type {truck type} is inconsistent with  actual truck type {actual truck type}
1. waybill detail---Carrier信息，增加展示Required Truck Type

原 truck type 更新为“Actual Truck Type”

7.waybill list page：
1. 列表中与筛选条件中的 truck type 均更新为 Actual Truck Type
2. 筛选条件增加Truck Type Consistency ：Consistent, Inconsistent;    筛选列表中实际使用与客户需求truck type是否一致的waybill， 若为空则展示所有
3. 更新筛选条件中的顺序与列表顺序一致，列表中无的筛选条件则放置在最后
4. waybill detail-- billing模块
1. 增加计费模式展示， 允许编辑, 修改计费模式并保存后，触发重新算价（可编辑的时机和权限和edit保持一致），默认均为required truck type   4/3update
2. 原edit更新名称叫“Edit Basic Amount ”, 编辑内容，逻辑不变
3. vendor及customer的 basic Amount 展示该费用为自动计算或手动填写的icon
1. customer端 waybill detail 中的truck type展示实际使用的truck type ，字段名称依然为Truck Type

Customer 端 truck type统计 实际使用的truck type
1. 修改truck type时，需校验该车是否有非终态运单
1. 如有非终态运单，则提交修改时toast 提示 “It is not allowed to modify the truck type while the truck is in use ”
2. 理想状态是点击edit时，即判断是否有非终态运单，如有，则该弹窗中truck type为不可修改（后端接口时长2S以内，建议这种形式）
3. 弹窗名称从add truck---更新为（Modify Truck）
1. 定时任务(delivery+completed) +手动导出列表 waybill list , 原 truck type 更新为“Actual Truck Type”， 增加字段: Required Truck Type（顺序为在Actual truck type之后）,  Billing Truck Type  to Customer ， Billing Truck Type  to Vendor ，Truck Type Consistency新增字段添加于列表最后
2. 历史数据处理：actual truck type= 原truck type，  Required Truck Type置为与actual truck type一致， billing truck type 置为required  truck type； 4.3update

#### 4. Shipping Record 中路线绘制逻辑更新
1. 更新shipping record加载时，不影响当前页面操作；
2. waybill detail---shipping records增加字段
1. GPS status:
- With GPS: 该车安装GPS设备
- No GPS: 该车未安装GPS设备
- 需UI设计2种状态的icon

b. Method of obtaining location： 权限同（add record 按钮）
- 当No GPS, 默认为Manual obtain且不可修改
- 当GPS status ≠No GPS时， 默认为Manual obtain, 允许修改；不记录每次修改内容
- 当Method of obtaining location =GPS obtain时， Add shipping records 弹窗中position为自动获取
- 当Method of obtaining location =Manual obtain时，Add shipping records 弹窗中position为手动添加
- 运输记录需展示手动添加点与自动获取点的不同标识（vendor端需同步展示, 客户端不展示）
- 允许修改运输记录中的位置点,  修改按钮权限单独控制（logistic 角色）
- 修改位置按钮，UI协助使用其他icon
1. route 绘制更新为使用shipping record中的点进行绘制

#### 5.创建运单项目增加客户tag

当创建项目运单时，project 待选项中增加展示其对应customer tag, 需定义tag最长宽度，当tag超过最长宽度时，截断仅展示“…”；需UI重设弹窗宽度,

#### 6. 创建运单Required delivery Time，更新为必填项目

涉及内容：create waybill默认为空值 ,  copy waybill 默认为空值; 未填写提交时校验，该行外框置红，并提示‘Please enter required delivery Time ’

批量创建运单：
- 检查时间格式, 格式错误，提示“{列名}+wrong Required Delivery Time  format”
- Required delivery Time不得早于position time, 否则错误原因： Required Delivery Time needs to be later than position time
- 未填写该字段，同批量创建运单其他必填字段为空情况

历史数据处理:  不处理

#### 7. Customer Portal --homepage--shipping records更新加载方式

数据需进行分页，前端样式同需展示页数