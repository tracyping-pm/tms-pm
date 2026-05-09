import React, { useMemo, useState } from 'react';
import { getAllApplications } from '../../../common/prepaidApplicationSync';
import {
  type Waybill,
  type WaybillStatus,
  buildEffectiveWaybills,
  deriveWaybillStatus,
} from '../data/waybills';

export type CreateMode = 'system-price' | 'upload';

interface Props {
  onGenerateStatement: (waybillNos: string[], mode: CreateMode) => void;
  pendingWaybills?: string[];
  /** Sync overrides — lifted to parent so other views see the same prices. */
  syncedOverrides: Record<string, Partial<Waybill>>;
  onApplySyncOverrides: () => void;
}

const TRUCK_TYPES = ['4-Wheeler', '6-Wheeler', '10-Wheeler'];
const ALL_STATUSES: WaybillStatus[] = ['Pending', 'Billable', 'Statement Pending', 'Settled'];

const SHEET_URL = 'https://docs.google.com/spreadsheets/u/2/d/1iDas0CR5--hfrgfVVmGK6_mTOQace_LmG2Yp3KBpB6A/edit?pli=1&gid=0#gid=0';

const STATUS_STYLE: Record<WaybillStatus, React.CSSProperties> = {
  'Pending': { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Billable':                 { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  'Statement Pending':        { background: '#f5f5f5', color: '#888',    border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Settled':                  { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const STATUS_STAT_COLOR: Record<WaybillStatus, { bg: string; color: string; border: string }> = {
  'Pending': { bg: '#fffbe6', color: '#d48806', border: '#ffe58f' },
  'Billable':                 { bg: '#f0fcf4', color: '#00b96b', border: '#87e8a3' },
  'Statement Pending':        { bg: '#f5f5f5', color: '#595959', border: '#e0e0e0' },
  'Settled':                  { bg: '#e6f4ff', color: '#0958d9', border: '#91caff' },
};

function fmtAmt(v: number | null): React.ReactNode {
  if (v === null) return <span style={{ color: '#bbb' }}>—</span>;
  return v.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function UnbilledWaybillsList({ onGenerateStatement, pendingWaybills = [], syncedOverrides, onApplySyncOverrides }: Props) {
  const [filterNo, setFilterNo] = useState('');
  const [filterUnloadTime, setFilterUnloadTime] = useState('');
  const [filterTruckType, setFilterTruckType] = useState('');
  // Multi-select status filter: Settled unchecked by default
  const [filterStatuses, setFilterStatuses] = useState<Set<WaybillStatus>>(
    new Set(['Pending', 'Billable', 'Statement Pending'])
  );
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [syncToast, setSyncToast] = useState(false);

  // Read prepaid amounts from submitted applications
  const prepaidAmountMap = useMemo(() => {
    const map: Record<string, number> = {};
    const apps = getAllApplications().filter(a => a.status !== 'Draft');
    for (const app of apps) {
      for (const wb of app.waybills) {
        if (wb.prePaidAmount > 0) {
          map[wb.no] = (map[wb.no] || 0) + wb.prePaidAmount;
        }
      }
    }
    return map;
  }, [syncState]);

  // Build current effective list using shared helper.
  const waybills: Waybill[] = buildEffectiveWaybills(syncedOverrides, prepaidAmountMap);

  // Derive effective status for each waybill
  const waybillsWithStatus = waybills.map(w => ({
    ...w,
    status: deriveWaybillStatus(w, pendingWaybills),
  }));

  // Counts per status (for stats bar)
  const statusCounts = useMemo(() => {
    const counts: Record<WaybillStatus, number> = {
      'Pending': 0, 'Billable': 0, 'Statement Pending': 0, 'Settled': 0,
    };
    waybillsWithStatus.forEach(w => { counts[w.status]++; });
    return counts;
  }, [waybillsWithStatus]);

  const toggleStatusFilter = (s: WaybillStatus) => {
    setFilterStatuses(prev => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s); else n.add(s);
      return n;
    });
  };

  const filtered = waybillsWithStatus.filter(w => {
    if (!filterStatuses.has(w.status)) return false;
    if (filterNo && !w.no.toLowerCase().includes(filterNo.toLowerCase())) return false;
    if (filterUnloadTime && !w.unloadingTime.includes(filterUnloadTime)) return false;
    if (filterTruckType && w.truckType !== filterTruckType) return false;
    return true;
  });

  const handleReset = () => {
    setFilterNo('');
    setFilterUnloadTime('');
    setFilterTruckType('');
  };

  const handleEditInTemplate = () => {
    window.open(SHEET_URL, '_blank');
  };

  const handleSyncFromSheet = () => {
    setSyncState('syncing');
    setTimeout(() => {
      setSyncState('done');
      onApplySyncOverrides();
      setSyncToast(true);
      setTimeout(() => {
        setSyncState('idle');
        setSyncToast(false);
      }, 3000);
    }, 1400);
  };

  return (
    <div className="vp-card">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="section-title">Billable Waybills</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>
            All waybills of the settleable items.
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ flexShrink: 0 }}
          onClick={() => onGenerateStatement([], 'system-price')}
        >
          + Create Statement
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {ALL_STATUSES.map(s => {
          const c = STATUS_STAT_COLOR[s];
          const active = filterStatuses.has(s);
          return (
            <div
              key={s}
              onClick={() => toggleStatusFilter(s)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${active ? c.border : '#e8e8e8'}`,
                background: active ? c.bg : '#fafafa',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: active ? c.color : '#bbb', lineHeight: 1.2 }}>
                {statusCounts[s]}
              </div>
              <div style={{ fontSize: 11, color: active ? c.color : '#bbb', marginTop: 3, lineHeight: 1.3 }}>
                {s}
              </div>
              {!active && (
                <div style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>click to show</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        <input
          className="filter-input"
          placeholder="Waybill No."
          value={filterNo}
          onChange={e => setFilterNo(e.target.value)}
          style={{ width: 150 }}
        />
        <input
          className="filter-input"
          placeholder="Unloading Time"
          value={filterUnloadTime}
          onChange={e => setFilterUnloadTime(e.target.value)}
          style={{ width: 150 }}
        />
        <select
          className="filter-select"
          value={filterTruckType}
          onChange={e => setFilterTruckType(e.target.value)}
        >
          <option value="">Truck Type</option>
          {TRUCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {/* Status multi-select checkboxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8, flexWrap: 'wrap' }}>
          {ALL_STATUSES.map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', color: '#555', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={filterStatuses.has(s)}
                onChange={() => toggleStatusFilter(s)}
              />
              {s}
            </label>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-default" onClick={handleReset}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>
      </div>

      {/* Upload Own Data panel */}
      <div style={{
        border: '1px solid #e8e8e8', borderRadius: 6, padding: '14px 20px',
        marginBottom: 20, background: '#fafafa',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 4 }}>Upload Own Data</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            If you maintain your own pricing records, Edit in the template, fill in your amounts, then sync.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn-default" style={{ fontSize: 12 }} onClick={handleEditInTemplate}>
            Edit in Template
          </button>
          <button
            style={{
              fontSize: 12, padding: '6px 16px', borderRadius: 4, border: 'none',
              background: syncState === 'done' ? '#52c41a' : '#13c2c2',
              color: '#fff', cursor: syncState !== 'idle' ? 'not-allowed' : 'pointer',
              fontWeight: 500, minWidth: 130, opacity: syncState !== 'idle' ? 0.85 : 1,
              transition: 'background 0.3s',
            }}
            disabled={syncState !== 'idle'}
            onClick={handleSyncFromSheet}
          >
            {syncState === 'idle' && 'Sync from Sheet'}
            {syncState === 'syncing' && '⟳ Syncing…'}
            {syncState === 'done' && '✓ Synced'}
          </button>
        </div>
      </div>

      {/* Sync success banner */}
      {syncToast && (
        <div style={{
          background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6,
          padding: '10px 16px', marginBottom: 16, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#52c41a', fontSize: 16 }}>✓</span>
          <span>Sheet data synced successfully. Waybill amounts updated — status changed to <strong>Billable</strong>.</span>
        </div>
      )}

      {/* Prepaid info tip */}
      {Object.keys(prepaidAmountMap).length > 0 && (
        <div style={{
          background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6,
          padding: '8px 14px', marginBottom: 16, fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8, color: '#0958d9',
        }}>
          <span>ⓘ</span>
          <span>
            Prepaid amounts for <strong>{Object.keys(prepaidAmountMap).length}</strong> waybill(s) populated from submitted PrePaid Applications.
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: 1420 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 96 }}>Waybill No.</th>
              <th style={{ minWidth: 130 }}>Position Time</th>
              <th style={{ minWidth: 130 }}>Unloading Time</th>
              <th style={{ minWidth: 92 }}>Truck Type</th>
              <th style={{ minWidth: 130 }}>Origin</th>
              <th style={{ minWidth: 140 }}>Destination</th>
              <th style={{ textAlign: 'right', minWidth: 108 }}>Waybill Amount</th>
              <th style={{ textAlign: 'right', minWidth: 104 }}>Basic Amount</th>
              <th style={{ textAlign: 'right', minWidth: 108, color: '#0958d9' }}>Prepaid Amount</th>
              <th style={{ textAlign: 'right', minWidth: 112 }}>Additional Charge</th>
              <th style={{ textAlign: 'right', minWidth: 104 }}>Exception Fee</th>
              <th style={{ textAlign: 'right', minWidth: 108 }}>Reimbursement</th>
              <th style={{ minWidth: 140 }}>Status</th>
              <th style={{ minWidth: 124 }}>Creation Time</th>
              <th style={{ minWidth: 80 }}>Operation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const isBillable = w.status === 'Billable';
              const isSettled = w.status === 'Settled';
              const isPending = w.status === 'Statement Pending';
              const hasPrepaid = w.prepaidAmount !== null && w.prepaidAmount > 0;
              const rowOpacity = (isSettled || isPending) ? 0.6 : 1;
              return (
                <tr key={w.no} style={{ opacity: rowOpacity }}>
                  <td style={{ fontWeight: 600, color: '#1677ff' }}>{w.no}</td>
                  <td style={{ fontSize: 12, color: '#555' }}>{w.positionTime}</td>
                  <td style={{ fontSize: 12, color: '#555' }}>{w.unloadingTime}</td>
                  <td style={{ fontSize: 12 }}>{w.truckType}</td>
                  <td style={{ fontSize: 12, color: '#555' }}>{w.origin}</td>
                  <td style={{ fontSize: 12, color: '#555' }}>{w.destination}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmtAmt(w.waybillAmount)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmtAmt(w.basicAmount)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13, color: hasPrepaid ? '#0958d9' : undefined, fontWeight: hasPrepaid ? 600 : 400 }}>
                    {fmtAmt(w.prepaidAmount)}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmtAmt(w.additionalCharge)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmtAmt(w.exceptionFee)}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{fmtAmt(w.reimbursement)}</td>
                  <td><span style={STATUS_STYLE[w.status]}>{w.status}</span></td>
                  <td style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{w.createdAt}</td>
                  <td>
                    {isBillable ? (
                      <button
                        className="btn-link"
                        style={{ color: '#1677ff' }}
                        onClick={() => onGenerateStatement([w.no], 'system-price')}
                      >
                        Edit
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#ccc' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={15} className="empty">No waybills found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 12, color: '#666' }}>45B waybills</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#999', marginRight: 4 }}>Next</span>
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <span style={{ fontSize: 12, color: '#999', padding: '0 4px' }}>...</span>
          <button className="page-btn">&gt;</button>
          <button className="page-btn">Last</button>
        </div>
      </div>
    </div>
  );
}

export default UnbilledWaybillsList;
