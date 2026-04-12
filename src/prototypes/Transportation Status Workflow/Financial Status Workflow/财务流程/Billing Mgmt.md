16falsenonelisttrue
### 1. Subtask List 需求说明
1. **集中展示所有子任务**：
- Financial Status Subtask List 归集展示所有运单中的子任务，便于用户集中跟踪和处理。
2. **新增 Financial Status** **Subtask List 菜单**：
- 在 TMS 系统中新增Financial Status  Subtask List 菜单，用户可以通过该菜单访问子任务列表页面。
3. **子任务列表页面功能**：
- 子任务列表页面展示系统中所有子任务；
- 提供查看、搜索和过滤功能，帮助用户高效管理子任务。

### 2.  Subtask List

该页面分为两个主要部分：搜索区域和列表区域。

#### 2.1 列表筛选

搜索区域包含以下字段和搜索条件：

| 字段名称 | 类型 | 搜索逻辑 |
| Waybill Number | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果 |
| SubTask Name | 输入框 | like搜索，输入2个及以上字符时展示匹配结果 |
| Status | 下拉选择 | 默认所有状态，多选 |
| Result | 输入框 | like搜索，result来源为BPM所设置 |
| Assignee | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果；多个相同assignee 需合并展示 |
| Due Time | 日期选择器 | 选择时间段进行筛选 |
| Completion time | 日期选择器 | 选择时间段进行筛选 |

- **Search (搜索)** 按钮: 点击后根据以上条件进行搜索。
- **Reset (重置)** 按钮: 点击后清除所有搜索条件。

#### 2.2 列表区域
- 排序规则：按创建时间倒序
- Current Progress字段支持点击列标题进行升序或降序排序。排序仅在本页进行排序；
- 列表区域展示了符合搜索条件的子任务。每个子任务包含以下字段：

| 字段名称 | 描述 |
| Waybill Number | 该子任务所属的运单编号。 |
| Subtask Name | 子任务的名称。 |
| Status | In progress, caceled, completed |
| Result | 子任务的执行结果，来自BPM中流程的固定字段，例如 Not Completed, Returned to Origin 等。若未到result节点，则为空 |
| Current Progress | 子任务的当前未开始节点，若流程已完结，则展示最后一个节点名称，若流程已取消则展示空 |
| Current Assignee | 子任务的当前未开始节点的处理人，若有多个则全展示；若流程已完结，则展示最后一个assignee名称；若流程已取消则展示空 |
| Due Time | 子任务的截止时间。 |
| Completion time/ cancel time | 该子任务到结束节点的时间，若未完成则为空

若该子任务被取消，则展示取消时间 |
| creation Time | 创建该子任务的时间 |
| Creator | 创建该子任务的人员或系统。 |
| Operate | 查看详情Detail,有转派权限者展示转派按钮 |

- 点击【create】按钮，弹窗add subtask

| waybill No. | waybill Number, 文本输入（like 匹配，输入2个及以上字符展示匹配结果）

需过滤掉未confirm delivery 的运单 9/19补充 |
| Process Type | 单选,

可选范围： 本项目(waybill所在项目，未填写waybill No.不可选择type) 配置的所有process type（添加了process name的流程）

同一类型仅允许一个未到结束节点的该类型任务, 否则该选项不可被选中 |
| Process Name | 根据process type 展示该项目process name ,不可更改 |
| Due Time | 若为required 流程，则根据所配置时间自动填入不可更改

若为optional 流程，则自行填写，不得早于当前时间，允许选择今天 |

### 3. Subtask detail

根据不同类型子任务，其详情及操作略有不同, 具体内容可参考：[https://inteluck.atlassian.net/wiki/x/SYCRJg](https://inteluck.atlassian.net/wiki/x/SYCRJg)

#### 3.1 Subtask information
- Waybill Number (运单编号)，Name (名称)，Result (结果)，Current Progress (当前进度)，Current Assignee (当前分配人)，Due Time (截止时间)，Creator (创建人)，creation Time（创建时间）

#### 3.2 Process Execution
- 该模块按节点展示该流程；展示内容为：固定展示start及end, 中间节点展示流程中的所有节点；其中已完成的历史节点置灰；若有未完成分支节点，则不不展示分支节点及其后节点明细；仅展示主流程节点
- 节点展示内容：节点名称，assignee; 若为已操作节点，则增加展示操作时间；
- 点击节点展示该节点明细，若该流程该节点设置项：Manually Assignment=Allowed， 则允许当前assignee 编辑本节点assignee（编辑交互参考[交互说明](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/647069769/Process+Editing+-+Process+Settings#3.1.3.Assignee) ）备注：仅原流程assignee 有此权限，此权限不继承给被指派的assignee
- 历史已完成节点需展示该节点所填写内容及操作时间（退回的流程不再进行重复展示，仅在operation log中作展示）

#### 3.3 Subtask操作

| 操作 | 操作说明 | 备注 |
| opetation log | 操作日志，弹窗展示流程所有操作日志 | 权限同subtask detail |
| instruction | 操作说明，弹窗展示该流程全貌流程图 | 权限同subtask detail |
| remind | 提醒，给当前assignee发送提醒 | 提醒内容：XX reminds you to process the waybill as soon as possible [waybill number] subtask [process name]

点击链接跳转至该子任务详情页

按钮需单独配置操作权限 |
| Waybill | 跳转至该流程对应waybil | 权限同subtask detail |
| cancel | 节点未终态可取消流程，取消后子任务状态为 canceled | 当前assignee 可操作 |
| Edit assingnee | 仅该流程 Manually Assignment=Allowed 展示编辑按钮，否则不展示 | 当前assignee 可操作 |

**opetation log**需记录下当前子任务的操作日志，具体内容如下：

创建子任务：其中系统自动创建也需进行记录

子任务流转节点：操作人 +操作名称（如reject，approve，assigne ，completed ，reject to previous等）the subtask

完成节点：若由Transmittal 自动结束子任务，也需进行记录，操作人记作 {Transmittal  Number}

cancel子任务：操作人  cancel the subtask

#### 3.4 Subtask Notification

| 触发逻辑 | 接收方 | 通知 |
| Subtask在运单中创建成功 | 通知流程第一个节点assignee | TMS内部通知+Slack通知

You have been assigned a *xxx* {process name} subtask, please handle it in time, **View Details**（点击跳转子任务详情） |
| Subtask 已完成该节点 | 通知下个节点assignee | TMS内部通知+Slack通知

XXX{上节点assignee昵称} has transferred a  *xxx* {process name} subtask to you, please handle it in time，**View Details**（点击跳转子任务详情） |
| 流程中编辑assignee完成 | 通知被转派assignee | TMS内部通知+Slack通知

XXX{assignee编辑人昵称} has transferred a  *xxx* {process name} subtask to you, please handle it in time，**View Details**（点击跳转子任务详情） |
| 发起Remind | 通知当前assignee | TMS内部通知+Slack通知

xxx （操作人昵称）reminds you to handle *xxx* {process name}  subtask，**View Details**（点击跳转子任务详情） |
| Subtask 被Transmittal 自动完成 | 通知当前assignee | TMS内部通知+Slack通知

Transmittal has completed {该assignee 被完成子任务数量} {process type}  subtask，**View Details**（点击跳转子任务列表） |
| subtask 被取消 | 通知创建人 | TMS内部通知+Slack通知

XXX{取消操作人昵称} has canceled    *xxx* {process  name} subtask |

注： Subtask 被Transmittal 自动完成后，状态为Completed