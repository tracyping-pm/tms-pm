none
Statement Process 为在对账单中无需基于运单出账部分（ Miscellaneous Charge）的流程处理，可类比为Waybill中的 Financial Status Subtask, 通过此流程可更新 Miscellaneous Charge

在Statement Details 中展示该对账单对应的 Statement Process ，所有的 Statement Process则归集于Statement Process菜单中进行集中展示 (大部分逻辑可参考 finacial process )

# 1. 项目配置更新

项目层流程配置增加对账单的流程配置内容，对账单流程基本逻辑与原财务流程一致
1. 原Subtask Configuration  更名为：  Process Configuration
- 项目终态（Canceled，Terminated，Completed）依然展示该按钮，点击展示弹窗内容，但不可操作该弹窗（此条，同应用于 POD Configuration 按钮）
1. Process Configuration 弹窗增加 process Type
2. 增加流程类型（本类型仅为暂代，上线后可能会有更新）
1. 其中项目范围为新增，即该流程仅可在对账单中进行引用，创建流程时需允许选择该范围，
2. Statement Process范围内的流程仅可使用于对账单，Waybill subtask 范围内的流程仅可用于运单
3. 新增流程类型：Statement Miscellaneous Charge by Customer 及 Statement Miscellaneous Charge by Vendor

| Process Scope | Process Type | Dependent Fields | Field Type | Field Configuration | Process Effect |
| TH +PH Statement Process | Statement Miscellaneous Charge by Customer | Result | Dropdown List | Option 1: No Charge
Option 2: Need to Charge | 结果是1时，无效果
结果是2时，按charge 项目（customer charge 类型字段名称)，对客户对账单杂费部分添加费用项（名称+金额） |
| TH +PH Statement Process | Statement Miscellaneous Charge by Vendor | Result | Dropdown List | Option 1: No Charge
Option 2: Need to Charge | 结果是1时，无效果
结果是2时，按charge 项目（customer charge 类型字段名称)，对供应商对账单杂费部分添加费用项（名称+金额） |

1. 对账单流程配置，
1. 若为required, 则生成对账单时，若对账单包含该项目，则自动生成该流程（包含的多个项目均有同name的流程，则生成一个即可）
2. 若为 optional 则包含该项目的对账单，允许手动添加该流程
3. 对账单可添加流程为对应项目的配置合集（同一流程需去重）
4. 其他已有交互等逻辑保留

# 2. Statement Process应用

## 2.1 Statement Process List 展示

筛选条件

| 字段名称 | 类型 | 搜索逻辑 |
| Statement Number | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果 |
| Process Type | 下拉选择 | 默认所有, 单选 |
| Process Name | 下拉选择 | 输入框允许搜索（like形式) |
| Status | 下拉选择 | 默认所有状态（All)，允许多选 |
| Result | 输入框 | like搜索，result来源为BPM所设置 |
| Current Assignee | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果；多个相同assignee 需合并展示 |
| Due Time | 日期选择器 | 选择时间段进行筛选 |
| Creation Time | 日期选择器 | 选择时间段进行筛选 |

- **Search (搜索)** 按钮: 点击后根据以上条件进行搜索。
- **Reset (重置)** 按钮: 点击后清除所有搜索条件。
- **I need  to handle (需要我处理）**按钮：点击筛选非终态且Current assignee 包含当前登录账号+角色（包含角色也需区分，即登录A角色，同账号B角色需处理的流程不展示）的 流程，交互可参考电子签，再次点击即取消筛选，reset 可取消筛选。点击search ,则assignee 条件与 search 的其他条件 一起筛选

列表说明
- 排序规则：按创建时间倒序
- Current Progress字段支持点击列标题进行升序或降序排序。排序仅在本页进行排序；
- 列表区域展示了符合搜索条件的对账单流程。每个流程包含以下字段：

| 字段名称 | 描述 |
| Statement Number | 该对账单流程所属的对账单编号。 |
| Process Type |  |
| Process Name | 对账单流程的名称。 |
| Status | In progress, canceled, completed |
| Result | 对账单流程的执行结果，来自BPM中流程的固定字段，例如 Not Completed, Returned to Origin 等。若未到result节点，则为空 |
| Current Progress | 对账单流程的当前未开始节点，若流程已完结，则展示最后一个节点名称，若流程已取消则展示空 |
| Current Assignee | 对账单流程的当前未开始节点的处理人，若有多个则全展示；若流程已完结，则展示最后一个assignee名称；若流程已取消则展示空 |
| Due Time | 对账单流程的截止时间。 |
| Last Ope Time | 最近一次操作时间（有节点流转为一次操作） |
| creation Time | 创建该对账单流程的时间 |
| Creator | 创建该对账单流程的人员或系统。 |
| Operate | 查看详情Detail,有转派权限者展示转派按钮 |

添加流程
- 点击【Add】按钮，弹窗 add statement process
- 若为客户对账单，则type 仅允许添加Statement Miscellaneous Charge by Customer
- 若为供应商对账单 ，则type 仅允许添加Statement Miscellaneous Charge by Vendor
- 故 statement no. 必须先进行填写，两个字母后模糊搜索
- 同一个对账单，允许多个同类型流程，但不能同时非终态同一类型流程

## 2.2 流程详情

参考financial process，基本一致（[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/652509245/Financial+Status+Subtask+List#3.-Subtask-detail](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/652509245/Financial+Status+Subtask+List#3.-Subtask-detail) ）

同样允许以下操作项

| 操作 | 操作说明 | 备注 |
| opetation log | 操作日志，弹窗展示流程所有操作日志 | 权限同 detail，能看详情即可查看操作日期 |
| instruction | 操作说明，弹窗展示该流程全貌流程图 | 权限同 detail，能看详情即可查看操作日期 |
| remind | 提醒，给当前assignee发送提醒 | 提醒内容：XX reminds you to process the statement as soon as possible [statement number]

点击链接跳转至该流程详情页

按钮需单独配置操作权限 |
| Waybill | 跳转至该流程对应waybil | 权限同subtask detail |
| cancel | 节点未终态可取消流程，取消后子任务状态为 canceled | 当前assignee 可操作，创建人可操作 |
| Edit assingnee | 仅该流程 Manually Assignment=Allowed 展示编辑按钮，否则不展示 | 当前assignee 可操作 |