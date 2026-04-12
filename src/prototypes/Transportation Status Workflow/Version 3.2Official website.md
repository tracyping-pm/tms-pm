### 一， 删除Truck 的access status

背景：vendor 被approve 之后，由于合同到vendor 层面，故无需对该Vendor 的车辆进行单独审批，删除Truck 的 Access status 字段

涉及页面/流程：
1. 添加vendor 至该capacity pool，默认该vendor Access status 为Approved ,同时，该Vendor 所属车辆均加入 capacity pool ，不再展示truck 的 Access status；
2. 车辆调度（Select Truck）不再展示Access Status，且不用车辆access status 作为车辆调度条件
3. 删除capacity pool  list 中的 Approved Trucks 字段
4. 批量导入时同样忽略 truck 的access status 校验

### 二，增加vendor 、truck、driver 详情字段
1. vendor 、truck、driver 的详情页--基础模块，增加**Mark** 字段
2. 允许通过基础信息模块的Edit 进行统一编辑，展示编辑时间+内容
1. vendor 、truck、driver若进行手动状态变更( vendor 更新为Blocked、Terminated，Accredited；truck 更新为out of use , Accredited；  driver 更新Bolcked ，Accredited) 增加填写原因（必填）；
1. 所填写原因更新到Mark 中：格式为：{更新时间}+{状态，}+{原因}， 如：”2024-08-05 17:29:17
Block ,the vendor is lack of cooperation“
2. 前端仅展示最近一次Mark ,后端需保存历次mark 记录
3. 派车时，vendor 、truck、driver需展示最近一次Mark, hover时 展示整条Mark 内容; 若无则展示”-“

补充：hotfix --**Batch Create Waybill**文档备查
1. Route Info. 均更新为非必填项： 即允许不填写地址/路线相关信息； 若未填写任何路线信息，同样创建运单，该运单无路线信息；
1. 若填写了地址/路线信息，校验逻辑同前（[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/598638593/Version+3.1#B.%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5waybill%E9%80%BB%E8%BE%91%E6%9B%B4%E6%96%B0](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/598638593/Version+3.1#B.%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5waybill%E9%80%BB%E8%BE%91%E6%9B%B4%E6%96%B0) 即label/address/坐标 至少一对）），若无法匹配到相关路线，则将所填写地址/路线信息丢弃，创建一条无路线运单（结果提示“import success without route , +{错误提示}”）
2. 导入表更新为两个sheet , sheet1 为import data，展示导入数据，导入完成，清空该sheet, sheet2 import results 展示最近1次导入结果，展示import data页所有字段+导入结果列；
3. 导入结果：写入所有成功行，并在新标签页展示 导入结果，成功行：Success，失败行则返回失败原因
4. 历史数据：不进行处理，删除所有历史数据
5. 若所填写truck type 不再本route lib中，则结果提示“ Truck type is not in the route library‘’  813更新

页面影响：

waybill detail : 进入详情页，若route 信息为空将“system error ”的toast 提示文案更新为: “ Waybill has no planned route”，其他阻塞信息保持原逻辑，如：前端进行assign truck 时校验route 信息是否为空等

进入详情页，点击【submit】, 若route 信息无 具体地址信息，无法计算路线里程，则toast 提示“Route does not have a specific address, you can choose a route through **Plan Route**” , 不阻塞流程，根据waybill 的计费模式，若为by mile 则在运单运输状态变更时进行阻塞

8/9补充：customer、vendor 删除空格导致的重复历史数据处理方案

[https://docs.google.com/spreadsheets/d/1c2TvPQaONCvbTVbqlnjDXt3r6B9hNh-nJQPJMpMReaQ/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1c2TvPQaONCvbTVbqlnjDXt3r6B9hNh-nJQPJMpMReaQ/edit?usp=sharing)