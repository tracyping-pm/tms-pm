import React, { useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';

interface Props {
  statementId: string;
  onBack: () => void;
}

type Status =
  | 'Awaiting Confirmation'
  | 'Awaiting Comparison'
  | 'Pending Payment'
  | 'Partially Payment'
  | 'Paid'
  | 'Awaiting Rebill';

interface SettlementItem {
  name: string;
  vendorAmount: number;
  tmsAmount: number;
}

interface WaybillRow {
  no: string;
  truckType: string;
  origin: string;
  destination: string;
  positionTime?: string;
  unloadingTime?: string;
  items: SettlementItem[];
}

interface StatementData {
  id: string;
  vendor: string;
  source: 'Vendor Portal' | 'Internal';
  status: Status;
  currency: string;
  createdAt: string;
  createdBy?: string;
  taxMark?: string;
  totalInvoiceAmount?: number;
  paidAmount?: number;
  waybills: WaybillRow[];
  vendorTotal: number;
  tmsTotal: number;
  rejectReason?: string;
}

type CompareResult = 'Matched' | 'Matched (Vendor Discount)' | 'Mismatched' | 'Missed';
type StatementDetailTab = 'waybill' | 'claim';

const WAYBILL_DETAIL_URL = 'https://rc.gaia.inteluck.com/project/waybill/detail/2530248';

interface ClaimTicketRow {
  ticketNo: string;
  claimType: string;
  customer: string;
  claimAmount: number;
  allocatableAmount: number;
  currency: string;
  claimReason: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

function computeItemResult(item: SettlementItem): CompareResult {
  const v = item.vendorAmount;
  const t = item.tmsAmount;
  if (t === 0 && v > 0) return 'Missed';
  if (v > t) return 'Mismatched';
  if (v < t) return 'Matched (Vendor Discount)';
  return 'Matched';
}

const STATEMENT_DATA: Record<string, StatementData> = {
  AP2026040007: {
    id: 'AP2026040007',
    vendor: 'Laguna Logistics Corp.',
    source: 'Vendor Portal',
    status: 'Awaiting Confirmation',
    currency: 'PHP',
    createdAt: '2026-04-25',
    waybills: [
      {
        no: 'WB2604050', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus',
        items: [
          { name: 'Basic Freight', vendorAmount: 12500, tmsAmount: 12500 },
          { name: 'Additional Charge', vendorAmount: 800, tmsAmount: 0 },
        ],
      },
      {
        no: 'WB2604051', truckType: '6-Wheeler', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Taguig',
        items: [
          { name: 'Basic Freight', vendorAmount: 8200, tmsAmount: 8200 },
        ],
      },
      {
        no: 'WB2604052', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Batangas',
        items: [
          { name: 'Basic Freight', vendorAmount: 14300, tmsAmount: 14300 },
          { name: 'Additional Charge', vendorAmount: 1400, tmsAmount: 1200 },
        ],
      },
      {
        no: 'WB2604053', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila',
        items: [
          { name: 'Basic Freight', vendorAmount: 10000, tmsAmount: 10000 },
          { name: 'Fuel Surcharge', vendorAmount: 500, tmsAmount: 500 },
        ],
      },
    ],
    vendorTotal: 47700,
    tmsTotal: 46700,
  },
  AP2026040003: {
    id: 'AP2026040003',
    vendor: 'Bangkok Express Logistics',
    source: 'Vendor Portal',
    status: 'Awaiting Comparison',
    currency: 'THB',
    createdAt: '2026-04-18',
    waybills: [
      {
        no: 'WB2604040', truckType: '10-Wheeler', origin: 'TH-Bangkok / Suvarnabhumi', destination: 'TH-Chonburi / Laem Chabang',
        items: [
          { name: 'Basic Freight', vendorAmount: 28000, tmsAmount: 28000 },
          { name: 'Additional Charge', vendorAmount: 2000, tmsAmount: 2000 },
        ],
      },
      {
        no: 'WB2604041', truckType: '6-Wheeler', origin: 'TH-Chonburi', destination: 'TH-Bangkok',
        items: [
          { name: 'Basic Freight', vendorAmount: 18000, tmsAmount: 16500 },
          { name: 'Additional Charge', vendorAmount: 1500, tmsAmount: 1500 },
        ],
      },
      {
        no: 'WB2604042', truckType: '10-Wheeler', origin: 'TH-Bangkok', destination: 'TH-Rayong',
        items: [
          { name: 'Basic Freight', vendorAmount: 30000, tmsAmount: 32000 },
        ],
      },
      {
        no: 'WB2604043', truckType: '4-Wheeler', origin: 'TH-Chonburi', destination: 'TH-Samut Prakan',
        items: [
          { name: 'Basic Freight', vendorAmount: 12000, tmsAmount: 12000 },
          { name: 'Additional Charge', vendorAmount: 800, tmsAmount: 800 },
        ],
      },
      {
        no: 'WB2604044', truckType: '10-Wheeler', origin: 'TH-Bangkok / Port', destination: 'TH-Chonburi',
        items: [
          { name: 'Basic Freight', vendorAmount: 42000, tmsAmount: 42000 },
          { name: 'Additional Charge', vendorAmount: 3000, tmsAmount: 3000 },
        ],
      },
      {
        no: 'WB2604045', truckType: '6-Wheeler', origin: 'TH-Rayong', destination: 'TH-Bangkok',
        items: [
          { name: 'Basic Freight', vendorAmount: 17700, tmsAmount: 17700 },
        ],
      },
    ],
    vendorTotal: 157000,
    tmsTotal: 157500,
  },
  AP2026040002: {
    id: 'AP2026040002',
    vendor: 'Cebu Trans Lines',
    source: 'Vendor Portal',
    status: 'Awaiting Comparison',
    currency: 'PHP',
    createdAt: '2026-04-23',
    waybills: [
      {
        no: 'WB2604060', truckType: '10-Wheeler', origin: 'PH-Cebu / Port', destination: 'PH-Cebu / DC',
        items: [
          { name: 'Basic Freight', vendorAmount: 22000, tmsAmount: 20000 },
          { name: 'Additional Charge', vendorAmount: 1500, tmsAmount: 1500 },
        ],
      },
      {
        no: 'WB2604061', truckType: '6-Wheeler', origin: 'PH-Cebu', destination: 'PH-Lapu-Lapu',
        items: [
          { name: 'Basic Freight', vendorAmount: 15000, tmsAmount: 15000 },
        ],
      },
      {
        no: 'WB2604062', truckType: '4-Wheeler', origin: 'PH-Cebu / Terminal', destination: 'PH-Cebu / Mandaue',
        items: [
          { name: 'Additional Charge', vendorAmount: 3500, tmsAmount: 0 },
        ],
      },
    ],
    vendorTotal: 42000,
    tmsTotal: 36500,
  },
  AP2026040006: {
    id: 'AP2026040006',
    vendor: 'Coca-Cola Bottlers PH Inc.',
    source: 'Internal',
    status: 'Pending Payment',
    currency: 'PHP',
    createdAt: '2026-04-15',
    waybills: [
      {
        no: 'WB2604070', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
        items: [
          { name: 'Basic Freight', vendorAmount: 15000, tmsAmount: 15000 },
          { name: 'Additional Charge', vendorAmount: 1200, tmsAmount: 1200 },
        ],
      },
      {
        no: 'WB2604071', truckType: '6-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila',
        items: [
          { name: 'Basic Freight', vendorAmount: 12000, tmsAmount: 12000 },
          { name: 'Fuel Surcharge', vendorAmount: 600, tmsAmount: 600 },
        ],
      },
      {
        no: 'WB2604072', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
        items: [
          { name: 'Basic Freight', vendorAmount: 14000, tmsAmount: 14000 },
          { name: 'Exception Fee', vendorAmount: 1700, tmsAmount: 1700 },
        ],
      },
    ],
    vendorTotal: 44500,
    tmsTotal: 44500,
  },
  AP2026040005: {
    id: 'AP2026040005',
    vendor: 'SMC Logistics',
    source: 'Internal',
    status: 'Partially Payment',
    currency: 'PHP',
    createdAt: '2026-04-22',
    waybills: [
      {
        no: 'WB2604080', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Bulacan / Sta. Maria',
        items: [
          { name: 'Basic Freight', vendorAmount: 14000, tmsAmount: 14000 },
          { name: 'Additional Charge', vendorAmount: 1800, tmsAmount: 1800 },
        ],
      },
      {
        no: 'WB2604081', truckType: '6-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Quezon City',
        items: [
          { name: 'Basic Freight', vendorAmount: 11000, tmsAmount: 11000 },
          { name: 'Fuel Surcharge', vendorAmount: 700, tmsAmount: 700 },
        ],
      },
      {
        no: 'WB2604082', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Laguna / Calamba',
        items: [
          { name: 'Basic Freight', vendorAmount: 16500, tmsAmount: 16500 },
        ],
      },
      {
        no: 'WB2604083', truckType: '4-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Makati',
        items: [
          { name: 'Basic Freight', vendorAmount: 9800, tmsAmount: 9800 },
          { name: 'Exception Fee', vendorAmount: 2200, tmsAmount: 2200 },
        ],
      },
      {
        no: 'WB2604084', truckType: '6-Wheeler', origin: 'PH-Batangas', destination: 'PH-NCR-Manila',
        items: [
          { name: 'Basic Freight', vendorAmount: 13000, tmsAmount: 13000 },
          { name: 'Additional Charge', vendorAmount: 1200, tmsAmount: 1200 },
        ],
      },
      {
        no: 'WB2604085', truckType: '10-Wheeler', origin: 'PH-NCR-Taguig', destination: 'PH-Rizal / Antipolo',
        items: [
          { name: 'Basic Freight', vendorAmount: 12500, tmsAmount: 12500 },
          { name: 'Fuel Surcharge', vendorAmount: 800, tmsAmount: 800 },
        ],
      },
      {
        no: 'WB2604086', truckType: '4-Wheeler', origin: 'PH-NCR-Parañaque', destination: 'PH-Cavite-Bacoor',
        items: [
          { name: 'Basic Freight', vendorAmount: 14500, tmsAmount: 14500 },
          { name: 'Additional Charge', vendorAmount: 1000, tmsAmount: 1000 },
        ],
      },
    ],
    vendorTotal: 89000,
    tmsTotal: 89000,
  },
};

const FALLBACK: StatementData = {
  id: '',
  vendor: 'Unknown Vendor',
  source: 'Internal',
  status: 'Pending Payment',
  currency: 'PHP',
  createdAt: '2026-04-01',
  createdBy: 'Zhang Jialei',
  taxMark: 'VAT-ex',
  waybills: [],
  vendorTotal: 0,
  tmsTotal: 0,
};

const STATUS_STYLE: Record<Status, React.CSSProperties> = {
  'Awaiting Confirmation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Awaiting Comparison':   { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Pending Payment':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Partially Payment':     { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
  'Paid':                  { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Awaiting Rebill':       { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function fmtDiff(n: number) {
  if (n === 0) return '0.00';
  return `${n > 0 ? '+' : '-'}${fmt(Math.abs(n))}`;
}

type SummaryBucket = 'basic' | 'additional' | 'exception';

const POSITION_TIMES = [
  '2026-04-16 08:30',
  '2026-04-16 10:10',
  '2026-04-17 09:25',
  '2026-04-17 13:40',
  '2026-04-18 07:50',
  '2026-04-18 15:20',
  '2026-04-19 11:05',
];

const UNLOADING_TIMES = [
  '2026-04-16 12:45',
  '2026-04-16 14:35',
  '2026-04-17 13:10',
  '2026-04-17 18:05',
  '2026-04-18 11:25',
  '2026-04-18 19:15',
  '2026-04-19 15:30',
];

function getItemBucket(name: string): SummaryBucket {
  const lower = name.toLowerCase();
  if (lower.includes('exception')) return 'exception';
  if (lower.includes('basic') || lower.includes('freight')) return 'basic';
  return 'additional';
}

function getWaybillBucketTotals(waybill: WaybillRow) {
  return waybill.items.reduce<Record<SummaryBucket, { vendor: number; tms: number }>>((acc, item) => {
    const bucket = getItemBucket(item.name);
    acc[bucket].vendor += item.vendorAmount;
    acc[bucket].tms += item.tmsAmount;
    return acc;
  }, {
    basic: { vendor: 0, tms: 0 },
    additional: { vendor: 0, tms: 0 },
    exception: { vendor: 0, tms: 0 },
  });
}

function getWaybillDisplayTimes(waybill: WaybillRow, index: number) {
  return {
    positionTime: waybill.positionTime || POSITION_TIMES[index % POSITION_TIMES.length],
    unloadingTime: waybill.unloadingTime || UNLOADING_TIMES[index % UNLOADING_TIMES.length],
  };
}

interface InvoiceRecord {
  id: string;
  clientEntity: string;
  no: string;
  amount: string;
  date: string;
  status: 'Verified' | 'Pending Verification';
  proofFileName?: string;
}

const INITIAL_INVOICES: Record<string, InvoiceRecord[]> = {
  AP2026040003: [{ id: '1', clientEntity: 'Bangkok Express TH', no: 'INV-TH-2604003', amount: '156,000.00', date: '2026-04-17', status: 'Verified', proofFileName: 'inv_bkk_apr.pdf' }],
  AP2026040002: [{ id: '2', clientEntity: 'Cebu Trans PH', no: 'INV-PH-2604002', amount: '38,500.00', date: '2026-04-22', status: 'Pending Verification' }],
};

const PROOF_DATA: Record<string, string[]> = {
  AP2026040003: ['waybill_summary_BKK_Apr.pdf', 'delivery_photos.zip'],
};

const CLAIM_TICKET_DATA: Record<string, ClaimTicketRow[]> = {
  AP2026040007: [
    {
      ticketNo: 'PHCT26040506KL',
      claimType: 'Toll Fee',
      customer: 'Laguna DC - Laguna Logistics',
      claimAmount: 450,
      allocatableAmount: 450,
      currency: 'PHP',
      claimReason: 'Toll fee variance during transit',
      status: 'Approved',
      createdDate: '2026-04-25',
      createdBy: 'Inteluck Finance',
    },
  ],
  AP2026040003: [
    {
      ticketNo: 'THCT26041801BK',
      claimType: 'KPI Claim',
      customer: 'Bangkok DC - Bangkok Express',
      claimAmount: 1200,
      allocatableAmount: 1200,
      currency: 'THB',
      claimReason: 'Late delivery over agreed SLA',
      status: 'Approved',
      createdDate: '2026-04-18',
      createdBy: 'TMS Claim Team',
    },
    {
      ticketNo: 'THCT26041802BK',
      claimType: 'Shortage',
      customer: 'Chonburi Hub - Bangkok Express',
      claimAmount: 800,
      allocatableAmount: 800,
      currency: 'THB',
      claimReason: 'Cargo shortage confirmed by customer',
      status: 'Approved',
      createdDate: '2026-04-18',
      createdBy: 'TMS Claim Team',
    },
  ],
  AP2026040002: [
    {
      ticketNo: 'PHCT26042301CB',
      claimType: 'Damage',
      customer: 'Customer A - Cebu Trans',
      claimAmount: 2500,
      allocatableAmount: 2500,
      currency: 'PHP',
      claimReason: 'Cargo damage during transit',
      status: 'Approved',
      createdDate: '2026-04-23',
      createdBy: 'Admin',
    },
  ],
};

interface InvoiceFormRow {
  id: string;
  clientEntity: string;
  no: string;
  date: string;
  amount: string;
  proofFileName: string;
  proofOcrDone: boolean;
}

interface LogEntry {
  color: string;
  time: string;
  desc: string;
  actor: string;
}

const STATIC_LOGS: Record<string, LogEntry[]> = {
  AP2026040007: [
    { color: '#1677ff', time: '2026-04-25 09:20', desc: 'Vendor submitted statement', actor: 'Laguna Logistics Corp. (VP)' },
  ],
  AP2026040003: [
    { color: '#00b96b', time: '2026-04-19 11:05', desc: 'Status changed: Awaiting Confirmation → Awaiting Comparison', actor: 'Zhang Jialei' },
    { color: '#1677ff', time: '2026-04-18 16:00', desc: 'Vendor submitted statement', actor: 'Bangkok Express Logistics (VP)' },
  ],
  AP2026040002: [
    { color: '#00b96b', time: '2026-04-24 10:30', desc: 'Status changed: Awaiting Confirmation → Awaiting Comparison', actor: 'Zhang Jialei' },
    { color: '#1677ff', time: '2026-04-23 14:55', desc: 'Vendor submitted statement', actor: 'Cebu Trans Lines (VP)' },
  ],
};

const LINKED_PAYMENT: Record<string, { appNo: string; appType: string; status: string; amount: string; submittedAt: string; hrStatus: string }> = {
  AP2026040006: {
    appNo: 'APA2604001',
    appType: 'AP Application',
    status: 'Pending Review',
    amount: '44,500.00',
    submittedAt: '2026-04-16 09:30',
    hrStatus: 'Under Review in HR System',
  },
};

interface PaidPaymentApp {
  appNo: string;
  amount: number;
  releasedAt: string;
  proofFile: string;
}

interface UnpaidPaymentApp {
  appNo: string;
  amount: number;
  status: string;
  submittedAt: string;
}

interface PartialPaymentInfo {
  paidAmount: number;
  paidApplications: PaidPaymentApp[];
  unpaidApplications: UnpaidPaymentApp[];
}

const PARTIAL_PAYMENT_DATA: Record<string, PartialPaymentInfo> = {
  AP2026040005: {
    paidAmount: 45000,
    paidApplications: [
      {
        appNo: 'APA2604005A',
        amount: 45000,
        releasedAt: '2026-04-24 15:30',
        proofFile: 'payment_receipt_APA2604005A.pdf',
      },
    ],
    unpaidApplications: [
      {
        appNo: 'APA2604005B',
        amount: 44000,
        status: 'Pending Review',
        submittedAt: '2026-04-25 09:00',
      },
    ],
  },
};

const mockProofNames = ['proof_doc_001.pdf', 'payment_evidence.jpg', 'waybill_scan.png', 'receipt_Apr2026.pdf'];


function ApStatementDetail({ statementId, onBack }: Props) {
  const data = STATEMENT_DATA[statementId] || { ...FALLBACK, id: statementId };

  const [currentStatus, setCurrentStatus] = useState<Status>(data.status);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionDone, setActionDone] = useState<'confirmed' | 'rejected' | 'matched' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedWaybills, setExpandedWaybills] = useState<Set<string>>(() => new Set(data.waybills[0] ? [data.waybills[0].no] : []));
  const [activeStatementTab, setActiveStatementTab] = useState<StatementDetailTab>('waybill');

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES[statementId] || []);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRecord | null>(null);
  const [invoiceFormRows, setInvoiceFormRows] = useState<InvoiceFormRow[]>([]);

  const [proofFiles, setProofFiles] = useState<string[]>(PROOF_DATA[statementId] || []);
  const [claimTickets, setClaimTickets] = useState<ClaimTicketRow[]>(CLAIM_TICKET_DATA[statementId] || []);

  const badge = (s: Status) => ({ ...STATUS_STYLE[s], borderRadius: 4, padding: '3px 10px', fontSize: 13 });
  const statementPaidAmount = data.paidAmount ?? PARTIAL_PAYMENT_DATA[statementId]?.paidAmount ?? (currentStatus === 'Paid' ? data.vendorTotal : 0);
  const statementTotalInvoiceAmount = data.totalInvoiceAmount ?? invoices.reduce((sum, inv) => {
    const amount = Number(inv.amount.replace(/,/g, ''));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const isAwaitingConfirmation = currentStatus === 'Awaiting Confirmation';
  const isAwaitingComparison = currentStatus === 'Awaiting Comparison';
  const isPendingPayment = currentStatus === 'Pending Payment';
  const isPartiallyPayment = currentStatus === 'Partially Payment';

  const allReady = data.waybills.every(w =>
    w.items.every(item => {
      const r = computeItemResult(item);
      return r === 'Matched' || r === 'Matched (Vendor Discount)';
    })
  );

  const mismatchCount = data.waybills.filter(w =>
    w.items.some(item => {
      const r = computeItemResult(item);
      return r === 'Mismatched' || r === 'Missed';
    })
  ).length;

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    setCurrentStatus('Awaiting Comparison');
    setActionDone('confirmed');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    setShowRejectDialog(false);
    setCurrentStatus('Awaiting Rebill');
    setActionDone('rejected');
  };

  const handleFinalise = () => {
    setCurrentStatus(mismatchCount > 0 ? 'Awaiting Rebill' : 'Pending Payment');
    setActionDone('matched');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Comparison refreshed.');
    }, 1000);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleWaybill = (waybillNo: string) => {
    setExpandedWaybills(prev => {
      const next = new Set(prev);
      if (next.has(waybillNo)) next.delete(waybillNo);
      else next.add(waybillNo);
      return next;
    });
  };

  const openWaybillDetail = () => {
    window.open(WAYBILL_DETAIL_URL, '_blank', 'noopener,noreferrer');
  };

  const openAddInvoice = () => {
    setInvoiceFormRows([{ id: Date.now().toString(), clientEntity: '', no: '', date: '', amount: '', proofFileName: '', proofOcrDone: false }]);
    setEditingInvoice(null);
    setShowInvoiceDialog(true);
  };

  const openEditInvoice = (inv: InvoiceRecord) => {
    setInvoiceFormRows([{ id: inv.id, clientEntity: inv.clientEntity, no: inv.no, date: inv.date, amount: inv.amount, proofFileName: inv.proofFileName || '', proofOcrDone: !!inv.proofFileName }]);
    setEditingInvoice(inv);
    setShowInvoiceDialog(true);
  };

  const handleInvoiceConfirm = () => {
    if (editingInvoice) {
      const row = invoiceFormRows[0];
      setInvoices(prev => prev.map(i => i.id === editingInvoice.id ? {
        ...i,
        clientEntity: row.clientEntity,
        no: row.no,
        date: row.date,
        amount: row.amount,
        proofFileName: row.proofFileName || undefined,
      } : i));
    } else {
      const newInvs: InvoiceRecord[] = invoiceFormRows
        .filter(r => r.no.trim())
        .map(r => ({
          id: r.id,
          clientEntity: r.clientEntity,
          no: r.no,
          date: r.date,
          amount: r.amount,
          status: 'Pending Verification' as const,
          proofFileName: r.proofFileName || undefined,
        }));
      setInvoices(prev => [...prev, ...newInvs]);
    }
    setShowInvoiceDialog(false);
  };

  const updateFormRow = (id: string, field: keyof InvoiceFormRow, value: string | boolean) => {
    setInvoiceFormRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addFormRow = () => {
    setInvoiceFormRows(prev => [...prev, { id: Date.now().toString(), clientEntity: '', no: '', date: '', amount: '', proofFileName: '', proofOcrDone: false }]);
  };

  const removeFormRow = (id: string) => {
    setInvoiceFormRows(prev => prev.filter(r => r.id !== id));
  };

  const handleProofUpload = (rowId: string) => {
    updateFormRow(rowId, 'proofFileName', '');
    updateFormRow(rowId, 'proofOcrDone', false);
    setTimeout(() => {
      updateFormRow(rowId, 'proofFileName', 'invoice_scan.pdf');
      updateFormRow(rowId, 'proofOcrDone', true);
    }, 1500);
  };

  const staticLogs: LogEntry[] = STATIC_LOGS[statementId] || [
    { color: '#00b96b', time: `${data.createdAt} 08:00`, desc: 'Statement created', actor: 'Zhang Jialei' },
  ];

  const dynamicLogs: LogEntry[] = [];
  if (actionDone === 'confirmed') {
    dynamicLogs.push({ color: '#00b96b', time: '刚刚', desc: 'Status changed: Awaiting Confirmation → Awaiting Comparison', actor: 'Zhang Jialei' });
  } else if (actionDone === 'rejected') {
    dynamicLogs.push({ color: '#00b96b', time: '刚刚', desc: 'Statement sent back to vendor', actor: 'Zhang Jialei' });
  } else if (actionDone === 'matched' && mismatchCount === 0) {
    dynamicLogs.push({ color: '#00b96b', time: '刚刚', desc: 'Confirm & Create Vendor Payment triggered', actor: 'Zhang Jialei' });
  }

  const allLogs = [...dynamicLogs, ...staticLogs];

  const vpAmountSummary = data.waybills.reduce<Record<SummaryBucket, number>>((acc, waybill) => {
    waybill.items.forEach(item => {
      acc[getItemBucket(item.name)] += item.vendorAmount;
    });
    return acc;
  }, { basic: 0, additional: 0, exception: 0 });

  const tmsAmountSummary = data.waybills.reduce<Record<SummaryBucket, number>>((acc, waybill) => {
    waybill.items.forEach(item => {
      acc[getItemBucket(item.name)] += item.tmsAmount;
    });
    return acc;
  }, { basic: 0, additional: 0, exception: 0 });

  const vpClaimAmount = claimTickets.reduce((sum, ticket) => sum + ticket.claimAmount, 0);
  const tmsClaimAmount = claimTickets.reduce((sum, ticket) => sum + ticket.allocatableAmount, 0);
  const vpKpiClaim = claimTickets.filter(ticket => ticket.claimType.toLowerCase().includes('kpi')).reduce((sum, ticket) => sum + ticket.claimAmount, 0);
  const tmsKpiClaim = claimTickets.filter(ticket => ticket.claimType.toLowerCase().includes('kpi')).reduce((sum, ticket) => sum + ticket.allocatableAmount, 0);
  const vpOthersAmount = 0;
  const tmsOthersAmount = 0;
  const vpVatAmount = data.taxMark === 'VAT-in' ? Math.round(data.vendorTotal / 1.12 * 0.12 * 100) / 100 : 0;
  const tmsVatAmount = data.taxMark === 'VAT-in' ? Math.round(data.tmsTotal / 1.12 * 0.12 * 100) / 100 : 0;
  const vpWhtAmount = 0;
  const tmsWhtAmount = 0;
  const totalAmountPayable = data.vendorTotal + vpClaimAmount + vpKpiClaim + vpOthersAmount + vpVatAmount - vpWhtAmount;
  const tmsTotalAmountPayable = data.tmsTotal + tmsClaimAmount + tmsKpiClaim + tmsOthersAmount + tmsVatAmount - tmsWhtAmount;

  // Waybill table renderer: VP submitted parent rows with expandable amount details.
  const renderWaybillTable = () => {
    return (
      <table className="data-table ap-waybill-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Waybill</th>
            <th style={{ textAlign: 'right' }}>TMS Amount</th>
            <th style={{ textAlign: 'right' }}>VP Amount</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Discrepancy</th>
            <th>Position Time</th>
            <th>Unloading Time</th>
            <th>Truck Type</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.waybills.map((w, index) => {
            const wVendorTotal = w.items.reduce((s, i) => s + i.vendorAmount, 0);
            const wTmsTotal = w.items.reduce((s, i) => s + i.tmsAmount, 0);
            const discrepancy = wVendorTotal - wTmsTotal;
            const isMatch = discrepancy === 0;
            const bucketTotals = getWaybillBucketTotals(w);
            const isExpanded = expandedWaybills.has(w.no);
            const times = getWaybillDisplayTimes(w, index);
            return (
              <React.Fragment key={w.no}>
                <tr className="ap-waybill-parent" onClick={() => toggleWaybill(w.no)}>
                  <td style={{ fontWeight: 700, color: '#1677ff' }}>
                    <span style={{ display: 'inline-block', width: 16, color: '#777' }}>{isExpanded ? '▾' : '▸'}</span>
                    {w.no}
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>{fmt(wTmsTotal)}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{fmt(wVendorTotal)}</td>
                  <td>
                    <span style={isMatch
                      ? { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
                      : { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
                    }>
                      {isMatch ? 'Match' : 'Discrepancy'}
                    </span>
                  </td>
                  <td className="num" style={{ color: isMatch ? '#389e0d' : discrepancy > 0 ? '#cf1322' : '#d46b08', fontWeight: 600 }}>
                    {fmtDiff(discrepancy)}
                  </td>
                  <td style={{ fontSize: 12 }}>{times.positionTime}</td>
                  <td style={{ fontSize: 12 }}>{times.unloadingTime}</td>
                  <td style={{ fontSize: 12 }}>{w.truckType}</td>
                  <td style={{ fontSize: 12 }}>{w.origin}</td>
                  <td style={{ fontSize: 12 }}>{w.destination}</td>
                  <td>
                    {!isMatch ? (
                      <button
                        className="btn-link ap-icon-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWaybillDetail();
                        }}
                        title="Open waybill detail for price modification"
                      >
                        <ExternalLink size={14} />
                        Edit Price
                      </button>
                    ) : (
                      <span style={{ color: '#bbb', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="ap-waybill-detail-row">
                    <td colSpan={11}>
                      <div className="ap-waybill-detail">
                        <table className="data-table" style={{ width: '100%' }}>
                          <thead>
                            <tr>
                              <th>Waybill Item</th>
                              <th style={{ textAlign: 'right' }}>TMS Amount</th>
                              <th style={{ textAlign: 'right' }}>VP Amount</th>
                              <th style={{ textAlign: 'right' }}>Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {([
                              ['Basic Amount', bucketTotals.basic],
                              ['Additional Charge', bucketTotals.additional],
                              ['Exception Fee', bucketTotals.exception],
                            ] as const).map(([label, totals]) => {
                              const diff = totals.vendor - totals.tms;
                              return (
                                <tr key={label}>
                                  <td style={{ fontWeight: 600 }}>{label}</td>
                                  <td className="num">{fmt(totals.tms)}</td>
                                  <td className="num">{fmt(totals.vendor)}</td>
                                  <td className="num" style={{ color: diff === 0 ? '#389e0d' : diff > 0 ? '#cf1322' : '#d46b08', fontWeight: 600 }}>
                                    {fmtDiff(diff)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderClaimTicketTable = () => {
    if (claimTickets.length === 0) {
      return <div className="empty">No claim tickets associated with this statement.</div>;
    }

    return (
      <table className="data-table ap-claim-ticket-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Ticket No.</th>
            <th>Claim Type</th>
            <th>Customer</th>
            <th className="num">Claim Amount</th>
            <th>Claim Reason</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {claimTickets.map(ticket => (
            <tr key={ticket.ticketNo}>
              <td style={{ fontWeight: 700, color: '#1f2937' }}>{ticket.ticketNo}</td>
              <td>{ticket.claimType}</td>
              <td>{ticket.customer}</td>
              <td className="num" style={{ color: '#ff4d4f', fontWeight: 700 }}>
                {fmt(ticket.claimAmount)}
              </td>
              <td>{ticket.claimReason}</td>
              <td>
                <span className="ap-claim-status">{ticket.status}</span>
              </td>
              <td>{ticket.createdDate}</td>
              <td>{ticket.createdBy}</td>
              <td>
                <button
                  className="ap-trash-btn"
                  title="Remove claim ticket"
                  onClick={() => setClaimTickets(prev => prev.filter(item => item.ticketNo !== ticket.ticketNo))}
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Amount Summary for Confirmation/Comparison
  const renderAmountSummaryTable = () => {
    const summaryItem = (label: string, tmsAmount: number, vpAmount: number, strong = false) => {
      const diff = vpAmount - tmsAmount;
      return (
        <div className={`ap-summary-row ${strong ? 'is-strong' : ''}`}>
          <span className="ap-summary-item-label">{label}</span>
          <span className="ap-summary-cell">{fmt(tmsAmount)}</span>
          <span className="ap-summary-cell">{fmt(vpAmount)}</span>
          <span className={`ap-summary-cell diff ${diff === 0 ? 'match' : diff > 0 ? 'up' : 'down'}`}>{fmtDiff(diff)}</span>
        </div>
      );
    };

    const renderSummaryBlock = (
      title: string,
      tmsTotal: number,
      vpTotal: number,
      rows: Array<{ label: string; tms: number; vp: number }>
    ) => (
      <div className="ap-summary-col">
        <div className="ap-summary-block-title">{title}</div>
        <div className="ap-summary-table">
          <div className="ap-summary-table-head">
            <span>Item</span>
            <span>TMS</span>
            <span>VP</span>
            <span>Diff</span>
          </div>
          {summaryItem(title, tmsTotal, vpTotal, true)}
          <div className="ap-summary-sublist">
            {rows.map(row => summaryItem(row.label, row.tms, row.vp))}
          </div>
        </div>
      </div>
    );

    const twoCol: React.CSSProperties = { gridTemplateColumns: 'minmax(132px, 1.3fr) minmax(90px, 1fr)' };
    const renderSimpleSummaryBlock = (
      title: string,
      total: number,
      rows: Array<{ label: string; amount: number }>
    ) => (
      <div className="ap-summary-col">
        <div className="ap-summary-block-title">{title}</div>
        <div className="ap-summary-table">
          <div className="ap-summary-table-head" style={twoCol}>
            <span>Item</span>
            <span>Amount</span>
          </div>
          <div className="ap-summary-row is-strong" style={twoCol}>
            <span className="ap-summary-item-label">{title}</span>
            <span className="ap-summary-cell">{fmt(total)}</span>
          </div>
          <div className="ap-summary-sublist">
            {rows.map(row => (
              <div key={row.label} className="ap-summary-row" style={twoCol}>
                <span className="ap-summary-item-label">{row.label}</span>
                <span className="ap-summary-cell">{fmt(row.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <div className="ap-amount-summary">
        <div className="ap-summary-total">
          <span>Total Amount Payable</span>
          <div className="ap-summary-total-values">
            <span>
              <b>TMS</b>
              {fmt(tmsTotalAmountPayable)}
            </span>
            <span>
              <b>VP</b>
              {fmt(totalAmountPayable)}
            </span>
            <span className={`diff ${totalAmountPayable - tmsTotalAmountPayable === 0 ? 'match' : totalAmountPayable - tmsTotalAmountPayable > 0 ? 'up' : 'down'}`}>
              <b>Diff</b>
              {fmtDiff(totalAmountPayable - tmsTotalAmountPayable)}
            </span>
          </div>
        </div>
        <div className="ap-summary-grid">
          {renderSummaryBlock(
            'Waybill Contract Cost',
            tmsAmountSummary.basic + tmsAmountSummary.additional + tmsAmountSummary.exception,
            vpAmountSummary.basic + vpAmountSummary.additional + vpAmountSummary.exception,
            [
              { label: 'Basic Amount', tms: tmsAmountSummary.basic, vp: vpAmountSummary.basic },
              { label: 'Additional Charge', tms: tmsAmountSummary.additional, vp: vpAmountSummary.additional },
              { label: 'Exception Fee', tms: tmsAmountSummary.exception, vp: vpAmountSummary.exception },
            ]
          )}
          {renderSimpleSummaryBlock(
            'Claim',
            vpClaimAmount,
            [
              { label: 'KPI Claim', amount: vpKpiClaim },
            ]
          )}
          {renderSummaryBlock(
            'Others',
            tmsOthersAmount,
            vpOthersAmount,
            [
              { label: 'VAT', tms: tmsVatAmount, vp: vpVatAmount },
              { label: 'WHT', tms: tmsWhtAmount, vp: vpWhtAmount },
            ]
          )}
        </div>
      </div>
    );
  };

  // Invoice dialog
  const renderInvoiceDialog = () => {
    if (!showInvoiceDialog) return null;
    const isEdit = editingInvoice !== null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 820, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
          <div style={{ borderLeft: '4px solid #00b96b', paddingLeft: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{isEdit ? 'Edit Invoice' : 'Add Invoice'}</div>
          </div>

          {invoiceFormRows.map((row, idx) => (
            <div key={row.id} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, marginBottom: 12, position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice Number</div>
                  <input
                    type="text"
                    style={{ fontSize: 13, border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 10px', width: '100%', boxSizing: 'border-box' }}
                    placeholder="e.g. INV-001"
                    value={row.no}
                    onChange={e => updateFormRow(row.id, 'no', e.target.value)}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice Date</div>
                  <input
                    type="date"
                    style={{ fontSize: 13, border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 10px', width: '100%', boxSizing: 'border-box' }}
                    value={row.date}
                    onChange={e => updateFormRow(row.id, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice Amount</div>
                  <input
                    type="text"
                    style={{ fontSize: 13, border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 10px', width: '100%', boxSizing: 'border-box' }}
                    placeholder="e.g. 10,000.00"
                    value={row.amount}
                    onChange={e => updateFormRow(row.id, 'amount', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Invoice Proof
                    <span style={{ background: '#e6f4ff', color: '#1677ff', fontSize: 11, padding: '1px 6px', borderRadius: 4 }}>AI OCR</span>
                  </div>
                  {row.proofFileName ? (
                    <div
                      style={{ width: 80, height: 80, border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, color: '#555', background: '#f5f5f5', gap: 4 }}
                      onClick={() => handleProofUpload(row.id)}
                    >
                      <div style={{ width: 40, height: 40, background: '#d9d9d9', borderRadius: 4 }} />
                      <div style={{ maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.proofFileName}</div>
                    </div>
                  ) : (
                    <div
                      style={{ width: 80, height: 80, border: '1px dashed #d9d9d9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#bbb' }}
                      onClick={() => handleProofUpload(row.id)}
                    >
                      +
                    </div>
                  )}
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Remove button */}
                  <button
                    style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff4d4f', color: '#fff', fontSize: 20, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => removeFormRow(row.id)}
                  >
                    −
                  </button>
                  {/* Add row button — only on last row in add mode */}
                  {!isEdit && idx === invoiceFormRows.length - 1 && (
                    <button
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#00b96b', color: '#fff', fontSize: 20, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={addFormRow}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-default" onClick={() => setShowInvoiceDialog(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleInvoiceConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn-link" onClick={onBack}>← Back to AP Statement</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{data.id}</h2>
        <span style={badge(currentStatus)}>{currentStatus}</span>
        <span style={data.source === 'Vendor Portal'
          ? { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
          : { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
        }>{data.source}</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAwaitingConfirmation && (
            <>
              <button className="btn-default" style={{ color: '#cf1322', borderColor: '#ffa39e' }} onClick={() => setShowRejectDialog(true)}>
                Reject &amp; Send Back
              </button>
              <button className="btn-primary" onClick={() => setShowConfirmDialog(true)}>
                Confirm &amp; Start Comparison
              </button>
            </>
          )}
          {isAwaitingComparison && (
            <>
              <button className="btn-default" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? 'Refreshing…' : '↻ Refresh'}
              </button>
              <button className="btn-primary" onClick={handleFinalise} disabled={!allReady}>
                Confirm &amp; Create Vendor Payment
              </button>
              {!allReady && (
                <span style={{ fontSize: 12, color: '#cf1322', marginLeft: 8 }}>Resolve all Mismatched / Missed items first.</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action banners */}
      {actionDone === 'confirmed' && (
        <div className="alert" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', marginBottom: 16 }}>
          ✓ Statement confirmed. You can now proceed with the blind comparison below.
        </div>
      )}
      {actionDone === 'rejected' && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 16 }}>
          ✗ Statement sent back to vendor for correction.
        </div>
      )}
      {actionDone === 'matched' && (
        <div className="alert" style={{
          background: mismatchCount > 0 ? '#fff1f0' : '#f6ffed',
          border: `1px solid ${mismatchCount > 0 ? '#ffa39e' : '#b7eb8f'}`,
          color: mismatchCount > 0 ? '#cf1322' : '#389e0d',
          marginBottom: 16,
        }}>
          {mismatchCount > 0
            ? `⚠ Comparison complete — ${mismatchCount} mismatch(es) found. Statement sent back to vendor.`
            : `✓ All waybills matched. AP Application auto-generated and statement moved to Pending Payment.`}
        </div>
      )}

      {/* Statement info */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Statement Info</div>
        <div className="ap-statement-info-grid">
          {[
            ['Statement NO', data.id],
            ['Statement Status', currentStatus],
            ['Statement Tax Mark', data.taxMark || 'VAT-ex'],
            ['Total Amount Payable', fmt(totalAmountPayable)],
            ['Total Invoice Amount', fmt(statementTotalInvoiceAmount)],
            ['Paid Amount', fmt(statementPaidAmount)],
            ['Vendor', data.vendor],
            ['Create date', data.createdAt],
            ['Create By', data.createdBy || 'Zhang Jialei'],
          ].map(([label, value]) => (
            <div className="ap-statement-info-item" key={label as string}>
              <div className="ap-statement-info-label">{label}</div>
              <div className="ap-statement-info-value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Waybill / Comparison table */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>
          Waybill List (Vendor-Submitted)
        </div>
        <div className="ap-statement-tabs">
          <button
            className={`tab-btn ${activeStatementTab === 'waybill' ? 'active' : ''}`}
            onClick={() => setActiveStatementTab('waybill')}
          >
            Waybill List ({data.waybills.length})
          </button>
          <button
            className={`tab-btn ${activeStatementTab === 'claim' ? 'active' : ''}`}
            onClick={() => setActiveStatementTab('claim')}
          >
            Claim Ticket ({claimTickets.length})
          </button>
        </div>
        {isAwaitingComparison && (
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            TMS contract prices are shown for comparison. Results are computed automatically.
            {mismatchCount > 0 && (
              <span style={{ marginLeft: 8, color: '#cf1322' }}>⚠ {mismatchCount} issue(s) to resolve</span>
            )}
          </div>
        )}
        {activeStatementTab === 'waybill' ? renderWaybillTable() : renderClaimTicketTable()}
      </div>

      {/* Amount Summary */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Amount Summary</div>
        {renderAmountSummaryTable()}
      </div>

      {/* Invoice (Awaiting Confirmation / Awaiting Comparison) */}
      {(isAwaitingConfirmation || isAwaitingComparison) && (
        <div className="tms-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-title" style={{ margin: 0 }}>Invoice</div>
            <button className="btn-default" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={openAddInvoice}>
              + Add Invoice
            </button>
          </div>
          {invoices.length === 0 ? (
            <div style={{ fontSize: 13, color: '#999' }}>No invoice uploaded.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Invoice Amount</th>
                  <th>Invoice Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontSize: 13 }}>{inv.no}</td>
                    <td style={{ fontSize: 13 }}>{inv.amount}</td>
                    <td style={{ fontSize: 13 }}>{inv.date}</td>
                    <td>
                      <span style={inv.status === 'Verified'
                        ? { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
                        : { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4, padding: '2px 8px', fontSize: 12 }
                      }>{inv.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-link" style={{ fontSize: 12 }} onClick={() => openEditInvoice(inv)}>Edit</button>
                        <button className="btn-link" style={{ fontSize: 12, color: '#ff4d4f' }} onClick={() => setInvoices(prev => prev.filter(i => i.id !== inv.id))}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Supporting Proof */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>Supporting Proof</div>
          <button
            className="btn-default"
            style={{ marginLeft: 'auto', fontSize: 12 }}
            onClick={() => {
              const name = mockProofNames[proofFiles.length % mockProofNames.length];
              setProofFiles(prev => [...prev, name]);
            }}
          >
            + Add Proof
          </button>
        </div>
        {proofFiles.length === 0 ? (
          <div style={{ fontSize: 13, color: '#999' }}>No proof uploaded.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            {proofFiles.map((f, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span>📄</span>
                <span>{f}</span>
                <a href="#" style={{ fontSize: 12, color: '#1677ff' }}>Download</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment module (Partially Payment) */}
      {isPartiallyPayment && PARTIAL_PAYMENT_DATA[statementId] && (() => {
        const pp = PARTIAL_PAYMENT_DATA[statementId];
        const unpaidTotal = pp.unpaidApplications.reduce((s, a) => s + a.amount, 0);
        return (
          <div className="tms-card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Payment</div>

            {/* Paid amount tile */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '12px 20px', minWidth: 180 }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Paid Amount</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#389e0d' }}>{fmt(pp.paidAmount)}</div>
              </div>
              <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8, padding: '12px 20px', minWidth: 180 }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Remaining Unpaid</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#d46b08' }}>{fmt(unpaidTotal)}</div>
              </div>
              <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 20px', minWidth: 180 }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(data.vendorTotal)}</div>
              </div>
            </div>

            {/* Paid applications */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#389e0d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#389e0d', display: 'inline-block' }} />
                Paid Vendor Payment Applications
              </div>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Application No.</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Released At</th>
                    <th>Payment Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {pp.paidApplications.map(app => (
                    <tr key={app.appNo}>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#1677ff' }}>{app.appNo}</td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: '#389e0d', fontWeight: 600 }}>
                        {fmt(app.amount)}
                      </td>
                      <td style={{ fontSize: 13 }}>{app.releasedAt}</td>
                      <td style={{ fontSize: 13 }}>
                        <a href="#" style={{ color: '#1677ff' }} onClick={e => e.preventDefault()}>
                          📄 {app.proofFile}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Unpaid applications */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#d46b08', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d46b08', display: 'inline-block' }} />
                Pending Vendor Payment Applications
              </div>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Application No.</th>
                    <th style={{ textAlign: 'right' }}>Unpaid Amount</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {pp.unpaidApplications.map(app => (
                    <tr key={app.appNo}>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#1677ff' }}>{app.appNo}</td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: '#d46b08', fontWeight: 600 }}>
                        {fmt(app.amount)}
                      </td>
                      <td>
                        <span style={{ background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{app.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Vendor Payment Application (Pending Payment only) */}
      {isPendingPayment && LINKED_PAYMENT[statementId] && (() => {
        const payment = LINKED_PAYMENT[statementId];
        return (
          <div className="tms-card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Vendor Payment Application</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Application No.</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1677ff' }}>{payment.appNo}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Application Type</div>
                <span style={{ background: '#fff0f6', color: '#c41d7f', border: '1px solid #ffadd2', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>{payment.appType}</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Amount</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{payment.amount}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Submitted At</div>
                <div style={{ fontSize: 13 }}>{payment.submittedAt}</div>
              </div>
            </div>

            {/* Progress stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
              {(['Pending Review', 'Approved', 'Released'] as const).map((step, idx) => {
                const isCurrent = payment.status === step;
                const isPast = idx < ['Pending Review', 'Approved', 'Released'].indexOf(payment.status);
                return (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isCurrent ? '#d46b08' : isPast ? '#00b96b' : '#d9d9d9',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600,
                      }}>
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <div style={{ fontSize: 12, color: isCurrent ? '#d46b08' : isPast ? '#00b96b' : '#aaa', whiteSpace: 'nowrap' }}>{step}</div>
                    </div>
                    {idx < 2 && (
                      <div style={{ flex: 1, height: 2, background: isPast ? '#00b96b' : '#e8e8e8', minWidth: 40, maxWidth: 80 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* HR status info */}
            <div style={{ background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#0958d9', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>ⓘ</span>
              <span>This application is currently "{payment.hrStatus}". TMS will be notified automatically once payment is released.</span>
            </div>
          </div>
        );
      })()}

      {/* Operation Log */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Operation Log</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: log.color, marginTop: 3, flexShrink: 0 }} />
              <div>
                <span style={{ color: '#888', marginRight: 8 }}>{log.time}</span>
                <span>{log.desc}</span>
                <span style={{ color: '#888', marginLeft: 8 }}>· {log.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#fff', border: '1px solid #d9d9d9',
          borderRadius: 8, padding: '12px 18px', maxWidth: 420, fontSize: 13, color: '#333',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 2000,
        }}>
          {toast}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirmDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Confirm Statement</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>
              This will move the statement to <strong>Awaiting Comparison</strong> and unlock the blind comparison view.
              The vendor's submitted amounts are now locked.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-default" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirm}>Confirm & Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {showRejectDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Send Back to Vendor</div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>
              Reject Reason <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <textarea
              style={{ width: '100%', height: 90, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Explain the issue so the vendor can correct and resubmit."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            {!rejectReason.trim() && (
              <div style={{ fontSize: 12, color: '#cf1322', marginTop: 4 }}>Reason is required.</div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-default" onClick={() => setShowRejectDialog(false)}>Cancel</button>
              <button
                style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}
                onClick={handleReject}
              >
                Send Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Add/Edit dialog */}
      {renderInvoiceDialog()}
    </div>
  );
}

export default ApStatementDetail;
