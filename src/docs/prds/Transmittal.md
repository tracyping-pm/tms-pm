16falsenonelisttrue
## 1. Transmittal 需求说明
1. **POD 文件收讫证明**：
- Transmittal 用于证明 POD 文件已经收讫（Inteluck 收到供应商的文件，或客户收到 Inteluck 的文件）。
2. **关联 Waybill**：
- 一张 Transmittal 可以证明多个 Waybill 的 POD 已经收讫。
3. 设计目标：
- 提高 POD 文件管理效率：
- 集中管理 POD 文件和 Transmittal 记录，提高操作便捷性和效率；
- 通过关联多个 Waybill，简化 POD 文件收讫类子任务确认流程。
- 提升数据准确性和可追溯性：
- 确保每个 POD 文件都有对应的 Transmittal 记录，提高数据准确性；
- 提供完整的收讫记录和操作日志，便于追溯。

## 2. Transmittal List
- 该页面分为两个主要部分：搜索区域和列表区域。
- 点击‘Add Transmittal ’， 跳转至Add Transmittal 页
- 菜单位置：位于subtask 下

### 2.1 列表筛选

搜索区域包含以下字段和搜索条件：

| 字段名 | 描述 | 搜索逻辑 |
| Transmittal Number |  | 参照waybill No. 进行模糊匹配 |
| Transmittal Type | 文档类型，默认全部 |  |
| Customer Name | 输入客户名称 | 模糊匹配 |
| Vendor Name | 输入供应商标签 | 模糊匹配 |
| Status | 选择Transmittal的状态（Canceled,

Awaiting Confirmed, Confirmed） | 多选 |
| Creation Time | 选择Transmittal创建的日期范围 | 选定日期范围内 |

### 2.2 列表区域
- 排序规则：按创建时间倒序
- 列表区域展示了符合搜索条件的子任务。每个子任务包含以下字段：

| 列名 | 类型 | 描述 |
| Transmittal Number | 文本 | Transmittal的唯一标识符 |
| Customer Name | 文本 | 与Transmittal相关的客户名称, By Inteluck, 不展示Customer  Name |
| Vendor Name | 文本 | By Customer, 不展示Vendor Name |
| Status | 文本 | Transmittal的当前状态 |
| Statistical Interval | 日期 | Transmittal的统计区间，取该transimittal 的运单unloading time的时间区间 |
| Creation Time | 日期 | Transmittal的创建时间区间 |
| Operation | 操作 | 可以对Transmittal执行的操作（Details, Cancel等） |

- 操作：
- **Details:** 跳转至Transmittal details
- **Cancel:** 取消Transmittal， 需做二次确认

## 3.  Generate Transmittal

**Transmittal Type : 默认为By Customer,**可选项：by customer/ by inteluck； by customer, 则选择客户名称（单选）, by inteluc**k** 则选择Vendor Name(单选）

Waybill Selection

填写vendor/customer name 之后根据相关客户或供应商名展示运单
- 选择该Transmittal所关联的运单，运单范围展示全部该客户/该供应商 delivered 且未被同类型transmittal关联的waybills，允许进行相关筛选, 其中Doc. NO. 搜索范围为所有type 的文件编号
- 运单筛选：所有内容均为多选（同一筛选条件多个选项为**或**关系，即任一命中，则展示该命中项； 多个筛选条件为**和**关系，需共同命中，展示被命中项），时间为时间段（date-time）选择；Doc. NO. 为单选且精确搜索
- 运单中的Doc No. 则根据每个运单中已上传POD NO.生成；点击Edit Doc. NO. ，允许编辑该waybill document NO.，若增删改了文件编号，需回写至原waybill information；其中Document的Type, 为Project configuration 所设置的项目的type;  同时，同一个type允许被选取多次

- 运单列表，仅展示运输状态为delivered的运单，排序规则按 Delivery Time倒序排列，列表字段如下：
- 一个运单仅可关联非取消状态同类型（by inteluck /by customer）的Transmittal 一次（即运单A已被by inteluck 且状态为awaiting confirmed 和confirmed 的transmittal 关联过，则A不可再被by inteluck的transmittal 关联,但可继续被by customer的 transmittal 关联）

| 列名 | 描述 |
| Project Name | 项目名称 |
| Waybill No. | 运单编号 |
| Customer Name | 客户名 |
| Vendor Name | 供应商名 |
| Unloading Time | 运单的卸货时间 |
| Delivery Time | 运单的交货时间 |
| Truck Type | 使用的卡车类型 |
| Plate Number | 卡车的车牌号码 |
| Origin | 运单的起点位置，三级地址+详细地址 |
| Destination | 运单的目的地位置，三级地址+详细地址 |
| Document Number | 与运单相关的所有文件编号, 展示格式：“类型：编号”，数据源为运单POD模块所传文件编号+编辑内容 |

- 完成waybill 选择，点击【generate 】，生成Transmittal；若无waybill 被选中，则Generate 按钮不可用
- Transmittal number 生成逻辑：PTF+YYMMDD+4位流水号
- 创建成功后，页面至 Transmittal detail 页

## 4. Transmittal Detail

### 4.1 Transmittal Status

Transmittal 状态流转如下

### 4.2 Transmittal details

#### 4.2.1 Awaiting Confirmed状态页面信息
- 显示 Transmittal 的基本信息，包括 Transmittal Number, Transmittal Type，Customer Name/Vendor Name(  根据Transmittal Type 若为by customer ,则展示Customer Name，若为by inteluck,则展示Vendor Name）、 Statistical Interval, Status, 和project name( 展示所有waybill 所属project，若固定宽度无法展示完全，hover 展示所有）
- 用户可以查看关联的 Waybill 信息，包括 Waybill Number, Delivery Time, Customer Name, Vendor Name, Document Type, 和 Document Number; 多个文件类型/编号则展示多行

- 提供操作按钮，包括：
- **“Confirm Received”**:  点击弹窗需上传确认收到的证明文件（必填），至少一个，支持多个文件，单个限制30M，合计限制200M（建议支持合并上传，即同时选中多个文件，拖拽至上传区域，同时进行上传（该交互待评估）），填写说明，非必填，最多2000字
- 确认后， Transmittal 状态更新为Confirmed
- transimittal type= by inteluck 的transimittal 确认后，该 Transmittal 所关联的waybill 的所有Type= POD Receipt by inteluck 的子任务 Result 更新为 Received , 走到终止节点
- transimittal type= by customer 的transimittal 确认后，该 Transmittal 所关联的waybill 的所有Type= POD Receipt by customer 的子任务 Result 更新为 Received , 走到终止节点

- **“Cancel”**：弹窗做二次确认，填写原因，非必填，最多2000字
- 确认后， Transmittal 状态更新为canceled

- **“Operation Log**：弹窗展示操作日志

需记录操作类型：Created ，Confirm Received，Cancel

#### 4.2.2 Confirmed 状态页面信息
- 增加展示proof 切页

#### 3.2.4 Canceled 状态页面信息

不允许相关编辑，可查看Operation Log,