import React, { useState, useMemo } from 'react';
import type { CreateMode } from './UnbilledWaybillsList';
import { CLAIM_TICKETS } from '../data/claimTickets';

interface Props {
  prefillWaybills: string[];
  mode: CreateMode | 'edit';
  onBack: () => void;
  onSubmit: (waybillNos: string[]) => void;
  editStatementNo?: string;
  rejectReason?: string;
}

// ─── Data types ───────────────────────────────────────────────────────────────

interface WaybillRow {
  no: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  // Vendor-entered amounts
  basicAmount: string;
  additionalCharge: string;
  exceptionFee: string;
  reimbursement: string;
  // TMS system prices (shown as reference in system-price mode)
  tmsBasic: number;
  tmsAdditional: number;
  tmsException: number;
}

type OcrState = 'idle' | 'scanning' | 'done' | 'failed';

interface InvoiceEntry {
  id: string;
  invoiceNo: string;
  invoiceAmount: string;
  invoiceDate: string;
  attachmentName: string;
  ocrState: OcrState;
}

interface SelectedClaim {
  ticketNo: string;
  claimTypeL1: string;
  claimTypeL2: string;
  relatedWaybill?: string;
  claimAmount: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

// TMS system prices per waybill
const TMS_PRICES: Record<string, { basic: number; additional: number; exception: number }> = {
  WB2604010: { basic: 16500, additional: 700,  exception: 0    },
  WB2604011: { basic: 11000, additional: 0,     exception: 400  },
  WB2604012: { basic: 17000, additional: 1500,  exception: 800  },
  WB2604014: { basic: 16800, additional: 900,   exception: 0    },
  WB2604015: { basic: 10500, additional: 500,   exception: 200  },
};

// Vendor upload prices (Path A — simulates what vendor filled in their sheet)
const UPLOAD_PRICES: Record<string, { basic: number; additional: number; exception: number; reimbursement: number }> = {
  WB2604010: { basic: 18000, additional: 800,  exception: 0,   reimbursement: 0    },
  WB2604011: { basic: 12000, additional: 0,    exception: 500, reimbursement: 300  },
  WB2604012: { basic: 18500, additional: 2000, exception: 1000, reimbursement: 0   },
};

function buildWaybillRow(no: string, mode: CreateMode | 'edit'): WaybillRow {
  const META: Record<string, Omit<WaybillRow, 'no' | 'basicAmount' | 'additionalCharge' | 'exceptionFee' | 'reimbursement' | 'tmsBasic' | 'tmsAdditional' | 'tmsException'>> = {
    WB2604010: { unloadingTime: '2026-04-10 15:30', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC' },
    WB2604011: { unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler',  origin: 'PH-Cavite-Imus',            destination: 'PH-NCR-Taguig' },
    WB2604012: { unloadingTime: '2026-04-12 17:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima',        destination: 'PH-NCR-Manila / Port Area' },
    WB2604014: { unloadingTime: '2026-04-14 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark',       destination: 'PH-NCR-Manila / Port Area' },
    WB2604015: { unloadingTime: '2026-04-15 14:00', truckType: '6-Wheeler',  origin: 'PH-NCR-Quezon City',        destination: 'PH-Bulacan-Meycauayan' },
  };

  const tms = TMS_PRICES[no] || { basic: 0, additional: 0, exception: 0 };
  const upload = UPLOAD_PRICES[no];

  let basicAmount = '';
  let additionalCharge = '';
  let exceptionFee = '';
  let reimbursement = '';

  if (mode === 'system-price') {
    basicAmount = String(tms.basic);
    additionalCharge = String(tms.additional);
    exceptionFee = String(tms.exception);
  } else if (mode === 'upload' && upload) {
    basicAmount = String(upload.basic);
    additionalCharge = String(upload.additional);
    exceptionFee = String(upload.exception);
    reimbursement = String(upload.reimbursement);
  }

  return {
    no,
    ...(META[no] || { unloadingTime: '—', truckType: '—', origin: '—', destination: '—' }),
    basicAmount,
    additionalCharge,
    exceptionFee,
    reimbursement,
    tmsBasic: tms.basic,
    tmsAdditional: tms.additional,
    tmsException: tms.exception,
  };
}

// "For Deduction" claim tickets available for selection
const AVAILABLE_CLAIMS = CLAIM_TICKETS.filter(
  t => t.deductionForVendor === 'For Deduction' && t.responsibleParty === 'Vendor'
);

const CURRENCIES = ['PHP', 'USD', 'THB'];
const VAT_OPTIONS = [{ label: 'No VAT (0%)', value: 0 }, { label: 'VAT 7%', value: 7 }, { label: 'VAT 12%', value: 12 }];
const WHT_OPTIONS = [{ label: 'No WHT (0%)', value: 0 }, { label: 'WHT 1%', value: 1 }, { label: 'WHT 2%', value: 2 }];

let invoiceCounter = 100;
function makeInvoiceId() { return `inv-${++invoiceCounter}`; }

// ─── Component ────────────────────────────────────────────────────────────────

function CreateStatementForm({ prefillWaybills, mode, onBack, onSubmit, editStatementNo, rejectReason }: Props) {
  const isEditing = mode === 'edit';
  const isSystemPrice = mode === 'system-price';
  const isUpload = mode === 'upload';

  // Waybill rows
  const [rows, setRows] = useState<WaybillRow[]>(() =>
    prefillWaybills.map(no => buildWaybillRow(no, mode))
  );

  // Detail tab
  const [detailTab, setDetailTab] = useState<'waybills' | 'claims'>('waybills');

  // Invoices (non-required overall)
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([]);
  const [invoiceCurrency, setInvoiceCurrency] = useState('PHP');
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  // Claim tickets
  const [selectedClaims, setSelectedClaims] = useState<SelectedClaim[]>([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  // Tax rates
  const [vatRate, setVatRate] = useState(0);
  const [whtRate, setWhtRate] = useState(0);

  // Submit confirm
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Calculations ────────────────────────────────────────────────────────────

  const rowSubtotal = (r: WaybillRow) =>
    (parseFloat(r.basicAmount) || 0) +
    (parseFloat(r.additionalCharge) || 0) +
    (parseFloat(r.exceptionFee) || 0) +
    (parseFloat(r.reimbursement) || 0);

  const itemTotals = useMemo(() => ({
    basic:       rows.reduce((a, r) => a + (parseFloat(r.basicAmount) || 0), 0),
    additional:  rows.reduce((a, r) => a + (parseFloat(r.additionalCharge) || 0), 0),
    exception:   rows.reduce((a, r) => a + (parseFloat(r.exceptionFee) || 0), 0),
    reimbursement: rows.reduce((a, r) => a + (parseFloat(r.reimbursement) || 0), 0),
  }), [rows]);

  const waybillSubtotal = itemTotals.basic + itemTotals.additional + itemTotals.exception + itemTotals.reimbursement;
  const claimDeduction = selectedClaims.reduce((a, c) => a + c.claimAmount, 0);
  const vatAmount = Math.round(waybillSubtotal * vatRate / 100);
  const whtAmount = Math.round(waybillSubtotal * whtRate / 100);
  const totalAmountPayable = waybillSubtotal - claimDeduction + vatAmount - whtAmount;

  // Invoice amount mismatch warning
  const totalInvoiceAmount = invoices.reduce((a, i) => a + (parseFloat(i.invoiceAmount) || 0), 0);
  const hasInvoiceAmountMismatch = invoices.length > 0 && totalInvoiceAmount > 0 &&
    Math.abs(totalInvoiceAmount - waybillSubtotal) > 0.01;

  // ─── Waybill row handlers ─────────────────────────────────────────────────────

  const updateRow = (no: string, field: keyof Pick<WaybillRow, 'basicAmount' | 'additionalCharge' | 'exceptionFee' | 'reimbursement'>, value: string) => {
    setRows(rows.map(r => r.no === no ? { ...r, [field]: value } : r));
  };

  // ─── Invoice handlers ─────────────────────────────────────────────────────────

  const addInvoice = (entry: Omit<InvoiceEntry, 'id' | 'ocrState'>) => {
    setInvoices([...invoices, { ...entry, id: makeInvoiceId(), ocrState: 'idle' }]);
    setShowAddInvoice(false);
  };

  const removeInvoice = (id: string) => setInvoices(invoices.filter(i => i.id !== id));

  // Simulate OCR when attachment uploaded
  const handleOcr = (id: string, fileName: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, attachmentName: fileName, ocrState: 'scanning' } : i));
    setTimeout(() => {
      setInvoices(prev => prev.map(i => {
        if (i.id !== id) return i;
        // 80% success rate simulation
        const success = Math.random() > 0.2;
        if (success) {
          return {
            ...i,
            ocrState: 'done',
            invoiceNo: i.invoiceNo || `INV-2026-0${Math.floor(Math.random() * 900 + 100)}`,
            invoiceAmount: i.invoiceAmount || String(Math.round(waybillSubtotal * (0.95 + Math.random() * 0.1))),
            invoiceDate: i.invoiceDate || '2026-04-28',
          };
        }
        return { ...i, ocrState: 'failed' };
      }));
    }, 1500);
  };

  const updateInvoiceField = (id: string, field: keyof Pick<InvoiceEntry, 'invoiceNo' | 'invoiceAmount' | 'invoiceDate'>, val: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  // ─── Claim handlers ───────────────────────────────────────────────────────────

  const addClaim = (ticket: typeof AVAILABLE_CLAIMS[0]) => {
    if (!selectedClaims.find(c => c.ticketNo === ticket.ticketNo)) {
      setSelectedClaims([...selectedClaims, {
        ticketNo: ticket.ticketNo,
        claimTypeL1: ticket.claimTypeL1,
        claimTypeL2: ticket.claimTypeL2,
        relatedWaybill: ticket.relatedWaybill,
        claimAmount: ticket.claimAmount,
      }]);
    }
    setShowClaimDialog(false);
  };

  const removeClaim = (ticketNo: string) => setSelectedClaims(selectedClaims.filter(c => c.ticketNo !== ticketNo));

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const modeLabel = isEditing
    ? `Edit Statement ${editStatementNo}`
    : isUpload
    ? 'Create Statement · Your Own Data'
    : isSystemPrice
    ? 'Create Statement · System Prices'
    : 'Create Statement';

  const modeTag = isUpload
    ? <span className="tag tag-under-review" style={{ marginLeft: 8 }}>Path A · Upload</span>
    : isSystemPrice
    ? <span className="tag tag-approved" style={{ marginLeft: 8 }}>Path B · System Price</span>
    : null;

  const availableToAdd = AVAILABLE_CLAIMS.filter(t => !selectedClaims.find(c => c.ticketNo === t.ticketNo));

  return (
    <>
      {/* Back / Title */}
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>
          ← {isEditing ? 'Back to My Statements' : 'Back to Unbilled Waybills'}
        </button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#444', fontWeight: 500 }}>{modeLabel}</span>
        {modeTag}
        <span style={{ marginLeft: 10, fontSize: 12, color: '#999' }}>
          {rows.length} waybill{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reject reason (edit mode) */}
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

      {/* System price notice */}
      {isSystemPrice && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <span>ⓘ</span>
          <span>
            Waybill amounts have been <strong>pre-filled with TMS system prices (Contract Cost)</strong>.
            You may adjust individual fields if needed before submitting.
          </span>
        </div>
      )}

      {/* Upload mode notice */}
      {isUpload && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          <span>✓</span>
          <span>
            <strong>{prefillWaybills.length} waybills synced from your sheet.</strong>{' '}
            Amounts have been pre-filled with your own data. Please review before submitting.
          </span>
        </div>
      )}

      {/* ── Section 1: Invoice (optional) ──────────────────────────────────────── */}
      <div className="vp-card">
        <div className="vp-card-title">
          <div>
            <div className="section-title">Invoice</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Optional — you can add invoices now or supplement them later.
              Multiple invoices supported (e.g., split by tax rate or partial billing).
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowAddInvoice(true)}>+ Add Invoice</button>
        </div>

        {/* Invoice mismatch warning */}
        {hasInvoiceAmountMismatch && (
          <div className="alert alert-warn" style={{ marginBottom: 12 }}>
            <span>⚠</span>
            <span>
              Total Invoice Amount (<strong>{totalInvoiceAmount.toLocaleString()} {invoiceCurrency}</strong>)
              does not match Total Submitted Amount (<strong>{waybillSubtotal.toLocaleString()} PHP</strong>).
              You can still submit, but please verify before proceeding.
            </span>
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="empty" style={{ padding: '20px', border: '1px dashed #e0e0e0', borderRadius: 4, textAlign: 'center' }}>
            <div style={{ color: '#bbb', fontSize: 24, marginBottom: 6 }}>🧾</div>
            <div style={{ color: '#999', fontSize: 13 }}>No invoices added yet. Click <strong>+ Add Invoice</strong> to attach.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Invoice Date</th>
                <th className="num">Invoice Amount</th>
                <th>Attachment</th>
                <th>OCR</th>
                <th>Operate</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <input
                      className="table-amount-input"
                      style={{ textAlign: 'left', width: 180 }}
                      placeholder="Invoice No."
                      value={inv.invoiceNo}
                      onChange={e => updateInvoiceField(inv.id, 'invoiceNo', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-amount-input"
                      type="date"
                      style={{ textAlign: 'left', width: 140 }}
                      value={inv.invoiceDate}
                      onChange={e => updateInvoiceField(inv.id, 'invoiceDate', e.target.value)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        className="table-amount-input"
                        type="number"
                        style={{ width: 120 }}
                        placeholder="Amount"
                        value={inv.invoiceAmount}
                        onChange={e => updateInvoiceField(inv.id, 'invoiceAmount', e.target.value)}
                      />
                      <select
                        className="filter-select"
                        style={{ minWidth: 72, padding: '4px 6px', fontSize: 12 }}
                        value={invoiceCurrency}
                        onChange={e => setInvoiceCurrency(e.target.value)}
                      >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    {inv.attachmentName ? (
                      <span style={{ color: '#1677ff', fontSize: 12 }}>📎 {inv.attachmentName}</span>
                    ) : (
                      <button
                        className="btn-default"
                        style={{ fontSize: 12 }}
                        onClick={() => handleOcr(inv.id, `Invoice_${inv.id}_Attachment.pdf`)}
                      >
                        Upload
                      </button>
                    )}
                  </td>
                  <td>
                    {inv.ocrState === 'idle' && <span style={{ color: '#bbb', fontSize: 12 }}>—</span>}
                    {inv.ocrState === 'scanning' && (
                      <span style={{ fontSize: 12, color: '#1677ff' }}>
                        <span className="ocr-spinner">⟳</span> Scanning…
                      </span>
                    )}
                    {inv.ocrState === 'done' && (
                      <span style={{ fontSize: 12, color: '#00b96b' }}>✓ Auto-filled</span>
                    )}
                    {inv.ocrState === 'failed' && (
                      <span style={{ fontSize: 12, color: '#ff4d4f' }}>✕ OCR failed — please fill manually</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-link" style={{ color: '#ff4d4f' }} onClick={() => removeInvoice(inv.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Section 2: Waybill + Claim Tabs ────────────────────────────────────── */}
      <div className="vp-card">
        <div className="vp-card-title" style={{ marginBottom: 0 }}>
          <div className="section-title">Billing Details</div>
          {detailTab === 'waybills' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-default" style={{ fontSize: 12 }}>↓ Download Template</button>
              <button className="btn-default" style={{ fontSize: 12 }}>↑ Upload Excel</button>
            </div>
          )}
          {detailTab === 'claims' && (
            <button className="btn-primary" onClick={() => setShowClaimDialog(true)}>
              + Add Claim Ticket
            </button>
          )}
        </div>

        <div className="sub-tabs" style={{ marginTop: 12 }}>
          <button
            className={`sub-tab ${detailTab === 'waybills' ? 'active' : ''}`}
            onClick={() => setDetailTab('waybills')}
          >
            Waybill List ({rows.length})
          </button>
          <button
            className={`sub-tab ${detailTab === 'claims' ? 'active' : ''}`}
            onClick={() => setDetailTab('claims')}
          >
            Claim Tickets ({selectedClaims.length})
          </button>
        </div>

        {/* Waybill tab */}
        {detailTab === 'waybills' && (
          <>
            {isSystemPrice && (
              <div className="alert alert-info" style={{ marginBottom: 12 }}>
                <span>ⓘ</span>
                <span>Amounts are pre-filled with TMS contract prices. Edit any field to override.</span>
              </div>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waybill No.</th>
                  <th>Unloading Time</th>
                  <th>Truck Type</th>
                  <th>Origin → Destination</th>
                  <th className="num" style={{ width: 115 }}>Basic Amount</th>
                  <th className="num" style={{ width: 125 }}>Additional Charge</th>
                  <th className="num" style={{ width: 105 }}>Exception Fee</th>
                  <th className="num" style={{ width: 110 }}>Reimbursement</th>
                  <th className="num" style={{ width: 100 }}>Subtotal</th>
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
                      <td style={{ fontSize: 11 }}>{r.origin}<br />→ {r.destination}</td>
                      <td>
                        <input
                          className="table-amount-input"
                          type="number" min="0" placeholder="0"
                          value={r.basicAmount}
                          onChange={e => updateRow(r.no, 'basicAmount', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="table-amount-input"
                          type="number" min="0" placeholder="0"
                          value={r.additionalCharge}
                          onChange={e => updateRow(r.no, 'additionalCharge', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="table-amount-input"
                          type="number" min="0" placeholder="0"
                          value={r.exceptionFee}
                          onChange={e => updateRow(r.no, 'exceptionFee', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="table-amount-input"
                          type="number" min="0" placeholder="0"
                          value={r.reimbursement}
                          onChange={e => updateRow(r.no, 'reimbursement', e.target.value)}
                        />
                      </td>
                      <td className="num" style={{ fontWeight: 600, color: sub > 0 ? '#00b96b' : '#999' }}>
                        {sub.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td colSpan={8} style={{ textAlign: 'right', paddingRight: 8, fontSize: 12, color: '#666' }}>
                    Waybill Subtotal
                  </td>
                  <td className="num" style={{ color: '#00b96b' }}>{waybillSubtotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Claim ticket tab */}
        {detailTab === 'claims' && (
          <>
            <div className="alert alert-info" style={{ marginBottom: 12 }}>
              <span>ⓘ</span>
              <span>
                Only <strong>For Deduction</strong> tickets assigned to your company are available.
                Claim amounts will be <strong>deducted</strong> from your total payable.
              </span>
            </div>
            {selectedClaims.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>
                No claim tickets added. Click <strong>+ Add Claim Ticket</strong> to select.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket No.</th>
                    <th>Claim Type</th>
                    <th>Related Waybill</th>
                    <th className="num">Deduction Amount</th>
                    <th>Operate</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClaims.map(c => (
                    <tr key={c.ticketNo}>
                      <td>{c.ticketNo}</td>
                      <td style={{ fontSize: 12 }}>
                        <div>{c.claimTypeL1}</div>
                        <div style={{ color: '#666' }}>{c.claimTypeL2}</div>
                      </td>
                      <td>{c.relatedWaybill || <span style={{ color: '#999' }}>—</span>}</td>
                      <td className="num" style={{ color: '#cf1322', fontWeight: 600 }}>
                        −{c.claimAmount.toLocaleString()}
                      </td>
                      <td>
                        <button className="btn-link" style={{ color: '#ff4d4f' }} onClick={() => removeClaim(c.ticketNo)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                    <td colSpan={3} style={{ textAlign: 'right', fontSize: 12, color: '#666' }}>Claim Deduction Total</td>
                    <td className="num" style={{ color: '#cf1322' }}>−{claimDeduction.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* ── Section 3: Tax ────────────────────────────────────────────────────── */}
      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 14 }}>Tax Settings</div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div className="form-field">
            <label className="form-label">VAT Rate</label>
            <select
              className="form-select"
              style={{ minWidth: 160 }}
              value={vatRate}
              onChange={e => setVatRate(Number(e.target.value))}
            >
              {VAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">WHT Rate</label>
            <select
              className="form-select"
              style={{ minWidth: 160 }}
              value={whtRate}
              onChange={e => setWhtRate(Number(e.target.value))}
            >
              {WHT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {(vatRate > 0 || whtRate > 0) && (
            <div style={{ fontSize: 13, color: '#666', alignSelf: 'flex-end', paddingBottom: 4 }}>
              {vatRate > 0 && <span style={{ marginRight: 16 }}>VAT: +{vatAmount.toLocaleString()} PHP</span>}
              {whtRate > 0 && <span style={{ color: '#cf1322' }}>WHT: −{whtAmount.toLocaleString()} PHP</span>}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Hero ──────────────────────────────────────────────────────── */}
      <div className="summary-hero-card">
        <div className="summary-hero-top" style={{ alignItems: 'flex-start' }}>
          {/* Breakdown */}
          <div style={{ flex: 1 }}>
            <div className="summary-hero-label">Total Amount Payable</div>
            <div className="summary-hero-value">{totalAmountPayable.toLocaleString()} PHP</div>

            <div className="summary-breakdown">
              <div className="summary-bd-row">
                <span>Basic Amount</span>
                <span>{itemTotals.basic.toLocaleString()}</span>
              </div>
              <div className="summary-bd-row">
                <span>Additional Charge</span>
                <span>{itemTotals.additional.toLocaleString()}</span>
              </div>
              <div className="summary-bd-row">
                <span>Exception Fee</span>
                <span>{itemTotals.exception.toLocaleString()}</span>
              </div>
              {itemTotals.reimbursement > 0 && (
                <div className="summary-bd-row">
                  <span>Reimbursement</span>
                  <span>{itemTotals.reimbursement.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-bd-row summary-bd-subtotal">
                <span>Waybill Subtotal</span>
                <span>{waybillSubtotal.toLocaleString()}</span>
              </div>
              {claimDeduction > 0 && (
                <div className="summary-bd-row" style={{ color: '#cf1322' }}>
                  <span>Claim Deductions</span>
                  <span>−{claimDeduction.toLocaleString()}</span>
                </div>
              )}
              {vatRate > 0 && (
                <div className="summary-bd-row" style={{ color: '#389e0d' }}>
                  <span>VAT ({vatRate}%)</span>
                  <span>+{vatAmount.toLocaleString()}</span>
                </div>
              )}
              {whtRate > 0 && (
                <div className="summary-bd-row" style={{ color: '#cf1322' }}>
                  <span>WHT ({whtRate}%)</span>
                  <span>−{whtAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', minWidth: 180 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-default">Save as Draft</button>
              <button className="btn-primary" onClick={() => setShowConfirm(true)}>
                Submit to TMS
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>
              {rows.length} waybill{rows.length !== 1 ? 's' : ''} ·{' '}
              {selectedClaims.length} claim(s) ·{' '}
              {invoices.length} invoice(s)
            </div>
            {hasInvoiceAmountMismatch && (
              <div style={{ fontSize: 11, color: '#d48806', textAlign: 'right' }}>
                ⚠ Invoice amount mismatch
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Invoice Dialog ────────────────────────────────────────────────── */}
      {showAddInvoice && (
        <AddInvoiceDialog
          onClose={() => setShowAddInvoice(false)}
          onAdd={addInvoice}
          onOcr={handleOcr}
          waybillSubtotal={waybillSubtotal}
          currency={invoiceCurrency}
        />
      )}

      {/* ── Add Claim Dialog ──────────────────────────────────────────────────── */}
      {showClaimDialog && (
        <div className="dialog-overlay">
          <div className="dialog" style={{ maxWidth: 600 }}>
            <div className="dialog-header">
              Select Claim Ticket (For Deduction)
            </div>
            <div className="dialog-body" style={{ padding: 0 }}>
              {availableToAdd.length === 0 ? (
                <div className="empty">No eligible claim tickets available.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticket No.</th>
                      <th>Claim Type</th>
                      <th>Related Waybill</th>
                      <th className="num">Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableToAdd.map(t => (
                      <tr key={t.ticketNo}>
                        <td>{t.ticketNo}</td>
                        <td style={{ fontSize: 12 }}>
                          <div>{t.claimTypeL1}</div>
                          <div style={{ color: '#666' }}>{t.claimTypeL2}</div>
                        </td>
                        <td>{t.relatedWaybill || <span style={{ color: '#999' }}>—</span>}</td>
                        <td className="num" style={{ color: '#cf1322', fontWeight: 600 }}>
                          −{t.claimAmount.toLocaleString()}
                        </td>
                        <td>
                          <button className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => addClaim(t)}>
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="dialog-footer">
              <button className="btn-default" onClick={() => setShowClaimDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirm Dialog ─────────────────────────────────────────────── */}
      {showConfirm && (
        <div className="dialog-overlay">
          <div className="dialog" style={{ maxWidth: 440 }}>
            <div className="dialog-header">Confirm Submission</div>
            <div className="dialog-body">
              <p style={{ margin: '0 0 12px', fontSize: 14 }}>
                Once submitted, you will <strong>not be able to modify</strong> this statement.
                TMS will review and compare the amounts.
              </p>
              <div style={{ background: '#fafafa', borderRadius: 6, padding: 12, fontSize: 13 }}>
                {[
                  ['Waybills', rows.length],
                  ['Waybill Subtotal', `${waybillSubtotal.toLocaleString()} PHP`],
                  ...(claimDeduction > 0 ? [['Claim Deductions', `−${claimDeduction.toLocaleString()} PHP`]] : []),
                  ...(vatRate > 0 ? [[`VAT (${vatRate}%)`, `+${vatAmount.toLocaleString()} PHP`]] : []),
                  ...(whtRate > 0 ? [[`WHT (${whtRate}%)`, `−${whtAmount.toLocaleString()} PHP`]] : []),
                  ['Total Amount Payable', `${totalAmountPayable.toLocaleString()} PHP`],
                  ['Invoices', invoices.length],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#666' }}>{label}</span>
                    <span style={label === 'Total Amount Payable' ? { fontWeight: 700, color: '#00b96b' } : {}}>{val}</span>
                  </div>
                ))}
              </div>
              {hasInvoiceAmountMismatch && (
                <div className="alert alert-warn" style={{ margin: '12px 0 0', fontSize: 12 }}>
                  <span>⚠</span>
                  Invoice amount does not match the submitted total. You can still submit, but please double-check.
                </div>
              )}
            </div>
            <div className="dialog-footer">
              <button className="btn-default" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { setShowConfirm(false); onSubmit(rows.map(r => r.no)); }}>
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Add Invoice Dialog ───────────────────────────────────────────────────────

interface AddInvoiceDialogProps {
  onClose: () => void;
  onAdd: (entry: Omit<InvoiceEntry, 'id' | 'ocrState'>) => void;
  onOcr: (id: string, fileName: string) => void;
  waybillSubtotal: number;
  currency: string;
}

function AddInvoiceDialog({ onClose, onAdd, waybillSubtotal, currency }: AddInvoiceDialogProps) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [ocrState, setOcrState] = useState<OcrState>('idle');

  const handleFakeUpload = () => {
    const fileName = 'Invoice_Attachment.pdf';
    setAttachmentName(fileName);
    setOcrState('scanning');
    setTimeout(() => {
      setOcrState('done');
      if (!invoiceNo) setInvoiceNo(`INV-2026-0${Math.floor(Math.random() * 900 + 100)}`);
      if (!invoiceAmount) setInvoiceAmount(String(Math.round(waybillSubtotal)));
      if (!invoiceDate) setInvoiceDate('2026-04-28');
    }, 1500);
  };

  const canAdd = invoiceNo.trim() && invoiceAmount.trim() && invoiceDate.trim() && attachmentName.trim();

  return (
    <div className="dialog-overlay">
      <div className="dialog" style={{ maxWidth: 480 }}>
        <div className="dialog-header">Add Invoice</div>
        <div className="dialog-body">
          {/* Attachment upload first (triggers OCR) */}
          <div style={{ marginBottom: 16 }}>
            <div className="form-label req" style={{ marginBottom: 6 }}>
              Attachment <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <div
              className={`upload-zone${dragging ? ' dragging' : ''}`}
              style={{ padding: 16 }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFakeUpload(); }}
              onClick={handleFakeUpload}
            >
              {attachmentName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1677ff', fontSize: 13 }}>📎 {attachmentName}</span>
                  {ocrState === 'scanning' && <span style={{ fontSize: 12, color: '#1677ff' }}>⟳ OCR scanning…</span>}
                  {ocrState === 'done' && <span style={{ fontSize: 12, color: '#00b96b' }}>✓ OCR auto-filled</span>}
                  {ocrState === 'failed' && <span style={{ fontSize: 12, color: '#ff4d4f' }}>✕ OCR failed</span>}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 22, color: '#ccc', marginBottom: 6 }}>⬆</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Click or drag to upload · PDF, JPG, PNG · Max 20 MB</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>OCR will auto-fill the fields below after upload</div>
                </>
              )}
            </div>
          </div>

          {/* Fields (may be auto-filled by OCR) */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Invoice No. *</label>
              <input className="form-input" placeholder="e.g. INV-2026-00201" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
              <div className="form-help">System will check for duplicates on submit.</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label req">Invoice Amount *</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="form-input" type="number" style={{ flex: 1 }} placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, color: '#666' }}>
                  {currency}
                </div>
              </div>
              {invoiceAmount && waybillSubtotal > 0 && Math.abs(parseFloat(invoiceAmount) - waybillSubtotal) > 0.01 && (
                <div className="form-help" style={{ color: '#d48806' }}>
                  ⚠ Amount differs from waybill total ({waybillSubtotal.toLocaleString()} PHP)
                </div>
              )}
            </div>
            <div className="form-field">
              <label className="form-label req">Invoice Date *</label>
              <input className="form-input" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="dialog-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!canAdd}
            onClick={() => onAdd({ invoiceNo, invoiceAmount, invoiceDate, attachmentName })}
          >
            Add Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateStatementForm;
