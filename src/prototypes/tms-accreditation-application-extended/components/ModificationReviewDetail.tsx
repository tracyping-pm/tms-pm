import React, { useState } from 'react';

interface Props {
  apNo: string;
  onBack: () => void;
}

interface Line {
  id: string;
  waybill: string;
  item: string;
  tmsAmount: number;
  vendorAmount: number;
  delta: number;
}

const LINES: Line[] = [
  { id: 'L1', waybill: 'WB2604002', item: 'Basic (Remaining)', tmsAmount: 9500, vendorAmount: 10000, delta: 500 },
  { id: 'L2', waybill: 'WB2604002', item: 'Vendor Exception Fee', tmsAmount: 800, vendorAmount: 1200, delta: 400 },
  { id: 'L3', waybill: 'WB2604003', item: 'Basic (Remaining)', tmsAmount: 16800, vendorAmount: 17500, delta: 700 },
];

type Decision = 'pending' | 'approved' | 'rejected';

function ModificationReviewDetail({ apNo, onBack }: Props) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({
    L1: 'pending', L2: 'pending', L3: 'pending',
  });
  const [notes, setNotes] = useState<Record<string, string>>({});

  const decide = (id: string, d: Decision) => setDecisions({ ...decisions, [id]: d });

  const pending = Object.values(decisions).filter(d => d === 'pending').length;
  const approved = Object.values(decisions).filter(d => d === 'approved').length;
  const rejected = Object.values(decisions).filter(d => d === 'rejected').length;

  const totalDelta = LINES.reduce((a, l) => a + l.delta, 0);
  const approvedDelta = LINES.filter(l => decisions[l.id] === 'approved').reduce((a, l) => a + l.delta, 0);

  const finalStatus = pending > 0 ? 'Under Review' : (rejected === 0 ? 'Approved' : (approved === 0 ? 'Rejected' : 'Partially Approved'));

  return (
    <>
      <div className="tms-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {apNo} · <span className="tag tag-modification">Price Modification</span>
        </span>
      </div>

      <div className="alert alert-info">
        <span>ⓘ</span>
        Row-by-row review. <strong>Approved</strong> lines update the waybill billing amount (Edit Billed Amount) and sync back to vendor's Price Reconciliation as "Discrepancy Resolved". <strong>Rejected</strong> lines keep the original TMS amount.
      </div>

      <div className="tms-card">
        <div className="tms-card-title">
          <div className="section-title">Application Summary</div>
          <span className={`tag ${finalStatus === 'Under Review' ? 'tag-under-review' : finalStatus === 'Approved' ? 'tag-approved' : finalStatus === 'Rejected' ? 'tag-rejected' : 'tag-partial'}`}>
            {finalStatus}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div><div className="tms-kpi-label">Vendor</div><div style={{ fontSize: 13 }}>Coca-Cola Bottlers PH Inc.</div></div>
          <div><div className="tms-kpi-label">Submitted</div><div style={{ fontSize: 13 }}>2026-04-16 14:22</div></div>
          <div><div className="tms-kpi-label">Rows</div><div style={{ fontSize: 13 }}>{LINES.length} ({approved} approved · {pending} pending · {rejected} rejected)</div></div>
          <div><div className="tms-kpi-label">Approved Delta / Total</div><div style={{ fontSize: 13 }}><span className="diff-positive">+{approvedDelta.toLocaleString()}</span> / +{totalDelta.toLocaleString()}</div></div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="tms-kpi-label">Vendor Reason</div>
          <div style={{ fontSize: 13, background: '#fafafa', padding: 10, borderRadius: 4, border: '1px solid #f0f0f0', marginTop: 4 }}>
            客户在实际卸货时要求加装一次装卸辅助，产生额外费用；另对 WB2604003 补收一段偏远里程差价。相关凭证见附件。
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="tms-kpi-label">Proof (uploaded by vendor)</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
              📎 weighbridge-ticket.pdf
            </span>
            <span style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
              📎 customer-signoff.jpg
            </span>
          </div>
        </div>
      </div>

      <div className="tms-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Line-by-Line Review</div>

        {LINES.map((l) => {
          const d = decisions[l.id];
          return (
            <div key={l.id} className={`review-row ${d}`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 200px', gap: 12, alignItems: 'center' }}>
                <div>
                  <div className="tms-kpi-label">Waybill</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{l.waybill}</div>
                </div>
                <div>
                  <div className="tms-kpi-label">Settlement Item</div>
                  <div style={{ fontSize: 13 }}>{l.item}</div>
                </div>
                <div>
                  <div className="tms-kpi-label">TMS Amount</div>
                  <div className="tms-amt" style={{ fontSize: 13 }}>{l.tmsAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="tms-kpi-label">Vendor Amount</div>
                  <div className="vendor-amt" style={{ fontSize: 13 }}>{l.vendorAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="tms-kpi-label">Delta</div>
                  <div className="diff-positive" style={{ fontSize: 13, fontWeight: 500 }}>+{l.delta.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {d === 'pending' && (
                    <>
                      <button className="btn-default" onClick={() => decide(l.id, 'rejected')}>Reject</button>
                      <button className="btn-primary" onClick={() => decide(l.id, 'approved')}>Approve</button>
                    </>
                  )}
                  {d === 'approved' && (
                    <>
                      <span className="tag tag-approved">Approved</span>
                      <button className="btn-link" onClick={() => decide(l.id, 'pending')}>Undo</button>
                    </>
                  )}
                  {d === 'rejected' && (
                    <>
                      <span className="tag tag-rejected">Rejected</span>
                      <button className="btn-link" onClick={() => decide(l.id, 'pending')}>Undo</button>
                    </>
                  )}
                </div>
              </div>

              {d !== 'pending' && (
                <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#999', width: 80 }}>Review Note</span>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder={d === 'approved' ? 'Confirmed via attached proof — will update billing.' : 'Explain why this adjustment is rejected.'}
                    value={notes[l.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [l.id]: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {pending === 0 && (
          <div className="alert alert-success" style={{ marginTop: 14 }}>
            <span>✓</span>
            All rows decided. Application status: <strong>{finalStatus}</strong>.
            {approved > 0 && ` ${approved} approved line(s) will trigger Edit Billed Amount with Discrepancy Proof attached, and log "Modified by Application ${apNo}".`}
          </div>
        )}
      </div>
    </>
  );
}

export default ModificationReviewDetail;
