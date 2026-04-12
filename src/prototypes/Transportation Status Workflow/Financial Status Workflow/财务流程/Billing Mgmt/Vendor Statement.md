none
# 1. 运输状态流转

# **2. 财务状态流转**

## 2.1 财务状态流转图

## 2.2 财务状态流转表

|  | 前序状态 | 操作 | 条件判断 | 后序状态 |
| 1 |  | 创建运单 | - | Not Started |
| 2 | Not Started | Abnormal Waybill | 当前所有异常原因 | Awaiting POD Verification |
| 3 | Not Started | Cancel Waybill | 当前所有取消原因 | Awaiting Price Verification |
| 4 | Not Started | Confirm Delivery | with POD receipts type subtask | Awaiting POD HardCopy |
| 5 | Not Started | Confirm Delivery | POD receipts Not required | Awaiting POD Verification |
| 6 | Awaiting POD HardCopy | confirm POD receipts | POD receipts Subtask completed | Awaiting POD Verification |
| 7 | Awaiting POD Verification | confirm Verification | Subtask not completed | Awaiting Exception Handling |
| 8 | Awaiting POD Verification | confirm Verification | Subtask completed | Awaiting Price Verification |
| 9 | Awaiting Exception Handling | - | sub-tasks completed | Awaiting Price Verification |
| 10 | Awaiting Price Verification | Reject Price | - | Awaiting POD Verification |
| 11 | Awaiting Price Verification | Confirm Price | - | Awaiting Settlement |
| 12 | Awaiting Settlement | Reject Waybill Information | - | Awaiting POD Verification |
| 13 | Awaiting Settlement | Reject Price | - | Awaiting Price Verification |
| 14 | Awaiting Settlement | - | All Settlement Item settled | Settled |

## 2.3 各状态影响信息模块可操作性

除了状态对各模块可操作性的影响之外，权限设置和特定限制也是决定模块是否可操作的重要因素。

例如，已结算（settled）状态的结算项不允许再进行编辑。状态控制构成系统操作的第一层级判断。

因此，应当综合考虑这些影响因素。

1126补充一处需处理逻辑：原billing 模块中 编辑 basic amount，编辑additional charge, 编辑 Partial Payment 弹窗在三个终态（Canceled， Abnormal, Completed）下不允许做增删改的操作；当前需**删除**该逻辑

| 模块 | Subtask | Billing | Tracks | Route | Carrier | POD | Basic Info. | Remark |
| 模块操作 | Add subtask | Linked Statement | Edit Basic Amount | Edit Additional Charge | Edit Exception Fee | Edit Claim | Partial Payment | Billing Truck Type | Add Record | Plan Route | Assign Carrier | Add POD | Edit Customer Code | Edit Info. | Project members | Add Remark |
| 财务状态 |
| Not Started( Planning） | 无该模块信息 |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | 无该模块信息 | ✔ | ✔ | 无该模块信息 | ✔ | ✔ | ✔ | ✔ |
| Not Started( Pending） | 无该模块信息 |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | 无该模块信息 | ✔ | ✔ | 无该模块信息 | ✔ | ✔ | ✔ | ✔ |
| Not Started(in transit) | 无该模块信息 |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting POD HardCopy | ✔ |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Awaiting POD Verification | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ | ✔ | ✔ |  | ✔ | ✔ |
| Awaiting Exception Handling | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |  |  |  | ✔ |  |
| Awaiting Price Verification |  | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |  |  |  |  |  |  | ✔ |  |
| Awaiting Settlement |  | ✔ |  |  |  |  |  |  |  |  |  |  |  |  | ✔ |  |
| Settled |  | ✔ |  |  |  |  |  |  |  |  |  |  |  |  | ✔ |  |
| Closed |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

# 3. Cancel Waybill 处理
1. 弹窗说明更新为：“ Canceled the waybill , financial status will be updated to Awaiting Price Verification.”
2. cancel 原因隐藏“Cancelled by Inteluck” ,即 cancel waybill 不再转为 Closed 的财务状态