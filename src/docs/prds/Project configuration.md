BPM中所配置的指定类型的流程，允许在TMS中进行相关引用，其设置入口为项目详情；
16falsenonelisttrue
# 1.项目配置

## 1.1 项目中的子任务,POD 配置

已终态的项目不再配置: 即Canceled，Terminated，Completed 不再展示此按钮

入口：

### Subtask configuration

若未进行设置，不影响该project 的进行，配置后进行中的project也允许进行修改；修改后则只影响修改后的的运单中子任务生成（生成子任务时读取最新的配置）。

弹窗需回显历史设置内容
- 弹窗为项目设置子任务：
- 展示所有Process Type （为当前流程暂代类型 ）
- Process Name为单选，可选范围为该Process Type 下所有in activity的流程；
- Necessity of process ，单选，为Optional, 即在waybill中为可选项，为 required，则该子任务在waybill 中为必须项，当waybill 运输状态更新为‘delivered' 时，则系统自动为该waybill 生成 必要性为 required 的子任务
- 当流程必要性为required 时，需设置该流程的时效性：整数+单位，单位可选为 day,week,month; 默认为Day,  时效为必填项
- 若为Optional, 则该流程无需设置时效性，均为手动添加subtask时进行时效性设置
- 同Process Type， 只允许 有一个非终态子任务
- 交互说明：9/9更新
- Necessity of process :  默认为空，若该项有值不为空，其他列（Process Name /time limit ）为空， 则保存时，对应项置红并提示【Please fill in the information】
- Process Name ：默认为空，若该项有值不为空，其他列为空， 则保存时，time limit 置红并提示【Please fill in the information】，Necessity 提示【Please select the necessity】；选择是，需优先展示可选项，非可选项靠后展示；
- Time limit: ：默认为置灰，仅当Necessity = required，允许填写；  若必要性为required，填写 time limit 之后，取消 required , 则清空time limit 并置灰；Time Limt 不允许填写0
- 所有项均为空，允许关闭页面或cancel， 不允许confirm , 否则提示‘Empty data cannot be submitted, you can close pop-up directly.’
- 当被引用的原process发生状态或流程变化，不影响已生成的subtask ,但不再新生成子任务；配置处该被引用流程若状态不为active,则展示提示The current process is {流程状态} and cannot generate subtasks“   9/28更新

### POD configuration

为项目设置该项目的所必须的POD文件类型及所需形式；未配置不影响该project 的进行，即该项目无必须的POD type即可；配置后进行中的project也允许进行修改；修改后则只影响修改后的的运单中POD文件类型（生成POD模块时读取最新的配置即可）。

设置页弹窗:
- Documents for receipt : 允许单选+输入，可选值为：Delivery Receipt Number、Delivery Trip Ticket Number (DTT)、FO Number、Hauling Trip Ticket Number (HTT)、Linehaul Trip Runsheet、Proof of Van Dispatching、Sales Invoice、Shipment Number、Shipping Request Form、Transport Order Number、Trip Ticket Number ；当输入内容超过2个命中枚举值，则展示被命中项，已重复项禁用；若未命中允许输入自定义值；输入内容需查重，失焦后Toast 提示【 This type document already exists】，最大限制200字；允许新增/删除行
- Inteluck requirement : 该任务类型允许跳过，若skippable 开关为打开，则该类型POD文件为可跳过，其上传与否不影响waybill 流转；
- customer与inteluck的所需文件类型不允许重复，以避免同一个运单需多次上传同一类型文件； 两处文件类型总数不超过50个；超过50时，点击添加按钮提示 “Maximum 50 file types. ”

## 1.2 运单中的子任务生成逻辑：

### 当项目中的子任务配置为required 流程时，

在waybill confirm delivery时，进行判断：
- 若该流程状态为Active , 则系统需自动为该waybill生成一条对应的子任务
- 若有任一流程状态不为Active , 则不能confirm delivery，并message 提示“【process name】is 【process status】，Please try again later. “
自动生成subtask
### 当项目中的子任务配置为optional 流程时，

为waybill 手动添加 subtask时，进行判断：
- 被添加的流程状态为Active ，且该流程在waybill 中无同一process type 的未终态流程，则该流程被添加至waybill中
- 若被添加流程状态不为Active，则添加失败，message提示“【process name】is 【process status】，Please try again later. “
- 若被添加流程不为唯一非终态，则添加失败，message提示“Same type of process【process name】is 【subtask result】，Please try again later. “
手动添加 subtask