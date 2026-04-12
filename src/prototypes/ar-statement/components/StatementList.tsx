import React, { useState } from 'react';

interface StatementListProps {
  onAddStatement: () => void;
  onViewDetail: (allocationMode: 'auto' | 'manual') => void;
  onExport: () => void;
}

interface InvoiceRow {
  clientEntity: string;
  invoiceNumber: string;
  invoiceAmount: string;
  collectedAmount: string;
  invoiceStatus: string;
  invoiceDate: string;
  creditTermDays: number;
  invoiceAging: number;
  agingOverdue: boolean;
}

interface StatementRow {
  id: string;
  statementNumber: string;
  billingCustomer: string;
  projectName: string;
  settlementItem: string;
  receivableAmount: string;
  collectedAmount: string;
  statementStatus: string;
  reconciliationPeriod: string;
  creator: string;
  creationTime: string;
  invoices: InvoiceRow[];
}

const SAMPLE_DATA: StatementRow[] = [
  {
    id: '1',
    statementNumber: 'AR78987654321',
    billingCustomer: 'NESTLE (THAI)\nCOMPANY LIMITED',
    projectName: '—',
    settlementItem: 'Customer Basic Amount, Customer Exception Fee, C...',
    receivableAmount: '1,800.35',
    collectedAmount: '1,000.00',
    statementStatus: 'Partially Collected',
    reconciliationPeriod: '2025-09-01 –\n2025-12-31',
    creator: 'Lynn',
    creationTime: '2026-03-25\n18:38:18',
    invoices: [
      {
        clientEntity: 'Nestels Comsdfh PH',
        invoiceNumber: '1234567898',
        invoiceAmount: '1,800.35',
        collectedAmount: '1,000.00',
        invoiceStatus: 'Collected',
        invoiceDate: '18/12/2025',
        creditTermDays: 40,
        invoiceAging: 50,
        agingOverdue: true,
      },
      {
        clientEntity: 'Nestels Comsdfh PH',
        invoiceNumber: '1234567898',
        invoiceAmount: '1,800.35',
        collectedAmount: '0.00',
        invoiceStatus: 'Pending Collection',
        invoiceDate: '18/11/2025',
        creditTermDays: 40,
        invoiceAging: 20,
        agingOverdue: false,
      },
    ],
  },
  {
    id: '2',
    statementNumber: 'AR78987654321',
    billingCustomer: 'NESTLE (THAI)\nCOMPANY LIMITED',
    projectName: '—',
    settlementItem: 'Customer Basic Amount, Customer Exception Fee, C...',
    receivableAmount: '1,800.35',
    collectedAmount: '1,000.00',
    statementStatus: 'Partially Collected',
    reconciliationPeriod: '2025-09-01 –\n2025-12-31',
    creator: 'Lynn',
    creationTime: '2026-03-25\n18:38:18',
    invoices: [],
  },
  {
    id: '3',
    statementNumber: 'AR78987654321',
    billingCustomer: 'NESTLE (THAI)\nCOMPANY LIMITED',
    projectName: '—',
    settlementItem: 'Customer Basic Amount, Customer Exception Fee, C...',
    receivableAmount: '1,800.35',
    collectedAmount: '1,000.00',
    statementStatus: 'Partially Collected',
    reconciliationPeriod: '2025-09-01 –\n2025-12-31',
    creator: 'Lynn',
    creationTime: '2026-03-25\n18:38:18',
    invoices: [],
  },
];

// Operator options for Invoice Aging filter
const AGING_OPERATORS = ['=', '>', '>=', '<', '<=', '≠'];

function StatementList({ onAddStatement, onViewDetail, onExport }: StatementListProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['1']));
  const [agingOperator, setAgingOperator] = useState('=');
  const [agingValue, setAgingValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div style={{ padding: 16 }}>
      {/* 卡片容器 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 4,
          padding: 16,
        }}
      >
        {/* 标题 */}
        <div className="section-title">Statement List</div>

        {/* 筛选器 第一行 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
          <select className="filter-select">
            <option>Statement Number</option>
          </select>
          <select className="filter-select">
            <option>Billing Number</option>
          </select>
          <select className="filter-select">
            <option>Invoice Number</option>
          </select>
          <select className="filter-select">
            <option>Statement Status</option>
          </select>
          <select className="filter-select">
            <option>Batch Status</option>
          </select>
          <select className="filter-select">
            <option>Invoice Status</option>
          </select>
          <select className="filter-select">
            <option>Statement Type</option>
          </select>
        </div>

        {/* 筛选器 第二行 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <select className="filter-select">
            <option>Billing Customer</option>
          </select>
          <select className="filter-select">
            <option>Statement Creator</option>
          </select>

          {/* 操作符 + Invoice Aging */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
            <select
              value={agingOperator}
              onChange={(e) => setAgingOperator(e.target.value)}
              style={{
                border: 'none',
                borderRight: '1px solid #d9d9d9',
                padding: '5px 6px',
                fontSize: 13,
                color: '#333',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {AGING_OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              className="filter-input"
              style={{ border: 'none', borderRadius: 0, minWidth: 120 }}
              placeholder="Invoice Aging"
              value={agingValue}
              onChange={(e) => setAgingValue(e.target.value)}
            />
          </div>

          {/* 右侧按钮组 */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-default">Reset</button>
            <button className="btn-primary">Search</button>
            <button className="btn-primary" onClick={onExport}>
              Export List
            </button>
          </div>
        </div>

        {/* Add Statement 按钮 */}
        <div style={{ marginBottom: 12 }}>
          <button className="btn-primary" onClick={onAddStatement}>
            Add Statement
          </button>
        </div>

        {/* 数据表格 */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Statement Number</th>
                <th>Billing Customer</th>
                <th>Project Name</th>
                <th>Settlement Item</th>
                <th style={{ textAlign: 'right' }}>Statement Receivable Amount</th>
                <th style={{ textAlign: 'right' }}>Statement Collected Amount</th>
                <th>Statement Status</th>
                <th>Reconciliation Period</th>
                <th>Creator</th>
                <th>Creation Time</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DATA.map((row) => {
                const isExpanded = expandedRows.has(row.id);
                const hasInvoices = row.invoices.length > 0;

                return (
                  <React.Fragment key={row.id}>
                    {/* 主行 */}
                    <tr>
                      {/* 展开图标 */}
                      <td style={{ textAlign: 'center', width: 32 }}>
                        {hasInvoices ? (
                          <button
                            onClick={() => toggleRow(row.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: 11,
                              color: '#666',
                              lineHeight: 1,
                            }}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? '▼' : '►'}
                          </button>
                        ) : (
                          <span style={{ color: '#bbb', fontSize: 11 }}>►</span>
                        )}
                      </td>

                      <td>
                        <span className="link-blue" onClick={() => onViewDetail('auto')}>
                          {row.statementNumber}
                        </span>
                      </td>

                      <td style={{ whiteSpace: 'pre-line' }}>{row.billingCustomer}</td>

                      <td>{row.projectName}</td>

                      <td style={{ maxWidth: 160 }}>{row.settlementItem}</td>

                      <td style={{ textAlign: 'right' }}>{row.receivableAmount}</td>

                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.collectedAmount}</td>

                      <td>{row.statementStatus}</td>

                      <td style={{ whiteSpace: 'pre-line', fontSize: 12 }}>{row.reconciliationPeriod}</td>

                      <td>{row.creator}</td>

                      <td style={{ whiteSpace: 'pre-line', fontSize: 12 }}>{row.creationTime}</td>

                      <td>
                        <span className="link-blue" onClick={() => onViewDetail('auto')}>
                          Detail
                        </span>
                      </td>
                    </tr>

                    {/* 展开子行 */}
                    {isExpanded && hasInvoices && (
                      <tr>
                        <td colSpan={12} style={{ padding: '0 0 0 32px', background: '#fafafa' }}>
                          <table className="data-table sub-table" style={{ margin: '6px 0 6px 0' }}>
                            <thead>
                              <tr>
                                <th>Client Entity</th>
                                <th>Invoice Number</th>
                                <th style={{ textAlign: 'right' }}>Invoice Amount</th>
                                <th style={{ textAlign: 'right' }}>Collected Amount</th>
                                <th>Invoice Status</th>
                                <th>Invoice Date</th>
                                <th style={{ textAlign: 'center' }}>Customer Credit Term (Days)</th>
                                <th style={{ textAlign: 'center' }}>Invoice Aging</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.invoices.map((inv, idx) => (
                                <tr key={idx}>
                                  <td>{inv.clientEntity}</td>
                                  <td>{inv.invoiceNumber}</td>
                                  <td style={{ textAlign: 'right' }}>{inv.invoiceAmount}</td>
                                  <td style={{ textAlign: 'right' }}>{inv.collectedAmount}</td>
                                  <td>{inv.invoiceStatus}</td>
                                  <td>{inv.invoiceDate}</td>
                                  <td style={{ textAlign: 'center' }}>{inv.creditTermDays}</td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      color: inv.agingOverdue ? '#ff4d4f' : '#333',
                                      fontWeight: inv.agingOverdue ? 700 : 400,
                                    }}
                                  >
                                    {inv.invoiceAging}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 底部：总数 + 分页 */}
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
          {/* 总数 */}
          <span style={{ fontSize: 13, color: '#555' }}>458 Statement</span>

          {/* 分页 */}
          <div className="pagination">
            <button className="page-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1 > 0 ? 1 : 1))}>
              Next
            </button>
            <button className="page-btn">&lt;</button>
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                className={`page-btn${currentPage === p ? ' active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <span style={{ padding: '0 4px', color: '#999' }}>...</span>
            <button className="page-btn">&gt;</button>
            <button className="page-btn" onClick={() => setCurrentPage(4)}>
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatementList;
