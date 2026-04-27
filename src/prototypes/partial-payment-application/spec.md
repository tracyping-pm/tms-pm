# Partial Payment Application 原型规格

> 实现 `src/docs/prds/S37 Partial Payment Application 详细设计.md` 中描述的 5 条核心用户故事 + Waybill Billing / AP Statement 衍生改动。仅做前端原型演示，无真实 API 调用。

## 范围

| 视图 | 入口 | 对应详细设计章节 |
|------|------|------------------|
| Applications List | Sidebar `Partial Payment Application` | §3 US-01 ~ US-03 入口 |
| Create Application | List 页 `+ Create Application` 按钮 | §3 US-01 / US-02，§5.1 / §6 |
| Application Detail | List 行的 `View` 链接 | §3 US-03，§7.3 状态镜像，§8 状态机 |
| Transfer Prepayment Dialog | Detail 页 `Cancel Waybill →` 链接 | §3 US-04，§9 |
| Waybill Billing 字段示例 | Sidebar `Waybill Billing` | §5.3 字段调整 |
| AP Statement 列变更示例 | Sidebar `AP Statement` | §10 解耦 |

## 信息架构

```
Shell (Sidebar + Topbar)
├── Applications              ←  ApplicationList
├── Application Create        ←  3-step form
├── Application Detail        ←  含 HR 同步状态卡 + 时间线 + 运单分摊明细
├── Waybill Billing 示例
└── AP Statement 示例
```

## 关键交互

### Create Application（三步）

1. **Vendor & Entity**：选 Vendor 自动联动 Country / Default Entity / Currency；Country 当前限定 PH/TH/Group，与 HR `CountryEnum` 一致。
2. **Pick Waybills**：仅展示 `Planning / Pending / In Transit` 且未被其他活跃申请单占用的运单；多 Currency 校验。
3. **Amount, Tax & Proof**：
   - 切换 `TotalAmount / Percentage`
   - 税率默认带入 `TAX_OPTIONS_BY_ENTITY` 的最高值（保守预扣），允许用户从候选项内修改
   - Allocation Preview 实时计算每张运单的 `allocatedAmount`

### HR 状态镜像（Detail 页 HR Sync 卡）

- 当前 `hrPaymentStatus ∈ {Pending Approval, Pending Review, Pending FA Approval, Pending Release}` → 申请单 Synced，运单 Pending HR，**不参与扣减**。
- `Released / Closed` → 申请单 Paid，运单 Effective，**参与扣减**。
- `Withdrawn / Released Error / Rejected` → 申请单 Rejected，释放运单关联。

### Transfer Prepayment Dialog（资金转移）

- 触发：详情页运单行的 `Cancel Waybill →`。
- 校验：候选运单池过滤（同 Vendor / 同 Currency / 状态合法 / 未被占用）；`Σ new basicAmount ≥ cancelled allocatedAmount`；Reason 必填。
- 重分配：按新运单 `basicAmount` 比例分摊原预付金额，舍入余数落在金额最大的运单。

## 数据来源

- 无后端 / API 调用，所有数据均来自 `data/mockData.ts`。
- 枚举与税率严格镜像 HR：
  - `PaymentStatusShowEnum` → `HrPaymentStatus`
  - `CountryEnum` → `CountryCode`
  - `PaymentsCompanyEnum` → `CompanyEntity`
  - 税率矩阵 → `TAX_OPTIONS_BY_ENTITY`

## 文件结构

```
partial-payment-application/
├── index.tsx                                  入口与视图路由
├── spec.md                                    本文件
├── style.css                                  样式（含 tailwindcss）
├── data/
│   └── mockData.ts                            Vendors / Waybills / Applications + HR 枚举镜像
└── components/
    ├── Shell.tsx                              侧栏 + 顶栏
    ├── UI.tsx                                 公用 UI（Badge / Stat / Field / formatter）
    ├── ApplicationList.tsx
    ├── ApplicationCreate.tsx
    ├── ApplicationDetail.tsx
    ├── TransferPrepaymentDialog.tsx
    ├── WaybillBillingSample.tsx
    └── ApStatementSample.tsx
```

## 验收要点

- [ ] Sidebar 五个菜单项可正常切换。
- [ ] 列表页筛选 Status / Country / Search 可联动。
- [ ] Create 表单第三步显示 Allocation Preview，金额随输入变化。
- [ ] 详情页 HR Approval Timeline 根据 `hrPaymentStatus` 渲染合理节点。
- [ ] Transfer Dialog 在金额不足或未填 Reason 时禁用确认按钮。
- [ ] AP Statement 示例并排显示 Before / After 两张表格，明显标注列变更。
- [ ] Waybill Billing 示例包含四种 Prepay Status 的徽标与对应结算行为。
