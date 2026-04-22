import React, { useState } from 'react';

interface Props {
  apNo: string;
  onBack: () => void;
}

type AppStatus = 'Draft' | 'Under Review' | 'Approved' | 'Rejected';

interface LineRow {
  waybill: string;
  item: string;
  tmsAmount: number;
  vendorAmount: number;
  delta: number;
}

interface HistoryEvent {
  date: string;
  actor: string;
  role: string;
  action: string;
  actionType: 'submit' | 'approve' | 'reject' | 'draft' | 'resubmit';
  note?: string;
}

const STATUS_MAP: Record<string, AppStatus> = {
  'ApM260416001': 'Under Review',
  'ApM260415003': 'Approved',
  'ApM260412011': 'Rejected',
  'ApM260410007': 'Rejected',
  'ApM260409002': 'Draft',
};

const HISTORY_MAP: Record<string, HistoryEvent[]> = {
  'ApM260416001': [
    { date: '2026-04-16 14:22', actor: 'Vendor A', role: 'Vendor', action: 'Submitted', actionType: 'submit', note: 'Initial submission with 3 disputed items across WB2604002 and WB2604003.' },
  ],
  'ApM260415003': [
    { date: '2026-04-15 10:05', actor: 'Vendor A', role: 'Vendor', action: 'Submitted', actionType: 'submit', note: 'Price discrepancy reported for WB2603027 basic fee.' },
    { date: '2026-04-16 09:30', actor: 'David Lim', role: 'Procurement', action: 'Approved', actionType: 'approve', note: 'All supporting documents verified. TMS amounts updated accordingly.' },
  ],
  'ApM260412011': [
    { date: '2026-04-12 16:40', actor: 'Vendor A', role: 'Vendor', action: 'Submitted', actionType: 'submit', note: 'Disputed 4 items across WB2603015 and WB2603016 with attached documents.' },
    { date: '2026-04-14 11:15', actor: 'Sarah Chen', role: 'Procurement', action: 'Rejected', actionType: 'reject', note: 'Insufficient supporting documents. Weighbridge ticket missing for WB2603016. Please resubmit with proper evidence.' },
  ],
  'ApM260410007': [
    { date: '2026-04-09 20:30', actor: 'Vendor A', role: 'Vendor', action: 'Submitted', actionType: 'submit', note: 'Single item discrepancy for WB2603009 exception fee.' },
    { date: '2026-04-10 09:11', actor: 'David Lim', role: 'Procurement', action: 'Rejected', actionType: 'reject', note: 'The requested amount does not align with the contracted rate card for this route. Vendor should refer to Annex B of the service agreement.' },
  ],
  'ApM260409002': [
    { date: '2026-04-09 20:30', actor: 'Vendor A', role: 'Vendor', action: 'Saved as Draft', actionType: 'draft', note: 'Draft saved. Not yet submitted for review.' },
  ],
};

const LINES_MAP: Record<string, LineRow[]> = {
  'ApM260416001': [
    { waybill: 'WB2604002', item: 'Basic (Remaining)', tmsAmount: 9500, vendorAmount: 10000, delta: 500 },
    { waybill: 'WB2604002', item: 'Vendor Exception Fee', tmsAmount: 800, vendorAmount: 1200, delta: 400 },
    { waybill: 'WB2604003', item: 'Basic (Remaining)', tmsAmount: 16800, vendorAmount: 17500, delta: 700 },
  ],
  'ApM260415003': [
    { waybill: 'WB2603027', item: 'Basic (Remaining)', tmsAmount: 12000, vendorAmount: 13200, delta: 1200 },
  ],
  'ApM260412011': [
    { waybill: 'WB2603015', item: 'Basic (Remaining)', tmsAmount: 11000, vendorAmount: 12500, delta: 1500 },
    { waybill: 'WB2603015', item: 'Additional Charge', tmsAmount: 400, vendorAmount: 900, delta: 500 },
    { waybill: 'WB2603016', item: 'Basic (Remaining)', tmsAmount: 9800, vendorAmount: 10700, delta: 900 },
    { waybill: 'WB2603016', item: 'Exception Fee', tmsAmount: 0, vendorAmount: 500, delta: 500 },
  ],
  'ApM260410007': [
    { waybill: 'WB2603009', item: 'Exception Fee', tmsAmount: 200, vendorAmount: 700, delta: 500 },
  ],
  'ApM260409002': [
    { waybill: 'WB2603005', item: 'Basic (Remaining)', tmsAmount: 8500, vendorAmount: 9000, delta: 500 },
    { waybill: 'WB2603005', item: 'Additional Charge', tmsAmount: 0, vendorAmount: 300, delta: 300 },
  ],
};

const ACTION_COLOR: Record<HistoryEvent['actionType'], string> = {
  submit: '#1890ff',
  resubmit: '#1890ff',
  approve: '#52c41a',
  reject: '#ff4d4f',
  draft: '#8c8c8c',
};

const ACTION_ICON: Record<HistoryEvent['actionType'], string> = {
  submit: '↑',
  resubmit: '↻',
  approve: '✓',
  reject: '✕',
  draft: '✎',
};

const STATUS_TAG_CLASS: Record<AppStatus, string> = {
  'Draft': 'tag-draft',
  'Under Review': 'tag-under-review',
  'Approved': 'tag-approved',
  'Rejected': 'tag-rejected',
};

const EMPTY_LINE: LineRow = { waybill: '', item: '', tmsAmount: 0, vendorAmount: 0, delta: 0 };

function ApplicationDetail({ apNo, onBack }: Props) {
  const currentStatus = STATUS_MAP[apNo] || 'Under Review';
  const history = HISTORY_MAP[apNo] || [];
  const initialLines = LINES_MAP[apNo] || [];

  const [lines, setLines] = useState<LineRow[]>(initialLines);
  const [addingNew, setAddingNew] = useState(false);
  const [newLine, setNewLine] = useState<LineRow>({ ...EMPTY_LINE });

  const totalDelta = lines.reduce((a, r) => a + r.delta, 0);

  const handleDeleteLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddLine = () => {
    const row: LineRow = {
      ...newLine,
      delta: newLine.vendorAmount - newLine.tmsAmount,
    };
    setLines(prev => [...prev, row]);
    setNewLine({ ...EMPTY_LINE });
    setAddingNew(false);
  };

  const canEdit = currentStatus === 'Draft' || currentStatus === 'Rejected';

  const summaryDateMap: Record<string, string> = {
    'ApM260416001': '2026-04-16 14:22',
    'ApM260415003': '2026-04-15 10:05',
    'ApM260412011': '2026-04-12 16:40',
    'ApM260410007': '2026-04-10 09:11',
    'ApM260409002': '2026-04-09 20:30',
  };

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
          <span className={`tag ${STATUS_TAG_CLASS[currentStatus]}`}>{currentStatus}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <div className="vp-kpi-label">Application No.</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{apNo}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Submitted</div>
            <div style={{ fontSize: 13 }}>{summaryDateMap[apNo] || '-'}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Rows</div>
            <div style={{ fontSize: 13 }}>{lines.length}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Total Discrepancy</div>
            <div style={{ fontSize: 13, color: '#389e0d', fontWeight: 500 }}>+{totalDelta.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="vp-kpi-label">Reason</div>
          <div style={{ fontSize: 13, marginTop: 4, background: '#fafafa', padding: 10, borderRadius: 4, border: '1px solid #f0f0f0' }}>
            Customer required an additional loading/unloading assistance at actual unloading, incurring extra fees; plus a remote mileage difference for related waybills. See attachment for supporting documents.
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

      {/* Process History */}
      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Process History</div>
          <span style={{ fontSize: 12, color: '#999' }}>Full lifecycle of this modification request</span>
        </div>

        <div style={{ padding: '8px 0' }}>
          {history.map((evt, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: idx < history.length - 1 ? 24 : 8 }}>
              {/* Vertical line */}
              {idx < history.length - 1 && (
                <div style={{
                  position: 'absolute', left: 19, top: 36, bottom: 0,
                  width: 2, background: '#f0f0f0',
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: ACTION_COLOR[evt.actionType] + '18',
                border: `2px solid ${ACTION_COLOR[evt.actionType]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: ACTION_COLOR[evt.actionType], fontWeight: 700,
              }}>
                {ACTION_ICON[evt.actionType]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: ACTION_COLOR[evt.actionType] }}>{evt.action}</span>
                  <span style={{ fontSize: 12, color: '#666' }}>by <strong>{evt.actor}</strong></span>
                  <span style={{
                    fontSize: 11, background: '#f5f5f5', padding: '1px 6px', borderRadius: 10,
                    color: '#888', border: '1px solid #e8e8e8',
                  }}>{evt.role}</span>
                  <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>{evt.date}</span>
                </div>
                {evt.note && (
                  <div style={{
                    marginTop: 6, fontSize: 12, color: '#555', background: '#fafafa',
                    border: '1px solid #f0f0f0', borderRadius: 4, padding: '6px 10px', lineHeight: 1.6,
                  }}>
                    {evt.note}
                  </div>
                )}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div style={{ color: '#aaa', fontSize: 13, padding: '8px 0' }}>No history available.</div>
          )}
        </div>
      </div>

      {/* Items Under Review */}
      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Items Under Review</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#999' }}>Procurement will approve or reject the entire application.</span>
            {canEdit && (
              <button
                className="btn-default"
                style={{ fontSize: 12 }}
                onClick={() => setAddingNew(true)}
                disabled={addingNew}
              >
                + Add Item
              </button>
            )}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Settlement Item</th>
              <th className="num">TMS Amount</th>
              <th className="num">Your Amount</th>
              <th className="num">Discrepancy</th>
              {canEdit && <th style={{ width: 60 }}>&nbsp;</th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((r, i) => (
              <tr key={i}>
                <td>{r.waybill}</td>
                <td>{r.item}</td>
                <td className="num tms-amt">{r.tmsAmount.toLocaleString()}</td>
                <td className="num vendor-amt">{r.vendorAmount.toLocaleString()}</td>
                <td className="num diff-positive">+{r.delta.toLocaleString()}</td>
                {canEdit && (
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-link"
                      style={{ color: '#ff4d4f', fontSize: 15, lineHeight: 1 }}
                      title="Remove this item"
                      onClick={() => handleDeleteLine(i)}
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {addingNew && (
              <tr style={{ background: '#fffbe6' }}>
                <td>
                  <input
                    className="filter-input"
                    style={{ width: '100%', margin: 0 }}
                    placeholder="WB No."
                    value={newLine.waybill}
                    onChange={(e) => setNewLine(p => ({ ...p, waybill: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    className="filter-input"
                    style={{ width: '100%', margin: 0 }}
                    placeholder="Item name"
                    value={newLine.item}
                    onChange={(e) => setNewLine(p => ({ ...p, item: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    className="filter-input"
                    style={{ width: '100%', margin: 0, textAlign: 'right' }}
                    placeholder="TMS amt"
                    type="number"
                    value={newLine.tmsAmount || ''}
                    onChange={(e) => setNewLine(p => ({ ...p, tmsAmount: Number(e.target.value) }))}
                  />
                </td>
                <td>
                  <input
                    className="filter-input"
                    style={{ width: '100%', margin: 0, textAlign: 'right' }}
                    placeholder="Your amt"
                    type="number"
                    value={newLine.vendorAmount || ''}
                    onChange={(e) => setNewLine(p => ({ ...p, vendorAmount: Number(e.target.value) }))}
                  />
                </td>
                <td className="num" style={{ color: '#389e0d' }}>
                  {newLine.vendorAmount - newLine.tmsAmount > 0
                    ? `+${(newLine.vendorAmount - newLine.tmsAmount).toLocaleString()}`
                    : (newLine.vendorAmount - newLine.tmsAmount).toLocaleString()}
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '2px 8px', marginRight: 4 }}
                    onClick={handleAddLine}
                    disabled={!newLine.waybill || !newLine.item}
                  >
                    Add
                  </button>
                  <button
                    className="btn-default"
                    style={{ fontSize: 12, padding: '2px 8px' }}
                    onClick={() => { setAddingNew(false); setNewLine({ ...EMPTY_LINE }); }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}

            {lines.length === 0 && !addingNew && (
              <tr><td colSpan={canEdit ? 6 : 5} className="empty">No items. Click "+ Add Item" to add.</td></tr>
            )}
          </tbody>
        </table>

        {currentStatus === 'Under Review' && (
          <div className="alert alert-info" style={{ marginTop: 12 }}>
            Once approved, TMS will update the waybill billing amounts and sync back to your Price Reconciliation view. If rejected, the original TMS amounts are kept.
          </div>
        )}
        {currentStatus === 'Rejected' && (
          <div className="alert alert-warn" style={{ marginTop: 12 }}>
            <span>⚠</span> This application was rejected. Review the rejection reason above, make necessary changes, then re-submit.
          </div>
        )}
        {currentStatus === 'Approved' && (
          <div className="alert alert-success" style={{ marginTop: 12, background: '#f6ffed' }}>
            <span>✓</span> Approved. TMS amounts have been updated to reflect your submitted values.
          </div>
        )}
      </div>
    </>
  );
}

export default ApplicationDetail;
