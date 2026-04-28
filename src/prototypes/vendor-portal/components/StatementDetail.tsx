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

interface InvoiceEntry {
  invoiceNo: string;
  invoiceAmount: number;
  invoiceDate: string;
  attachmentName?: string;
}

interface ClaimTicketRow {
  ticketNo: string;
  claimType: string;
  relatedWaybill?: string;
  claimAmount: number;
}

interface CommunicationRecord {
  id: string;
  timestamp: string;
  actor: 'VP' | 'TMS';
  action: 'Submitted' | 'Rejected' | 'Resubmitted';
  note?: string;
}

const STATEMENT_DATA: Record<
  string,
  {
    waybills: WaybillRow[];
    invoices: InvoiceEntry[];
    claimTickets?: ClaimTicketRow[];
    communicationRecords?: CommunicationRecord[];
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
    invoices: [
      { invoiceNo: 'INV-2026-00201', invoiceAmount: 32300, invoiceDate: '2026-04-20', attachmentName: 'Invoice_Proof_Apr20.pdf' },
    ],
    claimTickets: [
      { ticketNo: 'PHCT26041501AB', claimType: 'Detention / Late Drop', relatedWaybill: 'WB2604012', claimAmount: 1500 },
    ],
    communicationRecords: [
      { id: '1', timestamp: '2026-04-20 10:15', actor: 'VP', action: 'Submitted', note: 'Statement created and submitted.' },
      { id: '2', timestamp: '2026-04-22 14:30', actor: 'TMS', action: 'Rejected', note: 'Additional Charge for WB2604012 requires supporting proof.' },
    ],
    submittedAt: '2026-04-20 10:15',
  },
  VS2604002: {
    waybills: [
      { no: 'WB2604013', unloadingTime: '2026-04-13 11:15', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2', basicAmount: 20000, additionalCharge: 1500, exceptionFee: 0 },
      { no: 'WB2604016', unloadingTime: '2026-04-16 10:45', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', basicAmount: 16000, additionalCharge: 0, exceptionFee: 1000 },
    ],
    invoices: [
      { invoiceNo: 'INV-2026-00198', invoiceAmount: 21000, invoiceDate: '2026-04-18', attachmentName: 'Invoice_Proof_Apr18.pdf' },
      { invoiceNo: 'INV-2026-00199', invoiceAmount: 17500, invoiceDate: '2026-04-19', attachmentName: 'Invoice_Proof_Apr19.pdf' },
    ],
    claimTickets: [
      { ticketNo: 'PHCT26041602CD', claimType: 'Damaged Cargo', relatedWaybill: 'WB2604016', claimAmount: 2000 },
    ],
    communicationRecords: [
      { id: '1', timestamp: '2026-04-18 14:30', actor: 'VP', action: 'Submitted' },
      { id: '2', timestamp: '2026-04-21 09:15', actor: 'TMS', action: 'Rejected', note: 'Basic Amount for WB2604013 exceeds contracted rate. Additional Charge for WB2604013 has no supporting proof.' },
    ],
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
    invoices: [
      { invoiceNo: 'INV-2026-00185', invoiceAmount: 50800, invoiceDate: '2026-04-13', attachmentName: 'Invoice_Proof_Apr13.pdf' },
    ],
    claimTickets: [],
    communicationRecords: [
      { id: '1', timestamp: '2026-04-13 11:45', actor: 'VP', action: 'Submitted' },
      { id: '2', timestamp: '2026-04-15 16:00', actor: 'TMS', action: 'Rejected', note: 'WB2604015 Exception Fee requires adjustment.' },
      { id: '3', timestamp: '2026-04-16 10:20', actor: 'VP', action: 'Resubmitted', note: 'Adjusted WB2604015 Exception Fee to 0.' },
    ],
    submittedAt: '2026-04-13 11:45',
  },
  VS2603001: {
    waybills: [
      { no: 'WB2603028', unloadingTime: '2026-03-28 09:00', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC', basicAmount: 15000, additionalCharge: 500, exceptionFee: 0 },
      { no: 'WB2603029', unloadingTime: '2026-03-29 14:00', truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-Laguna-Calamba', basicAmount: 11000, additionalCharge: 0, exceptionFee: 0 },
      { no: 'WB2603030', unloadingTime: '2026-03-30 11:00', truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila', basicAmount: 17000, additionalCharge: 800, exceptionFee: 700 },
    ],
    invoices: [
      { invoiceNo: 'INV-2026-00157', invoiceAmount: 44500, invoiceDate: '2026-03-28', attachmentName: 'Invoice_Proof_Mar28.pdf' },
    ],
    claimTickets: [],
    communicationRecords: [
      { id: '1', timestamp: '2026-03-28 14:10', actor: 'VP', action: 'Submitted' },
    ],
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
  const [detailTab, setDetailTab] = useState<'waybills' | 'tickets'>('waybills');

  if (!data) {
    return (
      <div className="vp-card">
        <button className="btn-link" onClick={onBack}>← Back to My Statements</button>
        <div className="empty" style={{ marginTop: 16 }}>Statement data not found.</div>
      </div>
    );
  }

  const rowSubtotal = (r: WaybillRow) => r.basicAmount + r.additionalCharge + r.exceptionFee;
  const waybillTotal = data.waybills.reduce((a, r) => a + rowSubtotal(r), 0);
  const totalInvoiceAmount = data.invoices.reduce((a, inv) => a + inv.invoiceAmount, 0);
  const totalClaimDeduction = (data.claimTickets || []).reduce((a, c) => a + c.claimAmount, 0);
  const grandTotal = waybillTotal - totalClaimDeduction;

  const isRebill = status === 'Awaiting Re-bill';
  const { cls, label } = STATUS_LABEL[status];

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to My Statements</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {no} · <strong>Statement Detail</strong>
        </span>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <div className="vp-kpi-label">Total Invoice Amount</div>
                <div style={{ fontSize: 13 }}>{totalInvoiceAmount.toLocaleString()} PHP</div>
              </div>
              <div>
                <div className="vp-kpi-label">Total Submitted Amount</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>
                  {grandTotal.toLocaleString()} PHP
                </div>
              </div>
            </div>
          </div>

          <div className="vp-card">
            <div className="vp-card-title">
              <div>
                <div className="section-title">Invoice</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  All invoices associated with this statement.
                </div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Invoice Date</th>
                  <th className="num">Invoice Amount</th>
                  <th>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((inv, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{inv.invoiceNo}</td>
                    <td style={{ fontSize: 12 }}>{inv.invoiceDate}</td>
                    <td className="num">{inv.invoiceAmount.toLocaleString()} PHP</td>
                    <td>
                      {inv.attachmentName ? (
                        <span style={{ color: '#1677ff', fontSize: 12 }}>📎 {inv.attachmentName}</span>
                      ) : (
                        <span style={{ color: '#bbb', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td colSpan={2} style={{ textAlign: 'right', fontSize: 12, color: '#666' }}>Total</td>
                  <td className="num" style={{ color: '#00b96b' }}>{totalInvoiceAmount.toLocaleString()} PHP</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="vp-card">
            <div className="sub-tabs" style={{ marginBottom: 12 }}>
              <button
                className={`sub-tab ${detailTab === 'waybills' ? 'active' : ''}`}
                onClick={() => setDetailTab('waybills')}
              >
                Waybill List ({data.waybills.length})
              </button>
              <button
                className={`sub-tab ${detailTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setDetailTab('tickets')}
              >
                Ticket List ({(data.claimTickets || []).length})
              </button>
            </div>

            {detailTab === 'waybills' && (
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
                        <td style={{ fontSize: 11 }}>{r.origin}<br />→ {r.destination}</td>
                        <td className="num">{r.basicAmount.toLocaleString()}</td>
                        <td className="num">{r.additionalCharge.toLocaleString()}</td>
                        <td className="num">{r.exceptionFee.toLocaleString()}</td>
                        <td className="num" style={{ fontWeight: 600, color: '#00b96b' }}>{sub.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                    <td colSpan={7} style={{ textAlign: 'right', paddingRight: 8, fontSize: 12, color: '#666' }}>Waybill Total</td>
                    <td className="num" style={{ color: '#00b96b' }}>{waybillTotal.toLocaleString()} PHP</td>
                  </tr>
                </tbody>
              </table>
            )}

            {detailTab === 'tickets' && (
              <>
                {(data.claimTickets || []).length === 0 ? (
                  <div className="empty" style={{ padding: 20, textAlign: 'center' }}>
                    No claim tickets in this statement.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticket No.</th>
                        <th>Claim Type</th>
                        <th>Related Waybill</th>
                        <th className="num">Deduction Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.claimTickets || []).map(t => (
                        <tr key={t.ticketNo}>
                          <td><strong>{t.ticketNo}</strong></td>
                          <td style={{ fontSize: 12 }}>{t.claimType}</td>
                          <td>{t.relatedWaybill || <span style={{ color: '#999' }}>—</span>}</td>
                          <td className="num" style={{ color: '#cf1322', fontWeight: 600 }}>
                            −{t.claimAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                        <td colSpan={3} style={{ textAlign: 'right', fontSize: 12, color: '#666' }}>Claim Deduction Total</td>
                        <td className="num" style={{ color: '#cf1322' }}>−{totalClaimDeduction.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </>
            )}

            {(data.claimTickets || []).length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff1f0', borderRadius: 4, border: '1px solid #ffa39e', fontSize: 13, color: '#cf1322' }}>
                <strong>Note:</strong> Claim deductions will be subtracted from the total payable amount.
              </div>
            )}
          </div>

          {status === 'Awaiting Comparison' && (
            <div className="alert alert-info">
              <span>ⓘ</span>
              <span>
                Your statement has been submitted and is currently being reviewed by TMS.
                You will be notified once the comparison is complete.
              </span>
            </div>
          )}

          {status === 'Paid' && (
            <div className="alert alert-success">
              <span>✓</span>
              This statement has been fully paid. No further action required.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="vp-card">
            <div className="section-title" style={{ marginBottom: 12 }}>Communication Records</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
              History of submissions, rejections and resubmissions.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data.communicationRecords || []).map(record => (
                <div
                  key={record.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: record.actor === 'TMS' ? '#fff1f0' : '#f6ffed',
                    borderLeft: `3px solid ${record.actor === 'TMS' ? '#ff4d4f' : '#00b96b'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {record.actor === 'VP' ? 'Vendor' : 'TMS'} · {record.action}
                    </span>
                    <span style={{ fontSize: 11, color: '#999' }}>{record.timestamp}</span>
                  </div>
                  {record.note && (
                    <div style={{ fontSize: 12, color: '#666' }}>{record.note}</div>
                  )}
                </div>
              ))}
              {(data.communicationRecords || []).length === 0 && (
                <div className="empty" style={{ fontSize: 13 }}>No communication records yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StatementDetail;
