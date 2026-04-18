import React from 'react';

interface Props {
  apNo: string;
  onBack: () => void;
}

interface LineRow {
  waybill: string;
  item: string;
  tmsAmount: number;
  vendorAmount: number;
  delta: number;
  decision: 'Pending' | 'Approved' | 'Rejected';
  reviewNote?: string;
}

const LINES: LineRow[] = [
  { waybill: 'WB2604002', item: 'Basic (Remaining)', tmsAmount: 9500, vendorAmount: 10000, delta: 500, decision: 'Approved', reviewNote: 'Confirmed via customer sign-off PDF.' },
  { waybill: 'WB2604002', item: 'Vendor Exception Fee', tmsAmount: 800, vendorAmount: 1200, delta: 400, decision: 'Pending' },
  { waybill: 'WB2604003', item: 'Basic (Remaining)', tmsAmount: 16800, vendorAmount: 17500, delta: 700, decision: 'Pending' },
];

function DecisionTag({ d }: { d: LineRow['decision'] }) {
  if (d === 'Approved') return <span className="tag tag-approved">Approved</span>;
  if (d === 'Rejected') return <span className="tag tag-rejected">Rejected</span>;
  return <span className="tag tag-under-review">Pending</span>;
}

function ApplicationDetail({ apNo, onBack }: Props) {
  const totalDelta = LINES.reduce((a, r) => a + r.delta, 0);
  const approved = LINES.filter(r => r.decision === 'Approved').length;
  const rejected = LINES.filter(r => r.decision === 'Rejected').length;
  const pending = LINES.filter(r => r.decision === 'Pending').length;

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {apNo} · <strong>Price Modification</strong>
        </span>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Application Summary</div>
          <span className="tag tag-under-review">Under Review</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <div className="vp-kpi-label">Application No.</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{apNo}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Submitted</div>
            <div style={{ fontSize: 13 }}>2026-04-16 14:22</div>
          </div>
          <div>
            <div className="vp-kpi-label">Rows</div>
            <div style={{ fontSize: 13 }}>{LINES.length} ({approved} approved · {pending} pending · {rejected} rejected)</div>
          </div>
          <div>
            <div className="vp-kpi-label">Total Delta</div>
            <div style={{ fontSize: 13, color: '#389e0d', fontWeight: 500 }}>+{totalDelta.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="vp-kpi-label">Reason</div>
          <div style={{ fontSize: 13, marginTop: 4, background: '#fafafa', padding: 10, borderRadius: 4, border: '1px solid #f0f0f0' }}>
            客户在实际卸货时要求加装一次装卸辅助，产生额外费用；另对 WB2604003 补收一段偏远里程差价。相关凭证见附件。
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="vp-kpi-label">Proof</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
              📎 weighbridge-ticket.pdf
            </span>
            <span style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
              📎 customer-signoff.jpg
            </span>
          </div>
        </div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Line-by-Line Review</div>
          <span style={{ fontSize: 12, color: '#999' }}>Procurement reviews each row independently.</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Settlement Item</th>
              <th className="num">TMS Amount</th>
              <th className="num">Your Amount</th>
              <th className="num">Delta</th>
              <th>Decision</th>
              <th>Review Note</th>
            </tr>
          </thead>
          <tbody>
            {LINES.map((r, i) => (
              <tr key={i}>
                <td>{r.waybill}</td>
                <td>{r.item}</td>
                <td className="num tms-amt">{r.tmsAmount.toLocaleString()}</td>
                <td className="num vendor-amt">{r.vendorAmount.toLocaleString()}</td>
                <td className="num diff-positive">+{r.delta.toLocaleString()}</td>
                <td><DecisionTag d={r.decision} /></td>
                <td style={{ fontSize: 12, color: '#666' }}>{r.reviewNote || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="alert alert-info" style={{ marginTop: 12 }}>
          Approved rows will update the TMS waybill billing amount and sync back to your Price Reconciliation view, marked as <strong>Discrepancy Resolved</strong>. Rejected rows keep the original TMS amount.
        </div>
      </div>
    </>
  );
}

export default ApplicationDetail;
