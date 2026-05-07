import React, { useState } from 'react';
import type { Status } from './StatementList';

interface Props {
  no: string;
  status: Status;
  onBack: () => void;
  onEdit?: () => void;
}

interface WaybillRow {
  no: string;
  waybillAmount: number;
  basicAmount: number;
  prepaidAmount: number;
  additionalCharge: number;
  exceptionFee: number;
  reimbursement: number;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
}

interface ClaimTicketRow {
  ticketNo: string;
  claimType: string;
  relatedWaybill?: string;
  claimAmount: number;
}

interface InvoiceEntry {
  invoiceNo: string;
  invoiceAmount: number;
  invoiceDate: string;
  proofName?: string;
}

interface PaymentEntry {
  payableAmount: number;
  paymentStatus: string;
  applicationNo: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
  proofName?: string;
}

interface OperationLogEntry {
  timestamp: string;
  action: string;
  operator: string;
  subLine?: string;
}

interface MockData {
  source: 'Self-Created' | 'TMS-Synced';
  reconciliationPeriod: string;
  taxMark: string;
  totalAmountPayable: number;
  createDate: string;
  waybills: WaybillRow[];
  claimTickets: ClaimTicketRow[];
  // Amount Summary
  waybillContractCost: number;
  vendorBasicAmount: number;
  prepaidAmount: number;
  vendorExceptionFee: number;
  vendorAdditionalCharge: number;
  kpiClaim: number;
  vat: number;
  wht: number;
  // Conditional sections
  invoices?: InvoiceEntry[];
  payments?: PaymentEntry[];
  operationLog?: OperationLogEntry[];
  rejectReason?: string;
}

// Shared base waybill for mock data
const BASE_WAYBILL: WaybillRow = {
  no: 'WB2604050',
  waybillAmount: 13300,
  basicAmount: 13300,
  prepaidAmount: 0,
  additionalCharge: 0,
  exceptionFee: 0,
  reimbursement: 0,
  positionTime: '2026-04-16 12:45',
  unloadingTime: '2026-04-16 08:30',
  truckType: '10-Wheeler',
  origin: '',
  destination: '',
};

const BASE_CLAIM: ClaimTicketRow = {
  ticketNo: 'PHCT2604001',
  claimType: 'KPI Claim',
  relatedWaybill: 'WB2604050',
  claimAmount: 2000,
};

const BASE_INVOICE: InvoiceEntry = {
  invoiceNo: 'INV-PH-2604006',
  invoiceAmount: 44500,
  invoiceDate: '2026-04-15',
  proofName: 'Invoice 123.pdf',
};

const BASE_OP_LOG: OperationLogEntry[] = [
  { timestamp: '2026-04-25 09:20', action: 'Rejected the AP statement', operator: 'Keris', subLine: 'Reject Reason : 7PIWJ Amount is wrong' },
  { timestamp: '2026-04-24 09:20', action: 'Created the AP statement', operator: 'Olymris' },
];

const PENDING_PAYMENTS: PaymentEntry[] = [
  { payableAmount: 12000, paymentStatus: 'Pending Payment', applicationNo: 'wwerr32436546', bankName: 'ACAA Trucking Services', bankAccountName: 'SSSSS', bankAccountNo: '555555' },
  { payableAmount: 12000, paymentStatus: 'Pending Payment', applicationNo: 'werwe2324325',  bankName: 'ACAA Trucking Services', bankAccountName: 'SSSSS', bankAccountNo: '555555' },
  { payableAmount: 12000, paymentStatus: 'Pending Payment', applicationNo: '1223ewr',       bankName: 'ACAA Trucking Services', bankAccountName: 'SSSSS', bankAccountNo: '555555' },
];

const PAID_PAYMENTS: PaymentEntry[] = [
  { payableAmount: 12000, paymentStatus: 'Paid', applicationNo: 'wwerr32436546', proofName: 'relesed 123.pdf', bankName: 'ACAA Trucking Services', bankAccountName: 'SSSSS', bankAccountNo: '555555' },
  { payableAmount: 12000, paymentStatus: 'Paid', applicationNo: 'werwe2324325',  proofName: 'relesed 123.pdf', bankName: 'ACAA Trucking Services', bankAccountName: 'SSSSS', bankAccountNo: '555555' },
  { payableAmount: 12000, paymentStatus: 'Paid', applicationNo: '1223ewr',       proofName: 'relesed 123.pdf', bankName: 'ACAA Trucking Services', bankAccountName: 'SSSSS', bankAccountNo: '555555' },
];

const BASE_AMOUNTS = {
  waybillContractCost: 22000,
  vendorBasicAmount: 23190,
  prepaidAmount: 3190,
  vendorExceptionFee: 1000,
  vendorAdditionalCharge: 1000,
  kpiClaim: 2000,
  vat: 1000,
  wht: -200,
  totalAmountPayable: 23190,
};

const STATEMENT_DATA: Record<string, MockData> = {
  VS2604008: {
    source: 'Self-Created',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    operationLog: [
      { timestamp: '2026-04-28 09:20', action: 'Created the AP statement', operator: 'Olymris' },
    ],
  },
  VS2604001: {
    source: 'TMS-Synced',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    operationLog: [
      { timestamp: '2026-04-20 10:15', action: 'Submitted the AP statement', operator: 'Olymris' },
      { timestamp: '2026-04-20 09:00', action: 'Created the AP statement', operator: 'Olymris' },
    ],
  },
  VS2604002: {
    source: 'Self-Created',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    rejectReason: 'Vendor overcharged on WB2604055 Additional Charge by PHP 2,000. Please review and resubmit.',
    operationLog: BASE_OP_LOG,
  },
  VS2604003: {
    source: 'TMS-Synced',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    invoices: [BASE_INVOICE],
    payments: PENDING_PAYMENTS,
    operationLog: BASE_OP_LOG,
  },
  VS2604004: {
    source: 'TMS-Synced',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    invoices: [BASE_INVOICE],
    payments: [
      { ...PENDING_PAYMENTS[0], paymentStatus: 'Paid', proofName: 'relesed 123.pdf' },
      { ...PENDING_PAYMENTS[1], paymentStatus: 'Pending Payment' },
    ],
    operationLog: BASE_OP_LOG,
  },
  VS2603001: {
    source: 'Self-Created',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    invoices: [BASE_INVOICE],
    payments: PAID_PAYMENTS,
    operationLog: BASE_OP_LOG,
  },
  VS2603002: {
    source: 'TMS-Synced',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    invoices: [BASE_INVOICE],
    payments: PAID_PAYMENTS,
    operationLog: [
      ...BASE_OP_LOG,
      { timestamp: '2026-04-28 11:00', action: 'Written off the AP statement', operator: 'Zhang Wei', subLine: 'Write-off Reason : Remaining balance waived by agreement' },
    ],
  },
  VS2603003: {
    source: 'Self-Created',
    reconciliationPeriod: '2026-1-1 ~ 2026-2-28',
    taxMark: 'VAT-ex',
    totalAmountPayable: BASE_AMOUNTS.totalAmountPayable,
    createDate: '2026-04-25',
    waybills: [BASE_WAYBILL],
    claimTickets: [BASE_CLAIM],
    ...BASE_AMOUNTS,
    operationLog: [
      { timestamp: '2026-04-10 14:30', action: 'Canceled the AP statement', operator: 'Olymris', subLine: 'Cancel Reason : Duplicate statement, resubmitting under correct period' },
      { timestamp: '2026-04-10 09:00', action: 'Created the AP statement', operator: 'Olymris' },
    ],
  },
};

// Status badge inline styles (matching StatementList)
const STATUS_BADGE: Record<Status, React.CSSProperties> = {
  'Draft':               { background: '#f5f5f5',  color: '#595959', border: '1px solid #d9d9d9' },
  'Awaiting Comparison': { background: '#f0f5ff',  color: '#2f54eb', border: '1px solid #adc6ff' },
  'Awaiting Re-bill':    { background: '#fff1f0',  color: '#cf1322', border: '1px solid #ffa39e' },
  'Pending Payment':     { background: '#e6f4ff',  color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':   { background: '#fffbe6',  color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                { background: '#f5f5f5',  color: '#595959', border: '1px solid #d9d9d9' },
  'Written Off':         { background: '#f5f5f5',  color: '#595959', border: '1px solid #d9d9d9' },
  'Canceled':            { background: '#fff1f0',  color: '#cf1322', border: '1px solid #ffa39e' },
};

const SOURCE_BADGE: Record<'Self-Created' | 'TMS-Synced', React.CSSProperties> = {
  'Self-Created': { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'TMS-Synced':   { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
};

const BADGE_BASE: React.CSSProperties = { borderRadius: 4, padding: '3px 12px', fontSize: 13, display: 'inline-block' };

const NUM_FMT = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

// ── Section title ──────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontWeight: 600, fontSize: 15 }}>{children}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function StatementDetail({ no, status, onBack, onEdit }: Props) {
  const data = STATEMENT_DATA[no];
  const [activeTab, setActiveTab] = useState<'waybills' | 'tickets'>('waybills');
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>('inclusive');

  if (!data) {
    return (
      <div className="vp-card">
        <button className="btn-link" onClick={onBack}>← Back to My Statements</button>
        <div className="empty" style={{ marginTop: 16 }}>Statement data not found.</div>
      </div>
    );
  }

  const isEditable  = status === 'Draft' || status === 'Awaiting Re-bill';
  const hasRemove   = status === 'Draft' || status === 'Awaiting Re-bill' || status === 'Pending Payment';
  const showInvoice = ['Pending Payment', 'Partially Payment', 'Paid', 'Written Off'].includes(status);
  const showPayment = ['Pending Payment', 'Partially Payment', 'Paid', 'Written Off'].includes(status);
  const showOpLog   = true;

  const {
    source, reconciliationPeriod, taxMark, totalAmountPayable, createDate,
    waybills, claimTickets, invoices, payments, operationLog, rejectReason,
    waybillContractCost, vendorBasicAmount, prepaidAmount: prepAmt,
    vendorExceptionFee, vendorAdditionalCharge, kpiClaim, vat, wht,
  } = data;

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: 6,
    padding: '20px 24px',
    marginBottom: 16,
  };

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* Back nav */}
      <div style={{ marginBottom: 12 }}>
        <button className="btn-link" style={{ fontSize: 13 }} onClick={onBack}>← Back to My Statements</button>
      </div>

      {/* ── Status header bar ── */}
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#333', marginRight: 4 }}>{no}</span>
        <span style={{ ...BADGE_BASE, ...STATUS_BADGE[status] }}>{status}</span>
        <span style={{ ...BADGE_BASE, ...SOURCE_BADGE[source] }}>{source}</span>
        <div style={{ flex: 1 }} />
        {(status === 'Draft' || status === 'Awaiting Re-bill') && (
          <button className="btn-primary" onClick={onEdit}>Submit</button>
        )}
      </div>

      {/* ── Rejection banner (Awaiting Re-bill) ── */}
      {status === 'Awaiting Re-bill' && rejectReason && (
        <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6, padding: '12px 20px', marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: '#cf1322', marginBottom: 4 }}>Statement rejected</div>
          <div style={{ color: '#333', marginBottom: 4 }}>Reject Reason: {rejectReason}</div>
          <div style={{ color: '#666' }}>Waiting for vendor to revise and resubmit via Vendor Portal.</div>
        </div>
      )}

      {/* ── Basic Information ── */}
      <div style={sectionStyle}>
        <SectionTitle>Basic information</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Reconciliation Period</div>
            <div>{reconciliationPeriod}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Statement Tax Mark</div>
            <div>{taxMark}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Total Amount Payable</div>
            <div style={{ fontWeight: 600 }}>{NUM_FMT(totalAmountPayable)}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Create date</div>
            <div>{createDate}</div>
          </div>
        </div>
      </div>

      {/* ── Settlement Details ── */}
      <div style={sectionStyle}>
        <SectionTitle>Settlement Details</SectionTitle>

        {/* Tab row + action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === 'waybills' ? 600 : 400, color: activeTab === 'waybills' ? '#333' : '#666', padding: 0 }}
              onClick={() => setActiveTab('waybills')}
            >
              Waybill List ({waybills.length})
            </button>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === 'tickets' ? 600 : 400, color: activeTab === 'tickets' ? '#333' : '#666', padding: 0 }}
              onClick={() => setActiveTab('tickets')}
            >
              Claim Ticket List({claimTickets.length})
            </button>
          </div>
          <div style={{ flex: 1 }} />
          {isEditable && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-default">Add Waybill</button>
              <button className="btn-default">Edit Waybill</button>
            </div>
          )}
        </div>

        {/* Waybill table */}
        {activeTab === 'waybills' && (
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Waybill</th>
                <th style={{ textAlign: 'right' }}>Waybill Amount</th>
                <th style={{ textAlign: 'right' }}>Basic Amount</th>
                <th style={{ textAlign: 'right' }}>Prepaid Amount</th>
                <th style={{ textAlign: 'right' }}>Additional Charge</th>
                <th style={{ textAlign: 'right' }}>Exception Fee</th>
                <th style={{ textAlign: 'right' }}>Reimbursement</th>
                <th>Position Time</th>
                <th>Unloading Time</th>
                <th>Truck Type</th>
                <th>Origin</th>
                <th>Destination</th>
                {hasRemove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {waybills.map(r => (
                <tr key={r.no}>
                  <td style={{ fontWeight: 500 }}>{r.no}</td>
                  <td style={{ textAlign: 'right' }}>{NUM_FMT(r.waybillAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{NUM_FMT(r.basicAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{NUM_FMT(r.prepaidAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{NUM_FMT(r.additionalCharge)}</td>
                  <td style={{ textAlign: 'right' }}>{NUM_FMT(r.exceptionFee)}</td>
                  <td style={{ textAlign: 'right' }}>{NUM_FMT(r.reimbursement)}</td>
                  <td>{r.positionTime}</td>
                  <td>{r.unloadingTime}</td>
                  <td>{r.truckType}</td>
                  <td>{r.origin || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td>{r.destination || <span style={{ color: '#bbb' }}>—</span>}</td>
                  {hasRemove && (
                    <td>
                      <button className="btn-link" style={{ color: '#cf1322' }}>Remove</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Claim Ticket table */}
        {activeTab === 'tickets' && (
          claimTickets.length === 0 ? (
            <div className="empty" style={{ padding: 24 }}>No claim tickets.</div>
          ) : (
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Claim Type</th>
                  <th>Related Waybill</th>
                  <th style={{ textAlign: 'right' }}>Claim Amount</th>
                </tr>
              </thead>
              <tbody>
                {claimTickets.map(t => (
                  <tr key={t.ticketNo}>
                    <td style={{ fontWeight: 500 }}>{t.ticketNo}</td>
                    <td>{t.claimType}</td>
                    <td>{t.relatedWaybill || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ textAlign: 'right', color: '#cf1322', fontWeight: 600 }}>
                      {NUM_FMT(t.claimAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* ── Amount Summary ── */}
      <div style={sectionStyle}>
        <SectionTitle>Amount Summary</SectionTitle>

        {/* Total row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: '#666', marginRight: 8 }}>Total Amount Payable</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{NUM_FMT(totalAmountPayable)}</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#666', marginRight: 12 }}>Statement Tax Mark</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginRight: 16 }}>
            <input type="radio" checked={taxMode === 'inclusive'} onChange={() => setTaxMode('inclusive')} />
            Tax-inclusive
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input type="radio" checked={taxMode === 'exclusive'} onChange={() => setTaxMode('exclusive')} />
            Tax-exclusive
          </label>
        </div>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #f0f0f0', borderRadius: 4, overflow: 'hidden', fontSize: 13 }}>
          {/* ─ Column headers ─ */}
          <div style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Waybill Contract Cost</span>
            <span style={{ fontWeight: 600 }}>{NUM_FMT(waybillContractCost)}</span>
          </div>
          <div style={{ padding: '10px 16px', borderRight: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Claim</span>
            <span style={{ fontWeight: 600 }}>{NUM_FMT(kpiClaim)}</span>
          </div>
          <div style={{ padding: '10px 16px', background: '#fafafa', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Others</span>
            <span style={{ fontWeight: 600 }}>{NUM_FMT(vat + wht)}</span>
          </div>

          {/* ─ Row 1 ─ */}
          <div style={{ padding: '8px 16px', borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#333' }}>Vendor Basic Amount</span>
            <span>{NUM_FMT(vendorBasicAmount)}</span>
          </div>
          <div style={{ padding: '8px 16px', borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#333' }}>KPI Claim</span>
            <span>{NUM_FMT(kpiClaim)}</span>
          </div>
          <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#333' }}>VAT</span>
            <span>{NUM_FMT(vat)}</span>
          </div>

          {/* ─ Row 2 ─ */}
          <div style={{ padding: '4px 16px 4px 32px', borderRight: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>PrePaid</span>
            <span style={{ color: '#666' }}>{NUM_FMT(prepAmt)}</span>
          </div>
          <div style={{ padding: '4px 16px', borderRight: '1px solid #f0f0f0' }} />
          <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#333' }}>WHT</span>
            <span style={{ color: wht < 0 ? '#cf1322' : undefined }}>{NUM_FMT(wht)}</span>
          </div>

          {/* ─ Row 3 ─ */}
          <div style={{ padding: '8px 16px', borderRight: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#333' }}>Vendor Exception Fee</span>
            <span>{NUM_FMT(vendorExceptionFee)}</span>
          </div>
          <div style={{ padding: '8px 16px', borderRight: '1px solid #f0f0f0' }} />
          <div style={{ padding: '8px 16px' }} />

          {/* ─ Row 4 ─ */}
          <div style={{ padding: '8px 16px', borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#333' }}>Vendor Additional Charge</span>
            <span>{NUM_FMT(vendorAdditionalCharge)}</span>
          </div>
          <div style={{ padding: '8px 16px', borderRight: '1px solid #f0f0f0' }} />
          <div style={{ padding: '8px 16px' }} />
        </div>
      </div>

      {/* ── Invoice ── */}
      {showInvoice && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Invoice</span>
            </div>
            <div style={{ flex: 1 }} />
            <button className="btn-default">Add Invoice</button>
          </div>
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th style={{ textAlign: 'right' }}>Invoice Amount</th>
                <th>Invoice Date</th>
                <th>Proof</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map((inv, i) => (
                <tr key={i}>
                  <td style={{ color: '#1677ff' }}>{inv.invoiceNo}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{NUM_FMT(inv.invoiceAmount)}</td>
                  <td style={{ color: '#1677ff' }}>{inv.invoiceDate}</td>
                  <td>
                    {inv.proofName
                      ? <span style={{ color: '#1677ff', cursor: 'pointer' }}>{inv.proofName}</span>
                      : <span style={{ color: '#bbb' }}>—</span>}
                  </td>
                  <td>
                    <button className="btn-link" style={{ color: '#cf1322' }}>Void</button>
                  </td>
                </tr>
              ))}
              {(invoices || []).length === 0 && (
                <tr><td colSpan={5} className="empty">No invoices.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Payment ── */}
      {showPayment && (
        <div style={sectionStyle}>
          <SectionTitle>Payment</SectionTitle>
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'right' }}>Payable Amount</th>
                <th>Payment Application Status</th>
                <th>Payment Application Number</th>
                {status === 'Paid' && <th>Proof</th>}
                <th>Bank Name</th>
                <th>Bank Account Name</th>
                <th style={{ textAlign: 'right' }}>Bank Account No</th>
              </tr>
            </thead>
            <tbody>
              {(payments || []).map((p, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{NUM_FMT(p.payableAmount)}</td>
                  <td>{p.paymentStatus}</td>
                  <td style={{ color: '#666' }}>{p.applicationNo}</td>
                  {status === 'Paid' && (
                    <td>
                      {p.proofName
                        ? <span style={{ color: '#1677ff', cursor: 'pointer' }}>{p.proofName}</span>
                        : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                  )}
                  <td>{p.bankName}</td>
                  <td>{p.bankAccountName}</td>
                  <td style={{ textAlign: 'right' }}>{p.bankAccountNo}</td>
                </tr>
              ))}
              {(payments || []).length === 0 && (
                <tr><td colSpan={status === 'Paid' ? 7 : 6} className="empty">No payment records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Operation Log ── */}
      {showOpLog && (
        <div style={sectionStyle}>
          <SectionTitle>Operation Log</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(operationLog || []).map((entry, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, color: '#333' }}>
                  <span style={{ color: '#999', marginRight: 16 }}>{entry.timestamp}</span>
                  <span>{entry.action}</span>
                  <span style={{ color: '#999' }}> . {entry.operator}</span>
                </div>
                {entry.subLine && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 3, paddingLeft: 130 }}>
                    {entry.subLine}
                  </div>
                )}
              </div>
            ))}
            {(operationLog || []).length === 0 && (
              <div className="empty">No operation records.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatementDetail;
