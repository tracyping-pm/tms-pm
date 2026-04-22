import React, { useMemo, useState } from 'react';
import { CLAIM_TICKETS, type ClaimTicket } from '../data/claimTickets';

interface Props {
  excludedTicketNos: string[];
  onClose: () => void;
  onConfirm: (tickets: ClaimTicket[]) => void;
}

function AddClaimTicketDialog({ excludedTicketNos, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [kw, setKw] = useState('');

  const selectable = useMemo(() => {
    return CLAIM_TICKETS.filter(t =>
      !excludedTicketNos.includes(t.ticketNo)
      && !t.linkedSettlementApNo
      && t.status === 'For Deduction'
      && (!kw || t.ticketNo.includes(kw.toUpperCase()) || t.claimTypeL2.toLowerCase().includes(kw.toLowerCase()))
    );
  }, [excludedTicketNos, kw]);

  const toggle = (no: string) => {
    const n = new Set(selected);
    if (n.has(no)) n.delete(no); else n.add(no);
    setSelected(n);
  };

  const submit = () => {
    const picked = CLAIM_TICKETS.filter(t => selected.has(t.ticketNo));
    onConfirm(picked);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 820 }}>
        <div className="modal-header">
          <div className="modal-title">Add Claim Tickets</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            <span>ⓘ</span>
            Select Claim Tickets to include in this settlement application. Tickets already linked to another application or closed are not shown.
          </div>

          <div className="filter-row">
            <input
              className="filter-input"
              placeholder="Ticket No. / Claim Type"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 12, color: '#999' }}>Selected: {selected.size}</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>&nbsp;</th>
                <th>Ticket No.</th>
                <th>Claim Type</th>
                <th className="num">Amount</th>
                <th>Related Waybill</th>
                <th>Deduction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectable.map(t => (
                <tr key={t.ticketNo}>
                  <td>
                    <input type="checkbox" checked={selected.has(t.ticketNo)} onChange={() => toggle(t.ticketNo)} />
                  </td>
                  <td>{t.ticketNo}</td>
                  <td style={{ fontSize: 12 }}>
                    <div>{t.claimTypeL1}</div>
                    <div style={{ color: '#666' }}>{t.claimTypeL2}</div>
                  </td>
                  <td className="num" style={{ color: '#cf1322' }}>-{t.claimAmount.toLocaleString()}</td>
                  <td>{t.relatedWaybill || <span style={{ color: '#999' }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{t.deductionForVendor}</td>
                  <td><span className="tag tag-discrepancy-pending">{t.status}</span></td>
                </tr>
              ))}
              {selectable.length === 0 && <tr><td colSpan={7} className="empty">No claim tickets available.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={selected.size === 0} onClick={submit}>
            Add {selected.size} Ticket{selected.size > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClaimTicketDialog;
