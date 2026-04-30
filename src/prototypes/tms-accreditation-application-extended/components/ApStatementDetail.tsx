import React, { useState } from 'react';

interface Props {
  statementId: string;
  onBack: () => void;
}

type Status =
  | 'Awaiting Confirmation'
  | 'Awaiting Comparison'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Awaiting Rebill';

interface WaybillRow {
  no: string;
  truckType: string;
  origin: string;
  destination: string;
  vendorBasic: number;
  tmsBasic: number;
  vendorAdditional: number;
  tmsAdditional: number;
  result: 'Matched' | 'Mismatch' | 'Pending';
}

interface StatementData {
  id: string;
  vendor: string;
  source: 'Vendor Portal' | 'Internal';
  status: Status;
  currency: string;
  createdAt: string;
  waybills: WaybillRow[];
  vendorTotal: number;
  tmsTotal: number;
  rejectReason?: string;
}

const STATEMENT_DATA: Record<string, StatementData> = {
  AP2026040007: {
    id: 'AP2026040007',
    vendor: 'Laguna Logistics Corp.',
    source: 'Vendor Portal',
    status: 'Awaiting Confirmation',
    currency: 'PHP',
    createdAt: '2026-04-25',
    waybills: [
      { no: 'WB2604050', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus', vendorBasic: 12500, tmsBasic: 0, vendorAdditional: 800, tmsAdditional: 0, result: 'Pending' },
      { no: 'WB2604051', truckType: '6-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Taguig', vendorBasic: 8200, tmsBasic: 0, vendorAdditional: 0, tmsAdditional: 0, result: 'Pending' },
      { no: 'WB2604052', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Batangas', vendorBasic: 14300, tmsBasic: 0, vendorAdditional: 1400, tmsAdditional: 0, result: 'Pending' },
      { no: 'WB2604053', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila', vendorBasic: 10000, tmsBasic: 0, vendorAdditional: 0, tmsAdditional: 0, result: 'Pending' },
    ],
    vendorTotal: 47200,
    tmsTotal: 0,
  },
  AP2026040003: {
    id: 'AP2026040003',
    vendor: 'Bangkok Express Logistics',
    source: 'Vendor Portal',
    status: 'Awaiting Comparison',
    currency: 'THB',
    createdAt: '2026-04-18',
    waybills: [
      { no: 'WB2604040', truckType: '10-Wheeler', origin: 'TH-Bangkok / Suvarnabhumi', destination: 'TH-Chonburi / Laem Chabang', vendorBasic: 28000, tmsBasic: 28000, vendorAdditional: 2000, tmsAdditional: 2000, result: 'Matched' },
      { no: 'WB2604041', truckType: '6-Wheeler', origin: 'TH-Chonburi', destination: 'TH-Bangkok', vendorBasic: 18000, tmsBasic: 16500, vendorAdditional: 1500, tmsAdditional: 1500, result: 'Mismatch' },
      { no: 'WB2604042', truckType: '10-Wheeler', origin: 'TH-Bangkok', destination: 'TH-Rayong', vendorBasic: 32000, tmsBasic: 32000, vendorAdditional: 0, tmsAdditional: 0, result: 'Matched' },
      { no: 'WB2604043', truckType: '4-Wheeler', origin: 'TH-Chonburi', destination: 'TH-Samut Prakan', vendorBasic: 12000, tmsBasic: 12000, vendorAdditional: 800, tmsAdditional: 800, result: 'Matched' },
      { no: 'WB2604044', truckType: '10-Wheeler', origin: 'TH-Bangkok / Port', destination: 'TH-Chonburi', vendorBasic: 42000, tmsBasic: 42000, vendorAdditional: 3000, tmsAdditional: 3000, result: 'Matched' },
      { no: 'WB2604045', truckType: '6-Wheeler', origin: 'TH-Rayong', destination: 'TH-Bangkok', vendorBasic: 17700, tmsBasic: 17700, vendorAdditional: 0, tmsAdditional: 0, result: 'Matched' },
    ],
    vendorTotal: 156000,
    tmsTotal: 154000,
  },
  AP2026040002: {
    id: 'AP2026040002',
    vendor: 'Cebu Trans Lines',
    source: 'Vendor Portal',
    status: 'Awaiting Comparison',
    currency: 'PHP',
    createdAt: '2026-04-23',
    waybills: [
      { no: 'WB2604060', truckType: '10-Wheeler', origin: 'PH-Cebu / Port', destination: 'PH-Cebu / DC', vendorBasic: 22000, tmsBasic: 20000, vendorAdditional: 1500, tmsAdditional: 1500, result: 'Mismatch' },
      { no: 'WB2604061', truckType: '6-Wheeler', origin: 'PH-Cebu', destination: 'PH-Lapu-Lapu', vendorBasic: 15000, tmsBasic: 15000, vendorAdditional: 0, tmsAdditional: 0, result: 'Matched' },
    ],
    vendorTotal: 38500,
    tmsTotal: 36500,
  },
};

const FALLBACK: StatementData = {
  id: '',
  vendor: 'Unknown Vendor',
  source: 'Internal',
  status: 'Pending Payment',
  currency: 'PHP',
  createdAt: '2026-04-01',
  waybills: [],
  vendorTotal: 0,
  tmsTotal: 0,
};

const STATUS_STYLE: Record<Status, React.CSSProperties> = {
  'Awaiting Confirmation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Awaiting Comparison':   { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Pending Payment':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':     { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                  { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Awaiting Rebill':       { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

const INVOICE_DATA: Record<string, { no: string; amount: string; date: string; status: 'Verified' | 'Pending Verification' }[]> = {
  AP2026040003: [{ no: 'INV-TH-2604003', amount: 'THB 156,000.00', date: '2026-04-17', status: 'Verified' }],
  AP2026040002: [{ no: 'INV-PH-2604002', amount: 'PHP 38,500.00', date: '2026-04-22', status: 'Pending Verification' }],
};

const PROOF_DATA: Record<string, string[]> = {
  AP2026040003: ['waybill_summary_BKK_Apr.pdf', 'delivery_photos.zip'],
};

interface LogEntry {
  color: string;
  time: string;
  desc: string;
  actor: string;
}

const STATIC_LOGS: Record<string, LogEntry[]> = {
  AP2026040007: [
    { color: '#1677ff', time: '2026-04-25 09:20', desc: 'Vendor submitted statement', actor: 'Laguna Logistics Corp. (VP)' },
  ],
  AP2026040003: [
    { color: '#00b96b', time: '2026-04-19 11:05', desc: 'Status changed: Awaiting Confirmation → Awaiting Comparison', actor: 'Zhang Jialei' },
    { color: '#1677ff', time: '2026-04-18 16:00', desc: 'Vendor submitted statement', actor: 'Bangkok Express Logistics (VP)' },
  ],
  AP2026040002: [
    { color: '#00b96b', time: '2026-04-24 10:30', desc: 'Status changed: Awaiting Confirmation → Awaiting Comparison', actor: 'Zhang Jialei' },
    { color: '#1677ff', time: '2026-04-23 14:55', desc: 'Vendor submitted statement', actor: 'Cebu Trans Lines (VP)' },
  ],
};

function ApStatementDetail({ statementId, onBack }: Props) {
  const data = STATEMENT_DATA[statementId] || { ...FALLBACK, id: statementId };

  const [currentStatus, setCurrentStatus] = useState<Status>(data.status);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionDone, setActionDone] = useState<'confirmed' | 'rejected' | 'matched' | null>(null);
  const [rowResults, setRowResults] = useState<Record<string, 'Matched' | 'Mismatch'>>(
    Object.fromEntries(data.waybills.filter(w => w.result !== 'Pending').map(w => [w.no, w.result as 'Matched' | 'Mismatch']))
  );
  const [toast, setToast] = useState<string | null>(null);

  const badge = (s: Status) => ({ ...STATUS_STYLE[s], borderRadius: 4, padding: '3px 10px', fontSize: 13 });

  const isAwaitingConfirmation = currentStatus === 'Awaiting Confirmation';
  const isAwaitingComparison = currentStatus === 'Awaiting Comparison';

  const mismatchCount = Object.values(rowResults).filter(r => r === 'Mismatch').length;
  const matchedCount = Object.values(rowResults).filter(r => r === 'Matched').length;

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    setCurrentStatus('Awaiting Comparison');
    setActionDone('confirmed');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setShowRejectDialog(false);
    setCurrentStatus('Awaiting Rebill');
    setActionDone('rejected');
  };

  const handleFinalise = () => {
    setCurrentStatus(mismatchCount > 0 ? 'Awaiting Rebill' : 'Pending Payment');
    setActionDone('matched');
  };

  const toggleResult = (no: string) => {
    setRowResults(prev => ({
      ...prev,
      [no]: prev[no] === 'Matched' ? 'Mismatch' : 'Matched',
    }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const staticLogs: LogEntry[] = STATIC_LOGS[statementId] || [
    { color: '#00b96b', time: `${data.createdAt} 08:00`, desc: 'Statement created', actor: 'Zhang Jialei' },
  ];

  const dynamicLogs: LogEntry[] = [];
  if (actionDone === 'confirmed') {
    dynamicLogs.push({ color: '#00b96b', time: '刚刚', desc: 'Status changed: Awaiting Confirmation → Awaiting Comparison', actor: 'Zhang Jialei' });
  } else if (actionDone === 'rejected') {
    dynamicLogs.push({ color: '#00b96b', time: '刚刚', desc: 'Statement sent back to vendor', actor: 'Zhang Jialei' });
  } else if (actionDone === 'matched' && mismatchCount === 0) {
    dynamicLogs.push({ color: '#00b96b', time: '刚刚', desc: 'Confirm & Create Vendor Payment triggered', actor: 'Zhang Jialei' });
  }

  const allLogs = [...dynamicLogs, ...staticLogs];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn-link" onClick={onBack}>← Back to AP Statement</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{data.id}</h2>
        <span style={badge(currentStatus)}>{currentStatus}</span>
        <span style={data.source === 'Vendor Portal'
          ? { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
          : { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
        }>{data.source}</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {isAwaitingConfirmation && (
            <>
              <button className="btn-default" style={{ color: '#cf1322', borderColor: '#ffa39e' }} onClick={() => setShowRejectDialog(true)}>
                Reject &amp; Send Back
              </button>
              <button className="btn-primary" onClick={() => setShowConfirmDialog(true)}>
                Confirm &amp; Start Comparison
              </button>
            </>
          )}
          {isAwaitingComparison && (
            <button
              className="btn-primary"
              onClick={handleFinalise}
              disabled={Object.keys(rowResults).length < data.waybills.length}
            >
              Confirm &amp; Create Vendor Payment
            </button>
          )}
        </div>
      </div>

      {/* Action banners */}
      {actionDone === 'confirmed' && (
        <div className="alert" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', marginBottom: 16 }}>
          ✓ Statement confirmed. You can now proceed with the blind comparison below.
        </div>
      )}
      {actionDone === 'rejected' && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 16 }}>
          ✗ Statement sent back to vendor for correction.
        </div>
      )}
      {actionDone === 'matched' && (
        <div className="alert" style={{
          background: mismatchCount > 0 ? '#fff1f0' : '#f6ffed',
          border: `1px solid ${mismatchCount > 0 ? '#ffa39e' : '#b7eb8f'}`,
          color: mismatchCount > 0 ? '#cf1322' : '#389e0d',
          marginBottom: 16,
        }}>
          {mismatchCount > 0
            ? `⚠ Comparison complete — ${mismatchCount} mismatch(es) found. Statement sent back to vendor.`
            : `✓ All waybills matched. AP Application auto-generated and statement moved to Pending Payment.`}
        </div>
      )}

      {/* Statement info */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Statement Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            ['Vendor', data.vendor],
            ['Currency', data.currency],
            ['Created At', data.createdAt],
            ['Waybill Count', String(data.waybills.length)],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>
          {isAwaitingConfirmation ? 'Waybill List (Vendor-Submitted)' : 'Blind Comparison — Vendor vs TMS'}
        </div>
        {isAwaitingComparison && (
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            TMS contract prices are shown for comparison. Click <strong>Match / Mismatch</strong> to record each row's result.
            {mismatchCount > 0 && (
              <span style={{ marginLeft: 8, color: '#cf1322' }}>⚠ {mismatchCount} mismatch(es)</span>
            )}
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Truck Type</th>
              <th>Route</th>
              <th style={{ textAlign: 'right' }}>Vendor Basic</th>
              {!isAwaitingConfirmation && <th style={{ textAlign: 'right' }}>TMS Basic</th>}
              <th style={{ textAlign: 'right' }}>Vendor Add.</th>
              {!isAwaitingConfirmation && <th style={{ textAlign: 'right' }}>TMS Add.</th>}
              {isAwaitingComparison && <th style={{ textAlign: 'right' }}>Variance</th>}
              {isAwaitingComparison && <th style={{ textAlign: 'center' }}>Result</th>}
            </tr>
          </thead>
          <tbody>
            {data.waybills.map(w => {
              const result = rowResults[w.no];
              const isMismatch = result === 'Mismatch';
              return (
                <tr key={w.no} style={{ background: isMismatch ? '#fff1f0' : undefined }}>
                  <td><strong>{w.no}</strong></td>
                  <td style={{ fontSize: 12 }}>{w.truckType}</td>
                  <td style={{ fontSize: 11, color: '#666' }}>{w.origin} → {w.destination}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.vendorBasic)}</td>
                  {!isAwaitingConfirmation && (
                    <td style={{ textAlign: 'right', fontSize: 13, color: w.vendorBasic !== w.tmsBasic ? '#cf1322' : '#389e0d' }}>
                      {fmt(w.tmsBasic)}
                    </td>
                  )}
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{w.vendorAdditional > 0 ? fmt(w.vendorAdditional) : '—'}</td>
                  {!isAwaitingConfirmation && (
                    <td style={{ textAlign: 'right', fontSize: 13, color: w.vendorAdditional !== w.tmsAdditional ? '#cf1322' : '#389e0d' }}>
                      {w.tmsAdditional > 0 ? fmt(w.tmsAdditional) : '—'}
                    </td>
                  )}
                  {isAwaitingComparison && (() => {
                    const variance = (w.vendorBasic + w.vendorAdditional) - (w.tmsBasic + w.tmsAdditional);
                    let varianceText = '—';
                    let varianceColor = '#389e0d';
                    let varianceBg: string | undefined = undefined;
                    if (variance > 0) { varianceText = `+${fmt(variance)}`; varianceColor = '#cf1322'; varianceBg = '#fff1f0'; }
                    else if (variance < 0) { varianceText = `-${fmt(Math.abs(variance))}`; varianceColor = '#d46b08'; varianceBg = '#fff7e6'; }
                    return (
                      <td style={{ textAlign: 'right', fontSize: 13, color: varianceColor, background: varianceBg }}>
                        {varianceText}
                      </td>
                    );
                  })()}
                  {isAwaitingComparison && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        style={{
                          fontSize: 12, padding: '2px 10px', borderRadius: 4, cursor: 'pointer', border: 'none',
                          background: result === 'Matched' ? '#f6ffed' : result === 'Mismatch' ? '#fff1f0' : '#f5f5f5',
                          color: result === 'Matched' ? '#389e0d' : result === 'Mismatch' ? '#cf1322' : '#888',
                        }}
                        onClick={() => toggleResult(w.no)}
                      >
                        {result ?? 'Set Result'}
                      </button>
                      {result === 'Mismatch' && (
                        <button
                          style={{ fontSize: 11, color: '#1677ff', cursor: 'pointer', border: 'none', background: 'transparent', padding: '2px 6px' }}
                          onClick={() => showToast(`Redirecting to Waybill ${w.no} — In production, this opens the waybill detail in a new tab. Any changes will be logged in the waybill Operation Log.`)}
                        >
                          Edit in Waybill
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Amount summary */}
      <div className="tms-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Amount Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: isAwaitingConfirmation ? '1fr' : '1fr 1fr 1fr', gap: 12, maxWidth: 500 }}>
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Vendor Total</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{data.currency} {fmt(data.vendorTotal)}</div>
          </div>
          {!isAwaitingConfirmation && (
            <>
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>TMS Total</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{data.currency} {fmt(data.tmsTotal)}</div>
              </div>
              <div style={{
                background: data.vendorTotal === data.tmsTotal ? '#f6ffed' : '#fff1f0',
                border: `1px solid ${data.vendorTotal === data.tmsTotal ? '#b7eb8f' : '#ffa39e'}`,
                borderRadius: 6, padding: '10px 14px',
              }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Difference</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: data.vendorTotal === data.tmsTotal ? '#389e0d' : '#cf1322' }}>
                  {data.currency} {fmt(Math.abs(data.vendorTotal - data.tmsTotal))}
                  {data.vendorTotal !== data.tmsTotal && (
                    <span style={{ fontSize: 11, marginLeft: 4 }}>({data.vendorTotal > data.tmsTotal ? 'Vendor higher' : 'TMS higher'})</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice */}
      <div className="tms-card" style={{ marginBottom: 16, marginTop: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Invoice</div>
        {(() => {
          const invoices = INVOICE_DATA[statementId];
          if (!invoices || invoices.length === 0) {
            return <div style={{ fontSize: 13, color: '#999' }}>No invoice uploaded.</div>;
          }
          return (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Invoice Amount</th>
                  <th>Invoice Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.no}>
                    <td>{inv.no}</td>
                    <td>{inv.amount}</td>
                    <td>{inv.date}</td>
                    <td>
                      <span style={inv.status === 'Verified'
                        ? { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
                        : { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
                      }>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>

      {/* Supporting Proof */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Supporting Proof</div>
        {(() => {
          const files = PROOF_DATA[statementId];
          if (!files || files.length === 0) {
            return <div style={{ fontSize: 13, color: '#999' }}>No proof uploaded.</div>;
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
              {files.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <span>📄</span>
                  <span>{f}</span>
                  <a href="#" style={{ fontSize: 12, color: '#1677ff' }}>Download</a>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Operation Log */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Operation Log</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: log.color, marginTop: 3, flexShrink: 0 }} />
              <div>
                <span style={{ color: '#888', marginRight: 8 }}>{log.time}</span>
                <span>{log.desc}</span>
                <span style={{ color: '#888', marginLeft: 8 }}>· {log.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#fff', border: '1px solid #d9d9d9',
          borderRadius: 8, padding: '12px 18px', maxWidth: 420, fontSize: 13, color: '#333',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 2000,
        }}>
          {toast}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirmDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Confirm Statement</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>
              This will move the statement to <strong>Awaiting Comparison</strong> and unlock the blind comparison view.
              The vendor's submitted amounts are now locked.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-default" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirm}>Confirm & Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {showRejectDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Send Back to Vendor</div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>
              Reject Reason <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <textarea
              style={{ width: '100%', height: 90, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Explain the issue so the vendor can correct and resubmit."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            {!rejectReason.trim() && (
              <div style={{ fontSize: 12, color: '#cf1322', marginTop: 4 }}>Reason is required.</div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-default" onClick={() => setShowRejectDialog(false)}>Cancel</button>
              <button
                style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}
                onClick={handleReject}
              >
                Send Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApStatementDetail;
