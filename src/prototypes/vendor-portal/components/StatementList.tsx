import React, { useState } from 'react';

interface Props {
  onOpenDetail: (no: string, status: Status) => void;
  onEdit: (no: string, status: Status) => void;
  statusOverrides?: Record<string, Status>;
}

export type Status =
  | 'Draft'
  | 'Awaiting Comparison'
  | 'Awaiting Re-bill'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Written Off'
  | 'Canceled';

type Source = 'Self-Created' | 'TMS-Synced';
type StatementType = 'Standard' | 'Standalone';

interface Row {
  no: string;
  source: Source;
  totalSubmittedAmount: number;
  currency: string;
  statementType: StatementType;
  waybillCount: number;
  invoiceNo: string;
  status: Status;
  createdAt: string;
  rejectReason?: string;
}

const SAMPLE: Row[] = [
  {
    no: 'VS2604008',
    source: 'Self-Created',
    totalSubmittedAmount: 0,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 2,
    invoiceNo: '—',
    status: 'Draft',
    createdAt: '2026-04-28 09:20',
  },
  {
    no: 'VS2604001',
    source: 'TMS-Synced',
    totalSubmittedAmount: 52800,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 3,
    invoiceNo: 'INV-2026-00201',
    status: 'Awaiting Comparison',
    createdAt: '2026-04-20 10:15',
  },
  {
    no: 'VS2604002',
    source: 'Self-Created',
    totalSubmittedAmount: 38500,
    currency: 'PHP',
    statementType: 'Standalone',
    waybillCount: 2,
    invoiceNo: 'INV-2026-00198',
    status: 'Awaiting Re-bill',
    createdAt: '2026-04-18 14:30',
    rejectReason:
      'Basic Amount for WB2604011 exceeds contracted rate. Please correct and resubmit.',
  },
  {
    no: 'VS2604003',
    source: 'TMS-Synced',
    totalSubmittedAmount: 68800,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 4,
    invoiceNo: 'INV-2026-00185',
    status: 'Pending Payment',
    createdAt: '2026-04-13 11:45',
  },
  {
    no: 'VS2604004',
    source: 'TMS-Synced',
    totalSubmittedAmount: 99000,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 7,
    invoiceNo: 'INV-2026-00179',
    status: 'Partially Payment',
    createdAt: '2026-04-10 08:30',
  },
  {
    no: 'VS2603001',
    source: 'Self-Created',
    totalSubmittedAmount: 48000,
    currency: 'PHP',
    statementType: 'Standalone',
    waybillCount: 3,
    invoiceNo: 'INV-2026-00157',
    status: 'Paid',
    createdAt: '2026-03-28 14:10',
  },
  {
    no: 'VS2603002',
    source: 'TMS-Synced',
    totalSubmittedAmount: 32000,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 2,
    invoiceNo: 'INV-2026-00143',
    status: 'Written Off',
    createdAt: '2026-03-15 10:00',
  },
  {
    no: 'VS2603003',
    source: 'Self-Created',
    totalSubmittedAmount: 15500,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 1,
    invoiceNo: '—',
    status: 'Canceled',
    createdAt: '2026-03-10 16:45',
  },
];

const STATUS_STYLE: Record<Status, React.CSSProperties> = {
  'Draft':                { background: '#f5f5f5',  color: '#595959', border: '1px solid #d9d9d9' },
  'Awaiting Comparison':  { background: '#f0f5ff',  color: '#2f54eb', border: '1px solid #adc6ff' },
  'Awaiting Re-bill':     { background: '#fff1f0',  color: '#cf1322', border: '1px solid #ffa39e' },
  'Pending Payment':      { background: '#e6f4ff',  color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':    { background: '#fffbe6',  color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                 { background: '#f6ffed',  color: '#389e0d', border: '1px solid #b7eb8f' },
  'Written Off':          { background: '#f5f5f5',  color: '#595959', border: '1px solid #d9d9d9' },
  'Canceled':             { background: '#fff1f0',  color: '#cf1322', border: '1px solid #ffa39e' },
};

const BASE_BADGE: React.CSSProperties = {
  borderRadius: 4,
  padding: '2px 8px',
  fontSize: 12,
  whiteSpace: 'nowrap',
  display: 'inline-block',
};

const SOURCE_STYLE: Record<Source, React.CSSProperties> = {
  'Self-Created': { background: '#f5f5f5',  color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  'TMS-Synced':   { background: '#f0f5ff',  color: '#2f54eb', border: '1px solid #adc6ff', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const TYPE_STYLE: Record<StatementType, React.CSSProperties> = {
  'Standard':   { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  'Standalone': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const STATUS_OPTIONS: Status[] = [
  'Draft', 'Awaiting Comparison', 'Awaiting Re-bill', 'Pending Payment',
  'Partially Payment', 'Paid', 'Written Off', 'Canceled',
];

function StatementList({ onOpenDetail, onEdit, statusOverrides = {} }: Props) {
  const [filterStatementNo, setFilterStatementNo] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = SAMPLE.filter(r => {
    if (filterStatementNo && !r.no.toLowerCase().includes(filterStatementNo.toLowerCase())) return false;
    if (filterSource && r.source !== filterSource) return false;
    if (filterInvoiceNo && !r.invoiceNo.toLowerCase().includes(filterInvoiceNo.toLowerCase())) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterType && r.statementType !== filterType) return false;
    return true;
  });

  function handleReset() {
    setFilterStatementNo('');
    setFilterSource('');
    setFilterInvoiceNo('');
    setFilterStatus('');
    setFilterType('');
  }

  return (
    <div className="vp-card">
      <div className="vp-card-title">
        <div className="section-title">Statement List</div>
      </div>

      {/* Filter bar */}
      <div className="filter-row" style={{ flexWrap: 'wrap', gap: '8px 12px', marginBottom: 16 }}>
        <input
          className="filter-input"
          placeholder="Statement Number"
          value={filterStatementNo}
          onChange={e => setFilterStatementNo(e.target.value)}
          style={{ width: 160 }}
        />
        <select
          className="filter-select"
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
        >
          <option value="">Source: All</option>
          <option value="Self-Created">Self-Created</option>
          <option value="TMS-Synced">TMS-Synced</option>
        </select>
        <input
          className="filter-input"
          placeholder="Invoice Number"
          value={filterInvoiceNo}
          onChange={e => setFilterInvoiceNo(e.target.value)}
          style={{ width: 160 }}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Statement Status: All</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">Statement Type: All</option>
          <option value="Standard">Standard</option>
          <option value="Standalone">Standalone</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-default" onClick={handleReset}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Statement No.</th>
            <th>Source</th>
            <th style={{ textAlign: 'right' }}>Total Submitted Amount</th>
            <th>Statement Type</th>
            <th style={{ textAlign: 'center' }}>Waybills</th>
            <th>Invoice No.</th>
            <th>Status</th>
            <th>Creation Time</th>
            <th>Operation</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => {
            const effectiveStatus: Status = statusOverrides[r.no] ?? r.status;
            const isDraftOrRebill = effectiveStatus === 'Draft' || effectiveStatus === 'Awaiting Re-bill';
            return (
              <tr key={r.no}>
                <td>
                  <strong
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => onOpenDetail(r.no, effectiveStatus)}
                  >
                    {r.no}
                  </strong>
                </td>
                <td><span style={SOURCE_STYLE[r.source]}>{r.source}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>
                  {r.totalSubmittedAmount > 0
                    ? `${r.currency} ${r.totalSubmittedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : <span style={{ color: '#bbb' }}>—</span>
                  }
                </td>
                <td><span style={TYPE_STYLE[r.statementType]}>{r.statementType}</span></td>
                <td style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>{r.waybillCount}</td>
                <td style={{ fontSize: 13, color: r.invoiceNo === '—' ? '#bbb' : '#333' }}>{r.invoiceNo}</td>
                <td>
                  <span style={{ ...BASE_BADGE, ...STATUS_STYLE[effectiveStatus] }}>{effectiveStatus}</span>
                  {effectiveStatus === 'Awaiting Re-bill' && r.rejectReason && (
                    <div style={{ fontSize: 11, color: '#cf1322', marginTop: 3, maxWidth: 220 }} title={r.rejectReason}>
                      {r.rejectReason.length > 55 ? r.rejectReason.slice(0, 55) + '…' : r.rejectReason}
                    </div>
                  )}
                </td>
                <td style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{r.createdAt}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {isDraftOrRebill ? (
                    <span style={{ display: 'inline-flex', gap: 8 }}>
                      <button className="btn-link" style={{ color: '#1677ff' }} onClick={() => onOpenDetail(r.no, effectiveStatus)}>Submit</button>
                      <button className="btn-link" onClick={() => onOpenDetail(r.no, effectiveStatus)}>Edit</button>
                    </span>
                  ) : (
                    <button className="btn-link" onClick={() => onOpenDetail(r.no, effectiveStatus)}>Details</button>
                  )}
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} className="empty">No statements found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#666' }}>458 Statement</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span style={{ fontSize: 12, color: '#999', padding: '0 4px' }}>...</span>
          <button className="page-btn">&gt;</button>
          <button className="page-btn">Last</button>
        </div>
      </div>
    </div>
  );
}

export default StatementList;
export type { Row as StatementRow };
