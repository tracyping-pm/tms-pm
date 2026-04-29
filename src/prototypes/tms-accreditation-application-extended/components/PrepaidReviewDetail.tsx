import React, { useState } from 'react';
import type { AppStatus } from './ApplicationList';

interface Props {
  appNo: string;
  onBack: () => void;
}

interface WaybillRow {
  no: string;
  status: string;
  basicAmount: number;
  allocatedPrepaid: number;
  handlingFee: number;
  utilization: number; // (allocatedPrepaid + handlingFee) / basicAmount
}

interface ApplicationData {
  appNo: string;
  source: 'Vendor Portal' | 'Internal';
  vendor: string;
  submittedAt: string;
  status: AppStatus;
  waybills: WaybillRow[];
  prepaidAmount: number;
  vatRate: number;
  vatAmount: number;
  whtRate: number;
  whtAmount: number;
  totalPayable: number;
  currency: string;
  bankName: string;
  bankAccount: string;
  proofFile: string;
  remark: string;
  rejectReason?: string;
}

const APP_DATA: Record<string, ApplicationData> = {
  PPA2604003: {
    appNo: 'PPA2604003',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    submittedAt: '2026-04-20 10:15',
    status: 'Pending Review',
    waybills: [
      { no: 'WB2604021', status: 'In Transit', basicAmount: 8000, allocatedPrepaid: 8108.11, handlingFee: 400, utilization: 106.4 },
      { no: 'WB2604022', status: 'Planning', basicAmount: 15000, allocatedPrepaid: 15202.70, handlingFee: 750, utilization: 105.0 },
      { no: 'WB2604023', status: 'Pending', basicAmount: 6000, allocatedPrepaid: 6089.19, handlingFee: 300, utilization: 106.5 },
    ],
    prepaidAmount: 25000,
    vatRate: 12,
    vatAmount: 3000,
    whtRate: 2,
    whtAmount: 500,
    totalPayable: 27500,
    currency: 'PHP',
    bankName: 'BPI',
    bankAccount: '1234-5678-90',
    proofFile: 'payment_voucher_CCA_Apr2026.pdf',
    remark: 'Advance for April transport batch.',
  },
  PPA2604005: {
    appNo: 'PPA2604005',
    source: 'Vendor Portal',
    vendor: 'SMC Logistics',
    submittedAt: '2026-04-22 09:00',
    status: 'Pending Review',
    waybills: [
      { no: 'WB2604030', status: 'In Transit', basicAmount: 20000, allocatedPrepaid: 18500, handlingFee: 0, utilization: 92.5 },
    ],
    prepaidAmount: 18500,
    vatRate: 12,
    vatAmount: 2220,
    whtRate: 2,
    whtAmount: 370,
    totalPayable: 20350,
    currency: 'PHP',
    bankName: 'BDO',
    bankAccount: '5566-7788-99',
    proofFile: '',
    remark: '',
  },
  PPA2604002: {
    appNo: 'PPA2604002',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    submittedAt: '2026-04-18 14:30',
    status: 'Approved',
    waybills: [
      { no: 'WB2604020', status: 'In Transit', basicAmount: 12500, allocatedPrepaid: 8500, handlingFee: 625, utilization: 73.0 },
    ],
    prepaidAmount: 8500,
    vatRate: 12,
    vatAmount: 1020,
    whtRate: 2,
    whtAmount: 170,
    totalPayable: 9350,
    currency: 'PHP',
    bankName: 'BPI',
    bankAccount: '1234-5678-90',
    proofFile: 'advance_request_apr18.pdf',
    remark: '',
  },
};

const FALLBACK: ApplicationData = {
  appNo: 'PPA2604001',
  source: 'Vendor Portal',
  vendor: 'Coca-Cola Bottlers PH Inc.',
  submittedAt: '2026-04-10 08:30',
  status: 'Paid',
  waybills: [
    { no: 'WB2604010', status: 'Delivered', basicAmount: 10000, allocatedPrepaid: 7000, handlingFee: 500, utilization: 75.0 },
    { no: 'WB2604011', status: 'Delivered', basicAmount: 8000, allocatedPrepaid: 5000, handlingFee: 400, utilization: 67.5 },
  ],
  prepaidAmount: 12000,
  vatRate: 12,
  vatAmount: 1440,
  whtRate: 2,
  whtAmount: 240,
  totalPayable: 13200,
  currency: 'PHP',
  bankName: 'BPI',
  bankAccount: '1234-5678-90',
  proofFile: 'advance_request_apr10.pdf',
  remark: '',
};

const STATUS_STYLE: Record<AppStatus, React.CSSProperties> = {
  'Pending Review': { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
  'Approved':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Rejected':       { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Paid':           { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
};

const badge = (status: AppStatus) => ({
  ...STATUS_STYLE[status],
  borderRadius: 4, padding: '3px 10px', fontSize: 13,
});

function PrepaidReviewDetail({ appNo, onBack }: Props) {
  const data = APP_DATA[appNo] || FALLBACK;

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editAmount, setEditAmount] = useState(String(data.prepaidAmount));
  const [editVatRate, setEditVatRate] = useState(String(data.vatRate));
  const [actionDone, setActionDone] = useState<'approved' | 'rejected' | 'edited' | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AppStatus>(data.status);

  const handleApprove = () => {
    setShowApproveConfirm(false);
    setCurrentStatus('Approved');
    setActionDone('approved');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setShowRejectDialog(false);
    setCurrentStatus('Rejected');
    setActionDone('rejected');
  };

  const handleEdit = () => {
    setShowEditDialog(false);
    setActionDone('edited');
  };

  const fmt = (n: number) => `${data.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const isReviewable = currentStatus === 'Pending Review';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{data.appNo}</h2>
        <span style={badge(currentStatus)}>{currentStatus}</span>
        {data.source === 'Vendor Portal'
          ? <span style={{ background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>Vendor Portal</span>
          : <span style={{ background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>Internal</span>
        }
        {isReviewable && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-default" onClick={() => setShowEditDialog(true)}>Edit</button>
            <button className="btn-default" style={{ color: '#cf1322', borderColor: '#ffa39e' }} onClick={() => setShowRejectDialog(true)}>Reject</button>
            <button className="btn-primary" onClick={() => setShowApproveConfirm(true)}>Approve</button>
          </div>
        )}
      </div>

      {/* Action result banner */}
      {actionDone === 'approved' && (
        <div className="alert" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', marginBottom: 16 }}>
          ✓ Application approved. A Vendor Payment request has been submitted to the HR system automatically.
        </div>
      )}
      {actionDone === 'rejected' && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 16 }}>
          ✗ Application rejected. The vendor has been notified with your reason.
        </div>
      )}
      {actionDone === 'edited' && (
        <div className="alert" style={{ background: '#e6f4ff', border: '1px solid #91caff', color: '#0958d9', marginBottom: 16 }}>
          ✎ Amounts updated. Changes recorded in the operation log.
        </div>
      )}

      {/* Basic info */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Application Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            ['Vendor', data.vendor],
            ['Submitted At', data.submittedAt],
            ['Bank', `${data.bankName} — ${data.bankAccount}`],
            ['Proof', data.proofFile || '—'],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13 }}>{value as string}</div>
            </div>
          ))}
          {data.remark && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Remark</div>
              <div style={{ fontSize: 13, color: '#555' }}>{data.remark}</div>
            </div>
          )}
        </div>
      </div>

      {/* Waybill breakdown */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Associated Waybills</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          System validation: Allocated Prepaid + Handling Fee must not exceed 100% of Basic Freight.
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Basic Freight</th>
              <th style={{ textAlign: 'right' }}>Allocated Prepaid</th>
              <th style={{ textAlign: 'right' }}>Handling Fee</th>
              <th style={{ textAlign: 'right' }}>Utilization</th>
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>
            {data.waybills.map(w => {
              const overLimit = w.utilization > 100;
              return (
                <tr key={w.no}>
                  <td><strong>{w.no}</strong></td>
                  <td>
                    <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.basicAmount)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.allocatedPrepaid)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.handlingFee)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13, color: overLimit ? '#cf1322' : '#389e0d', fontWeight: 600 }}>
                    {w.utilization.toFixed(1)}%
                  </td>
                  <td>
                    {overLimit
                      ? <span style={{ color: '#cf1322', fontSize: 12 }}>⚠ Over limit</span>
                      : <span style={{ color: '#389e0d', fontSize: 12 }}>✓ OK</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tax & Amount summary */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Amount &amp; Tax Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { label: 'Prepaid Amount', value: fmt(data.prepaidAmount) },
            { label: `VAT (${data.vatRate}%)`, value: `+ ${fmt(data.vatAmount)}` },
            { label: `WHT (${data.whtRate}%)`, value: `− ${fmt(data.whtAmount)}` },
            { label: 'Total Payable', value: fmt(data.totalPayable), highlight: true },
          ].map(item => (
            <div key={item.label} style={{
              background: item.highlight ? '#e6f7ef' : '#fafafa',
              border: `1px solid ${item.highlight ? '#87e8a3' : '#f0f0f0'}`,
              borderRadius: 6, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 11, color: item.highlight ? '#00b96b' : '#888', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: item.highlight ? '#00b96b' : '#333' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Operation log placeholder */}
      <div className="tms-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Operation Log</div>
        <div style={{ fontSize: 13, color: '#888' }}>
          {data.submittedAt} — Application submitted by {data.source === 'Vendor Portal' ? data.vendor : 'TMS Internal'}
        </div>
        {actionDone === 'approved' && (
          <div style={{ fontSize: 13, color: '#389e0d', marginTop: 6 }}>
            {new Date().toLocaleString()} — Approved by Zhang Jialei · HR Payment request triggered
          </div>
        )}
        {actionDone === 'rejected' && (
          <div style={{ fontSize: 13, color: '#cf1322', marginTop: 6 }}>
            {new Date().toLocaleString()} — Rejected by Zhang Jialei · Reason: {rejectReason || '(recorded)'}
          </div>
        )}
        {actionDone === 'edited' && (
          <div style={{ fontSize: 13, color: '#0958d9', marginTop: 6 }}>
            {new Date().toLocaleString()} — Amount edited by Zhang Jialei · Prepaid Amount → PHP {editAmount}
          </div>
        )}
      </div>

      {/* Approve confirmation modal */}
      {showApproveConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Confirm Approval</div>
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#614700' }}>
              ⚠ Approval will automatically trigger a <strong>Payment Request</strong> in the HR system. Do you wish to proceed?
            </div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>
              <div>Vendor: <strong>{data.vendor}</strong></div>
              <div>Total Payable: <strong>{fmt(data.totalPayable)}</strong></div>
              <div>Bank: <strong>{data.bankName} — {data.bankAccount}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-default" onClick={() => setShowApproveConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleApprove}>Yes, Approve &amp; Trigger HR Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {showRejectDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Reject Application</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>
                Reject Reason <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <textarea
                style={{ width: '100%', height: 90, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Explain why this application is rejected. The vendor will see this reason."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              {!rejectReason.trim() && (
                <div style={{ fontSize: 12, color: '#cf1322', marginTop: 4 }}>Reject reason is required.</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-default" onClick={() => setShowRejectDialog(false)}>Cancel</button>
              <button
                style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}
                onClick={handleReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {showEditDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Edit Application</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Prepaid Amount ({data.currency})</label>
              <input
                type="number"
                className="filter-input"
                style={{ width: '100%' }}
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>VAT Rate (%)</label>
              <input
                type="number"
                className="filter-input"
                style={{ width: '100%' }}
                value={editVatRate}
                onChange={e => setEditVatRate(e.target.value)}
              />
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              All edits are recorded in the operation log.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-default" onClick={() => setShowEditDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrepaidReviewDetail;
