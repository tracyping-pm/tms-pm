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
            提交 Dispute 后该工单状态将变为 <strong>Vendor Disputed</strong>，由 TMS Claim 团队重新核查。请提供具体异议理由与证据材料。
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Reason</label>
              <textarea
                className="form-input"
                rows={5}
                maxLength={2000}
                placeholder="请说明异议理由，例如：装车前已双方核对数量无误、签收单已盖章确认……"
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
              <label className="form-label req">Discrepancy Proof（至少 1 份）</label>
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
                支持运输签收单、装车记录、GPS 轨迹、沟通记录等。
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
