import React, { useState } from 'react';

export type PrePaidStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Paid';

interface PrePaidApplication {
  applicationNo: string;
  applicationDate: string;
  waybillNos: string[];
  prepaidAmount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: PrePaidStatus;
  rejectReason?: string;
}

interface Props {
  onCreate: () => void;
  onViewDetail: (app: PrePaidApplication) => void;
}

const SAMPLE_DATA: PrePaidApplication[] = [
  {
    applicationNo: 'PPA2604001',
    applicationDate: '2026-04-10',
    waybillNos: ['WB2604010', 'WB2604011'],
    prepaidAmount: 12000.00,
    vatAmount: 1440.00,
    totalAmount: 12960.00,
    currency: 'PHP',
    status: 'Paid',
  },
  {
    applicationNo: 'PPA2604002',
    applicationDate: '2026-04-18',
    waybillNos: ['WB2604020'],
    prepaidAmount: 8500.00,
    vatAmount: 1020.00,
    totalAmount: 9265.00,
    currency: 'PHP',
    status: 'Approved',
  },
  {
    applicationNo: 'PPA2604003',
    applicationDate: '2026-04-20',
    waybillNos: ['WB2604021', 'WB2604022', 'WB2604023'],
    prepaidAmount: 25000.00,
    vatAmount: 3000.00,
    totalAmount: 27250.00,
    currency: 'PHP',
    status: 'Pending Review',
  },
  {
    applicationNo: 'PPA2604004',
    applicationDate: '2026-04-15',
    waybillNos: ['WB2604018'],
    prepaidAmount: 6000.00,
    vatAmount: 720.00,
    totalAmount: 6480.00,
    currency: 'PHP',
    status: 'Rejected',
    rejectReason: 'Prepaid amount exceeds 80% of the basic freight for WB2604018. Please reduce the amount and resubmit.',
  },
];

function getStatusBadgeStyle(status: PrePaidStatus): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' };
  switch (status) {
    case 'Pending Review':
      return { ...base, background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' };
    case 'Approved':
      return { ...base, background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' };
    case 'Rejected':
      return { ...base, background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' };
    case 'Paid':
      return { ...base, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' };
  }
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function PrePaidApplicationList({ onCreate, onViewDetail }: Props) {
  const [filterStatus, setFilterStatus] = useState<PrePaidStatus | ''>('');
  const [keyword, setKeyword] = useState('');

  const filtered = SAMPLE_DATA.filter(a => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (keyword && !a.applicationNo.toLowerCase().includes(keyword.toLowerCase()) &&
      !a.waybillNos.some(w => w.toLowerCase().includes(keyword.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="vp-card">
      <div className="vp-card-title">
        <div>
          <div className="section-title">PrePaid Applications</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
            Apply for advance payment on in-progress waybills.
          </div>
        </div>
        <button className="btn-primary" onClick={onCreate}>
          + Create Application
        </button>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ marginTop: 12 }}>
        <input
          className="filter-input"
          placeholder="Application No. / Waybill No."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as PrePaidStatus | '')}
        >
          <option value="">All Statuses</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Paid">Paid</option>
        </select>
        <button className="btn-default" onClick={() => { setKeyword(''); setFilterStatus(''); }}>Reset</button>
      </div>

      <table className="data-table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Application No.</th>
            <th>Application Date</th>
            <th>Associated Waybills</th>
            <th style={{ textAlign: 'right' }}>PrePaid Amount</th>
            <th style={{ textAlign: 'right' }}>VAT Amount</th>
            <th style={{ textAlign: 'right' }}>Total Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(app => (
            <tr key={app.applicationNo}>
              <td>
                <strong style={{ color: '#00b96b', cursor: 'pointer' }} onClick={() => onViewDetail(app)}>
                  {app.applicationNo}
                </strong>
              </td>
              <td>{app.applicationDate}</td>
              <td style={{ fontSize: 12 }}>
                {app.waybillNos.join(', ')}
              </td>
              <td style={{ textAlign: 'right' }}>{formatAmount(app.prepaidAmount, app.currency)}</td>
              <td style={{ textAlign: 'right' }}>{formatAmount(app.vatAmount, app.currency)}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatAmount(app.totalAmount, app.currency)}</td>
              <td>
                <span style={getStatusBadgeStyle(app.status)}>{app.status}</span>
                {app.status === 'Approved' && (
                  <div style={{ fontSize: 11, color: '#0958d9', marginTop: 4 }}>
                    HR Payment Request triggered
                  </div>
                )}
                {app.status === 'Rejected' && (
                  <div style={{ fontSize: 11, color: '#cf1322', marginTop: 4, maxWidth: 200 }}
                    title={app.rejectReason}>
                    ⚠ {app.rejectReason?.slice(0, 50)}…
                  </div>
                )}
              </td>
              <td>
                {app.status === 'Rejected' ? (
                  <button className="btn-primary" style={{ fontSize: 12 }} onClick={onCreate}>
                    Resubmit
                  </button>
                ) : (
                  <button className="btn-default" style={{ fontSize: 12 }} onClick={() => onViewDetail(app)}>
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={8} className="empty">No prepaid applications found.</td></tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button className="page-btn">&lt;</button>
        <button className="page-btn active">1</button>
        <button className="page-btn">&gt;</button>
        <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>
          Total {filtered.length} · 20/page
        </span>
      </div>
    </div>
  );
}

export default PrePaidApplicationList;
export type { PrePaidApplication };
