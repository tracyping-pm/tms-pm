import React, { useState, useMemo } from 'react';
import { getAllApplications } from '../../../common/prepaidApplicationSync';

// ─── Exported Types ────────────────────────────────────────────────────────────

export interface NewStatementData {
  statementNo: string;
  statementType: 'Standard' | 'Standalone';
  reconciliationPeriod: string;
  waybillNos: string[];
  totalSubmittedAmount: number;
  createdAt: string;
  isDraft?: boolean;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  prefillWaybillNos: string[];
  onBack: () => void;
  onSubmit: (data: NewStatementData) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const RECONCILIATION_PERIODS = ['Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Dec 2025'];

const VAT_OPTIONS = [
  { label: '0%', value: 0 },
  { label: '7%', value: 7 },
  { label: '12%', value: 12 },
];

const WHT_OPTIONS = [
  { label: '0%', value: 0 },
  { label: '1%', value: 1 },
  { label: '2%', value: 2 },
];

// ─── Waybill Data ──────────────────────────────────────────────────────────────

interface WaybillData {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  additionalCharge: number;
  exceptionFee: number;
  reimbursement: number;
}

const ALL_WAYBILLS: WaybillData[] = [
  { no: 'WB2604011', positionTime: '2026-04-11 09:00', unloadingTime: '2026-04-10 15:30', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig', basicAmount: 14500, additionalCharge: 800, exceptionFee: 0, reimbursement: 0 },
  { no: 'WB2604012', positionTime: '2026-04-12 17:00', unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', basicAmount: 13300, additionalCharge: 0, exceptionFee: 0, reimbursement: 0 },
  { no: 'WB2604013', positionTime: '2026-04-13 11:15', unloadingTime: '2026-04-12 17:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area', basicAmount: 15000, additionalCharge: 1200, exceptionFee: 500, reimbursement: 0 },
  { no: 'WB2604014', positionTime: '2026-04-14 08:30', unloadingTime: '2026-04-13 11:15', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2', basicAmount: 12000, additionalCharge: 0, exceptionFee: 0, reimbursement: 0 },
  { no: 'WB2604015', positionTime: '2026-04-15 14:00', unloadingTime: '2026-04-14 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area', basicAmount: 13300, additionalCharge: 0, exceptionFee: 0, reimbursement: 0 },
  { no: 'WB2604016', positionTime: '2026-04-16 10:45', unloadingTime: '2026-04-15 14:00', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan', basicAmount: 11800, additionalCharge: 500, exceptionFee: 0, reimbursement: 0 },
];

// ─── Claim Ticket Data ─────────────────────────────────────────────────────────

interface ClaimData {
  no: string;
  type: string;
  amount: number;
  currency: string;
  waybillNo: string;
  createdAt: string;
}

const ALL_CLAIMS: ClaimData[] = [
  { no: 'PHCT26041501AB', type: 'KPI Claim',    amount: 2000, currency: 'PHP', waybillNo: 'WB2604015', createdAt: '2026-04-20' },
  { no: 'PHCT26041601BC', type: 'Damage Claim', amount: 3500, currency: 'PHP', waybillNo: 'WB2604016', createdAt: '2026-04-21' },
  { no: 'PHCT26041201CD', type: 'KPI Claim',    amount: 1500, currency: 'PHP', waybillNo: 'WB2604012', createdAt: '2026-04-22' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

let seqCounter = 100;
function generateStatementNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(++seqCounter).padStart(3, '0');
  return `VS${yy}${mm}${seq}`;
}

const SECTION_TITLE_STYLE: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 };
const SECTION_BAR_STYLE: React.CSSProperties = { width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0 };
const SECTION_TEXT_STYLE: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#1a1a1a' };
const CARD_STYLE: React.CSSProperties = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '20px 24px', marginBottom: 16 };

// ─── Component ─────────────────────────────────────────────────────────────────

function BillableCreateStatementForm({ onBack, onSubmit }: Props) {
  // Section 1
  const [statementType, setStatementType] = useState<'Standard' | 'Standalone'>('Standard');
  const [reconciliationPeriod, setReconciliationPeriod] = useState('Apr 2026');

  // Section 2: Tab
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');

  // Section 2: Added items
  const [addedWaybills, setAddedWaybills] = useState<WaybillData[]>([]);
  const [addedClaims, setAddedClaims] = useState<ClaimData[]>([]);

  // Waybill modal
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [modalWaybillFilter, setModalWaybillFilter] = useState('');
  const [modalTruckTypeFilter, setModalTruckTypeFilter] = useState('');
  const [modalSelectedNos, setModalSelectedNos] = useState<Set<string>>(new Set());

  // Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [modalClaimFilter, setModalClaimFilter] = useState('');
  const [modalSelectedClaimNos, setModalSelectedClaimNos] = useState<Set<string>>(new Set());

  // Section 3: Items to settle
  const [includeBasic, setIncludeBasic] = useState(true);
  const [includeAdditional, setIncludeAdditional] = useState(true);
  const [includeException, setIncludeException] = useState(true);
  const [includeReimbursement, setIncludeReimbursement] = useState(true);

  // Section 3: Tax
  const [taxMark, setTaxMark] = useState<'Tax-inclusive' | 'Tax-exclusive'>('Tax-exclusive');
  const [vatRate, setVatRate] = useState(0);
  const [whtRate, setWhtRate] = useState(0);

  // Confirm dialog
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Prepaid lookup ──────────────────────────────────────────────────────────

  const prepaidByWaybill = useMemo(() => {
    const apps = getAllApplications().filter(a => a.status !== 'Draft');
    const map: Record<string, number> = {};
    for (const app of apps) {
      for (const wb of app.waybills) {
        map[wb.no] = (map[wb.no] || 0) + (wb.prePaidAmount || 0);
      }
    }
    return map;
  }, []);

  // ─── Amount calculations ──────────────────────────────────────────────────────

  const totals = useMemo(() => {
    return addedWaybills.reduce(
      (acc: { basic: number; additional: number; exception: number; reimbursement: number }, w: WaybillData) => ({
        basic: acc.basic + w.basicAmount,
        additional: acc.additional + w.additionalCharge,
        exception: acc.exception + w.exceptionFee,
        reimbursement: acc.reimbursement + w.reimbursement,
      }),
      { basic: 0, additional: 0, exception: 0, reimbursement: 0 }
    );
  }, [addedWaybills]);

  const prepaidTotal = useMemo(() => {
    return addedWaybills.reduce((sum: number, w: WaybillData) => sum + (prepaidByWaybill[w.no] || 0), 0);
  }, [addedWaybills, prepaidByWaybill]);

  const claimTotal = useMemo(() => {
    return addedClaims.reduce((sum: number, c: ClaimData) => sum + c.amount, 0);
  }, [addedClaims]);

  const includedBasic = includeBasic ? totals.basic : 0;
  const includedAdditional = includeAdditional ? totals.additional : 0;
  const includedException = includeException ? totals.exception : 0;
  const includedReimbursement = includeReimbursement ? totals.reimbursement : 0;

  const waybillContractCost = includedBasic + includedAdditional + includedException + includedReimbursement - prepaidTotal;
  const vatAmount = Math.round(waybillContractCost * vatRate / 100);
  const whtAmount = Math.round(waybillContractCost * whtRate / 100);
  const totalAmountPayable = waybillContractCost - claimTotal + vatAmount - whtAmount;

  // ─── Waybill modal helpers ────────────────────────────────────────────────────

  const addedWaybillNos = new Set(addedWaybills.map((w: WaybillData) => w.no));
  const availableWaybills = ALL_WAYBILLS.filter((w: WaybillData) => !addedWaybillNos.has(w.no));
  const truckTypeOptions = Array.from(new Set(ALL_WAYBILLS.map(w => w.truckType)));

  const filteredModalWaybills = availableWaybills.filter(w => {
    if (modalWaybillFilter && !w.no.toLowerCase().includes(modalWaybillFilter.toLowerCase())) return false;
    if (modalTruckTypeFilter && w.truckType !== modalTruckTypeFilter) return false;
    return true;
  });

  const openWaybillModal = () => {
    setModalSelectedNos(new Set());
    setModalWaybillFilter('');
    setModalTruckTypeFilter('');
    setShowWaybillModal(true);
  };

  const confirmAddWaybills = () => {
    const toAdd = availableWaybills.filter((w: WaybillData) => modalSelectedNos.has(w.no));
    setAddedWaybills((prev: WaybillData[]) => [...prev, ...toAdd]);
    setShowWaybillModal(false);
  };

  const removeWaybill = (no: string) => setAddedWaybills((prev: WaybillData[]) => prev.filter((w: WaybillData) => w.no !== no));

  const toggleModalWaybill = (no: string) => {
    const n = new Set(modalSelectedNos);
    if (n.has(no)) n.delete(no); else n.add(no);
    setModalSelectedNos(n);
  };

  // ─── Claim modal helpers ──────────────────────────────────────────────────────

  const addedClaimNos = new Set(addedClaims.map((c: ClaimData) => c.no));
  const availableClaims = ALL_CLAIMS.filter((c: ClaimData) => !addedClaimNos.has(c.no));

  const filteredModalClaims = availableClaims.filter(c =>
    !modalClaimFilter || c.no.toLowerCase().includes(modalClaimFilter.toLowerCase())
  );

  const openClaimModal = () => {
    setModalSelectedClaimNos(new Set());
    setModalClaimFilter('');
    setShowClaimModal(true);
  };

  const confirmAddClaims = () => {
    const toAdd = availableClaims.filter((c: ClaimData) => modalSelectedClaimNos.has(c.no));
    setAddedClaims((prev: ClaimData[]) => [...prev, ...toAdd]);
    setShowClaimModal(false);
  };

  const removeClaim = (no: string) => setAddedClaims((prev: ClaimData[]) => prev.filter((c: ClaimData) => c.no !== no));

  const toggleModalClaim = (no: string) => {
    const n = new Set(modalSelectedClaimNos);
    if (n.has(no)) n.delete(no); else n.add(no);
    setModalSelectedClaimNos(n);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSave = () => {
    const data: NewStatementData = {
      statementNo: generateStatementNo(),
      statementType,
      reconciliationPeriod,
      waybillNos: addedWaybills.map(w => w.no),
      totalSubmittedAmount: totalAmountPayable,
      createdAt: new Date().toISOString(),
      isDraft: true,
    };
    onSubmit(data);
  };

  const handleConfirmSubmit = () => {
    const data: NewStatementData = {
      statementNo: generateStatementNo(),
      statementType,
      reconciliationPeriod,
      waybillNos: addedWaybills.map(w => w.no),
      totalSubmittedAmount: totalAmountPayable,
      createdAt: new Date().toISOString(),
      isDraft: false,
    };
    setShowConfirm(false);
    onSubmit(data);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Top Action Bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack} style={{ fontSize: 13 }}>
          ← Back to Billable Waybills
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-default" onClick={handleSave}>Save</button>
          <button className="btn-primary" onClick={() => setShowConfirm(true)}>Submit</button>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────────── */}
      <div style={{ ...CARD_STYLE, padding: '14px 24px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Create Statement</div>
      </div>

      {/* ── Section 1: Statement Info ────────────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <div style={SECTION_TITLE_STYLE}>
          <div style={SECTION_BAR_STYLE} />
          <span style={SECTION_TEXT_STYLE}>Statement Information</span>
        </div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 500 }}>Statement Type</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {(['Standard', 'Standalone'] as const).map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="statementType" value={type} checked={statementType === type} onChange={() => setStatementType(type)} />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 500 }}>Reconciliation Period</div>
            <select className="filter-select" style={{ minWidth: 160 }} value={reconciliationPeriod} onChange={e => setReconciliationPeriod(e.target.value)}>
              {RECONCILIATION_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Section 2: Billing Details ───────────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <div style={SECTION_TITLE_STYLE}>
          <div style={SECTION_BAR_STYLE} />
          <span style={SECTION_TEXT_STYLE}>Billing Details</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
          {[
            { key: 'waybill', label: `Waybills (${addedWaybills.length})` },
            { key: 'claim',   label: `Claim Tickets (${addedClaims.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'waybill' | 'claim')}
              style={{
                padding: '8px 20px', background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #1677ff' : '2px solid transparent',
                color: activeTab === tab.key ? '#1677ff' : '#666',
                fontWeight: activeTab === tab.key ? 600 : 400, fontSize: 13, cursor: 'pointer', marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Waybill Tab */}
        {activeTab === 'waybill' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#666' }}>
                {addedWaybills.length === 0
                  ? 'No waybills added yet.'
                  : <><strong style={{ color: '#333' }}>{addedWaybills.length}</strong> waybill{addedWaybills.length > 1 ? 's' : ''} added.</>
                }
              </span>
              <button
                className="btn-default"
                style={{ fontSize: 13 }}
                onClick={openWaybillModal}
                disabled={availableWaybills.length === 0}
              >
                + Add Waybill
              </button>
            </div>

            {addedWaybills.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waybill No.</th>
                    <th>Position Time</th>
                    <th>Unloading Time</th>
                    <th>Truck Type</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th style={{ textAlign: 'right' }}>Basic Amount</th>
                    <th style={{ textAlign: 'right' }}>Add. Charge</th>
                    <th style={{ textAlign: 'right' }}>Exception Fee</th>
                    <th style={{ width: 72 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {addedWaybills.map(w => (
                    <tr key={w.no}>
                      <td style={{ fontWeight: 600, color: '#1677ff' }}>{w.no}</td>
                      <td style={{ fontSize: 12, color: '#555' }}>{w.positionTime}</td>
                      <td style={{ fontSize: 12, color: '#555' }}>{w.unloadingTime}</td>
                      <td style={{ fontSize: 12 }}>{w.truckType}</td>
                      <td style={{ fontSize: 12, color: '#555' }}>{w.origin}</td>
                      <td style={{ fontSize: 12, color: '#555' }}>{w.destination}</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.basicAmount)}</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.additionalCharge)}</td>
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.exceptionFee)}</td>
                      <td>
                        <button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }} onClick={() => removeWaybill(w.no)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                No waybills added. Click "+ Add Waybill" to select.
              </div>
            )}
          </>
        )}

        {/* Claim Ticket Tab */}
        {activeTab === 'claim' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#666' }}>
                {addedClaims.length === 0
                  ? 'No claim tickets added yet.'
                  : <><strong style={{ color: '#333' }}>{addedClaims.length}</strong> claim ticket{addedClaims.length > 1 ? 's' : ''} added.</>
                }
              </span>
              <button
                className="btn-default"
                style={{ fontSize: 13 }}
                onClick={openClaimModal}
                disabled={availableClaims.length === 0}
              >
                + Add Claim Ticket
              </button>
            </div>

            {addedClaims.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim Ticket No.</th>
                    <th>Type</th>
                    <th>Waybill No.</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Currency</th>
                    <th>Created At</th>
                    <th style={{ width: 72 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {addedClaims.map(c => (
                    <tr key={c.no}>
                      <td style={{ fontWeight: 600, color: '#1677ff' }}>{c.no}</td>
                      <td style={{ fontSize: 12 }}>{c.type}</td>
                      <td style={{ fontSize: 12 }}>{c.waybillNo}</td>
                      <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(c.amount)}</td>
                      <td style={{ fontSize: 12 }}>{c.currency}</td>
                      <td style={{ fontSize: 12 }}>{c.createdAt}</td>
                      <td>
                        <button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }} onClick={() => removeClaim(c.no)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                No claim tickets added. Click "+ Add Claim Ticket" to select.
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Section 3: Amount Summary ────────────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <div style={SECTION_TITLE_STYLE}>
          <div style={SECTION_BAR_STYLE} />
          <span style={SECTION_TEXT_STYLE}>Amount Summary</span>
        </div>

        {/* Items to be settled */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 10, fontWeight: 500 }}>Items to be settled</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeBasic && includeAdditional && includeException && includeReimbursement}
                onChange={e => { setIncludeBasic(e.target.checked); setIncludeAdditional(e.target.checked); setIncludeException(e.target.checked); setIncludeReimbursement(e.target.checked); }} />
              All
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeBasic} onChange={e => setIncludeBasic(e.target.checked)} />
              Vendor Basic Amount
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeAdditional} onChange={e => setIncludeAdditional(e.target.checked)} />
              Vendor Additional Charge
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeException} onChange={e => setIncludeException(e.target.checked)} />
              Vendor Exception Fee
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeReimbursement} onChange={e => setIncludeReimbursement(e.target.checked)} />
              Reimbursement Expense
            </label>
          </div>
        </div>

        {/* Total Amount Payable + Tax Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 20, padding: '14px 20px', background: '#f6f9ff', borderRadius: 6, border: '1px solid #d6e4ff' }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Amount Payable</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>PHP {fmt(totalAmountPayable)}</div>
          </div>
          <div style={{ borderLeft: '1px solid #d6e4ff', height: 48 }} />
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Statement Tax Mark</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {(['Tax-inclusive', 'Tax-exclusive'] as const).map(mark => (
                <label key={mark} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="taxMark" value={mark} checked={taxMark === mark} onChange={() => setTaxMark(mark)} />
                  {mark}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', gap: 0, border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
          {/* Col 1: Waybill Contract Cost */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 14 }}>Waybill Contract Cost</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#555' }}>Vendor Basic Amount</span>
                <span style={{ fontWeight: 500 }}>{includeBasic ? fmt(totals.basic) : <span style={{ color: '#bbb' }}>—</span>}</span>
              </div>
              {prepaidTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingLeft: 12 }}>
                  <span style={{ color: '#0958d9' }}>↳ PrePaid (deduction)</span>
                  <span style={{ color: '#0958d9', fontWeight: 500 }}>−{fmt(prepaidTotal)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#555' }}>Vendor Exception Fee</span>
                <span style={{ fontWeight: 500 }}>{includeException ? fmt(totals.exception) : <span style={{ color: '#bbb' }}>—</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#555' }}>Vendor Additional Charge</span>
                <span style={{ fontWeight: 500 }}>{includeAdditional ? fmt(totals.additional) : <span style={{ color: '#bbb' }}>—</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#555' }}>Reimbursement</span>
                <span style={{ fontWeight: 500 }}>{includeReimbursement ? fmt(totals.reimbursement) : <span style={{ color: '#bbb' }}>—</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4, fontWeight: 600 }}>
                <span style={{ color: '#333' }}>Subtotal</span>
                <span style={{ color: '#1a1a1a' }}>{fmt(waybillContractCost)}</span>
              </div>
            </div>
          </div>

          {/* Divider 1 */}
          <div style={{ background: '#f0f0f0' }} />

          {/* Col 2: Claim */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 14 }}>Claim</div>
            {addedClaims.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addedClaims.map(c => (
                  <div key={c.no} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#555' }}>{c.no}</span>
                    <span style={{ fontWeight: 500, color: '#cf1322' }}>−{fmt(c.amount)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4, fontWeight: 600 }}>
                  <span style={{ color: '#333' }}>Subtotal</span>
                  <span style={{ color: '#cf1322' }}>−{fmt(claimTotal)}</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#bbb', fontSize: 13 }}>
                No claim deductions
              </div>
            )}
          </div>

          {/* Divider 2 */}
          <div style={{ background: '#f0f0f0' }} />

          {/* Col 3: Others */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 14 }}>Others</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#555', minWidth: 60 }}>VAT Rate</span>
                  <select className="filter-select" style={{ fontSize: 12, padding: '3px 8px', minWidth: 72 }} value={vatRate} onChange={e => setVatRate(Number(e.target.value))}>
                    {VAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: vatAmount > 0 ? '#389e0d' : '#999' }}>
                  {vatAmount > 0 ? `+${fmt(vatAmount)}` : fmt(0)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#555', minWidth: 60 }}>WHT Rate</span>
                  <select className="filter-select" style={{ fontSize: 12, padding: '3px 8px', minWidth: 72 }} value={whtRate} onChange={e => setWhtRate(Number(e.target.value))}>
                    {WHT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: whtAmount > 0 ? '#cf1322' : '#999' }}>
                  {whtAmount > 0 ? `−${fmt(whtAmount)}` : fmt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Waybill Modal ─────────────────────────────────────────────────────── */}
      {showWaybillModal && (
        <div className="dialog-overlay">
          <div className="dialog" style={{ maxWidth: 780, width: '90vw' }}>
            <div className="dialog-header">Add Waybill</div>
            <div className="dialog-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input
                  className="filter-input"
                  placeholder="Waybill Number"
                  value={modalWaybillFilter}
                  onChange={e => setModalWaybillFilter(e.target.value)}
                  style={{ width: 160 }}
                />
                <select className="filter-select" value={modalTruckTypeFilter} onChange={e => setModalTruckTypeFilter(e.target.value)}>
                  <option value="">Truck Type: All</option>
                  {truckTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>{modalSelectedNos.size} selected</span>
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>
                        <input
                          type="checkbox"
                          checked={filteredModalWaybills.length > 0 && filteredModalWaybills.every(w => modalSelectedNos.has(w.no))}
                          onChange={e => {
                            const n = new Set(modalSelectedNos);
                            if (e.target.checked) filteredModalWaybills.forEach(w => n.add(w.no));
                            else filteredModalWaybills.forEach(w => n.delete(w.no));
                            setModalSelectedNos(n);
                          }}
                        />
                      </th>
                      <th>Waybill No.</th>
                      <th>Position Time</th>
                      <th>Unloading Time</th>
                      <th>Truck Type</th>
                      <th style={{ textAlign: 'right' }}>Basic Amount</th>
                      <th style={{ textAlign: 'right' }}>Add. Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalWaybills.map(w => {
                      const checked = modalSelectedNos.has(w.no);
                      return (
                        <tr key={w.no} style={checked ? { background: '#f0f7ff' } : {}} onClick={() => toggleModalWaybill(w.no)}>
                          <td onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} onChange={() => toggleModalWaybill(w.no)} />
                          </td>
                          <td style={{ fontWeight: 600 }}>{w.no}</td>
                          <td style={{ fontSize: 12 }}>{w.positionTime}</td>
                          <td style={{ fontSize: 12 }}>{w.unloadingTime}</td>
                          <td style={{ fontSize: 12 }}>{w.truckType}</td>
                          <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.basicAmount)}</td>
                          <td style={{ textAlign: 'right', fontSize: 13 }}>{fmt(w.additionalCharge)}</td>
                        </tr>
                      );
                    })}
                    {filteredModalWaybills.length === 0 && (
                      <tr><td colSpan={7} className="empty">No available waybills.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-default" onClick={() => setShowWaybillModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAddWaybills} disabled={modalSelectedNos.size === 0}>
                Add ({modalSelectedNos.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Claim Ticket Modal ────────────────────────────────────────────────── */}
      {showClaimModal && (
        <div className="dialog-overlay">
          <div className="dialog" style={{ maxWidth: 600, width: '90vw' }}>
            <div className="dialog-header">Add Claim Ticket</div>
            <div className="dialog-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input
                  className="filter-input"
                  placeholder="Claim Ticket No."
                  value={modalClaimFilter}
                  onChange={e => setModalClaimFilter(e.target.value)}
                  style={{ width: 200 }}
                />
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>{modalSelectedClaimNos.size} selected</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>
                        <input
                          type="checkbox"
                          checked={filteredModalClaims.length > 0 && filteredModalClaims.every(c => modalSelectedClaimNos.has(c.no))}
                          onChange={e => {
                            const n = new Set(modalSelectedClaimNos);
                            if (e.target.checked) filteredModalClaims.forEach(c => n.add(c.no));
                            else filteredModalClaims.forEach(c => n.delete(c.no));
                            setModalSelectedClaimNos(n);
                          }}
                        />
                      </th>
                      <th>Claim Ticket No.</th>
                      <th>Type</th>
                      <th>Waybill No.</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalClaims.map(c => {
                      const checked = modalSelectedClaimNos.has(c.no);
                      return (
                        <tr key={c.no} style={checked ? { background: '#f0f7ff' } : {}} onClick={() => toggleModalClaim(c.no)}>
                          <td onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} onChange={() => toggleModalClaim(c.no)} />
                          </td>
                          <td style={{ fontWeight: 600 }}>{c.no}</td>
                          <td style={{ fontSize: 12 }}>{c.type}</td>
                          <td style={{ fontSize: 12 }}>{c.waybillNo}</td>
                          <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(c.amount)}</td>
                        </tr>
                      );
                    })}
                    {filteredModalClaims.length === 0 && (
                      <tr><td colSpan={5} className="empty">No available claim tickets.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-default" onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAddClaims} disabled={modalSelectedClaimNos.size === 0}>
                Add ({modalSelectedClaimNos.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirm Dialog ─────────────────────────────────────────────────── */}
      {showConfirm && (
        <div className="dialog-overlay">
          <div className="dialog" style={{ maxWidth: 460 }}>
            <div className="dialog-header">Confirm Submission</div>
            <div className="dialog-body">
              <p style={{ margin: '0 0 14px', fontSize: 14, color: '#444' }}>
                Once submitted, you will <strong>not be able to modify</strong> this statement.
                Please review the summary below before confirming.
              </p>
              <div style={{ background: '#fafafa', borderRadius: 6, padding: '14px 16px', fontSize: 13, border: '1px solid #f0f0f0' }}>
                {([
                  ['Statement Type', statementType],
                  ['Reconciliation Period', reconciliationPeriod],
                  ['Waybills Added', String(addedWaybills.length)],
                  ['Claim Tickets Added', String(addedClaims.length)],
                  ['Vendor Basic Amount', includeBasic ? fmt(totals.basic) : '(not included)'],
                  ['Vendor Additional Charge', includeAdditional ? fmt(totals.additional) : '(not included)'],
                  ['Vendor Exception Fee', includeException ? fmt(totals.exception) : '(not included)'],
                  ['Reimbursement', includeReimbursement ? fmt(totals.reimbursement) : '(not included)'],
                  ...(prepaidTotal > 0 ? [['PrePaid Deduction', `−${fmt(prepaidTotal)}`]] : []),
                  ...(claimTotal > 0 ? [['Claim Deduction', `−${fmt(claimTotal)}`]] : []),
                  ...(vatRate > 0 ? [[`VAT (${vatRate}%)`, `+${fmt(vatAmount)}`]] : []),
                  ...(whtRate > 0 ? [[`WHT (${whtRate}%)`, `−${fmt(whtAmount)}`]] : []),
                  ['Tax Mark', taxMark],
                ] as [string, string][]).map(([label, val], i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 6, borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <span style={{ color: '#666' }}>{label}</span>
                    <span style={
                      label === 'PrePaid Deduction' || label === 'Claim Deduction' ? { color: '#0958d9', fontWeight: 500 }
                      : label.startsWith('VAT') ? { color: '#389e0d', fontWeight: 500 }
                      : label.startsWith('WHT') ? { color: '#cf1322', fontWeight: 500 }
                      : {}
                    }>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 10, borderTop: '2px solid #f0f0f0', fontWeight: 700, fontSize: 15 }}>
                  <span>Total Amount Payable</span>
                  <span style={{ color: '#1a1a1a' }}>PHP {fmt(totalAmountPayable)}</span>
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-default" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirmSubmit}>Confirm &amp; Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BillableCreateStatementForm;
