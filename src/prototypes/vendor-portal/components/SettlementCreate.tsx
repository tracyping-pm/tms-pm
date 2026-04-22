import React, { useEffect, useMemo, useState } from 'react';
import StepTimeline from './StepTimeline';
import AddClaimTicketDialog from './AddClaimTicketDialog';
import AddInvoiceDialog from './AddInvoiceDialog';
import type { ClaimTicket } from '../data/claimTickets';
import type { Invoice } from '../data/invoices';

interface Props {
  onBack: () => void;
  onSubmit: () => void;
  prefillWaybills?: string[];
}

interface Waybill {
  no: string;
  positionTime: string;
  delivery: string;
  origin: string;
  destination: string;
  paidAdvance: number;
  basic: number;
  additional: number;
  exception: number;
  claim: number;
  discrepancyWarn?: boolean;
}

const WAYBILLS: Waybill[] = [
  { no: 'WB2604001', positionTime: '2026-04-01 09:20', delivery: '2026-04-02 14:30', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', paidAdvance: 0, basic: 15000, additional: 500, exception: 0, claim: 0 },
  { no: 'WB2604002', positionTime: '2026-04-02 07:10', delivery: '2026-04-03 18:00', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Laguna-Calamba / Plant 2', paidAdvance: 2000, basic: 10000, additional: 0, exception: 1200, claim: 0, discrepancyWarn: true },
  { no: 'WB2604004', positionTime: '2026-04-04 11:00', delivery: '2026-04-05 16:00', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', paidAdvance: 0, basic: 7800, additional: 300, exception: 0, claim: 500 },
  { no: 'WB2604006', positionTime: '2026-04-06 13:00', delivery: '2026-04-07 08:00', origin: 'PH-Batangas / Lima', destination: 'PH-Cavite-Imus / DC', paidAdvance: 0, basic: 15500, additional: 800, exception: 0, claim: 0 },
];

const VAT_RATE = 0.12;
const WHT_RATE = 0.02;

type SubTab = 'waybills' | 'claims';

function SettlementCreate({ onBack, onSubmit, prefillWaybills = [] }: Props) {
  const [periodFrom, setPeriodFrom] = useState('2026-04-01');
  const [periodTo, setPeriodTo] = useState('2026-04-15');
  const [timeType, setTimeType] = useState('Position Time');
  const [items, setItems] = useState<Set<string>>(new Set(['Paid in Advance', 'Basic', 'Additional', 'Exception', 'Claim']));
  const [selected, setSelected] = useState<Set<string>>(new Set(prefillWaybills));
  const [tab, setTab] = useState<SubTab>('waybills');

  const [selectedClaims, setSelectedClaims] = useState<ClaimTicket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [dialog, setDialog] = useState<'add-claim' | 'add-invoice' | null>(null);

  useEffect(() => {
    if (prefillWaybills.length > 0) {
      setSelected(new Set(prefillWaybills));
    }
  }, [prefillWaybills]);

  const waybillSubtotals = useMemo(() => {
    const rows = WAYBILLS.filter(w => selected.has(w.no));
    const paidAdvance = rows.reduce((a, w) => a + w.paidAdvance, 0);
    const basic = rows.reduce((a, w) => a + w.basic, 0);
    const additional = rows.reduce((a, w) => a + w.additional, 0);
    const exception = rows.reduce((a, w) => a + w.exception, 0);
    const claim = rows.reduce((a, w) => a + w.claim, 0);
    const total = paidAdvance + basic + additional + exception + claim;
    return { paidAdvance, basic, additional, exception, claim, total };
  }, [selected]);

  const claimSubtotal = useMemo(
    () => selectedClaims.reduce((a, c) => a + c.claimAmount, 0),
    [selectedClaims]
  );

  const vat = Math.round(waybillSubtotals.total * VAT_RATE);
  const wht = Math.round(waybillSubtotals.total * WHT_RATE);
  const grandTotal = waybillSubtotals.total - claimSubtotal + vat - wht;

  const toggleAll = () => {
    if (selected.size === WAYBILLS.length) setSelected(new Set());
    else setSelected(new Set(WAYBILLS.map(w => w.no)));
  };

  const toggle = (no: string) => {
    const n = new Set(selected);
    if (n.has(no)) n.delete(no); else n.add(no);
    setSelected(n);
  };

  const toggleItem = (item: string) => {
    const n = new Set(items);
    if (n.has(item)) n.delete(item); else n.add(item);
    setItems(n);
  };

  const removeClaim = (no: string) => {
    setSelectedClaims(selectedClaims.filter(c => c.ticketNo !== no));
  };

  const removeInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const hasDiscrepancy = Array.from(selected).some(no => WAYBILLS.find(w => w.no === no)?.discrepancyWarn);

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Applications</button>
        <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>New Settlement Application</span>
        {prefillWaybills.length > 0 && (
          <span className="tag tag-approved" style={{ marginLeft: 10 }}>
            ✓ Auto-selected {prefillWaybills.length} waybill(s) from Price Reconciliation
          </span>
        )}
      </div>

      <div className="vp-card" style={{ padding: '20px 24px' }}>
        <StepTimeline
          steps={['Set Period & Items', 'Select Waybills / Claims', 'Invoice & Proof', 'Submit for Review']}
          current={selected.size > 0 ? (invoices.length > 0 ? 2 : 1) : 0}
        />
      </div>

      <div className="vp-card">
        <div className="section-title" style={{ marginBottom: 14 }}>Reconciliation Period & Settlement Items</div>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label req">Reconciliation Period From</label>
            <input className="form-input" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label req">Reconciliation Period To</label>
            <input className="form-input" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label req">Settlement Time Type</label>
            <select className="form-select" value={timeType} onChange={(e) => setTimeType(e.target.value)}>
              <option>Position Time</option>
              <option>Delivery Time</option>
              <option>Unloading Time</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Billed Project (Optional)</label>
            <select className="form-select">
              <option>All Projects</option>
              <option>Coca-Cola NCR Distribution</option>
              <option>Coca-Cola Plant 2 Transfer</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label req">Items To Be Settled</label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '4px 0' }}>
              {['Basic', 'Additional', 'Exception'].map(item => (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={items.has(item)} onChange={() => toggleItem(item)} />
                  {item}
                </label>
              ))}
            </div>
            <div className="form-help">Tax mark / inclusive-exclusive follows your vendor profile; it cannot be overridden here.</div>
          </div>
        </div>
      </div>

      <div className="vp-card">
        <div className="sub-tabs">
          <div className={`sub-tab ${tab === 'waybills' ? 'active' : ''}`} onClick={() => setTab('waybills')}>
            Waybills ({selected.size})
          </div>
          <div className={`sub-tab ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>
            Claim Tickets ({selectedClaims.length})
          </div>
        </div>

        {tab === 'waybills' && (
          <>
            {hasDiscrepancy && (
              <div className="alert alert-warn">
                <span>⚠</span>
                Selected waybill(s) still have <strong>unresolved price discrepancies</strong>. You can submit, but Procurement will be prompted during review. Consider resolving via Price Reconciliation first.
              </div>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}>
                    <input type="checkbox" checked={selected.size === WAYBILLS.length} onChange={toggleAll} />
                  </th>
                  <th>Waybill No.</th>
                  <th>Position Time</th>
                  <th>Delivery Time</th>
                  <th>Origin → Destination</th>
                  <th className="num">Basic</th>
                  <th className="num">Additional</th>
                  <th className="num">Exception</th>
                  <th className="num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {WAYBILLS.map((w) => {
                  const subtotal = w.paidAdvance + w.basic + w.additional + w.exception + w.claim;
                  return (
                    <tr key={w.no}>
                      <td>
                        <input type="checkbox" checked={selected.has(w.no)} onChange={() => toggle(w.no)} />
                      </td>
                      <td>
                        {w.no}
                        {w.discrepancyWarn && <span className="tag tag-discrepancy-pending" style={{ marginLeft: 6 }}>Discrepancy</span>}
                      </td>
                      <td>{w.positionTime}</td>
                      <td>{w.delivery}</td>
                      <td style={{ fontSize: 12 }}>{w.origin}<br/>→ {w.destination}</td>
                      <td className="num">{w.basic.toLocaleString()}</td>
                      <td className="num">{w.additional.toLocaleString()}</td>
                      <td className="num">{w.exception.toLocaleString()}</td>
                      <td className="num" style={{ fontWeight: 600, color: '#00b96b' }}>{subtotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {tab === 'claims' && (
          <>
            <div className="alert alert-info">
              <span>ⓘ</span>
              将 Claim Ticket 纳入本次申请后，其金额将在底部统计栏的 Claim 列汇总。Claim 默认抵扣应付金额。
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button className="btn-primary" onClick={() => setDialog('add-claim')}>+ Add Claim Ticket</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Claim Type</th>
                  <th>Claimant</th>
                  <th>Related Waybill</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
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
                    <td>{c.claimant}</td>
                    <td>{c.relatedWaybill || <span style={{ color: '#999' }}>—</span>}</td>
                    <td className="num" style={{ color: '#cf1322', fontWeight: 500 }}>-{c.claimAmount.toLocaleString()}</td>
                    <td><span className="tag tag-discrepancy-pending">{c.status}</span></td>
                    <td><button className="btn-link" style={{ color: '#ff4d4f' }} onClick={() => removeClaim(c.ticketNo)}>Remove</button></td>
                  </tr>
                ))}
                {selectedClaims.length === 0 && (
                  <tr><td colSpan={7} className="empty">尚未加入任何 Claim Ticket。</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Invoice</div>
          <button className="btn-primary" onClick={() => setDialog('add-invoice')}>+ Add Invoice</button>
        </div>
        <div className="form-help" style={{ marginBottom: 10 }}>
          可选：发票支持多张（不同税率拆单 / 分批开票）。未在此处填写的，可在对账单 Vendor Confirm 时补录。
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Invoice Date</th>
              <th className="num">Amount</th>
              <th>Currency</th>
              <th>Document</th>
              <th>Remark</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invoiceNo}</td>
                <td>{inv.invoiceDate}</td>
                <td className="num" style={{ fontWeight: 500 }}>{inv.amount.toLocaleString()}</td>
                <td>{inv.currency}</td>
                <td>{inv.documentFileName ? <span>📎 {inv.documentFileName}</span> : <span style={{ color: '#999' }}>—</span>}</td>
                <td style={{ fontSize: 12, color: '#666' }}>{inv.remark || '—'}</td>
                <td><button className="btn-link" style={{ color: '#ff4d4f' }} onClick={() => removeInvoice(inv.id)}>Remove</button></td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="empty">尚未添加发票。</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-hero-card">
        <div className="summary-hero-top">
          <div>
            <div className="summary-hero-label">Total Settlement Amount</div>
            <div className="summary-hero-value">{grandTotal.toLocaleString()} PHP</div>
            <div className="summary-hero-sub">VAT-ex (from vendor profile) · {selected.size} waybills · {selectedClaims.length} claims · {invoices.length} invoice(s)</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-default">Save as Draft</button>
            <button className="btn-primary" disabled={selected.size === 0} onClick={onSubmit}>
              Submit for Review
            </button>
          </div>
        </div>

        <div className="summary-grid-3col">
          <div className="summary-col">
            <div className="summary-col-title">Waybill Contract Revenue</div>
            <div className="summary-col-line"><span>Basic (Remaining)</span><span>{waybillSubtotals.basic.toLocaleString()}</span></div>
            <div className="summary-col-line"><span>Additional</span><span>{waybillSubtotals.additional.toLocaleString()}</span></div>
            <div className="summary-col-line"><span>Exception</span><span>{waybillSubtotals.exception.toLocaleString()}</span></div>
            <div className="summary-col-total"><span>Subtotal</span><span>{waybillSubtotals.total.toLocaleString()}</span></div>
          </div>

          <div className="summary-col">
            <div className="summary-col-title">Claim</div>
            {selectedClaims.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999', padding: '8px 0' }}>No claim ticket associated.</div>
            ) : (
              selectedClaims.map(c => (
                <div className="summary-col-line" key={c.ticketNo}>
                  <span style={{ fontSize: 12 }}>{c.ticketNo}</span>
                  <span style={{ color: '#cf1322' }}>-{c.claimAmount.toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="summary-col-total"><span>Subtotal</span><span style={{ color: '#cf1322' }}>-{claimSubtotal.toLocaleString()}</span></div>
          </div>

          <div className="summary-col">
            <div className="summary-col-title">Others</div>
            <div className="summary-col-line"><span>VAT (+12%)</span><span style={{ color: '#389e0d' }}>+{vat.toLocaleString()}</span></div>
            <div className="summary-col-line"><span>WHT (-2%)</span><span style={{ color: '#cf1322' }}>-{wht.toLocaleString()}</span></div>
            <div className="summary-col-total"><span>Net Adjustment</span><span>{(vat - wht).toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {dialog === 'add-claim' && (
        <AddClaimTicketDialog
          excludedTicketNos={selectedClaims.map(c => c.ticketNo)}
          onClose={() => setDialog(null)}
          onConfirm={(tickets) => {
            setSelectedClaims([...selectedClaims, ...tickets]);
            setDialog(null);
          }}
        />
      )}

      {dialog === 'add-invoice' && (
        <AddInvoiceDialog
          onClose={() => setDialog(null)}
          onConfirm={(inv) => { setInvoices([...invoices, inv]); setDialog(null); }}
        />
      )}
    </>
  );
}

export default SettlementCreate;
