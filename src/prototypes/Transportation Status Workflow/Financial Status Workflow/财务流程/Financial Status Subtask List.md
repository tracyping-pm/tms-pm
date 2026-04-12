16falsenonelisttrue
# 一，时间节点

| 第一轮测试完毕 | 发布UAT | 发布上线 |

# 二，变更日志

| 时间 | 变更人 | 变更内容 | 内容链接 | 需关注人 |
|  |  | 初版内容 |  |  |

# 三，需求说明

## 1. 迭代说明
- 通过在运输管理系统（TMS）中实现可自定义的子任务工作流，在项目层面设置一系列可自定义的子任务，子任务拥有较大的自由度，及可扩展度，可较大层面涵盖业务端对运单的各类数据，文件的需求；
- 运单在原运输状态的基础上增加财务状态以体现，跟踪运单财务的进展情况；确保财务处理的高效性和准确性。
- 通过在运单完成运输交付后，根据不同子任务状态为基础影响不同的财务状态转换及影响财务数据，从而提高运单处理过程中各类必要数据及文件的可获得性及准确性

### 1.1 详细描述：
1. 系统将允许用户使用流程引擎定义和分配子任务。
2. 每个子任务将有特定的条件，一旦满足这些条件，就会转换运输的财务状态。
3. 财务状态转换将包括“未开始”、“ ”待确认信息“ ”、“等待财务审核”、“已结算”和“已完成”等阶段。

### 1.2 财务状态流转：

其中 line 16本期暂不处理

|  | 前序状态 | 操作 | 后序状态 |
| 1 |  | 创建运单 | Not Started |
| 2 | Not Started | abnomal Waybill | Awaiting Information Verification |
| 3 | Not Started | Cancel Waybill | Awaiting Price Verification |
| 4 | Not Started | Cancel  Waybill | Closed |
| 5 | Not Started | Confirm Delivery & with POD receipts type subtask | Awaiting POD Receipt |
| 6 | Not Started | Confirm Delivery & POD receipts Not required | Awaiting Information Verification |
| 7 | Awaiting POD Receipt | confirm POD receipts & POD receipts Subtask completed | Awaiting Information Verification |
| 8 | Awaiting Information Verification | confirm Verification & Subtask not completed | Awaiting Exception Handling |
| 9 | Awaiting Information Verification | confirm Verification & Subtask completed | Awaiting Price Verification |
| 10 | Awaiting Exception Handling | Confirm Handled & sub-tasks completed | Awaiting Price Verification |
| 11 | Awaiting Price Verification | Reject | Awaiting Information Verification |
| 12 | Awaiting Price Verification | Confirm Price | Awaiting Settlement |
| 13 | Awaiting Settlement | Reject Information | Awaiting Information Verification |
| 14 | Awaiting Settlement | Reject Price | Awaiting Price Verification |
| 15 | Awaiting Settlement | Statement completed | Settled |