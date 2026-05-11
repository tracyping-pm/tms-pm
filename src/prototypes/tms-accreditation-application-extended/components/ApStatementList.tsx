import React, { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ApStatementStatus =
  | 'Under Payment Preparation'
  | 'Awaiting Comparison'
  | 'Awaiting Rebill'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Written Off'
  | 'Canceled';

type Source = 'Vendor Portal' | 'Intelal';
type StatementType = 'Standard' | 'Standalone';
type SettlementItem =
  | 'Basic Amount'
  | 'Vendor Additional Charge'
  | 'Vendor Exception Fee'
  | 'Reimbursement Expense';

interface Row {
  no: string;
  source: Source;
  vendorName: string;
  settlementItems: SettlementItem[];
  totalAmountPayable: number;
  currency: string;
  statementType: StatementType;
  waybillCount: number;
  invoiceNo: string;
  status: ApStatementStatus;
  createdAt: string;
}

interface Props {
  onCreateNew: () => void;
  onViewDetail: (no: string, status: ApStatementStatus) => void;
  onEdit?: (no: string, status: ApStatementStatus) => void;
}

// ─── Sample Data ───────────────────────────────────────────────────────────────

const SAMPLE: Row[] = [
  {
    no: 'APVS2604001',
    source: 'Vendor Portal',
    vendorName: 'Manila Freight Co.',
    settlementItems: [],
    totalAmountPayable: 52800,
    currency: 'PHP',
    statementType: 'Standalone',
    waybillCount: 0,
    invoiceNo: '—',
    status: 'Under Payment Preparation',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'APVS2604002',
    source: 'Vendor Portal',
    vendorName: 'Manila Freight Co.',
    settlementItems: ['Vendor Exception Fee', 'Vendor Additional Charge', 'Reimbursement Expense'],
    totalAmountPayable: 52800,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 3,
    invoiceNo: '—',
    status: 'Awaiting Comparison',
    createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'APVS2604003',
    source: 'Vendor Portal',
    vendorName: 'Manila Freight Co.',
    settlementItems: ['Basic Amount'],
    totalAmountPayable: 38500,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 3,
    invoiceNo: '—',
    status: 'Awaiting Rebill',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'APVS2604004',
    source: 'Intelal',
    vendorName: 'Laguna Logistics Corp.',
    settlementItems: ['Basic Amount'],
    totalAmountPayable: 52800,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 3,
    invoiceNo: 'INV-2026-00185',
    status: 'Pending Payment',
    createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'APVS2604005',
    source: 'Intelal',
    vendorName: 'Laguna Logistics Corp.',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    totalAmountPayable: 99000,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 7,
    invoiceNo: 'INV-2026-00179',
    status: 'Partially Payment',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'APVS2603001',
    source: 'Vendor Portal',
    vendorName: 'Bangkok Express Logistics',
    settlementItems: ['Basic Amount', 'Vendor Exception Fee'],
    totalAmountPayable: 48000,
    currency: 'PHP',
    statementType: 'Standalone',
    waybillCount: 3,
    invoiceNo: 'INV-2026-00157',
    status: 'Paid',
    createdAt: '2026/3/28 14:10:00',
  },
  {
    no: 'APVS2603002',
    source: 'Intelal',
    vendorName: 'SMC Logistics',
    settlementItems: ['Basic Amount'],
    totalAmountPayable: 32000,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 2,
    invoiceNo: 'INV-2026-00143',
    status: 'Written Off',
    createdAt: '2026/3/15 10:00:00',
  },
  {
    no: 'APVS2603003',
    source: 'Intelal',
    vendorName: 'Cebu Trans Lines',
    settlementItems: ['Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    totalAmountPayable: 15500,
    currency: 'PHP',
    statementType: 'Standard',
    waybillCount: 1,
    invoiceNo: '—',
    status: 'Canceled',
    createdAt: '2026/3/10 16:45:00',
  },
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ApStatementStatus, React.CSSProperties> = {
  'Under Payment Preparation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Awaiting Comparison':       { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Awaiting Rebill':           { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Pending Payment':           { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':         { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                      { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Written Off':               { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'Canceled':                  { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

const SOURCE_STYLE: Record<Source, React.CSSProperties> = {
  'Vendor Portal': { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Intelal':       { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const BASE_BADGE: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' };

const STATUS_OPTIONS: ApStatementStatus[] = [
  'Under Payment Preparation', 'Awaiting Comparison', 'Awaiting Rebill',
  'Pending Payment', 'Partially Payment', 'Paid', 'Written Off', 'Canceled',
];

const SETTLEMENT_ITEM_OPTIONS: SettlementItem[] = [
  'Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee', 'Reimbursement Expense',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function isEditable(status: ApStatementStatus) {
  return status === 'Under Payment Preparation' || status === 'Awaiting Rebill';
}

// ─── Component ─────────────────────────────────────────────────────────────────

function ApStatementList({ onCreateNew, onViewDetail, onEdit }: Props) {
  const [filterNo, setFilterNo] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleReset = () => {
    setFilterNo('');
    setFilterVendor('');
    setFilterSource('');
    setFilterType('');
    setFilterStatus('');
  };

  const filtered = SAMPLE.filter(r => {
    if (filterNo && !r.no.toLowerCase().includes(filterNo.toLowerCase())) return false;
    if (filterVendor && !r.vendorName.toLowerCase().includes(filterVendor.toLowerCase())) return false;
    if (filterSource && r.source !== filterSource) return false;
    if (filterType && r.statementType !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="tms-card">
      <div className="tms-card-title">
        <div className="section-title">AP Statement List</div>
        <button className="btn-primary" onClick={onCreateNew}>+ Create Statement</button>
      </div>

      {/* Filter bar */}
      <div className="filter-row" style={{ flexWrap: 'wrap', gap: '8px 12px', marginBottom: 16 }}>
        <input
          className="filter-input"
          placeholder="Statement Number"
          value={filterNo}
          onChange={e => setFilterNo(e.target.value)}
          style={{ width: 160 }}
        />
        <input
          className="filter-input"
          placeholder="Vendor Name"
          value={filterVendor}
          onChange={e => setFilterVendor(e.target.value)}
          style={{ width: 160 }}
        />
        <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">Source: All</option>
          <option value="Vendor Portal">Vendor Portal</option>
          <option value="Intelal">Intelal</option>
        </select>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Statement Type: All</option>
          <option value="Standard">Standard</option>
          <option value="Standalone">Standalone</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Statement Status: All</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-default" onClick={handleReset}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: 1200 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 110 }}>Statement No.</th>
              <th style={{ minWidth: 96 }}>Source</th>
              <th style={{ minWidth: 140 }}>Vendor Name</th>
              <th style={{ minWidth: 200 }}>Settlement Item</th>
              <th style={{ textAlign: 'right', minWidth: 140 }}>Total Amount Payable</th>
              <th style={{ minWidth: 110 }}>Statement Type</th>
              <th style={{ textAlign: 'center', minWidth: 72 }}>Waybills</th>
              <th style={{ minWidth: 128 }}>Invoice No.</th>
              <th style={{ minWidth: 160 }}>Status</th>
              <th style={{ minWidth: 148 }}>Creation Time</th>
              <th style={{ minWidth: 100 }}>Operation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.no}>
                {/* Statement No. */}
                <td>
                  <strong
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => onViewDetail(r.no, r.status)}
                  >
                    {r.no}
                  </strong>
                </td>

                {/* Source */}
                <td><span style={SOURCE_STYLE[r.source]}>{r.source}</span></td>

                {/* Vendor Name */}
                <td style={{ fontSize: 13 }}>{r.vendorName}</td>

                {/* Settlement Item */}
                <td style={{ fontSize: 12, color: r.settlementItems.length === 0 ? '#bbb' : '#333', lineHeight: 1.6 }}>
                  {r.settlementItems.length === 0
                    ? '—'
                    : r.settlementItems.join(', ')
                  }
                </td>

                {/* Total Amount Payable */}
                <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>
                  {r.currency} {fmt(r.totalAmountPayable)}
                </td>

                {/* Statement Type */}
                <td>
                  <span style={{
                    borderRadius: 4, padding: '2px 8px', fontSize: 12,
                    ...(r.statementType === 'Standard'
                      ? { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3' }
                      : { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' }
                    ),
                  }}>
                    {r.statementType}
                  </span>
                </td>

                {/* Waybills */}
                <td style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
                  {r.waybillCount > 0 ? r.waybillCount : <span style={{ color: '#bbb' }}>—</span>}
                </td>

                {/* Invoice No. */}
                <td style={{ fontSize: 13, color: r.invoiceNo === '—' ? '#bbb' : '#333' }}>
                  {r.invoiceNo}
                </td>

                {/* Status */}
                <td>
                  <span style={{ ...BASE_BADGE, ...STATUS_STYLE[r.status] }}>{r.status}</span>
                </td>

                {/* Creation Time */}
                <td style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{r.createdAt}</td>

                {/* Operation */}
                <td style={{ whiteSpace: 'nowrap' }}>
                  {isEditable(r.status) ? (
                    <span style={{ display: 'inline-flex', gap: 8 }}>
                      <button className="btn-link" onClick={() => onViewDetail(r.no, r.status)}>Details</button>
                      <button className="btn-link" onClick={() => onEdit ? onEdit(r.no, r.status) : onViewDetail(r.no, r.status)}>Edit</button>
                    </span>
                  ) : (
                    <button className="btn-link" onClick={() => onViewDetail(r.no, r.status)}>Details</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="empty" style={{ textAlign: 'center', padding: 32 }}>
                  No statements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 12, color: '#666' }}>458 Statement</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#999', marginRight: 4 }}>Next</span>
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <span style={{ fontSize: 12, color: '#999', padding: '0 4px' }}>...</span>
          <button className="page-btn">&gt;</button>
          <button className="page-btn">Last</button>
        </div>
      </div>
    </div>
  );
}

export default ApStatementList;
export type { Row as ApStatementRow, SettlementItem };
