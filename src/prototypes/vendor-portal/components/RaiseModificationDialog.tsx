import React, { useMemo, useState } from 'react';
import type { DiffRow } from './DiffView';

interface Props {
  rows: DiffRow[];
  onClose: () => void;
  onSubmitted: () => void;
}

function RaiseModificationDialog({ rows, onClose, onSubmitted }: Props) {
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState<string[]>([]);
  const [decision, setDecision] = useState<'draft' | 'submit'>('submit');

  const totalDelta = useMemo(() => rows.reduce((a, r) => a + r.delta, 0), [rows]);

  const handleAttach = () => {
    const names = ['weighbridge-ticket.pdf', 'customer-signoff.jpg'];
    setProof(Array.from(new Set([...proof, names[proof.length % names.length]])));
  };

  const removeProof = (name: string) => setProof(proof.filter(n => n !== name));

  const canSubmit = proof.length > 0 && reason.trim().length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 780 }}>
        <div className="modal-header">
          <div className="modal-title">
            Raise Price Modification Request
            <span style={{ marginLeft: 10, fontSize: 12, color: '#999', fontWeight: 400 }}>
              Ap + M + YYMMDD + 3 random digits
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            Submit discrepancy rows as a single modification request. Procurement will review row-by-row; approved rows update TMS / VP waybill prices automatically.
          </div>

          <div className="vp-card" style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Selected Discrepancy Rows · {rows.length}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waybill No.</th>
                  <th>Settlement Item</th>
                  <th className="num">TMS Amount</th>
                  <th className="num">Your Amount</th>
                  <th className="num">Delta</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.waybill}</td>
                    <td>{r.item}</td>
                    <td className="num tms-amt">{r.tmsAmount.toLocaleString()}</td>
                    <td className="num vendor-amt">{r.vendorAmount.toLocaleString()}</td>
                    <td className={`num ${r.delta > 0 ? 'diff-positive' : 'diff-negative'}`}>
                      {(r.delta > 0 ? '+' : '') + r.delta.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td colSpan={4} style={{ textAlign: 'right' }}>Total Delta</td>
                  <td className="num diff-positive">+{totalDelta.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Reason</label>
              <textarea
                className="form-textarea"
                placeholder="Explain why your amount differs — include references (contract clause / customer request / weighbridge reading, etc.). Max 2000 characters."
                value={reason}
                maxLength={2000}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="form-help">{reason.length} / 2000</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Proof (at least 1 file, max 200MB each)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {proof.map((name) => (
                  <span key={name} style={{
                    background: '#f0faf5',
                    border: '1px solid #b7eb8f',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    📎 {name}
                    <button className="modal-close" style={{ fontSize: 12, padding: 0 }} onClick={() => removeProof(name)}>✕</button>
                  </span>
                ))}
                <button className="btn-default" onClick={handleAttach}>+ Attach File</button>
              </div>
              <div className="form-help">Acceptable: weighbridge ticket, customer sign-off POD, contract snippet, etc.</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-default" onClick={() => { setDecision('draft'); onSubmitted(); }}>Save Draft</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => { setDecision('submit'); onSubmitted(); }}>
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default RaiseModificationDialog;
