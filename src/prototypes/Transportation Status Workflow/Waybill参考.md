**Waybill**主要字段

| 字段 | 说明 |
| Waybill Number | 运单的编号 |
| Dispatch Type | 运单调度的类型，Standard Dispatch、Temporary Dispatch |
| Project | 运单所关联的项目 |
| Customers | 运单所关联的客户 |
| Tag | 运单所关联的客户简称 |
| Position time | 运单出发时间 |
| Completion Time | 完成时间 |
| Status | 运单状态，[点击查看具体说明](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/448102490) |
| Dispatcher | 项目相关的调度员 |
| Customer BD | 项目客户关联的Customer BD |
| Vendor BD | 项目相关Opportunity的Vendor BD |
| Pricer | 项目相关Opportunity的Pricer |
| Creation Time | 创建时间 |

相关字段**Libraries Route**，用于记录订单命中了Route Library中的哪些Route以及具体的出发地和目的地，和具体地址信息。

| 字段 | 说明 |
| Origin PAD | 出发地的一级区划 |
| Origin SAD | 出发地的二级区划 |
| Origin TAD | 出发地的三级区划 |
| Address | 出发地详细地址 |
| Waypoint | 途经地 |
| Destination PAD | 目的地的一级区划 |
| Destination SAD | 目的地的二级区划 |
| Destination TAD | 目的地的三级区划 |
| Address | 目的地详细地址 |
| Route Code | 路线编码 |

相关字段**Places**，来源于**Libraries Route**，但还要包括详细地址

| 字段 | 说明 |
| PAD | 一级区划 |
| SAD | 二级区划 |
| Origin TAD | 三级区划 |
| Address | 详细地址 |

相关字段**Map Route**，用于记录Dispatch运单时，通过Map获取的所有路线信息，以及选择的路线。

相关字段**Truck**

| 字段 | 说明 |
| Plate Number | 车牌号 |
| Truck Type | Truck类型 |
| Capacity | Truck载重 |
| Vendor Name | 供应商名称 |
| Vendor Tag | 供应商简称 |
| Contact | 供应商联系人 |
| Number | 供应商联系人联系电话 |
| Email | 供应商联系人邮箱 |

相关字段**Driver**

| 字段 | 说明 |
| Truck Driver | 司机名称 |
| License Number | 司机驾照编号 |
| Driver Contact | 司机联系方式 |

相关字段**Helper**

| 字段 | 说明 |
| Helper | 助手名称 |
| Helper Number | 助手联系方式 |

相关字段**Fee**

| 字段 | 说明 |
| Waybill Receivable Amount | 应收款总额 |
| Basic amount receivable | 应收基础运费 |
| Additional Amount Receivable | 应收附加费用 |
| Waybill Payable Amount | 应付款总额 |
| Basic amount payable | 应付基础运费 |
| Additional amount payable | 应付附加费用 |
| Percentage in Advance | 提前应付比例 |

相关字段**Shipping Records**

| 字段 | 说明 |
| Action | 运输动作 |
| Time | 发生时间 |
| Pisition | 定位 |
| Note | 说明 |
| On-Site | 现场照片或视频 |

相关字段**Partial Payment**

| 字段 | 说明 |
| Percentage of paid in advance | 提前支付的比例 |
| Percentage of handling fee | 手续费比例 |
| Percentage of Regular Payments | 常规支付比例 |