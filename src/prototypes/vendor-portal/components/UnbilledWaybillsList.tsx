import React, { useMemo, useState } from 'react';
import { getAllApplications } from '../../../common/prepaidApplicationSync';

export type CreateMode = 'system-price' | 'upload';

interface Props {
  onGenerateStatement: (waybillNos: string[], mode: CreateMode) => void;
  pendingWaybills?: string[];
}

type WaybillStatus = 'Pending Price Supplement' | 'Billable' | 'Statement Pending' | 'Settled';

interface Waybill {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  waybillAmount: number | null;
  basicAmount: number | null;
  prepaidAmount: number | null;
  additionalCharge: number | null;
  exceptionFee: number | null;
  reimbursement: number | null;
  baseStatus: WaybillStatus;  // 'Settled' for pre-settled rows; others derived from amounts
  createdAt: string;
}

const BASE_WAYBILLS: Waybill[] = [
  {
    no: 'WB2604009', positionTime: '2026-04-09 11:00', unloadingTime: '2026-04-08 16:30',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus / DC',
    waybillAmount: 16800, basicAmount: 16800, prepaidAmount: null, additionalCharge: 900, exceptionFee: 0, reimbursement: 0,
    baseStatus: 'Settled', createdAt: '2026/3/28 09:00:00',
  },
  {
    no: 'WB2604010', positionTime: '2026-04-10 15:30', unloadingTime: '2026-04-09 11:00',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    waybillAmount: 13300, basicAmount: 13300, prepaidAmount: null, additionalCharge: 0, exceptionFee: 0, reimbursement: 0,
    baseStatus: 'Settled', createdAt: '2026/3/28 09:00:00',
  },
  {
    no: 'WB2604011', positionTime: '2026-04-11 09:00', unloadingTime: '2026-04-10 15:30',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus / DC', destination: 'PH-NCR-Taguig',
    waybillAmount: null, basicAmount: null, prepaidAmount: null, additionalCharge: null, exceptionFee: null, reimbursement: null,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'WB2604012', positionTime: '2026-04-12 17:00', unloadingTime: '2026-04-11 09:00',
    truckType: '6-Wheeler', origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig',
    waybillAmount: null, basicAmount: null, prepaidAmount: null, additionalCharge: null, exceptionFee: null, reimbursement: null,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'WB2604013', positionTime: '2026-04-13 11:15', unloadingTime: '2026-04-12 17:00',
    truckType: '10-Wheeler', origin: 'PH-Batangas / Lima', destination: 'PH-NCR-Manila / Port Area',
    waybillAmount: null, basicAmount: null, prepaidAmount: null, additionalCharge: null, exceptionFee: null, reimbursement: null,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604014', positionTime: '2026-04-14 08:30', unloadingTime: '2026-04-13 11:15',
    truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba / Plant 2',
    waybillAmount: null, basicAmount: null, prepaidAmount: null, additionalCharge: null, exceptionFee: null, reimbursement: null,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604015', positionTime: '2026-04-15 14:00', unloadingTime: '2026-04-14 08:30',
    truckType: '10-Wheeler', origin: 'PH-Pampanga / Clark', destination: 'PH-NCR-Manila / Port Area',
    waybillAmount: null, basicAmount: null, prepaidAmount: null, additionalCharge: null, exceptionFee: null, reimbursement: null,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604016', positionTime: '2026-04-16 10:45', unloadingTime: '2026-04-15 14:00',
    truckType: '6-Wheeler', origin: 'PH-NCR-Quezon City', destination: 'PH-Bulacan-Meycauayan',
    waybillAmount: null, basicAmount: null, prepaidAmount: null, additionalCharge: null, exceptionFee: null, reimbursement: null,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604017', positionTime: '2026-04-17 07:30', unloadingTime: '2026-04-16 10:45',
    truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC',
    waybillAmount: 15500, basicAmount: 15500, prepaidAmount: null, additionalCharge: 0, exceptionFee: 0, reimbursement: 200,
    baseStatus: 'Pending Price Supplement', createdAt: '2026/4/12 14:00:00',
  },
];

const TRUCK_TYPES = ['4-Wheeler', '6-Wheeler', '10-Wheeler'];
const ALL_STATUSES: WaybillStatus[] = ['Pending Price Supplement', 'Billable', 'Statement Pending', 'Settled'];

const SHEET_URL = 'https://docs.google.com/spreadsheets/u/2/d/1iDas0CR5--hfrgfVVmGK6_mTOQace_LmG2Yp3KBpB6A/edit?pli=1&gid=0#gid=0';

// Amounts that "Sync from Sheet" will apply
const SHEET_SYNC_OVERRIDES: Record<string, Partial<Waybill>> = {
  WB2604011: { waybillAmount: 15300, basicAmount: 14500, additionalCharge: 800, exceptionFee: 0, reimbursement: 0 },
  WB2604012: { waybillAmount: 13300, basicAmount: 13300, additionalCharge: 0,   exceptionFee: 0, reimbursement: 0 },
  WB2604013: { waybillAmount: 16700, basicAmount: 15000, additionalCharge: 1200, exceptionFee: 500, reimbursement: 0 },
  WB2604014: { waybillAmount: 12000, basicAmount: 12000, additionalCharge: 0,   exceptionFee: 0, reimbursement: 0 },
  WB2604015: { waybillAmount: 13300, basicAmount: 13300, additionalCharge: 0,   exceptionFee: 0, reimbursement: 0 },
  WB2604016: { waybillAmount: 12300, basicAmount: 11800, additionalCharge: 500, exceptionFee: 0, reimbursement: 0 },
};

function deriveStatus(w: Waybill, pendingWaybills: string[]): WaybillStatus {
  if (w.baseStatus === 'Settled') return 'Settled';
  if (pendingWaybills.includes(w.no)) return 'Statement Pending';
  if (w.basicAmount !== null) return 'Billable';
  return 'Pending Price Supplement';
}

const STATUS_STYLE: Record<WaybillStatus, React.CSSProperties> = {
  'Pending Price Supplement': { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Billable':                 { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  'Statement Pending':        { background: '#f5f5f5', color: '#888',    border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' },
  'Settled':                  { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const STATUS_STAT_COLOR: Record<WaybillStatus, { bg: string; color: string; border: string }> = {
  'Pending Price Supplement': { bg: '#fffbe6', color: '#d48806', border: '#ffe58f' },
  'Billable':                 { bg: '#f0fcf4', color: '#00b96b', border: '#87e8a3' },
  'Statement Pending':        { bg: '#f5f5f5', color: '#595959', border: '#e0e0e0' },
  'Settled':                  { bg: '#e6f4ff', color: '#0958d9', border: '#91caff' },
};

function fmtAmt(v: number | null): React.ReactNode {
  if (v === null) return <span style={{ color: '#bbb' }}>—</span>;
  return v.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function UnbilledWaybillsList({ onGenerateStatement, pendingWaybills = [] }: Props) {
  const [filterNo, setFilterNo] = useState('');
  const [filterUnloadTime, setFilterUnloadTime] = useState('');
  const [filterTruckType, setFilterTruckType] = useState('');
  // Multi-select status filter: Settled unchecked by default
  const [filterStatuses, setFilterStatuses] = useState<Set<WaybillStatus>>(
    new Set(['Pending Price Supplement', 'Billable', 'Statement Pending'])
  );
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [syncedOverrides, setSyncedOverrides] = useState<Record<string, Partial<Waybill>>>({});
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

  // Merge all data
  const waybills: Waybill[] = BASE_WAYBILLS.map(w => ({
    ...w,
    prepaidAmount: prepaidAmountMap[w.no] ?? null,
    ...syncedOverrides[w.no],
  }));

  // Derive effective status for each waybill
  const waybillsWithStatus = waybills.map(w => ({
    ...w,
    status: deriveStatus(w, pendingWaybills),
  }));

  // Counts per status (for stats bar)
  const statusCounts = useMemo(() => {
    const counts: Record<WaybillStatus, number> = {
      'Pending Price Supplement': 0, 'Billable': 0, 'Statement Pending': 0, 'Settled': 0,
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
      setSyncedOverrides(SHEET_SYNC_OVERRIDES);
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
