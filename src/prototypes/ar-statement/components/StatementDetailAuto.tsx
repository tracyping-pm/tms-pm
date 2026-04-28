import React, { useState } from 'react';

interface StatementDetailAutoProps {
  onBack: () => void;
  onExport: () => void;
  onAddInvoice: () => void;
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

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconFilePdf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconFileImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

/* ── Status flow stages ── */
const statusStages = [
  'Under Billing Preparation',
  'Submitted',
  'Confirmed',
  'Billed',
  'Partially Collected',
  'Collected',
];
const currentStageIndex = 0; // "Under Billing Preparation" is active

/* ── Waybill overview mock data ── */
const waybillOverviewRows = [
  { wbNo: 'WB2024010001', customerCode: 'CUST-001', billingTruckType: 'Standard', positionTime: '2024-01-10 08:00', unloadingTime: '2024-01-10 14:00', basicAmount: 'USD 22,000.00', additionalCharge: 'USD 250.00' },
  { wbNo: 'WB2024010002', customerCode: 'CUST-001', billingTruckType: 'Standard', positionTime: '2024-01-12 09:00', unloadingTime: '2024-01-12 15:30', basicAmount: 'USD 22,000.00', additionalCharge: 'USD 250.00' },
];

/* ── Claim ticket overview mock data ── */
const claimOverviewRows = [
  { ticketNo: 'CLM2024010001', claimType: 'Damage', claimAmount: '$2,500.00', currency: 'USD', status: 'Approved' },
];

/* ── Invoice mock data ── */
const invoiceRows = [
  { invoiceNo: 'INV2024011001', clientEntity: 'Customer A - ABC Logistics', invoiceDate: '2024-01-10', invoiceAmount: 'USD 12,500.00' },
  { invoiceNo: 'INV2024011002', clientEntity: 'Customer A - ABC Logistics', invoiceDate: '2024-01-12', invoiceAmount: 'USD 32,000.00' },
];

/* ── Section wrapper ── */
function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 4, padding: '16px 20px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
function StatementDetailAuto({ onBack, onExport, onAddInvoice }: StatementDetailAutoProps) {
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [waybillOverviewOpen, setWaybillOverviewOpen] = useState(false);
  const [claimOverviewOpen, setClaimOverviewOpen] = useState(false);

  return (
    <div style={{ padding: 16, minWidth: 1100 }}>

      {/* ── 1. Page Title Bar ── */}
      <Section style={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>AR Statement Detail</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{ backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
              </svg>
              Bill
            </button>
          </div>
        </div>
      </Section>

      {/* ── 2. Status Flow ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
          {statusStages.map((stage, idx) => {
            const isDone = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            const dotColor = isDone ? '#00b96b' : isActive ? '#1890ff' : '#d9d9d9';
            const labelColor = isActive ? '#1890ff' : isDone ? '#00b96b' : '#999';

            return (
              <React.Fragment key={idx}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 130 }}>
                  {/* Dot */}
                  <div style={{
                    width: isActive ? 14 : 10,
                    height: isActive ? 14 : 10,
                    borderRadius: '50%',
                    background: dotColor,
                    border: isActive ? '2px solid #1890ff' : isDone ? 'none' : '2px solid #d9d9d9',
                    boxShadow: isActive ? '0 0 0 3px rgba(24,144,255,0.15)' : 'none',
                    flexShrink: 0,
                    zIndex: 1,
                  }} />
                  {/* Label */}
                  <div style={{ fontSize: 12, color: labelColor, marginTop: 6, textAlign: 'center', fontWeight: isActive ? 600 : 400, lineHeight: 1.3 }}>
                    {stage}
                  </div>
                </div>
                {/* Connector line */}
                {idx < statusStages.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: idx < currentStageIndex ? '#00b96b' : '#e8e8e8', marginBottom: 20 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Section>

      {/* ── 3. Basic Information (collapsible) ── */}
      <Section>
        <button
          onClick={() => setBasicInfoOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: 8, marginBottom: basicInfoOpen ? 14 : 0 }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>Basic Information</div>
          <span style={{ transform: basicInfoOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex', color: '#666' }}>
            <IconChevronDown />
          </span>
        </button>

        {basicInfoOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 24px', fontSize: 13 }}>
            {/* Statement No. */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Statement No.</div>
              <div style={{ color: '#333', fontWeight: 500 }}>AR2024010001</div>
            </div>
            {/* Statement Type */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Statement Type</div>
              <div style={{ color: '#333' }}>Standard</div>
            </div>
            {/* Status */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Status</div>
              <span style={{ display: 'inline-block', background: '#e6f4ff', color: '#1890ff', border: '1px solid #91caff', padding: '1px 8px', borderRadius: 3, fontSize: 12, fontWeight: 500 }}>
                Under Billing Preparation
              </span>
            </div>
            {/* Customer */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Customer</div>
              <div style={{ color: '#333' }}>Customer A - ABC Logistics</div>
            </div>
            {/* Settlement Items */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Settlement Items</div>
              <div style={{ color: '#333', lineHeight: 1.5 }}>
                Customer Basic Amount<br />
                Customer Additional Charge
              </div>
            </div>
            {/* Allocation Mode */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Allocation Mode</div>
              <div style={{ color: '#333' }}>Auto</div>
            </div>
            {/* Statement Tax Mark */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Statement Tax Mark</div>
              <div style={{ color: '#333' }}>Tax-inclusive</div>
            </div>
            {/* Total Amount Receivable */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Total Amount Receivable</div>
              <div style={{ color: '#333', fontWeight: 500 }}>USD 44,500.00</div>
            </div>
            {/* Total Invoice Amount */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Total Invoice Amount</div>
              <div style={{ color: '#333' }}>USD 44,500.00</div>
            </div>
            {/* Collected Amount */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Collected Amount</div>
              <div style={{ color: '#333' }}>USD 44,500.00</div>
            </div>
            {/* Created Date */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Created Date</div>
              <div style={{ color: '#333' }}>2024-01-15</div>
            </div>
            {/* Created By */}
            <div>
              <div style={{ color: '#999', marginBottom: 2, fontSize: 12 }}>Created By</div>
              <div style={{ color: '#333' }}>Admin</div>
            </div>
          </div>
        )}
      </Section>

      {/* ── 4. Amount Summary ── */}
      <Section>
        <div className="section-title" style={{ marginBottom: 14 }}>Amount Summary</div>

        {/* Top row: total + tax mark */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, padding: '14px 16px', background: '#fafafa', borderRadius: 4, border: '1px solid #e8e8e8' }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Amount Receivable</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>USD 44,500.00</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#555' }}>
            <span style={{ fontWeight: 500 }}>Statement Tax Mark</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, background: '#1890ff', borderRadius: '50%', display: 'inline-block' }} />
              Tax-inclusive
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#bbb' }}>
              <span style={{ width: 8, height: 8, background: '#d9d9d9', borderRadius: '50%', display: 'inline-block' }} />
              Tax-exclusive
            </span>
          </div>
        </div>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {/* Column 1: Waybill Contract Revenue */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Waybill Contract Revenue</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>USD 44,500.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
              <span>Customer Basic Amount</span>
              <span>USD 44,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
              <span>Customer Additional Charge</span>
              <span>USD 500.00</span>
            </div>
          </div>

          {/* Column 2: Claim */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Claim</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>USD 0.00</span>
            </div>
          </div>

          {/* Column 3: Others */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Others</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>USD 0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
              <span>VAT</span>
              <span>USD 0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
              <span>WHT</span>
              <span>USD 0.00</span>
            </div>
          </div>
        </div>

        {/* Waybill Allocation Overview (collapsible) */}
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setWaybillOverviewOpen(o => !o)}
            className="btn-default"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 12px', cursor: 'pointer', background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4 }}
          >
            <span style={{ transform: waybillOverviewOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex', color: '#666' }}>
              <IconChevronDown />
            </span>
            Waybill Allocation Overview
            <span style={{ background: '#e6f4ff', color: '#1890ff', border: '1px solid #91caff', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
              2 waybills
            </span>
          </button>

          {waybillOverviewOpen && (
            <div style={{ marginTop: 8, overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Waybill No.', 'Customer Code', 'Billing Truck Type', 'Position Time', 'Unloading Time', 'Customer Basic Amount', 'Customer Additional Charge'].map(col => (
                      <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waybillOverviewRows.map((row, idx) => (
                    <tr key={idx}>
                      <td><span className="link-blue">{row.wbNo}</span></td>
                      <td>{row.customerCode}</td>
                      <td>{row.billingTruckType}</td>
                      <td>{row.positionTime}</td>
                      <td>{row.unloadingTime}</td>
                      <td>{row.basicAmount}</td>
                      <td>{row.additionalCharge}</td>
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
            className="btn-default"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 12px', cursor: 'pointer', background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4 }}
          >
            <span style={{ transform: claimOverviewOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s', display: 'flex', color: '#666' }}>
              <IconChevronDown />
            </span>
            Claim Ticket Allocation Overview
            <span style={{ background: '#e6f4ff', color: '#1890ff', border: '1px solid #91caff', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
              1 tickets
            </span>
          </button>

          {claimOverviewOpen && (
            <div style={{ marginTop: 8, overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Ticket No.', 'Claim Type', 'Claim Amount', 'Currency', 'Status'].map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claimOverviewRows.map((row, idx) => (
                    <tr key={idx}>
                      <td><span className="link-blue">{row.ticketNo}</span></td>
                      <td>{row.claimType}</td>
                      <td>{row.claimAmount}</td>
                      <td>{row.currency}</td>
                      <td>
                        <span style={{ color: '#00b96b', fontWeight: 500 }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>

      {/* ── 5. Invoices ── */}
      <Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          {/* Left: title + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Invoices</div>
            <span style={{ background: '#e6f4ff', color: '#1890ff', border: '1px solid #91caff', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
              2 invoices
            </span>
            <span style={{ fontSize: 13, color: '#555' }}>
              Total Invoice Amount: <strong>USD 44,500.00</strong>
            </span>
          </div>
          {/* Right: allocation mode + add button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Allocation Mode: Auto allocate waybill amount to all invoices</span>
            <button
              onClick={onAddInvoice}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: '5px 12px' }}
            >
              <IconPlus /> Add Invoice
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Invoice No.', 'Client Entity', 'Invoice Date', 'Invoice Amount', 'Document', 'Actions'].map(col => (
                  <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceRows.map((row, idx) => (
                <tr key={idx}>
                  <td><span className="link-blue">{row.invoiceNo}</span></td>
                  <td>{row.clientEntity}</td>
                  <td>{row.invoiceDate}</td>
                  <td style={{ fontWeight: 500 }}>{row.invoiceAmount}</td>
                  <td>
                    <span className="link-blue" style={{ fontSize: 12 }}>invoice_{idx + 1}.pdf</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 10, whiteSpace: 'nowrap' }}>
                      <button className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconEdit /> Edit
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 6. Attachments ── */}
      <Section>
        <div className="section-title" style={{ marginBottom: 14 }}>Attachments</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { icon: <IconFilePdf />, name: 'AR_Statement_2024010001.pdf', size: '2.3 MB' },
            { icon: <IconFileImage />, name: 'Supporting_Doc.jpg', size: '1.1 MB' },
          ].map((file, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid #e8e8e8', borderRadius: 4, background: '#fafafa' }}>
              {file.icon}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{file.size}</div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 4, display: 'flex', alignItems: 'center' }}>
                <IconDownload />
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn-default"
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, padding: '5px 12px' }}
        >
          <IconPlus /> Upload
        </button>
      </Section>

      {/* ── 6.5 Communication Records (V4 §3.2) ── */}
      <Section>
        <div className="section-title" style={{ marginBottom: 6 }}>Communication Records</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 14 }}>
          History of submissions, rejections and resubmissions between TMS and Vendor Portal —
          provides a lightweight "message board" so every Mismatch adjustment is traceable.
        </div>

        {/* Latest Reject Reason banner (only when Awaiting Rebill) */}
        <div
          style={{
            background: '#fff1f0',
            border: '1px solid #ffa39e',
            borderLeft: '4px solid #ff4d4f',
            borderRadius: 4,
            padding: '10px 14px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <span style={{ color: '#ff4d4f', fontSize: 16, marginTop: 1 }}>✕</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Latest Reject Reason · TMS</div>
            <div style={{ fontSize: 13, color: '#444' }}>
              Additional Charge for WB2604012 requires supporting proof. Basic Amount mismatch — vendor reported 18,500
              but TMS contract rate is 17,000.
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>2024-01-22 14:30 · FA Lily</div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: '1', timestamp: '2024-01-20 10:15', actor: 'VP', action: 'Submitted', note: 'Statement created and submitted from Vendor Portal.' },
            { id: '2', timestamp: '2024-01-22 14:30', actor: 'TMS', action: 'Rejected', note: 'Additional Charge for WB2604012 requires supporting proof. Basic Amount mismatch.' },
            { id: '3', timestamp: '2024-01-23 09:40', actor: 'VP', action: 'Resubmitted', note: 'Uploaded toll fee receipt for WB2604012 and adjusted Basic Amount to 17,000.' },
          ].map(record => (
            <div
              key={record.id}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                background: record.actor === 'TMS' ? '#fff1f0' : '#f6ffed',
                borderLeft: `3px solid ${record.actor === 'TMS' ? '#ff4d4f' : '#00b96b'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {record.actor === 'VP' ? 'Vendor (VP)' : 'TMS · FA'} · {record.action}
                </span>
                <span style={{ fontSize: 11, color: '#999' }}>{record.timestamp}</span>
              </div>
              {record.note && <div style={{ fontSize: 12, color: '#666' }}>{record.note}</div>}
            </div>
          ))}
        </div>

        {/* Reply input (mock) */}
        <div style={{ marginTop: 14, padding: 12, background: '#fafafa', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Add Note / Reject Reason</div>
          <textarea
            placeholder="Describe the issue or your action so the other side has full context..."
            style={{
              width: '100%',
              minHeight: 60,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              padding: 8,
              fontSize: 13,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              style={{
                background: '#fff',
                border: '1px solid #d9d9d9',
                color: '#333',
                borderRadius: 4,
                padding: '5px 14px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Add Internal Note
            </button>
            <button
              style={{
                background: '#ff4d4f',
                border: 'none',
                color: '#fff',
                borderRadius: 4,
                padding: '5px 14px',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Reject &amp; Send to VP
            </button>
          </div>
        </div>
      </Section>

      {/* ── 7. Operation Log ── */}
      <Section>
        <div className="section-title" style={{ marginBottom: 14 }}>Operation Log</div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Time', 'Operator', 'Action', 'Remark'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { time: '2024-01-15 10:30:00', operator: 'Admin', action: 'Created', remark: 'Statement created' },
                { time: '2024-01-15 14:20:00', operator: 'Admin', action: 'Submitted', remark: 'Submitted for review' },
                { time: '2024-01-16 09:00:00', operator: 'Manager', action: 'Confirmed', remark: 'All amounts confirmed' },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td style={{ whiteSpace: 'nowrap' }}>{row.time}</td>
                  <td>{row.operator}</td>
                  <td>
                    <span style={{ fontWeight: 500, color: '#333' }}>{row.action}</span>
                  </td>
                  <td style={{ color: '#666' }}>{row.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

    </div>
  );
}

export default StatementDetailAuto;
