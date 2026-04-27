import React, { useState, useMemo } from 'react';

interface Props {
  prefillWaybills: string[];
  onBack: () => void;
  onSubmit: (waybillNos: string[]) => void;
  /** When editing a rejected statement, pass the statement no and reject reason */
  editStatementNo?: string;
  rejectReason?: string;
}

interface WaybillRow {
  no: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: string;
  additionalCharge: string;
  exceptionFee: string;
}

interface InvoiceEntry {
  id: string;
  invoiceNo: string;
}

// Build waybill data from waybill numbers (mock lookup)
function buildWaybillRow(no: string): WaybillRow {
  const MAP: Record<string, Omit<WaybillRow, 'no' | 'basicAmount' | 'additionalCharge' | 'exceptionFee'>> = {
    WB2604010: { unloadingTime: '2026-04-10 15:30', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC' },
    WB2604011: { unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig' },
    WB2604012: { unloadingTime: '2026-04-12 17:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area' },
    WB2604014: { unloadingTime: '2026-04-14 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area' },
    WB2604015: { unloadingTime: '2026-04-15 14:00', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan' },
  };
  return {
    no,
    ...(MAP[no] || { unloadingTime: '—', truckType: '—', origin: '—', destination: '—' }),
    basicAmount: '',
    additionalCharge: '',
    exceptionFee: '',
  };
}

let invoiceIdCounter = 1;

function CreateStatementForm({ prefillWaybills, onBack, onSubmit, editStatementNo, rejectReason }: Props) {
  const isEditing = !!editStatementNo;

  const [rows, setRows] = useState<WaybillRow[]>(() =>
    prefillWaybills.map(no => buildWaybillRow(no))
  );

  const [invoices, setInvoices] = useState<InvoiceEntry[]>([{ id: 'inv-1', invoiceNo: '' }]);
  const [invoiceProofName, setInvoiceProofName] = useState('');
  const [invoiceProofDragging, setInvoiceProofDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateRow = (no: string, field: keyof Pick<WaybillRow, 'basicAmount' | 'additionalCharge' | 'exceptionFee'>, value: string) => {
    setRows(rows.map(r => r.no === no ? { ...r, [field]: value } : r));
  };

  const addInvoice = () => {
    setInvoices([...invoices, { id: `inv-${++invoiceIdCounter}`, invoiceNo: '' }]);
  };

  const removeInvoice = (id: string) => {
    if (invoices.length === 1) return;
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const updateInvoice = (id: string, val: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, invoiceNo: val } : i));
  };

  const rowSubtotal = (r: WaybillRow) => {
    return (parseFloat(r.basicAmount) || 0) + (parseFloat(r.additionalCharge) || 0) + (parseFloat(r.exceptionFee) || 0);
  };

  const grandTotal = useMemo(() => rows.reduce((a, r) => a + rowSubtotal(r), 0), [rows]);

  const invoicesFilled = invoices.some(i => i.invoiceNo.trim().length > 0);
  const proofUploaded = invoiceProofName.length > 0;
  const canSubmit = invoicesFilled && proofUploaded;

  const handleFakeUpload = () => {
    setInvoiceProofName('Invoice_Proof_2026Apr.pdf');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setInvoiceProofDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setInvoiceProofName(file.name);
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    onSubmit(rows.map(r => r.no));
  };

  const title = isEditing
    ? `Edit Statement ${editStatementNo}`
    : 'Create Statement';

  return (
    <>
      {/* Breadcrumb / Back */}
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>
          ← {isEditing ? `Back to My Statements` : 'Back to Unbilled Waybills'}
        </button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>{title}</span>
        <span style={{ marginLeft: 10, fontSize: 12, color: '#999' }}>
          {rows.length} waybill{rows.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Reject Reason Banner (Awaiting Re-bill editing) */}
      {isEditing && rejectReason && (
        <div className="alert alert-danger" style={{ marginBottom: 16, borderLeft: '4px solid #ff4d4f' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16, marginTop: 1 }}>✕</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>TMS Rejection Reason</div>
              <div style={{ fontSize: 13 }}>{rejectReason}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                Please review and correct the information below, then re-submit.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Basic Info (Invoice) */}
      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 14 }}>Basic Information</div>

        <div style={{ marginBottom: 16 }}>
          <div className="form-label req" style={{ marginBottom: 6, fontWeight: 500 }}>Invoice No.</div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
            Multiple invoices supported (e.g., split by tax rate or partial billing).
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {invoices.map((inv, idx) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ flex: 1, maxWidth: 320 }}
                  placeholder={`Invoice No. ${idx + 1}`}
                  value={inv.invoiceNo}
                  onChange={e => updateInvoice(inv.id, e.target.value)}
                />
                {invoices.length > 1 && (
                  <button
                    className="btn-link"
                    style={{ color: '#ff4d4f', padding: 0 }}
                    onClick={() => removeInvoice(inv.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div>
              <button className="btn-link" style={{ padding: 0, fontSize: 13 }} onClick={addInvoice}>
                + Add Another Invoice
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="form-label req" style={{ marginBottom: 6, fontWeight: 500 }}>
            Invoice Proof <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <div
            className={`upload-zone${invoiceProofDragging ? ' dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setInvoiceProofDragging(true); }}
            onDragLeave={() => setInvoiceProofDragging(false)}
            onDrop={handleDrop}
            onClick={handleFakeUpload}
          >
            {invoiceProofName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#1677ff', fontSize: 13 }}>📎 {invoiceProofName}</span>
                <button
                  className="btn-link"
                  style={{ color: '#ff4d4f', padding: 0, fontSize: 12 }}
                  onClick={e => { e.stopPropagation(); setInvoiceProofName(''); }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 28, color: '#ccc', marginBottom: 8 }}>⬆</div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  Click or drag a file here to upload Invoice Proof
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  Supports PDF, JPG, PNG · Max 20 MB
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Waybill Amount Details */}
      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Waybill Amount Details</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-default" style={{ fontSize: 12 }}>
              ↓ Download Template
            </button>
            <button className="btn-default" style={{ fontSize: 12 }}>
              ↑ Upload Excel
            </button>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 12 }}>
          <span>ⓘ</span>
          <span>
            Enter your billed amounts for each waybill. You may also download the template,
            fill in amounts offline, and upload via Excel.
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Unloading Time</th>
              <th>Truck Type</th>
              <th>Origin → Destination</th>
              <th className="num" style={{ width: 120 }}>Basic Amount</th>
              <th className="num" style={{ width: 130 }}>Additional Charge</th>
              <th className="num" style={{ width: 110 }}>Exception Fee</th>
              <th className="num" style={{ width: 110 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const sub = rowSubtotal(r);
              return (
                <tr key={r.no}>
                  <td><strong>{r.no}</strong></td>
                  <td style={{ fontSize: 12 }}>{r.unloadingTime}</td>
                  <td style={{ fontSize: 12 }}>{r.truckType}</td>
                  <td style={{ fontSize: 11 }}>
                    {r.origin}
                    <br />
                    → {r.destination}
                  </td>
                  <td>
                    <input
                      className="table-amount-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={r.basicAmount}
                      onChange={e => updateRow(r.no, 'basicAmount', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-amount-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={r.additionalCharge}
                      onChange={e => updateRow(r.no, 'additionalCharge', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-amount-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={r.exceptionFee}
                      onChange={e => updateRow(r.no, 'exceptionFee', e.target.value)}
                    />
                  </td>
                  <td className="num" style={{ fontWeight: 600, color: sub > 0 ? '#00b96b' : '#999' }}>
                    {sub.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <td colSpan={7} style={{ textAlign: 'right', paddingRight: 8, fontSize: 13 }}>
                Total Submitted Amount
              </td>
              <td className="num" style={{ fontSize: 15, color: '#00b96b' }}>
                {grandTotal.toLocaleString()} PHP
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Actions */}
      <div className="summary-hero-card">
        <div className="summary-hero-top">
          <div>
            <div className="summary-hero-label">Total Submitted Amount</div>
            <div className="summary-hero-value">{grandTotal.toLocaleString()} PHP</div>
            <div className="summary-hero-sub">
              {rows.length} waybill{rows.length !== 1 ? 's' : ''} ·{' '}
              {invoices.filter(i => i.invoiceNo.trim()).length} invoice(s)
              {!canSubmit && (
                <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                  {!invoicesFilled ? '· Invoice No. required' : '· Invoice Proof required'}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-default">Save as Draft</button>
            <button
              className="btn-primary"
              disabled={!canSubmit}
              title={!canSubmit ? 'Invoice No. and Invoice Proof are required before submitting.' : undefined}
              onClick={handleSubmit}
            >
              Submit to TMS
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showConfirm && (
        <div className="dialog-overlay">
          <div className="dialog" style={{ maxWidth: 420 }}>
            <div className="dialog-header">
              <span>Confirm Submission</span>
            </div>
            <div className="dialog-body">
              <p style={{ margin: '0 0 12px', fontSize: 14 }}>
                Once submitted, you will <strong>not be able to modify</strong> this statement.
                TMS will review and compare the amounts.
              </p>
              <div style={{ background: '#fafafa', borderRadius: 6, padding: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666' }}>Waybills</span>
                  <span>{rows.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666' }}>Total Submitted Amount</span>
                  <span style={{ fontWeight: 600, color: '#00b96b' }}>{grandTotal.toLocaleString()} PHP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Invoice(s)</span>
                  <span>{invoices.filter(i => i.invoiceNo.trim()).length}</span>
                </div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#999' }}>
                Are you sure you want to proceed?
              </p>
            </div>
            <div className="dialog-footer">
              <button className="btn-default" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmSubmit}>Confirm & Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateStatementForm;
