import React, { useState } from 'react';
import type { Status } from './StatementList';

interface Props {
  no: string;
  status: Status;
  onBack: () => void;
  onEdit?: () => void;
}

interface WaybillRow {
  no: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  additionalCharge: number;
  exceptionFee: number;
}

// Mock statement details per statement no
const STATEMENT_DATA: Record<
  string,
  {
    waybills: WaybillRow[];
    invoiceNo: string;
    invoiceProof: string;
    rejectReason?: string;
    submittedAt: string;
  }
> = {
  VS2604001: {
    waybills: [
      { no: 'WB2604010', unloadingTime: '2026-04-10 15:30', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', basicAmount: 18000, additionalCharge: 800, exceptionFee: 0 },
      { no: 'WB2604011', unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', basicAmount: 12000, additionalCharge: 0, exceptionFee: 500 },
      { no: 'WB2604012', unloadingTime: '2026-04-12 17:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area', basicAmount: 18500, additionalCharge: 2000, exceptionFee: 1000 },
    ],
    invoiceNo: 'INV-2026-00201',
    invoiceProof: 'Invoice_Proof_Apr20.pdf',
    submittedAt: '2026-04-20 10:15',
  },
  VS2604002: {
    waybills: [
      { no: 'WB2604013', unloadingTime: '2026-04-13 11:15', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2', basicAmount: 20000, additionalCharge: 1500, exceptionFee: 0 },
      { no: 'WB2604016', unloadingTime: '2026-04-16 10:45', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', basicAmount: 16000, additionalCharge: 0, exceptionFee: 1000 },
    ],
    invoiceNo: 'INV-2026-00198',
    invoiceProof: 'Invoice_Proof_Apr18.pdf',
    rejectReason:
      'Basic Amount for WB2604013 exceeds contracted rate. Additional Charge for WB2604013 has no supporting proof. Please correct and resubmit.',
    submittedAt: '2026-04-18 14:30',
  },
  VS2604003: {
    waybills: [
      { no: 'WB2604014', unloadingTime: '2026-04-14 08:30', truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area', basicAmount: 17500, additionalCharge: 1200, exceptionFee: 0 },
      { no: 'WB2604015', unloadingTime: '2026-04-15 14:00', truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan', basicAmount: 11000, additionalCharge: 600, exceptionFee: 300 },
      { no: 'WB2604010', unloadingTime: '2026-04-10 15:30', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', basicAmount: 18500, additionalCharge: 700, exceptionFee: 0 },
      { no: 'WB2604011', unloadingTime: '2026-04-11 09:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', basicAmount: 12000, additionalCharge: 0, exceptionFee: 0 },
    ],
    invoiceNo: 'INV-2026-00185',
    invoiceProof: 'Invoice_Proof_Apr13.pdf',
    submittedAt: '2026-04-13 11:45',
  },
  VS2603001: {
    waybills: [
      { no: 'WB2603028', unloadingTime: '2026-03-28 09:00', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC', basicAmount: 15000, additionalCharge: 500, exceptionFee: 0 },
      { no: 'WB2603029', unloadingTime: '2026-03-29 14:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-Laguna-Calamba', basicAmount: 11000, additionalCharge: 0, exceptionFee: 0 },
      { no: 'WB2603030', unloadingTime: '2026-03-30 11:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila', basicAmount: 17000, additionalCharge: 800, exceptionFee: 700 },
    ],
    invoiceNo: 'INV-2026-00157',
    invoiceProof: 'Invoice_Proof_Mar28.pdf',
    submittedAt: '2026-03-28 14:10',
  },
};

const STATUS_LABEL: Record<Status, { cls: string; label: string }> = {
  'Awaiting Comparison': { cls: 'tag-under-review', label: 'Awaiting Comparison' },
  'Awaiting Re-bill': { cls: 'tag-rejected', label: 'Awaiting Re-bill' },
  'Pending Payment': { cls: 'tag-partial', label: 'Pending Payment' },
  Paid: { cls: 'tag-approved', label: 'Paid' },
};

function StatementDetail({ no, status, onBack, onEdit }: Props) {
  const data = STATEMENT_DATA[no];
  const [expandedRows] = useState(new Set<string>());

  if (!data) {
    return (
      <div className="vp-card">
        <button className="btn-link" onClick={onBack}>← Back to My Statements</button>
        <div className="empty" style={{ marginTop: 16 }}>Statement data not found.</div>
      </div>
    );
  }

  const rowSubtotal = (r: WaybillRow) => r.basicAmount + r.additionalCharge + r.exceptionFee;
  const grandTotal = data.waybills.reduce((a, r) => a + rowSubtotal(r), 0);
  const isRebill = status === 'Awaiting Re-bill';
  const isViewOnly = status !== 'Awaiting Re-bill' || !onEdit;

  const { cls, label } = STATUS_LABEL[status];

  return (
    <>
      {/* Back / Breadcrumb */}
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to My Statements</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {no} · <strong>Statement Detail</strong>
        </span>
      </div>

      {/* Rejection Reason Banner */}
      {isRebill && data.rejectReason && (
        <div className="alert alert-danger" style={{ marginBottom: 16, borderLeft: '4px solid #ff4d4f' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16, marginTop: 1 }}>✕</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>TMS Rejection Reason</div>
              <div style={{ fontSize: 13 }}>{data.rejectReason}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                Please click <strong>Edit & Resubmit</strong> to correct the amounts and submit again.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Statement Summary</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`tag ${cls}`}>{label}</span>
            {isRebill && onEdit && (
              <button className="btn-primary" style={{ background: '#d46b08', border: 'none' }} onClick={onEdit}>
                Edit & Resubmit
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <div className="vp-kpi-label">Statement No.</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{no}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Submitted At</div>
            <div style={{ fontSize: 13 }}>{data.submittedAt}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Invoice No.</div>
            <div style={{ fontSize: 13 }}>{data.invoiceNo}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Invoice Proof</div>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: '#1677ff' }}>📎 {data.invoiceProof}</span>
            </div>
          </div>
          <div>
            <div className="vp-kpi-label">Waybills</div>
            <div style={{ fontSize: 13 }}>{data.waybills.length}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Total Submitted Amount</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>
              {grandTotal.toLocaleString()} PHP
            </div>
          </div>
          {status === 'Paid' && (
            <>
              <div>
                <div className="vp-kpi-label">Payment Status</div>
                <div style={{ fontSize: 13, color: '#00b96b', fontWeight: 500 }}>Paid in Full</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Awaiting Comparison info */}
      {status === 'Awaiting Comparison' && (
        <div className="alert alert-info">
          <span>ⓘ</span>
          <span>
            Your statement has been submitted and is currently being reviewed by TMS.
            You will be notified once the comparison is complete.
          </span>
        </div>
      )}

      {/* Waybill Amount Details */}
      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          Waybill Amount Details
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Unloading Time</th>
              <th>Truck Type</th>
              <th>Origin → Destination</th>
              <th className="num">Basic Amount</th>
              <th className="num">Additional Charge</th>
              <th className="num">Exception Fee</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.waybills.map(r => {
              const sub = rowSubtotal(r);
              return (
                <tr key={r.no}>
                  <td><strong>{r.no}</strong></td>
                  <td style={{ fontSize: 12 }}>{r.unloadingTime}</td>
                  <td style={{ fontSize: 12 }}>{r.truckType}</td>
                  <td style={{ fontSize: 11 }}>
                    {r.origin}<br />→ {r.destination}
                  </td>
                  <td className="num">{r.basicAmount.toLocaleString()}</td>
                  <td className="num">{r.additionalCharge.toLocaleString()}</td>
                  <td className="num">{r.exceptionFee.toLocaleString()}</td>
                  <td className="num" style={{ fontWeight: 600, color: '#00b96b' }}>
                    {sub.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <td colSpan={7} style={{ textAlign: 'right', paddingRight: 8 }}>
                Total Submitted Amount
              </td>
              <td className="num" style={{ fontSize: 15, color: '#00b96b' }}>
                {grandTotal.toLocaleString()} PHP
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Final state */}
      {status === 'Paid' && (
        <div className="alert alert-success">
          <span>✓</span>
          This statement has been fully paid. No further action required.
        </div>
      )}
    </>
  );
}

export default StatementDetail;
