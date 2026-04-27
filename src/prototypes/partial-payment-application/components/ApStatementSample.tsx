import React from 'react';
import { WAYBILLS } from '../data/mockData';
import { Card, formatAmount, PrepayStatusBadge } from './UI';

const SAMPLE = ['WB-TH-26041501', 'WB-TH-26041502', 'WB-TH-26041503', 'WB-PH-26041801', 'WB-PH-26041802'];

export default function ApStatementSample() {
  const list = WAYBILLS.filter(w => SAMPLE.includes(w.waybillNo));

  return (
    <>
      <div className="ppa-page-header">
        <div>
          <div className="ppa-page-title">AP Statement — Column Update</div>
          <div className="ppa-page-sub">删除 `Paid in Advance` 待结算列，新增 `Previously Paid (Prepaid)` 展示列；仅 `Effective` 参与扣减</div>
        </div>
      </div>

      <Card title="Before vs After" tip="对照 §10.1 / §10.2 — 同一批运单，新旧两种 AP Statement 形态">
        <div className="ppa-compare-grid">
          {/* BEFORE */}
          <div className="ppa-compare-card before">
            <div className="ppa-compare-header">Before · Current AP Statement</div>
            <table className="ppa-table">
              <thead>
                <tr>
                  <th>Waybill</th>
                  <th className="num">Basic</th>
                  <th className="num ppa-col-removed">Paid in Advance<br/><span style={{ fontSize: 10, fontWeight: 400 }}>(待结算项)</span></th>
                  <th className="num">Remaining</th>
                  <th>Settled?</th>
                </tr>
              </thead>
              <tbody>
                {list.map(w => (
                  <tr key={w.waybillNo}>
                    <td className="ppa-mono">{w.waybillNo}</td>
                    <td className="num">{formatAmount(w.basicAmount)}</td>
                    <td className="num ppa-col-removed">{formatAmount(w.paidInAdvance)}</td>
                    <td className="num">{formatAmount(w.basicAmount - w.paidInAdvance)}</td>
                    <td style={{ fontSize: 12, color: '#b91c1c' }}>取决于此项核销</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: 10, fontSize: 12, color: '#7f1d1d', background: '#fff5f5' }}>
              ❌ 把 Paid in Advance 当作结算项 → 与 HR 实际未确认款项重复，且运单关闭依赖该项核销，流程冗余。
            </div>
          </div>

          {/* AFTER */}
          <div className="ppa-compare-card after">
            <div className="ppa-compare-header">After · Updated AP Statement</div>
            <table className="ppa-table">
              <thead>
                <tr>
                  <th>Waybill</th>
                  <th className="num">Basic</th>
                  <th className="num ppa-col-added">Previously Paid<br/><span style={{ fontSize: 10, fontWeight: 400 }}>(展示, 仅 Effective)</span></th>
                  <th className="num">Remaining</th>
                  <th>Prepay Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map(w => {
                  const effective = w.prepayStatus === 'Effective';
                  const display = effective ? w.paidInAdvance : 0;
                  return (
                    <tr key={w.waybillNo}>
                      <td className="ppa-mono">{w.waybillNo}</td>
                      <td className="num">{formatAmount(w.basicAmount)}</td>
                      <td className="num ppa-col-added">
                        {effective ? formatAmount(display) : <span style={{ color: '#9ca3af', textDecoration: 'line-through' }}>{formatAmount(w.paidInAdvance)}</span>}
                      </td>
                      <td className="num" style={{ fontWeight: 500 }}>{formatAmount(w.basicAmount - display)}</td>
                      <td><PrepayStatusBadge status={w.prepayStatus} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: 10, fontSize: 12, color: '#065f46', background: '#f0fdf4' }}>
              ✓ Previously Paid 仅展示用，运单关闭不再依赖该项核销；非 Effective（HR 未 Released）的预付款不计入扣减，避免重复占用未确认资金。
            </div>
          </div>
        </div>
      </Card>

      <Card title="导出与列变更">
        <ul style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.7 }}>
          <li>列表 / 详情 / 导出 Excel 三处均移除 `Paid in Advance` 待结算列。</li>
          <li>新增 `Previously Paid (Prepaid)` 展示列，仅展示 <code>Status = Effective</code> 的累计金额；其他状态以删除线弱化展示。</li>
          <li>结算公式：<code>Basic Amount Payable (Remaining) = Total Basic Amount − Σ allocatedAmount(Effective)</code>。</li>
          <li>受影响的现有 PRD：S30、S34、Customer Statement.md（仅声明 AR 不受影响）。</li>
        </ul>
      </Card>
    </>
  );
}
