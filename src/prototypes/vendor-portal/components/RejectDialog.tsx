import React, { useState } from 'react';

interface Props {
  statementNo: string;
  onClose: () => void;
  onReject: () => void;
}

function RejectDialog({ statementNo, onClose, onReject }: Props) {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('Amount Mismatch');
  const [proof, setProof] = useState<string[]>([]);

  const canSubmit = reason.trim().length > 0 && proof.length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 600 }}>
        <div className="modal-header">
          <div className="modal-title">Reject Statement · {statementNo}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-warn">
            Rejecting returns this statement to <strong>Pending</strong> for Procurement to adjust. Your reason and proof will be forwarded to the operations team.
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Discrepancy Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Amount Mismatch</option>
                <option>Missing Waybill</option>
                <option>Extra Waybill Included</option>
                <option>Period / Grouping Issue</option>
                <option>Tax / Invoice Issue</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Reject Reason (max 2000 chars)</label>
              <textarea
                className="form-textarea"
                placeholder="Describe which waybill / item has the mismatch and what the correct value should be."
                value={reason}
                maxLength={2000}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="form-help">{reason.length} / 2000</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Discrepancy Proof (at least 1 file)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {proof.map((f, i) => (
                  <span key={i} style={{ background: '#fff1b8', border: '1px solid #ffe58f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
                    📎 {f}
                    <button className="modal-close" style={{ fontSize: 12, padding: 0, marginLeft: 6 }} onClick={() => setProof(proof.filter((_, j) => j !== i))}>✕</button>
                  </span>
                ))}
                <button className="btn-default" onClick={() => setProof([...proof, `discrepancy-${proof.length + 1}.pdf`])}>+ Attach File</button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-danger" disabled={!canSubmit} onClick={onReject}>
            Reject Statement
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectDialog;
