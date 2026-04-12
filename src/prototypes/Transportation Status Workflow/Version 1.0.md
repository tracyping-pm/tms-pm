# 原型设计

网址：[https://4fzuhe.axshare.com](https://4fzuhe.axshare.com/)

密码：123456789

注意：同步到AxShare的原型设计，主要是产品的设计文稿，具体的设计应以Confluence中的需求说明为主。

# 公司目标
1. BD、Vendor accreditation、Operation、Pricing Database + RFQ、POD及结束后的单据 全部部署到TMS系统上；
1. 业务效果：
1. 移除DTR、Price Database、Client Tracking Database、Trucker List等google sheet的使用
2. 实现基本流程控制、预警、错误提示，包含
1. BD、Pricing、Vendor、Dispatch、Operation、价格计算和运单生成流程
2. 预警（对运营异常、合同异常、Proposal异常的预警处理）
3. 对派单和其他动作的基本错误进行提示和预防
4. ...
1. 基本报表显示，包含Revenue、订单、Margin、客户数量、Vendor数量
1. 财务结果的效果（具体数字我们后续来一起测算下）：
1. 人力成本降低
2. 通过系统进一步达到 分析效率提升、vendor utilization优化（预期在2024年Q1结束时，通过系统和operation项目将Logistics提高到PH 15%，TH 10%的毛利）

# 产品目标

## 陆路运输流程管理

联通Customer，Vendor，Pricer，Dispatcher，Finance通过“项目-订单-运单”实现物流项目的流程管理
业务流程的通知与预警，弱阻塞
 TMS+Drive归档业务资料

## 上下游账务管理

客户应付账务管理
供应商应收账务管理 (常规结算+提前结算)

## 业务统计与分析

数据库日常业务统计任务与邮件订阅

# 项目计划

TMS RoadMap