import React, { useEffect, useState } from 'react';
import {
  getApStatement,
  updateApStatementStatus,
  saveApStmtItemChecks,
  appendApStmtLog,
  type SyncedApStatement,
  type ApStmtItemCheck,
} from '../../../common/apStatementSync';

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

type Source = 'Vendor Portal' | 'Internal';

interface WaybillItem { name: string; tmsAmount: number; vpAmount: number; }
interface WaybillRow { no: string; positionTime: string; unloadingTime: string; truckType: string; origin: string; destination: string; items: WaybillItem[]; }
interface ClaimRow { no: string; type: string; amount: number; currency: string; waybillNo: string; }
interface InvoiceRow { no: string; amount: number; date: string; proof: string; }
interface PaymentRow { payableAmount: number; status: string; applicationNo: string; proof: string; bankName: string; bankAccountName: string; bankAccountNo: string; }
interface LogEntry { time: string; action: string; operator: string; detail?: string; }

interface StatementDetail {
  no: string; statementType: 'Standard' | 'Standalone'; status: ApStatus; source: Source;
  vendor: string; taxMark: 'Tax-inclusive' | 'Tax-exclusive'; settlementItems: string[];
  reconciliationPeriod: string; currency: string; createDate: string; createBy: string;
  vatRate: number; whtRate: number; waybills: WaybillRow[]; claims: ClaimRow[];
  invoices: InvoiceRow[]; payments: PaymentRow[]; operationLog: LogEntry[]; rejectReason?: string;
}

interface Props { statementId: string; onBack: () => void; onViewWaybill?: (no: string) => void; onViewClaim?: (no: string) => void; }

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const DETAILS: Record<string, StatementDetail> = {

  APVS2604001: {
    no: 'APVS2604001', statementType: 'Standalone', status: 'Under Payment Preparation',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount', 'Vendor Exception Fee', 'Vendor Additional Charge', 'Reimbursement Expense'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-17', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2604017', positionTime: '2026-04-17 07:30', unloadingTime: '2026-04-16 10:45', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 15500, vpAmount: 15500 }, { name: 'Exception Fee', tmsAmount: 600, vpAmount: 600 }, { name: 'Reimbursement', tmsAmount: 200, vpAmount: 200 }] },
      { no: 'WB2604018', positionTime: '2026-04-18 09:00', unloadingTime: '2026-04-17 18:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 14000, vpAmount: 14000 }, { name: 'Additional Charge', tmsAmount: 800, vpAmount: 800 }] },
      { no: 'WB2604019', positionTime: '2026-04-19 13:00', unloadingTime: '2026-04-18 09:00', truckType: '4-Wheeler', origin: 'PH-Laguna-Calamba / Plant 2', destination: 'PH-NCR-Manila',
        items: [{ name: 'Basic Amount', tmsAmount: 9800, vpAmount: 9800 }] },
    ],
    claims: [{ no: 'PHCT26041701EF', type: 'Shortage Claim', amount: 1500, currency: 'PHP', waybillNo: 'WB2604017' }],
    invoices: [], payments: [],
    operationLog: [
      { time: '2026-04-17 10:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
      { time: '2026-04-19 14:30', action: 'Compared & moved to payment preparation', operator: 'TMS User' },
    ],
  },

  APVS2604002: {
    no: 'APVS2604002', statementType: 'Standard', status: 'Awaiting Comparison',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Vendor Exception Fee', 'Vendor Additional Charge', 'Reimbursement Expense'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-01', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2604011', positionTime: '2026-04-11 09:00', unloadingTime: '2026-04-10 15:30', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 14500, vpAmount: 14500 }, { name: 'PrePaid Amount', tmsAmount: 2000, vpAmount: 2000 }, { name: 'Additional Charge', tmsAmount: 800, vpAmount: 900 }] },
      { no: 'WB2604012', positionTime: '2026-04-12 17:00', unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 13300 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }] },
      { no: 'WB2604013', positionTime: '2026-04-13 11:15', unloadingTime: '2026-04-12 17:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 15000, vpAmount: 15000 }, { name: 'PrePaid Amount', tmsAmount: 1190, vpAmount: 1190 }, { name: 'Additional Charge', tmsAmount: 1200, vpAmount: 1200 }, { name: 'Exception Fee', tmsAmount: 500, vpAmount: 500 }] },
    ],
    claims: [{ no: 'PHCT26041501AB', type: 'KPI Claim', amount: 2000, currency: 'PHP', waybillNo: 'WB2604011' }],
    invoices: [], payments: [],
    operationLog: [{ time: '2026-04-01 10:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' }],
  },

  APVS2604003: {
    no: 'APVS2604003', statementType: 'Standard', status: 'Awaiting Rebill',
    source: 'Vendor Portal', vendor: 'Manila Freight Co.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-10', createBy: 'Manila Freight Co.',
    vatRate: 12, whtRate: 2,
    rejectReason: 'Basic Amount for WB2604013 exceeds contracted rate. Additional Charge for WB2604013 has no supporting proof. Please correct and resubmit.',
    waybills: [
      { no: 'WB2604014', positionTime: '2026-04-14 08:30', unloadingTime: '2026-04-13 11:15', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
        items: [{ name: 'Basic Amount', tmsAmount: 12000, vpAmount: 12500 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }] },
      { no: 'WB2604015', positionTime: '2026-04-15 14:00', unloadingTime: '2026-04-14 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 13300 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }] },
      { no: 'WB2604016', positionTime: '2026-04-16 10:45', unloadingTime: '2026-04-15 14:00', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
        items: [{ name: 'Basic Amount', tmsAmount: 11800, vpAmount: 11800 }, { name: 'PrePaid Amount', tmsAmount: 0, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 500, vpAmount: 500 }] },
    ],
    claims: [], invoices: [], payments: [],
    operationLog: [
      { time: '2026-04-10 09:00', action: 'Created the AP statement', operator: 'Manila Freight Co.' },
      { time: '2026-04-12 14:30', action: 'Rejected the AP statement', operator: 'Keris', detail: 'Basic Amount for WB2604013 exceeds contracted rate.' },
    ],
  },

  APVS2604004: {
    no: 'APVS2604004', statementType: 'Standard', status: 'Pending Payment',
    source: 'Internal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-exclusive', settlementItems: ['Basic Amount'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-01', createBy: 'Zhang Jialei',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2604020', positionTime: '2026-04-01 08:00', unloadingTime: '2026-03-31 18:00', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 16800, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 900, vpAmount: 0 }] },
      { no: 'WB2604021', positionTime: '2026-04-02 09:30', unloadingTime: '2026-04-01 08:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 0 }] },
      { no: 'WB2604022', positionTime: '2026-04-03 14:00', unloadingTime: '2026-04-02 09:30', truckType: '4-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Manila',
        items: [{ name: 'Basic Amount', tmsAmount: 9800, vpAmount: 0 }, { name: 'Exception Fee', tmsAmount: 500, vpAmount: 0 }] },
    ],
    claims: [],
    invoices: [{ no: 'INV-2026-00185', amount: 44821, date: '2026-04-05', proof: 'invoice_185.pdf' }],
    payments: [{ payableAmount: 44821, status: 'Pending', applicationNo: 'PA2604001', proof: 'payment_proof.pdf', bankName: 'BDO Unibank', bankAccountName: 'Laguna Logistics Corp.', bankAccountNo: '1234567890' }],
    operationLog: [
      { time: '2026-04-01 10:00', action: 'Created the AP statement', operator: 'Zhang Jialei' },
      { time: '2026-04-03 14:20', action: 'Confirmed & Created RFP', operator: 'Zhang Jialei' },
      { time: '2026-04-05 09:00', action: 'Invoice added', operator: 'Zhang Jialei' },
    ],
  },

  APVS2604005: {
    no: 'APVS2604005', statementType: 'Standard', status: 'Partially Payment',
    source: 'Internal', vendor: 'Laguna Logistics Corp.',
    taxMark: 'Tax-inclusive', settlementItems: ['Basic Amount', 'Vendor Additional Charge'],
    reconciliationPeriod: '2026-04-01 ~ 2026-04-30',
    currency: 'PHP', createDate: '2026-04-10', createBy: 'Zhang Jialei',
    vatRate: 12, whtRate: 2,
    waybills: [
      { no: 'WB2604030', positionTime: '2026-04-05 08:00', unloadingTime: '2026-04-04 18:00', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
        items: [{ name: 'Basic Amount', tmsAmount: 16800, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 1200, vpAmount: 0 }] },
      { no: 'WB2604031', positionTime: '2026-04-06 09:00', unloadingTime: '2026-04-05 08:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
        items: [{ name: 'Basic Amount', tmsAmount: 13300, vpAmount: 0 }] },
      { no: 'WB2604032', positionTime: '2026-04-07 11:00', unloadingTime: '2026-04-06 09:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila',
        items: [{ name: 'Basic Amount', tmsAmount: 15000, vpAmount: 0 }, { name: 'Additional Charge', tmsAmount: 800, vpAmount: 0 }] },
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

// ─── Build StatementDetail from localStorage sync entry ────────────────────────

function buildFromSync(id: string): StatementDetail | undefined {
  const s: SyncedApStatement | undefined = getApStatement(id);
  if (!s) return undefined;
  return {
    no: s.no,
    statementType: s.statementType,
    status: s.status as ApStatus,
    source: s.source,
    vendor: s.vendorName,
    taxMark: s.taxMark,
    settlementItems: s.settlementItems,
    reconciliationPeriod: s.reconciliationPeriod,
    currency: 'PHP',
    createDate: s.createdAt.slice(0, 10),
    createBy: s.vendorName,
    vatRate: s.vatRate,
    whtRate: s.whtRate,
    rejectReason: s.rejectReason,
    waybills: (s.waybills ?? []).map(w => ({
      no: w.no,
      positionTime: w.positionTime,
      unloadingTime: w.unloadingTime,
      truckType: w.truckType,
      origin: w.origin,
      destination: w.destination,
      items: [
        ...(s.settlementItems.includes('Basic Amount')
          ? [{ name: 'Basic Amount', tmsAmount: w.basicAmount, vpAmount: w.basicAmount }] : []),
        ...(s.settlementItems.includes('Vendor Additional Charge')
          ? [{ name: 'Additional Charge', tmsAmount: w.additionalCharge, vpAmount: w.additionalCharge }] : []),
        ...(s.settlementItems.includes('Vendor Exception Fee')
          ? [{ name: 'Exception Fee', tmsAmount: w.exceptionFee, vpAmount: w.exceptionFee }] : []),
        ...(s.settlementItems.includes('Reimbursement Expense')
          ? [{ name: 'Reimbursement', tmsAmount: w.reimbursement, vpAmount: w.reimbursement }] : []),
      ],
    })),
    claims: (s.claims ?? []).map(c => ({ no: c.no, type: c.type, amount: c.amount, currency: 'PHP', waybillNo: c.waybillNo })),
    invoices: [],
    payments: [],
    operationLog: (s.operationLogs || []).map(l => ({
      time: l.time.slice(0, 16).replace('T', ' '),
      action: l.action,
      operator: l.actor,
      detail: l.note,
    })),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function compareResult(tms: number, vp: number): { label: string; color: string } {
  if (vp === 0) return { label: '—', color: '#999' };
  return tms === vp ? { label: 'Matched', color: '#389e0d' } : { label: 'MisMatched', color: '#cf1322' };
}

function waybillTotals(w: WaybillRow, isVP: boolean) {
  const prepaid = w.items.find(i => i.name === 'PrePaid Amount');
  const tms = w.items.filter(i => i.name !== 'PrePaid Amount').reduce((s, i) => s + i.tmsAmount, 0) - (prepaid?.tmsAmount ?? 0);
  const vp = isVP ? w.items.filter(i => i.name !== 'PrePaid Amount').reduce((s, i) => s + i.vpAmount, 0) - (prepaid?.vpAmount ?? 0) : 0;
  return { tms, vp, diff: tms - vp };
}

// ─── Status Styles ─────────────────────────────────────────────────────────────

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

const PAYMENT_DEFINITIONS = ['Bank Transfer', 'Cash', 'Check'];
const ENTITIES = ['PH Entity', 'TH Entity', 'SG Entity'];
const BUSINESS_UNITS = ['Logistics & Trucking', 'Freight Forwarding', 'Warehousing'];
const PAYMENT_ID_L2 = ['Domestic Trucking', 'International Freight', 'Last Mile'];

// ─── Sub-components ────────────────────────────────────────────────────────────

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

function ApStatementDetail({ statementId, onBack, onViewWaybill }: Props) {
  const [selectedClaim, setSelectedClaim] = useState<ClaimRow | null>(null);
  // Load base data: hardcoded mock first, then localStorage fallback
  const baseStmt = DETAILS[statementId] ?? buildFromSync(statementId);
  const synced = getApStatement(statementId);

  // Local state for mutable fields — so TMS actions reflect immediately without re-mount
  const [currentStatus, setCurrentStatus] = useState<ApStatus>(() =>
    (synced?.status as ApStatus | undefined) ?? baseStmt?.status ?? 'Awaiting Comparison'
  );
  const [currentRejectReason, setCurrentRejectReason] = useState<string | undefined>(() =>
    synced?.rejectReason ?? baseStmt?.rejectReason
  );
  const [currentLog, setCurrentLog] = useState<LogEntry[]>(() => baseStmt?.operationLog ?? []);
  const [localWaybills, setLocalWaybills] = useState<WaybillRow[]>(() => baseStmt?.waybills ?? []);

  // Merge base data with mutable local state for rendering
  const stmt = baseStmt
    ? { ...baseStmt, status: currentStatus, rejectReason: currentRejectReason, operationLog: currentLog, waybills: localWaybills }
    : baseStmt;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRFPDialog, setShowRFPDialog] = useState(false);
  const [settlementTab, setSettlementTab] = useState<'waybill' | 'claim'>('waybill');

  // OC / Pricing check state (per waybill:item key) — initialized from sync
  type CK = string;
  const [ocChecked, setOcChecked] = useState<Set<CK>>(() => {
    const checks = synced?.itemChecks ?? {};
    return new Set(Object.entries(checks).filter(([, v]) => (v as ApStmtItemCheck).oc).map(([k]) => k));
  });
  const [pricingChecked, setPricingChecked] = useState<Set<CK>>(() => {
    const checks = synced?.itemChecks ?? {};
    return new Set(Object.entries(checks).filter(([, v]) => (v as ApStmtItemCheck).pricing).map(([k]) => k));
  });

  // Persist OC/Pricing checks to localStorage on each change
  useEffect(() => {
    if (!synced && !DETAILS[statementId]) return;
    const allKeys = new Set([...ocChecked, ...pricingChecked]);
    const checkMap: Record<string, ApStmtItemCheck> = {};
    allKeys.forEach(k => { checkMap[k] = { oc: ocChecked.has(k), pricing: pricingChecked.has(k) }; });
    saveApStmtItemChecks(statementId, checkMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocChecked, pricingChecked]);

  // RFP form state
  const [rfpPaymentDef, setRfpPaymentDef] = useState('Bank Transfer');
  const [rfpEntity, setRfpEntity] = useState('');
  const [rfpBU, setRfpBU] = useState('');
  const [rfpDateNeeded, setRfpDateNeeded] = useState('');
  const [rfpIdL2, setRfpIdL2] = useState('');
  const [rfpDocs] = useState<string[]>(['invoice_draft.pdf']);

  const isVP = stmt?.source === 'Vendor Portal';
  const isEditable = currentStatus === 'Under Payment Preparation';
  const isAwaitingComparison = currentStatus === 'Awaiting Comparison';

  const toggleRow = (no: string) => setExpandedRows((prev: Set<string>) => { const n = new Set(prev); if (n.has(no)) n.delete(no); else n.add(no); return n; });
  const toggleOC = (wNo: string, name: string) => setOcChecked((prev: Set<CK>) => { const n = new Set(prev); const k = `${wNo}:${name}`; if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const togglePricing = (wNo: string, name: string) => setPricingChecked((prev: Set<CK>) => { const n = new Set(prev); const k = `${wNo}:${name}`; if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const removeWaybill = (no: string) => setLocalWaybills(prev => prev.filter(w => w.no !== no));

  // ── Match check logic ──────────────────────────────────────────────────────

  const mismatchedItemKeys = (stmt?.waybills ?? []).flatMap(w =>
    w.items.filter(i => i.name !== 'PrePaid Amount' && compareResult(i.tmsAmount, i.vpAmount).label === 'MisMatched').map(i => `${w.no}:${i.name}`)
  );

  const allMismatchedChecked = mismatchedItemKeys.length === 0 || mismatchedItemKeys.every(k => ocChecked.has(k) && pricingChecked.has(k));

  const canConfirmRFP = (isAwaitingComparison || isEditable) ? allMismatchedChecked : false;

  // ── Amount calculations ────────────────────────────────────────────────────

  const allItems = stmt?.waybills.flatMap(w => w.items) ?? [];
  const sumBy = (name: string, f: 'tmsAmount' | 'vpAmount') => allItems.filter(i => i.name === name).reduce((s, i) => s + i[f], 0);

  const tmsBasic = sumBy('Basic Amount', 'tmsAmount');
  const tmsPrePaid = sumBy('PrePaid Amount', 'tmsAmount');
  const tmsAdditional = sumBy('Additional Charge', 'tmsAmount');
  const tmsException = sumBy('Exception Fee', 'tmsAmount');
  const vpBasic = sumBy('Basic Amount', 'vpAmount');
  const vpPrePaid = sumBy('PrePaid Amount', 'vpAmount');
  const vpAdditional = sumBy('Additional Charge', 'vpAmount');
  const vpException = sumBy('Exception Fee', 'vpAmount');

  const tmsWCC = tmsBasic + tmsAdditional + tmsException - tmsPrePaid;
  const vpWCC = vpBasic + vpAdditional + vpException - vpPrePaid;
  const claimTotal = stmt?.claims.reduce((s, c) => s + c.amount, 0) ?? 0;
  const vatRate = stmt?.vatRate ?? 0;
  const whtRate = stmt?.whtRate ?? 0;
  const tmsVAT = Math.round(tmsWCC * vatRate / 100);
  const tmsWHT = Math.round(tmsWCC * whtRate / 100);
  const vpVAT = Math.round(vpWCC * vatRate / 100);
  const vpWHT = Math.round(vpWCC * whtRate / 100);
  const tmsTotalPayable = tmsWCC - claimTotal + tmsVAT - tmsWHT;
  const vpTotalPayable = vpWCC - claimTotal + vpVAT - vpWHT;

  if (!stmt) {
    return (
      <div className="tms-card" style={{ padding: 40, textAlign: 'center', color: '#999' }}>
        Statement not found.
        <div style={{ marginTop: 16 }}><button className="btn-default" onClick={onBack}>← Back</button></div>
      </div>
    );
  }

  // ── Top action buttons ─────────────────────────────────────────────────────

  const renderTopActions = () => {
    if (isAwaitingComparison || isEditable) return (
      <div style={{ display: 'flex', gap: 8 }}>
        {isAwaitingComparison && <button className="btn-danger" onClick={() => setShowRejectDialog(true)}>Reject to Vendor</button>}
        {isEditable && <button className="btn-default">Save</button>}
        <button
          className="btn-primary"
          disabled={!canConfirmRFP}
          style={!canConfirmRFP ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          onClick={() => canConfirmRFP && setShowRFPDialog(true)}
        >
          Confirm &amp; Create RFP
        </button>
      </div>
    );
    return null;
  };

  // ── Waybill table ──────────────────────────────────────────────────────────

  const renderWaybillTable = () => {
    if (stmt.waybills.length === 0) return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4, marginBottom: 16 }}>
        No waybills added.
      </div>
    );

    return (
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table className="data-table" style={{ minWidth: isVP ? 1140 : 920 }}>
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
                  <tr style={{ background: expanded ? '#fafafa' : undefined }}>
                    <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRow(w.no)}>
                      <span style={{ fontSize: 12, color: '#999', userSelect: 'none' }}>{expanded ? '▼' : '▶'}</span>
                    </td>
                    <td>
                      <strong
                        style={{ color: '#1677ff', cursor: onViewWaybill ? 'pointer' : 'default' }}
                        onClick={() => onViewWaybill?.(w.no)}
                      >
                        {w.no}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(tot.tms)}</td>
                    {isVP && <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(tot.vp)}</td>}
                    {isVP && cmp && (
                      <td><span style={{ fontSize: 12, fontWeight: 500, color: cmp.color }}>{cmp.label}</span></td>
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
                      {(isEditable || isAwaitingComparison) && (
                        <button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }} onClick={() => removeWaybill(w.no)}>Remove</button>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr key={`${w.no}-items`}>
                      <td colSpan={isVP ? 12 : 9} style={{ padding: 0, background: '#f5f7fa' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
                              <th style={{ padding: '5px 32px', textAlign: 'left', fontWeight: 500, color: '#666', fontSize: 11 }}>Waybill Item</th>
                              <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 500, color: '#666', fontSize: 11 }}>TMS Amount</th>
                              {isVP && <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 500, color: '#666', fontSize: 11 }}>VP Amount</th>}
                              {isVP && <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 500, color: '#666', fontSize: 11 }}>Diff</th>}
                              {isVP && <th style={{ padding: '5px 8px', fontWeight: 500, color: '#666', fontSize: 11 }}>Comparison Results</th>}
                              <th style={{ padding: '5px 8px', fontWeight: 500, color: '#666', fontSize: 11 }}>Item Status</th>
                              <th style={{ padding: '5px 8px', fontWeight: 500, color: '#666', fontSize: 11 }}>Operation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {w.items.map((item, idx) => {
                              const isPrePaid = item.name === 'PrePaid Amount';
                              const itemDiff = isVP ? item.tmsAmount - item.vpAmount : 0;
                              const itemCmp = isVP ? compareResult(item.tmsAmount, item.vpAmount) : null;
                              const ck = `${w.no}:${item.name}`;
                              const isOC = ocChecked.has(ck);
                              const isPricing = pricingChecked.has(ck);
                              const isMisMatched = itemCmp?.label === 'MisMatched';
                              return (
                                <tr key={idx} style={{ borderBottom: '1px solid #efefef' }}>
                                  <td style={{ padding: '6px 32px', color: isPrePaid ? '#0958d9' : '#555' }}>
                                    {isPrePaid ? `↳ ${item.name}` : item.name}
                                  </td>
                                  <td style={{ padding: '6px 8px', textAlign: 'right', color: isPrePaid ? '#0958d9' : '#333' }}>
                                    {isPrePaid ? `−${fmt(item.tmsAmount)}` : fmt(item.tmsAmount)}
                                  </td>
                                  {isVP && (
                                    <td style={{ padding: '6px 8px', textAlign: 'right', color: isPrePaid ? '#0958d9' : '#333' }}>
                                      {isPrePaid ? `−${fmt(item.vpAmount)}` : fmt(item.vpAmount)}
                                    </td>
                                  )}
                                  {isVP && (
                                    <td style={{ padding: '6px 8px', textAlign: 'right', color: itemDiff !== 0 ? '#cf1322' : '#389e0d' }}>
                                      {itemDiff !== 0 ? fmt(Math.abs(itemDiff)) : '—'}
                                    </td>
                                  )}
                                  {isVP && itemCmp && (
                                    <td style={{ padding: '6px 8px' }}>
                                      <span style={{ fontSize: 11, fontWeight: 500, color: itemCmp.color }}>{itemCmp.label}</span>
                                    </td>
                                  )}
                                  <td style={{ padding: '6px 8px' }}>
                                    {!isPrePaid ? (
                                      <span style={{ display: 'inline-flex', gap: 4 }}>
                                        {isOC && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }}>OC ✓</span>}
                                        {isPricing && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }}>Pricing ✓</span>}
                                        {!isOC && !isPricing && <span style={{ color: '#bbb' }}>—</span>}
                                      </span>
                                    ) : <span style={{ color: '#bbb' }}>—</span>}
                                  </td>
                                  <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                                    {!isPrePaid && isMisMatched && (
                                      <span style={{ display: 'inline-flex', gap: 6 }}>
                                        <button
                                          className="btn-link"
                                          style={{ fontSize: 11, color: isOC ? '#389e0d' : '#1677ff', fontWeight: isOC ? 600 : 400 }}
                                          onClick={() => toggleOC(w.no, item.name)}
                                        >
                                          {isOC ? '✓ OC' : 'OC Check'}
                                        </button>
                                        <button
                                          className="btn-link"
                                          style={{ fontSize: 11, color: isPricing ? '#389e0d' : '#1677ff', fontWeight: isPricing ? 600 : 400 }}
                                          onClick={() => togglePricing(w.no, item.name)}
                                        >
                                          {isPricing ? '✓ Pricing' : 'Pricing Check'}
                                        </button>
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
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
    );
  };

  // ── Claim table ───────────────────────────────────────────────────────────

  const renderClaimTable = () => {
    if (stmt.claims.length === 0) return (
      <div style={{ padding: '16px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
        No claim tickets attached.
      </div>
    );
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Claim Ticket No.</th>
            <th>Type</th>
            <th>Waybill No.</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'right' }}>Currency</th>
          </tr>
        </thead>
        <tbody>
          {stmt.claims.map(c => (
            <tr key={c.no}>
              <td>
                <strong
                  style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                  onClick={() => setSelectedClaim(c)}
                  title="Click to view claim details"
                >
                  {c.no}
                </strong>
              </td>
              <td style={{ fontSize: 12 }}>{c.type}</td>
              <td style={{ fontSize: 12 }}>
                {c.waybillNo && c.waybillNo !== '—' ? (
                  <strong
                    style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                    onClick={() => onViewWaybill?.(c.waybillNo)}
                    title="Click to view waybill"
                  >
                    {c.waybillNo}
                  </strong>
                ) : (
                  <span style={{ color: '#bbb' }}>—</span>
                )}
              </td>
              <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(c.amount)}</td>
              <td style={{ textAlign: 'right', fontSize: 12, color: '#555' }}>{c.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ── Amount Summary ──────────────────────────────────────────────────────────

  const renderAmountSummary = () => {
    const colHdr = (l: string) => <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>{l}</div>;
    const amtRow = (label: string, tms: number, vp?: number, bold?: boolean, isDeduction?: boolean) => {
      const sign = isDeduction ? '−' : '';
      const s: React.CSSProperties = { fontSize: 13, fontWeight: bold ? 600 : 400, color: isDeduction ? '#0958d9' : '#333' };
      return (
        <div style={{ display: 'grid', gridTemplateColumns: isVP ? '2fr 1fr 1fr 1fr' : '2fr 1fr', gap: 4, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ fontSize: 13, color: isDeduction ? '#0958d9' : '#555', paddingLeft: isDeduction ? 12 : 0 }}>
            {isDeduction ? `↳ ${label}` : label}
          </span>
          <span style={{ ...s, textAlign: 'right' }}>{sign}{fmt(tms)}</span>
          {isVP && <span style={{ ...s, textAlign: 'right' }}>{vp !== undefined ? `${sign}${fmt(vp)}` : '—'}</span>}
          {isVP && <span style={{ ...s, textAlign: 'right', color: tms !== (vp ?? tms) ? '#cf1322' : '#389e0d' }}>
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
                <input type="checkbox" checked={stmt.settlementItems.includes(item)} disabled readOnly /> {item}
              </label>
            ))}
          </div>
        </div>

        {/* Total Amount Payable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '12px 18px', background: '#f6f9ff', borderRadius: 6, border: '1px solid #d6e4ff', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Total Amount Payable</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: isVP ? 24 : 0 }}>
              <div>
                {isVP && <div style={{ fontSize: 11, color: '#999' }}>TMS Amount</div>}
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{fmt(tmsTotalPayable)}</div>
              </div>
              {isVP && <>
                <div><div style={{ fontSize: 11, color: '#999' }}>VP Amount</div><div style={{ fontSize: 20, fontWeight: 700, color: '#555' }}>{fmt(vpTotalPayable)}</div></div>
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
                  <input type="radio" name="taxMark_d" value={m} checked={stmt.taxMark === m} disabled readOnly /> {m}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
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
            {tmsException > 0 && amtRow('Vendor Exception Fee', tmsException, isVP ? vpException : undefined)}
          </div>
          <div style={{ background: '#f0f0f0' }} />
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
                  <span style={{ color: '#333' }}>Subtotal</span><span style={{ color: '#cf1322' }}>−{fmt(claimTotal)}</span>
                </div>
              </div>
            ) : (
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>No claim deductions</div>
            )}
          </div>
          <div style={{ background: '#f0f0f0' }} />
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
                {isVP && <span style={{ fontSize: 13, textAlign: 'right', color: tmsWHT !== vpWHT ? '#cf1322' : '#389e0d' }}>{tmsWHT !== vpWHT ? fmt(Math.abs(tmsWHT - vpWHT)) : '—'}</span>}
              </div>
            )}
            {vatRate === 0 && whtRate === 0 && (
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>No tax applied</div>
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
            <tr><th>Invoice No.</th><th style={{ textAlign: 'right' }}>Invoice Amount</th><th>Invoice Date</th><th>Proof</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {stmt.invoices.map(inv => (
              <tr key={inv.no}>
                <td style={{ color: '#1677ff', fontWeight: 600 }}>{inv.no}</td>
                <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(inv.amount)}</td>
                <td style={{ fontSize: 12, color: '#555' }}>{inv.date}</td>
                <td style={{ fontSize: 12 }}><span style={{ color: '#1677ff', cursor: 'pointer' }}>{inv.proof}</span></td>
                <td><button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }}>Void</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>No invoices added.</div>
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
                <td><span style={{ fontSize: 12, fontWeight: 500, color: p.status === 'Paid' ? '#389e0d' : '#d48806' }}>{p.status}</span></td>
                <td style={{ fontSize: 12, color: '#1677ff' }}>{p.applicationNo}</td>
                <td style={{ fontSize: 12 }}>{p.proof !== '—' ? <span style={{ color: '#1677ff', cursor: 'pointer' }}>{p.proof}</span> : <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ fontSize: 12 }}>{p.bankName}</td>
                <td style={{ fontSize: 12 }}>{p.bankAccountName}</td>
                <td style={{ fontSize: 12 }}>{p.bankAccountNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>No payment records.</div>
      )}
    </div>
  );

  // ── Operation Log ──────────────────────────────────────────────────────────

  const renderOperationLog = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stmt.operationLog.map((entry, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d9d9d9', marginTop: 4, flexShrink: 0 }} />
            {i < stmt.operationLog.length - 1 && <div style={{ width: 1, flex: 1, background: '#f0f0f0', marginTop: 2 }} />}
          </div>
          <div>
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

  // ── Dialogs ────────────────────────────────────────────────────────────────

  const renderDialogs = () => (
    <>
      {selectedClaim && (
        <div className="modal-overlay" onClick={() => setSelectedClaim(null)}>
          <div className="modal-box" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Claim Ticket Details</span>
              <button className="modal-close" onClick={() => setSelectedClaim(null)}>✕</button>
            </div>
            <div className="modal-body">
              {([
                { label: 'Claim Ticket No.', value: <strong style={{ color: '#1677ff' }}>{selectedClaim.no}</strong> },
                { label: 'Claim Type', value: selectedClaim.type },
                { label: 'Related Waybill', value: selectedClaim.waybillNo && selectedClaim.waybillNo !== '—'
                  ? (
                    <strong
                      style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                      onClick={() => { setSelectedClaim(null); onViewWaybill?.(selectedClaim.waybillNo); }}
                    >
                      {selectedClaim.waybillNo}
                    </strong>
                  ) : <span style={{ color: '#bbb' }}>—</span>
                },
                { label: 'Amount', value: <strong style={{ color: '#cf1322' }}>−{fmt(selectedClaim.amount)}</strong> },
                { label: 'Currency', value: selectedClaim.currency },
              ] as { label: string; value: React.ReactNode }[]).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 4 ? '1px solid #f5f5f5' : undefined }}>
                  <span style={{ fontSize: 12, color: '#999', minWidth: 140 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: '#333' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setSelectedClaim(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showRejectDialog && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Reject to Vendor</span>
              <button className="modal-close" onClick={() => setShowRejectDialog(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                Provide a rejection reason. The statement will be set to <strong>Awaiting Rebill</strong>.
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
              <button
                className="btn-danger"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  const now = new Date().toISOString();
                  const logEntry: LogEntry = { time: now.slice(0, 16).replace('T', ' '), action: 'Rejected the AP statement', operator: 'TMS User', detail: rejectReason };
                  setCurrentStatus('Awaiting Rebill');
                  setCurrentRejectReason(rejectReason);
                  setCurrentLog(prev => [...prev, logEntry]);
                  updateApStatementStatus(statementId, { status: 'Awaiting Rebill', rejectReason });
                  appendApStmtLog(statementId, { time: now, actor: 'TMS User', action: 'Rejected the AP statement', note: rejectReason });
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showRFPDialog && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 680 }}>
            <div className="modal-header">
              <span className="modal-title">Create RFP</span>
              <button className="modal-close" onClick={() => setShowRFPDialog(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Responsible Department</div>
                  <select className="filter-select" style={{ width: '100%' }} defaultValue="Account Payable Department">
                    <option>Account Payable Department</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Payment Definition</div>
                  <select className="filter-select" style={{ width: '100%' }} value={rfpPaymentDef} onChange={e => setRfpPaymentDef(e.target.value)}>
                    {PAYMENT_DEFINITIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Entity</div>
                  <select className="filter-select" style={{ width: '100%' }} value={rfpEntity} onChange={e => setRfpEntity(e.target.value)}>
                    <option value=""></option>
                    {ENTITIES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Business Unit</div>
                  <select className="filter-select" style={{ width: '100%' }} value={rfpBU} onChange={e => setRfpBU(e.target.value)}>
                    <option value=""></option>
                    {BUSINESS_UNITS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Date of Needed</div>
                  <input type="date" className="filter-input" style={{ width: '100%' }} value={rfpDateNeeded} onChange={e => setRfpDateNeeded(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>Payment Category</div>
                  <div style={{ fontSize: 13, color: '#555', paddingTop: 6 }}>Vendor Payment</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Payment Identification L1</div>
                  <select className="filter-select" style={{ width: '100%' }} defaultValue="Logistics & Trucking">
                    <option>Logistics &amp; Trucking</option>
                    <option>Global Forwarding</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Payment Identification L2</div>
                  <select className="filter-select" style={{ width: '100%' }} value={rfpIdL2} onChange={e => setRfpIdL2(e.target.value)}>
                    <option value=""></option>
                    {PAYMENT_ID_L2.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>Supporting Documents</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {rfpDocs.map((doc, i) => (
                    <div key={i} style={{ width: 76, height: 76, border: '1px solid #d9d9d9', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                      <div style={{ fontSize: 22, color: '#aaa' }}>📄</div>
                      <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{doc}</div>
                    </div>
                  ))}
                  <div style={{ width: 76, height: 76, border: '1px dashed #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa', fontSize: 26, color: '#ccc' }}>+</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowRFPDialog(false)}>Cancel</button>
              <button
                className="btn-primary"
                disabled={!rfpEntity || !rfpBU || !rfpDateNeeded || !rfpIdL2}
                onClick={() => {
                  const now = new Date().toISOString();
                  const logEntry: LogEntry = { time: now.slice(0, 16).replace('T', ' '), action: 'Confirmed & Created RFP', operator: 'TMS User' };
                  setCurrentStatus('Pending Payment');
                  setCurrentLog(prev => [...prev, logEntry]);
                  updateApStatementStatus(statementId, { status: 'Pending Payment' });
                  appendApStmtLog(statementId, { time: now, actor: 'TMS User', action: 'Confirmed & Created RFP' });
                  setShowRFPDialog(false);
                }}
              >
                Sync
              </button>
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

      {/* Pending checks warning — MisMatched items need OC + Pricing sign-off */}
      {(isAwaitingComparison || isEditable) && mismatchedItemKeys.length > 0 && !allMismatchedChecked && (
        <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6, padding: '10px 16px', marginBottom: 14, fontSize: 13 }}>
          <strong>⚠ Payment Blocked:</strong>{' '}
          MisMatched items require OC Check + Pricing Check before creating RFP.
          {' '}({mismatchedItemKeys.filter(k => ocChecked.has(k) && pricingChecked.has(k)).length}/{mismatchedItemKeys.length} reviewed)
        </div>
      )}

      {/* Basic Information */}
      <div style={CARD}>
        <SectionHeader title="Basic Information" />
        <KVRow items={[
          { label: 'Statement No.', value: <strong>{stmt.no}</strong> },
          { label: 'Statement Type', value: stmt.statementType },
          { label: 'Status', value: <span style={{ ...BASE_BADGE, ...STATUS_STYLE[stmt.status] }}>{stmt.status}</span> },
          { label: 'Vendor', value: stmt.vendor },
          { label: 'Statement Tax Mark', value: stmt.taxMark },
        ]} />
        <KVRow items={[
          { label: 'Settlement Items', value: stmt.settlementItems.length > 0 ? stmt.settlementItems.join(', ') : <span style={{ color: '#bbb' }}>—</span> },
          { label: 'Reconciliation Period', value: stmt.reconciliationPeriod },
          { label: 'Total Amount Payable', value: <strong>{fmt(tmsTotalPayable)}</strong> },
          { label: 'Total Invoice Amount', value: stmt.invoices.length > 0 ? fmt(stmt.invoices.reduce((s, i) => s + i.amount, 0)) : <span style={{ color: '#bbb' }}>—</span> },
          { label: 'Paid Amount', value: (() => { const p = stmt.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.payableAmount, 0); return p > 0 ? fmt(p) : <span style={{ color: '#bbb' }}>—</span>; })() },
        ]} />
        <KVRow items={[
          { label: 'Source', value: <span style={{ fontSize: 12, borderRadius: 4, padding: '2px 8px', ...(isVP ? { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3' } : { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' }) }}>{stmt.source}</span> },
          { label: 'Create Date', value: stmt.createDate },
          { label: 'Create By', value: stmt.createBy },
          { label: '', value: '' }, { label: '', value: '' },
        ]} />
      </div>

      {/* Settlement Details */}
      <div style={{ ...CARD, padding: 0 }}>
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Settlement Details</span>
          </div>
          {(isEditable || isAwaitingComparison) && (
            <div style={{ display: 'flex', gap: 8 }}>
              {settlementTab === 'waybill' && (
                <button className="btn-default" style={{ fontSize: 12 }}>+ Add Waybill</button>
              )}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '0 20px', marginTop: 4 }}>
          {(['waybill', 'claim'] as const).map(tab => {
            const count = tab === 'waybill' ? stmt.waybills.length : stmt.claims.length;
            const label = tab === 'waybill' ? `Waybill (${count})` : `Claim Tickets (${count})`;
            const active = settlementTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSettlementTab(tab)}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#1677ff' : '#555',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #1677ff' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '16px 20px' }}>
          {settlementTab === 'waybill' && renderWaybillTable()}
          {settlementTab === 'claim' && renderClaimTable()}
        </div>
      </div>

      {/* Amount Summary */}
      <div style={CARD}>
        <SectionHeader title="Amount Summary" />
        {renderAmountSummary()}
      </div>

      {/* Invoice */}
      <div style={CARD}>
        <SectionHeader title="Invoice" action={<button className="btn-default" style={{ fontSize: 12 }}>Add Invoice</button>} />
        {renderInvoice()}
      </div>

      {/* Payment */}
      <div style={CARD}>
        <SectionHeader title="Payment" />
        {renderPayment()}
      </div>

      {/* Operation Log */}
      <div style={CARD}>
        <SectionHeader title="Operation Log" />
        {renderOperationLog()}
      </div>

      {renderDialogs()}
    </>
  );
}

export default ApStatementDetail;
