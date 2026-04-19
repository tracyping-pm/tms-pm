import React, { useMemo, useState } from 'react';

import { DIFF_ROWS, type DiffRow } from './DiffView';

interface Props {
  onImport: () => void;
  onRaiseModification: (rows: DiffRow[]) => void;
  onCreateSettlement: (rows: DiffRow[]) => void;
  settledWaybills?: Record<string, string>;
}

interface Row {
  no: string;
  positionTime: string;
  delivery: string;
  origin: string;
  destination: string;
  truckType: string;
  paidAdvance: number;
  basic: number;
  additional: number;
  exception: number;
  claim: number;
  status: 'Not Reconciled' | 'Matched' | 'Discrepancy Pending' | 'Discrepancy Resolved';
}

const SAMPLE: Row[] = [
  { no: 'WB2604001', positionTime: '2026-04-01 09:20', delivery: '2026-04-02 14:30', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', truckType: '10W Wing Van', paidAdvance: 0, basic: 15000, additional: 500, exception: 0, claim: 0, status: 'Matched' },
  { no: 'WB2604002', positionTime: '2026-04-02 07:10', delivery: '2026-04-03 18:00', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Laguna-Calamba / Plant 2', truckType: '6W Fwd', paidAdvance: 2000, basic: 9500, additional: 0, exception: 800, claim: 0, status: 'Discrepancy Pending' },
  { no: 'WB2604003', positionTime: '2026-04-03 10:00', delivery: '2026-04-04 12:00', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Batangas / Lima', truckType: '10W Wing Van', paidAdvance: 0, basic: 16800, additional: 1200, exception: 0, claim: 0, status: 'Not Reconciled' },
  { no: 'WB2604004', positionTime: '2026-04-04 11:00', delivery: '2026-04-05 16:00', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', truckType: '6W Fwd', paidAdvance: 0, basic: 7800, additional: 300, exception: 0, claim: 500, status: 'Discrepancy Resolved' },
  { no: 'WB2604005', positionTime: '2026-04-05 08:30', delivery: '2026-04-06 10:30', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Quezon City', truckType: '10W Wing Van', paidAdvance: 0, basic: 14200, additional: 0, exception: 0, claim: 0, status: 'Not Reconciled' },
  { no: 'WB2604006', positionTime: '2026-04-06 13:00', delivery: '2026-04-07 08:00', origin: 'PH-Batangas / Lima', destination: 'PH-Cavite-Imus / DC', truckType: '10W Wing Van', paidAdvance: 0, basic: 15500, additional: 800, exception: 0, claim: 0, status: 'Matched' },
];

function StatusTag({ status }: { status: Row['status'] }) {
  const map: Record<Row['status'], string> = {
    'Matched': 'tag-matched',
    'Discrepancy Pending': 'tag-discrepancy-pending',
    'Discrepancy Resolved': 'tag-discrepancy-resolved',
    'Not Reconciled': 'tag-not-reconciled',
  };
  return <span className={`tag ${map[status]}`}>{status}</span>;
}

function DiffStatusTag({ s }: { s: DiffRow['status'] }) {
  if (s === 'Matched') return <span className="tag tag-matched">Matched</span>;
  if (s === 'Discrepancy') return <span className="tag tag-discrepancy-pending">Discrepancy</span>;
  if (s === 'Missing on TMS') return <span className="tag tag-discrepancy-pending">Missing on TMS</span>;
  return <span className="tag tag-not-reconciled">Missing on Vendor</span>;
}

type SelectionMode = 'idle' | 'settlement' | 'modification';

function WaybillReconciliationList({ onImport, onRaiseModification, onCreateSettlement, settledWaybills = {} }: Props) {
  const [status, setStatus] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = status === 'all' ? SAMPLE : SAMPLE.filter(r => r.status === status);
  const isSettled = (no: string) => !!settledWaybills[no];

  const diffByWaybill = useMemo(() => {
    const m = new Map<string, DiffRow[]>();
    DIFF_ROWS.forEach(r => {
      if (!m.has(r.waybill)) m.set(r.waybill, []);
      m.get(r.waybill)!.push(r);
    });
    return m;
  }, []);

  const selectedRows = DIFF_ROWS.filter(r => selected.has(r.id));
  const allMatched = selectedRows.length > 0 && selectedRows.every(r => r.status === 'Matched');
  const allDiscrepancy = selectedRows.length > 0 && selectedRows.every(r => r.status !== 'Matched');
  const mode: SelectionMode = selected.size === 0
    ? 'idle'
    : allMatched ? 'settlement' : allDiscrepancy ? 'modification' : 'idle';

  const counts = {
    total: SAMPLE.length,
    pending: SAMPLE.filter(r => r.status === 'Discrepancy Pending').length,
    matched: SAMPLE.filter(r => r.status === 'Matched').length,
    notReconciled: SAMPLE.filter(r => r.status === 'Not Reconciled').length,
  };

  const toggleExpand = (wb: string) => {
    const n = new Set(expanded);
    if (n.has(wb)) n.delete(wb); else n.add(wb);
    setExpanded(n);
  };

  const toggleDiffRow = (id: string) => {
    const row = DIFF_ROWS.find(r => r.id === id);
    if (!row || isSettled(row.waybill)) return;
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const toggleWaybillGroup = (wb: string) => {
    if (isSettled(wb)) return;
    const ids = (diffByWaybill.get(wb) || []).map(r => r.id);
    if (ids.length === 0) return;
    const allOn = ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
  };

  const autoExpandWaybillsWithSelection = (ids: string[]) => {
    const wbs = new Set(DIFF_ROWS.filter(r => ids.includes(r.id)).map(r => r.waybill));
    const n = new Set(expanded);
    wbs.forEach(wb => n.add(wb));
    setExpanded(n);
  };

  const selectAllMatched = () => {
    const ids = DIFF_ROWS.filter(r => r.status === 'Matched' && !isSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
    if (!allOn) autoExpandWaybillsWithSelection(ids);
  };

  const selectAllDiscrepancies = () => {
    const ids = DIFF_ROWS.filter(r => r.status !== 'Matched' && !isSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
    if (!allOn) autoExpandWaybillsWithSelection(ids);
  };

  const isRowCompatible = (r: DiffRow): boolean => {
    if (selected.size === 0) return true;
    if (mode === 'settlement') return r.status === 'Matched';
    if (mode === 'modification') return r.status !== 'Matched';
    return true;
  };

  return (
    <>
      <div className="vp-kpi-row">
        <div className="vp-kpi"><div className="vp-kpi-label">Total Waybills</div><div className="vp-kpi-value">{counts.total}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Not Reconciled</div><div className="vp-kpi-value orange">{counts.notReconciled}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Discrepancy Pending</div><div className="vp-kpi-value red">{counts.pending}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Matched</div><div className="vp-kpi-value green">{counts.matched}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">My Waybills for Reconciliation</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onImport}>
              <span style={{ marginRight: 6 }}>↑</span>Import Sheet
            </button>
          </div>
        </div>

        <div className="alert alert-info">
          <span>ⓘ</span>
          展开每条运单即可查看 TMS 金额与您上传金额的逐项对账。勾选 <strong>Matched</strong> 明细直接发起结算，勾选 <strong>Discrepancy / Missing</strong> 明细发起价格修改，两类不可混选。
        </div>

        <div className="filter-row">
          <input className="filter-input" placeholder="Waybill No." />
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Not Reconciled">Not Reconciled</option>
            <option value="Matched">Matched</option>
            <option value="Discrepancy Pending">Discrepancy Pending</option>
            <option value="Discrepancy Resolved">Discrepancy Resolved</option>
          </select>
          <select className="filter-select">
            <option>Financial Status: All</option>
            <option>Awaiting Price Verification</option>
            <option>Awaiting Settlement</option>
          </select>
          <input className="filter-input" placeholder="Position Time: YYYY-MM-DD" />
          <button className="btn-default">Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="btn-default" onClick={selectAllMatched}>Select All Matched</button>
          <button className="btn-default" onClick={selectAllDiscrepancies}>Select All Discrepancies</button>
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
          {selected.size > 0 && (
            <button className="btn-link" onClick={() => setSelected(new Set())}>Clear selection</button>
          )}
        </div>

        {mode === 'settlement' && (
          <div className="alert alert-success" style={{ background: '#f6ffed' }}>
            <span>✓</span>
            <strong>Settlement Mode</strong> — 已选 {selected.size} 行 Matched 明细，可直接发起结算。
          </div>
        )}
        {mode === 'modification' && (
          <div className="alert alert-warn">
            <span>⚠</span>
            <strong>Modification Mode</strong> — 已选 {selected.size} 行 Discrepancy / Missing 明细，可发起价格修改。
          </div>
        )}

        <div style={{ overflow: 'auto' }}>
          <table className="data-table recon-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>&nbsp;</th>
                <th style={{ width: 28 }}>&nbsp;</th>
                <th style={{ width: 140 }}>Waybill No.</th>
                <th style={{ width: 130 }}>Position Time</th>
                <th style={{ width: 110 }}>Truck Type</th>
                <th>Origin → Destination</th>
                <th className="num" style={{ width: 110 }}>TMS Amount</th>
                <th className="num" style={{ width: 110 }}>Your Amount</th>
                <th className="num" style={{ width: 90 }}>Delta</th>
                <th style={{ width: 150 }}>Reconciliation Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const settled = isSettled(r.no);
                const diffRows = diffByWaybill.get(r.no) || [];
                const hasDiffData = diffRows.length > 0;
                const isOpen = expanded.has(r.no);
                const ids = diffRows.map(d => d.id);
                const groupSelected = ids.length > 0 && ids.every(id => selected.has(id));
                const groupPartial = ids.some(id => selected.has(id)) && !groupSelected;
                const groupSelectedCount = ids.filter(id => selected.has(id)).length;

                const wbTms = diffRows.reduce((a, d) => a + d.tmsAmount, 0);
                const wbVendor = diffRows.reduce((a, d) => a + d.vendorAmount, 0);
                const wbDelta = wbVendor - wbTms;
                const diffCount = diffRows.filter(d => d.status !== 'Matched').length;

                return (
                  <React.Fragment key={r.no}>
                    <tr
                      style={{
                        opacity: settled ? 0.55 : 1,
                        background: settled ? '#fafafa' : isOpen ? '#f7fbff' : undefined,
                        cursor: hasDiffData ? 'pointer' : 'default',
                        fontWeight: 500,
                      }}
                      onClick={() => hasDiffData && toggleExpand(r.no)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        {settled || !hasDiffData ? (
                          <span style={{ color: '#ccc' }} title={settled ? `已加入 ${settledWaybills[r.no]}` : '暂无对账数据'}>⊘</span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={groupSelected}
                            ref={(el) => { if (el) (el as HTMLInputElement).indeterminate = groupPartial; }}
                            onChange={() => toggleWaybillGroup(r.no)}
                          />
                        )}
                      </td>
                      <td style={{ color: '#999' }}>{hasDiffData ? (isOpen ? '▾' : '▸') : ''}</td>
                      <td>
                        <strong>{r.no}</strong>
                        {hasDiffData && (
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2, fontWeight: 400 }}>
                            {diffRows.length} items · {diffCount} diff
                            {groupSelectedCount > 0 && <span style={{ color: '#1890ff', marginLeft: 4 }}>· {groupSelectedCount} selected</span>}
                          </div>
                        )}
                        {settled && (
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2, fontWeight: 400 }}>
                            已加入 <strong>{settledWaybills[r.no]}</strong>
                          </div>
                        )}
                      </td>
                      <td>{r.positionTime}</td>
                      <td>{r.truckType}</td>
                      <td style={{ fontSize: 12 }}>{r.origin}<br/>→ {r.destination}</td>
                      <td className="num tms-amt">{hasDiffData ? wbTms.toLocaleString() : '-'}</td>
                      <td className="num vendor-amt">{hasDiffData ? wbVendor.toLocaleString() : '-'}</td>
                      <td className={`num ${wbDelta > 0 ? 'diff-positive' : wbDelta < 0 ? 'diff-negative' : ''}`}>
                        {!hasDiffData || wbDelta === 0 ? '-' : (wbDelta > 0 ? '+' : '') + wbDelta.toLocaleString()}
                      </td>
                      <td>
                        {settled
                          ? <span className="tag tag-settlement-pending">Settlement Pending</span>
                          : <StatusTag status={r.status} />}
                      </td>
                    </tr>

                    {hasDiffData && isOpen && (
                      <tr className="recon-expand-row">
                        <td colSpan={10} style={{ padding: 0, background: '#fafbff' }}>
                          <div className="recon-breakdown">
                            <div className="recon-breakdown-title">
                              Billing Breakdown · <strong>{diffRows.length}</strong> items
                              {diffCount > 0 && <span style={{ color: '#cf1322', marginLeft: 6 }}>· {diffCount} discrepancy</span>}
                              {diffCount === 0 && <span style={{ color: '#389e0d', marginLeft: 6 }}>· all matched</span>}
                            </div>

                            <div
                              className="recon-breakdown-grid"
                              style={{ gridTemplateColumns: `repeat(${diffRows.length}, minmax(170px, 1fr))` }}
                            >
                              {diffRows.map((d) => {
                                const compatible = isRowCompatible(d);
                                const disabled = settled || (selected.size > 0 && !compatible);
                                const cls =
                                  `recon-cell recon-cell-head` +
                                  (selected.has(d.id) ? ' is-selected' : '') +
                                  (disabled ? ' is-disabled' : '');
                                return (
                                  <div key={`h-${d.id}`} className={cls}>
                                    {settled ? (
                                      <span style={{ color: '#ccc' }}>⊘</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={selected.has(d.id)}
                                        disabled={selected.size > 0 && !compatible}
                                        onChange={() => toggleDiffRow(d.id)}
                                      />
                                    )}
                                    <span className="recon-cell-item" title={d.item}>{d.item}</span>
                                  </div>
                                );
                              })}

                              {diffRows.map((d) => (
                                <div key={`a-${d.id}`} className="recon-cell recon-cell-amount">
                                  <div className="recon-amount-line">
                                    <span className="recon-amount-label">TMS</span>
                                    <span className="tms-amt">{d.tmsAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="recon-amount-line">
                                    <span className="recon-amount-label">You</span>
                                    <span className="vendor-amt">{d.vendorAmount.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}

                              {diffRows.map((d) => (
                                <div key={`d-${d.id}`} className="recon-cell recon-cell-delta">
                                  <span className={`recon-delta ${d.delta > 0 ? 'diff-positive' : d.delta < 0 ? 'diff-negative' : ''}`}>
                                    {d.delta === 0 ? '—' : (d.delta > 0 ? '+' : '') + d.delta.toLocaleString()}
                                  </span>
                                  <DiffStatusTag s={d.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="empty">No waybills match the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">&gt;</button>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>Total {filtered.length} · 20/page</span>
        </div>
      </div>
    </>
  );
}

export default WaybillReconciliationList;
