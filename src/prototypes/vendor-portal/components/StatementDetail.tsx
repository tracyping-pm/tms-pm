import React from 'react';
import type { Status } from './StatementList';

interface Props {
  no: string;
  status: Status;
  onBack: () => void;
  onConfirm: () => void;
  onReject: () => void;
}

const WAYBILLS = [
  { no: 'WB2604001', paidAdvance: 0, basic: 15000, additional: 500, exception: 0, claim: 0 },
  { no: 'WB2604002', paidAdvance: 2000, basic: 10000, additional: 0, exception: 1200, claim: 0 },
  { no: 'WB2604004', paidAdvance: 0, basic: 7800, additional: 300, exception: 0, claim: 500 },
  { no: 'WB2604006', paidAdvance: 0, basic: 15500, additional: 800, exception: 0, claim: 0 },
];

const PAYMENTS = [
  { date: '—', amount: 0, refNo: '—', note: 'Pending finance processing' },
];

function StatementDetail({ no, status, onBack, onConfirm, onReject }: Props) {
  const total = WAYBILLS.reduce((a, w) => a + w.paidAdvance + w.basic + w.additional + w.exception + w.claim, 0);

  const isAwaiting = status === 'Awaiting Confirmation';
  const isFinal = ['Paid', 'Written Off', 'Canceled'].includes(status);

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Statements</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {no} · <strong>Vendor Statement</strong>
        </span>
      </div>

      {isAwaiting && (
        <div className="alert alert-warn">
          <span>⚠</span>
          This statement is awaiting your confirmation. Confirm to move it to Pending Payable, or Reject with reason to return it for correction.
        </div>
      )}

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Statement Summary</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="tag tag-discrepancy-pending">{status}</span>
            {isAwaiting && (
              <>
                <button className="btn-danger" onClick={onReject}>Reject</button>
                <button className="btn-primary" onClick={onConfirm}>Vendor Confirm</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <div className="vp-kpi-label">Statement No.</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{no}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Source</div>
            <div style={{ fontSize: 13 }}>Vendor Request · from ApS260416002</div>
          </div>
          <div>
            <div className="vp-kpi-label">Reconciliation Period</div>
            <div style={{ fontSize: 13 }}>2026-04-01 ~ 2026-04-15</div>
          </div>
          <div>
            <div className="vp-kpi-label">Total Payable</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>{total.toLocaleString()}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Tax Mark</div>
            <div style={{ fontSize: 13 }}>VAT-ex</div>
          </div>
          <div>
            <div className="vp-kpi-label">Invoice No.</div>
            <div style={{ fontSize: 13, color: isAwaiting ? '#ff4d4f' : '#333' }}>
              {isAwaiting ? 'Required on confirm' : 'INV-2026-00157'}
            </div>
          </div>
          <div>
            <div className="vp-kpi-label">Amount Paid</div>
            <div style={{ fontSize: 13 }}>0</div>
          </div>
          <div>
            <div className="vp-kpi-label">Remaining</div>
            <div style={{ fontSize: 13, color: '#ff4d4f', fontWeight: 500 }}>{total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Waybill Breakdown</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th className="num">Paid in Advance</th>
              <th className="num">Basic</th>
              <th className="num">Additional</th>
              <th className="num">Exception</th>
              <th className="num">Claim</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {WAYBILLS.map((w) => {
              const sub = w.paidAdvance + w.basic + w.additional + w.exception + w.claim;
              return (
                <tr key={w.no}>
                  <td>{w.no}</td>
                  <td className="num">{w.paidAdvance.toLocaleString()}</td>
                  <td className="num">{w.basic.toLocaleString()}</td>
                  <td className="num">{w.additional.toLocaleString()}</td>
                  <td className="num">{w.exception.toLocaleString()}</td>
                  <td className="num">{w.claim.toLocaleString()}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{sub.toLocaleString()}</td>
                </tr>
              );
            })}
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <td colSpan={6} style={{ textAlign: 'right' }}>Total</td>
              <td className="num" style={{ color: '#00b96b' }}>{total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isAwaiting && status !== 'Pending' && (
        <div className="vp-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Payment History</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th className="num">Amount</th>
                <th>Ref No.</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p, i) => (
                <tr key={i}>
                  <td>{p.date}</td>
                  <td className="num">{p.amount.toLocaleString()}</td>
                  <td>{p.refNo}</td>
                  <td style={{ color: '#999' }}>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFinal && (
        <div className="alert alert-success">
          <span>✓</span>
          This statement is in a final state ({status}). No further action required.
        </div>
      )}
    </>
  );
}

export default StatementDetail;
