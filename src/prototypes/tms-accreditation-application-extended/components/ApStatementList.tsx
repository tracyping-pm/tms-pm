import React, { useState } from 'react';

interface Props {
  onCreateNew: () => void;
  onViewDetail: (id: string) => void;
}

type Status =
  | 'Awaiting Confirmation'
  | 'Awaiting Comparison'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Awaiting Rebill';

type Source = 'Vendor Portal' | 'Internal';

interface Row {
  id: string;
  source: Source;
  vendor: string;
  waybillCount: number;
  currency: string;
  totalAmount: number;
  collectedAmount: number;
  status: Status;
  createdAt: string;
  createdBy: string;
  hasMismatch?: boolean;
}

const SAMPLE: Row[] = [
  {
    id: 'AP2026040007',
    source: 'Vendor Portal',
    vendor: 'Laguna Logistics Corp.',
    waybillCount: 4,
    currency: 'PHP',
    totalAmount: 47200,
    collectedAmount: 0,
    status: 'Awaiting Confirmation',
    createdAt: '2026-04-25',
    createdBy: 'Laguna Logistics (VP)',
  },
  {
    id: 'AP2026040003',
    source: 'Vendor Portal',
    vendor: 'Bangkok Express Logistics',
    waybillCount: 6,
    currency: 'THB',
    totalAmount: 156000,
    collectedAmount: 0,
    status: 'Awaiting Comparison',
    createdAt: '2026-04-18',
    createdBy: 'Bangkok Express (VP)',
    hasMismatch: false,
  },
  {
    id: 'AP2026040004',
    source: 'Vendor Portal',
    vendor: 'Manila Freight Co.',
    waybillCount: 3,
    currency: 'PHP',
    totalAmount: 20020,
    collectedAmount: 0,
    status: 'Awaiting Rebill',
    createdAt: '2026-04-20',
    createdBy: 'Manila Freight (VP)',
    hasMismatch: true,
  },
  {
    id: 'AP2026040001',
    source: 'Internal',
    vendor: 'JG Summit Freight',
    waybillCount: 5,
    currency: 'PHP',
    totalAmount: 53200,
    collectedAmount: 53200,
    status: 'Paid',
    createdAt: '2026-04-14',
    createdBy: 'Zhang Jialei',
  },
  {
    id: 'AP2026040005',
    source: 'Internal',
    vendor: 'SMC Logistics',
    waybillCount: 7,
    currency: 'PHP',
    totalAmount: 89000,
    collectedAmount: 45000,
    status: 'Partially Payment',
    createdAt: '2026-04-22',
    createdBy: 'Zhang Jialei',
  },
  {
    id: 'AP2026040002',
    source: 'Vendor Portal',
    vendor: 'Cebu Trans Lines',
    waybillCount: 2,
    currency: 'PHP',
    totalAmount: 38500,
    collectedAmount: 0,
    status: 'Awaiting Comparison',
    createdAt: '2026-04-23',
    createdBy: 'Cebu Trans (VP)',
    hasMismatch: true,
  },
  {
    id: 'AP2026040006',
    source: 'Internal',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    waybillCount: 4,
    currency: 'PHP',
    totalAmount: 44500,
    collectedAmount: 0,
    status: 'Pending Payment',
    createdAt: '2026-04-15',
    createdBy: 'Zhang Jialei',
  },
];

const STATUS_STYLE: Record<Status, React.CSSProperties> = {
  'Awaiting Confirmation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Awaiting Comparison':   { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Pending Payment':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':     { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                  { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Awaiting Rebill':       { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

const BASE_BADGE: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' };

const SOURCE_STYLE: Record<Source, React.CSSProperties> = {
  'Vendor Portal': { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  'Internal':      { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

function fmt(n: number, cur: string) {
  return `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

const STATUS_OPTIONS: Status[] = [
  'Awaiting Confirmation', 'Awaiting Comparison', 'Pending Payment', 'Partially Payment', 'Paid', 'Awaiting Rebill',
];

function ApStatementList({ onCreateNew, onViewDetail }: Props) {
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [keyword, setKeyword] = useState('');

  const filtered = SAMPLE.filter(r => {
    if (filterSource && r.source !== filterSource) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (keyword && !r.id.toLowerCase().includes(keyword.toLowerCase()) &&
      !r.vendor.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  const awaitingConfirmation = SAMPLE.filter(r => r.status === 'Awaiting Confirmation').length;
  const awaitingComparison = SAMPLE.filter(r => r.status === 'Awaiting Comparison').length;
  const needAction = awaitingConfirmation + awaitingComparison + SAMPLE.filter(r => r.status === 'Awaiting Rebill').length;
  const vpCount = SAMPLE.filter(r => r.source === 'Vendor Portal').length;

  return (
    <>
      <div className="tms-kpi-row">
        <div className="tms-kpi">
          <div className="tms-kpi-label">Total Statements</div>
          <div className="tms-kpi-value">{SAMPLE.length}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">Needs Action</div>
          <div className="tms-kpi-value orange">{needAction}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">Awaiting Confirmation</div>
          <div className="tms-kpi-value blue">{awaitingConfirmation}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">Awaiting Comparison</div>
          <div className="tms-kpi-value blue">{awaitingComparison}</div>
        </div>
        <div className="tms-kpi">
          <div className="tms-kpi-label">From Vendor Portal</div>
          <div className="tms-kpi-value">{vpCount}</div>
        </div>
      </div>

      <div className="tms-card">
        <div className="tms-card-title">
          <div>
            <div className="section-title">AP Statement</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Vendor statements submitted from Vendor Portal sync here automatically. TMS can also create internally.
            </div>
          </div>
          <button className="btn-primary" onClick={onCreateNew}>+ Create Statement</button>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 12 }}>
          <span>ⓘ</span>
          <span>
            Statements from <strong>Vendor Portal</strong> enter with status{' '}
            <span style={{ ...BASE_BADGE, ...STATUS_STYLE['Awaiting Confirmation'], display: 'inline-block', margin: '0 4px' }}>Awaiting Confirmation</span>.
            Click to enter the blind-comparison view for Match / Mismatch processing.
          </span>
        </div>

        <div className="filter-row">
          <input
            className="filter-input"
            placeholder="Statement No. / Vendor"
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
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-default" onClick={() => { setKeyword(''); setFilterSource(''); setFilterStatus(''); }}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Statement No.</th>
              <th>Source</th>
              <th>Vendor</th>
              <th style={{ textAlign: 'center' }}>Waybills</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Collected</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Created By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>
                  <strong style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => onViewDetail(r.id)}>{r.id}</strong>
                  {r.hasMismatch && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#d48806', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, padding: '1px 5px' }}>
                      ⚠ Mismatch
                    </span>
                  )}
                </td>
                <td><span style={SOURCE_STYLE[r.source]}>{r.source}</span></td>
                <td style={{ fontSize: 13 }}>{r.vendor}</td>
                <td style={{ textAlign: 'center', fontSize: 13 }}>{r.waybillCount}</td>
                <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{fmt(r.totalAmount, r.currency)}</td>
                <td style={{ textAlign: 'right', fontSize: 13, color: r.collectedAmount > 0 ? '#389e0d' : '#bbb' }}>
                  {r.collectedAmount > 0 ? fmt(r.collectedAmount, r.currency) : '—'}
                </td>
                <td>
                  <span style={{ ...BASE_BADGE, ...STATUS_STYLE[r.status] }}>{r.status}</span>
                </td>
                <td style={{ fontSize: 12, color: '#666' }}>{r.createdAt}</td>
                <td style={{ fontSize: 12, color: '#666' }}>{r.createdBy}</td>
                <td>
                  <button className="btn-link" onClick={() => onViewDetail(r.id)}>
                    {r.status === 'Awaiting Confirmation' || r.status === 'Awaiting Comparison' ? 'Compare' : 'Details'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="empty">No statements found.</td></tr>
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

export default ApStatementList;
