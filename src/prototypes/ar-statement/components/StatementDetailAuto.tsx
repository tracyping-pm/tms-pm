import React, { useState } from 'react';

interface StatementDetailAutoProps {
  onBack: () => void;
  onExport: () => void;
  onAddInvoice: () => void;
}

/* ── Inline SVG helpers ── */
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const IconImage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ── Timeline ── */
const timelineSteps = [
  { date: '2024-01-01', label: 'Initial Billing\nPreparation', status: 'done' },
  { date: '2024-01-01', label: 'Awaiting Customer\nConfirmation', status: 'done' },
  { date: '2025-02-01', label: 'Awaiting for AR', status: 'done' },
  { date: '', label: 'Pending Collection', status: 'active' },
  { date: '2025-03-12', label: '', status: 'pending' },
];

/* ── Waybills table mock data ── */
const waybillRows = [
  { wn: 'PHW26021360D', cc: 'External Code:P301499632', btt: '', pos: '', unload: '', origin: '', originLabel: '', dest: '', destLabel: '', invoice: '', },
  { wn: 'PHW2602183L1', cc: 'External Code:P301505260', btt: '', pos: '', unload: '', origin: '', originLabel: '', dest: '', destLabel: '', invoice: '', },
];

/* ── Invoice table mock data ── */
const invoiceRows = [
  { number: '73100067BKSD', entity: 'NESTLE PHILS. COMPANY LIMITED', amount: '3,800.00', collected: '649.99', status: 'Pending Collection', date: '18/12/2025', creditTerm: '30', aging: '—', proof: 'invoice1.pdf' },
  { number: '73100067BKSD', entity: 'NESTLE PHILS. COMPANY LIMITED', amount: '3,800.00', collected: '446', status: 'Void', date: '18/12/2025', creditTerm: '30', aging: '—', proof: 'invoice2.pdf' },
  { number: '73100067BKSD', entity: 'NESTLE PHILS. COMPANY LIMITED', amount: '1,900.00', collected: '0', status: 'Pending Collection', date: '18/12/2025', creditTerm: '30', aging: '—', proof: 'invoice3.pdf' },
];

/* ── Status badge color ── */
function invoiceStatusStyle(status: string): React.CSSProperties {
  if (status === 'Void') return { color: '#ff4d4f' };
  return { color: '#fa8c16' };
}

/* ── Section wrapper ── */
function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 4, padding: '16px 20px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

/* ── Add Invoice Modal ── */
interface InvoiceRow {
  id: number;
  entity: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: string;
  hasProof: boolean;
}

function AddInvoiceModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<InvoiceRow[]>([
    { id: 1, entity: '', invoiceNumber: '546181013', invoiceDate: '2025-09-01', invoiceAmount: '546181013', hasProof: true },
    { id: 2, entity: '', invoiceNumber: '546181013', invoiceDate: '2025-09-01', invoiceAmount: '546181013', hasProof: false },
  ]);

  const addRow = () => {
    setRows(prev => [...prev, { id: Date.now(), entity: '', invoiceNumber: '', invoiceDate: '', invoiceAmount: '', hasProof: false }]);
  };

  const removeRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 900, padding: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e8e8e8' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Add Invoice</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#666', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {rows.map((row, idx) => (
            <div key={row.id} style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '16px', marginBottom: 12, position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 1fr 120px', gap: 12, alignItems: 'start' }}>
                {/* Client Entity */}
                <div>
                  <div className="form-label">Client Entity</div>
                  <div style={{ position: 'relative' }}>
                    <select className="filter-select" style={{ width: '100%' }} defaultValue="">
                      <option value=""></option>
                    </select>
                  </div>
                </div>
                {/* Invoice Number */}
                <div>
                  <div className="form-label">Invoice Number</div>
                  <input className="filter-input" defaultValue={row.invoiceNumber} style={{ width: '100%' }} />
                </div>
                {/* Invoice Date */}
                <div>
                  <div className="form-label">Invoice Date</div>
                  <input className="filter-input" defaultValue={row.invoiceDate} style={{ width: '100%' }} />
                </div>
                {/* Invoice Amount */}
                <div>
                  <div className="form-label">Invoice&nbsp; Amount</div>
                  <input className="filter-input" defaultValue={row.invoiceAmount} style={{ width: '100%' }} />
                </div>
                {/* Invoice Proof */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <span className="form-label" style={{ marginBottom: 0 }}>Invoice Proof</span>
                    <span className="badge-ai-ocr">AI OCR</span>
                  </div>
                  {row.hasProof ? (
                    <div style={{ width: 64, height: 64, border: '1px solid #e8e8e8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', position: 'relative' }}>
                      <IconImage />
                      <span style={{ position: 'absolute', bottom: 2, right: 2, fontSize: 9, background: '#999', color: '#fff', padding: '0 2px', borderRadius: 2 }}>PNG</span>
                    </div>
                  ) : (
                    <div style={{ width: 64, height: 64, border: '1px dashed #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa' }}>
                      <span style={{ fontSize: 22, color: '#bbb', lineHeight: 1 }}>+</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Row action buttons */}
              <div style={{ position: 'absolute', right: -28, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {idx === rows.length - 1 && (
                  <button onClick={addRow} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52c41a', padding: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#52c41a"><circle cx="12" cy="12" r="11" /><path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                )}
                <button onClick={() => removeRow(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', padding: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4d4f"><circle cx="12" cy="12" r="11" /><path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 24px', borderTop: '1px solid #e8e8e8' }}>
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
function StatementDetailAuto({ onBack, onExport, onAddInvoice }: StatementDetailAutoProps) {
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [taxInclusive, setTaxInclusive] = useState<'yes' | 'no'>('yes');

  const handleAddInvoice = () => {
    setShowAddInvoice(true);
    onAddInvoice();
  };

  return (
    <div style={{ padding: 16, minWidth: 1100 }}>

      {/* ── Top Nav Bar ── */}
      <div style={{ background: '#fff', borderRadius: 4, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#333', fontSize: 13, padding: '4px 8px', borderRadius: 4 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>

          <button style={{ background: 'none', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', padding: '3px 6px', color: '#555', display: 'flex', alignItems: 'center' }}>
            <IconEdit />
          </button>

          <span style={{ background: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591', padding: '2px 10px', borderRadius: 3, fontSize: 12, fontWeight: 500 }}>
            Awaiting Verify
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-default">Operation Log</button>
          <button className="btn-default" onClick={onExport}>Export</button>
          <button className="btn-default">Cancel</button>
          <button className="btn-primary">Go</button>
        </div>
      </div>

      {/* ── Status Change Record ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Status Change Record</div>
          <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Export</button>
        </div>

        {/* Horizontal Timeline */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
          {timelineSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="timeline-step" style={{ minWidth: 120, textAlign: 'center', position: 'relative' }}>
                {step.date && (
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4, whiteSpace: 'nowrap' }}>{step.date}</div>
                )}
                {!step.date && <div style={{ fontSize: 11, color: 'transparent', marginBottom: 4 }}>–</div>}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', justifyContent: 'center' }}>
                  <div
                    className={`timeline-dot${step.status === 'done' ? ' done' : step.status === 'active' ? ' active' : ''}`}
                    style={{ width: 10, height: 10, flexShrink: 0, zIndex: 1, position: 'relative' }}
                  />
                </div>
                <div style={{ fontSize: 11, color: step.status === 'active' ? '#1890ff' : '#666', marginTop: 4, whiteSpace: 'pre-wrap', textAlign: 'center', lineHeight: 1.4 }}>
                  {step.label}
                </div>
              </div>
              {idx < timelineSteps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: '#e8e8e8', marginTop: 27, minWidth: 20 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Section>

      {/* ── Basic Information (collapsible) ── */}
      <Section>
        <button
          onClick={() => setBasicInfoOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>Basic Information</div>
          <span style={{ transform: basicInfoOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex', color: '#666' }}>
            <IconChevronDown />
          </span>
        </button>
        {basicInfoOpen && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px', fontSize: 13 }}>
              {[
                ['Statement No.', 'PHCS260326022-1'],
                ['Client Entity', 'Nestlé 1'],
                ['Reconciliation Period', '2026-02-01 To 2026-02-28'],
                ['Creation Time', '2026-03-26 10:16:34'],
                ['Billing Cycle', 'Monthly'],
                ['Payment Term', 'Net 30'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span style={{ color: '#999' }}>{label}:&nbsp;</span>
                  <span style={{ color: '#333' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── Billing Information ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Billing Information</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Additional Charge Order</button>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Create Ticket Request</button>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Create Claim Request</button>
          </div>
        </div>

        {/* Billing sub-block */}
        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '16px 20px', marginBottom: 12 }}>
          {/* Total + Tax */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                Total Amount Receivable
                <span style={{ width: 8, height: 8, background: '#1890ff', borderRadius: '50%', display: 'inline-block' }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>₱ 13,900.00</div>
            </div>
            <div style={{ fontSize: 13, color: '#333', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Is the Settlement Tax-inclusive:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#1890ff', borderRadius: '50%', display: 'inline-block' }} />
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name="tax" checked={taxInclusive === 'yes'} onChange={() => setTaxInclusive('yes')} /> Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name="tax" checked={taxInclusive === 'no'} onChange={() => setTaxInclusive('no')} /> No
              </label>
            </div>
          </div>

          {/* Two-column detail */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 13 }}>
            {/* Left */}
            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['Waybill Contract Revenue:', '₱ 6,600.00'],
                    ['Claim:', '₱ 550.00'],
                    ['Others:', '₱ 5.00'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '4px 0', color: '#666' }}>{label}</td>
                      <td style={{ padding: '4px 0', color: '#333', textAlign: 'right' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Right */}
            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['Customer Basic Amount:', '₱ 1,100.00'],
                    ['WHT Item:', '₱ 840.00'],
                    ['Customer Exception Fee:', '—'],
                    ['Customer Additional Charge:', '2,300.00'],
                    ['Default Invoice:', '₱ 1,650.64'],
                    ['Reimbursement Expense:', '₱ 48.00'],
                    ['Delivery Duties:', '₱ 3.00'],
                    ['Miscellaneous Charge:', '₱ 1.00'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '3px 0', color: '#666' }}>{label}</td>
                      <td style={{ padding: '3px 0', color: '#333', textAlign: 'right' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Waybills ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Waybills</div>
            <span style={{ fontSize: 12, color: '#999' }}>●</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit Entries Invoice</button>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Fill in All Invoice No</button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select className="filter-select">
            <option>Waybill Invoice</option>
          </select>
          <select className="filter-select">
            <option>Customer Code</option>
          </select>
          <select className="filter-select">
            <option>Billing Truck Type</option>
          </select>
          <button className="btn-default">Reset</button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconSearch /> Search
          </button>
        </div>

        {/* Waybills Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Waybill Number', 'Customer Code', 'Billing Track Type', 'Position Time', 'Unloading Time', 'Origin', 'Origin Label', 'Destination', 'Destination Label', 'Invoice Number', 'Operate'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waybillRows.map((row, idx) => (
                <tr key={idx}>
                  <td><span className="link-blue">{row.wn}</span></td>
                  <td style={{ fontSize: 12 }}>{row.cc}</td>
                  <td>{row.btt || '—'}</td>
                  <td>{row.pos || '—'}</td>
                  <td>{row.unload || '—'}</td>
                  <td>{row.origin || '—'}</td>
                  <td>{row.originLabel || '—'}</td>
                  <td>{row.dest || '—'}</td>
                  <td>{row.destLabel || '—'}</td>
                  <td>{row.invoice || '—'}</td>
                  <td>
                    <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: '#666' }}>
          <span>400 Waybills Total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Show</span>
            <select className="filter-select" style={{ minWidth: 60 }}>
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <div className="pagination">
              <button className="page-btn">First</button>
              <button className="page-btn">‹</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">4</button>
              <button className="page-btn">›</button>
              <button className="page-btn">Last</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Invoice Management ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Invoice Management</div>
            <span className="badge-auto">Automatic Allocation Mode</span>
          </div>
          <button
            className="link-blue"
            onClick={handleAddInvoice}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <IconPlus /> Add Invoice
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Invoice Number', 'Client Entity', 'Invoice Amount', 'Collected Amount', 'Invoice Status', 'Invoice Date', 'Customer Credit Term (Days)', 'Invoice Aging', 'Invoice Proof', 'Operation'].map(col => (
                  <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceRows.map((row, idx) => (
                <tr key={idx}>
                  <td><span className="link-blue">{row.number}</span></td>
                  <td style={{ fontSize: 12, maxWidth: 180 }}>{row.entity}</td>
                  <td>{row.amount}</td>
                  <td>{row.collected}</td>
                  <td><span style={invoiceStatusStyle(row.status)}>{row.status}</span></td>
                  <td>{row.date}</td>
                  <td style={{ textAlign: 'center' }}>{row.creditTerm}</td>
                  <td>{row.aging}</td>
                  <td>
                    <span className="link-blue" style={{ fontSize: 12 }}>{row.proof}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, whiteSpace: 'nowrap' }}>
                      <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}>Export Invoice</button>
                      <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}>View Export</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Proof ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Proof</div>
          <button
            className="link-blue"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <IconPlus /> Add Proof
          </button>
        </div>

        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>Message Records</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
              <IconEdit />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
              <IconTrash />
            </button>
          </div>
          <div style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>No records yet.</div>
        </div>
      </Section>

      {/* ── Collection ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Collection</div>
          <button
            className="link-blue"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <IconPlus /> Add Storage
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { amount: '₱ 2,000.00', date: '2025-01-01 14:36:55' },
            { amount: '₱ 2,000.00', date: '2025-01-01 14:36:55' },
          ].map((card, idx) => (
            <div key={idx} style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '12px 16px', minWidth: 200, background: '#fafafa' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>{card.amount}</div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{card.date}</div>
              {/* Receipt image placeholder */}
              <div style={{ width: 72, height: 72, border: '1px solid #e8e8e8', borderRadius: 4, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconImage />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Add Invoice Modal ── */}
      {showAddInvoice && (
        <AddInvoiceModal onClose={() => setShowAddInvoice(false)} />
      )}
    </div>
  );
}

export default StatementDetailAuto;
