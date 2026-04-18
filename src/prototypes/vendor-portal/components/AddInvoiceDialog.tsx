import React, { useState } from 'react';
import type { Invoice } from '../data/invoices';

interface Props {
  onClose: () => void;
  onConfirm: (invoice: Invoice) => void;
}

function AddInvoiceDialog({ onClose, onConfirm }: Props) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState('2026-04-16');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState('');
  const [remark, setRemark] = useState('');

  const canSubmit = invoiceNo.trim() && date && amount && Number(amount) > 0;

  const submit = () => {
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: invoiceNo.trim(),
      invoiceDate: date,
      amount: Number(amount),
      currency: 'PHP',
      documentFileName: file || undefined,
      remark: remark || undefined,
    };
    onConfirm(inv);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 520 }}>
        <div className="modal-header">
          <div className="modal-title">Add Invoice</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Invoice Number</label>
              <input className="form-input" placeholder="e.g., INV-2026-00157" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Invoice Date</label>
              <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label req">Amount (PHP)</label>
              <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Document</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {file ? (
                  <span style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
                    📎 {file}
                    <button className="modal-close" style={{ fontSize: 12, padding: 0, marginLeft: 6 }} onClick={() => setFile('')}>✕</button>
                  </span>
                ) : (
                  <button
                    className="btn-default"
                    onClick={() => setFile(`${invoiceNo || 'invoice'}.pdf`)}
                  >
                    + Upload PDF / Image
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Remark (Optional)</label>
              <input className="form-input" placeholder="e.g., VAT-ex portion" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={submit}>Add Invoice</button>
        </div>
      </div>
    </div>
  );
}

export default AddInvoiceDialog;
