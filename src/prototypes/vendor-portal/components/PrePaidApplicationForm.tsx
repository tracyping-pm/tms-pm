import React, { useMemo, useState } from 'react';
import {
  type SyncedApplication,
  type SyncedWaybill,
  type OperationLogEntry,
  nextApplicationNo,
  nowIso,
  formatDateTime,
  recomputeTotal,
  upsertApplication,
  appendLog,
} from '../../../common/prepaidApplicationSync';

interface Props {
  /** Existing app to edit (Draft / Rejected / Payment Rejected); empty for new create. */
  initialApp?: SyncedApplication;
  onBack: () => void;
  /** Called after Save as Draft / Submit, receives the saved application. */
  onSaved: (app: SyncedApplication) => void;
}

interface CandidateWaybill {
  no: string;
  status: string;
  truckType: string;
  origin: string;
  destination: string;
  positionTime: string;
  unloadingTime: string;
}

const CANDIDATE_WAYBILLS: CandidateWaybill[] = [
  { no: 'WB2604020', status: 'In Transit', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',         positionTime: '2026-04-16 12:45', unloadingTime: '2026-04-16 08:30' },
  { no: 'WB2604021', status: 'In Transit', truckType: '6-Wheeler',  origin: 'PH-Cavite-Imus',              destination: 'PH-NCR-Taguig',              positionTime: '2026-04-17 09:25', unloadingTime: '2026-04-17 13:10' },
  { no: 'WB2604022', status: 'Planning',   truckType: '10-Wheeler', origin: 'PH-Batangas / Lima',          destination: 'PH-NCR-Manila',              positionTime: '2026-04-17 13:40', unloadingTime: '2026-04-17 18:05' },
  { no: 'WB2604023', status: 'Pending',    truckType: '4-Wheeler',  origin: 'PH-NCR-Manila',                destination: 'PH-Laguna-Calamba',          positionTime: '2026-04-18 07:50', unloadingTime: '2026-04-18 11:25' },
  { no: 'WB2604024', status: 'In Transit', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark',          destination: 'PH-NCR-Manila / Port Area', positionTime: '2026-04-18 15:20', unloadingTime: '2026-04-18 19:15' },
];

const BANK_NAME_OPTIONS = ['BPI', 'BDO', 'UnionBank', 'Metrobank', 'Security Bank'];
const PAYEE_ACCOUNT_OPTIONS = ['1234-5678-90', '9876-5432-10', '5555-1111-22'];

const VENDOR_NAME = 'Coca-Cola Bottlers PH Inc.';

function defaultEmptyApp(): SyncedApplication {
  return {
    applicationNo: nextApplicationNo(),
    vendorName: VENDOR_NAME,
    source: 'Vendor Portal',
    appType: 'Prepaid Application',
    status: 'Draft',
    taxMark: 'VAT-ex',
    currency: 'PHP',
    waybills: [],
    claimTickets: [],
    paymentItems: [],
    deductionItems: [],
    totalAmountPayable: 0,
    payeeType: 'External Vendor',
    payeeName: VENDOR_NAME,
    bankName: '',
    payeeAccount: '',
    proofFiles: [],
    remark: '',
    createdAt: nowIso(),
  };
}

const sectionStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6,
  padding: '20px 24px', marginBottom: 16,
};
const sectionTitleStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
};
const sectionBar: React.CSSProperties = {
  width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0,
};
const sectionLabel: React.CSSProperties = { fontWeight: 600, fontSize: 15 };

function PrePaidApplicationForm({ initialApp, onBack, onSaved }: Props) {
  // Snapshot the original applicationNo so it doesn't regenerate every render.
  const [app, setApp] = useState<SyncedApplication>(() => initialApp ?? defaultEmptyApp());

  const [showAddWaybill, setShowAddWaybill] = useState(false);
  const [pickedCandidates, setPickedCandidates] = useState<Set<string>>(new Set());

  const [validationError, setValidationError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const totalAmountPayable = useMemo(() => recomputeTotal(app.waybills), [app.waybills]);

  const updateWaybillAmount = (waybillNo: string, value: string) => {
    setApp(prev => ({
      ...prev,
      waybills: prev.waybills.map(w =>
        w.no === waybillNo ? { ...w, prePaidAmount: Number(value) || 0 } : w
      ),
    }));
  };

  const removeWaybill = (waybillNo: string) => {
    setApp(prev => ({ ...prev, waybills: prev.waybills.filter(w => w.no !== waybillNo) }));
  };

  const handleAddWaybills = () => {
    const existing = new Set(app.waybills.map(w => w.no));
    const toAdd: SyncedWaybill[] = CANDIDATE_WAYBILLS
      .filter(c => pickedCandidates.has(c.no) && !existing.has(c.no))
      .map(c => ({
        no: c.no,
        positionTime: c.positionTime,
        unloadingTime: c.unloadingTime,
        truckType: c.truckType,
        origin: c.origin,
        destination: c.destination,
        prePaidAmount: 0,
      }));
    if (toAdd.length === 0) { setShowAddWaybill(false); return; }
    setApp(prev => ({ ...prev, waybills: [...prev.waybills, ...toAdd] }));
    setPickedCandidates(new Set());
    setShowAddWaybill(false);
    showToast(`${toAdd.length} waybill(s) added.`);
  };

  const validate = (): string => {
    if (app.waybills.length === 0) return 'Please add at least one waybill.';
    if (app.waybills.some(w => w.prePaidAmount <= 0)) return 'Each waybill must have a PrePaid Amount greater than 0.';
    if (!app.bankName) return 'Please select a Bank Name.';
    if (!app.payeeAccount) return 'Please select a Payee Account.';
    return '';
  };

  const handleSaveAsDraft = () => {
    const now = nowIso();
    const logEntry: OperationLogEntry = { time: now, actor: 'Vendor', action: 'Saved as Draft' };
    const next: SyncedApplication = {
      ...app,
      status: 'Draft',
      totalAmountPayable,
      operationLogs: [...(app.operationLogs || []), logEntry],
    };
    upsertApplication(next);
    setApp(next);
    setValidationError('');
    showToast('Saved as Draft.');
    setTimeout(() => onSaved(next), 600);
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setValidationError(err); return; }
    const now = nowIso();
    const logEntry: OperationLogEntry = { time: now, actor: 'Vendor', action: 'Submitted', note: 'Awaiting TMS review' };
    const next: SyncedApplication = {
      ...app,
      status: 'Awaiting Confirmation',
      totalAmountPayable,
      submittedAt: now,
      operationLogs: [...(app.operationLogs || []), logEntry],
    };
    upsertApplication(next);
    setApp(next);
    setValidationError('');
    showToast('Submitted to TMS for review.');
    setTimeout(() => onSaved(next), 800);
  };

  const isReadyToEdit = app.status === 'Draft' || app.status === 'Rejected' || app.status === 'Payment Rejected';

  // Status badge style
  const statusBadge: React.CSSProperties = {
    background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9',
    borderRadius: 4, padding: '3px 12px', fontSize: 13,
  };
  const sourceBadge: React.CSSProperties = {
    background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9',
    borderRadius: 4, padding: '3px 12px', fontSize: 13,
  };

  // Available candidates excluding those already added
  const availableCandidates = CANDIDATE_WAYBILLS.filter(c => !app.waybills.find(w => w.no === c.no));

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Back */}
      <div style={{ marginBottom: 12 }}>
        <button className="btn-link" style={{ fontSize: 13 }} onClick={onBack}>← Back to PrePaid Applications</button>
      </div>

      {/* Header bar */}
      <div style={{
        background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6,
        padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#333', marginRight: 4 }}>{app.applicationNo}</span>
        <span style={statusBadge}>{app.status}</span>
        <span style={sourceBadge}>Self-Created</span>
        <div style={{ flex: 1 }} />
        {isReadyToEdit && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-default" onClick={handleSaveAsDraft}>Save as Draft</button>
            <button
              className="btn-primary"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Application Information */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Application information</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Statement Tax Mark</div>
            <select
              className="filter-select"
              style={{ width: '100%', maxWidth: 160 }}
              value={app.taxMark}
              onChange={e => setApp(prev => ({ ...prev, taxMark: e.target.value as 'VAT-ex' | 'VAT-in' }))}
              disabled={!isReadyToEdit}
            >
              <option value="VAT-ex">VAT-ex</option>
              <option value="VAT-in">VAT-in</option>
            </select>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Total Amount Payable</div>
            <div style={{ fontWeight: 600 }}>
              {totalAmountPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Application Type</div>
            <div>PrePaid Application</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Create date</div>
            <div>{app.createdAt.slice(0, 10)}</div>
          </div>
        </div>
      </div>

      {/* Associated Waybills */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={sectionTitleStyle}>
            <span style={sectionBar} />
            <span style={sectionLabel}>Associated Waybills ({app.waybills.length})</span>
          </div>
          <div style={{ flex: 1 }} />
          {isReadyToEdit && (
            <button className="btn-default" onClick={() => setShowAddWaybill(true)}>+ Add Waybill</button>
          )}
        </div>

        {app.waybills.length === 0 ? (
          <div className="empty" style={{ padding: 24 }}>No waybills added yet. Click "Add Waybill" to start.</div>
        ) : (
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Waybill</th>
                <th>Position Time</th>
                <th>Unloading Time</th>
                <th>Truck Type</th>
                <th>Origin</th>
                <th>Destination</th>
                <th style={{ textAlign: 'right' }}>PrePaid Amount</th>
                {isReadyToEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {app.waybills.map(w => (
                <tr key={w.no}>
                  <td style={{ fontWeight: 500 }}>{w.no}</td>
                  <td>{w.positionTime}</td>
                  <td>{w.unloadingTime}</td>
                  <td>{w.truckType}</td>
                  <td>{w.origin || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td>{w.destination || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    {isReadyToEdit ? (
                      <input
                        type="number"
                        style={{
                          width: 110, textAlign: 'right',
                          border: '1px solid #d9d9d9', borderRadius: 4,
                          padding: '4px 8px', fontSize: 12,
                        }}
                        value={w.prePaidAmount === 0 ? '' : w.prePaidAmount}
                        placeholder="0.00"
                        onChange={e => updateWaybillAmount(w.no, e.target.value)}
                      />
                    ) : (
                      w.prePaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    )}
                  </td>
                  {isReadyToEdit && (
                    <td>
                      <button className="btn-link" style={{ color: '#cf1322' }} onClick={() => removeWaybill(w.no)}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payee Information */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Payee Information</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16, fontSize: 13 }}>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Payee Type</div>
            <div>{app.payeeType || 'External Vendor'}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Payee Name</div>
            <div>{app.payeeName || VENDOR_NAME}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 13 }}>
          <div>
            <div style={{ color: '#555', marginBottom: 4 }}>
              Bank Name <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={app.bankName || ''}
              onChange={e => setApp(prev => ({ ...prev, bankName: e.target.value }))}
              disabled={!isReadyToEdit}
            >
              <option value="">— Select Bank —</option>
              {BANK_NAME_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color: '#555', marginBottom: 4 }}>
              Payee Account <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={app.payeeAccount || ''}
              onChange={e => setApp(prev => ({ ...prev, payeeAccount: e.target.value }))}
              disabled={!isReadyToEdit}
            >
              <option value="">— Select Account —</option>
              {PAYEE_ACCOUNT_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Supporting Documents & Remark */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Supporting Documents &amp; Remark</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
          {/* Files */}
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {app.proofFiles.map((f, i) => (
                <div key={i} style={{
                  width: 80, height: 80, border: '1px solid #d9d9d9', borderRadius: 6,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#555', background: '#f5f5f5', position: 'relative',
                }}>
                  <div style={{ fontSize: 24 }}>📄</div>
                  <div style={{ maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</div>
                  {isReadyToEdit && (
                    <span
                      onClick={() => setApp(prev => ({ ...prev, proofFiles: prev.proofFiles.filter((_, j) => j !== i) }))}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#ff4d4f', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, cursor: 'pointer',
                      }}
                    >×</span>
                  )}
                </div>
              ))}
              {isReadyToEdit && (
                <div
                  onClick={() => {
                    const name = `proof_${app.proofFiles.length + 1}.pdf`;
                    setApp(prev => ({ ...prev, proofFiles: [...prev.proofFiles, name] }));
                  }}
                  style={{
                    width: 80, height: 80, border: '1px dashed #d9d9d9', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: '#bbb', cursor: 'pointer',
                  }}
                >+</div>
              )}
            </div>
            {app.proofFiles.length === 0 && !isReadyToEdit && (
              <div style={{ fontSize: 13, color: '#999' }}>No documents uploaded.</div>
            )}
          </div>
          {/* Remark */}
          <div>
            <div style={{ color: '#555', marginBottom: 4, fontSize: 13 }}>Remark</div>
            <textarea
              style={{
                width: '100%', height: 100, padding: '8px 12px',
                border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13,
                resize: 'vertical', boxSizing: 'border-box',
              }}
              placeholder="Optional — add any notes for the reviewer."
              value={app.remark || ''}
              onChange={e => setApp(prev => ({ ...prev, remark: e.target.value }))}
              disabled={!isReadyToEdit}
            />
          </div>
        </div>
      </div>

      {/* Operation Log */}
      {(app.operationLogs || []).length > 0 && (
        <div className="vp-card">
          <div className="vp-card-title"><div className="section-title">Operation Log</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(app.operationLogs || []).map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: i < (app.operationLogs!.length - 1) ? '1px solid #f0f0f0' : 'none', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', minWidth: 140 }}>{formatDateTime(log.time)}</div>
                <div style={{ fontSize: 12, color: '#595959', minWidth: 90 }}>{log.actor}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{log.action}{log.note ? <span style={{ fontWeight: 400, color: '#666', marginLeft: 6 }}>— {log.note}</span> : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 12 }}>
          ⚠ {validationError}
        </div>
      )}

      {/* ── Add Waybill modal ── */}
      {showAddWaybill && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 24, width: 720,
            maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Add Waybill(s)</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
              Only waybills with status <strong>Planning</strong>, <strong>Pending</strong>, or <strong>In Transit</strong> are eligible.
            </div>
            {availableCandidates.length === 0 ? (
              <div className="empty" style={{ padding: 24 }}>No more eligible waybills.</div>
            ) : (
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        checked={pickedCandidates.size === availableCandidates.length}
                        onChange={() => {
                          if (pickedCandidates.size === availableCandidates.length) setPickedCandidates(new Set());
                          else setPickedCandidates(new Set(availableCandidates.map(c => c.no)));
                        }}
                      />
                    </th>
                    <th>Waybill</th>
                    <th>Status</th>
                    <th>Truck Type</th>
                    <th>Origin</th>
                    <th>Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCandidates.map(c => (
                    <tr key={c.no}>
                      <td>
                        <input
                          type="checkbox"
                          checked={pickedCandidates.has(c.no)}
                          onChange={() => setPickedCandidates(prev => {
                            const next = new Set(prev);
                            if (next.has(c.no)) next.delete(c.no); else next.add(c.no);
                            return next;
                          })}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{c.no}</td>
                      <td>{c.status}</td>
                      <td>{c.truckType}</td>
                      <td>{c.origin}</td>
                      <td>{c.destination}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="btn-default" onClick={() => { setShowAddWaybill(false); setPickedCandidates(new Set()); }}>Cancel</button>
              <button className="btn-primary" disabled={pickedCandidates.size === 0} onClick={handleAddWaybills}>
                Add {pickedCandidates.size > 0 ? `(${pickedCandidates.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#fff',
          border: '1px solid #d9d9d9', borderRadius: 8, padding: '10px 16px',
          fontSize: 13, color: '#333', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 2000,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#52c41a', fontSize: 16 }}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default PrePaidApplicationForm;
