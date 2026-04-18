import React from 'react';

interface Props {
  apNo: string;
  onBack: () => void;
}

const WAYBILL_LINES = [
  { no: 'WB2604001', paidAdvance: 0, basic: 15000, additional: 500, exception: 0, claim: 0 },
  { no: 'WB2604002', paidAdvance: 2000, basic: 10000, additional: 0, exception: 1200, claim: 0 },
  { no: 'WB2604004', paidAdvance: 0, basic: 7800, additional: 300, exception: 0, claim: 500 },
  { no: 'WB2604006', paidAdvance: 0, basic: 15500, additional: 800, exception: 0, claim: 0 },
];

function ApplicationDetail({ apNo, onBack }: Props) {
  const total = WAYBILL_LINES.reduce((a, w) => a + w.paidAdvance + w.basic + w.additional + w.exception + w.claim, 0);

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {apNo} · <strong>Settlement Application</strong>
        </span>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Application Summary</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="tag tag-under-review">Under Review</span>
            <button className="btn-default">Withdraw</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <div className="vp-kpi-label">Application No.</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{apNo}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Submitted</div>
            <div style={{ fontSize: 13 }}>2026-04-16 17:10</div>
          </div>
          <div>
            <div className="vp-kpi-label">Reconciliation Period</div>
            <div style={{ fontSize: 13 }}>2026-04-01 ~ 2026-04-15</div>
          </div>
          <div>
            <div className="vp-kpi-label">Settlement Time Type</div>
            <div style={{ fontSize: 13 }}>Position Time</div>
          </div>
          <div>
            <div className="vp-kpi-label">Items To Be Settled</div>
            <div style={{ fontSize: 13 }}>Paid in Advance · Basic · Additional · Exception · Claim</div>
          </div>
          <div>
            <div className="vp-kpi-label">Invoice No.</div>
            <div style={{ fontSize: 13, color: '#999' }}>To be confirmed on statement</div>
          </div>
          <div>
            <div className="vp-kpi-label">Tax Mark</div>
            <div style={{ fontSize: 13 }}>VAT-ex (from vendor profile)</div>
          </div>
          <div>
            <div className="vp-kpi-label">Total Amount</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>{total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Waybill Breakdown</div>
          <span style={{ fontSize: 12, color: '#999' }}>Amounts sourced from TMS; vendor cannot edit — dispute via Price Reconciliation before settlement.</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th className="num">Paid in Advance</th>
              <th className="num">Basic (Remaining)</th>
              <th className="num">Additional</th>
              <th className="num">Exception</th>
              <th className="num">Claim</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {WAYBILL_LINES.map((w) => {
              const sub = w.paidAdvance + w.basic + w.additional + w.exception + w.claim;
              return (
                <tr key={w.no}>
                  <td>{w.no}</td>
                  <td className="num">{w.paidAdvance.toLocaleString()}</td>
                  <td className="num">{w.basic.toLocaleString()}</td>
                  <td className="num">{w.additional.toLocaleString()}</td>
                  <td className="num">{w.exception.toLocaleString()}</td>
                  <td className="num">{w.claim.toLocaleString()}</td>
                  <td className="num" style={{ fontWeight: 600, color: '#00b96b' }}>{sub.toLocaleString()}</td>
                </tr>
              );
            })}
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <td>Total</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num" style={{ color: '#00b96b' }}>{total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Review Timeline</div>
        <div style={{ fontSize: 13 }}>
          <div style={{ padding: '8px 0', borderLeft: '2px solid #00b96b', paddingLeft: 12, marginLeft: 4 }}>
            <div style={{ fontWeight: 500 }}>Submitted</div>
            <div style={{ color: '#999', fontSize: 12 }}>2026-04-16 17:10 · by vendor admin</div>
          </div>
          <div style={{ padding: '8px 0', borderLeft: '2px dashed #d9d9d9', paddingLeft: 12, marginLeft: 4, color: '#999' }}>
            <div style={{ fontWeight: 500 }}>Pending Procurement Review</div>
            <div style={{ fontSize: 12 }}>Procurement PIC will approve/reject. If approved, a Vendor Statement will be auto-generated and appear in <strong>My Statements</strong>.</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationDetail;
