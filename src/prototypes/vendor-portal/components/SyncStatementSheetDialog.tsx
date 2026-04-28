import React, { useState } from 'react';

/**
 * Path A · Sync from Sheet
 * 供应商下载模板 → 离线填写运单号 + 自有金额 → 上传 → 系统校验后跳转 Create Statement，
 * 表单中的运单及金额按上传内容回显（对应 V3 §1）。
 */

export interface SyncedRow {
  waybillNo: string;
  basicAmount: string;
  additionalCharge: string;
  exceptionFee: string;
  reimbursement: string;
}

interface Props {
  onClose: () => void;
  onSynced: (rows: SyncedRow[]) => void;
}

// 模拟从模板里解析出的数据（运单号映射回 UnbilledWaybillsList 中的可选项）。
const MOCK_PARSED: SyncedRow[] = [
  { waybillNo: 'WB2604010', basicAmount: '15000', additionalCharge: '500',  exceptionFee: '0',    reimbursement: '0'   },
  { waybillNo: 'WB2604011', basicAmount: '10500', additionalCharge: '0',    exceptionFee: '0',    reimbursement: '200' },
  { waybillNo: 'WB2604012', basicAmount: '17500', additionalCharge: '1500', exceptionFee: '0',    reimbursement: '0'   },
  { waybillNo: 'WB2604014', basicAmount: '14200', additionalCharge: '300',  exceptionFee: '0',    reimbursement: '0'   },
  { waybillNo: 'WB2604015', basicAmount: '15500', additionalCharge: '800',  exceptionFee: '500',  reimbursement: '0'   },
];

function SyncStatementSheetDialog({ onClose, onSynced }: Props) {
  const [stage, setStage] = useState<'upload' | 'validating' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');

  const handleDownloadTemplate = () => {
    // 模拟下载，实际 prototype 不真下载文件
  };

  const handlePick = () => {
    setFileName('vendor-statement-202604.xlsx');
    setStage('validating');
    setTimeout(() => setStage('preview'), 700);
  };

  const handleConfirm = () => {
    onSynced(MOCK_PARSED);
  };

  const total = MOCK_PARSED.reduce(
    (sum, r) =>
      sum +
      (Number(r.basicAmount) || 0) +
      (Number(r.additionalCharge) || 0) +
      (Number(r.exceptionFee) || 0) +
      (Number(r.reimbursement) || 0),
    0,
  );

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 720 }}>
        <div className="modal-header">
          <div className="modal-title">Sync from Sheet · 上传自有数据</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            适用于已有自有财务核算系统的供应商：下载模板 → 离线填写运单号与金额 → 上传同步，
            系统将携带全部数据跳转至 <strong>Create Statement</strong> 页面回显。
          </div>

          <div className="vp-card" style={{ padding: 14, marginBottom: 12 }}>
            <div className="import-step">
              <div className="import-step-num">1</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Download Template</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  Columns: Waybill No. · Basic Amount · Additional Charge · Exception Fee · Reimbursement
                </div>
              </div>
              <button className="btn-default" onClick={handleDownloadTemplate}>↓ Download</button>
            </div>

            <div className="import-step">
              <div className="import-step-num">2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Fill in your own amounts</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  仅填写状态为 Unbilled 的运单。未识别的运单号在校验阶段会被拒绝。
                </div>
              </div>
            </div>

            <div className="import-step">
              <div className="import-step-num">3</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Upload Sheet & Sync</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  解析成功后系统跳转 Create Statement，运单与金额自动回显。
                </div>
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
                <span>✓</span> <strong>{fileName}</strong> validated — {MOCK_PARSED.length} waybills parsed.
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waybill No.</th>
                    <th className="num">Basic Amount</th>
                    <th className="num">Additional Charge</th>
                    <th className="num">Exception Fee</th>
                    <th className="num">Reimbursement</th>
                    <th className="num">Row Total</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PARSED.map(r => {
                    const rowTotal =
                      (Number(r.basicAmount) || 0) +
                      (Number(r.additionalCharge) || 0) +
                      (Number(r.exceptionFee) || 0) +
                      (Number(r.reimbursement) || 0);
                    return (
                      <tr key={r.waybillNo}>
                        <td><strong>{r.waybillNo}</strong></td>
                        <td className="num">{Number(r.basicAmount).toLocaleString()}</td>
                        <td className="num">{Number(r.additionalCharge).toLocaleString()}</td>
                        <td className="num">{Number(r.exceptionFee).toLocaleString()}</td>
                        <td className="num">{Number(r.reimbursement).toLocaleString()}</td>
                        <td className="num" style={{ fontWeight: 600 }}>{rowTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                    <td colSpan={5} style={{ textAlign: 'right' }}>Total Submitted Amount</td>
                    <td className="num" style={{ color: '#00b96b' }}>{total.toLocaleString()} PHP</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={stage !== 'preview'} onClick={handleConfirm}>
            Sync &amp; Continue to Create Statement
          </button>
        </div>
      </div>
    </div>
  );
}

export default SyncStatementSheetDialog;
