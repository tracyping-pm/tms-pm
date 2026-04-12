16falsenonelisttrue
# 一，时间节点

| 第一轮测试完毕 | 发布UAT

717 | 发布上线 |

# 二，变更日志

# 三，需求说明

## 1. 历史遗留处理

#### 1.1 电子签增加内容
- step 1 添加文件时增加签约主体选择:可选范围为UAM中所有BU，且选项中展示该主体的证书有效时间末日，若当前时间已超过有效期末日，或该主体无证书（选项则不展示有效期情况），则该选项置灰不允许进行选取；
- 点击该不可选项目：message 提示“The contracting entity certificate is unavailable ”
- 默认选择当前登录账号所在BU，若当前登录所在主体无证书或证书过期，则置空默认项
- 签约主体说明文案：”The contracting entity refers to the legal entity you represent in the contract. This is the party that holds the legal responsibility and rights in the agreement. It is crucial to clearly identify the contracting entity to ensure that the contract is legally binding and enforceable, specifying who is obligated to fulfill the terms and conditions outlined in the contract“ ，样式同其他说明文案保持一致
- Step4 增加签约主体及其证书有效期展示
- 若签约时限内，证书将过期，则在输入框失焦后进行提示”【过期时间】 The contracting entity certificate will expire“

#### 1.2 在“Capacity pool detail” -> “Trucks List”切页面增加“Plate No.”筛选项

模糊查询方式, 搜索范围：搜索结果均在本运力池中获取

角色数据权限中：self and subordinates， 取值为自己（该账号）及该账号的下属账号所创建的数据

;而非根据角色进行数据权限透传

7.12 ADDED

#### 1.3 Vendor 认证状态

vendor、Truck 认证状态被更新为Unaccredited， 不从capacity pool 移除（已完成）
- project下capacity pool切页， capacity pool detail 中的vendor list ,
- 列表增加【accreditation Status】字段，展示该vendor 的认证状态为【Unaccredited/Accredited/blocked/Terminated 】；
- detial 页筛选增加【accreditation Status】条件
- capacity pool detail 中的Truck list 列表及筛选条件增加【Vendor accreditation Status】字段，list 位置放置在Vendor Tag后
- ASSIGN Truck， Vendor 选择处增加【accreditation Status】字段, 展示该Vendor 认证状态

#### 1.4 运单处理工具优化
- 同步数据按钮更新为两个，分别同步start waybill 及cancel waybill ，按钮位置分别放置在 Start waybill 及cancel waybill
- 同步中时，该表格按钮置灰，不允许进入该表，且sync data 增加加载状态展示
- 同步结果增加手动刷新按钮