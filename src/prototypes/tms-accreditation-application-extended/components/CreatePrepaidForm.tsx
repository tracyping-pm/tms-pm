import React, { useState, useMemo } from 'react';

interface Props {
  onBack: () => void;
  onSubmit: () => void;
}

interface Waybill {
  no: string;
  status: 'Planning' | 'In Transit' | 'Pending';
  vendor: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  currency: string;
}

const VENDORS = [
  'Coca-Cola Bottlers PH Inc.',
  'SMC Logistics',
  'JG Summit Freight',
  'Manila Freight Co.',
  'Bangkok Express Logistics',
];

const ALL_WAYBILLS: Waybill[] = [
  { no: 'WB2604021', status: 'In Transit', vendor: 'Coca-Cola Bottlers PH Inc.', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', basicAmount: 8000, currency: 'PHP' },
  { no: 'WB2604022', status: 'Planning', vendor: 'Coca-Cola Bottlers PH Inc.', truckType: '6-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila', basicAmount: 15000, currency: 'PHP' },
  { no: 'WB2604030', status: 'In Transit', vendor: 'SMC Logistics', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area', basicAmount: 20000, currency: 'PHP' },
  { no: 'WB2604035', status: 'Pending', vendor: 'JG Summit Freight', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba', basicAmount: 6000, currency: 'PHP' },
  { no: 'WB2604036', status: 'Planning', vendor: 'JG Summit Freight', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', basicAmount: 26000, currency: 'PHP' },
  { no: 'WB2604040', status: 'In Transit', vendor: 'Bangkok Express Logistics', truckType: '10-Wheeler', origin: 'TH-Bangkok / Suvarnabhumi', destination: 'TH-Chonburi / Laem Chabang', basicAmount: 45000, currency: 'THB' },
];

const STATUS_BADGE: Record<Waybill['status'], React.CSSProperties> = {
  'In Transit': { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Planning': { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Pending': { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
};

const BANK_ACCOUNTS: Record<string, string[]> = {
  'Coca-Cola Bottlers PH Inc.': ['BPI — 1234-5678-90', 'BDO — 9876-5432-10'],
  'SMC Logistics': ['Metrobank — 1111-2222-33'],
  'JG Summit Freight': ['BDO — 4444-5555-66', 'UnionBank — 7777-8888-99'],
  'Manila Freight Co.': ['BPI — 3333-4444-55'],
  'Bangkok Express Logistics': ['Kasikorn — 6666-7777-88'],
};

const VAT_RATES = [0, 5, 7, 8, 12];
const WHT_RATES = [0, 1, 2, 5];

function CreatePrepaidForm({ onBack, onSubmit }: Props) {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedWaybills, setSelectedWaybills] = useState<Set<string>>(new Set());
  const [prepaidAmount, setPrepaidAmount] = useState('');
  const [vatRate, setVatRate] = useState(12);
  const [whtRate, setWhtRate] = useState(2);
  const [bankAccount, setBankAccount] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [remark, setRemark] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const vendorWaybills = ALL_WAYBILLS.filter(w => !selectedVendor || w.vendor === selectedVendor);

  const toggleWaybill = (no: string) => {
    setSelectedWaybills(prev => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no); else next.add(no);
      return next;
    });
    setBankAccount('');
  };

  const toggleAll = () => {
    const selectable = vendorWaybills.map(w => w.no);
    if (selectable.every(n => selectedWaybills.has(n))) {
      setSelectedWaybills(prev => { const n = new Set(prev); selectable.forEach(k => n.delete(k)); return n; });
    } else {
      setSelectedWaybills(prev => { const n = new Set(prev); selectable.forEach(k => n.add(k)); return n; });
    }
  };

  const totalBasic = useMemo(() => {
    return ALL_WAYBILLS.filter(w => selectedWaybills.has(w.no)).reduce((s, w) => s + w.basicAmount, 0);
  }, [selectedWaybills]);

  const detectedVendor = useMemo(() => {
    const selected = ALL_WAYBILLS.filter(w => selectedWaybills.has(w.no));
    const vendors = [...new Set(selected.map(w => w.vendor))];
    return vendors.length === 1 ? vendors[0] : null;
  }, [selectedWaybills]);

  const amount = parseFloat(prepaidAmount) || 0;
  const vatAmount = +(amount * vatRate / 100).toFixed(2);
  const whtAmount = +(amount * whtRate / 100).toFixed(2);
  const totalPayable = +(amount + vatAmount - whtAmount).toFixed(2);
  const isOverLimit = totalBasic > 0 && amount > totalBasic;

  const bankOptions = detectedVendor ? (BANK_ACCOUNTS[detectedVendor] || []) : [];

  const handleSubmit = () => {
    if (selectedWaybills.size === 0) { setValidationError('Please select at least one waybill.'); return; }
    if (!amount || amount <= 0) { setValidationError('Please enter a valid prepaid amount.'); return; }
    if (isOverLimit) { setValidationError(`Prepaid amount cannot exceed total basic freight.`); return; }
    if (!bankAccount) { setValidationError('Please select a bank account.'); return; }
    setValidationError('');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="tms-card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#00b96b', marginBottom: 8 }}>Application Created</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
          The prepaid application is now in <strong>Pending Review</strong> status and is pending FA approval.
        </div>
        <button className="btn-primary" onClick={onSubmit}>Back to List</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn-link" onClick={onBack}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Create Prepaid Application (Internal)</h2>
      </div>

      {/* Block 1: Select Waybills */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>1. Select Waybills</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          Only <strong>Planning</strong>, <strong>Pending</strong>, and <strong>In Transit</strong> waybills are eligible. Waybills must belong to a single vendor.
        </div>

        <div className="filter-row" style={{ marginBottom: 12 }}>
          <select
            className="filter-select"
            value={selectedVendor}
            onChange={e => { setSelectedVendor(e.target.value); setSelectedWaybills(new Set()); setBankAccount(''); }}
          >
            <option value="">Filter by Vendor (optional)</option>
            {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  checked={vendorWaybills.length > 0 && vendorWaybills.every(w => selectedWaybills.has(w.no))}
                  ref={el => {
                    if (el) el.indeterminate =
                      selectedWaybills.size > 0 && vendorWaybills.some(w => selectedWaybills.has(w.no)) &&
                      !vendorWaybills.every(w => selectedWaybills.has(w.no));
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th>Waybill No.</th>
              <th>Status</th>
              <th>Vendor</th>
              <th>Truck Type</th>
              <th>Origin → Destination</th>
              <th style={{ textAlign: 'right' }}>Basic Amount</th>
            </tr>
          </thead>
          <tbody>
            {vendorWaybills.map(w => (
              <tr key={w.no}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedWaybills.has(w.no)}
                    onChange={() => toggleWaybill(w.no)}
                  />
                </td>
                <td><strong>{w.no}</strong></td>
                <td>
                  <span style={{ borderRadius: 4, padding: '2px 8px', fontSize: 11, ...STATUS_BADGE[w.status] }}>{w.status}</span>
                </td>
                <td style={{ fontSize: 12 }}>{w.vendor}</td>
                <td>{w.truckType}</td>
                <td style={{ fontSize: 11, color: '#666' }}>{w.origin} → {w.destination}</td>
                <td style={{ textAlign: 'right' }}>{w.currency} {w.basicAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedWaybills.size > 0 && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0f5ff', borderRadius: 6, fontSize: 13, display: 'flex', gap: 24 }}>
            <span><strong>{selectedWaybills.size}</strong> selected</span>
            <span>Total Basic: <strong>
              {[...new Set(ALL_WAYBILLS.filter(w => selectedWaybills.has(w.no)).map(w => w.currency))].join('/')}
              {' '}{totalBasic.toLocaleString()}
            </strong></span>
            {detectedVendor && <span>Vendor: <strong>{detectedVendor}</strong></span>}
          </div>
        )}
      </div>

      {/* Block 2: Amount & Tax */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>2. Amount &amp; Tax</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
              Prepaid Amount <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <input
              type="number"
              className="filter-input"
              style={{ width: '100%' }}
              placeholder="0.00"
              value={prepaidAmount}
              onChange={e => setPrepaidAmount(e.target.value)}
            />
            {totalBasic > 0 && amount > 0 && (
              <div style={{ fontSize: 11, color: isOverLimit ? '#cf1322' : '#00b96b', marginTop: 4 }}>
                {isOverLimit ? '⚠ Exceeds total basic freight' : `${(amount / totalBasic * 100).toFixed(1)}% of total basic`}
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>VAT Rate</label>
            <select className="filter-select" style={{ width: '100%' }} value={vatRate} onChange={e => setVatRate(Number(e.target.value))}>
              {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>WHT Rate</label>
            <select className="filter-select" style={{ width: '100%' }} value={whtRate} onChange={e => setWhtRate(Number(e.target.value))}>
              {WHT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
        </div>

        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Net Amount', value: amount },
              { label: `VAT (${vatRate}%)`, value: vatAmount },
              { label: `WHT (${whtRate}%)`, value: -whtAmount },
              { label: 'Total Payable', value: totalPayable, highlight: true },
            ].map(item => (
              <div key={item.label} style={{
                background: item.highlight ? '#e6f7ef' : '#fff',
                border: `1px solid ${item.highlight ? '#87e8a3' : '#f0f0f0'}`,
                borderRadius: 6, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 11, color: item.highlight ? '#00b96b' : '#888', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: item.highlight ? '#00b96b' : '#333' }}>
                  {Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Block 3: Payee */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>3. Payee Information</div>
        <div style={{ maxWidth: 400 }}>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
            Bank Account <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          {bankOptions.length > 0 ? (
            <select className="filter-select" style={{ width: '100%' }} value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
              <option value="">— Select Bank Account —</option>
              {bankOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <div style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>
              {selectedWaybills.size === 0 ? 'Select waybills first to load bank accounts.' : 'No registered bank accounts for this vendor.'}
            </div>
          )}
        </div>
      </div>

      {/* Block 4: Proof & Remark */}
      <div className="tms-card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>4. Proof &amp; Remark</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Proof Document</label>
            <div
              style={{ border: '1px dashed #d9d9d9', borderRadius: 8, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
              onClick={() => setProofFileName('tms_prepaid_supporting.pdf')}
            >
              {proofFileName ? (
                <div style={{ fontSize: 13, color: '#00b96b' }}>
                  📄 {proofFileName}
                  <span style={{ marginLeft: 8, color: '#999', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setProofFileName(''); }}>✕</span>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 22, color: '#bbb', marginBottom: 4 }}>↑</div>
                  <div style={{ fontSize: 13, color: '#888' }}>Click to upload</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>PDF, JPG, PNG · max 10MB</div>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Remark</label>
            <textarea
              style={{ width: '100%', height: 90, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Internal notes for this prepaid application."
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>
        </div>
      </div>

      {validationError && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 12 }}>
          ⚠ {validationError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn-default" onClick={onBack}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit}>Submit for Review</button>
      </div>
    </div>
  );
}

export default CreatePrepaidForm;
