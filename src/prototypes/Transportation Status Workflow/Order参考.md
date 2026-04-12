**Customer**主要字段

| 字段 | 说明 |
| Customers Name | 客户主体官方名称，唯一性 |
| Customers Tag | 客户标签，简称，唯一性 |
| Industry | 客户行业，枚举值，点击查看具体说明 |
| Country | 客户所在国家，枚举值，获取Domains |
| PAD | 客户所在地区的第一级行政区划，全文都需要根据具体的行政区划显示名称，如区，省 |
| SAD | 客户所在地区的第二级行政区划，全文也需要根据具体的行政区划显示名称 |
| TAD | 客户所在地区的第三级行政区划，全文也需要根据具体的行政区划显示名称 |
| Status | 客户状态，[点击查看具体说明](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/447905843) |
| Priority | 重要程度，枚举值，1~10，数值越大重要程度越高 |
| Size | 客户规模，枚举值，包括Small, Medium, Large, Giant共4种 |
| BD | 关联的Customer BD，也可以为空Unassigned |
| Creation time | 客户的创建时间 |

其中Industry包含如下：

| Food and Beverages |
| Distributor |
| Manufacturer |
| Daily Commodity (FMCG) |
| Logistics |
| Raw Materials (Food/Non-food) |
| Telecommunications |
| Construction / Hardware |
| Healthcare / Pharma |
| Chemicals |
| Packaging Materials |
| Individual |
| Electronics |
| Home / Electric Appliances |
| Automotive |
| Machinery |
| Agriculture |
| E-commerce |
| Office / Home Furnitures |
| Software |
| Utilities |
| Whosale |
| Services Provider |

相关字段**Contact**

| 字段 | 说明 |
| Name | 联系人姓名 |
| Title | 联系人职位 |
| Number | 联系人电话 |
| Email | 联系人邮箱 |
| Notes | 联系人备注信息 |

相关字段**Follow up records**

| 字段 | 说明 |
| Time | 客户跟进时间 |
| Description | 客户跟进说明 |
| Material | 资料文档 |

相关字段**Perception**

| 字段 | 说明 |
| Time | 信息更新时间 |
| Description | 内容描述 |
| Material | 资料文档 |