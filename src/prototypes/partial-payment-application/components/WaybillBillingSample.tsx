import React from 'react';
import { WAYBILLS } from '../data/mockData';
import { Card, formatAmount, PrepayStatusBadge } from './UI';

const SAMPLE_WAYBILLS = ['WB-TH-26041501', 'WB-TH-26041503', 'WB-TH-26042001', 'WB-PH-26041801'];

export default function WaybillBillingSample() {
  const list = WAYBILLS.filter(w => SAMPLE_WAYBILLS.includes(w.waybillNo));

  return (
    <>
      <div className="ppa-page-header">
        <div>
          <div className="ppa-page-title">Waybill Billing — Field Update</div>
          <div className="ppa-page-sub">在已有 Billing 模块的 `Paid in advance` 字段旁新增 `Paid in advance Status` 子状态徽标</div>
        </div>
      </div>

      <Card title="Status Legend" tip="对应 §5.3 / §8.2">
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8, fontSize: 13 }}>
          <div><PrepayStatusBadge status="Pending Sync" /></div>
          <div>申请单 Draft 阶段，金额已分摊但未提交 HR；UI 上以虚化数字呈现，不参与结算扣减。</div>
          <div><PrepayStatusBadge status="Pending HR" /></div>
          <div>申请单 Synced，HR 仍在审批（`Pending Approval / Review / FA Approval / Release`）；<strong>不参与</strong> AP Statement 扣减。</div>
          <div><PrepayStatusBadge status="Effective" /></div>
          <div>HR `Released` 或 `Closed`；正式参与 AP Statement 扣减。</div>
          <div><PrepayStatusBadge status="Released" /></div>
          <div>金额已通过资金转移迁出至其他运单；保留审计痕迹。</div>
        </div>
      </Card>

      <Card title="Waybill Billing 节选示例" tip="简化版 Billing 视图，用于展示新字段对结算扣减的影响">
        <table className="ppa-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Status</th>
              <th className="num">Basic Amount</th>
              <th className="num">Handling Fee</th>
              <th className="num">Paid in advance</th>
              <th>Paid in advance Status</th>
              <th className="num">Settlement Eligible</th>
              <th>Linked Application</th>
            </tr>
          </thead>
          <tbody>
            {list.map(w => {
              const eligible = w.prepayStatus === 'Effective';
              const remaining = eligible ? w.basicAmount - w.paidInAdvance : w.basicAmount;
              return (
                <tr key={w.waybillNo}>
                  <td className="ppa-mono">{w.waybillNo}</td>
                  <td>{w.status}</td>
                  <td className="num">{formatAmount(w.basicAmount)}</td>
                  <td className="num">{formatAmount(w.handlingFee)}</td>
                  <td className={`num ${w.prepayStatus === 'Pending Sync' ? 'ppa-tag-strikethrough' : ''}`}>
                    {formatAmount(w.paidInAdvance)}
                  </td>
                  <td><PrepayStatusBadge status={w.prepayStatus} /></td>
                  <td className="num" style={{ color: eligible ? '#047857' : '#b45309' }}>
                    {formatAmount(remaining)}
                    {eligible && <div style={{ fontSize: 11, color: '#9ca3af' }}>after deduction</div>}
                    {!eligible && w.prepayStatus !== null && <div style={{ fontSize: 11, color: '#9ca3af' }}>full amount (held)</div>}
                  </td>
                  <td className="ppa-mono" style={{ fontSize: 12 }}>{w.applicationNo ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card title="字段约束（与 S30 §1.3 的差异）">
        <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.7 }}>
          <li><strong>来源限定</strong>：`Paid in advance` 字段不再支持手工录入，仅由 PartialPaymentApplication 写入；UI 上展示为只读。</li>
          <li><strong>限额</strong>：原 50% 限制移除，新规则 `Paid in advance + Handling fee ≤ 100% × Total Freight`，超出时阻塞保存。</li>
          <li><strong>结算扣减</strong>：仅 `Paid in advance Status = Effective` 的金额参与扣减；其他状态保持运单 Basic Amount Payable 不变。</li>
        </ul>
      </Card>
    </>
  );
}
