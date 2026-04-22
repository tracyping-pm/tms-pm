import React, { useState } from 'react';
import { WAYBILL_DETAILS } from '../data/waybillDetails';
import { CLAIM_TICKETS } from '../data/claimTickets';
import { INVOICES } from '../data/invoices';

interface Props {
  apNo: string;
  status?: 'Draft' | 'Under Review' | 'Approved' | 'Rejected';
  onBack: () => void;
  onOpenClaimTicket?: (ticketNo: string) => void;
  onEdit?: () => void;
}

type Tab = 'waybills' | 'claims' | 'invoices';

const WAYBILL_LINES = [
  { no: 'WB2604001' },
  { no: 'WB2604002' },
  { no: 'WB2604004' },
  { no: 'WB2604006' },
];

const LINKED_CLAIM_TICKETS = ['PHCT26041002CD'];

const ITEM_ORDER = ['Basic (Remaining)', 'Additional Fee', 'Exceptional Fee'];

function getItemKey(item: string): string {
  if (item === 'Paid in Advance') return 'Exceptional Fee';
  if (item === 'Vendor Exception Fee') return 'Exceptional Fee';
  if (item === 'Additional Charge') return 'Additional Fee';
  return item;
}

function computeWaybillSubtotal(no: string): number {
  const d = WAYBILL_DETAILS[no];
  if (!d) return 0;
  return d.billingLines.reduce((a, l) => a + l.currentAmount, 0);
}

function getWaybillItemsByCategory(no: string): Record<string, number> {
  const d = WAYBILL_DETAILS[no];
  if (!d) return { 'Basic (Remaining)': 0, 'Additional Fee': 0, 'Exceptional Fee': 0 };
  const result: Record<string, number> = { 'Basic (Remaining)': 0, 'Additional Fee': 0, 'Exceptional Fee': 0 };
  d.billingLines.forEach(l => {
    const key = getItemKey(l.item);
    if (key in result) result[key] += l.currentAmount;
  });
  return result;
}

function ApplicationDetail({ apNo, status = 'Under Review', onBack, onOpenClaimTicket, onEdit }: Props) {
  const [tab, setTab] = useState<Tab>('waybills');
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const waybillSubtotal = WAYBILL_LINES.reduce((a, w) => a + computeWaybillSubtotal(w.no), 0);
  const linkedClaims = CLAIM_TICKETS.filter(t => LINKED_CLAIM_TICKETS.includes(t.ticketNo));
  const claimSubtotal = linkedClaims.reduce((a, t) => a + t.claimAmount, 0);
  const linkedInvoices = INVOICES.filter(i => i.linkedSettlementApNo === apNo);
  const total = waybillSubtotal - claimSubtotal;

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>
          {apNo} · <strong>Settlement Application</strong>
        </span>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Application Summary</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`tag ${status === 'Approved' ? 'tag-approved' : status === 'Rejected' ? 'tag-rejected' : status === 'Draft' ? 'tag-draft' : 'tag-under-review'}`}>{status}</span>
            {status === 'Rejected' && <button className="btn-primary" onClick={onEdit}>Edit</button>}
            {status === 'Draft' && <>
              <button className="btn-default">Save as Draft</button>
              <button className="btn-primary">Submit for Review</button>
            </>}
            {status === 'Under Review' && <button className="btn-default">Withdraw</button>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <div className="vp-kpi-label">Application No.</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{apNo}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Submitted</div>
            <div style={{ fontSize: 13 }}>2026-04-16 17:10</div>
          </div>
          <div>
            <div className="vp-kpi-label">Reconciliation Period</div>
            <div style={{ fontSize: 13 }}>2026-04-01 ~ 2026-04-15</div>
          </div>
          <div>
            <div className="vp-kpi-label">Settlement Time Type</div>
            <div style={{ fontSize: 13 }}>Position Time</div>
          </div>
          <div>
            <div className="vp-kpi-label">Tax Mark</div>
            <div style={{ fontSize: 13 }}>VAT-ex (from vendor profile)</div>
          </div>
          <div>
            <div className="vp-kpi-label">Waybills</div>
            <div style={{ fontSize: 13 }}>{WAYBILL_LINES.length}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Claim Tickets / Invoices</div>
            <div style={{ fontSize: 13 }}>{linkedClaims.length} / {linkedInvoices.length}</div>
          </div>
          <div>
            <div className="vp-kpi-label">Total Amount</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#00b96b' }}>{total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="vp-card">
        <div className="sub-tabs">
          <button className={`sub-tab ${tab === 'waybills' ? 'active' : ''}`} onClick={() => setTab('waybills')}>
            Waybill Breakdown ({WAYBILL_LINES.length})
          </button>
          <button className={`sub-tab ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>
            Claim Tickets ({linkedClaims.length})
          </button>
          <button className={`sub-tab ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>
            Invoice ({linkedInvoices.length})
          </button>
        </div>

        {tab === 'waybills' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Waybill No.</th>
                <th>Route</th>
                <th>Truck / Driver</th>
                <th>Unloading Time</th>
                <th className="num">Basic (Remaining)</th>
                <th className="num">Additional Fee</th>
                <th className="num">Exceptional Fee</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {WAYBILL_LINES.map((w, wi) => {
                const d = WAYBILL_DETAILS[w.no];
                const items = getWaybillItemsByCategory(w.no);
                const sub = computeWaybillSubtotal(w.no);
                const rowBg = wi % 2 === 0 ? '#fff' : '#fafafa';
                return (
                  <tr key={w.no} style={{ background: rowBg }}>
                    <td><strong>{w.no}</strong></td>
                    <td style={{ fontSize: 12 }}>
                      {d ? <>{d.origin}<br />→ {d.destination}</> : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {d?.truckType || '—'}
                      <br />
                      <span style={{ color: '#999' }}>{d?.driver || '—'}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {d?.unloadingTime || <span style={{ color: '#999' }}>—</span>}
                    </td>
                    <td className="num">{items['Basic (Remaining)'].toLocaleString()}</td>
                    <td className="num">{items['Additional Fee'].toLocaleString()}</td>
                    <td className="num">{items['Exceptional Fee'].toLocaleString()}</td>
                    <td className="num" style={{ fontWeight: 600, color: '#00b96b' }}>{sub.toLocaleString()}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#f0faf5', borderTop: '2px solid #b7eb8f' }}>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Waybill Subtotal</td>
                <td className="num" style={{ fontWeight: 600 }}>{WAYBILL_LINES.reduce((a, w) => a + getWaybillItemsByCategory(w.no)['Basic (Remaining)'], 0).toLocaleString()}</td>
                <td className="num" style={{ fontWeight: 600 }}>{WAYBILL_LINES.reduce((a, w) => a + getWaybillItemsByCategory(w.no)['Additional Fee'], 0).toLocaleString()}</td>
                <td className="num" style={{ fontWeight: 600 }}>{WAYBILL_LINES.reduce((a, w) => a + getWaybillItemsByCategory(w.no)['Exceptional Fee'], 0).toLocaleString()}</td>
                <td className="num" style={{ fontWeight: 700, color: '#00b96b' }}>{waybillSubtotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        )}

        {tab === 'claims' && (
          <>
            {linkedClaims.length === 0 ? (
              <div className="empty">No Claim Tickets linked to this application.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket No.</th>
                    <th>Claim Type</th>
                    <th>Related Waybill</th>
                    <th className="num">Claim Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedClaims.map(t => (
                    <tr key={t.ticketNo}>
                      <td><button className="btn-link" onClick={() => onOpenClaimTicket?.(t.ticketNo)}>{t.ticketNo}</button></td>
                      <td style={{ fontSize: 12 }}>
                        <div>{t.claimTypeL1}</div>
                        <div style={{ color: '#666' }}>{t.claimTypeL2}</div>
                      </td>
                      <td>{t.relatedWaybill || '—'}</td>
                      <td className="num" style={{ color: '#cf1322' }}>-{t.claimAmount.toLocaleString()}</td>
                      <td><span className="tag tag-matched">{t.status}</span></td>
                    </tr>
                  ))}
                  <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                    <td colSpan={3} style={{ textAlign: 'right' }}>Claim Deduction Subtotal</td>
                    <td className="num" style={{ color: '#cf1322' }}>-{claimSubtotal.toLocaleString()}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}

        {tab === 'invoices' && (
          <>
            {linkedInvoices.length === 0 ? (
              <div className="empty">No invoices linked. Invoices can be added at the Statement confirmation stage.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Invoice Date</th>
                    <th className="num">Amount</th>
                    <th>Document</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.invoiceNo}</td>
                      <td>{inv.invoiceDate}</td>
                      <td className="num">{inv.amount.toLocaleString()} {inv.currency}</td>
                      <td>
                        {inv.documentFileName ? (
                          <button className="btn-link" onClick={() => setViewingDoc(inv.documentFileName)}>
                            📎 {inv.documentFileName}
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#666' }}>{inv.remark || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {viewingDoc && (
          <div className="modal-overlay" onClick={() => setViewingDoc(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span style={{ fontWeight: 600 }}>Document Preview</span>
                <button className="btn-link" onClick={() => setViewingDoc(null)}>✕</button>
              </div>
              <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{viewingDoc}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Document preview is not available in prototype</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 12 }}>Review Timeline</div>
        <div style={{ fontSize: 13 }}>
          <div style={{ padding: '8px 0', borderLeft: '2px solid #00b96b', paddingLeft: 12, marginLeft: 4 }}>
            <div style={{ fontWeight: 500 }}>Submitted</div>
            <div style={{ color: '#999', fontSize: 12 }}>2026-04-16 17:10 · by vendor admin</div>
          </div>
          <div style={{ padding: '8px 0', borderLeft: '2px dashed #d9d9d9', paddingLeft: 12, marginLeft: 4, color: '#999' }}>
            <div style={{ fontWeight: 500 }}>Pending Procurement Review</div>
            <div style={{ fontSize: 12 }}>Procurement PIC will approve or reject. If approved, a Vendor Statement will be auto-generated and appear in <strong>My Statements</strong>.</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationDetail;
