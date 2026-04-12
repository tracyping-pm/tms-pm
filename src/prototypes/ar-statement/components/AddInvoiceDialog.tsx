import React, { useState } from 'react';

interface AddInvoiceDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

interface InvoiceRow {
  id: number;
  clientEntity: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: string;
  hasUpload: boolean;
}

const INITIAL_ROWS: InvoiceRow[] = [
  {
    id: 1,
    clientEntity: '',
    invoiceNumber: '546181013',
    invoiceDate: '2025-09-01',
    invoiceAmount: '546181013',
    hasUpload: true,
  },
  {
    id: 2,
    clientEntity: '',
    invoiceNumber: '546181013',
    invoiceDate: '2025-09-01',
    invoiceAmount: '546181013',
    hasUpload: false,
  },
];

function AddInvoiceDialog({ onClose, onConfirm }: AddInvoiceDialogProps) {
  const [rows, setRows] = useState<InvoiceRow[]>(INITIAL_ROWS);
  const [nextId, setNextId] = useState(3);

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: nextId,
        clientEntity: '',
        invoiceNumber: '',
        invoiceDate: '',
        invoiceAmount: '',
        hasUpload: false,
      },
    ]);
    setNextId(n => n + 1);
  };

  const removeRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: keyof InvoiceRow, value: string) => {
    setRows(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-box"
        style={{ width: 920, padding: '24px 28px' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>Add Invoice</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              padding: '0 4px',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Invoice rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((row, index) => (
            <div
              key={row.id}
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: 4,
                padding: '16px 16px',
                position: 'relative',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Client Entity */}
                <div style={{ flex: '0 0 150px' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Client Entity</div>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="filter-select"
                      value={row.clientEntity}
                      onChange={e => updateRow(row.id, 'clientEntity', e.target.value)}
                      style={{ width: '100%', minWidth: 0 }}
                    >
                      <option value=""></option>
                      <option value="Nestels Comsdfh PH">Nestels Comsdfh PH</option>
                      <option value="Entity B">Entity B</option>
                    </select>
                  </div>
                </div>

                {/* Invoice Number */}
                <div style={{ flex: '1 1 130px' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Invoice Number</div>
                  <input
                    className="filter-input"
                    value={row.invoiceNumber}
                    onChange={e => updateRow(row.id, 'invoiceNumber', e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
                  />
                </div>

                {/* Invoice Date */}
                <div style={{ flex: '1 1 110px' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Invoice Date</div>
                  <input
                    className="filter-input"
                    value={row.invoiceDate}
                    onChange={e => updateRow(row.id, 'invoiceDate', e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
                  />
                </div>

                {/* Invoice Amount */}
                <div style={{ flex: '1 1 130px' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Invoice Amount</div>
                  <input
                    className="filter-input"
                    value={row.invoiceAmount}
                    onChange={e => updateRow(row.id, 'invoiceAmount', e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
                  />
                </div>

                {/* Invoice Proof */}
                <div style={{ flex: '0 0 auto' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#666',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    Invoice Proof
                    <span className="badge-ai-ocr">AI OCR</span>
                  </div>

                  {row.hasUpload ? (
                    /* Uploaded thumbnail */
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        border: '1px solid #e8e8e8',
                        borderRadius: 4,
                        overflow: 'hidden',
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Simulated document thumbnail */}
                      <div
                        style={{
                          width: 60,
                          height: 64,
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          padding: 4,
                        }}
                      >
                        <div style={{ fontSize: 10, color: '#999', textAlign: 'center', lineHeight: 1.4 }}>
                          PNG
                        </div>
                        {[0, 1, 2, 3].map(l => (
                          <div
                            key={l}
                            style={{
                              height: 2,
                              width: '80%',
                              backgroundColor: '#e0e0e0',
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Upload button */
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#fafafa',
                      }}
                      title="Upload file"
                    >
                      <span style={{ fontSize: 22, color: '#bbb', lineHeight: 1 }}>+</span>
                    </div>
                  )}
                </div>

                {/* Row action buttons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    paddingTop: 22,
                    flexShrink: 0,
                  }}
                >
                  {/* Add row button — only on the last row */}
                  {index === rows.length - 1 && (
                    <button
                      onClick={addRow}
                      title="Add row"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        backgroundColor: '#52c41a',
                        border: 'none',
                        color: '#fff',
                        fontSize: 18,
                        lineHeight: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      +
                    </button>
                  )}

                  {/* Remove row button */}
                  <button
                    onClick={() => removeRow(row.id)}
                    title="Remove row"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: '#ff4d4f',
                      border: 'none',
                      color: '#fff',
                      fontSize: 16,
                      lineHeight: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #e8e8e8',
          }}
        >
          <button className="btn-default" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddInvoiceDialog;
