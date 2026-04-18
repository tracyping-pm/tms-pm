import React, { useState } from 'react';

interface Props {
  statementNo: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({ statementNo, onClose, onConfirm }: Props) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<string>('');
  const [proofFiles, setProofFiles] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);

  const canSubmit = invoiceNo.trim().length > 0 && invoiceFile && proofFiles.length > 0 && acknowledged;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 600 }}>
        <div className="modal-header">
          <div className="modal-title">Vendor Confirm · {statementNo}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            Confirming this statement will move it to <strong>Pending Payable</strong>. You must provide the final invoice number, invoice file, and a confirmation proof.
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Invoice Number</label>
              <input className="form-input" placeholder="e.g., INV-2026-00157" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Invoice File</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {invoiceFile ? (
                  <span style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
                    📎 {invoiceFile}
                    <button className="modal-close" style={{ fontSize: 12, padding: 0, marginLeft: 6 }} onClick={() => setInvoiceFile('')}>✕</button>
                  </span>
                ) : (
                  <button className="btn-default" onClick={() => setInvoiceFile('INV-2026-00157.pdf')}>+ Upload Invoice</button>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Vendor Confirm Proof (at least 1 file)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {proofFiles.map((f, i) => (
                  <span key={i} style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
                    📎 {f}
                    <button className="modal-close" style={{ fontSize: 12, padding: 0, marginLeft: 6 }} onClick={() => setProofFiles(proofFiles.filter((_, j) => j !== i))}>✕</button>
                  </span>
                ))}
                <button className="btn-default" onClick={() => setProofFiles([...proofFiles, `confirm-signoff-${proofFiles.length + 1}.pdf`])}>+ Attach File</button>
              </div>
              <div className="form-help">Signed confirmation, company stamp scan, or equivalent. Max 200MB each.</div>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: 10, background: '#fafafa', borderRadius: 4 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
              <span>
                I confirm that the amounts and waybills in this statement match our records. I authorize Inteluck to proceed with payment processing based on this confirmation.
              </span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={onConfirm}>
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
