import React, { useState } from 'react';

interface Props {
  apNo: string;
  onBack: () => void;
}

type AdditionalChargeType =
  | 'Parking Fee'
  | 'Toll Fee'
  | 'Detention Fee'
  | 'Loading Fee'
  | 'Unloading Fee'
  | 'Standby Fee'
  | 'Others';

interface AdditionalChargeItem {
  id: string;
  type: AdditionalChargeType;
  amount: number;
}

interface WaybillRow {
  no: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  additionalChargeItems: AdditionalChargeItem[];
  exceptionFee: number;
  reimbursement: number;
  hasDiscrepancy: boolean;
}

interface ClaimTicketRow {
  ticketNo: string;
  claimTypeL1: string;
  claimTypeL2: string;
  relatedWaybill: string;
  claimAmount: number;
}

interface InvoiceEntry {
  invoiceNo: string;
  invoiceAmount: number;
  invoiceDate: string;
  attachmentName: string;
}

interface ProofEntry {
  id: string;
  description: string;
  attachmentName: string;
}

interface CommunicationRecord {
  id: string;
  timestamp: string;
  actor: 'VP' | 'TMS';
  action: 'Submitted' | 'Rejected' | 'Resubmitted' | 'Confirmed' | 'Edited';
  note?: string;
}

const WAYBILLS: WaybillRow[] = [
  {
    no: 'WB2604001', unloadingTime: '2026-04-10 14:00', truckType: '10W', origin: 'Manila', destination: 'Cebu',
    basicAmount: 15000, additionalChargeItems: [
      { id: 'ac1', type: 'Toll Fee', amount: 300 },
      { id: 'ac2', type: 'Parking Fee', amount: 200 },
    ], exceptionFee: 0, reimbursement: 0, hasDiscrepancy: false,
  },
  {
    no: 'WB2604002', unloadingTime: '2026-04-11 16:30', truckType: '6W', origin: 'Manila', destination: 'Davao',
    basicAmount: 10000, additionalChargeItems: [
      { id: 'ac3', type: 'Detention Fee', amount: 500 },
    ], exceptionFee: 1200, reimbursement: 0, hasDiscrepancy: true,
  },
  {
    no: 'WB2604004', unloadingTime: '2026-04-12 09:00', truckType: '10W', origin: 'Cebu', destination: 'Manila',
    basicAmount: 7800, additionalChargeItems: [
      { id: 'ac4', type: 'Loading Fee', amount: 300 },
    ], exceptionFee: 0, reimbursement: 0, hasDiscrepancy: false,
  },
  {
    no: 'WB2604006', unloadingTime: '2026-04-13 11:00', truckType: '6W', origin: 'Davao', destination: 'Manila',
    basicAmount: 15500, additionalChargeItems: [
      { id: 'ac5', type: 'Toll Fee', amount: 400 },
      { id: 'ac6', type: 'Unloading Fee', amount: 400 },
    ], exceptionFee: 0, reimbursement: 0, hasDiscrepancy: false,
  },
];

const CLAIM_TICKETS: ClaimTicketRow[] = [
  { ticketNo: 'CLM2604001', claimTypeL1: 'Damage', claimTypeL2: 'Cargo Damage', relatedWaybill: 'WB2604002', claimAmount: 500 },
];

const INVOICES: InvoiceEntry[] = [
  { invoiceNo: 'INV-2026-00201', invoiceAmount: 42300, invoiceDate: '2026-04-16', attachmentName: 'Invoice_Apr2026.pdf' },
];

const PROOFS: ProofEntry[] = [
  { id: 'p1', description: 'Detention fee receipt for WB2604002 — customer caused 4hr delay', attachmentName: 'detention_receipt.pdf' },
  { id: 'p2', description: 'Exception fee supporting document — route deviation approval', attachmentName: 'exception_approval.jpg' },
];

const COMMUNICATION_RECORDS: CommunicationRecord[] = [
  { id: 'cr1', timestamp: '2026-04-16 17:10', actor: 'VP', action: 'Submitted', note: 'Billing statement for April 1–15 period. 4 waybills included.' },
  { id: 'cr2', timestamp: '2026-04-17 09:30', actor: 'TMS', action: 'Rejected', note: 'WB2604002 has unresolved price discrepancy. Exception fee of 1,200 PHP needs clarification. Please provide supporting documents or adjust the amount.' },
  { id: 'cr3', timestamp: '2026-04-18 14:20', actor: 'VP', action: 'Resubmitted', note: 'Added Proof documents for detention and exception fees. Amounts remain the same — please review attachments.' },
];

type SettlementItem = 'basic' | 'additional' | 'exception' | 'reimbursement' | 'claim';
type DetailTab = 'waybill' | 'ticket';

function SettlementReviewDetail({ apNo, onBack }: Props) {
  const [decision, setDecision] = useState<'none' | 'approved' | 'rejected'>('none');
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('waybill');
  const [includedItems, setIncludedItems] = useState<Record<SettlementItem, boolean>>({
    basic: true, additional: true, exception: true, reimbursement: true, claim: true,
  });

  const toggleItem = (item: SettlementItem) => {
    setIncludedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const itemTotals = {
    basic: WAYBILLS.reduce((a, w) => a + w.basicAmount, 0),
    additional: WAYBILLS.reduce((a, w) => a + w.additionalChargeItems.reduce((s, c) => s + c.amount, 0), 0),
    exception: WAYBILLS.reduce((a, w) => a + w.exceptionFee, 0),
    reimbursement: WAYBILLS.reduce((a, w) => a + w.reimbursement, 0),
  };
  const claimDeduction = CLAIM_TICKETS.reduce((a, t) => a + t.claimAmount, 0);

  const waybillSubtotal =
    (includedItems.basic ? itemTotals.basic : 0) +
    (includedItems.additional ? itemTotals.additional : 0) +
    (includedItems.exception ? itemTotals.exception : 0) +
    (includedItems.reimbursement ? itemTotals.reimbursement : 0);
  const totalAmountPayable = waybillSubtotal - (includedItems.claim ? claimDeduction : 0);

  const unresolvedDiscrepancies = WAYBILLS.filter(w => w.hasDiscrepancy).length;

  const greyText: React.CSSProperties = { color: '#bbb', textDecoration: 'line-through' };
  const isIncluded = (item: SettlementItem) => includedItems[item];

  return (
    <>
      <div className="tms-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {apNo} · <span className="tag tag-settlement">Settlement</span>
        </span>
      </div>

      {unresolvedDiscrepancies > 0 && decision === 'none' && (
        <div className="alert alert-warn">
          <span>⚠</span>
          This vendor has <strong>{unresolvedDiscrepancies}</strong> unresolved price discrepancies on selected waybills. Consider requesting the vendor to resolve via Price Modification first.
        </div>
      )}

      {decision === 'approved' && (
        <div className="alert alert-success">
          <span>✓</span>
          Application approved. Vendor Statement <strong>PHVS26041802</strong> has been auto-generated in Pending state. Vendor will be notified.
        </div>
      )}

      {decision === 'rejected' && (
        <div className="alert alert-warn">
          Application rejected. Waybills released. Vendor has been notified with the reject reason.
        </div>
      )}

      {/* ── Application Summary ─────────────────────────────────────────────── */}
      <div className="tms-card">
        <div className="tms-card-title">
          <div className="section-title">Application Summary</div>
          <span className="tag tag-awaiting-comparison">{decision === 'none' ? 'Awaiting Comparison' : (decision === 'approved' ? 'Approved' : 'Rejected')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div><div className="tms-kpi-label">Application No.</div><div style={{ fontSize: 13, fontWeight: 500 }}>{apNo}</div></div>
          <div><div className="tms-kpi-label">Vendor</div><div style={{ fontSize: 13 }}>Coca-Cola Bottlers PH Inc.</div></div>
          <div><div className="tms-kpi-label">Submitted</div><div style={{ fontSize: 13 }}>2026-04-16 17:10</div></div>
          <div><div className="tms-kpi-label">Reconciliation Period</div><div style={{ fontSize: 13 }}>2026-04-01 ~ 2026-04-15</div></div>
          <div><div className="tms-kpi-label">Time Type</div><div style={{ fontSize: 13 }}>Position Time</div></div>
          <div><div className="tms-kpi-label">Items</div><div style={{ fontSize: 13 }}>Paid / Basic / Additional / Exception / Claim</div></div>
          <div><div className="tms-kpi-label">Tax Mark</div><div style={{ fontSize: 13 }}>VAT-ex (from profile)</div></div>
          <div><div className="tms-kpi-label">Total Amount</div><div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>{totalAmountPayable.toLocaleString()} PHP</div></div>
        </div>
      </div>

      {/* ── Communication Records ───────────────────────────────────────────── */}
      <div className="tms-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Communication Records</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          History of submissions, rejections and resubmissions between VP and TMS.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMMUNICATION_RECORDS.map(record => (
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
        </div>
      </div>

      {/* ── Invoice Module ──────────────────────────────────────────────────── */}
      <div className="tms-card">
        <div className="tms-card-title">
          <div className="section-title">Invoices</div>
          <span style={{ fontSize: 12, color: '#999' }}>{INVOICES.length} invoice(s)</span>
        </div>
        {INVOICES.length === 0 ? (
          <div className="empty">No invoices attached.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th className="num">Invoice Amount</th>
                <th>Invoice Date</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={i}>
                  <td style={{ color: '#1890ff', fontWeight: 500 }}>{inv.invoiceNo}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{inv.invoiceAmount.toLocaleString()} PHP</td>
                  <td>{inv.invoiceDate}</td>
                  <td>
                    <span style={{ color: '#1890ff', fontSize: 12, cursor: 'pointer' }}>📎 {inv.attachmentName}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Proof (Supporting Documents) ────────────────────────────────────── */}
      <div className="tms-card">
        <div className="tms-card-title">
          <div className="section-title">Proof (Supporting Documents)</div>
          <span style={{ fontSize: 12, color: '#999' }}>{PROOFS.length} document(s)</span>
        </div>
        {PROOFS.length === 0 ? (
          <div className="empty">No supporting documents.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Description</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              {PROOFS.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: '#999', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontSize: 13 }}>{p.description}</td>
                  <td>
                    <span style={{ color: '#1890ff', fontSize: 12, cursor: 'pointer' }}>📎 {p.attachmentName}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Settlement Item Selection + Amount Breakdown ─────────────────────── */}
      <div className="tms-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Settlement Item Selection & Amount Breakdown</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          Check/uncheck items to include or exclude from this settlement. Excluded items are shown greyed out in the breakdown.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {([
            ['basic', 'Basic Amount'],
            ['additional', 'Additional Charge'],
            ['exception', 'Exception Fee'],
            ['reimbursement', 'Reimbursement'],
            ['claim', 'Claim Deductions'],
          ] as [SettlementItem, string][]).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '4px 10px', borderRadius: 4, border: `1px solid ${isIncluded(key) ? '#00b96b' : '#d9d9d9'}`, background: isIncluded(key) ? '#f6ffed' : '#fafafa' }}>
              <input type="checkbox" checked={isIncluded(key)} onChange={() => toggleItem(key)} />
              {label}
            </label>
          ))}
        </div>

        <div style={{ background: '#fafafa', borderRadius: 6, padding: 14, border: '1px solid #f0f0f0' }}>
          <div className="summary-bd-row" style={isIncluded('basic') ? {} : greyText}>
            <span>Basic Amount {isIncluded('basic') ? '' : '(excluded)'}</span>
            <span>{itemTotals.basic.toLocaleString()} PHP</span>
          </div>
          <div className="summary-bd-row" style={isIncluded('additional') ? {} : greyText}>
            <span>Additional Charge {isIncluded('additional') ? '' : '(excluded)'}</span>
            <span>{itemTotals.additional.toLocaleString()} PHP</span>
          </div>
          <div className="summary-bd-row" style={isIncluded('exception') ? {} : greyText}>
            <span>Exception Fee {isIncluded('exception') ? '' : '(excluded)'}</span>
            <span>{itemTotals.exception.toLocaleString()} PHP</span>
          </div>
          <div className="summary-bd-row" style={isIncluded('reimbursement') ? {} : greyText}>
            <span>Reimbursement {isIncluded('reimbursement') ? '' : '(excluded)'}</span>
            <span>{itemTotals.reimbursement.toLocaleString()} PHP</span>
          </div>
          <div className="summary-bd-row" style={{ fontWeight: 600, borderTop: '1px solid #e8e8e8', paddingTop: 6, marginTop: 4 }}>
            <span>Waybill Subtotal</span>
            <span>{waybillSubtotal.toLocaleString()} PHP</span>
          </div>
          {claimDeduction > 0 && (
            <div className="summary-bd-row" style={isIncluded('claim') ? { color: '#cf1322' } : greyText}>
              <span>Claim Deductions {isIncluded('claim') ? '' : '(excluded)'}</span>
              <span>−{claimDeduction.toLocaleString()} PHP</span>
            </div>
          )}
          <div className="summary-bd-row" style={{ fontWeight: 700, fontSize: 15, color: '#00b96b', borderTop: '2px solid #00b96b', paddingTop: 8, marginTop: 6 }}>
            <span>Total Amount Payable</span>
            <span>{totalAmountPayable.toLocaleString()} PHP</span>
          </div>
        </div>
      </div>

      {/* ── Waybill / Ticket Tab View ───────────────────────────────────────── */}
      <div className="tms-card">
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '2px solid #f0f0f0' }}>
          <button
            className={`tab-btn ${activeTab === 'waybill' ? 'active' : ''}`}
            onClick={() => setActiveTab('waybill')}
          >
            Waybill List ({WAYBILLS.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
            onClick={() => setActiveTab('ticket')}
          >
            Ticket List ({CLAIM_TICKETS.length})
          </button>
        </div>

        {activeTab === 'waybill' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Waybill No.</th>
                <th>Unloading Time</th>
                <th>Truck Type</th>
                <th>Origin</th>
                <th>Destination</th>
                <th className="num">Basic</th>
                <th className="num">Additional Charge</th>
                <th className="num">Exception</th>
                <th className="num">Reimbursement</th>
                <th className="num">Subtotal</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {WAYBILLS.map((w) => {
                const additionalTotal = w.additionalChargeItems.reduce((s, c) => s + c.amount, 0);
                const sub = w.basicAmount + additionalTotal + w.exceptionFee + w.reimbursement;
                return (
                  <React.Fragment key={w.no}>
                    <tr>
                      <td>{w.no}</td>
                      <td>{w.unloadingTime}</td>
                      <td>{w.truckType}</td>
                      <td>{w.origin}</td>
                      <td>{w.destination}</td>
                      <td className="num">{w.basicAmount.toLocaleString()}</td>
                      <td className="num">{additionalTotal.toLocaleString()}</td>
                      <td className="num">{w.exceptionFee.toLocaleString()}</td>
                      <td className="num">{w.reimbursement.toLocaleString()}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{sub.toLocaleString()}</td>
                      <td>{w.hasDiscrepancy && <span className="tag tag-modification">Discrepancy</span>}</td>
                    </tr>
                    {w.additionalChargeItems.length > 0 && (
                      <tr style={{ background: '#fafafa' }}>
                        <td colSpan={5} style={{ fontSize: 11, color: '#999', textAlign: 'right', paddingRight: 16 }}>Additional Charge breakdown →</td>
                        <td colSpan={6} style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {w.additionalChargeItems.map(ac => (
                              <span key={ac.id} style={{ fontSize: 12, color: '#666', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 3, padding: '2px 8px' }}>
                                {ac.type}: <strong style={{ color: '#333' }}>{ac.amount.toLocaleString()}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                <td colSpan={5} style={{ textAlign: 'right' }}>Total</td>
                <td className="num">{itemTotals.basic.toLocaleString()}</td>
                <td className="num">{itemTotals.additional.toLocaleString()}</td>
                <td className="num">{itemTotals.exception.toLocaleString()}</td>
                <td className="num">{itemTotals.reimbursement.toLocaleString()}</td>
                <td className="num" style={{ color: '#00b96b' }}>{(itemTotals.basic + itemTotals.additional + itemTotals.exception + itemTotals.reimbursement).toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'ticket' && (
          CLAIM_TICKETS.length === 0 ? (
            <div className="empty">No claim tickets associated with this statement.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Claim Type (L1)</th>
                  <th>Claim Type (L2)</th>
                  <th>Related Waybill</th>
                  <th className="num">Claim Amount</th>
                </tr>
              </thead>
              <tbody>
                {CLAIM_TICKETS.map((t) => (
                  <tr key={t.ticketNo}>
                    <td style={{ color: '#1890ff', fontWeight: 500 }}>{t.ticketNo}</td>
                    <td>{t.claimTypeL1}</td>
                    <td style={{ color: '#666' }}>{t.claimTypeL2}</td>
                    <td>{t.relatedWaybill}</td>
                    <td className="num" style={{ color: '#cf1322', fontWeight: 600 }}>−{t.claimAmount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td colSpan={4} style={{ textAlign: 'right' }}>Total Deduction</td>
                  <td className="num" style={{ color: '#cf1322' }}>−{claimDeduction.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          )
        )}
      </div>

      {/* ── Review Decision ─────────────────────────────────────────────────── */}
      {decision === 'none' && (
        <div className="tms-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Review Decision</div>
          <div className="approval-box">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Reject Reason (only if rejecting)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain the reason for rejection — e.g., waybill not yet complete, discrepancy not resolved, period overlap..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn-danger" disabled={rejectReason.trim().length === 0} onClick={() => setDecision('rejected')}>
                Reject
              </button>
              <button className="btn-primary" onClick={() => setDecision('approved')}>
                Approve & Auto-Generate Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SettlementReviewDetail;
