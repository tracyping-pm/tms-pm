import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onSubmit: () => void;
}

interface InTransitWaybill {
  no: string;
  status: 'Planning' | 'In Transit' | 'Pending';
  truckType: string;
  origin: string;
  destination: string;
}

const IN_TRANSIT_WAYBILLS: InTransitWaybill[] = [
  { no: 'WB2604020', status: 'In Transit', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC' },
  { no: 'WB2604021', status: 'In Transit', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig' },
  { no: 'WB2604022', status: 'Planning', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila' },
  { no: 'WB2604023', status: 'Pending', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba' },
  { no: 'WB2604024', status: 'In Transit', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area' },
];

interface BankAccount {
  id: string;
  label: string;
}

const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'BA001', label: 'BPI — 1234-5678-90 (Coca-Cola Bottlers PH)' },
  { id: 'BA002', label: 'BDO — 9876-5432-10 (Coca-Cola Bottlers PH)' },
  { id: 'BA003', label: 'UnionBank — 5555-1111-22 (Coca-Cola Bottlers PH)' },
];

const VAT_RATES = [0, 5, 8, 12];
const WHT_RATES = [0, 1, 2, 5];

function getStatusBadge(status: InTransitWaybill['status']) {
  const base: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 11, whiteSpace: 'nowrap' };
  switch (status) {
    case 'In Transit': return <span style={{ ...base, background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' }}>In Transit</span>;
    case 'Planning': return <span style={{ ...base, background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' }}>Planning</span>;
    case 'Pending': return <span style={{ ...base, background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' }}>Pending</span>;
  }
}

function PrePaidApplicationForm({ onBack, onSubmit }: Props) {
  const [selectedWaybills, setSelectedWaybills] = useState<Set<string>>(new Set());
  const [prepaidAmount, setPrepaidAmount] = useState('');
  const [vatRate, setVatRate] = useState(12);
  const [whtRate, setWhtRate] = useState(2);
  const [bankAccount, setBankAccount] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [remark, setRemark] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);

  // Add New Bank Info modal state
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [bankModalError, setBankModalError] = useState('');

  const toggleWaybill = (no: string) => {
    setSelectedWaybills(prev => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no); else next.add(no);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedWaybills.size === IN_TRANSIT_WAYBILLS.length) {
      setSelectedWaybills(new Set());
    } else {
      setSelectedWaybills(new Set(IN_TRANSIT_WAYBILLS.map(w => w.no)));
    }
  };

  const amount = parseFloat(prepaidAmount) || 0;
  const vatAmount = +(amount * vatRate / 100).toFixed(2);
  const whtAmount = +(amount * whtRate / 100).toFixed(2);
  const totalAmount = +(amount + vatAmount - whtAmount).toFixed(2);

  const handleSubmit = () => {
    if (selectedWaybills.size === 0) { setValidationError('Please select at least one waybill.'); return; }
    if (!prepaidAmount || amount <= 0) { setValidationError('Please enter a valid prepaid amount.'); return; }
    if (!bankAccount) { setValidationError('Please select a bank account.'); return; }
    setValidationError('');
    setSubmitted(true);
  };

  const handleSaveNewBank = () => {
    if (!newBankName.trim() || !newAccountNumber.trim() || !newAccountHolder.trim()) {
      setBankModalError('All fields are required.');
      return;
    }
    const newId = `BA${String(bankAccounts.length + 1).padStart(3, '0')}`;
    const newEntry: BankAccount = {
      id: newId,
      label: `${newBankName.trim()} — ${newAccountNumber.trim()} (${newAccountHolder.trim()})`,
    };
    setBankAccounts(prev => [...prev, newEntry]);
    setBankAccount(newId);
    setShowAddBankModal(false);
    setNewBankName('');
    setNewAccountNumber('');
    setNewAccountHolder('');
    setBankModalError('');
  };

  const handleCancelNewBank = () => {
    setShowAddBankModal(false);
    setNewBankName('');
    setNewAccountNumber('');
    setNewAccountHolder('');
    setBankModalError('');
  };

  if (submitted) {
    return (
      <div className="vp-card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#00b96b', marginBottom: 8 }}>Application Submitted</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
          Your prepaid application has been submitted for review. You will be notified once it is approved.
        </div>
        <button className="btn-primary" onClick={onSubmit}>Back to List</button>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn-default" onClick={onBack}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Create PrePaid Application</h2>
      </div>

      {/* Block 1: Select Waybills */}
      <div className="vp-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>1. Select Waybills</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          Only waybills with status <strong>Planning</strong>, <strong>Pending</strong>, or <strong>In Transit</strong> are eligible for prepaid applications.
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  checked={selectedWaybills.size === IN_TRANSIT_WAYBILLS.length}
                  ref={el => { if (el) el.indeterminate = selectedWaybills.size > 0 && selectedWaybills.size < IN_TRANSIT_WAYBILLS.length; }}
                  onChange={toggleAll}
                />
              </th>
              <th>Waybill No.</th>
              <th>Status</th>
              <th>Truck Type</th>
              <th>Origin</th>
              <th>Destination</th>
            </tr>
          </thead>
          <tbody>
            {IN_TRANSIT_WAYBILLS.map(w => (
              <tr key={w.no}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedWaybills.has(w.no)}
                    onChange={() => toggleWaybill(w.no)}
                  />
                </td>
                <td><strong>{w.no}</strong></td>
                <td>{getStatusBadge(w.status)}</td>
                <td>{w.truckType}</td>
                <td style={{ fontSize: 12 }}>{w.origin}</td>
                <td style={{ fontSize: 12 }}>{w.destination}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedWaybills.size > 0 && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0f5ff', borderRadius: 6, fontSize: 13 }}>
            <strong>{selectedWaybills.size}</strong> waybill(s) selected.
          </div>
        )}
      </div>

      {/* Block 2: Amount & Tax */}
      <div className="vp-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>2. Amount & Tax Information</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
              PrePaid Amount <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#888' }}>PHP</span>
              <input
                type="number"
                className="filter-input"
                style={{ flex: 1 }}
                placeholder="0.00"
                value={prepaidAmount}
                onChange={e => setPrepaidAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>VAT Rate</label>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={vatRate}
              onChange={e => setVatRate(Number(e.target.value))}
            >
              {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>WHT Rate</label>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={whtRate}
              onChange={e => setWhtRate(Number(e.target.value))}
            >
              {WHT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
        </div>

        {/* Auto-calculated summary */}
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>Auto-Calculated Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Net Amount', value: amount },
              { label: `VAT (${vatRate}%)`, value: vatAmount },
              { label: `WHT (${whtRate}%)`, value: -whtAmount },
              { label: 'Total Payable', value: totalAmount, highlight: true },
            ].map(item => (
              <div key={item.label} style={{
                background: item.highlight ? '#e6f7ef' : '#fff',
                border: `1px solid ${item.highlight ? '#87e8a3' : '#f0f0f0'}`,
                borderRadius: 6, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 11, color: item.highlight ? '#00b96b' : '#888', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: item.highlight ? '#00b96b' : '#333' }}>
                  PHP {Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Block 3: Payee Information */}
      <div className="vp-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>3. Payee Information</div>
        <div style={{ maxWidth: 400 }}>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
            Bank Account <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <select
            className="filter-select"
            style={{ width: '100%' }}
            value={bankAccount}
            onChange={e => setBankAccount(e.target.value)}
          >
            <option value="">— Select Bank Account —</option>
            {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <button
              style={{ background: 'none', border: 'none', color: '#00b96b', fontSize: 13, cursor: 'pointer', padding: 0 }}
              onClick={() => setShowAddBankModal(true)}
            >
              + Add New Bank Info
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
            Only accounts already registered in the system are shown.
          </div>
        </div>
      </div>

      {/* Block 4: Proof & Remark */}
      <div className="vp-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>4. Proof &amp; Remark</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Proof Document</label>
            <div
              style={{
                border: '1px dashed #d9d9d9', borderRadius: 8, padding: '24px 16px',
                textAlign: 'center', cursor: 'pointer', background: '#fafafa',
              }}
              onClick={() => setProofFileName('payment_voucher_PPA2604005.pdf')}
            >
              {proofFileName ? (
                <div style={{ fontSize: 13, color: '#00b96b' }}>
                  📄 {proofFileName}
                  <span
                    style={{ marginLeft: 8, color: '#999', cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); setProofFileName(''); }}
                  >✕</span>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 24, marginBottom: 6, color: '#bbb' }}>↑</div>
                  <div style={{ fontSize: 13, color: '#888' }}>Click to upload</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>PDF, JPG, PNG · max 10MB</div>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Remark</label>
            <textarea
              style={{
                width: '100%', height: 100, padding: '8px 12px',
                border: '1px solid #d9d9d9', borderRadius: 6,
                fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
              }}
              placeholder="Optional — add any notes or context for the reviewer."
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 12 }}>
          ⚠ {validationError}
        </div>
      )}

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn-default" onClick={onBack}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit}>Submit Application</button>
      </div>

      {/* Add New Bank Info Modal */}
      {showAddBankModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 28, width: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Add New Bank Info</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
                Bank Name <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <input
                className="filter-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. BPI"
                value={newBankName}
                onChange={e => setNewBankName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
                Account Number <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <input
                className="filter-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. 1234-5678-90"
                value={newAccountNumber}
                onChange={e => setNewAccountNumber(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
                Account Holder Name <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <input
                className="filter-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. Coca-Cola Bottlers PH"
                value={newAccountHolder}
                onChange={e => setNewAccountHolder(e.target.value)}
              />
            </div>

            {bankModalError && (
              <div style={{ fontSize: 12, color: '#cf1322', marginBottom: 12 }}>⚠ {bankModalError}</div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn-default" onClick={handleCancelNewBank}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveNewBank}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrePaidApplicationForm;
