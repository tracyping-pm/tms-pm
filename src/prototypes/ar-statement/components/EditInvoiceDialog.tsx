import React, { useState } from 'react';

interface EditInvoiceDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

// ─── Checkbox helper ──────────────────────────────────────────────────────────

type CheckState = 'checked' | 'unchecked' | 'indeterminate';

function Checkbox({
  state,
  onChange,
}: {
  state: CheckState;
  onChange?: () => void;
}) {
  const size = 14;
  const borderColor = state === 'unchecked' ? '#d9d9d9' : '#999';
  return (
    <div
      onClick={onChange}
      style={{
        width: size,
        height: size,
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        backgroundColor: state === 'indeterminate' ? '#bbb' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {state === 'checked' && (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 4.5l2 2 4-4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {state === 'indeterminate' && (
        <div style={{ width: 8, height: 2, backgroundColor: '#fff', borderRadius: 1 }} />
      )}
    </div>
  );
}

// ─── Filter input ─────────────────────────────────────────────────────────────

function FilterInput({ placeholder, style }: { placeholder: string; style?: React.CSSProperties }) {
  return (
    <input
      className="filter-input"
      placeholder={placeholder}
      style={{ height: 32, ...style }}
    />
  );
}

// ─── Associated Waybill section ───────────────────────────────────────────────

const WAYBILL_DATA = [
  { id: 1, customerCode: '', waybillNumber: 'PHW2505069CE', checkState: 'unchecked' as CheckState },
  { id: 2, customerCode: '', waybillNumber: 'PHW2505069CE', checkState: 'indeterminate' as CheckState },
  { id: 3, customerCode: '', waybillNumber: 'PHW2505069CE', checkState: 'unchecked' as CheckState },
];

const AMOUNT_COLS = [
  'Basic amount Receivable\u00a0(Available\u00a0/\u00a0Total)',
  'Customer Additional Charge\u00a0(Available\u00a0/\u00a0Total)',
  'Customer Exception Fee\u00a0(Available\u00a0/\u00a0Total)',
  'Reimbursement Expense\u00a0(Available\u00a0/\u00a0Total)',
  'Miscellaneous Charge\u00a0(Available\u00a0/\u00a0Total)',
];

function AssociatedWaybill() {
  const [headerCheck, setHeaderCheck] = useState<CheckState>('unchecked');

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 12 }}>
        Associated Waybill
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <FilterInput placeholder="Waybill Number" style={{ width: 140 }} />
        <FilterInput placeholder="Customer Code" style={{ width: 140 }} />
        <div style={{ flex: 1 }} />
        <button className="btn-default" style={{ height: 32 }}>Reset</button>
        <button className="btn-primary" style={{ height: 32 }}>Search</button>
      </div>

      {/* Hint */}
      <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
        Only show waybills with an allocatable amount &gt; 0
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e8e8e8', borderRadius: 4 }}>
        <table className="data-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <Checkbox
                  state={headerCheck}
                  onChange={() =>
                    setHeaderCheck((s) => (s === 'unchecked' ? 'checked' : 'unchecked'))
                  }
                />
              </th>
              <th>Customer Code</th>
              <th>Waybill Number</th>
              {AMOUNT_COLS.map((col) => (
                <th key={col} style={{ textAlign: 'right', whiteSpace: 'normal', minWidth: 140 }}>
                  {col.replace(/\u00a0/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WAYBILL_DATA.map((row) => (
              <tr key={row.id}>
                <td style={{ width: 40 }}>
                  <Checkbox state={row.checkState} />
                </td>
                <td>{row.customerCode}</td>
                <td style={{ textAlign: 'right' }}>{row.waybillNumber}</td>
                {AMOUNT_COLS.map((col) => (
                  <td key={col} style={{ textAlign: 'right' }}>
                    800.00/1,200.00
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Associated Ticket section ────────────────────────────────────────────────

const TICKET_DATA = [
  { id: 1, ticketType: '', ticketNumber: 'PHW2505069CE', claimType: '', amount: '800.00/1,200.00', status: '...', checkState: 'unchecked' as CheckState },
  { id: 2, ticketType: '', ticketNumber: 'PHW2505069CE', claimType: '', amount: '800.00/1,200.00', status: 'For deduction', checkState: 'indeterminate' as CheckState },
  { id: 3, ticketType: '', ticketNumber: 'PHW2505069CE', claimType: '', amount: '800.00/1,200.00', status: 'For deduction', checkState: 'unchecked' as CheckState },
];

function AssociatedTicket({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [headerCheck, setHeaderCheck] = useState<CheckState>('unchecked');

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 12 }}>
        Associated Ticket
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <FilterInput placeholder="Ticket Number" style={{ width: 140 }} />
        <FilterInput placeholder="Ticket Type" style={{ width: 140 }} />
        <FilterInput placeholder="Claim Ticket Type" style={{ width: 140 }} />
        <div style={{ flex: 1 }} />
        <button className="btn-default" style={{ height: 32 }} onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" style={{ height: 32 }} onClick={onConfirm}>
          Confirm
        </button>
      </div>

      {/* Hint */}
      <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
        Only show tickets with an allocatable amount &gt; 0
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e8e8e8', borderRadius: 4 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <Checkbox
                  state={headerCheck}
                  onChange={() =>
                    setHeaderCheck((s) => (s === 'unchecked' ? 'checked' : 'unchecked'))
                  }
                />
              </th>
              <th>Ticket Type</th>
              <th>Ticket Number</th>
              <th>Claim Type</th>
              <th style={{ textAlign: 'right' }}>Amount (Available / Total)</th>
              <th>Ticket Status</th>
            </tr>
          </thead>
          <tbody>
            {TICKET_DATA.map((row) => (
              <tr key={row.id}>
                <td style={{ width: 40 }}>
                  <Checkbox state={row.checkState} />
                </td>
                <td>{row.ticketType}</td>
                <td style={{ textAlign: 'right' }}>{row.ticketNumber}</td>
                <td>{row.claimType}</td>
                <td style={{ textAlign: 'right' }}>{row.amount}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

function EditInvoiceDialog({ onClose, onConfirm }: EditInvoiceDialogProps) {
  return (
    <div className="modal-overlay">
      <div
        className="modal-box"
        style={{
          width: 1100,
          maxWidth: '96vw',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Dialog header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>Edit Invoice</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#666',
              lineHeight: 1,
              padding: '0 4px',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Invoice info row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 16,
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            flexWrap: 'wrap',
          }}
        >
          {/* Client Entity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
            <label className="form-label required">Client Entity</label>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                className="filter-select"
                style={{ width: 160, height: 34, paddingRight: 28 }}
                defaultValue=""
              >
                <option value="" disabled />
              </select>
            </div>
          </div>

          {/* Invoice Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
            <label className="form-label required">Invoice Number</label>
            <input
              className="filter-input"
              style={{ height: 34, width: 160 }}
              defaultValue="546181013"
            />
          </div>

          {/* Invoice Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
            <label className="form-label required">Invoice Date</label>
            <input
              className="filter-input"
              style={{ height: 34, width: 160 }}
              defaultValue="2025-09-01"
            />
          </div>

          {/* Invoice Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
            <label className="form-label required">Invoice Amount</label>
            <input
              className="filter-input"
              style={{ height: 34, width: 160 }}
              defaultValue="546181013"
            />
          </div>

          {/* Invoice Proof */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label className="form-label required" style={{ marginBottom: 0 }}>Invoice Proof</label>
              <span className="badge-ai-ocr">AI OCR</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Thumbnail */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  border: '1px solid #e8e8e8',
                  borderRadius: 4,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {/* Simulated receipt thumbnail */}
                <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
                  <rect x="0" y="0" width="36" height="44" rx="2" fill="#e8e8e8" />
                  <rect x="4" y="6" width="28" height="3" rx="1" fill="#bbb" />
                  <rect x="4" y="12" width="20" height="2" rx="1" fill="#ccc" />
                  <rect x="4" y="17" width="24" height="2" rx="1" fill="#ccc" />
                  <rect x="4" y="22" width="16" height="2" rx="1" fill="#ccc" />
                  <rect x="4" y="27" width="28" height="2" rx="1" fill="#ccc" />
                  <rect x="4" y="32" width="20" height="2" rx="1" fill="#ccc" />
                  <rect x="4" y="37" width="12" height="2" rx="1" fill="#bbb" />
                </svg>
                {/* PNG badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: '#1890ff',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '0 3px',
                    borderRadius: 2,
                    lineHeight: '14px',
                  }}
                >
                  PNG
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Associated Waybill */}
        <AssociatedWaybill />

        {/* Associated Ticket */}
        <AssociatedTicket onClose={onClose} onConfirm={onConfirm} />
      </div>
    </div>
  );
}

export default EditInvoiceDialog;
