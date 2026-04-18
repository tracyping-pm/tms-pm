16falsenonelisttrue
Vendor Statement 供应商对账单与Vendor Statement 相对； 是用以展示与供应商间的款项明细，基本逻辑与Vendor Statement 一致，有细节不一致的地方，将在以下说明

# 1.  Vendor Statement 状态流转

状态说明：
- **Pending**（未确认）
- 生成供应商对账单未确认，允许取消,修改 确认后进入Awaiting  Confirmation状态，初始状态。
- **Awaiting Confirmation**（等待供应商确认）
- 进入此状态后，对账单等待供应商的确认。允许reject 回上一状态, 允许取消
- Pending Payable（待付款）
- 供应商已确认，待付款；允许取消
- Partially Paid（部分付款）
- 如果支付尚未完成，维持“Partially Paid”状态。不再允许取消，可Written Off ，允许继续录入付款记录
- Paid（已支付）
- 当所有款项支付完成，流转至"Paid"状态。不允许超付
- Canceled（取消）
- 该状态需 取消运单与结算单的关联关系
- Written Off（冲销）
- 无论账单是完全未支付还是部分支付，若被确认冲销，账单进入“Written Off”状态。

# 2.  Statement List

### 2.1 搜索区域

与当前Customer Statement 一致

| Field Name | 类型 | 搜索逻辑 |
| Vendor Name | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果。 |
| Statement Status | 下拉选择 | 默认选择“所有状态”，支持多选。 |
| Creation Time | 时间选择器 | 允许用户选择对账单创建日期的时间范围。 |
| Statement Number | 输入框 | 模糊匹配，输入2个及以上字符时展示匹配结果。 |
| Invoice Number | 输入框 | like 搜索，输入2个及以上字符时进行匹配，并刷新列表结果,与其他筛选条件取交集（待与开发确认） |

### 2.2 列表区域

列表展示了符合搜索条件的所有供应商对账单。每个对账单的每一行包含以下字段：

| Field Name | 描述 |
| Statement Number | 供应商对账单的唯一标识符。生成逻辑：PH/TH（国别简称）+VS+yy-mm-dd+2位流水号（该国自增） |
| Vendor Name | 供应商名称（例如：Coca-Cola Bottlers Philippines Inc.）。 |
| Invoice Number | 与该对账单关联的发票编号。有可能一个对账单多张发票，在列表中换行展示 |
| Status | 对账单的当前状态 |
| Total Amount Payable | 需要支付给供应商的总应付金额 |
| Amount Paid | 已支付的金额 |
| Remaining Amount Unpaid | 剩余的未支付金额，Total Amount Payable-Amount Paid，超付，则展示实际超付金额（负数） |
| Reconciliation Period | 对账单的统计周期。 |
| Creation Time |  |
| Operate | “Details”按钮，用户点击后可以查看详情。 |

- 用户可以通过点击列表视图右上角的”Add Statement”按钮去创建新的供应商对账单。

### 2.3 排序
- 列表默认按 1. Status 状态进行排列，顺序为：pending, Awaiting Confirmation，Pending Payable, Partially Paid, Written Off, Paid, Canceled     2. 更新时间进行降序排列，即更晚更新的排更前。
- 允许用户可以点击“Remaining Amount Unpaid”列的标题在本页来按升序或降序排列。
- 分页参考当前waybill list分页样式

# 3. Add Statement

该功能用以为供应商生成对账单。可以筛选运单，选择需要包含在对账单中的运单，最终生成该供应商的对账单。生成过程包括基本设定（供应商信息、统计区间、项目选择）和基于运单细节的运单筛选。

基于运单生成对账单

不基于运单生成对账单

同客户对账单，供应商对账单依然允许基于运单或 单独出账与对应供应商进行对账（如上图），以下仅展示需基于运单产生运单的情况

---

#### 3.1 基本设定
- **Vendor Name (供应商名称)**: 选择需要生成对账单的供应商（单选），输入两个字母后开始模糊匹配并展示匹配内容。
- **结算周期（Reconciliation Period）：**许用户通过选择起止时间来定义对账单的结算周期。 到时间点（YYMMDD HHMMSS）
- **Items To Be Settled (结算项)：**多选，包含项目为：Paid in advance， Regular Payments，Vendor Exception Fee，Vendor Additional Charge，Vendor Claim ；所展示运单需过滤掉该结算项已关联供应商对账单的运单，默认不选中
- **Settlement Time Type （结算周期时间类型）：**用户选择结算周期的运单筛选类型，可选项为 (Position Time,Delivery Time,Unloading Time), 默认为空
- **Vendor Tax Mark (供应商税务标记)**: 展示项，用于展示该供应商税务标志，当供应商税务标记发生变更，历史已生成的对账单该标志展示原状态
- **Is the settlement tax-inclusive（对账单是否含税）：**单选，选择是否含税，会影响后续对账单出账计算
- **Billed Project (结算项目)**: 展示该客户所有In Progress，Suspended，Terminated，Completed,Canceled 状态项目，允许多选；按项目状态顺序展示： in progress, suspended，Completed,Terminated,Canceled, 若状态一致，按项目名字母排序，允许多选

#### 3.2 选择运单

参考Customer Statement 进行运单选择****

筛选后的运单列表展示在表格中，字段如下(备注：导出对账单是运单部分的字段将有所删减）：

| Column Name (列名) | Description (描述) |
| Waybill Number | (运单编号) |
| Customer code | 展示该运单所有客户编码，Type+code, 换行展 |
| Position Time |  |
| Unloading Time | shipping record中最后一次Unloading Time |
| Delivery Time |  |
| Total Amount Payable |  |
| Paid In advence |  |
| Basic Amount Payable (Remaining) |  |
| Additional Amount Payable |  |
| Vendor Exception Fee |  |
| Vendor Claim |  |
| Settlement Amount（Tax-in） |  |
| Settlement Amount（Tax-ex） |  |
| Billing Truck Type | 运单中结算的车辆类型  1108 update |
| Plate Number | 卡车的车牌号码。 |
| Origin | 三级地址+详细地址拼接 |
| Destination (目的地位置) | 三级地址+详细地址拼接 |
| Number of Drops |  |
| Remarks | 如有多条换行展示，需UI设定宽度，无法展示完全部分“…”代替，hover时浮窗展示 |
| Details | 点击跳转至该运单详情页 |

z3.3 生成对账单
- **Generate ：**选择运单后，点击该按钮生成对账单。
- **对账单编号生成逻辑**: 对账单编号自动生成，格式为 “PH/TH +VS+ YYMMDD + 2位流水号（该国当日自增）"。
- **Previous ：**允许跳转至上一步，不进行二次确认，不保留当前页面所选择内容。
- 创建成功后，跳转至对账单详情页面，展示生成的对账单内容。

# 4. Statement Detail

## 4.1 Pending（基于对账单）

- 供应商对账单详情页，与客户对账单详情页基本一致，参考CS与上图，其他逻辑一致，不赘述；注意CS中的客户相关需替换为供应商相关
- 显示对账单基本信息+费用信息及进行结算的运单信息

各状态对账单操作如下：

| 状态 | Operation Log | Payment History | Cancel | Reject | Confirm | Vendor Confirm | Write Off | Edit Waybill | Edit Amount | Edit Charge | Settlement Items | Edit Invoice | Enter Payment | Confirm Paid | Add Proof | Export Statement |
| 按钮模块 | 顶部 | 顶部 | 顶部 | 顶部 | 顶部 | 顶部 | 顶部 | Waybill  info. | Waybill  info. | Billing info. | Basic info. | 顶部 | 顶部 | 顶部 | Proof | 顶部 |
| 按钮权限说明 | 跟随页面权限 | 跟随页面权限 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 | 需单独设置 |
| Pending | ✔ |  | ✔ |  | ✔ |  |  | ✔ | ✔ | ✔ | ✔ | ✔ |  |  | ✔ |  |
| Awaiting Confirmation | ✔ |  | ✔ | ✔ |  | ✔ |  |  |  |  |  |  |  |  | ✔ | ✔ |
| Pending Payable | ✔ | ✔ | ✔ |  |  |  | ✔ |  |  |  |  | ✔ | ✔ | ✔ | ✔ | ✔ |
| Partially Paid | ✔ | ✔ |  |  |  |  | ✔ |  |  |  |  | ✔ | ✔ | ✔ | ✔ | ✔ |
| Written Off | ✔ | ✔ |  |  |  |  |  |  |  |  |  |  |  |  |  | ✔ |
| Paid | ✔ | ✔ |  |  |  |  |  |  |  |  |  |  |  |  |  | ✔ |
| Canceled | ✔ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Pending（不基于对账单）

仅作展示，操作逻辑一致，不展示相关字段

## 2. 详情页说明
- 参考CS对账单详情页，显示对账单基本信息+费用信息及进行结算的运单及流程信息；以基于对账单为例，不基于对账单参考上图[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/719126529#Pending%EF%BC%88%E4%B8%8D%E5%9F%BA%E4%BA%8E%E5%AF%B9%E8%B4%A6%E5%8D%95%EF%BC%89](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/719126529#Pending%EF%BC%88%E4%B8%8D%E5%9F%BA%E4%BA%8E%E5%AF%B9%E8%B4%A6%E5%8D%95%EF%BC%89) 即可

### **2.1 基本信息**

### 2.2 费用信息

参考CS端，不同之处仅在于结算项将基础费用拆为两个结算项：Paid In advence, Basic Amount Payable (Remaining)
- 其中各结算项总和为对应运单加总
- **Total Amount Payable（应付费用总额）：**Total Amount Receivable =Waybill Settlement Amount +Miscellaneous Charge Total Amount【即整个对账单应付金额= 运单产生的应付金额+ 非运单部分产生的应付金额】
- **Waybill Settlement Amount（运单结算项总额）:**
- 若 Is the settlement tax-inclusive = yes , 展示**Waybill Settlement Amount（Tax-in)**，计算所有运单结算项含税总额
- 若 Is the settlement tax-inclusive = No , 展示**Waybill Settlement Amount（Tax-ex)**，计算所有运单结算项不含税总额
- 由于允许Edit Amount （Settlement Amount（Tax-in）及Settlement Amount（Tax-ex）），故可能**Waybill Settlement Amount** 与各结算项之和无法对齐
- 此处不再展示是否含税即是否基于运单的详情页面，与CS一致[https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/701333516#%E5%85%B6%E4%BB%96%E8%B4%B9%E7%94%A8%E4%BF%A1%E6%81%AF](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/701333516#%E5%85%B6%E4%BB%96%E8%B4%B9%E7%94%A8%E4%BF%A1%E6%81%AF)

### 2.3 其他费用流程（Del)

### 2.4 运单信息

运单展示逻辑，关联逻辑与CS一致，仅truck type及结算项名称不同

同样允许pending 状态编辑运单的结算项价格与 重新关联运单

### 2.5 证据信息

非必填，交互参考wanybill detail中的 add POD ；总数不限制

其他附件上传限制参考当前已有组件即可

### 2.6 操作项

#### Export Statement:

运单部分无customer code, remark，No. of drops等信息，Settlement Amount根据对账单是否含税，展示tax-in /tax-ex

#### Edit Settlement Items：

参考CS，可选项更新为Vendor 侧结算项

#### Edit Invoice，Edit Waybill，Edit Amount, Edit Miscellaneous Charge，Edit Tax，Cancel ，Reject，Confirm，Add Proof：

与CS一致

#### Enter Payment，Payment History： :

参考Enter Receipt ，将Receipt 更新为Payment

#### Vendor Confirm:

参考Customer Confirm 的二次确认弹窗，修改文案为：Please confrm if the vendor has verifed the statement amount.

#### Write Off：

参考CS，修改文案为: “Write off the statement, no further payment will be made on the remaining amount, and all items within the statement will be marked as settled.”

#### Confirm Paid:

参考CS，与Confirm Received 基本一致，

确认对账单已完成费用收齐，点击需做如下判断

当多次Payment Amount =0, 对账单不更新状态，保持【Pending Payable】，confirm 时提示【No payment records,  unable to confirm paid.".】

当多次Receipt Amount 总额 < 对账单Total Amount  Payable , 则对账单更新为 【Partially Paid】，confirm 时提示【The accounts payable has not been paid in full and the statement has been updated to "Partially Paid".】后刷新状态

当多次Receipt Amount 总额 >= 对账单Total Amount  Payable,则对账单更新为 【Paid】，confirm 时提示【The full  payable have been paid, and the statement has been updated to "Paid".】后刷新状态

当多次Receipt Amount 总额 > 对账单Total Amount  Payable ，confirm 时提示【The amount paid exceeds the amount payable, please bill the overpaid amount separately】后，且不更新状态

Opreation Log:

参考CS端