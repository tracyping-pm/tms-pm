首先前提，我给你说明下业务逻辑：
1. 流程的起点与初始状态，对账单的生成有两种不同的发起路径：
（1）由 TMS 端发起： TMS 内部直接创建对账单，单据进入 Under Payment Preparation 状态。在这个阶段，如果单据不再需要推进，可以直接作废流转至 Canceled 状态结束。
（2）在VP (Vendor Portal) 端创建对账单可以Save As Draft，也可以直接把单据提交到TMS侧的AP Statement进入 Awaiting Comparison 状态。
2. 价格对比与修改循环 (针对 Awaiting Comparison)
   处于 Awaiting Comparison 状态的单据，核心动作是进行“TMS对比价格”。根据对比结果，会产生两种处理分支：
内部调整： TMS 内部进行“运单层修改运单价格”，处理完毕后，单据状态闭环回到 Awaiting Comparison 处。
退回重提： 如果发现“有运单需 Vendor 修改金额”，单据状态会变更为 Awaiting Rebill。待供应商完成“修改后重提”的动作，单据会再次流转回 Awaiting Comparison 状态。
（注意：该状态必须通过不断修改或确认来向下推进，不允许直接执行取消操作。）
3. 确认与支付准备
   无论是处于 Under Payment Preparation 的单据，还是已经结束价格对比的 Awaiting Comparison 单据，一旦执行了“Confirm & Create RFP”的动作，单据状态就会统一流转至 Pending Payment。
   同时，在这个确认环节，还会平行触发一个关联动作——“创建HR付款申请”。
4. 流程的终态
   单据到达 Pending Payment 后，就进入了最后的结算收尾阶段，面临两种最终结局：
正常支付： 当“HR Vendor payment 已支付完毕”的指令传回后，对账单顺利流转至 Paid 状态，流程圆满结束。
异常冲销： 若在此阶段出现特殊情况无需继续支付，单据可以直接流转至 Written Off 状态，结束生命周期。

1、TMS 端AP Statement List 页，展示TMS端与VP端创建的所有 AP Statement 
![alt text](image-1.png)

2、TMS端 创建AP Statement 页，其中 Select Waybill页中的结算项 若在 Item to be settled中未选择，则对应列置灰，已被其他AP Statement 关联的结算项也做相关置灰或其他标识
![alt text](image-2.png)
在这个页面中，允许add或者remove运单，允许对运单的特定结算项进行操作：OC Check,Pricing Check。其中OC是指TMS侧系统的操作人员，Pricing是另一个定价部门。
仅所有结算项均为matched,才能confirm & Create RFP。
若结算项不均为matched,则展示提示信息，Payment Blocked: Associated Item [XX] is not matched. Please check the item Comparison results ，否则confirm & Create RFP 禁用
若满足结算项均为matched,则confirm & Create RFP 启用，点击后展示创建RFP的弹窗 ：如image-5.png （并参考image-6.png 中字段信息展示其他支付信息）

3、TMS 端 Under Payment Preparation状态的 AP statement 详情页
![alt text](image-8.png)

4、TMS 端 Awaiting Compasion 状态的 AP statement 详情页：
![alt text](image-4.png)

5、若需在运单中修改被拒结算项，参考下图image-7.png的运单
![alt text](image-7.png)

