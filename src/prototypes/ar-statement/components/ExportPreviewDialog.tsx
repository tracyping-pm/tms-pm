import React from 'react';

interface ExportPreviewDialogProps {
  onClose: () => void;
}

/* ── Waybill rows for the table ── */
const waybillRows = [
  {
    no: 1,
    waybillNumber: 'PHW26021360D',
    customerCode: 'External Code:P301499632',
    routeCode: '',
    positionTime: '2026-02-13 15:00:00',
    unloadingTime: '2026-02-16 14:55:46',
    billingTruckType: '10 Wheeler Wing Van',
    basicAmount: '115000',
    additionalCharge: '0',
    exceptionFee: '0',
    contractRevenue: '115000',
    billedVATex: '115000',
    vat12: '13800',
    wht2: '-2300',
    billedVATplus: '128800',
    reimbursement: '0',
    origin: 'Western Occident',
  },
  {
    no: 2,
    waybillNumber: 'PHW2602183L1',
    customerCode: 'External Code:P301505260',
    routeCode: '',
    positionTime: '2026-02-18 17:00:00',
    unloadingTime: '2026-02-21 12:01:39',
    billingTruckType: '10 Wheeler Wing Van',
    basicAmount: '115000',
    additionalCharge: '0',
    exceptionFee: '0',
    contractRevenue: '115000',
    billedVATex: '115000',
    vat12: '13800',
    wht2: '-2300',
    billedVATplus: '128800',
    reimbursement: '0',
    origin: 'Western Occident',
  },
];

/* ── Table column config ── */
const waybillColumns: { key: keyof typeof waybillRows[0]; label: string }[] = [
  { key: 'no', label: 'No.' },
  { key: 'waybillNumber', label: 'Waybill Number' },
  { key: 'customerCode', label: 'Customer Code' },
  { key: 'routeCode', label: 'Route Code' },
  { key: 'positionTime', label: 'Position Time' },
  { key: 'unloadingTime', label: 'Unloading Time' },
  { key: 'billingTruckType', label: 'Billing Truck Type' },
  { key: 'basicAmount', label: 'Basic Amount Receivable' },
  { key: 'additionalCharge', label: 'Customer Additional Charge' },
  { key: 'exceptionFee', label: 'Customer Exception Fee' },
  { key: 'contractRevenue', label: 'Contract Revenue' },
  { key: 'billedVATex', label: 'Billed Amount(VAT-ex)' },
  { key: 'vat12', label: 'VAT (12%)' },
  { key: 'wht2', label: 'WHT (2%)' },
  { key: 'billedVATplus', label: 'Billed Amount(VAT+)' },
  { key: 'reimbursement', label: 'Reimbursement Expense' },
  { key: 'origin', label: 'Origin' },
];

/* ── Totals row ── */
const totals: Partial<Record<keyof typeof waybillRows[0], string>> = {
  contractRevenue: '230000',
  billedVATex: '230000',
  vat12: '27600',
  wht2: '-4600',
  billedVATplus: '257600',
  reimbursement: '0',
};

/* ── Header info rows ── */
const headerInfo = [
  { label: 'Statement No.', value: 'PHCS260326022-1', note: 'Statement No.+Batch ID' },
  { label: 'Creation Time', value: '2026-03-26 10:16:34', note: '' },
  { label: 'Client Entity', value: 'Nestlé 1', note: '' },
  { label: 'Reconciliation Period (Delivery Ti)', value: '2026-02-01 To 2026-02-28', note: '' },
  { label: 'Total Amount Receivable', value: '₱ 253,000.00', note: '' },
  { label: 'Invoice Number and Date', value: '73117,2026-03-11', note: '' },
  { label: 'Receipt Voucher Number and Dat', value: '', note: '' },
  { label: 'Is the settlement tax-inclusive', value: 'YES', note: '' },
];

/* ── Billing info rows ── */
const billingRows = [
  { label: 'Waybill Contract Revenue', value: '230000', link: null },
  { label: 'Others', value: '23000', link: null },
  { label: 'Claim Amount', value: '10,000', link: null },
  { label: 'Claim: CT000001  KPI Claim', value: '4,000', link: 'Claim Ticket Number+type' },
  { label: 'Claim: CT000002  KPI Claim', value: '6,000', link: 'Claim Ticket Number+type' },
];

function ExportPreviewDialog({ onClose }: ExportPreviewDialogProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 1200, padding: 0 }}>

        {/* ── Dialog Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e8e8e8' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>Receivable Statement</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666', lineHeight: 1, padding: '0 4px' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ── Dialog Body ── */}
        <div style={{ padding: '20px 24px', overflowX: 'auto' }}>

          {/* ── Report Header Info (Excel-style key-value) ── */}
          <table style={{ borderCollapse: 'collapse', marginBottom: 24, fontSize: 13, minWidth: 600 }}>
            <tbody>
              {headerInfo.map(({ label, value, note }) => (
                <tr key={label}>
                  <td style={{ padding: '4px 12px 4px 0', color: '#333', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top', width: 240 }}>
                    {label}
                  </td>
                  <td style={{ padding: '4px 24px 4px 0', color: '#333', verticalAlign: 'top' }}>
                    {value}
                    {note && (
                      <span style={{ color: '#1890ff', marginLeft: 8, fontSize: 12 }}>{note}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Waybills Section ── */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Waybills (2)</div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 1400 }}>
                <thead>
                  <tr>
                    {waybillColumns.map(col => (
                      <th key={col.key} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waybillRows.map(row => (
                    <tr key={row.no}>
                      {waybillColumns.map(col => {
                        const cellValue = row[col.key];
                        if (col.key === 'waybillNumber') {
                          return (
                            <td key={col.key}>
                              <span className="link-blue" style={{ fontSize: 12 }}>{cellValue}</span>
                            </td>
                          );
                        }
                        return (
                          <td key={col.key} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                            {cellValue || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* ── Totals row ── */}
                  <tr>
                    {waybillColumns.map(col => {
                      const total = totals[col.key];
                      return (
                        <td
                          key={col.key}
                          style={{ fontSize: 12, fontWeight: total ? 700 : 400, color: '#333', borderTop: '2px solid #e8e8e8', whiteSpace: 'nowrap' }}
                        >
                          {total ?? ''}
                        </td>
                      );
                    })}
                  </tr>

                  {/* ── Pink annotation row ── */}
                  <tr>
                    <td colSpan={waybillColumns.length} style={{ padding: '4px 12px', fontSize: 12 }}>
                      <span style={{ color: '#eb2f96' }}>
                        Billed Amount 为该 entity 结算全额
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Billing Info Section ── */}
          <div>
            <div className="section-title" style={{ marginBottom: 10 }}>Billing Info.</div>
            <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {billingRows.map(({ label, value, link }) => (
                  <tr key={label}>
                    <td style={{ padding: '4px 0', verticalAlign: 'top', width: 280 }}>
                      {link ? (
                        <span style={{ color: '#eb2f96', cursor: 'pointer' }}>{label}</span>
                      ) : (
                        <span style={{ color: '#333', fontWeight: label === 'Waybill Contract Revenue' || label === 'Claim Amount' ? 600 : 400 }}>
                          {label}
                        </span>
                      )}
                      {link && (
                        <span style={{ color: '#eb2f96', fontSize: 12, marginLeft: 8 }}>{link}</span>
                      )}
                    </td>
                    <td style={{ padding: '4px 0 4px 24px', color: '#333', textAlign: 'right', minWidth: 80 }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* ── Dialog Footer ── */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-default" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
}

export default ExportPreviewDialog;
