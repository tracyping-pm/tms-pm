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

interface StatementRow {
  id: string;
  statementType: 'Standard' | 'Standalone';
  status: string;
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
}

const SAMPLE_DATA: StatementRow[] = [
  {
    id: 'AR2024010001',
    statementType: 'Standard',
    status: 'Under Billing Preparation',
    customer: 'Customer A - ABC Logistics',
    settlementItems: ['Customer Basic Amount', 'Customer Additional Charge'],
    allocationMode: 'manual',
    statementTaxMark: 'Tax-inclusive',
    currency: 'USD',
    totalAmountReceivable: 44500.00,
    totalInvoiceAmount: 47170.00,
    collectedAmount: 44500.00,
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
    status: 'Full Collected',
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
    status: 'Awaiting Customer Confirmation',
    customer: 'Customer C - Global Freight Co.',
    settlementItems: ['Customer Basic Amount', 'Customer Exception Fee', 'Reimbursement Expense'],
    allocationMode: '-',
    statementTaxMark: 'Tax-exclusive',
    currency: 'CNY',
    totalAmountReceivable: 156000.00,
    totalInvoiceAmount: 0.00,
    collectedAmount: 0.00,
    createdDate: '2024-01-18',
    createdBy: 'Operator',
    invoices: [],
  },
  {
    id: 'AR2024010004',
    statementType: 'Standard',
    status: 'Pending Collection',
    customer: 'Customer A - ABC Logistics',
    settlementItems: ['Customer Basic Amount', 'Customer Additional Charge', 'Customer Exception Fee'],
    allocationMode: '-',
    statementTaxMark: 'Tax-inclusive',
    currency: 'EUR',
    totalAmountReceivable: 20020.00,
    totalInvoiceAmount: 21221.20,
    collectedAmount: 18200.00,
    createdDate: '2024-01-20',
    createdBy: 'Admin',
    invoices: [
      { no: 'INV2024014001', type: 'Freight Invoice', date: '2024-01-18', amount: 18200.00, currency: 'EUR', taxAmount: 1092.00, totalAmount: 19292.00, status: 'Issued' },
      { no: 'INV2024014002', type: 'Freight Invoice', date: '2024-01-20', amount: 1820.00, currency: 'EUR', taxAmount: 109.20, totalAmount: 1929.20, status: 'Draft' },
    ],
  },
  {
    id: 'AR2024010005',
    statementType: 'Standard',
    status: 'Under Billing Preparation',
    customer: 'Customer D - Pacific Shipping',
    settlementItems: ['Customer Additional Charge', 'Reimbursement Expense'],
    allocationMode: 'auto',
    statementTaxMark: 'Tax-exclusive',
    currency: 'USD',
    totalAmountReceivable: 89000.00,
    totalInvoiceAmount: 2000.00,
    collectedAmount: 45000.00,
    createdDate: '2024-01-22',
    createdBy: 'Manager',
    invoices: [
      { no: 'INV2024015001', type: 'Freight Invoice', date: '2024-01-20', amount: 1000.00, currency: 'USD', taxAmount: 60.00, totalAmount: 1060.00, status: 'Voided' },
      { no: 'INV2024015002', type: 'Freight Invoice', date: '2024-01-21', amount: 2000.00, currency: 'USD', taxAmount: 120.00, totalAmount: 2120.00, status: 'Draft' },
    ],
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

function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'Full Collected':
      return { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
    case 'Awaiting Customer Confirmation':
      return { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
    case 'Pending Collection':
      return { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
    case 'Under Billing Preparation':
      return { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
    case 'Partially Collected':
      return { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
    default:
      return { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' as const };
  }
}

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
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [filterSettlementItems, setFilterSettlementItems] = useState('');
  const [filterAllocationMode, setFilterAllocationMode] = useState('');
  const [filterStatementTaxMark, setFilterStatementTaxMark] = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterWaybillNumber, setFilterWaybillNumber] = useState('');
  const [filterCreationDate, setFilterCreationDate] = useState('');

  const totalItems = SAMPLE_DATA.length;
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
          <div className="section-title" style={{ margin: 0 }}>AR Statement List</div>
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
            + Create AR Statement
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
            <input
              style={inputStyle}
              placeholder="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Customer Name"
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
                <th>Statement Type</th>
                <th>Status</th>
                <th>Customer</th>
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
              {SAMPLE_DATA.map((row) => {
                const isExpanded = expandedRows.has(row.id);
                const hasInvoices = row.invoices.length > 0;
                const allocationModeLabel =
                  row.allocationMode === 'auto' ? 'Auto' :
                  row.allocationMode === 'manual' ? 'Manual' : '-';

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
                        <td colSpan={14} style={{ padding: '0 0 0 32px', background: '#fafafa' }}>
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
