import React, { useState } from 'react';

interface Props {
  onOpenDetail: (appNo: string) => void;
  onCreateNew: () => void;
}

export type AppStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Paid';
type Source = 'Vendor Portal' | 'Internal';

interface Row {
  appNo: string;
  source: Source;
  vendor: string;
  waybillNos: string[];
  prepaidAmount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  submittedAt: string;
  status: AppStatus;
  rejectReason?: string;
}

const SAMPLE: Row[] = [
  {
    appNo: 'PPA2604003',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604021', 'WB2604022', 'WB2604023'],
    prepaidAmount: 25000,
    vatAmount: 3000,
    totalAmount: 27250,
    currency: 'PHP',
    submittedAt: '2026-04-20 10:15',
    status: 'Pending Review',
  },
  {
    appNo: 'PPA2604005',
    source: 'Vendor Portal',
    vendor: 'SMC Logistics',
    waybillNos: ['WB2604030'],
    prepaidAmount: 18500,
    vatAmount: 2220,
    totalAmount: 19980.50,
    currency: 'PHP',
    submittedAt: '2026-04-22 09:00',
    status: 'Pending Review',
  },
  {
    appNo: 'PPA2604002',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604020'],
    prepaidAmount: 8500,
    vatAmount: 1020,
    totalAmount: 9265,
    currency: 'PHP',
    submittedAt: '2026-04-18 14:30',
    status: 'Approved',
  },
  {
    appNo: 'PPA2604006',
    source: 'Internal',
    vendor: 'JG Summit Freight',
    waybillNos: ['WB2604035', 'WB2604036'],
    prepaidAmount: 32000,
    vatAmount: 3840,
    totalAmount: 34560,
    currency: 'PHP',
    submittedAt: '2026-04-21 16:00',
    status: 'Approved',
  },
  {
    appNo: 'PPA2604004',
    source: 'Vendor Portal',
    vendor: 'Manila Freight Co.',
    waybillNos: ['WB2604018'],
    prepaidAmount: 6000,
    vatAmount: 720,
    totalAmount: 6480,
    currency: 'PHP',
    submittedAt: '2026-04-15 11:20',
    status: 'Rejected',
    rejectReason: 'Prepaid amount exceeds 80% of basic freight for WB2604018. Please reduce amount.',
  },
  {
    appNo: 'PPA2604001',
    source: 'Vendor Portal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillNos: ['WB2604010', 'WB2604011'],
    prepaidAmount: 12000,
    vatAmount: 1440,
    totalAmount: 12960,
    currency: 'PHP',
    submittedAt: '2026-04-10 08:30',
    status: 'Paid',
  },
  {
    appNo: 'PPA2604007',
    source: 'Internal',
    vendor: 'Bangkok Express Logistics',
    waybillNos: ['WB2604040'],
    prepaidAmount: 45000,
    vatAmount: 3150,
    totalAmount: 47025,
    currency: 'THB',
    submittedAt: '2026-04-23 10:00',
    status: 'Paid',
  },
];

const STATUS_STYLE: Record<AppStatus, React.CSSProperties> = {
  'Pending Review': { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Approved':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Rejected':       { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Paid':           { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
};

const SOURCE_STYLE: Record<Source, React.CSSProperties> = {
  'Vendor Portal': { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Internal':      { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
};

function fmt(n: number, cur: string) {
  return `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function ApplicationList({ onOpenDetail, onCreateNew }: Props) {
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [keyword, setKeyword] = useState('');

  const filtered = SAMPLE.filter(r => {
    if (filterSource && r.source !== filterSource) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (keyword && !r.appNo.toLowerCase().includes(keyword.toLowerCase()) &&
      !r.vendor.toLowerCase().includes(keyword.toLowerCase()) &&
      !r.waybillNos.some(w => w.toLowerCase().includes(keyword.toLowerCase()))) return false;
    return true;
  });

  const pendingCount = SAMPLE.filter(r => r.status === 'Pending Review').length;
  const approvedCount = SAMPLE.filter(r => r.status === 'Approved').length;
  const paidCount = SAMPLE.filter(r => r.status === 'Paid').length;
  const vpCount = SAMPLE.filter(r => r.source === 'Vendor Portal').length;

  return (
    <>
      <div className="tms-kpi-row">
        <div className="tms-kpi">
          <div className="tms-kpi-label">Total Applications</div>
          <div className="tms-kpi-value">{SAMPLE.length}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">Pending Review</div>
          <div className="tms-kpi-value orange">{pendingCount}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">Approved (HR Pending)</div>
          <div className="tms-kpi-value blue">{approvedCount}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">Paid</div>
          <div className="tms-kpi-value green">{paidCount}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">From Vendor Portal</div>
          <div className="tms-kpi-value">{vpCount}</div>
        </div>
      </div>

      <div className="tms-card">
        <div className="tms-card-title">
          <div>
            <div className="section-title">Prepaid Applications</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Unified pool — applications submitted from Vendor Portal and created internally.
            </div>
          </div>
          <button className="btn-primary" onClick={onCreateNew}>+ Create Application</button>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 12 }}>
          <span>ⓘ</span>
          <span>
            Applications submitted from <strong>Vendor Portal</strong> appear here automatically.
            Upon <strong>Approve</strong>, the system will call the HR Payment API to create a Vendor Payment request.
            Status updates to <span style={{ ...STATUS_STYLE['Paid'], display: 'inline-block', margin: '0 4px' }}>Paid</span> once HR releases the payment.
          </span>
        </div>

        <div className="filter-row">
          <input
            className="filter-input"
            placeholder="Application No. / Vendor / Waybill"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="">Source: All</option>
            <option value="Vendor Portal">Vendor Portal</option>
            <option value="Internal">Internal</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Status: All</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
          </select>
          <button className="btn-default" onClick={() => { setKeyword(''); setFilterSource(''); setFilterStatus(''); }}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Source</th>
              <th>Vendor</th>
              <th>Waybills</th>
              <th style={{ textAlign: 'right' }}>Prepaid Amount</th>
              <th style={{ textAlign: 'right' }}>VAT</th>
              <th style={{ textAlign: 'right' }}>Total Payable</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.appNo}>
                <td>
                  <button className="btn-link" onClick={() => onOpenDetail(r.appNo)}>{r.appNo}</button>
                </td>
                <td><span style={SOURCE_STYLE[r.source]}>{r.source}</span></td>
                <td style={{ fontSize: 13 }}>{r.vendor}</td>
                <td style={{ fontSize: 12, color: '#666' }}>{r.waybillNos.join(', ')}</td>
                <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(r.prepaidAmount, r.currency)}</td>
                <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(r.vatAmount, r.currency)}</td>
                <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{fmt(r.totalAmount, r.currency)}</td>
                <td style={{ fontSize: 12, color: '#666' }}>{r.submittedAt}</td>
                <td>
                  <span style={STATUS_STYLE[r.status]}>{r.status}</span>
                  {r.status === 'Rejected' && r.rejectReason && (
                    <div style={{ fontSize: 11, color: '#cf1322', marginTop: 3, maxWidth: 160 }} title={r.rejectReason}>
                      ⚠ {r.rejectReason.slice(0, 40)}…
                    </div>
                  )}
                </td>
                <td>
                  <button className="btn-link" onClick={() => onOpenDetail(r.appNo)}>
                    {r.status === 'Pending Review' ? 'Review' : 'Details'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="empty">No prepaid applications found.</td></tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">&gt;</button>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>Total {filtered.length} · 20/page</span>
        </div>
      </div>
    </>
  );
}

export default ApplicationList;
export type { AppStatus };
