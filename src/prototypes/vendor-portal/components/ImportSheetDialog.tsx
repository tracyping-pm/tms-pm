import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onImported: () => void;
}

function ImportSheetDialog({ onClose, onImported }: Props) {
  const [stage, setStage] = useState<'upload' | 'validating' | 'preview' | 'failure'>('upload');
  const [fileName, setFileName] = useState('');

  const handlePick = () => {
    const name = 'vendor-reconciliation-202604.xlsx';
    setFileName(name);
    setStage('validating');
    setTimeout(() => setStage('preview'), 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 640 }}>
        <div className="modal-header">
          <div className="modal-title">Import Reconciliation Sheet</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            Last import: <strong>2026-04-15 14:28</strong> — 6 rows imported successfully. Uploading again will replace the previous data.
          </div>

          <div className="vp-card" style={{ padding: 14, marginBottom: 12 }}>
            <div className="import-step">
              <div className="import-step-num">1</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Download the template</div>
                <div style={{ fontSize: 12, color: '#999' }}>Country-specific columns. Fill only waybills in Awaiting Price Verification / Awaiting Settlement.</div>
              </div>
              <button className="btn-default">Edit in Template</button>
            </div>

            <div className="import-step">
              <div className="import-step-num">2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Fill in your own amounts per settlement item</div>
                <div style={{ fontSize: 12, color: '#999' }}>Columns: Waybill No. · Paid in Advance · Basic (Remaining) · Additional · Exception · Claim · Remark</div>
              </div>
            </div>

            <div className="import-step">
              <div className="import-step-num">3</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Upload the sheet · System runs a Diff</div>
                <div style={{ fontSize: 12, color: '#999' }}>Any row-level validation error (unknown waybill / non-numeric / duplicate) will reject the whole sheet.</div>
              </div>
            </div>
          </div>

          {stage === 'upload' && (
            <div className="dropzone" onClick={handlePick}>
              Click to select .xlsx / .csv or drag & drop here
            </div>
          )}

          {stage === 'validating' && (
            <div className="alert alert-warn">
              <span>◷</span> Validating <strong>{fileName}</strong>…
            </div>
          )}

          {stage === 'preview' && (
            <>
              <div className="alert alert-success">
                <span>✓</span> <strong>{fileName}</strong> validated — 6 rows matched to your waybills.
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waybill No.</th>
                    <th className="num">Paid in Advance</th>
                    <th className="num">Basic</th>
                    <th className="num">Additional</th>
                    <th className="num">Exception</th>
                    <th className="num">Claim</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>WB2604001</td><td className="num">0</td><td className="num">15,000</td><td className="num">500</td><td className="num">0</td><td className="num">0</td><td><span className="tag tag-matched">OK</span></td></tr>
                  <tr><td>WB2604002</td><td className="num">2,000</td><td className="num">10,000</td><td className="num">0</td><td className="num">1,200</td><td className="num">0</td><td><span className="tag tag-matched">OK</span></td></tr>
                  <tr><td>WB2604003</td><td className="num">0</td><td className="num">17,500</td><td className="num">1,500</td><td className="num">0</td><td className="num">0</td><td><span className="tag tag-matched">OK</span></td></tr>
                  <tr><td>WB2604004</td><td className="num">0</td><td className="num">7,800</td><td className="num">300</td><td className="num">0</td><td className="num">500</td><td><span className="tag tag-matched">OK</span></td></tr>
                  <tr><td>WB2604005</td><td className="num">0</td><td className="num">14,200</td><td className="num">0</td><td className="num">0</td><td className="num">0</td><td><span className="tag tag-matched">OK</span></td></tr>
                  <tr><td>WB2604006</td><td className="num">0</td><td className="num">15,500</td><td className="num">800</td><td className="num">0</td><td className="num">0</td><td><span className="tag tag-matched">OK</span></td></tr>
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={stage !== 'preview'} onClick={onImported}>Confirm &amp; View Diff</button>
        </div>
      </div>
    </div>
  );
}

export default ImportSheetDialog;
