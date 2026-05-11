import React, { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ApStatus =
  | 'Under Payment Preparation'
  | 'Awaiting Comparison'
  | 'Awaiting Rebill'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Written Off'
  | 'Canceled';

type Source = 'Vendor Portal' | 'Intelal';

interface WaybillItem {
  name: string;
  tmsAmount: number;
  vpAmount: number;
}

interface WaybillRow {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  items: WaybillItem[];
}

interface ClaimRow {
  no: string;
  type: string;
  amount: number;
  currency: string;
  waybillNo: string;
}

interface InvoiceRow {
  no: string;
  amount: number;
  date: string;
  proof: string;
}

interface PaymentRow {
  payableAmount: number;
  status: string;
  applicationNo: string;
  proof: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNo: string;
}

interface LogEntry {
  time: string;
  action: string;
  operator: string;
  detail?: string;
}

interface StatementDetail {
  no: string;
  statementType: 'Standard' | 'Standalone';
  status: ApStatus;
  source: Source;
  vendor: string;
  taxMark: 'Tax-inclusive' | 'Tax-exclusive';
  settlementItems: string[];
  reconciliationPeriod: string;
  currency: string;
  createDate: string;
  createBy: string;
  vatRate: number;
  whtRate: number;
  waybills: WaybillRow[];
  claims: ClaimRow[];
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  operationLog: LogEntry[];
  rejectReason?: string;
}

interface Props {
  statementId: string;
  onBack: () => void;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const DETAILS: Record<string, StatementDetail> = {

  // ── VP: Under Payment Preparation (draft, no VP amounts yet)
  APVS2604001: {
    no: 'APVS2604001', statementType: 'Standalone', status: 'Under Payment Preparation',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: [],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-10', createBy: 'Manila Freight Co.',
    vatRate: 0, whtRate: 0,
    waybills: [],
    claims: [],
    invoices: [],
    payments: [],
    operationLog: [
      { time: '2026-04-10 09:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
    ],
  },

  // ── VP: Awaiting Comparison (full comparison with mismatches)
  APVS2604002: {
    no: 'APVS2604002', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Vendor Exception Fee', 'Vendor Additional Charge', 'Reimbursement Expense'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-01', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      {
        no: 'WB2604011', positionTime: '2026-04-11 09:00', unloadingTime: '2026-04-10 15:30',
        truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [
          { name: 'Basic Amount',       tmsAmount: 14500, vpAmount: 14500 },
          { name: 'PrePaid Amount',     tmsAmount:  2000, vpAmount:  2000 },
          { name: 'Additional Charge',  tmsAmount:   800, vpAmount:   900 },
        ],
      },
      {
        no: 'WB2604012', positionTime: '2026-04-12 17:00', unloadingTime: '2026-04-11 09:00',
        truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
        items: [
          { name: 'Basic Amount',      tmsAmount: 13300, vpAmount: 13300 },
          { name: 'PrePaid Amount',    tmsAmount:     0, vpAmount:     0 },
        ],
      },
      {
        no: 'WB2604013', positionTime: '2026-04-13 11:15', unloadingTime: '2026-04-12 17:00',
        truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
        items: [
          { name: 'Basic Amount',      tmsAmount: 15000, vpAmount: 15000 },
          { name: 'PrePaid Amount',    tmsAmount:  1190, vpAmount:  1190 },
          { name: 'Additional Charge', tmsAmount:  1200, vpAmount:  1200 },
          { name: 'Exception Fee',     tmsAmount:   500, vpAmount:   500 },
        ],
      },
    ],
    claims: [
      { no: 'PHCT26041501AB', type: 'KPI Claim', amount: 2000, currency: 'PHP', waybillNo: 'WB2604011' },
    ],
    invoices: [],
    payments: [],
    operationLog: [
      { time: '2026-04-01 10:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
    ],
  },

  // ── VP: Awaiting Rebill (rejected back to VP, with reason)
  APVS2604003: {
    no: 'APVS2604003', statementType: 'Standard', status: 'Awaiting Rebill',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-10', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    rejectReason: 'Basic Amount for WB2604013 exceeds contracted rate. Additional Charge for WB2604013 has no supporting proof. Please correct and resubmit.',
    waybills: [
      {
        no: 'WB2604014', positionTime: '2026-04-14 08:30', unloadingTime: '2026-04-13 11:15',
        truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
        items: [
          { name: 'Basic Amount',   tmsAmount: 12000, vpAmount: 12500 },
          { name: 'PrePaid Amount', tmsAmount:     0, vpAmount:     0 },
        ],
      },
      {
        no: 'WB2604015', positionTime: '2026-04-15 14:00', unloadingTime: '2026-04-14 08:30',
        truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [
          { name: 'Basic Amount',   tmsAmount: 13300, vpAmount: 13300 },
          { name: 'PrePaid Amount', tmsAmount:     0, vpAmount:     0 },
        ],
      },
      {
        no: 'WB2604016', positionTime: '2026-04-16 10:45', unloadingTime: '2026-04-15 14:00',
        truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
        items: [
          { name: 'Basic Amount',      tmsAmount: 11800, vpAmount: 11800 },
          { name: 'PrePaid Amount',    tmsAmount:     0, vpAmount:     0 },
          { name: 'Additional Charge', tmsAmount:   500, vpAmount:   500 },
        ],
      },
    ],
    claims: [],
    invoices: [],
    payments: [],
    operationLog: [
      { time: '2026-04-10 09:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
      { time: '2026-04-12 14:30', action: 'Rejected the AP statement', operator: 'Keris', detail: 'Basic Amount for WB2604013 exceeds contracted rate.' },
    ],
  },

  // ── Internal: Pending Payment
  APVS2604004: {
    no: 'APVS2604004', statementType: 'Standard', status: 'Pending Payment',
    source: 'Intelal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-01', createBy: 'Zhang Jialei',
    vatRate: 12, whtRate: 2,
    waybills: [
      {
        no: 'WB2604020', positionTime: '2026-04-01 08:00', unloadingTime: '2026-03-31 18:00',
        truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
        items: [
          { name: 'Basic Amount', tmsAmount: 16800, vpAmount: 0 },
          { name: 'Additional Charge', tmsAmount: 900, vpAmount: 0 },
        ],
      },
      {
        no: 'WB2604021', positionTime: '2026-04-02 09:30', unloadingTime: '2026-04-01 08:00',
        truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [
          { name: 'Basic Amount', tmsAmount: 13300, vpAmount: 0 },
        ],
      },
      {
        no: 'WB2604022', positionTime: '2026-04-03 14:00', unloadingTime: '2026-04-02 09:30',
        truckType: '4-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Manila',
        items: [
          { name: 'Basic Amount', tmsAmount: 9800, vpAmount: 0 },
          { name: 'Exception Fee', tmsAmount: 500, vpAmount: 0 },
        ],
      },
    ],
    claims: [],
    invoices: [
      { no: 'INV-2026-00185', amount: 44821, date: '2026-04-05', proof: 'invoice_185.pdf' },
    ],
    payments: [
      { payableAmount: 44821, status: 'Pending', applicationNo: 'PA2604001', proof: 'payment_proof.pdf', bankName: 'BDO Unibank', bankAccountName: 'Laguna Logistics Corp.', bankAccountNo: '1234567890' },
    ],
    operationLog: [
      { time: '2026-04-01 10:00', action: 'Created the AP statement', operator: 'Zhang Jialei' },
      { time: '2026-04-03 14:20', action: 'Confirmed & Created RFP', operator: 'Zhang Jialei' },
      { time: '2026-04-05 09:00', action: 'Invoice added', operator: 'Zhang Jialei' },
    ],
  },

  // ── Internal: Partially Payment
  APVS2604005: {
    no: 'APVS2604005', statementType: 'Standard', status: 'Partially Payment',
    source: 'Intelal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-inclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-10', createBy: 'Zhang Jialei',
    vatRate: 12, whtRate: 2,
    waybills: [
      {
        no: 'WB2604030', positionTime: '2026-04-05 08:00', unloadingTime: '2026-04-04 18:00',
        truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 16800, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 1200, vpAmount: 0 }],
      },
      {
        no: 'WB2604031', positionTime: '2026-04-06 09:00', unloadingTime: '2026-04-05 08:00',
        truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 0 }],
      },
      { no: 'WB2604032', positionTime: '2026-04-07 11:00', unloadingTime: '2026-04-06 09:00',
        truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila',
        items: [{ name: 'Basic Amount', tmsAmount: 15000, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 800, vpAmount: 0 }],
      },
      { no: 'WB2604033', positionTime: '2026-04-08 14:00', unloadingTime: '2026-04-07 11:00',
        truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba',
        items: [{ name: 'Basic Amount', tmsAmount: 9800, vpAmount: 0 }],
      },
      { no: 'WB2604034', positionTime: '2026-04-09 09:00', unloadingTime: '2026-04-08 14:00',
        truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila',
        items: [{ name: 'Basic Amount', tmsAmount: 14500, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 600, vpAmount: 0 }],
      },
      { no: 'WB2604035', positionTime: '2026-04-10 08:00', unloadingTime: '2026-04-09 09:00',
        truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
        items: [{ name: 'Basic Amount', tmsAmount: 11800, vpAmount: 0 }],
      },
      { no: 'WB2604036', positionTime: '2026-04-11 10:00', unloadingTime: '2026-04-10 08:00',
        truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cebu / Port',
        items: [{ name: 'Basic Amount', tmsAmount: 16500, vpAmount: 0 }],
      },
    ],
    claims: [],
    invoices: [{ no: 'INV-2026-00179', amount: 99000, date: '2026-04-12', proof: 'invoice_179.pdf' }],
    payments: [
      { payableAmount: 50000, status: 'Paid', applicationNo: 'PA2604008', proof: 'payment_1.pdf', bankName: 'BDO Unibank', bankAccountName: 'Laguna Logistics Corp.', bankAccountNo: '1234567890' },
      { payableAmount: 49000, status: 'Pending', applicationNo: 'PA2604009', proof: '—', bankName: 'BDO Unibank', bankAccountName: 'Laguna Logistics Corp.', bankAccountNo: '1234567890' },
    ],
    operationLog: [
      { time: '2026-04-10 08:30', action: 'Created the AP statement', operator: 'Zhang Jialei' },
      { time: '2026-04-11 10:00', action: 'Confirmed & Created RFP', operator: 'Zhang Jialei' },
    ],
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function compareResult(tms: number, vp: number): { label: string; color: string } {
  if (tms === vp) return { label: 'Matched', color: '#389e0d' };
  return { label: 'MisMatched', color: '#cf1322' };
}

function waybillTotals(w: WaybillRow, isVP: boolean) {
  const tms = w.items.filter(i => i.name !== 'PrePaid Amount').reduce((s, i) => s + i.tmsAmount, 0)
    - (w.items.find(i => i.name === 'PrePaid Amount')?.tmsAmount ?? 0);
  const vp = isVP
    ? w.items.filter(i => i.name !== 'PrePaid Amount').reduce((s, i) => s + i.vpAmount, 0)
      - (w.items.find(i => i.name === 'PrePaid Amount')?.vpAmount ?? 0)
    : 0;
  return { tms, vp, diff: tms - vp };
}

// ─── Status UI ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ApStatus, React.CSSProperties> = {
  'Under Payment Preparation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Awaiting Comparison':       { background: '#fff1b8', color: '#7c5700', border: '1px solid #ffe58f' },
  'Awaiting Rebill':           { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Pending Payment':           { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':         { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                      { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Written Off':               { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'Canceled':                  { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

const BASE_BADGE: React.CSSProperties = { borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 500 };

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{title}</span>
      </div>
      {action}
    </div>
  );
}

// ─── Key-Value Row ────────────────────────────────────────────────────────────

function KVRow({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 0', marginBottom: 8 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 3 }}>{item.label}</div>
          <div style={{ fontSize: 13, color: '#333' }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

function ApStatementDetail({ statementId, onBack }: Props) {
  const stmt = DETAILS[statementId];

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isVP = stmt?.source === 'Vendor Portal';
  const isEditable = stmt?.status === 'Under Payment Preparation';
  const isAwaitingComparison = stmt?.status === 'Awaiting Comparison';

  const toggleRow = (no: string) => {
    setExpandedRows(prev => {
      const n = new Set(prev);
      if (n.has(no)) n.delete(no); else n.add(no);
      return n;
    });
  };

  // ── Amount calculations ────────────────────────────────────────────────────

  const allItems = stmt?.waybills.flatMap(w => w.items) ?? [];

  const sumByName = (name: string, field: 'tmsAmount' | 'vpAmount') =>
    allItems.filter(i => i.name === name).reduce((s, i) => s + i[field], 0);

  const tmsBasic      = sumByName('Basic Amount', 'tmsAmount');
  const tmsPrePaid    = sumByName('PrePaid Amount', 'tmsAmount');
  const tmsAdditional = sumByName('Additional Charge', 'tmsAmount');
  const tmsException  = sumByName('Exception Fee', 'tmsAmount');

  const vpBasic       = sumByName('Basic Amount', 'vpAmount');
  const vpPrePaid     = sumByName('PrePaid Amount', 'vpAmount');
  const vpAdditional  = sumByName('Additional Charge', 'vpAmount');
  const vpException   = sumByName('Exception Fee', 'vpAmount');

  const tmsWCC = tmsBasic + tmsAdditional + tmsException - tmsPrePaid;
  const vpWCC  = vpBasic  + vpAdditional  + vpException  - vpPrePaid;

  const claimTotal = stmt?.claims.reduce((s, c) => s + c.amount, 0) ?? 0;

  const vatRate = stmt?.vatRate ?? 0;
  const whtRate = stmt?.whtRate ?? 0;

  const tmsVAT  = Math.round(tmsWCC * vatRate / 100);
  const whtSign = -1;
  const tmsWHT  = Math.round(tmsWCC * whtRate / 100);
  const vpVAT   = Math.round(vpWCC  * vatRate / 100);
  const vpWHT   = Math.round(vpWCC  * whtRate / 100);

  const tmsTotalPayable = tmsWCC - claimTotal + tmsVAT - tmsWHT;
  const vpTotalPayable  = vpWCC  - claimTotal + vpVAT  - vpWHT;

  if (!stmt) {
    return (
      <div className="tms-card" style={{ padding: 40, textAlign: 'center', color: '#999' }}>
        Statement not found.
        <div style={{ marginTop: 16 }}>
          <button className="btn-default" onClick={onBack}>← Back</button>
        </div>
      </div>
    );
  }

  // ── Top action buttons ─────────────────────────────────────────────────────

  const renderTopActions = () => {
    if (isAwaitingComparison) return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-danger" onClick={() => setShowRejectDialog(true)}>Reject to Vendor</button>
        <button className="btn-primary" onClick={() => setShowConfirmDialog(true)}>Confirm &amp; Create RFP</button>
      </div>
    );
    if (isEditable) return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-default">Save</button>
        <button className="btn-primary">Submit to TMS</button>
      </div>
    );
    return null;
  };

  // ── Settlement Details: Waybill table ──────────────────────────────────────

  const renderWaybillTable = () => {
    if (stmt.waybills.length === 0) {
      return (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4, marginBottom: 16 }}>
          No waybills added.
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table className="data-table" style={{ minWidth: isVP ? 1100 : 900 }}>
          <thead>
            <tr>
              <th style={{ width: 28 }} />
              <th>Waybill</th>
              <th style={{ textAlign: 'right' }}>TMS Amount</th>
              {isVP && <th style={{ textAlign: 'right' }}>VP Amount</th>}
              {isVP && <th>Comparison</th>}
              {isVP && <th style={{ textAlign: 'right' }}>Difference</th>}
              <th>Position Time</th>
              <th>Unloading Time</th>
              <th>Truck Type</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stmt.waybills.map(w => {
              const expanded = expandedRows.has(w.no);
              const tot = waybillTotals(w, isVP);
              const cmp = isVP ? compareResult(tot.tms, tot.vp) : null;

              return (
                <React.Fragment key={w.no}>
                  {/* Summary row */}
                  <tr style={{ background: expanded ? '#fafafa' : undefined }}>
                    <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRow(w.no)}>
                      <span style={{ fontSize: 12, color: '#999', userSelect: 'none' }}>
                        {expanded ? '▼' : '▶'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{w.no}</td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(tot.tms)}</td>
                    {isVP && <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(tot.vp)}</td>}
                    {isVP && cmp && (
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 500, color: cmp.color }}>{cmp.label}</span>
                      </td>
                    )}
                    {isVP && (
                      <td style={{ textAlign: 'right', fontSize: 13, color: tot.diff !== 0 ? '#cf1322' : '#389e0d', fontWeight: 500 }}>
                        {tot.diff !== 0 ? fmt(Math.abs(tot.diff)) : '—'}
                      </td>
                    )}
                    <td style={{ fontSize: 12, color: '#555' }}>{w.positionTime}</td>
                    <td style={{ fontSize: 12, color: '#555' }}>{w.unloadingTime}</td>
                    <td style={{ fontSize: 12 }}>{w.truckType}</td>
                    <td style={{ fontSize: 12, color: '#555' }}>{w.origin}</td>
                    <td style={{ fontSize: 12, color: '#555' }}>{w.destination}</td>
                    <td>
                      {isEditable && (
                        <button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }}>Remove</button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded: per-item rows */}
                  {expanded && w.items.map((item, idx) => {
                    const itemDiff = isVP ? item.tmsAmount - item.vpAmount : 0;
                    const itemCmp  = isVP ? compareResult(item.tmsAmount, item.vpAmount) : null;
                    const isPrePaid = item.name === 'PrePaid Amount';
                    return (
                      <tr key={idx} style={{ background: '#f9f9f9' }}>
                        <td />
                        <td style={{ paddingLeft: 32, fontSize: 12, color: isPrePaid ? '#0958d9' : '#555' }}>
                          {isPrePaid ? `↳ ${item.name}` : item.name}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: 12, color: isPrePaid ? '#0958d9' : '#333' }}>
                          {isPrePaid ? `−${fmt(item.tmsAmount)}` : fmt(item.tmsAmount)}
                        </td>
                        {isVP && (
                          <td style={{ textAlign: 'right', fontSize: 12, color: isPrePaid ? '#0958d9' : '#333' }}>
                            {isPrePaid ? `−${fmt(item.vpAmount)}` : fmt(item.vpAmount)}
                          </td>
                        )}
                        {isVP && itemCmp && (
                          <td>
                            <span style={{ fontSize: 11, color: itemCmp.color }}>{itemCmp.label}</span>
                          </td>
                        )}
                        {isVP && (
                          <td style={{ textAlign: 'right', fontSize: 12, color: itemDiff !== 0 ? '#cf1322' : '#389e0d' }}>
                            {itemDiff !== 0 ? fmt(Math.abs(itemDiff)) : '—'}
                          </td>
                        )}
                        <td colSpan={5} />
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {isVP && (
                            <span style={{ display: 'inline-flex', gap: 8 }}>
                              <button className="btn-link" style={{ fontSize: 11 }}>OC Check</button>
                              <button className="btn-link" style={{ fontSize: 11 }}>Pricing Check</button>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Settlement Details: Claim table ───────────────────────────────────────

  const renderClaimTable = () => {
    if (stmt.claims.length === 0) {
      return (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
          No claim tickets attached.
        </div>
      );
    }
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Claim Ticket No.</th>
            <th>Type</th>
            <th>Waybill No.</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          {stmt.claims.map(c => (
            <tr key={c.no}>
              <td style={{ fontWeight: 600, color: '#1677ff' }}>{c.no}</td>
              <td style={{ fontSize: 12 }}>{c.type}</td>
              <td style={{ fontSize: 12 }}>{c.waybillNo}</td>
              <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(c.amount)}</td>
              <td style={{ fontSize: 12 }}>{c.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ── Amount Summary ──────────────────────────────────────────────────────────

  const renderAmountSummary = () => {
    const colHdr = (label: string) => (
      <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>{label}</div>
    );
    const amtRow = (label: string, tms: number, vp?: number, bold?: boolean, isDeduction?: boolean) => {
      const sign = isDeduction ? '−' : '';
      const style: React.CSSProperties = { fontSize: 13, fontWeight: bold ? 600 : 400, color: isDeduction ? '#0958d9' : '#333' };
      return (
        <div style={{ display: 'grid', gridTemplateColumns: isVP ? '2fr 1fr 1fr 1fr' : '2fr 1fr', gap: 4, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ fontSize: 13, color: isDeduction ? '#0958d9' : '#555', paddingLeft: isDeduction ? 12 : 0 }}>
            {isDeduction ? `↳ ${label}` : label}
          </span>
          <span style={{ ...style, textAlign: 'right' }}>{sign}{fmt(tms)}</span>
          {isVP && <span style={{ ...style, textAlign: 'right' }}>{vp !== undefined ? `${sign}${fmt(vp)}` : '—'}</span>}
          {isVP && <span style={{ ...style, textAlign: 'right', color: tms !== (vp ?? tms) ? '#cf1322' : '#389e0d' }}>
            {tms !== (vp ?? tms) ? fmt(Math.abs(tms - (vp ?? tms))) : '—'}
          </span>}
        </div>
      );
    };

    return (
      <div>
        {/* Items to be settled */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>* Items to be settled</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['Vendor Basic Amount', 'Vendor Additional Charge', 'Vendor Exception Fee', 'Reimbursement Expense'].map(item => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#333', cursor: 'not-allowed' }}>
                <input type="checkbox" checked={stmt.settlementItems.includes(item)} disabled readOnly />
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* Total Amount Payable bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '12px 18px', background: '#f6f9ff', borderRadius: 6, border: '1px solid #d6e4ff', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Total Amount Payable</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: isVP ? 24 : 0 }}>
              <div>
                {isVP && <div style={{ fontSize: 11, color: '#999' }}>TMS Amount</div>}
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>PHP {fmt(tmsTotalPayable)}</div>
              </div>
              {isVP && <>
                <div>
                  <div style={{ fontSize: 11, color: '#999' }}>VP Amount</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#555' }}>{fmt(vpTotalPayable)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#999' }}>Diff</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: tmsTotalPayable !== vpTotalPayable ? '#cf1322' : '#389e0d' }}>
                    {tmsTotalPayable !== vpTotalPayable ? fmt(Math.abs(tmsTotalPayable - vpTotalPayable)) : '—'}
                  </div>
                </div>
              </>}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #d6e4ff', height: 40 }} />
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Statement Tax Mark</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {(['Tax-inclusive', 'Tax-exclusive'] as const).map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'not-allowed' }}>
                  <input type="radio" name="taxMark_detail" value={m} checked={stmt.taxMark === m} disabled readOnly />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>

          {/* Col 1: Waybill Contract Cost */}
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 10 }}>Waybill Contract Cost</div>
            {isVP && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 4, paddingBottom: 6, borderBottom: '1px solid #f0f0f0', marginBottom: 6 }}>
                <div />{colHdr('TMS')}{colHdr('VP')}{colHdr('Diff')}
              </div>
            )}
            {amtRow('Subtotal', tmsWCC, isVP ? vpWCC : undefined, true)}
            {amtRow('Vendor Basic Amount', tmsBasic, isVP ? vpBasic : undefined)}
            {tmsPrePaid > 0 && amtRow('PrePaid Amount', tmsPrePaid, isVP ? vpPrePaid : undefined, false, true)}
            {tmsAdditional > 0 && amtRow('Vendor Additional Charge', tmsAdditional, isVP ? vpAdditional : undefined)}
            {tmsException  > 0 && amtRow('Vendor Exception Fee', tmsException, isVP ? vpException : undefined)}
          </div>

          <div style={{ background: '#f0f0f0' }} />

          {/* Col 2: Claim */}
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 10 }}>Claim</div>
            {stmt.claims.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stmt.claims.map(c => (
                  <div key={c.no} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#555' }}>{c.type}</span>
                    <span style={{ color: '#cf1322', fontWeight: 500 }}>−{fmt(c.amount)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #f0f0f0', paddingTop: 6, marginTop: 2, fontWeight: 600 }}>
                  <span style={{ color: '#333' }}>Subtotal</span>
                  <span style={{ color: '#cf1322' }}>−{fmt(claimTotal)}</span>
                </div>
              </div>
            ) : (
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>
                No claim deductions
              </div>
            )}
          </div>

          <div style={{ background: '#f0f0f0' }} />

          {/* Col 3: Others (VAT, WHT) */}
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 10 }}>Others</div>
            {isVP && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 4, paddingBottom: 6, borderBottom: '1px solid #f0f0f0', marginBottom: 6 }}>
                <div />{colHdr('TMS')}{colHdr('VP')}{colHdr('Diff')}
              </div>
            )}
            {vatRate > 0 && amtRow(`VAT (${vatRate}%)`, tmsVAT, isVP ? vpVAT : undefined)}
            {whtRate > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: isVP ? '2fr 1fr 1fr 1fr' : '2fr 1fr', gap: 4, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: 13, color: '#555' }}>WHT ({whtRate}%)</span>
                <span style={{ fontSize: 13, textAlign: 'right', color: '#cf1322' }}>−{fmt(tmsWHT)}</span>
                {isVP && <span style={{ fontSize: 13, textAlign: 'right', color: '#cf1322' }}>−{fmt(vpWHT)}</span>}
                {isVP && <span style={{ fontSize: 13, textAlign: 'right', color: tmsWHT !== vpWHT ? '#cf1322' : '#389e0d' }}>
                  {tmsWHT !== vpWHT ? fmt(Math.abs(tmsWHT - vpWHT)) : '—'}
                </span>}
              </div>
            )}
            {vatRate === 0 && whtRate === 0 && (
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>
                No tax applied
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Invoice ────────────────────────────────────────────────────────────────

  const renderInvoice = () => (
    <div>
      {stmt.invoices.length > 0 ? (
        <table className="data-table">
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
            {stmt.invoices.map(inv => (
              <tr key={inv.no}>
                <td style={{ color: '#1677ff', fontWeight: 600 }}>{inv.no}</td>
                <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(inv.amount)}</td>
                <td style={{ fontSize: 12, color: '#1677ff' }}>{inv.date}</td>
                <td style={{ fontSize: 12 }}>
                  <span style={{ color: '#1677ff', cursor: 'pointer' }}>{inv.proof}</span>
                </td>
                <td>
                  <button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }}>Void</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
          No invoices added.
        </div>
      )}
    </div>
  );

  // ── Payment ────────────────────────────────────────────────────────────────

  const renderPayment = () => (
    <div>
      {stmt.payments.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'right' }}>Payable Amount</th>
              <th>Payment Application Status</th>
              <th>Payment Application No.</th>
              <th>Proof</th>
              <th>Bank Name</th>
              <th>Bank Account Name</th>
              <th>Bank Account No.</th>
            </tr>
          </thead>
          <tbody>
            {stmt.payments.map((p, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{fmt(p.payableAmount)}</td>
                <td>
                  <span style={{ fontSize: 12, fontWeight: 500, color: p.status === 'Paid' ? '#389e0d' : '#d48806' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#1677ff' }}>{p.applicationNo}</td>
                <td style={{ fontSize: 12 }}>
                  {p.proof !== '—'
                    ? <span style={{ color: '#1677ff', cursor: 'pointer' }}>{p.proof}</span>
                    : <span style={{ color: '#bbb' }}>—</span>
                  }
                </td>
                <td style={{ fontSize: 12 }}>{p.bankName}</td>
                <td style={{ fontSize: 12 }}>{p.bankAccountName}</td>
                <td style={{ fontSize: 12 }}>{p.bankAccountNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
          No payment records.
        </div>
      )}
    </div>
  );

  // ── Operation Log ──────────────────────────────────────────────────────────

  const renderOperationLog = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stmt.operationLog.map((entry, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d9d9d9', marginTop: 4, flexShrink: 0 }} />
            {i < stmt.operationLog.length - 1 && (
              <div style={{ width: 1, flex: 1, background: '#f0f0f0', marginTop: 2 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < stmt.operationLog.length - 1 ? 0 : 0 }}>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>
              <span style={{ color: '#999', marginRight: 10 }}>{entry.time}</span>
              <span>{entry.action}</span>
              <span style={{ color: '#1677ff', marginLeft: 8 }}>{entry.operator}</span>
            </div>
            {entry.detail && (
              <div style={{ fontSize: 12, color: '#888', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, padding: '4px 10px', marginTop: 4 }}>
                Reject Reason: {entry.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Reject / Confirm Dialogs ───────────────────────────────────────────────

  const renderDialogs = () => (
    <>
      {showRejectDialog && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 420 }}>
            <div className="modal-header">
              <span className="modal-title">Reject to Vendor</span>
              <button className="modal-close" onClick={() => setShowRejectDialog(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                Please provide a reason for rejection. This will be sent to the vendor and the statement will be set to <strong>Awaiting Rebill</strong>.
              </p>
              <textarea
                style={{ width: '100%', minHeight: 100, border: '1px solid #d9d9d9', borderRadius: 4, padding: 10, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Enter reject reason…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowRejectDialog(false)}>Cancel</button>
              <button className="btn-danger" disabled={!rejectReason.trim()} onClick={() => setShowRejectDialog(false)}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Confirm &amp; Create RFP</span>
              <button className="modal-close" onClick={() => setShowConfirmDialog(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#555' }}>
                Confirm comparison result for <strong>{stmt.no}</strong> and create a Request for Payment?
              </p>
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, padding: '10px 14px', marginTop: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#666' }}>TMS Amount</span>
                  <span style={{ fontWeight: 600 }}>PHP {fmt(tmsTotalPayable)}</span>
                </div>
                {isVP && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#666' }}>VP Amount</span>
                    <span style={{ fontWeight: 600 }}>{fmt(vpTotalPayable)}</span>
                  </div>
                )}
                {isVP && tmsTotalPayable !== vpTotalPayable && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cf1322' }}>
                    <span>Difference</span>
                    <span style={{ fontWeight: 600 }}>{fmt(Math.abs(tmsTotalPayable - vpTotalPayable))}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowConfirmDialog(false)}>Confirm &amp; Create RFP</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── Main Render ────────────────────────────────────────────────────────────

  const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '18px 20px', marginBottom: 14 };

  return (
    <>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack} style={{ fontSize: 13 }}>← Back</button>
        {renderTopActions()}
      </div>

      {/* Reject reason banner */}
      {stmt.rejectReason && (
        <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6, padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#cf1322' }}>
          <strong>Reject Reason:</strong> {stmt.rejectReason}
        </div>
      )}

      {/* ── Basic Information ── */}
      <div style={CARD}>
        <SectionHeader title="Basic Information" />
        <KVRow items={[
          { label: 'Statement No.',      value: <strong>{stmt.no}</strong> },
          { label: 'Statement Type',     value: stmt.statementType },
          { label: 'Status',             value: <span style={{ ...BASE_BADGE, ...STATUS_STYLE[stmt.status] }}>{stmt.status}</span> },
          { label: 'Vendor',             value: stmt.vendor },
          { label: 'Statement Tax Mark', value: stmt.taxMark },
        ]} />
        <KVRow items={[
          { label: 'Settlement Items',      value: stmt.settlementItems.length > 0 ? stmt.settlementItems.join(', ') : <span style={{ color: '#bbb' }}>—</span> },
          { label: 'Reconciliation Period', value: stmt.reconciliationPeriod },
          { label: 'Total Amount Payable',  value: <strong>{stmt.currency} {fmt(tmsTotalPayable)}</strong> },
          { label: 'Total Invoice Amount',  value: stmt.invoices.length > 0 ? `${stmt.currency} ${fmt(stmt.invoices.reduce((s, i) => s + i.amount, 0))}` : <span style={{ color: '#bbb' }}>—</span> },
          { label: 'Paid Amount',           value: stmt.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.payableAmount, 0) > 0
              ? `${stmt.currency} ${fmt(stmt.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.payableAmount, 0))}`
              : <span style={{ color: '#bbb' }}>—</span>
          },
        ]} />
        <KVRow items={[
          { label: 'Source',       value: <span style={{ fontSize: 12, borderRadius: 4, padding: '2px 8px', ...(isVP ? { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3' } : { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' }) }}>{stmt.source}</span> },
          { label: 'Create Date',  value: stmt.createDate },
          { label: 'Create By',    value: stmt.createBy },
          { label: '', value: '' },
          { label: '', value: '' },
        ]} />
      </div>

      {/* ── Settlement Details ── */}
      <div style={CARD}>
        <SectionHeader
          title="Settlement Details"
          action={isEditable ? <button className="btn-default" style={{ fontSize: 12 }}>Add Waybill</button> : undefined}
        />

        {/* Waybill list header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
            Waybill List ({stmt.waybills.length})
          </span>
          <span style={{ color: '#d9d9d9' }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
            Claim Ticket List ({stmt.claims.length})
          </span>
        </div>

        {renderWaybillTable()}

        {/* Claim tickets (below waybill table) */}
        {stmt.claims.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>
              Claim Ticket List ({stmt.claims.length})
            </div>
            {renderClaimTable()}
          </div>
        )}
      </div>

      {/* ── Amount Summary ── */}
      <div style={CARD}>
        <SectionHeader title="Amount Summary" />
        {renderAmountSummary()}
      </div>

      {/* ── Invoice ── */}
      <div style={CARD}>
        <SectionHeader
          title="Invoice"
          action={<button className="btn-default" style={{ fontSize: 12 }}>Add Invoice</button>}
        />
        {renderInvoice()}
      </div>

      {/* ── Payment ── */}
      <div style={CARD}>
        <SectionHeader title="Payment" />
        {renderPayment()}
      </div>

      {/* ── Operation Log ── */}
      <div style={CARD}>
        <SectionHeader title="Operation Log" />
        {renderOperationLog()}
      </div>

      {renderDialogs()}
    </>
  );
}

export default ApStatementDetail;
