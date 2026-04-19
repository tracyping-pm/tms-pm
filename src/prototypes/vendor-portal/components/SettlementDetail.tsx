import React, { useState } from 'react';
import { WAYBILL_DETAILS } from '../data/waybillDetails';
import { CLAIM_TICKETS } from '../data/claimTickets';
import { INVOICES } from '../data/invoices';

interface Props {
  apNo: string;
  onBack: () => void;
  onOpenClaimTicket?: (ticketNo: string) => void;
}

type Tab = 'waybills' | 'claims' | 'invoices';

const WAYBILL_LINES = [
  { no: 'WB2604001' },
  { no: 'WB2604002' },
  { no: 'WB2604004' },
  { no: 'WB2604006' },
];

const LINKED_CLAIM_TICKETS = ['PHCT26041002CD'];

function computeWaybillSubtotal(no: string): number {
  const d = WAYBILL_DETAILS[no];
  if (!d) return 0;
  return d.billingLines.reduce((a, l) => a + l.currentAmount, 0);
}

function ApplicationDetail({ apNo, onBack, onOpenClaimTicket }: Props) {
  const [tab, setTab] = useState<Tab>('waybills');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (no: string) => {
    const n = new Set(expanded);
    if (n.has(no)) n.delete(no); else n.add(no);
    setExpanded(n);
  };

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
            <span className="tag tag-under-review">Under Review</span>
            <button className="btn-default">Withdraw</button>
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
          <>
            <div className="alert alert-info">
              <span>ⓘ</span>
              点击行可展开运单详情与 Billing Breakdown。金额若被 TMS 运营编辑过，会以 <strong>Original → Current</strong> 黄底对比展示。
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>&nbsp;</th>
                  <th>Waybill No.</th>
                  <th>Route</th>
                  <th>Truck / Driver</th>
                  <th>Claim Linked</th>
                  <th className="num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {WAYBILL_LINES.map((w) => {
                  const d = WAYBILL_DETAILS[w.no];
                  const isOpen = expanded.has(w.no);
                  const sub = computeWaybillSubtotal(w.no);
                  const hasEdit = d?.billingLines.some(l => l.editedBy === 'TMS Ops');
                  return (
                    <React.Fragment key={w.no}>
                      <tr style={{ cursor: 'pointer' }} onClick={() => toggle(w.no)}>
                        <td style={{ color: '#999' }}>{isOpen ? '▾' : '▸'}</td>
                        <td>
                          <strong>{w.no}</strong>
                          {hasEdit && (
                            <span className="tag" style={{ marginLeft: 6, background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' }}>
                              TMS Edited
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {d ? (<>{d.origin}<br/>→ {d.destination}</>) : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {d?.truckType || '—'}
                          <br/>
                          <span style={{ color: '#999' }}>{d?.driver || '—'} · {d?.truckPlate || '—'}</span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {d?.relatedClaimTickets?.length
                            ? d.relatedClaimTickets.map(t => (
                                <button
                                  key={t}
                                  className="btn-link"
                                  style={{ fontSize: 12, padding: 0, marginRight: 6 }}
                                  onClick={(e) => { e.stopPropagation(); onOpenClaimTicket?.(t); }}
                                >{t}</button>
                              ))
                            : <span style={{ color: '#999' }}>—</span>}
                        </td>
                        <td className="num" style={{ fontWeight: 600, color: '#00b96b' }}>{sub.toLocaleString()}</td>
                      </tr>
                      {isOpen && d && (
                        <tr className="waybill-expand-row">
                          <td></td>
                          <td colSpan={5}>
                            <div style={{ padding: '8px 0' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                                <div><div className="vp-kpi-label">Position Time</div><div style={{ fontSize: 13 }}>{d.positionTime}</div></div>
                                <div><div className="vp-kpi-label">Delivery Time</div><div style={{ fontSize: 13 }}>{d.deliveryTime}</div></div>
                                <div><div className="vp-kpi-label">Unloading Time</div><div style={{ fontSize: 13 }}>{d.unloadingTime || '—'}</div></div>
                                <div><div className="vp-kpi-label">POD</div><div style={{ fontSize: 13 }}>{d.pod ? <span style={{ color: '#1677ff' }}>📎 {d.pod}</span> : '—'}</div></div>
                              </div>

                              <div style={{ fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 500 }}>Billing Breakdown</div>
                              <table className="data-table" style={{ marginTop: 0 }}>
                                <thead>
                                  <tr>
                                    <th>Billing Item</th>
                                    <th className="num">Original</th>
                                    <th className="num">Current</th>
                                    <th>Edited</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {d.billingLines.map((l, i) => (
                                    <tr key={i} className={l.editedBy ? 'amount-diff-row' : ''}>
                                      <td>{l.item}</td>
                                      <td className="num">{l.originalAmount.toLocaleString()}</td>
                                      <td className="num" style={l.editedBy ? { color: '#d46b08', fontWeight: 600 } : {}}>
                                        {l.currentAmount.toLocaleString()}
                                        {l.editedBy && l.currentAmount !== l.originalAmount && (
                                          <span style={{ fontSize: 11, marginLeft: 6, color: l.currentAmount > l.originalAmount ? '#00b96b' : '#cf1322' }}>
                                            ({l.currentAmount > l.originalAmount ? '+' : ''}{(l.currentAmount - l.originalAmount).toLocaleString()})
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ fontSize: 12 }}>
                                        {l.editedBy ? (
                                          <>
                                            <div style={{ color: '#d46b08' }}>{l.editedBy} · {l.editedAt}</div>
                                            <div style={{ color: '#999' }}>{l.reason}</div>
                                          </>
                                        ) : <span style={{ color: '#999' }}>—</span>}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {d.notes && (
                                <div style={{ fontSize: 12, color: '#666', marginTop: 8, padding: 8, background: '#fffbe6', borderLeft: '3px solid #ffd666' }}>
                                  ℹ {d.notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td colSpan={5} style={{ textAlign: 'right' }}>Waybill Subtotal</td>
                  <td className="num" style={{ color: '#00b96b' }}>{waybillSubtotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {tab === 'claims' && (
          <>
            {linkedClaims.length === 0 ? (
              <div className="empty">本申请未关联 Claim Ticket。</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket No.</th>
                    <th>Claim Type</th>
                    <th>Related Waybill</th>
                    <th className="num">Claim Amount</th>
                    <th>Deduction</th>
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
                      <td style={{ fontSize: 12 }}>{t.deductionForVendor}</td>
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
              <div className="empty">本申请暂无发票。发票可在 Statement 确认阶段补录。</div>
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
                      <td>{inv.documentFileName ? <span style={{ color: '#1677ff', fontSize: 12 }}>📎 {inv.documentFileName}</span> : <span style={{ color: '#999' }}>—</span>}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>{inv.remark || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
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
            <div style={{ fontSize: 12 }}>Procurement PIC will approve/reject. If approved, a Vendor Statement will be auto-generated and appear in <strong>My Statements</strong>.</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationDetail;
