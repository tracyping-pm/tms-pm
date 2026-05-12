import React, { useState, useMemo } from 'react';
import { upsertApStatement, getAllApStatements } from '../../../common/apStatementSync';
import { TMS_WAYBILLS, type TmsWaybill } from '../data/tmsWaybills';
import { TMS_CLAIM_TICKETS, type TmsClaimTicket } from '../data/tmsClaimTickets';

interface Props {
  onBack: () => void;
  onGenerate: () => void;
}

const VENDORS = [
  'Coca-Cola Bottlers PH Inc.',
  'SMC Logistics',
  'JG Summit Freight',
  'Manila Freight Co.',
  'Bangkok Express Logistics',
  'Laguna Logistics Corp.',
];

const RECONCILIATION_PERIODS = [
  '2026-04 (Apr 1 – Apr 30)',
  '2026-03 (Mar 1 – Mar 31)',
  '2026-02 (Feb 1 – Feb 28)',
];

const TRUCK_TYPES = ['4-Wheeler', '6-Wheeler', '10-Wheeler'];
const PAYMENT_DEFINITIONS = ['Bank Transfer', 'Cash', 'Check'];
const ENTITIES = ['PH Entity', 'TH Entity', 'SG Entity'];
const BUSINESS_UNITS = ['Logistics & Trucking', 'Freight Forwarding', 'Warehousing'];
const PAYMENT_ID_L2 = ['Domestic Trucking', 'International Freight', 'Last Mile'];


type SettlementItem = 'basic' | 'exception' | 'additional' | 'reimbursement';

function generateTmsStatementNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `APTMS${yy}${mm}`;
  const existing = getAllApStatements().filter(s => s.no.startsWith(prefix));
  return `${prefix}${String(existing.length + 1).padStart(3, '0')}`;
}

function CreateApStatementForm({ onBack, onGenerate }: Props) {
  // Basic info
  const [statementType, setStatementType] = useState<'Standard' | 'Standalone'>('Standard');
  const [vendor, setVendor] = useState('');
  const [period, setPeriod] = useState('');
  const [settlementItems, setSettlementItems] = useState<Set<SettlementItem>>(new Set(['basic', 'exception', 'additional', 'reimbursement']));
  const [taxMark, setTaxMark] = useState<'inclusive' | 'exclusive'>('inclusive');

  // Tab
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');

  // Added waybills (the confirmed selection)
  const [addedWaybills, setAddedWaybills] = useState<TmsWaybill[]>([]);

  // Added claims
  const [addedClaims, setAddedClaims] = useState<TmsClaimTicket[]>([]);

  // Add Waybill modal
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [modalWaybillFilter, setModalWaybillFilter] = useState('');
  const [modalTruckFilter, setModalTruckFilter] = useState('');
  const [modalSelectedNos, setModalSelectedNos] = useState<Set<string>>(new Set());

  // Add Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [modalClaimFilter, setModalClaimFilter] = useState('');
  const [modalSelectedClaimNos, setModalSelectedClaimNos] = useState<Set<string>>(new Set());

  // Validation / dialogs
  const [validationError, setValidationError] = useState('');
  const [showRFPDialog, setShowRFPDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // RFP form state
  const [rfpPaymentDef, setRfpPaymentDef] = useState('Bank Transfer');
  const [rfpEntity, setRfpEntity] = useState('');
  const [rfpBU, setRfpBU] = useState('');
  const [rfpDateNeeded, setRfpDateNeeded] = useState('');
  const [rfpIdL2, setRfpIdL2] = useState('');
  const [rfpDocs, setRfpDocs] = useState<string[]>(['invoice_draft.png']);

  // ── Settlement item toggles ──────────────────────────────────────────────────

  const toggleItem = (item: SettlementItem) => {
    setSettlementItems(prev => {
      const n = new Set(prev);
      if (n.has(item)) n.delete(item); else n.add(item);
      return n;
    });
  };

  const toggleAllItems = (checked: boolean) => {
    if (checked) setSettlementItems(new Set(['basic', 'exception', 'additional', 'reimbursement']));
    else setSettlementItems(new Set());
  };

  const allItemsChecked = settlementItems.size === 4;
  const someItemsChecked = settlementItems.size > 0 && settlementItems.size < 4;

  // ── Waybill modal helpers ────────────────────────────────────────────────────

  const addedNos = useMemo(() => new Set(addedWaybills.map(w => w.no)), [addedWaybills]);
  // Show only the selected vendor's waybills (all waybills when vendor not yet chosen)
  const vendorWaybills = useMemo(
    () => TMS_WAYBILLS.filter(w => !vendor || w.vendor === vendor),
    [vendor]
  );
  const availableWaybills = vendorWaybills.filter(w => !addedNos.has(w.no));

  const filteredModalWaybills = availableWaybills.filter(w => {
    if (modalWaybillFilter && !w.no.toLowerCase().includes(modalWaybillFilter.toLowerCase())) return false;
    if (modalTruckFilter && w.truckType !== modalTruckFilter) return false;
    return true;
  });

  const openWaybillModal = () => {
    setModalSelectedNos(new Set());
    setModalWaybillFilter('');
    setModalTruckFilter('');
    setShowWaybillModal(true);
  };

  const confirmAddWaybills = () => {
    const toAdd = availableWaybills.filter((w: TmsWaybill) => modalSelectedNos.has(w.no));
    setAddedWaybills(prev => [...prev, ...toAdd]);
    setShowWaybillModal(false);
  };

  const removeWaybill = (no: string) => setAddedWaybills(prev => prev.filter((w: TmsWaybill) => w.no !== no));

  const toggleModalWaybill = (no: string) => {
    setModalSelectedNos(prev => { const n = new Set(prev); if (n.has(no)) n.delete(no); else n.add(no); return n; });
  };

  // ── Claim modal helpers ──────────────────────────────────────────────────────

  const addedClaimNos = useMemo(() => new Set(addedClaims.map(c => c.ticketNo)), [addedClaims]);
  // Show only the selected vendor's claim tickets
  const vendorClaims = useMemo(
    () => TMS_CLAIM_TICKETS.filter(c => !vendor || c.vendor === vendor),
    [vendor]
  );
  const availableClaims = vendorClaims.filter(c => !addedClaimNos.has(c.ticketNo));

  const filteredModalClaims = availableClaims.filter(c =>
    !modalClaimFilter || c.ticketNo.toLowerCase().includes(modalClaimFilter.toLowerCase())
  );

  const openClaimModal = () => {
    setModalSelectedClaimNos(new Set());
    setModalClaimFilter('');
    setShowClaimModal(true);
  };

  const confirmAddClaims = () => {
    const toAdd = availableClaims.filter((c: TmsClaimTicket) => modalSelectedClaimNos.has(c.ticketNo));
    setAddedClaims(prev => [...prev, ...toAdd]);
    setShowClaimModal(false);
  };

  const removeClaim = (no: string) => setAddedClaims(prev => prev.filter((c: TmsClaimTicket) => c.ticketNo !== no));

  const toggleModalClaim = (no: string) => {
    setModalSelectedClaimNos(prev => { const n = new Set(prev); if (n.has(no)) n.delete(no); else n.add(no); return n; });
  };

  // ── Amount calculations ──────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const basic = settlementItems.has('basic') ? addedWaybills.reduce((s, w) => s + w.basicAmount, 0) : 0;
    const prepaid = settlementItems.has('basic') ? addedWaybills.reduce((s, w) => s + w.prepaid, 0) : 0;
    const exception = settlementItems.has('exception') ? addedWaybills.reduce((s, w) => s + w.exceptionFee, 0) : 0;
    const additional = settlementItems.has('additional') ? addedWaybills.reduce((s, w) => s + w.additionalCharge, 0) : 0;
    const reimbursement = settlementItems.has('reimbursement') ? addedWaybills.reduce((s, w) => s + w.reimbursement, 0) : 0;
    const claimTotal = addedClaims.reduce((s, c) => s + c.amount, 0);
    const waybillSubtotal = basic - prepaid + exception + additional + reimbursement;
    const vat = taxMark === 'inclusive' ? +(waybillSubtotal * 0.12 / 1.12).toFixed(2) : +(waybillSubtotal * 0.12).toFixed(2);
    const wht = +(waybillSubtotal * 0.02).toFixed(2);
    const total = waybillSubtotal - claimTotal + vat - wht;
    return { basic, prepaid, exception, additional, reimbursement, claimTotal, waybillSubtotal, vat, wht, total };
  }, [addedWaybills, addedClaims, settlementItems, taxMark]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const buildSyncPayload = (status: 'Under Payment Preparation' | 'Pending Payment') => {
    const stmtNo = generateTmsStatementNo();
    const settlementItemsList: string[] = [
      ...(settlementItems.has('basic') ? ['Basic Amount'] : []),
      ...(settlementItems.has('exception') ? ['Vendor Exception Fee'] : []),
      ...(settlementItems.has('additional') ? ['Vendor Additional Charge'] : []),
      ...(settlementItems.has('reimbursement') ? ['Reimbursement Expense'] : []),
    ];
    const now = new Date().toISOString();
    return { stmtNo, now, payload: {
      no: stmtNo,
      vendorName: vendor,
      source: 'Internal' as const,
      status,
      statementType,
      reconciliationPeriod: period || '2026-04 (Apr 1 – Apr 30)',
      taxMark: taxMark === 'inclusive' ? 'Tax-inclusive' as const : 'Tax-exclusive' as const,
      vatRate: 12,
      whtRate: 2,
      vatAmount: summary.vat,
      whtAmount: summary.wht,
      settlementItems: settlementItemsList,
      totalVpAmount: summary.total,
      waybillCount: addedWaybills.length,
      waybills: addedWaybills.map(w => ({
        no: w.no, positionTime: w.positionTime, unloadingTime: w.unloadingTime,
        truckType: w.truckType, origin: w.origin, destination: w.destination,
        basicAmount: settlementItems.has('basic') ? w.basicAmount : 0,
        additionalCharge: settlementItems.has('additional') ? w.additionalCharge : 0,
        exceptionFee: settlementItems.has('exception') ? w.exceptionFee : 0,
        reimbursement: settlementItems.has('reimbursement') ? w.reimbursement : 0,
      })),
      claims: addedClaims.map(c => ({ no: c.ticketNo, type: c.claimType, amount: c.amount, waybillNo: c.relatedWaybill ?? '—' })),
      createdAt: now,
    }};
  };

  const handleSave = () => {
    if (!vendor) { setValidationError('Please select a vendor.'); return; }
    setValidationError('');
    const { payload, now } = buildSyncPayload('Under Payment Preparation');
    upsertApStatement({ ...payload, operationLogs: [{ time: now, actor: 'TMS User', action: 'Created AP Statement' }] });
    onGenerate();
  };

  const handleConfirmCRF = () => {
    if (!vendor) { setValidationError('Please select a vendor.'); return; }
    if (addedWaybills.length === 0) { setValidationError('Please add at least one waybill.'); return; }
    setValidationError('');
    setShowRFPDialog(true);
  };

  const handleSyncRFP = () => {
    if (!rfpEntity || !rfpBU || !rfpDateNeeded || !rfpIdL2) return;

    const stmtNo = generateTmsStatementNo();
    const settlementItemsList: string[] = [
      ...(settlementItems.has('basic') ? ['Basic Amount'] : []),
      ...(settlementItems.has('exception') ? ['Vendor Exception Fee'] : []),
      ...(settlementItems.has('additional') ? ['Vendor Additional Charge'] : []),
      ...(settlementItems.has('reimbursement') ? ['Reimbursement Expense'] : []),
    ];

    const now = new Date().toISOString();
    upsertApStatement({
      no: stmtNo,
      vendorName: vendor,
      source: 'Internal',
      status: 'Pending Payment',
      statementType,
      reconciliationPeriod: period || '2026-04 (Apr 1 – Apr 30)',
      taxMark: taxMark === 'inclusive' ? 'Tax-inclusive' : 'Tax-exclusive',
      vatRate: 12,
      whtRate: 2,
      vatAmount: summary.vat,
      whtAmount: summary.wht,
      settlementItems: settlementItemsList,
      totalVpAmount: summary.total,
      waybillCount: addedWaybills.length,
      waybills: addedWaybills.map(w => ({
        no: w.no,
        positionTime: w.positionTime,
        unloadingTime: w.unloadingTime,
        truckType: w.truckType,
        origin: w.origin,
        destination: w.destination,
        basicAmount: settlementItems.has('basic') ? w.basicAmount : 0,
        additionalCharge: settlementItems.has('additional') ? w.additionalCharge : 0,
        exceptionFee: settlementItems.has('exception') ? w.exceptionFee : 0,
        reimbursement: settlementItems.has('reimbursement') ? w.reimbursement : 0,
      })),
      claims: addedClaims.map(c => ({ no: c.ticketNo, type: c.claimType, amount: c.amount, waybillNo: '—' })),
      createdAt: now,
      submittedAt: now,
      operationLogs: [
        { time: now, actor: 'TMS User', action: 'Created AP Statement' },
        { time: now, actor: 'TMS User', action: 'Confirmed & Created RFP' },
      ],
    });

    setShowRFPDialog(false);
    setSubmitted(true);
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  // ── Success screen ───────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="tms-card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 56 }}>
        <div style={{ fontSize: 44, marginBottom: 12, color: '#00b96b' }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>RFP Created Successfully</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>
          AP Statement created for <strong>{vendor}</strong>.<br />
          Total Amount Payable: <strong>{fmt(summary.total)}</strong>
        </div>
        <button className="btn-primary" onClick={onGenerate}>Back to AP Statement</button>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Top actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack} style={{ fontSize: 13 }}>← Back</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-default" onClick={handleSave}>Save</button>
          <button
            className="btn-primary"
            style={{ minWidth: 160, ...(addedWaybills.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            disabled={addedWaybills.length === 0}
            onClick={handleConfirmCRF}
          >
            Confirm &amp; Create RFP
          </button>
        </div>
      </div>

      {validationError && (
        <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 12, padding: '8px 14px', borderRadius: 4, fontSize: 13 }}>
          ⚠ {validationError}
        </div>
      )}

      {/* ── Basic Information ── */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Basic Information</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: '#555', minWidth: 110, flexShrink: 0 }}>
            <span style={{ color: '#ff4d4f' }}>* </span>Statement Type
          </label>
          <div style={{ display: 'flex', gap: 24 }}>
            {(['Standard', 'Standalone'] as const).map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="stmtType" checked={statementType === t} onChange={() => setStatementType(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 110, flexShrink: 0 }}>
              <span style={{ color: '#ff4d4f' }}>* </span>Vendor Name
            </label>
            <select className="filter-select" style={{ flex: 1 }} value={vendor} onChange={e => setVendor(e.target.value)}>
              <option value=""></option>
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 140, flexShrink: 0 }}>Reconciliation Period</label>
            <select className="filter-select" style={{ flex: 1 }} value={period} onChange={e => setPeriod(e.target.value)}>
              <option value=""></option>
              {RECONCILIATION_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#555', minWidth: 110, flexShrink: 0 }}>Vendor Tax Mark</span>
            <span style={{ fontSize: 13, color: '#666', background: '#f5f5f5', padding: '4px 10px', borderRadius: 4, border: '1px solid #e8e8e8' }}>VAT-in</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 140, flexShrink: 0 }}>
              <span style={{ color: '#ff4d4f' }}>* </span>Statement Tax Mark
            </label>
            <div style={{ display: 'flex', gap: 18 }}>
              {(['inclusive', 'exclusive'] as const).map(v => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="taxMark" checked={taxMark === v} onChange={() => setTaxMark(v)} />
                  Tax-{v}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Billing Details ── */}
      <div className="tms-card" style={{ marginBottom: 16, padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '0 18px' }}>
          {(['waybill', 'claim'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 18px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#1677ff' : '#555', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #1677ff' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}>
              {tab === 'waybill'
                ? `Waybill${addedWaybills.length > 0 ? ` (${addedWaybills.length})` : ''}`
                : `Claim Tickets${addedClaims.length > 0 ? ` (${addedClaims.length})` : ''}`
              }
            </button>
          ))}
        </div>

        <div style={{ padding: '14px 18px' }}>
          {/* ── Waybill Tab ── */}
          {activeTab === 'waybill' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  {addedWaybills.length === 0
                    ? 'No waybills added.'
                    : <><strong style={{ color: '#333' }}>{addedWaybills.length}</strong> waybill{addedWaybills.length > 1 ? 's' : ''} added.</>
                  }
                </span>
                <button
                  className="btn-default"
                  style={{ fontSize: 13 }}
                  onClick={openWaybillModal}
                  disabled={!vendor}
                  title={!vendor ? 'Please select a vendor first' : undefined}
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
                        <td style={{ textAlign: 'right', fontSize: 13 }}>{w.additionalCharge > 0 ? fmt(w.additionalCharge) : <span style={{ color: '#bbb' }}>—</span>}</td>
                        <td style={{ textAlign: 'right', fontSize: 13 }}>{w.exceptionFee > 0 ? fmt(w.exceptionFee) : <span style={{ color: '#bbb' }}>—</span>}</td>
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

          {/* ── Claim Ticket Tab ── */}
          {activeTab === 'claim' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  {addedClaims.length === 0
                    ? 'No claim tickets added.'
                    : <><strong style={{ color: '#333' }}>{addedClaims.length}</strong> claim ticket{addedClaims.length > 1 ? 's' : ''} added.</>
                  }
                </span>
                <button
                  className="btn-default"
                  style={{ fontSize: 13 }}
                  onClick={openClaimModal}
                  disabled={!vendor}
                  title={!vendor ? 'Please select a vendor first' : undefined}
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
                      <tr key={c.ticketNo}>
                        <td style={{ fontWeight: 600, color: '#1677ff' }}>{c.ticketNo}</td>
                        <td style={{ fontSize: 12 }}>{c.claimType}</td>
                        <td style={{ fontSize: 12, color: c.relatedWaybill ? '#333' : '#bbb' }}>{c.relatedWaybill ?? '—'}</td>
                        <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmt(c.amount)}</td>
                        <td style={{ fontSize: 12 }}>{c.currency}</td>
                        <td style={{ fontSize: 12, color: '#555' }}>{c.createdAt}</td>
                        <td>
                          <button className="btn-link" style={{ color: '#cf1322', fontSize: 12 }} onClick={() => removeClaim(c.ticketNo)}>Remove</button>
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
      </div>

      {/* ── Amount Summary ── */}
      <div className="tms-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="section-title">Amount Summary</div>
        </div>

        {/* Items to be settled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#555' }}>* Items to be settled</span>
          {([
            { key: 'all', label: 'All', isAll: true },
            { key: 'basic', label: 'Vendor Basic Amount', isAll: false },
            { key: 'additional', label: 'Vendor Additional Charge', isAll: false },
            { key: 'exception', label: 'Vendor Exception Fee', isAll: false },
            { key: 'reimbursement', label: 'Reimbursement Expense', isAll: false },
          ] as { key: string; label: string; isAll: boolean }[]).map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', color: '#333' }}>
              <input
                type="checkbox"
                checked={item.isAll ? allItemsChecked : settlementItems.has(item.key as SettlementItem)}
                ref={el => { if (el && item.isAll) el.indeterminate = someItemsChecked; }}
                onChange={e => item.isAll ? toggleAllItems(e.target.checked) : toggleItem(item.key as SettlementItem)}
              />
              {item.label}
            </label>
          ))}
        </div>

        {/* Total + Tax Mark */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: '#f6f9ff', borderRadius: 6, border: '1px solid #d6e4ff', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Total Amount Payable</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{fmt(summary.total)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Statement Tax Mark</span>
            {(['inclusive', 'exclusive'] as const).map(v => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="taxMarkSummary" checked={taxMark === v} onChange={() => setTaxMark(v)} />
                Tax-{v}
              </label>
            ))}
          </div>
        </div>

        {/* 3-column breakdown */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Waybill Contract Cost', 'Claim', 'Others'].map((h, i) => (
                <th key={i} style={{ padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#555', width: i === 2 ? '34%' : '33%' }}>{h}</th>
              ))}
            </tr>
            <tr style={{ background: '#fafafa' }}>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>{fmt(summary.waybillSubtotal)}</td>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>{fmt(summary.claimTotal)}</td>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#888' }}>{fmt(summary.vat - summary.wht)}</td>
            </tr>
          </thead>
          <tbody>
            {settlementItems.has('basic') && (
              <tr>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  Vendor Basic Amount <span style={{ float: 'right' }}>{fmt(summary.basic)}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  KPI Claim <span style={{ float: 'right' }}>{fmt(addedClaims.filter(c => c.claimType === 'KPI Claim').reduce((s, c) => s + c.amount, 0))}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  VAT <span style={{ float: 'right' }}>{fmt(summary.vat)}</span>
                </td>
              </tr>
            )}
            {summary.prepaid > 0 && (
              <tr>
                <td style={{ padding: '4px 14px 4px 28px', borderBottom: '1px solid #f8f8f8', color: '#0958d9', fontSize: 12 }}>
                  ↳ PrePaid <span style={{ float: 'right' }}>−{fmt(summary.prepaid)}</span>
                </td>
                <td style={{ padding: '4px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
                <td style={{ padding: '4px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  WHT <span style={{ float: 'right', color: '#cf1322' }}>−{fmt(summary.wht)}</span>
                </td>
              </tr>
            )}
            {settlementItems.has('exception') && (
              <tr>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  Vendor Exception Fee <span style={{ float: 'right' }}>{fmt(summary.exception)}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
              </tr>
            )}
            {settlementItems.has('additional') && (
              <tr>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  Vendor Additional Charge <span style={{ float: 'right' }}>{fmt(summary.additional)}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
              </tr>
            )}
            {settlementItems.has('reimbursement') && (
              <tr>
                <td style={{ padding: '6px 14px' }}>
                  Reimbursement Expense <span style={{ float: 'right' }}>{fmt(summary.reimbursement)}</span>
                </td>
                <td style={{ padding: '6px 14px' }}></td>
                <td style={{ padding: '6px 14px' }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Waybill Modal ── */}
      {showWaybillModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '90vw', maxWidth: 900 }}>
            <div className="modal-header">
              <span className="modal-title">Add Waybill</span>
              <button className="modal-close" onClick={() => setShowWaybillModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="filter-input"
                  placeholder="Waybill Number"
                  value={modalWaybillFilter}
                  onChange={e => setModalWaybillFilter(e.target.value)}
                  style={{ width: 160 }}
                />
                <select className="filter-select" value={modalTruckFilter} onChange={e => setModalTruckFilter(e.target.value)}>
                  <option value="">Truck Type: All</option>
                  {TRUCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>{modalSelectedNos.size} selected</span>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>
                        <input
                          type="checkbox"
                          checked={filteredModalWaybills.filter(w => !w.alreadyInStatement).length > 0 &&
                            filteredModalWaybills.filter(w => !w.alreadyInStatement).every(w => modalSelectedNos.has(w.no))}
                          onChange={e => {
                            const n = new Set(modalSelectedNos);
                            filteredModalWaybills.filter(w => !w.alreadyInStatement).forEach(w => {
                              if (e.target.checked) n.add(w.no); else n.delete(w.no);
                            });
                            setModalSelectedNos(n);
                          }}
                        />
                      </th>
                      <th>Waybill No.</th>
                      <th>Position Time</th>
                      <th>Truck Type</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th style={{ textAlign: 'right' }}>Basic Amount</th>
                      <th style={{ textAlign: 'right' }}>Exception Fee</th>
                      <th style={{ textAlign: 'right' }}>Add. Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalWaybills.map(w => {
                      const associated = !!w.alreadyInStatement;
                      const checked = modalSelectedNos.has(w.no);
                      return (
                        <tr
                          key={w.no}
                          style={{ background: associated ? '#fafafa' : checked ? '#f0f7ff' : undefined, cursor: associated ? 'default' : 'pointer' }}
                          onClick={() => !associated && toggleModalWaybill(w.no)}
                        >
                          <td onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} disabled={associated} onChange={() => !associated && toggleModalWaybill(w.no)} />
                          </td>
                          <td>
                            <strong style={{ color: associated ? '#999' : '#333' }}>{w.no}</strong>
                            {associated && (
                              <span style={{ marginLeft: 5, fontSize: 10, padding: '1px 5px', background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 3 }}>
                                In {w.alreadyInStatement}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: 12, color: associated ? '#bbb' : '#555' }}>{w.positionTime}</td>
                          <td style={{ fontSize: 12, color: associated ? '#bbb' : undefined }}>{w.truckType}</td>
                          <td style={{ fontSize: 12, color: associated ? '#bbb' : '#555', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.origin}</td>
                          <td style={{ fontSize: 12, color: associated ? '#bbb' : '#555', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.destination}</td>
                          <td style={{ textAlign: 'right', fontSize: 12, color: associated ? '#bbb' : undefined }}>{fmt(w.basicAmount)}</td>
                          <td style={{ textAlign: 'right', fontSize: 12, color: associated ? '#bbb' : undefined }}>{w.exceptionFee > 0 ? fmt(w.exceptionFee) : '—'}</td>
                          <td style={{ textAlign: 'right', fontSize: 12, color: associated ? '#bbb' : undefined }}>{w.additionalCharge > 0 ? fmt(w.additionalCharge) : '—'}</td>
                        </tr>
                      );
                    })}
                    {filteredModalWaybills.length === 0 && (
                      <tr><td colSpan={9} className="empty">No available waybills.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowWaybillModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAddWaybills} disabled={modalSelectedNos.size === 0}>
                Add ({modalSelectedNos.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Claim Ticket Modal ── */}
      {showClaimModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '80vw', maxWidth: 660 }}>
            <div className="modal-header">
              <span className="modal-title">Add Claim Ticket</span>
              <button className="modal-close" onClick={() => setShowClaimModal(false)}>✕</button>
            </div>
            <div className="modal-body">
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
                          checked={filteredModalClaims.length > 0 && filteredModalClaims.every(c => modalSelectedClaimNos.has(c.ticketNo))}
                          onChange={e => {
                            const n = new Set(modalSelectedClaimNos);
                            if (e.target.checked) filteredModalClaims.forEach(c => n.add(c.ticketNo));
                            else filteredModalClaims.forEach(c => n.delete(c.ticketNo));
                            setModalSelectedClaimNos(n);
                          }}
                        />
                      </th>
                      <th>Ticket No.</th>
                      <th>Related Waybill</th>
                      <th>Claim Type</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalClaims.map(c => {
                      const checked = modalSelectedClaimNos.has(c.ticketNo);
                      const associated = !!c.alreadyInStatement;
                      return (
                        <tr
                          key={c.ticketNo}
                          style={{ background: associated ? '#fafafa' : checked ? '#f0f7ff' : undefined, cursor: associated ? 'default' : 'pointer' }}
                          onClick={() => !associated && toggleModalClaim(c.ticketNo)}
                        >
                          <td onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} disabled={associated} onChange={() => !associated && toggleModalClaim(c.ticketNo)} />
                          </td>
                          <td>
                            <strong style={{ color: associated ? '#999' : '#333' }}>{c.ticketNo}</strong>
                            {associated && (
                              <span style={{ marginLeft: 5, fontSize: 10, padding: '1px 5px', background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 3 }}>
                                In {c.alreadyInStatement}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: 12, color: associated ? '#bbb' : c.relatedWaybill ? '#333' : '#bbb' }}>{c.relatedWaybill ?? '—'}</td>
                          <td style={{ fontSize: 12, color: associated ? '#bbb' : undefined }}>{c.claimType}</td>
                          <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: associated ? '#bbb' : undefined }}>{fmt(c.amount)}</td>
                          <td>
                            <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 3,
                              background: c.status === 'For Deduction' ? '#f6ffed' : c.status === 'Disputed' ? '#fff1f0' : '#fffbe6',
                              color: associated ? '#bbb' : c.status === 'For Deduction' ? '#389e0d' : c.status === 'Disputed' ? '#cf1322' : '#d48806',
                              border: `1px solid ${c.status === 'For Deduction' ? '#b7eb8f' : c.status === 'Disputed' ? '#ffa39e' : '#ffe58f'}`,
                            }}>{c.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredModalClaims.length === 0 && (
                      <tr><td colSpan={6} className="empty">No available claim tickets.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAddClaims} disabled={modalSelectedClaimNos.size === 0}>
                Add ({modalSelectedClaimNos.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create RFP Modal ── */}
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
                    {PAYMENT_DEFINITIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Entity</div>
                  <select className="filter-select" style={{ width: '100%' }} value={rfpEntity} onChange={e => setRfpEntity(e.target.value)}>
                    <option value=""></option>
                    {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 5 }}><span style={{ color: '#ff4d4f' }}>*</span> Business Unit</div>
                  <select className="filter-select" style={{ width: '100%' }} value={rfpBU} onChange={e => setRfpBU(e.target.value)}>
                    <option value=""></option>
                    {BUSINESS_UNITS.map(b => <option key={b} value={b}>{b}</option>)}
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
                    {PAYMENT_ID_L2.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>Supporting Documents</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {rfpDocs.map((doc, i) => (
                    <div key={i} style={{ width: 76, height: 76, border: '1px solid #d9d9d9', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                      <div style={{ fontSize: 22, color: '#aaa' }}>📄</div>
                      <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{doc}</div>
                    </div>
                  ))}
                  <div onClick={() => setRfpDocs(p => [...p, `doc_${p.length + 1}.pdf`])}
                    style={{ width: 76, height: 76, border: '1px dashed #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa', fontSize: 26, color: '#ccc' }}>
                    +
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowRFPDialog(false)}>Cancel</button>
              <button className="btn-primary" disabled={!rfpEntity || !rfpBU || !rfpDateNeeded || !rfpIdL2} onClick={handleSyncRFP}>Sync</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateApStatementForm;
