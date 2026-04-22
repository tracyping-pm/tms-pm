import React, { useMemo, useState } from 'react';

import { DIFF_ROWS, type DiffRow } from './DiffView';

interface Props {
  onImport: () => void;
  onRaiseModification: (rows: DiffRow[]) => void;
  onCreateSettlement: (rows: DiffRow[], notReconciledWaybills?: string[]) => void;
  settledWaybills?: Record<string, string>;
}

interface Row {
  no: string;
  positionTime: string;
  unloadingTime: string;
  delivery: string;
  origin: string;
  destination: string;
  truckType: string;
  basic: number;
  additional: number;
  exception: number;
}

const SAMPLE: Row[] = [
  { no: 'WB2604001', positionTime: '2026-04-01 09:20', unloadingTime: '2026-04-02 15:10', delivery: '2026-04-02 14:30', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', truckType: '10W Wing Van', basic: 15000, additional: 500, exception: 0 },
  { no: 'WB2604002', positionTime: '2026-04-02 07:10', unloadingTime: '2026-04-03 19:30', delivery: '2026-04-03 18:00', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Laguna-Calamba / Plant 2', truckType: '6W Fwd', basic: 9500, additional: 0, exception: 800 },
  { no: 'WB2604003', positionTime: '2026-04-03 10:00', unloadingTime: '2026-04-04 13:20', delivery: '2026-04-04 12:00', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Batangas / Lima', truckType: '10W Wing Van', basic: 16800, additional: 1200, exception: 0 },
  { no: 'WB2604004', positionTime: '2026-04-04 11:00', unloadingTime: '2026-04-05 17:30', delivery: '2026-04-05 16:00', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', truckType: '6W Fwd', basic: 7800, additional: 300, exception: 500 },
  { no: 'WB2604005', positionTime: '2026-04-05 08:30', unloadingTime: '2026-04-06 11:45', delivery: '2026-04-06 10:30', origin: 'PH-Laguna-Calamba', destination: 'PH-NCR-Quezon City', truckType: '10W Wing Van', basic: 14200, additional: 0, exception: 0 },
  { no: 'WB2604006', positionTime: '2026-04-06 13:00', unloadingTime: '2026-04-07 09:15', delivery: '2026-04-07 08:00', origin: 'PH-Batangas / Lima', destination: 'PH-Cavite-Imus / DC', truckType: '10W Wing Van', basic: 15500, additional: 800, exception: 0 },
];

type EffectiveStatus = 'Not Reconciled' | 'Matched' | 'Discrepancy Pending' | 'Discrepancy Resolved';

interface ExpandedItem {
  key: string;
  label: string;
  tmsAmount: number;
  status: DiffRow['status'] | 'Not Reconciled';
  diffRowId?: string;
}

function getExpandedItems(r: Row, diffRows: DiffRow[], hasImported: boolean): ExpandedItem[] {
  const cats = [
    { key: `${r.no}-basic`,      label: 'Basic',            sampleAmt: r.basic,      keyword: 'basic' },
    { key: `${r.no}-additional`, label: 'Additional Charge', sampleAmt: r.additional, keyword: 'additional' },
    { key: `${r.no}-exception`,  label: 'Exception Fee',    sampleAmt: r.exception,  keyword: 'exception' },
  ];

  return cats.map(cat => {
    if (!hasImported) {
      return { key: cat.key, label: cat.label, tmsAmount: cat.sampleAmt, status: 'Not Reconciled' as const };
    }
    const dr = diffRows.find(d => d.item.toLowerCase().includes(cat.keyword));
    return {
      key: cat.key,
      label: cat.label,
      tmsAmount: dr?.tmsAmount ?? cat.sampleAmt,
      status: (dr?.status ?? 'Not Reconciled') as DiffRow['status'] | 'Not Reconciled',
      diffRowId: dr?.id,
    };
  });
}

function StatusTag({ status }: { status: EffectiveStatus }) {
  const map: Record<EffectiveStatus, string> = {
    'Matched': 'tag-matched',
    'Discrepancy Pending': 'tag-discrepancy-pending',
    'Discrepancy Resolved': 'tag-discrepancy-resolved',
    'Not Reconciled': 'tag-not-reconciled',
  };
  return <span className={`tag ${map[status]}`}>{status}</span>;
}

function ExpandedStatusTag({ s }: { s: ExpandedItem['status'] }) {
  if (s === 'Matched') return <span className="tag tag-matched">Matched</span>;
  if (s === 'Discrepancy') return <span className="tag tag-discrepancy-pending">Discrepancy</span>;
  if (s === 'Missing on TMS') return <span className="tag tag-discrepancy-pending">Missing on TMS</span>;
  if (s === 'Missing on Vendor') return <span className="tag tag-not-reconciled">Missing on Vendor</span>;
  return <span className="tag tag-not-reconciled">Not Reconciled</span>;
}

type SelectionMode = 'idle' | 'settlement' | 'modification';

function WaybillReconciliationList({ onImport, onRaiseModification, onCreateSettlement, settledWaybills = {} }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unloadingTimeFilter, setUnloadingTimeFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedWaybills, setSelectedWaybills] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hasImported, setHasImported] = useState(false);
  const [infoHover, setInfoHover] = useState(false);

  const diffByWaybill = useMemo(() => {
    const m = new Map<string, DiffRow[]>();
    DIFF_ROWS.forEach(r => {
      if (!m.has(r.waybill)) m.set(r.waybill, []);
      m.get(r.waybill)!.push(r);
    });
    return m;
  }, []);

  const getEffectiveStatus = (no: string): EffectiveStatus => {
    if (!hasImported) return 'Not Reconciled';
    const rows = diffByWaybill.get(no) || [];
    if (rows.length === 0) return 'Not Reconciled';
    if (rows.every(d => d.status === 'Matched')) return 'Matched';
    return 'Discrepancy Pending';
  };

  const isSettled = (no: string) => !!settledWaybills[no];

  const filtered = SAMPLE.filter(r => {
    if (statusFilter !== 'all' && getEffectiveStatus(r.no) !== statusFilter) return false;
    if (unloadingTimeFilter && !r.unloadingTime.startsWith(unloadingTimeFilter)) return false;
    return true;
  });

  const selectedDiffRows = DIFF_ROWS.filter(r => selected.has(r.id));
  const nrSelected = selectedWaybills.size > 0;
  const hasAny = selected.size > 0 || nrSelected;
  const allDiffMatched = selectedDiffRows.length === 0 || selectedDiffRows.every(r => r.status === 'Matched');
  const allDiffDiscrepancy = selectedDiffRows.length > 0 && !nrSelected && selectedDiffRows.every(r => r.status !== 'Matched');

  const mode: SelectionMode = !hasAny
    ? 'idle'
    : allDiffDiscrepancy ? 'modification'
    : allDiffMatched ? 'settlement'
    : 'idle';

  const counts = {
    total: SAMPLE.length,
    notReconciled: SAMPLE.filter(r => getEffectiveStatus(r.no) === 'Not Reconciled').length,
    pending: SAMPLE.filter(r => getEffectiveStatus(r.no) === 'Discrepancy Pending').length,
    matched: SAMPLE.filter(r => getEffectiveStatus(r.no) === 'Matched').length,
  };

  const toggleExpand = (wb: string) => {
    const n = new Set(expanded);
    if (n.has(wb)) n.delete(wb); else n.add(wb);
    setExpanded(n);
  };

  const expandAll = () => setExpanded(new Set(filtered.map(r => r.no)));
  const collapseAll = () => setExpanded(new Set());

  const toggleDiffRow = (id: string) => {
    const row = DIFF_ROWS.find(r => r.id === id);
    if (!row || isSettled(row.waybill)) return;
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const toggleWaybillGroup = (wb: string) => {
    if (isSettled(wb)) return;
    const diffRows = diffByWaybill.get(wb) || [];
    if (hasImported && diffRows.length > 0) {
      const ids = diffRows.map(r => r.id);
      const allOn = ids.every(id => selected.has(id));
      const n = new Set(selected);
      if (allOn) ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      setSelected(n);
    } else {
      const n = new Set(selectedWaybills);
      if (n.has(wb)) n.delete(wb); else n.add(wb);
      setSelectedWaybills(n);
    }
  };

  const isAllSelected = filtered.length > 0 && filtered.every(r => {
    if (isSettled(r.no)) return true;
    const diffRows = hasImported ? (diffByWaybill.get(r.no) || []) : [];
    if (hasImported && diffRows.length > 0) return diffRows.every(d => selected.has(d.id));
    return selectedWaybills.has(r.no);
  });

  const isSomeSelected = !isAllSelected && filtered.some(r => {
    if (isSettled(r.no)) return false;
    const diffRows = hasImported ? (diffByWaybill.get(r.no) || []) : [];
    if (hasImported && diffRows.length > 0) return diffRows.some(d => selected.has(d.id));
    return selectedWaybills.has(r.no);
  });

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
      setSelectedWaybills(new Set());
    } else {
      const newSelected = new Set(selected);
      const newSelectedWaybills = new Set(selectedWaybills);
      filtered.forEach(r => {
        if (isSettled(r.no)) return;
        const diffRows = hasImported ? (diffByWaybill.get(r.no) || []) : [];
        if (hasImported && diffRows.length > 0) {
          diffRows.forEach(d => newSelected.add(d.id));
        } else {
          newSelectedWaybills.add(r.no);
        }
      });
      setSelected(newSelected);
      setSelectedWaybills(newSelectedWaybills);
    }
  };

  const selectAllMatched = () => {
    const ids = DIFF_ROWS.filter(r => r.status === 'Matched' && !isSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
    if (!allOn) {
      const wbs = new Set(DIFF_ROWS.filter(r => ids.includes(r.id)).map(r => r.waybill));
      setExpanded(prev => { const e = new Set(prev); wbs.forEach(wb => e.add(wb)); return e; });
    }
  };

  const selectAllDiscrepancies = () => {
    const ids = DIFF_ROWS.filter(r => r.status !== 'Matched' && !isSettled(r.waybill)).map(r => r.id);
    const allOn = ids.length > 0 && ids.every(id => selected.has(id));
    const n = new Set(selected);
    if (allOn) ids.forEach(id => n.delete(id));
    else ids.forEach(id => n.add(id));
    setSelected(n);
    if (!allOn) {
      const wbs = new Set(DIFF_ROWS.filter(r => ids.includes(r.id)).map(r => r.waybill));
      setExpanded(prev => { const e = new Set(prev); wbs.forEach(wb => e.add(wb)); return e; });
    }
  };

  const isItemCompatible = (diffRowId: string | undefined): boolean => {
    if (!diffRowId) return true;
    if (!hasAny) return true;
    const row = DIFF_ROWS.find(r => r.id === diffRowId);
    if (!row) return true;
    if (mode === 'settlement') return row.status === 'Matched';
    if (mode === 'modification') return row.status !== 'Matched';
    return true;
  };

  const clearSelection = () => {
    setSelected(new Set());
    setSelectedWaybills(new Set());
  };

  const handleImport = () => {
    setHasImported(true);
    onImport();
  };

  const handleCreateSettlement = () => {
    const nrWaybills = Array.from(selectedWaybills);
    onCreateSettlement(selectedDiffRows, nrWaybills.length > 0 ? nrWaybills : undefined);
  };

  const kpiStyle: React.CSSProperties = { cursor: 'pointer' };

  return (
    <>
      <div className="vp-kpi-row">
        <div className="vp-kpi" style={kpiStyle} onClick={() => setStatusFilter('all')}>
          <div className="vp-kpi-label">Total Waybills</div>
          <div className="vp-kpi-value">{counts.total}</div>
        </div>
        <div className="vp-kpi" style={kpiStyle} onClick={() => setStatusFilter('Not Reconciled')}>
          <div className="vp-kpi-label">Not Reconciled</div>
          <div className="vp-kpi-value orange">{counts.notReconciled}</div>
        </div>
        <div className="vp-kpi" style={kpiStyle} onClick={() => setStatusFilter('Discrepancy Pending')}>
          <div className="vp-kpi-label">Discrepancy Pending</div>
          <div className="vp-kpi-value red">{counts.pending}</div>
        </div>
        <div className="vp-kpi" style={kpiStyle} onClick={() => setStatusFilter('Matched')}>
          <div className="vp-kpi-label">Matched</div>
          <div className="vp-kpi-value green">{counts.matched}</div>
        </div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="section-title">My Waybills for Reconciliation</div>
            <span
              style={{ position: 'relative', cursor: 'help' }}
              onMouseEnter={() => setInfoHover(true)}
              onMouseLeave={() => setInfoHover(false)}
            >
              <span style={{ color: '#1890ff', fontSize: 13, userSelect: 'none' }}>ⓘ</span>
              {infoHover && (
                <div style={{
                  position: 'absolute', top: 22, left: 0, zIndex: 200, width: 380,
                  background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6,
                  padding: '10px 14px', fontSize: 12, color: '#333', lineHeight: 1.6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                  Expand each waybill to view billing item comparisons. Select <strong>Matched</strong> or <strong>Not Reconciled</strong> rows to create a settlement; select <strong>Discrepancy</strong> rows to raise a price modification. These two modes cannot be mixed.
                </div>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleImport}>
              <span style={{ marginRight: 6 }}>↑</span>Import Sheet
            </button>
          </div>
        </div>

        <div className="filter-row">
          <input className="filter-input" placeholder="Waybill No." />
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Not Reconciled">Not Reconciled</option>
            <option value="Matched">Matched</option>
            <option value="Discrepancy Pending">Discrepancy Pending</option>
          </select>
          <input className="filter-input" placeholder="Position Time: YYYY-MM-DD" />
          <input
            className="filter-input"
            placeholder="Unloading Time: YYYY-MM-DD"
            value={unloadingTimeFilter}
            onChange={(e) => setUnloadingTimeFilter(e.target.value)}
          />
          <button className="btn-default" onClick={() => { setStatusFilter('all'); setUnloadingTimeFilter(''); }}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="btn-default" onClick={expandAll}>Expand All</button>
          <button className="btn-default" onClick={collapseAll}>Collapse All</button>
          {hasImported && (
            <>
              <button className="btn-default" onClick={selectAllMatched}>Select All Matched</button>
              <button className="btn-default" onClick={selectAllDiscrepancies}>Select All Discrepancies</button>
            </>
          )}
          <button
            className="btn-primary"
            disabled={mode !== 'settlement'}
            title={mode === 'settlement' ? '' : 'Select Matched or Not Reconciled rows to create settlement'}
            onClick={handleCreateSettlement}
          >
            Create Settlement ({mode === 'settlement' ? selected.size + selectedWaybills.size : 0})
          </button>
          <button
            className="btn-default"
            style={mode === 'modification' ? { borderColor: '#1890ff', color: '#1890ff' } : {}}
            disabled={mode !== 'modification'}
            title={mode === 'modification' ? '' : 'Select Discrepancy rows to raise modification'}
            onClick={() => onRaiseModification(selectedDiffRows)}
          >
            Raise Modification ({mode === 'modification' ? selected.size : 0})
          </button>
          {hasAny && (
            <button className="btn-link" onClick={clearSelection}>Clear selection</button>
          )}
        </div>

        {mode === 'settlement' && (
          <div className="alert alert-success" style={{ background: '#f6ffed' }}>
            <span>✓</span>
            <strong>Settlement Mode</strong> — {selected.size + selectedWaybills.size} row(s) selected. Click "Create Settlement" to proceed.
          </div>
        )}
        {mode === 'modification' && (
          <div className="alert alert-warn">
            <span>⚠</span>
            <strong>Modification Mode</strong> — {selected.size} discrepancy row(s) selected. Click "Raise Modification" to proceed.
          </div>
        )}

        <div style={{ overflow: 'auto' }}>
          <table className="data-table recon-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => { if (el) (el as HTMLInputElement).indeterminate = isSomeSelected; }}
                    onChange={toggleSelectAll}
                    title="Select / Deselect all visible waybills"
                  />
                </th>
                <th style={{ width: 28 }}>&nbsp;</th>
                <th style={{ width: 140 }}>Waybill No.</th>
                <th style={{ width: 130 }}>Position Time</th>
                <th style={{ width: 130 }}>Unloading Time</th>
                <th style={{ width: 110 }}>Truck Type</th>
                <th>Origin → Destination</th>
                <th className="num" style={{ width: 110 }}>TMS Amount</th>
                <th className="num" style={{ width: 110 }}>Your Amount</th>
                <th className="num" style={{ width: 100 }}>Discrepancy</th>
                <th style={{ width: 160 }}>Reconciliation Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const settled = isSettled(r.no);
                const diffRows = hasImported ? (diffByWaybill.get(r.no) || []) : [];
                const expandedItems = getExpandedItems(r, diffRows, hasImported);
                const effectiveStatus = getEffectiveStatus(r.no);
                const isOpen = expanded.has(r.no);

                const ids = diffRows.map(d => d.id);
                const groupSelected = hasImported && ids.length > 0
                  ? ids.every(id => selected.has(id))
                  : selectedWaybills.has(r.no);
                const groupPartial = hasImported && ids.length > 0
                  ? (ids.some(id => selected.has(id)) && !groupSelected)
                  : false;
                const groupSelectedCount = ids.filter(id => selected.has(id)).length;

                const wbTms = hasImported && diffRows.length > 0
                  ? diffRows.reduce((a, d) => a + d.tmsAmount, 0)
                  : r.basic + r.additional + r.exception;
                const wbVendor = hasImported && diffRows.length > 0
                  ? diffRows.reduce((a, d) => a + d.vendorAmount, 0)
                  : 0;
                const wbDiscrepancy = wbVendor - wbTms;
                const discrepancyCount = expandedItems.filter(d =>
                  d.status !== 'Matched' && d.status !== 'Not Reconciled'
                ).length;

                return (
                  <React.Fragment key={r.no}>
                    <tr
                      style={{
                        opacity: settled ? 0.55 : 1,
                        background: settled ? '#fafafa' : isOpen ? '#f7fbff' : undefined,
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                      onClick={() => toggleExpand(r.no)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        {settled ? (
                          <span style={{ color: '#ccc' }} title={`Added to ${settledWaybills[r.no]}`}>⊘</span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={groupSelected}
                            ref={(el) => { if (el) (el as HTMLInputElement).indeterminate = groupPartial; }}
                            onChange={() => toggleWaybillGroup(r.no)}
                          />
                        )}
                      </td>
                      <td style={{ color: '#999' }}>{isOpen ? '▾' : '▸'}</td>
                      <td>
                        <strong>{r.no}</strong>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2, fontWeight: 400 }}>
                          3 items
                          {hasImported && discrepancyCount > 0 && (
                            <span style={{ color: '#cf1322', marginLeft: 4 }}>· {discrepancyCount} discrepancy</span>
                          )}
                          {groupSelectedCount > 0 && (
                            <span style={{ color: '#1890ff', marginLeft: 4 }}>· {groupSelectedCount} selected</span>
                          )}
                        </div>
                        {settled && (
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2, fontWeight: 400 }}>
                            Added to <strong>{settledWaybills[r.no]}</strong>
                          </div>
                        )}
                      </td>
                      <td>{r.positionTime}</td>
                      <td>{r.unloadingTime}</td>
                      <td>{r.truckType}</td>
                      <td style={{ fontSize: 12 }}>{r.origin}<br />→ {r.destination}</td>
                      <td className="num tms-amt">{wbTms.toLocaleString()}</td>
                      <td className="num vendor-amt">-</td>
                      <td className={`num ${wbDiscrepancy > 0 ? 'diff-positive' : wbDiscrepancy < 0 ? 'diff-negative' : ''}`}>
                        {!hasImported || wbDiscrepancy === 0 ? '-' : (wbDiscrepancy > 0 ? '+' : '') + wbDiscrepancy.toLocaleString()}
                      </td>
                      <td>
                        {settled
                          ? <span className="tag tag-settlement-pending">Settlement Pending</span>
                          : <StatusTag status={effectiveStatus} />}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="recon-expand-row">
                        <td colSpan={11} style={{ padding: 0, background: '#fafbff' }}>
                          <div className="recon-breakdown">
                            <div className="recon-breakdown-title">
                              Billing Breakdown · <strong>3</strong> items
                              {hasImported && discrepancyCount > 0 && (
                                <span style={{ color: '#cf1322', marginLeft: 6 }}>· {discrepancyCount} discrepancy</span>
                              )}
                              {hasImported && discrepancyCount === 0 && (
                                <span style={{ color: '#389e0d', marginLeft: 6 }}>· all matched</span>
                              )}
                            </div>

                            <div
                              className="recon-breakdown-grid"
                              style={{ gridTemplateColumns: 'repeat(3, minmax(170px, 1fr))' }}
                            >
                              {/* Row 1: item labels + checkboxes */}
                              {expandedItems.map((item) => {
                                const compatible = isItemCompatible(item.diffRowId);
                                const isSelected = item.diffRowId ? selected.has(item.diffRowId) : false;
                                const isDisabled = settled || (hasAny && !compatible) || !item.diffRowId || !hasImported;
                                const cls =
                                  `recon-cell recon-cell-head` +
                                  (isSelected ? ' is-selected' : '') +
                                  (isDisabled ? ' is-disabled' : '');
                                return (
                                  <div key={`h-${item.key}`} className={cls}>
                                    {settled ? (
                                      <span style={{ color: '#ccc' }}>⊘</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onChange={() => item.diffRowId && toggleDiffRow(item.diffRowId)}
                                      />
                                    )}
                                    <span className="recon-cell-item">{item.label}</span>
                                  </div>
                                );
                              })}

                              {/* Row 2: amounts */}
                              {expandedItems.map((item) => (
                                <div key={`a-${item.key}`} className="recon-cell recon-cell-amount">
                                  <div className="recon-amount-line">
                                    <span className="recon-amount-label">TMS</span>
                                    <span className="tms-amt">
                                      {item.tmsAmount > 0 ? item.tmsAmount.toLocaleString() : '-'}
                                    </span>
                                  </div>
                                  <div className="recon-amount-line">
                                    <span className="recon-amount-label">You</span>
                                    <span className="vendor-amt">-</span>
                                  </div>
                                </div>
                              ))}

                              {/* Row 3: discrepancy status */}
                              {expandedItems.map((item) => {
                                const dr = item.diffRowId ? DIFF_ROWS.find(d => d.id === item.diffRowId) : undefined;
                                const discrepancy = dr ? dr.vendorAmount - dr.tmsAmount : 0;
                                return (
                                  <div key={`d-${item.key}`} className="recon-cell recon-cell-delta">
                                    <span className={`recon-delta ${discrepancy > 0 ? 'diff-positive' : discrepancy < 0 ? 'diff-negative' : ''}`}>
                                      {!hasImported || discrepancy === 0 ? '—' : (discrepancy > 0 ? '+' : '') + discrepancy.toLocaleString()}
                                    </span>
                                    <ExpandedStatusTag s={item.status} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="empty">No waybills match the current filter.</td></tr>
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
