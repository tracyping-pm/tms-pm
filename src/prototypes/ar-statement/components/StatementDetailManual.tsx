import React, { useState } from 'react';

interface StatementDetailManualProps {
  onBack: () => void;
  onExport: () => void;
  onAddInvoice: () => void;
  onEditInvoice: () => void;
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

const IconImage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ── Section wrapper ── */
function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 4, padding: '16px 20px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

/* ── Timeline steps ── */
const timelineSteps = [
  { date: '2024-01-01', label: 'Initial Billing\nPreparation', status: 'done' },
  { date: '2024-01-01', label: 'Awaiting Customer\nConfirmation', status: 'done' },
  { date: '2025-02-01', label: 'Awaiting for AR', status: 'done' },
  { date: '', label: 'Pending Collection', status: 'active' },
  { date: '2025-03-12', label: '', status: 'pending' },
];

/* ── Waybill mock data ── */
const waybillRows = [
  { wn: 'PHW26021360D', cc: 'External Code:P301499632', btt: '', pos: '', unload: '', origin: '', originLabel: '', dest: '', destLabel: '', invoice: '' },
  { wn: 'PHW2602183L1', cc: 'External Code:P301505260', btt: '', pos: '', unload: '', origin: '', originLabel: '', dest: '', destLabel: '', invoice: '' },
];

/* ── Settlement & Ticket data types ── */
interface SettlementRow {
  waybill: string;
  item: string;
  amount: number;
  current: number;
}

interface TicketAllocationRow {
  type: string;
  number: string;
  amount: string;
  allocatable: string;
  current: string;
}

/* ── Invoice 1 data ── */
const invoice1Settlement: SettlementRow[] = [
  { waybill: 'PHW2505069CE', item: 'Basic amount Receivable',    amount: 1200, current: 1000 },
  { waybill: 'PHW2505069CE', item: 'Customer Additional Charge', amount: 1000, current: 800  },
  { waybill: 'PHW2505069CE', item: 'Miscellaneous Charge',       amount: 500,  current: 0    },
];

const invoice1Tickets: TicketAllocationRow[] = [
  { type: 'AI', number: 'PHW2505069CE', amount: '400.00', allocatable: '400.00', current: '400.00' },
  { type: 'AI', number: 'PHW2505069CE', amount: '400.00', allocatable: '400.00', current: '400.00' },
];

/* ── Invoice 2 data ── */
const invoice2Settlement: SettlementRow[] = [
  { waybill: 'PHW2505069CE', item: 'Basic amount Receivable',    amount: 4000, current: 1000 },
  { waybill: 'PHW2505082CE', item: 'Customer Additional Charge', amount: 1500, current: 1000 },
  { waybill: 'PHW2505082CE', item: 'Customer Exception Fee',     amount: 1000, current: 0    },
];

const invoice2Tickets: TicketAllocationRow[] = [
  { type: 'AI', number: 'PHW2505069CE', amount: '800.00', allocatable: '800.00', current: '400.00' },
  { type: 'AI', number: 'PHW2505069CE', amount: '800.00', allocatable: '800.00', current: '400.00' },
];

/* ── Invoice Card ── */
interface InvoiceCardProps {
  invoiceNo: string;
  clientEntity: string;
  invoiceAmount: string;
  collectedAmount: string;
  invoiceStatus: string;
  invoiceDate: string;
  creditTerm: number;
  aging: number;
  settlementRows: SettlementRow[];
  ticketRows: TicketAllocationRow[];
  invoiceAmountSummary: string;
  discrepancy: string;
  onEditInvoice: () => void;
}

function InvoiceCard({
  invoiceNo, clientEntity, invoiceAmount, collectedAmount, invoiceStatus, invoiceDate,
  creditTerm, aging, settlementRows: initialSettlementRows, ticketRows,
  invoiceAmountSummary, discrepancy,
  onEditInvoice,
}: InvoiceCardProps) {
  const [rows, setRows] = useState<SettlementRow[]>(initialSettlementRows);

  const handleCurrentChange = (index: number, value: number) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, current: value } : r));
  };

  const totalTaxEx = rows.reduce((sum, r) => sum + r.current, 0);
  const totalTaxIn = rows.reduce((sum, r) => sum + r.current + r.current * 0.12, 0);

  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ background: '#fafafa', padding: '10px 16px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#333' }}>Invoice {invoiceNo}</span>
          <span><span style={{ color: '#999' }}>Client Entity: </span><span>{clientEntity}</span></span>
          <span><span style={{ color: '#999' }}>Invoice Amount: </span><span style={{ fontWeight: 500 }}>{invoiceAmount}</span></span>
          <span><span style={{ color: '#999' }}>Collected Amount: </span><span>{collectedAmount}</span></span>
          <span><span style={{ color: '#999' }}>Invoice Status: </span><span style={{ color: '#fa8c16' }}>{invoiceStatus}</span></span>
          <span><span style={{ color: '#999' }}>Invoice Date: </span><span>{invoiceDate}</span></span>
          <span><span style={{ color: '#999' }}>Customer Credit Term (Days): </span><span>{creditTerm}</span></span>
          <span><span style={{ color: '#999' }}>Invoice Aging (Days): </span><span style={{ color: '#1890ff' }}>{aging}</span></span>
        </div>
        <div style={{ display: 'flex', gap: 14, flexShrink: 0, fontSize: 13 }}>
          <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Export</button>
          <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={onEditInvoice}>Add Waybill Invoice</button>
          <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>End Invoice</button>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Settlement Item Allocation */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>Settlement Item Allocation</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 1200 }}>
              <thead>
                <tr>
                  <th>Waybill Number</th>
                  <th>Settlement Item</th>
                  <th style={{ textAlign: 'right' }}>Amount (Allocatable Amount)</th>
                  <th style={{ textAlign: 'right' }}>Current Allocation</th>
                  <th style={{ textAlign: 'right' }}>Remaining Amount</th>
                  <th style={{ textAlign: 'right' }}>VAT (12%)</th>
                  <th style={{ textAlign: 'right' }}>WHT (2%)</th>
                  <th style={{ textAlign: 'right' }}>Billed Amount (VAT-ex)</th>
                  <th style={{ textAlign: 'right' }}>Billed Amount (VAT+)</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td><span className="link-blue">{r.waybill}</span></td>
                    <td>{r.item}</td>
                    <td style={{ textAlign: 'right' }}>{r.amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        type="number"
                        value={r.current}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleCurrentChange(i, val);
                        }}
                        style={{
                          width: 90,
                          padding: '3px 6px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          fontSize: 13,
                          textAlign: 'right',
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>{(r.amount - r.current).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{(r.current * 0.12).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{(r.current * 0.02).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{r.current.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{(r.current + r.current * 0.12).toFixed(2)}</td>
                    <td>
                      <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#ff4d4f' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Allocation */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>Ticket Allocation</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket Type</th>
                <th>Ticket Number</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Allocatable Amount</th>
                <th style={{ textAlign: 'right' }}>Current Allocation Amount</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {ticketRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.type}</td>
                  <td><span className="link-blue">{r.number}</span></td>
                  <td style={{ textAlign: 'right' }}>{r.amount}</td>
                  <td style={{ textAlign: 'right' }}>{r.allocatable}</td>
                  <td style={{ textAlign: 'right' }}>{r.current}</td>
                  <td>
                    <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#ff4d4f' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: 32, paddingTop: 10, borderTop: '1px solid #e8e8e8', fontSize: 13, flexWrap: 'wrap' }}>
          <span><span style={{ color: '#999' }}>Total Allocated Amount (Tax-ex): </span><span style={{ fontWeight: 600 }}>{totalTaxEx.toFixed(2)}</span></span>
          <span><span style={{ color: '#999' }}>Total Allocated Amount (Tax-in): </span><span style={{ fontWeight: 600 }}>{totalTaxIn.toFixed(2)}</span></span>
          <span><span style={{ color: '#999' }}>Invoice Amount: </span><span style={{ fontWeight: 600 }}>{invoiceAmountSummary}</span></span>
          <span>
            <span style={{ color: '#999' }}>Discrepancy: </span>
            <span style={{ fontWeight: 600, color: discrepancy.startsWith('-') ? '#ff4d4f' : '#333' }}>{discrepancy}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
function StatementDetailManual({ onBack, onExport, onAddInvoice, onEditInvoice }: StatementDetailManualProps) {
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);

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
            Pending Collection
          </span>

          <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}>
            Operation Log
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-default" onClick={onExport}>Export</button>
          <button className="btn-default">Cancel</button>
          <button className="btn-primary">Go</button>
        </div>
      </div>

      {/* ── Status Change Record ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Status Change Record</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
          {timelineSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="timeline-step" style={{ minWidth: 120, textAlign: 'center', position: 'relative' }}>
                {step.date ? (
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4, whiteSpace: 'nowrap' }}>{step.date}</div>
                ) : (
                  <div style={{ fontSize: 11, color: 'transparent', marginBottom: 4 }}>–</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
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
                ['Client Entity', 'NESTLE (THAI) COMPANY LIMITED'],
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

        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Amount Receivable</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>฿ 4,990.00</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 13 }}>
            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['Waybill Contract Revenue:', '฿ 2,700.00'],
                    ['Claim:', '฿ 550.00'],
                    ['Others:', '฿ 5.00'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '4px 0', color: '#666' }}>{label}</td>
                      <td style={{ padding: '4px 0', color: '#333', textAlign: 'right' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['Customer Basic Amount:', '฿ 1,800.00'],
                    ['WHT Item:', '฿ 840.00'],
                    ['Customer Additional Charge:', '฿ 900.00'],
                    ['Miscellaneous Charge:', '฿ 45.00'],
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
          <div className="section-title" style={{ marginBottom: 0 }}>Waybills</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit Entries Invoice</button>
            <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Fill in All Invoice No</button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select className="filter-select"><option>Waybill Invoice</option></select>
          <select className="filter-select"><option>Customer Code</option></select>
          <select className="filter-select"><option>Billing Truck Type</option></select>
          <button className="btn-default">Reset</button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconSearch /> Search
          </button>
        </div>

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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: '#666' }}>
          <span>400 Waybills Total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Show</span>
            <select className="filter-select" style={{ minWidth: 60 }}>
              <option>10</option><option>20</option><option>50</option>
            </select>
            <div className="pagination">
              <button className="page-btn">First</button>
              <button className="page-btn">‹</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">›</button>
              <button className="page-btn">Last</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Invoice Management (Manual Mode) ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Invoice Management</div>
            <span className="badge-manual">Manual Allocation Mode</span>
          </div>
          <button
            className="link-blue"
            onClick={onAddInvoice}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <IconPlus /> Add Invoice
          </button>
        </div>

        <InvoiceCard
          invoiceNo="12333555"
          clientEntity="NESTLE (THAI) COMPANY LIMITED"
          invoiceAmount="3,190.00"
          collectedAmount="0"
          invoiceStatus="Pending Collection"
          invoiceDate="18/12/2025"
          creditTerm={30}
          aging={42}
          settlementRows={invoice1Settlement}
          ticketRows={invoice1Tickets}
          invoiceAmountSummary="3,190.00"
          discrepancy="-1,590.00"
          onEditInvoice={onEditInvoice}
        />

        <InvoiceCard
          invoiceNo="87326743"
          clientEntity="NESTLE (THAI) COMPANY LIMITED"
          invoiceAmount="1,800.00"
          collectedAmount="0"
          invoiceStatus="Pending Collection"
          invoiceDate="18/12/2025"
          creditTerm={30}
          aging={42}
          settlementRows={invoice2Settlement}
          ticketRows={invoice2Tickets}
          invoiceAmountSummary="1,800.00"
          discrepancy="-1,000.00"
          onEditInvoice={onEditInvoice}
        />
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
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>please review and confirm before adjusting</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Uploaded proof */}
            <div style={{ width: 64, height: 64, border: '1px solid #e8e8e8', borderRadius: 4, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconImage />
            </div>
            {/* Add placeholder */}
            <div style={{ width: 64, height: 64, border: '1px dashed #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa' }}>
              <span style={{ fontSize: 22, color: '#bbb', lineHeight: 1 }}>+</span>
            </div>
          </div>
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
            { amount: '฿ 2,500.00', date: '2025-01-14 09:00', count: 3 },
            { amount: '฿ 2,000.00', date: '2025-01-14 09:00', count: 1 },
          ].map((card, idx) => (
            <div key={idx} style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '12px 16px', minWidth: 200, background: '#fafafa' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>{card.amount}</div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{card.date}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: card.count }).map((_, n) => (
                  <div key={n} style={{ width: 52, height: 52, border: '1px solid #e8e8e8', borderRadius: 4, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconImage />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}

export default StatementDetailManual;
