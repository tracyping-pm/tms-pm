import React, { useState } from 'react';

interface StatementDetailManualProps {
  onBack: () => void;
  onExport: () => void;
  onAddInvoice: () => void;
  onEditInvoice: () => void;
}

/* ── Inline SVG helpers ── */
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconUpload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFilePdf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconFileImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

/* ── Status flow stages ── */
const statusStages = [
  { label: 'Under Billing\nPreparation', status: 'done' },
  { label: 'Submitted', status: 'active' },
  { label: 'Confirmed', status: 'pending' },
  { label: 'Billed', status: 'pending' },
  { label: 'Partially\nCollected', status: 'pending' },
  { label: 'Collected', status: 'pending' },
];

/* ── Settlement allocation row type ── */
interface SettlementAllocRow {
  waybill: string;
  item: string;
  amount: number;
  allocation: number;
}

/* ── Invoice 1 settlement data ── */
const inv1InitialRows: SettlementAllocRow[] = [
  { waybill: 'WB2024010001', item: 'Customer Basic Amount',      amount: 12000, allocation: 8000 },
  { waybill: 'WB2024010001', item: 'Customer Additional Charge', amount: 240,   allocation: 240  },
];

/* ── Invoice 2 settlement data ── */
const inv2InitialRows: SettlementAllocRow[] = [
  { waybill: 'WB2024010001', item: 'Customer Basic Amount',      amount: 20000, allocation: 18000 },
  { waybill: 'WB2024010002', item: 'Customer Additional Charge', amount: 15000, allocation: 14000 },
];

/* ── Claim ticket rows (shared structure) ── */
interface ClaimRow {
  ticketNo: string;
  claimType: string;
  amount: string;
  currency: string;
  status: string;
}

const inv1ClaimRows: ClaimRow[] = [
  { ticketNo: 'CLM2024010001', claimType: 'Damage', amount: '2,500.00', currency: 'USD', status: 'Approved' },
];

const inv2ClaimRows: ClaimRow[] = [
  { ticketNo: 'CLM2024010002', claimType: 'Shortage', amount: '800.00', currency: 'USD', status: 'Approved' },
];

/* ── Waybill overview rows ── */
const waybillOverviewRows = [
  { waybillNo: 'WB2024010001', customer: 'Customer A', settleItem: 'Customer Basic Amount',      totalAmt: '12,000.00', allocAmt: '12,000.00', remaining: '0.00',    vat: '1,440.00', wht: '240.00' },
  { waybillNo: 'WB2024010001', customer: 'Customer A', settleItem: 'Customer Additional Charge', totalAmt: '240.00',    allocAmt: '240.00',    remaining: '0.00',    vat: '28.80',    wht: '4.80' },
  { waybillNo: 'WB2024010002', customer: 'Customer A', settleItem: 'Customer Basic Amount',      totalAmt: '32,500.00', allocAmt: '32,500.00', remaining: '0.00',    vat: '3,900.00', wht: '650.00' },
];

/* ── Claim ticket overview rows ── */
const claimOverviewRows = [
  { ticketNo: 'CLM2024010001', claimType: 'Damage',   waybillNo: 'WB2024010001', claimAmt: '2,500.00', currency: 'USD', status: 'Approved' },
  { ticketNo: 'CLM2024010002', claimType: 'Shortage',  waybillNo: 'WB2024010002', claimAmt: '800.00',   currency: 'USD', status: 'Approved' },
];

/* ══════════════════════════════════════════
   Invoice Card (Manual mode - expandable)
══════════════════════════════════════════ */
interface InvoiceCardProps {
  invoiceNo: string;
  clientEntity: string;
  invoiceDate: string;
  invoiceAmount: string;
  documentName: string;
  initialSettlementRows: SettlementAllocRow[];
  claimRows: ClaimRow[];
  taxExSummary: number;
  invoiceAmountNum: number;
  onEditInvoice: () => void;
}

function InvoiceCard({
  invoiceNo,
  clientEntity,
  invoiceDate,
  invoiceAmount,
  documentName,
  initialSettlementRows,
  claimRows,
  taxExSummary,
  invoiceAmountNum,
  onEditInvoice,
}: InvoiceCardProps) {
  const [settlementOpen, setSettlementOpen] = useState(true);
  const [claimOpen, setClaimOpen] = useState(true);
  const [rows, setRows] = useState<SettlementAllocRow[]>(initialSettlementRows);

  const handleAllocationChange = (index: number, value: number) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, allocation: value } : r));
  };

  const totalTaxEx = rows.reduce((sum, r) => sum + r.allocation, 0);
  const totalTaxIn = rows.reduce((sum, r) => sum + r.allocation * 1.12, 0);
  const discrepancy = totalTaxEx - taxExSummary;

  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{
        background: '#fafafa',
        padding: '10px 16px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#1890ff' }}>{invoiceNo}</span>
          <span>
            <span style={{ color: '#999' }}>Client Entity: </span>
            <span style={{ color: '#333' }}>{clientEntity}</span>
          </span>
          <span>
            <span style={{ color: '#999' }}>Date: </span>
            <span style={{ color: '#333' }}>{invoiceDate}</span>
          </span>
          <span>
            <span style={{ color: '#999' }}>Amount: </span>
            <span style={{ fontWeight: 600, color: '#333' }}>{invoiceAmount}</span>
          </span>
          <span>
            <span style={{ color: '#999' }}>Document: </span>
            <span className="link-blue">{documentName}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={onEditInvoice}
            style={{ background: 'none', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', padding: '3px 8px', color: '#555', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
          >
            <IconEdit /> Edit
          </button>
          <button
            style={{ background: 'none', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', padding: '3px 8px', color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
          >
            <IconDelete /> Delete
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Settlement Item Allocation (collapsible) */}
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => setSettlementOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span style={{ transform: settlementOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex', color: '#666' }}>
              <IconChevronDown />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Settlement Item Allocation</span>
          </button>

          {settlementOpen && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 1000 }}>
                <thead>
                  <tr>
                    <th>Waybill No.</th>
                    <th>Settlement Item</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Current Allocation</th>
                    <th style={{ textAlign: 'right' }}>Remaining</th>
                    <th style={{ textAlign: 'right' }}>VAT (12%)</th>
                    <th style={{ textAlign: 'right' }}>WHT (2%)</th>
                    <th style={{ textAlign: 'right' }}>Billed (VAT-ex)</th>
                    <th style={{ textAlign: 'right' }}>Billed (VAT+)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const remaining = r.amount - r.allocation;
                    const vat = r.allocation * 0.12;
                    const wht = r.allocation * 0.02;
                    const billedVatEx = r.allocation - wht;
                    const billedVatIn = r.allocation + vat;
                    return (
                      <tr key={i}>
                        <td><span className="link-blue">{r.waybill}</span></td>
                        <td>{r.item}</td>
                        <td style={{ textAlign: 'right' }}>${r.amount.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <input
                            type="number"
                            value={r.allocation}
                            onChange={(e) => handleAllocationChange(i, parseFloat(e.target.value) || 0)}
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
                        <td style={{ textAlign: 'right' }}>${remaining.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>${vat.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>${wht.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>${billedVatEx.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>${billedVatIn.toFixed(2)}</td>
                        <td>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#ff4d4f' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Claim Ticket Allocation (collapsible) */}
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => setClaimOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span style={{ transform: claimOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex', color: '#666' }}>
              <IconChevronDown />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Claim Ticket Allocation</span>
          </button>

          {claimOpen && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Claim Type</th>
                  <th style={{ textAlign: 'right' }}>Claim Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {claimRows.map((r, i) => (
                  <tr key={i}>
                    <td><span className="link-blue">{r.ticketNo}</span></td>
                    <td>{r.claimType}</td>
                    <td style={{ textAlign: 'right' }}>${r.amount}</td>
                    <td>{r.currency}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 3,
                        fontSize: 12,
                        background: '#f6ffed',
                        color: '#52c41a',
                        border: '1px solid #b7eb8f',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: '#ff4d4f' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary row */}
        <div style={{
          display: 'flex',
          gap: 32,
          paddingTop: 10,
          borderTop: '1px solid #e8e8e8',
          fontSize: 13,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span>
            <span style={{ color: '#999' }}>Tax-ex: </span>
            <span style={{ fontWeight: 600, color: '#333' }}>${totalTaxEx.toLocaleString()}</span>
          </span>
          <span>
            <span style={{ color: '#999' }}>Tax-in: </span>
            <span style={{ fontWeight: 600, color: '#333' }}>${totalTaxIn.toFixed(2)}</span>
          </span>
          <span>
            <span style={{ color: '#999' }}>Invoice Amount: </span>
            <span style={{ fontWeight: 600, color: '#333' }}>${invoiceAmountNum.toLocaleString()}</span>
          </span>
          <span>
            <span style={{ color: '#999' }}>Discrepancy: </span>
            <span style={{ fontWeight: 600, color: discrepancy >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {discrepancy >= 0 ? '+' : ''}{discrepancy.toLocaleString()}
            </span>
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
  const [basicInfoOpen, setBasicInfoOpen]         = useState(true);
  const [waybillOverviewOpen, setWaybillOverviewOpen] = useState(true);
  const [claimOverviewOpen, setClaimOverviewOpen]   = useState(true);

  return (
    <div style={{ padding: 16, minWidth: 1100 }}>

      {/* ── 1. Page Title Bar ── */}
      <div style={{
        background: '#fff',
        borderRadius: 4,
        padding: '12px 20px',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>AR Statement Detail</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-default" onClick={onExport}>Export</button>
          <button
            style={{
              backgroundColor: '#1890ff',
              color: '#fff',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Bill
          </button>
        </div>
      </div>

      {/* ── 2. Status Flow ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
          {statusStages.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div
                className="timeline-step"
                style={{ minWidth: 120, textAlign: 'center', position: 'relative' }}
              >
                {/* Date placeholder row for consistent height */}
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4, whiteSpace: 'nowrap', minHeight: 16 }}>
                  {idx === 0 ? '2024-01-15' : idx === 1 ? '2024-01-15' : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                  <div
                    className={`timeline-dot${stage.status === 'done' ? ' done' : stage.status === 'active' ? ' active' : ''}`}
                    style={{
                      width: 10,
                      height: 10,
                      flexShrink: 0,
                      zIndex: 1,
                      position: 'relative',
                      ...(stage.status === 'active' ? { boxShadow: '0 0 0 3px rgba(0,185,107,0.2)' } : {}),
                    }}
                  />
                </div>
                <div style={{
                  fontSize: 11,
                  color: stage.status === 'active' ? '#00b96b' : stage.status === 'done' ? '#00b96b' : '#999',
                  marginTop: 4,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                  lineHeight: 1.4,
                  fontWeight: stage.status === 'active' ? 600 : 400,
                }}>
                  {stage.label}
                </div>
              </div>
              {idx < statusStages.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 1,
                  background: idx < 1 ? '#00b96b' : '#e8e8e8',
                  marginTop: 34,
                  minWidth: 20,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Section>

      {/* ── 3. Basic Information (collapsible) ── */}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 24px', fontSize: 13 }}>
              {/* Row 1 */}
              <div>
                <span style={{ color: '#999' }}>Statement No.:&nbsp;</span>
                <span style={{ color: '#333' }}>AR2024010001</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Statement Type:&nbsp;</span>
                <span style={{ color: '#333' }}>Standard</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#999' }}>Status:&nbsp;</span>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 3,
                  fontSize: 12,
                  background: '#fff7e6',
                  color: '#fa8c16',
                  border: '1px solid #ffd591',
                  fontWeight: 500,
                }}>
                  Submitted
                </span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Customer:&nbsp;</span>
                <span style={{ color: '#333' }}>Customer A - ABC Logistics</span>
              </div>

              {/* Row 2 */}
              <div style={{ gridColumn: 'span 1' }}>
                <span style={{ color: '#999' }}>Settlement Items:&nbsp;</span>
                <span style={{ color: '#333' }}>
                  Customer Basic Amount<br />
                  Customer Additional Charge
                </span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Allocation Mode:&nbsp;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Manual</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Statement Tax Mark:&nbsp;</span>
                <span style={{ color: '#333' }}>Tax-inclusive</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Total Amount Receivable:&nbsp;</span>
                <span style={{ color: '#333', fontWeight: 600 }}>USD 44,500.00</span>
              </div>

              {/* Row 3 */}
              <div>
                <span style={{ color: '#999' }}>Total Invoice Amount:&nbsp;</span>
                <span style={{ color: '#333', fontWeight: 600 }}>USD 44,500.00</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Collected Amount:&nbsp;</span>
                <span style={{ color: '#333' }}>USD 0.00</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Created Date:&nbsp;</span>
                <span style={{ color: '#333' }}>2024-01-15</span>
              </div>
              <div>
                <span style={{ color: '#999' }}>Created By:&nbsp;</span>
                <span style={{ color: '#333' }}>Admin</span>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── 4. Amount Summary ── */}
      <Section>
        <div className="section-title">Amount Summary</div>

        {/* Summary board */}
        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Amount Receivable</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#333' }}>USD 44,500.00</div>
            </div>
            <div style={{ fontSize: 13, color: '#333', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Statement Tax Mark:</span>
              <span style={{ color: '#00b96b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#00b96b', borderRadius: '50%', display: 'inline-block' }} />
                Tax-inclusive
              </span>
              <span style={{ color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#d9d9d9', borderRadius: '50%', display: 'inline-block' }} />
                Tax-exclusive
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, fontSize: 13 }}>
            {/* Waybill Contract Revenue */}
            <div>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
                Waybill Contract Revenue
                <span style={{ float: 'right' }}>USD 44,500.00</span>
              </div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['Customer Basic Amount', 'USD 32,000.00'],
                    ['Customer Additional Charge', 'USD 12,500.00'],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td style={{ padding: '3px 0', color: '#666' }}>{label}</td>
                      <td style={{ padding: '3px 0', color: '#333', textAlign: 'right' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Claim */}
            <div>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
                Claim
                <span style={{ float: 'right' }}>USD 3,300.00</span>
              </div>
            </div>
            {/* Others */}
            <div>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
                Others
                <span style={{ float: 'right' }}>USD 0.00</span>
              </div>
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['VAT', 'USD 0.00'],
                    ['WHT', 'USD 0.00'],
                    ['Allocation Mode', 'Manual'],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td style={{ padding: '3px 0', color: '#666' }}>{label}</td>
                      <td style={{ padding: '3px 0', color: '#333', textAlign: 'right' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Waybill Allocation Overview (collapsible) */}
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setWaybillOverviewOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: '#fafafa',
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              color: '#333',
              width: '100%',
              textAlign: 'left',
              marginBottom: waybillOverviewOpen ? 8 : 0,
            }}
          >
            <span style={{ transform: waybillOverviewOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex' }}>
              <IconChevronDown />
            </span>
            Waybill Allocation Overview
            <span style={{
              background: '#e6f4ff',
              color: '#1890ff',
              padding: '1px 8px',
              borderRadius: 10,
              fontSize: 12,
              marginLeft: 4,
            }}>
              {waybillOverviewRows.length} waybills
            </span>
          </button>

          {waybillOverviewOpen && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waybill No.</th>
                    <th>Customer</th>
                    <th>Settlement Item</th>
                    <th style={{ textAlign: 'right' }}>Total Amount</th>
                    <th style={{ textAlign: 'right' }}>Allocated Amount</th>
                    <th style={{ textAlign: 'right' }}>Remaining</th>
                    <th style={{ textAlign: 'right' }}>VAT (12%)</th>
                    <th style={{ textAlign: 'right' }}>WHT (2%)</th>
                  </tr>
                </thead>
                <tbody>
                  {waybillOverviewRows.map((r, i) => (
                    <tr key={i}>
                      <td><span className="link-blue">{r.waybillNo}</span></td>
                      <td>{r.customer}</td>
                      <td>{r.settleItem}</td>
                      <td style={{ textAlign: 'right' }}>{r.totalAmt}</td>
                      <td style={{ textAlign: 'right' }}>{r.allocAmt}</td>
                      <td style={{ textAlign: 'right' }}>{r.remaining}</td>
                      <td style={{ textAlign: 'right' }}>{r.vat}</td>
                      <td style={{ textAlign: 'right' }}>{r.wht}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Claim Ticket Allocation Overview (collapsible) */}
        <div>
          <button
            onClick={() => setClaimOverviewOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: '#fafafa',
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              color: '#333',
              width: '100%',
              textAlign: 'left',
              marginBottom: claimOverviewOpen ? 8 : 0,
            }}
          >
            <span style={{ transform: claimOverviewOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex' }}>
              <IconChevronDown />
            </span>
            Claim Ticket Allocation Overview
            <span style={{
              background: '#e6f4ff',
              color: '#1890ff',
              padding: '1px 8px',
              borderRadius: 10,
              fontSize: 12,
              marginLeft: 4,
            }}>
              {claimOverviewRows.length} tickets
            </span>
          </button>

          {claimOverviewOpen && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket No.</th>
                    <th>Claim Type</th>
                    <th>Related Waybill</th>
                    <th style={{ textAlign: 'right' }}>Claim Amount</th>
                    <th>Currency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claimOverviewRows.map((r, i) => (
                    <tr key={i}>
                      <td><span className="link-blue">{r.ticketNo}</span></td>
                      <td>{r.claimType}</td>
                      <td><span className="link-blue">{r.waybillNo}</span></td>
                      <td style={{ textAlign: 'right' }}>{r.claimAmt}</td>
                      <td>{r.currency}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 3,
                          fontSize: 12,
                          background: '#f6ffed',
                          color: '#52c41a',
                          border: '1px solid #b7eb8f',
                        }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>

      {/* ── 5. Invoices (Manual mode) ── */}
      <Section>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Invoices</div>
            <span style={{
              background: '#e6f4ff',
              color: '#1890ff',
              padding: '2px 10px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 500,
            }}>
              2 invoices
            </span>
            <span style={{ fontSize: 13, color: '#666' }}>
              Total Invoice Amount: <strong style={{ color: '#333' }}>USD 44,500.00</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#666' }}>
              Allocation Mode: <strong style={{ color: '#1890ff' }}>Manually allocate waybill and amount to invoices</strong>
            </span>
            <button
              onClick={onAddInvoice}
              style={{
                background: '#00b96b',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconPlus /> Add Invoice
            </button>
          </div>
        </div>

        {/* Invoice Card 1 */}
        <InvoiceCard
          invoiceNo="INV2024011001"
          clientEntity="Customer A - ABC Logistics"
          invoiceDate="2024-01-10"
          invoiceAmount="USD 12,500.00"
          documentName="INV001.pdf"
          initialSettlementRows={inv1InitialRows}
          claimRows={inv1ClaimRows}
          taxExSummary={8075}
          invoiceAmountNum={12500}
          onEditInvoice={onEditInvoice}
        />

        {/* Invoice Card 2 */}
        <InvoiceCard
          invoiceNo="INV2024011002"
          clientEntity="Customer A - ABC Logistics"
          invoiceDate="2024-01-12"
          invoiceAmount="USD 32,000.00"
          documentName="INV002.pdf"
          initialSettlementRows={inv2InitialRows}
          claimRows={inv2ClaimRows}
          taxExSummary={32000}
          invoiceAmountNum={32000}
          onEditInvoice={onEditInvoice}
        />
      </Section>

      {/* ── 6. Attachments ── */}
      <Section>
        <div className="section-title">Attachments</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {/* Attachment 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            background: '#fafafa',
          }}>
            <IconFilePdf />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>AR_Statement_2024010001.pdf</div>
              <div style={{ fontSize: 12, color: '#999' }}>2.3 MB</div>
            </div>
            <button
              className="link-blue"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              title="Download"
            >
              <IconDownload />
            </button>
          </div>

          {/* Attachment 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            background: '#fafafa',
          }}>
            <IconFileImage />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Supporting_Doc.jpg</div>
              <div style={{ fontSize: 12, color: '#999' }}>1.1 MB</div>
            </div>
            <button
              className="link-blue"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              title="Download"
            >
              <IconDownload />
            </button>
          </div>
        </div>

        <button
          className="btn-default"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <IconUpload /> Upload
        </button>
      </Section>

      {/* ── 7. Operation Log ── */}
      <Section>
        <div className="section-title">Operation Log</div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Operator</th>
              <th>Action</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2024-01-15 10:30:00</td>
              <td>Admin</td>
              <td>Created</td>
              <td>Statement created</td>
            </tr>
            <tr>
              <td>2024-01-15 14:20:00</td>
              <td>Admin</td>
              <td>Submitted</td>
              <td>Submitted for review</td>
            </tr>
            <tr>
              <td>2024-01-16 09:00:00</td>
              <td>Manager</td>
              <td>Confirmed</td>
              <td>All amounts confirmed</td>
            </tr>
          </tbody>
        </table>
      </Section>

    </div>
  );
}

export default StatementDetailManual;
