import React, { useState } from 'react';
import AddInvoiceDialog from './AddInvoiceDialog';
import type { Invoice } from '../data/invoices';

interface Props {
  statementNo: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({ statementNo, onClose, onConfirm }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proofFiles, setProofFiles] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const canSubmit = invoices.length > 0 && proofFiles.length > 0 && acknowledged;

  const invoiceTotal = invoices.reduce((a, i) => a + i.amount, 0);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-box" style={{ width: 680 }}>
          <div className="modal-header">
            <div className="modal-title">Vendor Confirm · {statementNo}</div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            <div className="alert alert-info">
              Confirming this statement will move it to <strong>Pending Payable</strong>. You must add at least one invoice, upload confirmation proof, and acknowledge the amounts.
            </div>

            <div className="form-row">
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label req" style={{ margin: 0 }}>Invoices (At least 1, multiple allowed)</label>
                  <button className="btn-default" onClick={() => setShowAdd(true)}>+ Add Invoice</button>
                </div>

                {invoices.length === 0 ? (
                  <div style={{ padding: 16, background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 4, textAlign: 'center', color: '#999', fontSize: 12 }}>
                    No invoices added yet. Click <strong>+ Add Invoice</strong> to add.
                  </div>
                ) : (
                  <table className="data-table" style={{ marginTop: 0 }}>
                    <thead>
                      <tr>
                        <th>Invoice No.</th>
                        <th>Date</th>
                        <th className="num">Amount</th>
                        <th>Document</th>
                        <th>Remark</th>
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id}>
                          <td>{inv.invoiceNo}</td>
                          <td>{inv.invoiceDate}</td>
                          <td className="num">{inv.amount.toLocaleString()}</td>
                          <td style={{ fontSize: 12 }}>{inv.documentFileName ? <span style={{ color: '#1677ff' }}>📎 {inv.documentFileName}</span> : <span style={{ color: '#999' }}>—</span>}</td>
                          <td style={{ fontSize: 12, color: '#666' }}>{inv.remark || '—'}</td>
                          <td>
                            <button
                              className="btn-link"
                              style={{ color: '#cf1322' }}
                              onClick={() => setInvoices(invoices.filter(i => i.id !== inv.id))}
                            >Remove</button>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                        <td colSpan={2} style={{ textAlign: 'right' }}>Invoice Total</td>
                        <td className="num">{invoiceTotal.toLocaleString()} PHP</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tbody>
                  </table>
                )}
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

      {showAdd && (
        <AddInvoiceDialog
          onClose={() => setShowAdd(false)}
          onConfirm={(inv) => {
            setInvoices([...invoices, inv]);
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}

export default ConfirmDialog;
