import React, { useMemo, useState } from 'react';
import { APPLICATIONS, WAYBILLS } from '../data/mockData';
import { formatAmount, formatMoney } from './UI';

interface Props {
  applicationNo: string;
  cancelledWaybillNo: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TransferPrepaymentDialog({
  applicationNo,
  cancelledWaybillNo,
  onClose,
  onConfirm,
}: Props) {
  const app = APPLICATIONS.find(a => a.applicationNo === applicationNo);
  const cancelledItem = app?.items.find(it => it.waybillNo === cancelledWaybillNo);
  const cancelledWaybill = WAYBILLS.find(w => w.waybillNo === cancelledWaybillNo);

  const candidates = useMemo(
    () =>
      WAYBILLS.filter(
        w =>
          w.vendorId === app?.vendorId &&
          w.currency === app?.currency &&
          ['Planning', 'Pending', 'In Transit'].includes(w.status) &&
          !w.applicationNo &&
          w.waybillNo !== cancelledWaybillNo
      ),
    [app, cancelledWaybillNo]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');

  const cancelledAmount = cancelledItem?.allocatedAmount ?? 0;

  const sumNewBasic = candidates
    .filter(w => selected.has(w.waybillNo))
    .reduce((s, w) => s + w.basicAmount, 0);

  const isAmountOk = sumNewBasic >= cancelledAmount;
  const isReasonOk = reason.trim().length > 0;
  const noneSelected = selected.size === 0;

  const allocations = useMemo(() => {
    if (sumNewBasic === 0 || cancelledAmount === 0) return [];
    return candidates
      .filter(w => selected.has(w.waybillNo))
      .map(w => ({
        waybillNo: w.waybillNo,
        basicAmount: w.basicAmount,
        allocated: Number(((w.basicAmount / sumNewBasic) * cancelledAmount).toFixed(2)),
      }));
  }, [candidates, selected, sumNewBasic, cancelledAmount]);

  function toggle(no: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  }

  if (!app || !cancelledItem || !cancelledWaybill) return null;

  return (
    <div className="ppa-modal-mask">
      <div className="ppa-modal" style={{ width: 820 }}>
        <div className="ppa-modal-header">
          <div>
            <div className="ppa-modal-title">Transfer Prepayment</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Cancelling <span className="ppa-mono">{cancelledWaybillNo}</span> — prepaid amount must be transferred before cancel takes effect.
            </div>
          </div>
          <button className="ppa-btn link" onClick={onClose}>✕</button>
        </div>
        <div className="ppa-modal-body">
          <div className="alert">
            ⚠ Prepayment detected. Please associate one or more new waybills to transfer the prepaid amount of{' '}
            <strong>{formatMoney(cancelledAmount, app.currency)}</strong>. New waybills' total Basic Amount must be ≥ cancelled amount.
          </div>

          <div className="ppa-section-title">Cancelled Waybill</div>
          <table className="ppa-table" style={{ marginBottom: 12 }}>
            <thead>
              <tr>
                <th>Waybill No.</th>
                <th>Status</th>
                <th>Route</th>
                <th className="num">Basic Amount</th>
                <th className="num">Prepaid Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ppa-mono">{cancelledWaybillNo}</td>
                <td>{cancelledWaybill.status}</td>
                <td>{cancelledWaybill.origin} → {cancelledWaybill.destination}</td>
                <td className="num">{formatAmount(cancelledItem.basicAmountSnapshot)}</td>
                <td className="num" style={{ fontWeight: 600 }}>{formatAmount(cancelledAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ppa-section-title">Pick Replacement Waybills</div>
          {candidates.length === 0 ? (
            <div className="ppa-table-empty">No eligible replacement waybills (same vendor, same currency, Planning/Pending/In Transit, not in another application).</div>
          ) : (
            <table className="ppa-table" style={{ marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Waybill No.</th>
                  <th>Status</th>
                  <th>Route</th>
                  <th className="num">Basic Amount</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(w => (
                  <tr key={w.waybillNo}>
                    <td className="center">
                      <input
                        type="checkbox"
                        className="ppa-checkbox"
                        checked={selected.has(w.waybillNo)}
                        onChange={() => toggle(w.waybillNo)}
                      />
                    </td>
                    <td className="ppa-mono">{w.waybillNo}</td>
                    <td>{w.status}</td>
                    <td>{w.origin} → {w.destination}</td>
                    <td className="num">{formatAmount(w.basicAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="ppa-stat">
              <div className="label">Σ New Basic Amount</div>
              <div className="value" style={{ color: isAmountOk ? '#047857' : '#b91c1c' }}>
                {formatMoney(sumNewBasic, app.currency)}
              </div>
              <div className="sub">Required: ≥ {formatMoney(cancelledAmount, app.currency)}</div>
            </div>
            <div className="ppa-stat">
              <div className="label">Difference</div>
              <div className="value" style={{ color: isAmountOk ? '#047857' : '#b91c1c' }}>
                {formatMoney(sumNewBasic - cancelledAmount, app.currency)}
              </div>
              <div className="sub">{isAmountOk ? 'OK to proceed' : 'Insufficient — pick more waybills'}</div>
            </div>
          </div>

          {!isAmountOk && !noneSelected && (
            <div className="alert error">
              New waybill freight amount must be ≥ cancelled waybill prepaid amount ({formatMoney(cancelledAmount, app.currency)}).
            </div>
          )}

          {allocations.length > 0 && (
            <>
              <div className="ppa-section-title">Re-allocation Preview</div>
              <table className="ppa-table" style={{ marginBottom: 12 }}>
                <thead>
                  <tr>
                    <th>New Waybill</th>
                    <th className="num">Basic Amount</th>
                    <th className="num">Allocated From {cancelledWaybillNo}</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(a => (
                    <tr key={a.waybillNo}>
                      <td className="ppa-mono">{a.waybillNo}</td>
                      <td className="num">{formatAmount(a.basicAmount)}</td>
                      <td className="num" style={{ fontWeight: 500 }}>{formatAmount(a.allocated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="ppa-section-title">Reason (required, kept in audit log)</div>
          <textarea
            className="ppa-input"
            style={{ width: '100%', minHeight: 70, fontFamily: 'inherit' }}
            placeholder="e.g. Vendor combined two shipments, cancelled WB-... and replaced with..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          {!isReasonOk && reason !== '' && <div className="ppa-form-error">Reason cannot be empty.</div>}
        </div>
        <div className="ppa-modal-footer">
          <button className="ppa-btn" onClick={onClose}>Keep Waybill</button>
          <button
            className="ppa-btn primary"
            disabled={noneSelected || !isAmountOk || !isReasonOk}
            onClick={onConfirm}
          >Confirm Transfer & Cancel</button>
        </div>
      </div>
    </div>
  );
}
