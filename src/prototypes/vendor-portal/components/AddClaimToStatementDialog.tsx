import React, { useMemo, useState } from 'react';
import { CLAIM_TICKETS } from '../data/claimTickets';

/**
 * V3 §3 · Select Claim Ticket Tab
 * 弹窗仅展示状态严格为 For Deduction 且 Responsible Party = 当前供应商 的工单。
 */

interface Props {
  vendorName: string; // 当前供应商；本原型固定为 "Coca-Cola Bottlers PH Inc." 之外的承运商
  alreadyPicked: string[]; // 已选 ticketNo
  onClose: () => void;
  onConfirm: (ticketNos: string[]) => void;
}

function AddClaimToStatementDialog({ vendorName, alreadyPicked, onClose, onConfirm }: Props) {
  const candidates = useMemo(
    () =>
      CLAIM_TICKETS.filter(
        t =>
          t.deductionForVendor === 'For Deduction' &&
          t.responsibleParty === 'Vendor' &&
          !alreadyPicked.includes(t.ticketNo),
      ),
    [alreadyPicked],
  );

  const [picked, setPicked] = useState<Set<string>>(new Set());

  const togglePick = (no: string) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  };

  const total = candidates
    .filter(t => picked.has(t.ticketNo))
    .reduce((sum, t) => sum + t.claimAmount, 0);

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 760 }}>
        <div className="modal-header">
          <div className="modal-title">Add Claim Ticket · For Deduction</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            仅展示 <strong>For Deduction</strong> 状态、Responsible Party 为当前供应商（{vendorName}）的工单。
            勾选确认后，工单金额将从对账单 Total Amount Payable 中扣除。
          </div>

          {candidates.length === 0 ? (
            <div className="empty" style={{ padding: '40px 0' }}>No deductible claim tickets for this vendor.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Ticket No.</th>
                  <th>Claim Type</th>
                  <th>Related Waybill</th>
                  <th className="num">Claim Amount</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(t => (
                  <tr key={t.ticketNo}>
                    <td>
                      <input
                        type="checkbox"
                        checked={picked.has(t.ticketNo)}
                        onChange={() => togglePick(t.ticketNo)}
                      />
                    </td>
                    <td><strong>{t.ticketNo}</strong></td>
                    <td style={{ fontSize: 12 }}>{t.claimTypeL2}</td>
                    <td>{t.relatedWaybill ?? '—'}</td>
                    <td className="num">{t.claimAmount.toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{t.creationTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <span style={{ fontSize: 13, color: '#666', marginRight: 'auto' }}>
            Selected <strong>{picked.size}</strong> · Deduction Subtotal{' '}
            <strong style={{ color: '#ff4d4f' }}>− {total.toLocaleString()} PHP</strong>
          </span>
          <button className="btn-default" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={picked.size === 0}
            onClick={() => onConfirm(Array.from(picked))}
          >
            Add {picked.size} Claim Ticket{picked.size === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClaimToStatementDialog;
