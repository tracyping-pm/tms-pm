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

function computeStatus(tmsAmount: number, vendorAmount: number, originalStatus: DiffRow['status']): DiffRow['status'] {
  if (originalStatus === 'Missing on TMS' || originalStatus === 'Missing on Vendor') {
    return originalStatus;
  }
  if (vendorAmount <= tmsAmount) {
    return 'Matched';
  }
  return 'Discrepancy';
}

export const DIFF_ROWS: DiffRow[] = [
  // WB2604001 — All matched
  { id: '1-1', waybill: 'WB2604001', item: 'Basic', tmsAmount: 15000, vendorAmount: 15000, delta: 0, status: 'Matched' },
  { id: '1-2', waybill: 'WB2604001', item: 'Additional Charge', tmsAmount: 500, vendorAmount: 500, delta: 0, status: 'Matched' },
  { id: '1-3', waybill: 'WB2604001', item: 'Exception Fee', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },

  // WB2604002 — Discrepancy on Basic & Exception Fee
  { id: '2-1', waybill: 'WB2604002', item: 'Basic', tmsAmount: 9500, vendorAmount: 11200, delta: 1700, status: computeStatus(9500, 11200, 'Discrepancy') },
  { id: '2-2', waybill: 'WB2604002', item: 'Additional Charge', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },
  { id: '2-3', waybill: 'WB2604002', item: 'Exception Fee', tmsAmount: 800, vendorAmount: 800, delta: 0, status: 'Matched' },

  // WB2604003 — Discrepancy on Basic & Additional Charge
  { id: '3-1', waybill: 'WB2604003', item: 'Basic', tmsAmount: 16800, vendorAmount: 18500, delta: 1700, status: computeStatus(16800, 18500, 'Discrepancy') },
  { id: '3-2', waybill: 'WB2604003', item: 'Additional Charge', tmsAmount: 1200, vendorAmount: 1800, delta: 600, status: computeStatus(1200, 1800, 'Discrepancy') },
  { id: '3-3', waybill: 'WB2604003', item: 'Exception Fee', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },

  // WB2604004 — All matched
  { id: '4-1', waybill: 'WB2604004', item: 'Basic', tmsAmount: 7800, vendorAmount: 7800, delta: 0, status: 'Matched' },
  { id: '4-2', waybill: 'WB2604004', item: 'Additional Charge', tmsAmount: 300, vendorAmount: 300, delta: 0, status: 'Matched' },
  { id: '4-3', waybill: 'WB2604004', item: 'Exception Fee', tmsAmount: 500, vendorAmount: 500, delta: 0, status: 'Matched' },

  // WB2604005 — All matched
  { id: '5-1', waybill: 'WB2604005', item: 'Basic', tmsAmount: 14200, vendorAmount: 14200, delta: 0, status: 'Matched' },
  { id: '5-2', waybill: 'WB2604005', item: 'Additional Charge', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },
  { id: '5-3', waybill: 'WB2604005', item: 'Exception Fee', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },

  // WB2604006 — All matched
  { id: '6-1', waybill: 'WB2604006', item: 'Basic', tmsAmount: 15500, vendorAmount: 15500, delta: 0, status: 'Matched' },
  { id: '6-2', waybill: 'WB2604006', item: 'Additional Charge', tmsAmount: 800, vendorAmount: 800, delta: 0, status: 'Matched' },
  { id: '6-3', waybill: 'WB2604006', item: 'Exception Fee', tmsAmount: 0, vendorAmount: 0, delta: 0, status: 'Matched' },
];

function StatusTag({ s }: { s: DiffRow['status'] }) {
  if (s === 'Matched') return <span className="tag tag-matched">Matched</span>;
  if (s === 'Discrepancy') return <span className="tag tag-discrepancy-pending">Discrepancy</span>;
  if (s === 'Missing on TMS') return <span className="tag tag-discrepancy-pending">Missing on TMS</span>;
  return <span className="tag tag-not-reconciled">Missing on Vendor</span>;
}

function waybillStatus(rows: DiffRow[]): DiffRow['status'] {
  if (rows.every(r => r.status === 'Matched')) return 'Matched';
  if (rows.some(r => r.status !== 'Matched')) return 'Discrepancy';
  return 'Matched';
}

type SelectionMode = 'idle' | 'settlement' | 'modification';

function DiffView({ onBack, onRaiseModification, onCreateSettlement, focusWaybill, settledWaybills = {} }: Props) {
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 默认展开存在差异的 waybill
    const diffWbs = Array.from(new Set(DIFF_ROWS.filter(r => r.status !== 'Matched').map(r => r.waybill)));
    return new Set(focusWaybill ? [focusWaybill] : diffWbs);
  });

  // 按 waybill 分组
  const groups = useMemo(() => {
    const rowsBase = focusWaybill ? DIFF_ROWS.filter(r => r.waybill === focusWaybill) : DIFF_ROWS;
    const byWb = new Map<string, DiffRow[]>();
    rowsBase.forEach(r => {
      if (!byWb.has(r.waybill)) byWb.set(r.waybill, []);
      byWb.get(r.waybill)!.push(r);
    });
    let arr = Array.from(byWb.entries()).map(([wb, rows]) => ({ wb, rows }));
    if (showOnlyDiff) arr = arr.filter(g => g.rows.some(r => r.status !== 'Matched'));
    return arr;
  }, [showOnlyDiff, focusWaybill]);

  const selectedRows = DIFF_ROWS.filter(r => selected.has(r.id));
  const allMatched = selectedRows.length > 0 && selectedRows.every(r => r.status === 'Matched');
  const allDiscrepancy = selectedRows.length > 0 && selectedRows.every(r => r.status !== 'Matched');

  const mode: SelectionMode = selected.size === 0
    ? 'idle'
    : allMatched ? 'settlement' : allDiscrepancy ? 'modification' : 'idle';

  const discrepancyCount = DIFF_ROWS.filter(r => r.status === 'Discrepancy').length;
  const totalDelta = DIFF_ROWS.filter(r => r.status !== 'Matched').reduce((a, r) => a + r.delta, 0);

  const isRowSettled = (wb: string) => !!settledWaybills[wb];

  const toggleRow = (id: string) => {
    const row = DIFF_ROWS.find(r => r.id === id);
    if (!row || isRowSettled(row.waybill)) return;
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const toggleExpand = (wb: string) => {
    const n = new Set(expanded);
    if (n.has(wb)) n.delete(wb); else n.add(wb);
    setExpanded(n);
  };

  const toggleGroup = (wb: string) => {
    if (isRowSettled(wb)) return;
    const ids = DIFF_ROWS.filter(r => r.waybill === wb).map(r => r.id);
    const allOn = ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
  };

  const toggleAllMatched = () => {
    const ids = DIFF_ROWS.filter(r => r.status === 'Matched' && !isRowSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
  };

  const toggleAllDiff = () => {
    const ids = DIFF_ROWS.filter(r => r.status !== 'Matched' && !isRowSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
  };

  const expandAll = () => setExpanded(new Set(groups.map(g => g.wb)));
  const collapseAll = () => setExpanded(new Set());

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
        <div className="vp-kpi"><div className="vp-kpi-label">Total Waybills</div><div className="vp-kpi-value">{new Set(DIFF_ROWS.map(r => r.waybill)).size}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Matched Items</div><div className="vp-kpi-value green">{DIFF_ROWS.filter(r => r.status === 'Matched').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Discrepancy Items</div><div className="vp-kpi-value red">{discrepancyCount}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Total Discrepancy</div><div className="vp-kpi-value orange">{totalDelta >= 0 ? '+' : ''}{totalDelta.toLocaleString()}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Price Reconciliation {focusWaybill ? `· ${focusWaybill}` : ''}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={showOnlyDiff} onChange={(e) => setShowOnlyDiff(e.target.checked)} /> Show discrepancies only
            </label>
            <button className="btn-default" onClick={expandAll}>Expand All</button>
            <button className="btn-default" onClick={collapseAll}>Collapse All</button>
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
            按运单分组展示每项 Billing Item 差值。点击行头可展开/折叠。勾选 <strong>Matched</strong> 行直接发起结算，勾选 <strong>Discrepancy / Missing</strong> 行发起价格修改，两类不可混选。
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
                <th style={{ width: 28 }}>&nbsp;</th>
                <th style={{ width: 32 }}>&nbsp;</th>
                <th>Waybill / Settlement Item</th>
                <th className="num">TMS Amount</th>
                <th className="num">Your Amount</th>
                <th className="num">Discrepancy</th>
                <th className="num">Discrepancy %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ wb, rows }) => {
                const settled = isRowSettled(wb);
                const isOpen = expanded.has(wb);
                const wbTms = rows.reduce((a, r) => a + r.tmsAmount, 0);
                const wbVendor = rows.reduce((a, r) => a + r.vendorAmount, 0);
                const wbDelta = wbVendor - wbTms;
                const wbStatus = waybillStatus(rows);
                const ids = rows.map(r => r.id);
                const groupSelected = ids.every(id => selected.has(id));
                const groupPartial = ids.some(id => selected.has(id)) && !groupSelected;

                const visibleRows = showOnlyDiff ? rows.filter(r => r.status !== 'Matched') : rows;

                return (
                  <React.Fragment key={wb}>
                    <tr
                      style={{
                        background: settled ? '#fafafa' : '#f7fbff',
                        opacity: settled ? 0.55 : 1,
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                      onClick={() => toggleExpand(wb)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        {settled ? (
                          <span style={{ color: '#ccc' }} title={`已加入 ${settledWaybills[wb]}`}>⊘</span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={groupSelected}
                            ref={(el) => { if (el) (el as HTMLInputElement).indeterminate = groupPartial; }}
                            onChange={() => toggleGroup(wb)}
                          />
                        )}
                      </td>
                      <td style={{ color: '#999' }}>{isOpen ? '▾' : '▸'}</td>
                      <td>
                        <strong>{wb}</strong>
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#999', fontWeight: 400 }}>
                          {rows.length} items · {rows.filter(r => r.status !== 'Matched').length} diff
                        </span>
                        {settled && <span className="tag tag-settlement-pending" style={{ marginLeft: 8 }}>Settlement Pending</span>}
                      </td>
                      <td className="num tms-amt">{wbTms.toLocaleString()}</td>
                      <td className="num vendor-amt">{wbVendor.toLocaleString()}</td>
                      <td className={`num ${wbDelta > 0 ? 'diff-positive' : wbDelta < 0 ? 'diff-negative' : ''}`}>
                        {wbDelta === 0 ? '-' : (wbDelta > 0 ? '+' : '') + wbDelta.toLocaleString()}
                      </td>
                      <td className="num">
                        {wbTms === 0 || wbDelta === 0 ? '-' : `${((wbDelta / wbTms) * 100).toFixed(1)}%`}
                      </td>
                      <td><StatusTag s={wbStatus} /></td>
                    </tr>

                    {isOpen && visibleRows.map((r) => {
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
                              <span style={{ color: '#ccc' }}>⊘</span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selected.has(r.id)}
                                disabled={selected.size > 0 && !compatible}
                                onChange={() => toggleRow(r.id)}
                              />
                            )}
                          </td>
                          <td></td>
                          <td style={{ paddingLeft: 36, fontSize: 12, color: '#666' }}>↳ {r.item}</td>
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
                  </React.Fragment>
                );
              })}
              {groups.length === 0 && <tr><td colSpan={8} className="empty">All items matched 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DiffView;
