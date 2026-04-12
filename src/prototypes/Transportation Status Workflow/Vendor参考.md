**Vendor**主要字段

| 字段 | 说明 |
| Vendor Name | 供应商主体官方名称，有唯一性 |
| Vendor Tag | 供应商标签，简称，有唯一性 |
| Garage Location | 供应商车库位置 |
| Country | 供应商所在国家，枚举值，获取Domains |
| PAD | 供应商所在地区的第一级行政区划，全文都需要根据具体的行政区划显示名称，如区，省 |
| SAD | 供应商所在地区的第二级行政区划，全文也需要根据具体的行政区划显示名称 |
| TAD | 供应商所在地区的第三级行政区划，全文也需要根据具体的行政区划显示名称 |
| Status | 供应商状态，包括Unaccredited，Accredited，Blocked共3种 |
| Trucks | 供应商Truck数量 |
| BD | 关联的Vendor BD，也可以为空Unassigned |
| Tax Mark | 付款含税类型，包含Tax-Inclusive和Tax-Exclusive |
| Creation time | 供应商的创建时间 |