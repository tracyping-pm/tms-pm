# AR Statement 规格文档

## 概述

Inteluck TMS（Transportation Management System）的 AR Statement（应收对账单）管理模块原型。基于 10 张 Axure 截图 1:1 视觉还原。

**预览地址**：`http://localhost:51720/prototypes/ar-statement/`

---

## 页面结构

```
index.tsx（视图状态机）
  ├── AppShell（全局布局：左侧导航 + 顶部 Header）
  ├── StatementList（列表页）
  ├── CreateStatement（新建页）
  ├── StatementDetailAuto（详情页 - 自动分配模式）
  ├── StatementDetailManual（详情页 - 手动分配模式）
  ├── AddInvoiceDialog（弹窗）
  ├── EditInvoiceDialog（弹窗）
  └── ExportPreviewDialog（弹窗）
```

---

## 视图导航

| 视图 state | 组件 | 触发方式 |
|-----------|------|---------|
| `list` | StatementList | 默认视图 / 点击左侧菜单 |
| `create` | CreateStatement | List 页点击 "Add Statement" |
| `detail-auto` | StatementDetailAuto | Create 页选择 Automatic + Generate |
| `detail-manual` | StatementDetailManual | Create 页选择 Manual + Generate |

---

## 业务流程

### Invoice 路径 A（创建时无发票）
```
Create 页 → Generate → Detail 页 → Add Invoice（弹窗）→ 发票自动/手动分配
```

### Invoice 路径 B（创建时已有发票）
```
Create 页 → Add Invoice（弹窗）→ Generate → Detail 页（已分配完成）
```

---

## 组件清单

### AppShell
- **布局**：左侧固定导航（200px）+ 顶部 Header（48px）+ 内容区
- **导航菜单**：AR&AP Mgmt → AR Statement（激活）/ AP Statement
- **Header**：页面标题 + 下拉箭头、下载/通知/头像/用户名图标

### StatementList
- **筛选器**：7 个下拉（第一行）+ 2 个下拉 + 操作符 + Invoice Aging 输入（第二行）
- **按钮**：Reset、Search、Export List（触发 ExportPreviewDialog）、Add Statement
- **表格列**：展开 | Statement Number | Billing Customer | Project Name | Settlement Item | Statement Receivable Amount | Statement Collected Amount | Statement Status | Reconciliation Period | Creator | Creation Time | Operation
- **展开行**：子发票表格（Client Entity / Invoice Number / Invoice Amount / Collected Amount / Invoice Status / Invoice Date / Customer Credit Term / Invoice Aging）
- **分页**：Next / < / 1~4 / ... / > / Last

### CreateStatement
- **面包屑**：Customer Statement \ Create AR Statement
- **Basic Setting**：Is based on waybill、Customer Name、Reconciliation Period、Items To Be Settled（5 个复选）、Customer Tax Mark、Tax-inclusive、分配模式（Automatic/Manual）
- **Tab**：Select Waybill（含筛选 + 带 checkbox 的 waybill 表格，支持多选）/ Select Claim Ticket（含筛选 + Associate 按钮 + 表格）
- **Waybill 选择逻辑**：Waybill 来自其他模块创建的运单，绑定当前用户；支持全选/反选，动态显示统计
- **Invoice 区块**：Add Invoice 链接 + 发票表格
- **操作**：Reset、Generate（至少选择 1 条 Waybill 才可点击，根据 allocationMode 决定跳转目标）

### StatementDetailAuto
- **顶部**：← Back、状态标签、Operation Log / Export / Cancel / Go
- **Status Change Record**：5 节点横向时间轴
- **Basic Information**：可折叠区块
- **Billing Information**：总金额 + 税含选项 + 左右两列明细
- **Waybills**：筛选 + 11 列表格 + 分页
- **Invoice Management**：绿色徽章"Automatic Allocation Mode" + Add Invoice + 10 列表格
- **Proof**：Message Records 区域
- **Collection**：金额卡片列表

### StatementDetailManual
- 结构同 StatementDetailAuto，以下为差异：
- **Invoice Management**：蓝色徽章"Manual Allocation Mode"
- **每张发票卡片**：Settlement Item Allocation 表格（10 列）+ Ticket Allocation 表格（6 列）+ 汇总行
- **Settlement Item Allocation 列**：Waybill Number | Settlement Item | Amount (Allocatable Amount) | Current Allocation（**可编辑 input**）| Remaining Amount | VAT (12%) | WHT (2%) | Billed Amount (VAT-ex) | Billed Amount (VAT+) | Operation
- **字段计算逻辑**：Current Allocation 为用户输入，Remaining = Amount - Current，VAT = Current × 12%，WHT = Current × 2%，Billed(VAT-ex) = Current，Billed(VAT+) = Current + VAT
- **操作**：Edit Invoice 链接（触发 EditInvoiceDialog）

### AddInvoiceDialog
- **字段**（每行）：Client Entity（dropdown）/ Invoice Number / Invoice Date / Invoice Amount / Invoice Proof（上传 + AI OCR 徽章）/ 删除(-) 按钮
- **动态行**：+ 绿色按钮添加行，- 红色按钮删除行
- **Footer**：Cancel / Confirm

### EditInvoiceDialog（手动模式）
- **顶部发票信息**：*Client Entity / *Invoice Number / *Invoice Date / *Invoice Amount / *Invoice Proof（AI OCR）
- **Associated Waybill**：搜索 + 提示文字 + 表格（Waybill Number + 5 个 Available/Total 列）
- **Associated Ticket**：搜索 + 提示文字 + 表格（Ticket Type / Ticket Number / Claim Type / Amount / Ticket Status）
- **Footer**：Cancel / Confirm

### ExportPreviewDialog（Excel 样式报表）
- **报表头**：Statement No. / Creation Time / Client Entity / Reconciliation Period / Total Amount Receivable / Invoice Number and Date / Receipt Voucher / Tax-inclusive
- **Waybills 区块**：17 列表格（No. / Waybill Number / Customer Code / ... / Billed Amount(VAT+) / Origin）+ 合计行 + 粉色注释
- **Billing Info 区块**：Waybill Contract Revenue / Others / Claim Amount / 各 Claim 明细

---

## 样式规范

| 属性 | 值 |
|------|---|
| 左侧导航背景 | `#fff`（白色）+ 右边框 |
| 激活菜单项 | 绿色文字 `#00b96b` + 浅绿背景 + 左绿边框 |
| 主操作按钮 | `#00b96b` 背景 + 白色文字 |
| 链接色 | `#1890ff` |
| Automatic 徽章 | `#52c41a`（绿色） |
| Manual 徽章 | `#1890ff`（蓝色） |
| AI OCR 徽章 | `#1890ff`（蓝色） |
| 表头背景 | `#f5f5f5` |
| 区块标题左竖线 | `4px solid #333` |
| 正文字号 | `14px` |
| 表格字号 | `13px` |

---

## 截图参考来源

| 文件 | 用途 |
|------|------|
| `1_AR_statement_home.png` | StatementList |
| `2_Add_AR_STATEMENT.png` | CreateStatement |
| `SELECT_CLAIM_TICKET.png` | CreateStatement - Claim Ticket Tab |
| `ADD_INVOICE.png` | AddInvoiceDialog（Create 页） |
| `AutomaticAllocationMode_AddInvocie.png` | AddInvoiceDialog（Detail Auto 页） |
| `AutomaticAllocationMode.png` | StatementDetailAuto |
| `ManualAllocationMode.png` | StatementDetailManual |
| `manualallocationmodeeditinvoice.png` | EditInvoiceDialog（主参考） |
| `MannualAllocationMode_EditInvoice.png` | EditInvoiceDialog（辅助参考） |
| `exportdata.png` | ExportPreviewDialog |
