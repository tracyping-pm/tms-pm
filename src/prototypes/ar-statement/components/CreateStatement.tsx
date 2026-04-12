import React, { useState } from 'react';

interface WaybillItem {
  id: string;
  waybillNumber: string;
  projectName: string;
  customerCode: string;
  billingTruckType: string;
  positionTime: string;
  unloadingTime: string;
}

const WAYBILL_DATA: WaybillItem[] = [
  { id: '1', waybillNumber: 'PHW26021360D', projectName: 'Ethan0417, URC-Cebu', customerCode: 'External Code:P301499632', billingTruckType: '10 Wheeler Wing Van', positionTime: '2026-02-13 15:00:00', unloadingTime: '2026-02-16 14:55:46' },
  { id: '2', waybillNumber: 'PHW2602183L1', projectName: 'Ethan0417, URC-Cebu', customerCode: 'External Code:P301505260', billingTruckType: '10 Wheeler Wing Van', positionTime: '2026-02-18 17:00:00', unloadingTime: '2026-02-21 12:01:39' },
  { id: '3', waybillNumber: 'PHW2603055A2', projectName: 'Richard Project', customerCode: 'RC-20250301', billingTruckType: '6 Wheeler', positionTime: '2026-03-05 08:00:00', unloadingTime: '2026-03-06 10:30:00' },
  { id: '4', waybillNumber: 'PHW2603112B7', projectName: 'Ethan0417, URC-Cebu', customerCode: 'External Code:P301499632', billingTruckType: '10 Wheeler Wing Van', positionTime: '2026-03-11 14:00:00', unloadingTime: '2026-03-13 09:15:00' },
  { id: '5', waybillNumber: 'PHW2603198C4', projectName: 'Overview project', customerCode: 'OV-20250320', billingTruckType: '4 Wheeler', positionTime: '2026-03-19 06:00:00', unloadingTime: '2026-03-20 11:00:00' },
];

interface CreateStatementProps {
  onGenerate: (allocationMode: 'auto' | 'manual') => void;
  onAddInvoice: () => void;
  onBack: () => void;
}

const TOOLTIP_TEXT =
  'Manual Allocation: applicable when settlement waybills are inconsistent across multiple entities.\nAutomatic Allocation: The system distributes all settlement items proportionally based on the invoice amount\'s share of the statement total.';

const INVOICE_ROWS = [
  {
    entity: 'Nestels Comsdfh PH',
    number: '1234567898',
    date: '18,12/2025',
    creditTerm: 40,
    proof: 'CL2510001.pdf',
  },
  {
    entity: 'Nestels Comsdfh PH',
    number: '1234567898',
    date: '18,11/2025',
    creditTerm: 40,
    proof: 'CL2510001.pic',
  },
];

const CLAIM_TICKETS = [
  {
    number: 'CL2510001',
    type: 'Claim Ticket',
    party: 'ACAA Trucking Services',
    claimType: 'KPI Claim',
    amount: '1,025.00',
    customer: 'Deducted',
    vendor: 'Deducted',
    creator: 'Jhea',
  },
  {
    number: 'CL2510002',
    type: 'Refund Ticket',
    party: 'ACAA Trucking Services',
    claimType: 'Delivery late',
    amount: '10,000.00',
    customer: 'Deducted',
    vendor: 'Deducted',
    creator: 'Jhea',
  },
  {
    number: 'CL2510003',
    type: 'Claim Ticket',
    party: 'Inteluck',
    claimType: 'Delivery late',
    amount: '200.25',
    customer: 'Deducted',
    vendor: 'Deducted',
    creator: 'Jhea',
  },
];

function CreateStatement({ onGenerate, onAddInvoice, onBack }: CreateStatementProps) {
  const [basedOnWaybill, setBasedOnWaybill] = useState<'yes' | 'no'>('yes');
  const [taxInclusive, setTaxInclusive] = useState<'yes' | 'no' | null>(null);
  const [allocationMode, setAllocationMode] = useState<'auto' | 'manual'>('manual');
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim-ticket'>('waybill');
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedWaybills, setSelectedWaybills] = useState<Set<string>>(new Set(['1', '2']));

  const toggleWaybill = (id: string) => {
    setSelectedWaybills(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllWaybills = () => {
    if (selectedWaybills.size === WAYBILL_DATA.length) {
      setSelectedWaybills(new Set());
    } else {
      setSelectedWaybills(new Set(WAYBILL_DATA.map(w => w.id)));
    }
  };

  const [settledItems, setSettledItems] = useState({
    all: true,
    basicAmount: false,
    exceptionFee: false,
    additionalCharge: false,
    reimbursement: false,
  });

  const handleAllToggle = () => {
    const next = !settledItems.all;
    setSettledItems({
      all: next,
      basicAmount: next,
      exceptionFee: next,
      additionalCharge: next,
      reimbursement: next,
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Top action bar */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e8e8e8',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Breadcrumb */}
        <div style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            className="link-blue"
            onClick={onBack}
            style={{ cursor: 'pointer' }}
          >
            Customer Statement
          </span>
          <span style={{ color: '#999' }}>\</span>
          <span style={{ color: '#333', fontWeight: 500 }}>Create AR Statement</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-default">Reset</button>
          <button
            className="btn-primary"
            onClick={() => onGenerate(allocationMode)}
            disabled={selectedWaybills.size === 0}
            style={selectedWaybills.size === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            Generate
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Basic Setting */}
        <div style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: 4 }}>
          <div className="section-title">Basic Setting</div>

          {/* Row 1: Is statement based on waybill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#ff4d4f', marginRight: 2 }}>*</span>
            <span style={{ fontSize: 13, color: '#333' }}>Is statement based on waybill:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="radio"
                name="basedOnWaybill"
                checked={basedOnWaybill === 'yes'}
                onChange={() => setBasedOnWaybill('yes')}
                style={{ accentColor: '#00b96b' }}
              />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="radio"
                name="basedOnWaybill"
                checked={basedOnWaybill === 'no'}
                onChange={() => setBasedOnWaybill('no')}
              />
              No
            </label>
          </div>

          {/* Row 2: Customer Name + Reconciliation Period */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#ff4d4f' }}>*</span>
              <span style={{ fontSize: 13, color: '#333', whiteSpace: 'nowrap' }}>Customer Name:</span>
              <div style={{ position: 'relative' }}>
                <input
                  className="filter-input"
                  placeholder="Customer Name"
                  style={{ paddingRight: 28, minWidth: 180 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999',
                    fontSize: 13,
                    pointerEvents: 'none',
                  }}
                >
                  🔍
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#ff4d4f' }}>*</span>
              <span style={{ fontSize: 13, color: '#333', whiteSpace: 'nowrap' }}>Reconciliation Period:</span>
              <input
                className="filter-input"
                placeholder="Unloading Time Start"
                style={{ minWidth: 160 }}
              />
              <span style={{ color: '#999', fontSize: 13 }}>→</span>
              <input
                className="filter-input"
                placeholder="Unloading Time End"
                style={{ minWidth: 160 }}
              />
            </div>
          </div>

          {/* Row 3: Items To Be Settled */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#ff4d4f' }}>*</span>
            <span style={{ fontSize: 13, color: '#333', whiteSpace: 'nowrap' }}>Items To Be Settled:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'basicAmount', label: 'Customer Basic Amount' },
              { key: 'exceptionFee', label: 'Customer Exception Fee' },
              { key: 'additionalCharge', label: 'Customer Additional Charge' },
              { key: 'reimbursement', label: 'Reimbursement Expense' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={settledItems[key as keyof typeof settledItems]}
                  onChange={key === 'all' ? handleAllToggle : () =>
                    setSettledItems(prev => ({ ...prev, [key]: !prev[key as keyof typeof settledItems] }))
                  }
                />
                {label}
              </label>
            ))}
          </div>

          {/* Row 4: Customer Tax Mark + Tax-inclusive + Manually allocate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#333' }}>
              <span>Customer Tax Mark:</span>
              <span style={{ color: '#666' }}>-</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#ff4d4f' }}>*</span>
              <span style={{ fontSize: 13, color: '#333', whiteSpace: 'nowrap' }}>Is the Settlement Tax-inclusive:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio"
                  name="taxInclusive"
                  checked={taxInclusive === 'yes'}
                  onChange={() => setTaxInclusive('yes')}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio"
                  name="taxInclusive"
                  checked={taxInclusive === 'no'}
                  onChange={() => setTaxInclusive('no')}
                />
                No
              </label>
            </div>

            {/* Manually allocate settlement amounts */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                padding: '6px 12px',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 13, color: '#333', whiteSpace: 'nowrap' }}>
                Manually allocate settlement amounts?
              </span>
              {/* Help icon */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '1px solid #999',
                  fontSize: 11,
                  color: '#666',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                ?
                {showTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '120%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#333',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: 4,
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      width: 340,
                      zIndex: 100,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    {TOOLTIP_TEXT}
                  </div>
                )}
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio"
                  name="allocation"
                  checked={allocationMode === 'auto'}
                  onChange={() => setAllocationMode('auto')}
                />
                Automatic
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio"
                  name="allocation"
                  checked={allocationMode === 'manual'}
                  onChange={() => setAllocationMode('manual')}
                  style={{ accentColor: '#00b96b' }}
                />
                Manual
              </label>
            </div>
          </div>
        </div>

        {/* Tab section: Select Waybill / Select Claim Ticket */}
        <div style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
            <div className="tab-bar" style={{ marginBottom: 0, flex: 1 }}>
              <div
                className={`tab-item${activeTab === 'waybill' ? ' active' : ''}`}
                onClick={() => setActiveTab('waybill')}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span style={{ color: '#ff4d4f' }}>*</span>
                Select Waybill
              </div>
              <div
                className={`tab-item${activeTab === 'claim-ticket' ? ' active' : ''}`}
                onClick={() => setActiveTab('claim-ticket')}
              >
                Select Claim Ticket
              </div>
            </div>
            {/* Help icon next to tab bar */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '1px solid #999',
                fontSize: 11,
                color: '#666',
                cursor: 'pointer',
                marginBottom: 2,
                flexShrink: 0,
              }}
            >
              ?
            </span>
          </div>

          {/* Waybill tab content */}
          {activeTab === 'waybill' && (
            <div style={{ marginTop: 16 }}>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <select className="filter-select">
                  <option>Project Name</option>
                </select>
                <select className="filter-select">
                  <option>Waybill Number</option>
                </select>
                <input className="filter-input" placeholder="Customer Code" />
                <select className="filter-select">
                  <option>Billing Truck Type</option>
                </select>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn-default">Reset</button>
                  <button className="btn-primary">Search</button>
                </div>
              </div>

              {/* Count */}
              <div style={{ fontSize: 13, color: '#333', marginBottom: 10 }}>
                {WAYBILL_DATA.length} waybills total, {selectedWaybills.size} waybills selected.
              </div>

              {/* Table */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        checked={selectedWaybills.size === WAYBILL_DATA.length}
                        onChange={toggleAllWaybills}
                      />
                    </th>
                    <th>Waybill Number</th>
                    <th>Project Name</th>
                    <th>Customer Code</th>
                    <th>Billing Truck Type</th>
                    <th>Position Time</th>
                    <th>Unloading Time</th>
                  </tr>
                </thead>
                <tbody>
                  {WAYBILL_DATA.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedWaybills.has(item.id)}
                          onChange={() => toggleWaybill(item.id)}
                        />
                      </td>
                      <td><span className="link-blue">{item.waybillNumber}</span></td>
                      <td>{item.projectName}</td>
                      <td>{item.customerCode}</td>
                      <td>{item.billingTruckType}</td>
                      <td>{item.positionTime}</td>
                      <td>{item.unloadingTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Claim Ticket tab content */}
          {activeTab === 'claim-ticket' && (
            <div style={{ marginTop: 16 }}>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <input className="filter-input" placeholder="Ticket Number" />
                <input className="filter-input" placeholder="Ticket Type" />
                <input className="filter-input" placeholder="Claim Ticket Type" />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn-default">Reset</button>
                  <button className="btn-primary">Search</button>
                </div>
              </div>

              {/* Summary row */}
              <div style={{ fontSize: 13, color: '#333', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>4 tickets total, 2 tickets selected.</span>
                <span>Associate invoice now?</span>
                <button className="btn-default" style={{ padding: '3px 12px' }}>Associate</button>
              </div>

              {/* Claim Ticket Table */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" />
                    </th>
                    <th>Claim Ticket Number</th>
                    <th>Ticket Type</th>
                    <th>Responsible Party</th>
                    <th>Claim Type</th>
                    <th>Amount</th>
                    <th>Deduction for Customer</th>
                    <th>Deduction for Vendor</th>
                    <th>Creator</th>
                  </tr>
                </thead>
                <tbody>
                  {CLAIM_TICKETS.map(ticket => (
                    <tr key={ticket.number}>
                      <td>
                        <input type="checkbox" defaultChecked={ticket.number !== 'CL2510003'} />
                      </td>
                      <td>
                        <span className="link-blue">{ticket.number}</span>
                      </td>
                      <td>{ticket.type}</td>
                      <td>{ticket.party}</td>
                      <td>{ticket.claimType}</td>
                      <td style={{ textAlign: 'right' }}>{ticket.amount}</td>
                      <td>{ticket.customer}</td>
                      <td>{ticket.vendor}</td>
                      <td style={{ fontWeight: 600 }}>{ticket.creator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoice section */}
        <div style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Invoice</div>
            <span className="link-blue" style={{ fontSize: 13, cursor: 'pointer' }} onClick={onAddInvoice}>
              Add Invoice
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Client Entity</th>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Customer Credit Term (Days)</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {INVOICE_ROWS.map((row, i) => (
                <tr key={i}>
                  <td>{row.entity}</td>
                  <td>{row.number}</td>
                  <td>{row.date}</td>
                  <td>{row.creditTerm}</td>
                  <td>
                    <span className="link-blue">{row.proof}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CreateStatement;
