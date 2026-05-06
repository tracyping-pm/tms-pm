import React, { useState, useMemo } from 'react';

interface Props {
  onBack: () => void;
  onGenerate: () => void;
}

interface WaybillOption {
  no: string;
  projectName: string;
  customerCode: string;
  truckType: string;
  origin: string;
  destination: string;
  unloadingTime: string;
  basicAmount: number;
  exceptionFee: number;
  additionalCharge: number;
  reimbursement: number;
  prepaid: number;
}

interface ClaimTicket {
  ticketNo: string;
  projectName: string;
  claimType: string;
  amount: number;
  status: string;
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

const PROJECT_NAMES = ['All', 'CCA-PH-NCR-2026', 'CCA-PH-Cavite-2026', 'SMC-PH-Luzon-2026'];
const TRUCK_TYPES = ['All', '4-Wheeler', '6-Wheeler', '10-Wheeler'];

const WAYBILL_OPTIONS: WaybillOption[] = [
  { no: 'WB2604010', projectName: 'CCA-PH-NCR-2026', customerCode: 'CCA-001', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', unloadingTime: '2026-04-10 15:30', basicAmount: 12500, exceptionFee: 0, additionalCharge: 800, reimbursement: 0, prepaid: 3190 },
  { no: 'WB2604011', projectName: 'CCA-PH-NCR-2026', customerCode: 'CCA-001', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', unloadingTime: '2026-04-11 09:00', basicAmount: 8000, exceptionFee: 500, additionalCharge: 0, reimbursement: 0, prepaid: 0 },
  { no: 'WB2604012', projectName: 'CCA-PH-NCR-2026', customerCode: 'CCA-001', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area', unloadingTime: '2026-04-12 17:00', basicAmount: 15000, exceptionFee: 0, additionalCharge: 1200, reimbursement: 500, prepaid: 0 },
  { no: 'WB2604013', projectName: 'CCA-PH-Cavite-2026', customerCode: 'CCA-002', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2', unloadingTime: '2026-04-13 11:15', basicAmount: 6000, exceptionFee: 1000, additionalCharge: 0, reimbursement: 0, prepaid: 0 },
  { no: 'WB2604014', projectName: 'CCA-PH-NCR-2026', customerCode: 'CCA-001', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area', unloadingTime: '2026-04-14 08:30', basicAmount: 18000, exceptionFee: 0, additionalCharge: 2000, reimbursement: 0, prepaid: 0 },
  { no: 'WB2604015', projectName: 'SMC-PH-Luzon-2026', customerCode: 'SMC-001', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan', unloadingTime: '2026-04-15 14:00', basicAmount: 7500, exceptionFee: 0, additionalCharge: 0, reimbursement: 300, prepaid: 0 },
  { no: 'WB2604016', projectName: 'SMC-PH-Luzon-2026', customerCode: 'SMC-001', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', unloadingTime: '2026-04-16 10:45', basicAmount: 13500, exceptionFee: 500, additionalCharge: 1000, reimbursement: 0, prepaid: 0 },
];

const CLAIM_TICKETS: ClaimTicket[] = [
  { ticketNo: 'PHCT26041501AB', projectName: 'CCA-PH-NCR-2026', claimType: 'KPI Claim', amount: 2000, status: 'Approved' },
  { ticketNo: 'PHCT26041601CD', projectName: 'SMC-PH-Luzon-2026', claimType: 'Shortage Claim', amount: 800, status: 'Approved' },
  { ticketNo: 'PHCT26041701EF', projectName: 'CCA-PH-Cavite-2026', claimType: 'KPI Claim', amount: 1500, status: 'Pending' },
];

type SettlementItem = 'basic' | 'exception' | 'additional' | 'reimbursement';

function CreateApStatementForm({ onBack, onGenerate }: Props) {
  // Basic info
  const [vendor, setVendor] = useState('');
  const [period, setPeriod] = useState('');
  const [settlementItems, setSettlementItems] = useState<Set<SettlementItem>>(new Set(['basic', 'exception', 'additional', 'reimbursement']));
  const [taxMark, setTaxMark] = useState<'inclusive' | 'exclusive'>('inclusive');

  // Waybill tab
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');
  const [filterProject, setFilterProject] = useState('All');
  const [filterWaybillNo, setFilterWaybillNo] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterTruck, setFilterTruck] = useState('All');
  const [selectedWaybills, setSelectedWaybills] = useState<Set<string>>(new Set(['WB2604010', 'WB2604011', 'WB2604012']));
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set(['PHCT26041501AB']));

  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

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

  // Waybill filtering
  const filteredWaybills = WAYBILL_OPTIONS.filter(w => {
    if (filterProject !== 'All' && w.projectName !== filterProject) return false;
    if (filterWaybillNo && !w.no.toLowerCase().includes(filterWaybillNo.toLowerCase())) return false;
    if (filterCustomer && !w.customerCode.toLowerCase().includes(filterCustomer.toLowerCase())) return false;
    if (filterTruck !== 'All' && w.truckType !== filterTruck) return false;
    return true;
  });

  const allWaybillsChecked = filteredWaybills.length > 0 && filteredWaybills.every(w => selectedWaybills.has(w.no));
  const someWaybillsChecked = filteredWaybills.some(w => selectedWaybills.has(w.no)) && !allWaybillsChecked;

  const toggleWaybill = (no: string) => {
    setSelectedWaybills(prev => {
      const n = new Set(prev); if (n.has(no)) n.delete(no); else n.add(no); return n;
    });
  };
  const toggleAllWaybills = () => {
    if (allWaybillsChecked) setSelectedWaybills(prev => { const n = new Set(prev); filteredWaybills.forEach(w => n.delete(w.no)); return n; });
    else setSelectedWaybills(prev => { const n = new Set(prev); filteredWaybills.forEach(w => n.add(w.no)); return n; });
  };

  const toggleClaim = (no: string) => {
    setSelectedClaims(prev => {
      const n = new Set(prev); if (n.has(no)) n.delete(no); else n.add(no); return n;
    });
  };

  // Amount calculation
  const summary = useMemo(() => {
    const sel = WAYBILL_OPTIONS.filter(w => selectedWaybills.has(w.no));
    const basic = settlementItems.has('basic') ? sel.reduce((s, w) => s + w.basicAmount, 0) : 0;
    const prepaid = settlementItems.has('basic') ? sel.reduce((s, w) => s + w.prepaid, 0) : 0;
    const exception = settlementItems.has('exception') ? sel.reduce((s, w) => s + w.exceptionFee, 0) : 0;
    const additional = settlementItems.has('additional') ? sel.reduce((s, w) => s + w.additionalCharge, 0) : 0;
    const reimbursement = settlementItems.has('reimbursement') ? sel.reduce((s, w) => s + w.reimbursement, 0) : 0;
    const claimTotal = CLAIM_TICKETS.filter(c => selectedClaims.has(c.ticketNo)).reduce((s, c) => s + c.amount, 0);
    const waybillSubtotal = basic + exception + additional + reimbursement;
    const vat = taxMark === 'inclusive' ? +(waybillSubtotal * 0.12 / 1.12).toFixed(2) : +(waybillSubtotal * 0.12).toFixed(2);
    const wht = +(waybillSubtotal * 0.02).toFixed(2);
    const total = waybillSubtotal + claimTotal + vat - wht;
    return { basic, prepaid, exception, additional, reimbursement, claimTotal, waybillSubtotal, vat, wht, total };
  }, [selectedWaybills, selectedClaims, settlementItems, taxMark]);

  const handleGenerate = () => {
    if (!vendor) { setValidationError('Please select a vendor.'); return; }
    if (selectedWaybills.size === 0) { setValidationError('Please select at least one waybill.'); return; }
    setValidationError('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setVendor(''); setPeriod('');
    setSettlementItems(new Set(['basic', 'exception', 'additional', 'reimbursement']));
    setTaxMark('inclusive');
    setSelectedWaybills(new Set());
    setSelectedClaims(new Set());
    setFilterProject('All'); setFilterWaybillNo(''); setFilterCustomer(''); setFilterTruck('All');
    setValidationError('');
  };

  if (submitted) {
    return (
      <div className="tms-card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 56 }}>
        <div style={{ fontSize: 44, marginBottom: 12, color: '#00b96b' }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>Statement Generated</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>
          AP Statement created for <strong>{vendor}</strong>.<br />
          Total Amount Payable: <strong>PHP {summary.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </div>
        <button className="btn-primary" onClick={onGenerate}>Back to AP Statement</button>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div>
      {/* Page action buttons — top right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
        <button className="btn-default" onClick={handleReset}>Reset</button>
        <button className="btn-primary" style={{ minWidth: 90 }} onClick={handleGenerate}>Generate</button>
      </div>

      {validationError && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 12 }}>
          ⚠ {validationError}
        </div>
      )}

      {/* ── Basic Information ── */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Basic Information</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 80, flexShrink: 0 }}>
              <span style={{ color: '#ff4d4f' }}>* </span>Vendor
            </label>
            <select
              className="filter-select"
              style={{ flex: 1 }}
              value={vendor}
              onChange={e => setVendor(e.target.value)}
            >
              <option value=""></option>
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 130, flexShrink: 0 }}>Reconciliation Period</label>
            <select
              className="filter-select"
              style={{ flex: 1 }}
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              <option value=""></option>
              {RECONCILIATION_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#555', minWidth: 80, flexShrink: 0 }}>Items to be settled</span>
          {([
            { key: 'all', label: 'All', isAll: true },
            { key: 'basic', label: 'Vendor Basic Amount', isAll: false },
            { key: 'exception', label: 'Vendor Exception Fee', isAll: false },
            { key: 'additional', label: 'Vendor Additional Charge', isAll: false },
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#555', minWidth: 80, flexShrink: 0 }}>Vendor Tax Mark</span>
            <span style={{ fontSize: 13, color: '#999' }}>—</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#555', minWidth: 130, flexShrink: 0 }}>
              <span style={{ color: '#ff4d4f' }}>* </span>Statement Tax Mark
            </label>
            <div style={{ display: 'flex', gap: 16 }}>
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

      {/* ── Select Waybill / Claim Ticket ── */}
      <div className="tms-card" style={{ marginBottom: 16, padding: 0 }}>
        {/* Tab header */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '0 18px' }}>
          <div style={{ display: 'flex', flex: 1 }}>
            {(['waybill', 'claim'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 18px',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#00b96b' : '#555',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #00b96b' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {tab === 'waybill' ? '* Select Waybill' : 'Select Claim Ticket'}
              </button>
            ))}
          </div>
          {activeTab === 'waybill' && (
            <button className="btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}>
              Add Waybill
            </button>
          )}
        </div>

        <div style={{ padding: '14px 18px' }}>
          {activeTab === 'waybill' && (
            <>
              {/* Filters */}
              <div className="filter-row">
                <select
                  className="filter-select"
                  value={filterProject}
                  onChange={e => setFilterProject(e.target.value)}
                  style={{ minWidth: 160 }}
                >
                  {PROJECT_NAMES.map(p => <option key={p} value={p}>{p === 'All' ? 'Project Name' : p}</option>)}
                </select>
                <select
                  className="filter-select"
                  value={filterWaybillNo}
                  onChange={e => setFilterWaybillNo(e.target.value)}
                  style={{ minWidth: 140 }}
                >
                  <option value="">Waybill Number</option>
                  {WAYBILL_OPTIONS.map(w => <option key={w.no} value={w.no}>{w.no}</option>)}
                </select>
                <input
                  className="filter-input"
                  placeholder="Customer Code"
                  style={{ minWidth: 130 }}
                  value={filterCustomer}
                  onChange={e => setFilterCustomer(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={filterTruck}
                  onChange={e => setFilterTruck(e.target.value)}
                  style={{ minWidth: 150 }}
                >
                  {TRUCK_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'Billing Truck Type' : t}</option>)}
                </select>
                <button className="btn-default" onClick={() => { setFilterProject('All'); setFilterWaybillNo(''); setFilterCustomer(''); setFilterTruck('All'); }}>Reset</button>
                <button className="btn-primary">Search</button>
              </div>

              <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                {filteredWaybills.length} waybills total,{' '}
                <strong style={{ color: '#00b96b' }}>
                  {filteredWaybills.filter(w => selectedWaybills.has(w.no)).length} waybill(s) selected.
                </strong>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        checked={allWaybillsChecked}
                        ref={el => { if (el) el.indeterminate = someWaybillsChecked; }}
                        onChange={toggleAllWaybills}
                      />
                    </th>
                    <th>Project Name</th>
                    <th>Waybill No.</th>
                    <th>Customer Code</th>
                    <th>Truck Type</th>
                    <th>Origin → Destination</th>
                    <th>Unloading Time</th>
                    {settlementItems.has('basic') && <th className="num">Basic Amount</th>}
                    {settlementItems.has('exception') && <th className="num">Exception Fee</th>}
                    {settlementItems.has('additional') && <th className="num">Additional Charge</th>}
                    {settlementItems.has('reimbursement') && <th className="num">Reimbursement</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredWaybills.map(w => (
                    <tr key={w.no}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedWaybills.has(w.no)}
                          onChange={() => toggleWaybill(w.no)}
                        />
                      </td>
                      <td style={{ fontSize: 12 }}>{w.projectName}</td>
                      <td><strong>{w.no}</strong></td>
                      <td style={{ fontSize: 12 }}>{w.customerCode}</td>
                      <td style={{ fontSize: 12 }}>{w.truckType}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{w.origin} → {w.destination}</td>
                      <td style={{ fontSize: 12, color: '#888' }}>{w.unloadingTime}</td>
                      {settlementItems.has('basic') && <td className="num">{fmt(w.basicAmount)}</td>}
                      {settlementItems.has('exception') && <td className="num">{w.exceptionFee > 0 ? fmt(w.exceptionFee) : '—'}</td>}
                      {settlementItems.has('additional') && <td className="num">{w.additionalCharge > 0 ? fmt(w.additionalCharge) : '—'}</td>}
                      {settlementItems.has('reimbursement') && <td className="num">{w.reimbursement > 0 ? fmt(w.reimbursement) : '—'}</td>}
                    </tr>
                  ))}
                  {filteredWaybills.length === 0 && (
                    <tr><td colSpan={8} className="empty">No waybills found.</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'claim' && (
            <>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                {CLAIM_TICKETS.length} claim tickets total,{' '}
                <strong style={{ color: '#00b96b' }}>
                  {CLAIM_TICKETS.filter(c => selectedClaims.has(c.ticketNo)).length} selected.
                </strong>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}></th>
                    <th>Ticket No.</th>
                    <th>Project Name</th>
                    <th>Claim Type</th>
                    <th className="num">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CLAIM_TICKETS.map(c => (
                    <tr key={c.ticketNo}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedClaims.has(c.ticketNo)}
                          onChange={() => toggleClaim(c.ticketNo)}
                        />
                      </td>
                      <td><strong>{c.ticketNo}</strong></td>
                      <td style={{ fontSize: 12 }}>{c.projectName}</td>
                      <td style={{ fontSize: 12 }}>{c.claimType}</td>
                      <td className="num">{fmt(c.amount)}</td>
                      <td>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4,
                          background: c.status === 'Approved' ? '#f6ffed' : '#fffbe6',
                          color: c.status === 'Approved' ? '#389e0d' : '#d48806',
                          border: `1px solid ${c.status === 'Approved' ? '#b7eb8f' : '#ffe58f'}`,
                        }}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* ── Amount Summary ── */}
      <div className="tms-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="section-title">Amount Summary</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Statement Tax Mark</span>
            {(['inclusive', 'exclusive'] as const).map(v => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="taxMarkSummary" checked={taxMark === v} onChange={() => setTaxMark(v)} />
                Tax-{v}
              </label>
            ))}
          </div>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Total Amount Payable</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#00b96b' }}>
            {fmt(summary.total)}
          </span>
        </div>

        {/* 3-column breakdown matching the image */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#555', width: '33%' }}>
                Waybill Contract Cost
              </th>
              <th style={{ padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#555', width: '33%' }}>
                Claim
              </th>
              <th style={{ padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#555', width: '34%' }}>
                Others
              </th>
            </tr>
            <tr style={{ background: '#fafafa' }}>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>
                {fmt(summary.waybillSubtotal)}
              </td>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>
                {fmt(summary.claimTotal)}
              </td>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#888' }}>
                {fmt(summary.vat - summary.wht)}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                Vendor Basic Amount
                <span style={{ float: 'right', color: '#333' }}>{fmt(summary.basic)}</span>
              </td>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                KPI Claim
                <span style={{ float: 'right', color: '#333' }}>
                  {fmt(CLAIM_TICKETS.filter(c => selectedClaims.has(c.ticketNo) && c.claimType === 'KPI Claim').reduce((s, c) => s + c.amount, 0))}
                </span>
              </td>
              <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                VAT
                <span style={{ float: 'right', color: '#333' }}>{fmt(summary.vat)}</span>
              </td>
            </tr>
            {summary.prepaid > 0 && (
              <tr>
                <td style={{ padding: '6px 14px 6px 28px', borderBottom: '1px solid #f8f8f8', color: '#888', fontSize: 12 }}>
                  PrePaid
                  <span style={{ float: 'right' }}>{fmt(summary.prepaid)}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  WHT
                  <span style={{ float: 'right', color: '#cf1322' }}>-{fmt(summary.wht)}</span>
                </td>
              </tr>
            )}
            {settlementItems.has('exception') && (
              <tr>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  Vendor Exception Fee
                  <span style={{ float: 'right', color: '#333' }}>{fmt(summary.exception)}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
              </tr>
            )}
            {settlementItems.has('additional') && (
              <tr>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}>
                  Vendor Additional Charge
                  <span style={{ float: 'right', color: '#333' }}>{fmt(summary.additional)}</span>
                </td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
                <td style={{ padding: '6px 14px', borderBottom: '1px solid #f8f8f8' }}></td>
              </tr>
            )}
            {settlementItems.has('reimbursement') && (
              <tr>
                <td style={{ padding: '6px 14px' }}>
                  Reimbursement Expense
                  <span style={{ float: 'right', color: '#333' }}>{fmt(summary.reimbursement)}</span>
                </td>
                <td style={{ padding: '6px 14px' }}></td>
                <td style={{ padding: '6px 14px' }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CreateApStatementForm;
