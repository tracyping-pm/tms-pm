import React, { useState } from 'react';

interface CreateStatementProps {
  onGenerate: (allocationMode: 'auto' | 'manual') => void;
  onAddInvoice: () => void;
  onBack: () => void;
}

const CUSTOMER_TAX_MARKS: Record<string, string> = {
  customerA: 'Tax-inclusive',
  customerB: 'Tax-exclusive',
  customerC: 'Tax-inclusive',
};

const SETTLEMENT_ITEM_KEYS = [
  'customerBasicAmount',
  'customerAdditionalCharge',
  'customerExceptionFee',
  'reimbursementExpense',
] as const;

type SettlementItemKey = (typeof SETTLEMENT_ITEM_KEYS)[number];

const SETTLEMENT_ITEM_LABELS: Record<SettlementItemKey, string> = {
  customerBasicAmount: 'Customer Basic Amount',
  customerAdditionalCharge: 'Customer Additional Charge',
  customerExceptionFee: 'Customer Exception Fee',
  reimbursementExpense: 'Reimbursement Expense',
};

function CreateStatement({ onGenerate, onAddInvoice, onBack }: CreateStatementProps) {
  // Basic Information state
  const [statementType, setStatementType] = useState<'standard' | 'standalone'>('standard');
  const [customer, setCustomer] = useState('');
  const [reconciliationStart, setReconciliationStart] = useState('');
  const [reconciliationEnd, setReconciliationEnd] = useState('');
  const [settlementItems, setSettlementItems] = useState<Record<SettlementItemKey | 'all', boolean>>({
    all: false,
    customerBasicAmount: false,
    customerAdditionalCharge: false,
    customerExceptionFee: false,
    reimbursementExpense: false,
  });
  const [statementTaxMark, setStatementTaxMark] = useState<'tax-inclusive' | 'tax-exclusive' | ''>('');

  // Source Modules state
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');
  const [allocationMode, setAllocationMode] = useState<'auto' | 'manual'>('auto');

  // Settlement item helpers
  const handleAllToggle = () => {
    const next = !settlementItems.all;
    const updated = { all: next } as Record<SettlementItemKey | 'all', boolean>;
    SETTLEMENT_ITEM_KEYS.forEach(k => { updated[k] = next; });
    setSettlementItems(updated);
  };

  const handleItemToggle = (key: SettlementItemKey) => {
    const next = { ...settlementItems, [key]: !settlementItems[key] };
    const allChecked = SETTLEMENT_ITEM_KEYS.every(k => next[k]);
    next.all = allChecked;
    setSettlementItems(next);
  };

  const customerTaxMark = customer ? (CUSTOMER_TAX_MARKS[customer] ?? '-') : '-';

  // Derived summary tax display
  const taxInclusiveActive = statementTaxMark === 'tax-inclusive';
  const taxExclusiveActive = statementTaxMark === 'tax-exclusive';

  // Checked settlement items for summary sub-list
  const checkedItems = SETTLEMENT_ITEM_KEYS.filter(k => settlementItems[k]);

  // Styles
  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px 24px',
    borderRadius: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: '#333',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: '1px solid #f0f0f0',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#333',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  };

  const requiredStar = <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>;

  const formGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 6,
  };

  const inlineGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  };

  const radioLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
    fontSize: 13,
    color: '#333',
  };

  const selectStyle: React.CSSProperties = {
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    padding: '5px 10px',
    fontSize: 13,
    color: '#333',
    outline: 'none',
    minWidth: 220,
    backgroundColor: '#fff',
  };

  const dateInputStyle: React.CSSProperties = {
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    padding: '5px 10px',
    fontSize: 13,
    color: '#333',
    outline: 'none',
    minWidth: 150,
  };

  const infoValueStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#666',
    padding: '5px 0',
  };

  const btnPrimaryStyle: React.CSSProperties = {
    backgroundColor: '#00b96b',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };

  const btnDefaultStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };

  const btnDangerStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    color: '#ff4d4f',
    border: '1px solid #ff4d4f',
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };

  const btnSuccessStyle: React.CSSProperties = {
    backgroundColor: '#00b96b',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '2px solid #f0f0f0',
    marginBottom: 16,
    gap: 0,
  };

  const getTabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    fontSize: 14,
    cursor: 'pointer',
    borderBottom: active ? '2px solid #00b96b' : '2px solid transparent',
    color: active ? '#00b96b' : '#555',
    fontWeight: active ? 600 : 400,
    marginBottom: -2,
    userSelect: 'none',
  });

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  };

  const thStyle: React.CSSProperties = {
    backgroundColor: '#fafafa',
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #e8e8e8',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
    verticalAlign: 'middle',
  };

  const emptyRowStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#999',
    padding: '32px 12px',
    fontSize: 13,
  };

  const dotStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: active ? '#00b96b' : '#d9d9d9',
    marginRight: 5,
    verticalAlign: 'middle',
  });

  const amountColHeadStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: 8,
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    color: '#666',
    fontSize: 12,
    padding: '1px 8px',
    borderRadius: 10,
    marginLeft: 8,
    fontWeight: 400,
    verticalAlign: 'middle',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* ── Top action bar ── */}
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
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#222' }}>Create AR Statement</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnDefaultStyle} onClick={onBack}>
            ← Back
          </button>
          <button style={btnDefaultStyle}>
            💾 Save
          </button>
          <button style={btnSuccessStyle} onClick={() => onGenerate(allocationMode)}>
            ✓ Submit
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ══ Basic Information ══ */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Basic Information</div>

          {/* 4-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '18px 24px',
            }}
          >
            {/* Statement Type */}
            <div style={{ ...formGroupStyle, gridColumn: '1 / 2' }}>
              <div style={labelStyle}>{requiredStar} Statement Type</div>
              <div style={inlineGroupStyle}>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="statementType"
                    value="standard"
                    checked={statementType === 'standard'}
                    onChange={() => setStatementType('standard')}
                    style={{ accentColor: '#00b96b' }}
                  />
                  Standard
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="statementType"
                    value="standalone"
                    checked={statementType === 'standalone'}
                    onChange={() => setStatementType('standalone')}
                    style={{ accentColor: '#00b96b' }}
                  />
                  Standalone
                </label>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                Standard uses Waybill-linked, Standalone uses Non-waybill.
              </div>
            </div>

            {/* Customer */}
            <div style={{ ...formGroupStyle, gridColumn: '2 / 3' }}>
              <div style={labelStyle}>{requiredStar} Customer</div>
              <select
                style={selectStyle}
                value={customer}
                onChange={e => setCustomer(e.target.value)}
              >
                <option value="">Please select</option>
                <option value="customerA">Customer A - ABC Logistics</option>
                <option value="customerB">Customer B - XYZ Trading</option>
                <option value="customerC">Customer C - Global Freight Co.</option>
              </select>
            </div>

            {/* Reconciliation Period — spans 2 cols */}
            <div style={{ ...formGroupStyle, gridColumn: '3 / 5' }}>
              <div style={labelStyle}>{requiredStar} Reconciliation Period</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="date"
                  style={dateInputStyle}
                  value={reconciliationStart}
                  onChange={e => setReconciliationStart(e.target.value)}
                />
                <span style={{ color: '#999', fontSize: 14 }}>~</span>
                <input
                  type="date"
                  style={dateInputStyle}
                  value={reconciliationEnd}
                  onChange={e => setReconciliationEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Items to be settled — spans all 4 cols */}
            <div style={{ ...formGroupStyle, gridColumn: '1 / 5' }}>
              <div style={labelStyle}>{requiredStar} Items to be settled</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <label style={radioLabelStyle}>
                  <input
                    type="checkbox"
                    checked={settlementItems.all}
                    onChange={handleAllToggle}
                    style={{ accentColor: '#00b96b' }}
                  />
                  All
                </label>
                {SETTLEMENT_ITEM_KEYS.map(key => (
                  <label key={key} style={radioLabelStyle}>
                    <input
                      type="checkbox"
                      checked={settlementItems[key]}
                      onChange={() => handleItemToggle(key)}
                      style={{ accentColor: '#00b96b' }}
                    />
                    {SETTLEMENT_ITEM_LABELS[key]}
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Tax Mark */}
            <div style={{ ...formGroupStyle, gridColumn: '1 / 2' }}>
              <div style={labelStyle}>Customer Tax Mark</div>
              <div style={infoValueStyle}>{customerTaxMark}</div>
            </div>

            {/* Statement Tax Mark — spans 3 cols */}
            <div style={{ ...formGroupStyle, gridColumn: '2 / 5' }}>
              <div style={labelStyle}>{requiredStar} Statement Tax Mark</div>
              <div style={inlineGroupStyle}>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="statementTaxMark"
                    value="tax-inclusive"
                    checked={statementTaxMark === 'tax-inclusive'}
                    onChange={() => setStatementTaxMark('tax-inclusive')}
                    style={{ accentColor: '#00b96b' }}
                  />
                  Tax-inclusive
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="statementTaxMark"
                    value="tax-exclusive"
                    checked={statementTaxMark === 'tax-exclusive'}
                    onChange={() => setStatementTaxMark('tax-exclusive')}
                    style={{ accentColor: '#00b96b' }}
                  />
                  Tax-exclusive
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Source Modules (tabs) ══ */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Source Modules</div>

          {/* Tab bar */}
          <div style={tabBarStyle}>
            <div style={getTabStyle(activeTab === 'waybill')} onClick={() => setActiveTab('waybill')}>
              Select Waybill
            </div>
            <div style={getTabStyle(activeTab === 'claim')} onClick={() => setActiveTab('claim')}>
              Select Claim Ticket
            </div>
          </div>

          {/* ── Waybill tab ── */}
          {activeTab === 'waybill' && (
            <div>
              {/* Allocation Mode */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  marginBottom: 14,
                  padding: '10px 14px',
                  backgroundColor: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ ...labelStyle, fontWeight: 600 }}>
                  {requiredStar} Allocation Mode
                </div>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="allocationMode"
                    value="auto"
                    checked={allocationMode === 'auto'}
                    onChange={() => setAllocationMode('auto')}
                    style={{ accentColor: '#00b96b' }}
                  />
                  Auto allocate waybill amount to all invoices
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="allocationMode"
                    value="manual"
                    checked={allocationMode === 'manual'}
                    onChange={() => setAllocationMode('manual')}
                    style={{ accentColor: '#00b96b' }}
                  />
                  Manually allocate waybill and amount to invoices
                </label>
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  style={{ ...btnPrimaryStyle, fontSize: 13, padding: '5px 12px' }}
                  onClick={() => alert('TODO: Open Add Waybill modal')}
                >
                  + Add Waybill
                </button>
                <button style={{ ...btnDangerStyle, fontSize: 13, padding: '5px 12px' }}>
                  🗑 Remove Selected
                </button>
              </div>

              {/* Waybill table */}
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 36 }}>
                      <input type="checkbox" />
                    </th>
                    <th style={thStyle}>Waybill No.</th>
                    <th style={thStyle}>Customer Code</th>
                    <th style={thStyle}>Billing Truck Type</th>
                    <th style={thStyle}>Position Time</th>
                    <th style={thStyle}>Unloading Time</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} style={emptyRowStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 0' }}>
                        <span style={{ fontSize: 28, color: '#d9d9d9' }}>📭</span>
                        <span>No data. Click "Add Waybill" to select.</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── Claim Ticket tab ── */}
          {activeTab === 'claim' && (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  style={{ ...btnPrimaryStyle, fontSize: 13, padding: '5px 12px' }}
                  onClick={() => alert('TODO: Open Add Claim Ticket modal')}
                >
                  + Add Claim Ticket
                </button>
                <button style={{ ...btnDangerStyle, fontSize: 13, padding: '5px 12px' }}>
                  🗑 Remove Selected
                </button>
              </div>

              {/* Claim Ticket table */}
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 36 }}>
                      <input type="checkbox" />
                    </th>
                    <th style={thStyle}>Ticket No.</th>
                    <th style={thStyle}>Claim Type</th>
                    <th style={thStyle}>Claim Amount</th>
                    <th style={thStyle}>Currency</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Associate Invoice</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} style={emptyRowStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 0' }}>
                        <span style={{ fontSize: 28, color: '#d9d9d9' }}>📭</span>
                        <span>No data. Click "Add Claim Ticket" to select.</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══ Amount Summary ══ */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Amount Summary</div>

          {/* Top row: total + tax mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 6,
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Total Amount Receivable</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#00b96b' }}>₱0.00</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <div style={{ fontSize: 13, color: '#666' }}>Statement Tax Mark</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13, color: taxInclusiveActive ? '#00b96b' : '#bbb' }}>
                  <span style={dotStyle(taxInclusiveActive)} />
                  Tax-inclusive
                </span>
                <span style={{ fontSize: 13, color: taxExclusiveActive ? '#00b96b' : '#bbb' }}>
                  <span style={dotStyle(taxExclusiveActive)} />
                  Tax-exclusive
                </span>
              </div>
            </div>
          </div>

          {/* 3-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Waybill Contract Revenue */}
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 4, padding: '12px 16px' }}>
              <div style={amountColHeadStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Waybill Contract Revenue</span>
                <span style={{ fontWeight: 700, color: '#333' }}>₱0.00</span>
              </div>
              {checkedItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {checkedItems.map(key => (
                    <div
                      key={key}
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}
                    >
                      <span>{SETTLEMENT_ITEM_LABELS[key]}</span>
                      <span>₱0.00</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#bbb', paddingTop: 4 }}>
                  No settlement items selected.
                </div>
              )}
            </div>

            {/* Claim */}
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 4, padding: '12px 16px' }}>
              <div style={amountColHeadStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Claim</span>
                <span style={{ fontWeight: 700, color: '#333' }}>₱0.00</span>
              </div>
            </div>

            {/* Others */}
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 4, padding: '12px 16px' }}>
              <div style={amountColHeadStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Others</span>
                <span style={{ fontWeight: 700, color: '#333' }}>₱0.00</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                  <span>VAT</span>
                  <span>₱0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                  <span>WHT</span>
                  <span>₱0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Selected Invoices ══ */}
        <div style={sectionStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>Selected Invoices</span>
              <span style={badgeStyle}>0 items</span>
              <span style={{ fontSize: 13, color: '#999', marginLeft: 4 }}>
                Total Invoice Amount: ₱0.00
              </span>
            </div>
            <button style={{ ...btnPrimaryStyle, fontSize: 13, padding: '5px 12px' }} onClick={onAddInvoice}>
              + Add Invoice
            </button>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Invoice No.</th>
                <th style={thStyle}>Client Entity</th>
                <th style={thStyle}>Invoice Date</th>
                <th style={thStyle}>Invoice Amount</th>
                <th style={thStyle}>Document</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} style={emptyRowStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 0' }}>
                    <span style={{ fontSize: 28, color: '#d9d9d9' }}>📭</span>
                    <span>No invoices selected yet.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default CreateStatement;
