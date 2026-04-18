import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onRaiseModification: (rows: DiffRow[]) => void;
  onCreateSettlement: (rows: DiffRow[]) => void;
  focusWaybill?: string;
  settledWaybills?: Record<string, string>;
}

export interface DiffRow {
  id: string;
  waybill: string;
  item: string;
  tmsAmount: number;
  vendorAmount: number;
  delta: number;
  status: 'Matched' | 'Discrepancy' | 'Missing on Vendor' | 'Missing on TMS';
}

const DIFF_ROWS: DiffRow[] = [
  { id: '1-1', waybill: 'WB2604001', item: 'Paid in Advance', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },
  { id: '1-2', waybill: 'WB2604001', item: 'Basic (Remaining)', tmsAmount: 15000, vendorAmount: 15000, delta: 0, status: 'Matched' },
  { id: '1-3', waybill: 'WB2604001', item: 'Additional Charge', tmsAmount: 500, vendorAmount: 500, delta: 0, status: 'Matched' },

  { id: '2-1', waybill: 'WB2604002', item: 'Paid in Advance', tmsAmount: 2000, vendorAmount: 2000, delta: 0, status: 'Matched' },
  { id: '2-2', waybill: 'WB2604002', item: 'Basic (Remaining)', tmsAmount: 9500, vendorAmount: 10000, delta: 500, status: 'Discrepancy' },
  { id: '2-3', waybill: 'WB2604002', item: 'Vendor Exception Fee', tmsAmount: 800, vendorAmount: 1200, delta: 400, status: 'Discrepancy' },

  { id: '3-1', waybill: 'WB2604003', item: 'Basic (Remaining)', tmsAmount: 16800, vendorAmount: 17500, delta: 700, status: 'Discrepancy' },
  { id: '3-2', waybill: 'WB2604003', item: 'Additional Charge', tmsAmount: 1200, vendorAmount: 1500, delta: 300, status: 'Discrepancy' },

  { id: '4-1', waybill: 'WB2604004', item: 'Basic (Remaining)', tmsAmount: 7800, vendorAmount: 7800, delta: 0, status: 'Matched' },
  { id: '4-2', waybill: 'WB2604004', item: 'Additional Charge', tmsAmount: 300, vendorAmount: 300, delta: 0, status: 'Matched' },
  { id: '4-3', waybill: 'WB2604004', item: 'Vendor Claim', tmsAmount: 500, vendorAmount: 500, delta: 0, status: 'Matched' },

  { id: '6-1', waybill: 'WB2604006', item: 'Basic (Remaining)', tmsAmount: 15500, vendorAmount: 15500, delta: 0, status: 'Matched' },
  { id: '6-2', waybill: 'WB2604006', item: 'Additional Charge', tmsAmount: 800, vendorAmount: 800, delta: 0, status: 'Matched' },
];

function StatusTag({ s }: { s: DiffRow['status'] }) {
  if (s === 'Matched') return <span className="tag tag-matched">Matched</span>;
  if (s === 'Discrepancy') return <span className="tag tag-discrepancy-pending">Discrepancy</span>;
  if (s === 'Missing on TMS') return <span className="tag tag-discrepancy-pending">Missing on TMS</span>;
  return <span className="tag tag-not-reconciled">Missing on Vendor</span>;
}

type SelectionMode = 'idle' | 'settlement' | 'modification';

function DiffView({ onBack, onRaiseModification, onCreateSettlement, focusWaybill, settledWaybills = {} }: Props) {
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    let r = DIFF_ROWS;
    if (focusWaybill) r = r.filter(x => x.waybill === focusWaybill);
    if (showOnlyDiff) r = r.filter(x => x.status !== 'Matched');
    return r;
  }, [showOnlyDiff, focusWaybill]);

  const selectedRows = DIFF_ROWS.filter(r => selected.has(r.id));
  const allMatched = selectedRows.length > 0 && selectedRows.every(r => r.status === 'Matched');
  const allDiscrepancy = selectedRows.length > 0 && selectedRows.every(r => r.status !== 'Matched');

  const mode: SelectionMode = selected.size === 0
    ? 'idle'
    : allMatched ? 'settlement' : allDiscrepancy ? 'modification' : 'idle';

  const discrepancyCount = DIFF_ROWS.filter(r => r.status === 'Discrepancy').length;
  const totalDelta = DIFF_ROWS.filter(r => r.status === 'Discrepancy').reduce((a, r) => a + r.delta, 0);

  const isRowSettled = (wb: string) => !!settledWaybills[wb];

  const toggle = (id: string) => {
    const row = DIFF_ROWS.find(r => r.id === id);
    if (!row || isRowSettled(row.waybill)) return;
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const toggleAllMatched = () => {
    const ids = rows.filter(r => r.status === 'Matched' && !isRowSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
  };

  const toggleAllDiff = () => {
    const ids = rows.filter(r => r.status !== 'Matched' && !isRowSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
  };

  const isRowCompatible = (r: DiffRow): boolean => {
    if (selected.size === 0) return true;
    if (mode === 'settlement') return r.status === 'Matched';
    if (mode === 'modification') return r.status !== 'Matched';
    return true;
  };

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>← Back to Waybills</button>
        {focusWaybill && <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>Focused on <strong>{focusWaybill}</strong></span>}
      </div>

      <div className="vp-kpi-row">
        <div className="vp-kpi"><div className="vp-kpi-label">Total Waybills in Diff</div><div className="vp-kpi-value">6</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Matched Items</div><div className="vp-kpi-value green">{DIFF_ROWS.filter(r => r.status === 'Matched').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Discrepancies</div><div className="vp-kpi-value red">{discrepancyCount}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Total Delta</div><div className="vp-kpi-value orange">+{totalDelta.toLocaleString()}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Reconciliation Diff {focusWaybill ? `· ${focusWaybill}` : ''}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={showOnlyDiff} onChange={(e) => setShowOnlyDiff(e.target.checked)} /> Show discrepancies only
            </label>
            <button className="btn-default" onClick={toggleAllMatched}>Select All Matched</button>
            <button className="btn-default" onClick={toggleAllDiff}>Select All Discrepancies</button>
            <button
              className="btn-primary"
              disabled={mode !== 'settlement'}
              title={mode === 'settlement' ? '' : 'Select only Matched rows to create settlement'}
              onClick={() => onCreateSettlement(selectedRows)}
            >
              Create Settlement from Selected ({mode === 'settlement' ? selected.size : 0})
            </button>
            <button
              className="btn-default"
              style={mode === 'modification' ? { borderColor: '#1890ff', color: '#1890ff' } : {}}
              disabled={mode !== 'modification'}
              title={mode === 'modification' ? '' : 'Select only Discrepancy/Missing rows to raise modification'}
              onClick={() => onRaiseModification(selectedRows)}
            >
              Raise Modification ({mode === 'modification' ? selected.size : 0})
            </button>
          </div>
        </div>

        {mode === 'idle' && selected.size === 0 && (
          <div className="alert alert-info">
            <span>ⓘ</span>
            勾选 <strong>Matched</strong> 行以直接发起结算申请；勾选 <strong>Discrepancy / Missing</strong> 行以发起价格修改申请。两类不可混选。
          </div>
        )}
        {mode === 'settlement' && (
          <div className="alert alert-success" style={{ background: '#f6ffed' }}>
            <span>✓</span>
            <strong>Settlement Mode</strong> — 已选 {selected.size} 行 Matched 明细。点击右上角「Create Settlement from Selected」进入新建结算申请。
          </div>
        )}
        {mode === 'modification' && (
          <div className="alert alert-warn">
            <span>⚠</span>
            <strong>Modification Mode</strong> — 已选 {selected.size} 行 Discrepancy / Missing 明细。点击右上角「Raise Modification」发起价格修改。
          </div>
        )}

        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>&nbsp;</th>
                <th>Waybill No.</th>
                <th>Settlement Item</th>
                <th className="num">TMS Amount</th>
                <th className="num">Your Amount</th>
                <th className="num">Delta</th>
                <th className="num">Delta %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const settled = isRowSettled(r.waybill);
                const compatible = isRowCompatible(r);
                const rowStyle: React.CSSProperties = settled
                  ? { opacity: 0.45, background: '#fafafa' }
                  : selected.size > 0 && !compatible
                    ? { background: '#fff1f0' }
                    : {};
                return (
                  <tr key={r.id} style={rowStyle}>
                    <td>
                      {settled ? (
                        <span style={{ color: '#ccc' }} title={`已加入 ${settledWaybills[r.waybill]}`}>⊘</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={selected.has(r.id)}
                          disabled={selected.size > 0 && !compatible}
                          onChange={() => toggle(r.id)}
                        />
                      )}
                    </td>
                    <td>
                      {r.waybill}
                      {settled && <span className="tag tag-settlement-pending" style={{ marginLeft: 6 }}>Settlement Pending</span>}
                    </td>
                    <td>{r.item}</td>
                    <td className="num tms-amt">{r.tmsAmount.toLocaleString()}</td>
                    <td className="num vendor-amt">{r.vendorAmount.toLocaleString()}</td>
                    <td className={`num ${r.delta > 0 ? 'diff-positive' : r.delta < 0 ? 'diff-negative' : ''}`}>
                      {r.delta === 0 ? '-' : (r.delta > 0 ? '+' : '') + r.delta.toLocaleString()}
                    </td>
                    <td className="num">
                      {r.tmsAmount === 0 || r.delta === 0 ? '-' : `${((r.delta / r.tmsAmount) * 100).toFixed(1)}%`}
                    </td>
                    <td><StatusTag s={r.status} /></td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={8} className="empty">All items matched 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DiffView;
