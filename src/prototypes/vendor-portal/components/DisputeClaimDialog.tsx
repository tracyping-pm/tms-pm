import React, { useState } from 'react';

interface Props {
  ticketNo: string;
  onClose: () => void;
  onSubmitted: () => void;
}

function DisputeClaimDialog({ ticketNo, onClose, onSubmitted }: Props) {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  const canSubmit = reason.trim().length > 0 && files.length > 0;
  const remaining = 2000 - reason.length;

  const addFile = () => {
    const n = files.length + 1;
    setFiles([...files, `dispute-proof-${String(n).padStart(2, '0')}.pdf`]);
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 580 }}>
        <div className="modal-header">
          <div className="modal-title">Dispute Claim Ticket · {ticketNo}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info" style={{ borderLeftColor: '#fa8c16', background: '#fff7e6' }}>
            <span>⚠</span>
            After submitting a Dispute, the ticket status will change to <strong>Vendor Disputed</strong> and be re-reviewed by the TMS Claim team. Please provide specific reasons and evidence.
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Reason</label>
              <textarea
                className="form-input"
                rows={5}
                maxLength={2000}
                placeholder="Please describe your objection reason, e.g.: Both parties verified the quantity before loading, the signed receipt has been stamped..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div style={{ fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 }}>
                {remaining} / 2000
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Discrepancy Proof (At least 1 file required)</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {files.map((f, i) => (
                  <span key={i} style={{ background: '#f0faf5', border: '1px solid #b7eb8f', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}>
                    📎 {f}
                    <button className="modal-close" style={{ fontSize: 12, padding: 0, marginLeft: 6 }} onClick={() => removeFile(i)}>✕</button>
                  </span>
                ))}
              </div>
              <button className="btn-default" onClick={addFile}>+ Upload Proof (PDF / Image)</button>
              <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                Supported: transport receipt, loading records, GPS tracks, communication records, etc.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={onSubmitted}>
            Submit Dispute
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisputeClaimDialog;
