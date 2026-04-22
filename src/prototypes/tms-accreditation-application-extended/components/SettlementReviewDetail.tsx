import React, { useState } from 'react';

interface Props {
  apNo: string;
  onBack: () => void;
}

const WAYBILLS = [
  { no: 'WB2604001', paidAdvance: 0, basic: 15000, additional: 500, exception: 0, claim: 0, hasDiscrepancy: false },
  { no: 'WB2604002', paidAdvance: 2000, basic: 10000, additional: 0, exception: 1200, claim: 0, hasDiscrepancy: true },
  { no: 'WB2604004', paidAdvance: 0, basic: 7800, additional: 300, exception: 0, claim: 500, hasDiscrepancy: false },
  { no: 'WB2604006', paidAdvance: 0, basic: 15500, additional: 800, exception: 0, claim: 0, hasDiscrepancy: false },
];

function SettlementReviewDetail({ apNo, onBack }: Props) {
  const [decision, setDecision] = useState<'none' | 'approved' | 'rejected'>('none');
  const [rejectReason, setRejectReason] = useState('');
  const total = WAYBILLS.reduce((a, w) => a + w.paidAdvance + w.basic + w.additional + w.exception + w.claim, 0);
  const unresolvedDiscrepancies = WAYBILLS.filter(w => w.hasDiscrepancy).length;

  return (
    <>
      <div className="tms-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {apNo} · <span className="tag tag-settlement">Settlement</span>
        </span>
      </div>

      {unresolvedDiscrepancies > 0 && decision === 'none' && (
        <div className="alert alert-warn">
          <span>⚠</span>
          This vendor has <strong>{unresolvedDiscrepancies}</strong> unresolved price discrepancies on selected waybills. Consider requesting the vendor to resolve via Price Modification first.
        </div>
      )}

      {decision === 'approved' && (
        <div className="alert alert-success">
          <span>✓</span>
          Application approved. Vendor Statement <strong>PHVS26041802</strong> has been auto-generated in Pending state. Vendor will be notified.
        </div>
      )}

      {decision === 'rejected' && (
        <div className="alert alert-warn">
          Application rejected. Waybills released. Vendor has been notified with the reject reason.
        </div>
      )}

      <div className="tms-card">
        <div className="tms-card-title">
          <div className="section-title">Application Summary</div>
          <span className="tag tag-under-review">{decision === 'none' ? 'Under Review' : (decision === 'approved' ? 'Approved' : 'Rejected')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div><div className="tms-kpi-label">Application No.</div><div style={{ fontSize: 13, fontWeight: 500 }}>{apNo}</div></div>
          <div><div className="tms-kpi-label">Vendor</div><div style={{ fontSize: 13 }}>Coca-Cola Bottlers PH Inc.</div></div>
          <div><div className="tms-kpi-label">Submitted</div><div style={{ fontSize: 13 }}>2026-04-16 17:10</div></div>
          <div><div className="tms-kpi-label">Reconciliation Period</div><div style={{ fontSize: 13 }}>2026-04-01 ~ 2026-04-15</div></div>
          <div><div className="tms-kpi-label">Time Type</div><div style={{ fontSize: 13 }}>Position Time</div></div>
          <div><div className="tms-kpi-label">Items</div><div style={{ fontSize: 13 }}>Paid / Basic / Additional / Exception / Claim</div></div>
          <div><div className="tms-kpi-label">Tax Mark</div><div style={{ fontSize: 13 }}>VAT-ex (from profile)</div></div>
          <div><div className="tms-kpi-label">Total Amount</div><div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>{total.toLocaleString()}</div></div>
        </div>
      </div>

      <div className="tms-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Waybills in Application</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th className="num">Basic</th>
              <th className="num">Additional</th>
              <th className="num">Exception</th>
              <th className="num">Claim</th>
              <th className="num">Subtotal</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {WAYBILLS.map((w) => {
              const sub = w.paidAdvance + w.basic + w.additional + w.exception + w.claim;
              return (
                <tr key={w.no}>
                  <td>{w.no}</td>
                  <td className="num">{w.basic.toLocaleString()}</td>
                  <td className="num">{w.additional.toLocaleString()}</td>
                  <td className="num">{w.exception.toLocaleString()}</td>
                  <td className="num">{w.claim.toLocaleString()}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{sub.toLocaleString()}</td>
                  <td>{w.hasDiscrepancy && <span className="tag tag-modification">Unresolved Discrepancy</span>}</td>
                </tr>
              );
            })}
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <td colSpan={6} style={{ textAlign: 'right' }}>Total</td>
              <td className="num" style={{ color: '#00b96b' }}>{total.toLocaleString()}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {decision === 'none' && (
        <div className="tms-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Review Decision</div>
          <div className="approval-box">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Reject Reason (only if rejecting)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain the reason for rejection — e.g., waybill not yet complete, discrepancy not resolved, period overlap..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn-danger" disabled={rejectReason.trim().length === 0} onClick={() => setDecision('rejected')}>
                Reject
              </button>
              <button className="btn-primary" onClick={() => setDecision('approved')}>
                Approve & Auto-Generate Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SettlementReviewDetail;
