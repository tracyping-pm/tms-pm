import React, { useState } from 'react';

interface StatementListProps {
  onAddStatement: () => void;
  onViewDetail: (mode: 'auto' | 'manual') => void;
  onExport: () => void;
}

interface InvoiceRow {
  no: string;
  type: string;
  date: string;
  amount: number;
  currency: string;
  taxAmount: number;
  totalAmount: number;
  status: string;
}

// V4 §3.1 — 状态机统一为五态
type StatementStatus =
  | 'Awaiting Comparison'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Awaiting Rebill';

// V4 §3.1 — 数据源融合：TMS 自建 vs 供应商提交
type StatementSource = 'Internal' | 'Vendor Portal';

interface StatementRow {
  id: string;
  statementType: 'Standard' | 'Standalone';
  status: StatementStatus;
  source: StatementSource;
  customer: string;
  settlementItems: string[];
  allocationMode: 'auto' | 'manual' | '-';
  statementTaxMark: 'Tax-inclusive' | 'Tax-exclusive';
  currency: string;
  totalAmountReceivable: number;
  totalInvoiceAmount: number;
  collectedAmount: number;
  createdDate: string;
  createdBy: string;
  invoices: InvoiceRow[];
  /** V4 §3.1 — 是否含 Mismatch / Miss 项（列表中徽标提示 FA 优先处理） */
  hasMismatch?: boolean;
}

const SAMPLE_DATA: StatementRow[] = [
  {
    id: 'AR2024010001',
    statementType: 'Standard',
    status: 'Pending Payment',
    source: 'Internal',
    customer: 'Customer A - ABC Logistics',
    settlementItems: ['Customer Basic Amount', 'Customer Additional Charge'],
    allocationMode: 'manual',
    statementTaxMark: 'Tax-inclusive',
    currency: 'USD',
    totalAmountReceivable: 44500.00,
    totalInvoiceAmount: 47170.00,
    collectedAmount: 0,
    createdDate: '2024-01-15',
    createdBy: 'Admin',
    invoices: [
      { no: 'INV2024011001', type: 'Freight Invoice', date: '2024-01-10', amount: 12500.00, currency: 'USD', taxAmount: 750.00, totalAmount: 13250.00, status: 'Issued' },
      { no: 'INV2024011002', type: 'Freight Invoice', date: '2024-01-12', amount: 32000.00, currency: 'USD', taxAmount: 1920.00, totalAmount: 33920.00, status: 'Draft' },
    ],
  },
  {
    id: 'AR2024010002',
    statementType: 'Standalone',
    status: 'Paid',
    source: 'Internal',
    customer: 'Customer B - XYZ Trading',
    settlementItems: ['Customer Exception Fee', 'Reimbursement Expense'],
    allocationMode: 'auto',
    statementTaxMark: 'Tax-exclusive',
    currency: 'USD',
    totalAmountReceivable: 23500.00,
    totalInvoiceAmount: 24910.00,
    collectedAmount: 23500.00,
    createdDate: '2024-01-10',
    createdBy: 'Admin',
    invoices: [
      { no: 'INV2024012001', type: 'Freight Invoice', date: '2024-01-08', amount: 12000.00, currency: 'USD', taxAmount: 720.00, totalAmount: 12720.00, status: 'Collected' },
      { no: 'INV2024012002', type: 'Freight Invoice', date: '2024-01-09', amount: 11500.00, currency: 'USD', taxAmount: 690.00, totalAmount: 12190.00, status: 'Collected' },
    ],
  },
  {
    id: 'AR2024010003',
    statementType: 'Standard',
    status: 'Awaiting Comparison',
    source: 'Vendor Portal',
    customer: 'Bangkok Express Logistics',
    settlementItems: ['Vendor Basic Amount', 'Vendor Additional Charge'],
    allocationMode: '-',
    statementTaxMark: 'Tax-exclusive',
    currency: 'THB',
    totalAmountReceivable: 156000.00,
    totalInvoiceAmount: 156000.00,
    collectedAmount: 0.00,
    createdDate: '2024-01-18',
    createdBy: 'Bangkok Express (VP)',
    invoices: [
      { no: 'INV-2026-00201', type: 'Vendor Invoice', date: '2024-01-18', amount: 156000.00, currency: 'THB', taxAmount: 0, totalAmount: 156000.00, status: 'Issued' },
    ],
    hasMismatch: false,
  },
  {
    id: 'AR2024010004',
    statementType: 'Standard',
    status: 'Awaiting Rebill',
    source: 'Vendor Portal',
    customer: 'Manila Freight Co.',
    settlementItems: ['Vendor Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee'],
    allocationMode: '-',
    statementTaxMark: 'Tax-inclusive',
    currency: 'PHP',
    totalAmountReceivable: 20020.00,
    totalInvoiceAmount: 21221.20,
    collectedAmount: 0,
    createdDate: '2024-01-20',
    createdBy: 'Manila Freight (VP)',
    invoices: [
      { no: 'INV2024014001', type: 'Vendor Invoice', date: '2024-01-18', amount: 18200.00, currency: 'PHP', taxAmount: 1092.00, totalAmount: 19292.00, status: 'Issued' },
      { no: 'INV2024014002', type: 'Vendor Invoice', date: '2024-01-20', amount: 1820.00, currency: 'PHP', taxAmount: 109.20, totalAmount: 1929.20, status: 'Draft' },
    ],
    hasMismatch: true,
  },
  {
    id: 'AR2024010005',
    statementType: 'Standard',
    status: 'Partially Payment',
    source: 'Internal',
    customer: 'Customer D - Pacific Shipping',
    settlementItems: ['Customer Additional Charge', 'Reimbursement Expense'],
    allocationMode: 'auto',
    statementTaxMark: 'Tax-exclusive',
    currency: 'USD',
    totalAmountReceivable: 89000.00,
    totalInvoiceAmount: 89000.00,
    collectedAmount: 45000.00,
    createdDate: '2024-01-22',
    createdBy: 'Manager',
    invoices: [
      { no: 'INV2024015001', type: 'Freight Invoice', date: '2024-01-20', amount: 44000.00, currency: 'USD', taxAmount: 0, totalAmount: 44000.00, status: 'Collected' },
      { no: 'INV2024015002', type: 'Freight Invoice', date: '2024-01-21', amount: 45000.00, currency: 'USD', taxAmount: 0, totalAmount: 45000.00, status: 'Issued' },
    ],
  },
  {
    id: 'AR2024010006',
    statementType: 'Standard',
    status: 'Awaiting Comparison',
    source: 'Vendor Portal',
    customer: 'Cebu Trans Lines',
    settlementItems: ['Vendor Basic Amount'],
    allocationMode: '-',
    statementTaxMark: 'Tax-exclusive',
    currency: 'PHP',
    totalAmountReceivable: 38500.00,
    totalInvoiceAmount: 38500.00,
    collectedAmount: 0,
    createdDate: '2024-01-23',
    createdBy: 'Cebu Trans (VP)',
    invoices: [
      { no: 'INV-2026-00203', type: 'Vendor Invoice', date: '2024-01-23', amount: 38500.00, currency: 'PHP', taxAmount: 0, totalAmount: 38500.00, status: 'Issued' },
    ],
    hasMismatch: true,
  },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  CNY: '¥',
};

function formatAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency} ${formatted}`;
}

// V4 §3.1 — 五态徽标样式
function getStatusBadgeStyle(status: StatementStatus): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
  switch (status) {
    case 'Awaiting Comparison':
      return { ...base, background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' };
    case 'Pending Payment':
      return { ...base, background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' };
    case 'Partially Payment':
      return { ...base, background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' };
    case 'Paid':
      return { ...base, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' };
    case 'Awaiting Rebill':
      return { ...base, background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' };
  }
}

// V4 §3.1 — 数据源徽标
function getSourceBadgeStyle(source: StatementSource): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
  if (source === 'Vendor Portal') {
    return { ...base, background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3' };
  }
  return { ...base, background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' };
}

const STATUS_OPTIONS: StatementStatus[] = ['Awaiting Comparison', 'Pending Payment', 'Partially Payment', 'Paid', 'Awaiting Rebill'];
const SOURCE_OPTIONS: StatementSource[] = ['Internal', 'Vendor Portal'];

function getInvoiceStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'Issued':
      return { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', borderRadius: 4, padding: '2px 8px', fontSize: 12 };
    case 'Collected':
      return { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4, padding: '2px 8px', fontSize: 12 };
    case 'Draft':
      return { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 };
    case 'Voided':
      return { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: 4, padding: '2px 8px', fontSize: 12 };
    default:
      return { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 };
  }
}

function StatementList({ onAddStatement, onViewDetail }: StatementListProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filterStatementNo, setFilterStatementNo] = useState('');
  const [filterStatementType, setFilterStatementType] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatementStatus | ''>('');
  const [filterSource, setFilterSource] = useState<StatementSource | ''>(''); // V4 §3.1
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [filterSettlementItems, setFilterSettlementItems] = useState('');
  const [filterAllocationMode, setFilterAllocationMode] = useState('');
  const [filterStatementTaxMark, setFilterStatementTaxMark] = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterWaybillNumber, setFilterWaybillNumber] = useState('');
  const [filterCreationDate, setFilterCreationDate] = useState('');

  // 应用过滤
  const filteredData = SAMPLE_DATA.filter(row => {
    if (filterStatementNo && !row.id.toLowerCase().includes(filterStatementNo.toLowerCase())) return false;
    if (filterStatementType && row.statementType !== filterStatementType) return false;
    if (filterStatus && row.status !== filterStatus) return false;
    if (filterSource && row.source !== filterSource) return false;
    if (filterCustomerName && !row.customer.toLowerCase().includes(filterCustomerName.toLowerCase())) return false;
    return true;
  });
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleReset = () => {
    setFilterStatementNo('');
    setFilterStatementType('');
    setFilterStatus('');
    setFilterSource('');
    setFilterCustomerName('');
    setFilterSettlementItems('');
    setFilterAllocationMode('');
    setFilterStatementTaxMark('');
    setFilterInvoiceNo('');
    setFilterWaybillNumber('');
    setFilterCreationDate('');
  };

  const inputStyle: React.CSSProperties = {
    height: 30,
    padding: '0 8px',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    fontSize: 13,
    color: '#333',
    outline: 'none',
    minWidth: 130,
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 4,
          padding: 16,
        }}
      >
        {/* Page title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="section-title" style={{ margin: 0 }}>AP Statement List</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              统一展示 TMS 自建 (Internal) 与供应商提交 (Vendor Portal) 的所有对账单 · V4 §3.1
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={onAddStatement}
            style={{
              background: '#00b96b',
              border: 'none',
              color: '#fff',
              borderRadius: 4,
              padding: '5px 14px',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            + Create Statement
          </button>
        </div>

        {/* Filter bar - single row */}
        <div
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            padding: '12px 12px 8px 12px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              style={inputStyle}
              placeholder="Statement No."
              value={filterStatementNo}
              onChange={(e) => setFilterStatementNo(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Statement Type"
              value={filterStatementType}
              onChange={(e) => setFilterStatementType(e.target.value)}
            />
            {/* V4 §3.1 — Status 改为下拉，五态枚举 */}
            <select
              style={inputStyle}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatementStatus | '')}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {/* V4 §3.1 — Source 过滤新增 */}
            <select
              style={inputStyle}
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as StatementSource | '')}
            >
              <option value="">All Sources</option>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              style={inputStyle}
              placeholder="Customer / Vendor"
              value={filterCustomerName}
              onChange={(e) => setFilterCustomerName(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Settlement Items"
              value={filterSettlementItems}
              onChange={(e) => setFilterSettlementItems(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Allocation Mode"
              value={filterAllocationMode}
              onChange={(e) => setFilterAllocationMode(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Statement Tax Mark"
              value={filterStatementTaxMark}
              onChange={(e) => setFilterStatementTaxMark(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Invoice No."
              value={filterInvoiceNo}
              onChange={(e) => setFilterInvoiceNo(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Waybill Number"
              value={filterWaybillNumber}
              onChange={(e) => setFilterWaybillNumber(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Creation Date"
              value={filterCreationDate}
              onChange={(e) => setFilterCreationDate(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{
                background: '#00b96b',
                border: 'none',
                color: '#fff',
                borderRadius: 4,
                padding: '5px 14px',
                fontSize: 13,
                cursor: 'pointer',
                height: 30,
              }}
            >
              Search
            </button>
            <button
              className="btn-default"
              onClick={handleReset}
              style={{
                background: '#fff',
                border: '1px solid #d9d9d9',
                color: '#333',
                borderRadius: 4,
                padding: '5px 14px',
                fontSize: 13,
                cursor: 'pointer',
                height: 30,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Data table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 1400 }}>
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Statement No.</th>
                <th>Source</th>
                <th>Statement Type</th>
                <th>Status</th>
                <th>Customer / Vendor</th>
                <th>Settlement Items</th>
                <th>Allocation Mode</th>
                <th>Statement Tax Mark</th>
                <th style={{ textAlign: 'right' }}>Total Amount Receivable</th>
                <th style={{ textAlign: 'right' }}>Total Invoice Amount</th>
                <th style={{ textAlign: 'right' }}>Collected Amount</th>
                <th>Created Date</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => {
                const isExpanded = expandedRows.has(row.id);
                const hasInvoices = row.invoices.length > 0;
                const allocationModeLabel =
                  row.allocationMode === 'auto' ? 'Auto' :
                  row.allocationMode === 'manual' ? 'Manual' : '-';
                const showWarn = row.hasMismatch || row.status === 'Awaiting Rebill';

                return (
                  <React.Fragment key={row.id}>
                    {/* Main row */}
                    <tr>
                      {/* Expand toggle */}
                      <td style={{ textAlign: 'center', width: 32 }}>
                        <button
                          onClick={() => hasInvoices && toggleRow(row.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #d9d9d9',
                            borderRadius: 3,
                            cursor: hasInvoices ? 'pointer' : 'default',
                            padding: '0 4px',
                            fontSize: 11,
                            color: hasInvoices ? '#555' : '#bbb',
                            lineHeight: '18px',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      </td>

                      <td>
                        <span
                          className="link-blue"
                          style={{ cursor: 'pointer', color: '#1677ff' }}
                          onClick={() => onViewDetail(row.allocationMode === 'auto' ? 'auto' : 'manual')}
                        >
                          {row.id}
                        </span>
                        {showWarn && (
                          <span
                            title="Has Mismatch / Miss — please review"
                            style={{
                              marginLeft: 6,
                              background: '#fffbe6',
                              color: '#d48806',
                              border: '1px solid #ffe58f',
                              borderRadius: 4,
                              padding: '0 6px',
                              fontSize: 11,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ⚠ 异常
                          </span>
                        )}
                      </td>

                      <td>
                        <span style={getSourceBadgeStyle(row.source)}>{row.source}</span>
                      </td>

                      <td>{row.statementType}</td>

                      <td>
                        <span style={getStatusBadgeStyle(row.status)}>{row.status}</span>
                      </td>

                      <td>{row.customer}</td>

                      <td style={{ maxWidth: 200, fontSize: 12 }}>
                        {row.settlementItems.map((item, i) => (
                          <div key={i}>{item}</div>
                        ))}
                      </td>

                      <td>{allocationModeLabel}</td>

                      <td>{row.statementTaxMark}</td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatAmount(row.totalAmountReceivable, row.currency)}
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {row.totalInvoiceAmount > 0 ? formatAmount(row.totalInvoiceAmount, row.currency) : '-'}
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatAmount(row.collectedAmount, row.currency)}
                      </td>

                      <td style={{ whiteSpace: 'nowrap' }}>{row.createdDate}</td>

                      <td>{row.createdBy}</td>

                      <td>
                        <span
                          className="link-blue"
                          style={{ cursor: 'pointer', color: '#1677ff', whiteSpace: 'nowrap' }}
                          onClick={() => onViewDetail(row.allocationMode === 'auto' ? 'auto' : 'manual')}
                        >
                          View detail
                        </span>
                      </td>
                    </tr>

                    {/* Expanded sub-row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={15} style={{ padding: '0 0 0 32px', background: '#fafafa' }}>
                          {hasInvoices ? (
                            <table
                              className="data-table sub-table"
                              style={{ margin: '8px 0', fontSize: 12 }}
                            >
                              <thead>
                                <tr>
                                  <th>Invoice No.</th>
                                  <th>Invoice Type</th>
                                  <th>Invoice Date</th>
                                  <th style={{ textAlign: 'right' }}>Invoice Amount</th>
                                  <th style={{ textAlign: 'right' }}>Tax Amount</th>
                                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.invoices.map((inv, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <span style={{ color: '#1677ff', cursor: 'pointer' }}>{inv.no}</span>
                                    </td>
                                    <td>{inv.type}</td>
                                    <td>{inv.date}</td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                      {formatAmount(inv.amount, inv.currency)}
                                    </td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                      {formatAmount(inv.taxAmount, inv.currency)}
                                    </td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                      {formatAmount(inv.totalAmount, inv.currency)}
                                    </td>
                                    <td>
                                      <span style={getInvoiceStatusBadgeStyle(inv.status)}>{inv.status}</span>
                                    </td>
                                    <td>
                                      <span style={{ color: '#1677ff', cursor: 'pointer' }}>View</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ padding: '12px 0', color: '#999', fontSize: 13, textAlign: 'center' }}>
                              No associated invoices
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <span style={{ fontSize: 13, color: '#555' }}>
            Total <b>{totalItems}</b> items
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* First page */}
            <button
              className="page-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '3px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 3,
                background: '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#bbb' : '#333',
                fontSize: 12,
              }}
            >
              «
            </button>
            {/* Prev */}
            <button
              className="page-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '3px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 3,
                background: '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#bbb' : '#333',
                fontSize: 12,
              }}
            >
              ‹
            </button>
            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  padding: '3px 8px',
                  border: currentPage === p ? '1px solid #00b96b' : '1px solid #d9d9d9',
                  borderRadius: 3,
                  background: currentPage === p ? '#00b96b' : '#fff',
                  color: currentPage === p ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: currentPage === p ? 600 : 400,
                }}
              >
                {p}
              </button>
            ))}
            {/* Next */}
            <button
              className="page-btn"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '3px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 3,
                background: '#fff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? '#bbb' : '#333',
                fontSize: 12,
              }}
            >
              ›
            </button>
            {/* Last page */}
            <button
              className="page-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '3px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 3,
                background: '#fff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? '#bbb' : '#333',
                fontSize: 12,
              }}
            >
              »
            </button>
            {/* Page size */}
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{
                marginLeft: 8,
                height: 28,
                border: '1px solid #d9d9d9',
                borderRadius: 3,
                fontSize: 12,
                padding: '0 4px',
                color: '#333',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatementList;
