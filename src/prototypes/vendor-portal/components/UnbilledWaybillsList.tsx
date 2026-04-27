import React, { useState } from 'react';

interface Props {
  onGenerateStatement: (waybillNos: string[]) => void;
  pendingWaybills?: string[]; // waybills already in a pending statement
}

interface Waybill {
  no: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  status: 'Unbilled' | 'Statement Pending';
}

const SAMPLE_WAYBILLS: Waybill[] = [
  {
    no: 'WB2604010',
    unloadingTime: '2026-04-10 15:30',
    truckType: '10-Wheeler',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Cavite-Imus / DC',
    status: 'Unbilled',
  },
  {
    no: 'WB2604011',
    unloadingTime: '2026-04-11 09:00',
    truckType: '6-Wheeler',
    origin: 'PH-Cavite-Imus',
    destination: 'PH-NCR-Taguig',
    status: 'Unbilled',
  },
  {
    no: 'WB2604012',
    unloadingTime: '2026-04-12 17:00',
    truckType: '10-Wheeler',
    origin: 'PH-Batangas / Lima',
    destination: 'PH-NCR-Manila / Port Area',
    status: 'Unbilled',
  },
  {
    no: 'WB2604013',
    unloadingTime: '2026-04-13 11:15',
    truckType: '4-Wheeler',
    origin: 'PH-NCR-Manila',
    destination: 'PH-Laguna-Calamba / Plant 2',
    status: 'Statement Pending',
  },
  {
    no: 'WB2604014',
    unloadingTime: '2026-04-14 08:30',
    truckType: '10-Wheeler',
    origin: 'PH-Pampanga / Clark',
    destination: 'PH-NCR-Manila / Port Area',
    status: 'Unbilled',
  },
  {
    no: 'WB2604015',
    unloadingTime: '2026-04-15 14:00',
    truckType: '6-Wheeler',
    origin: 'PH-NCR-Quezon City',
    destination: 'PH-Bulacan-Meycauayan',
    status: 'Unbilled',
  },
  {
    no: 'WB2604016',
    unloadingTime: '2026-04-16 10:45',
    truckType: '10-Wheeler',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Cavite-Imus / DC',
    status: 'Statement Pending',
  },
];

const TRUCK_TYPES = ['4-Wheeler', '6-Wheeler', '10-Wheeler'];

function UnbilledWaybillsList({ onGenerateStatement, pendingWaybills = [] }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [truckTypeFilter, setTruckTypeFilter] = useState('all');

  // Merge runtime-added pending waybills with static data
  const waybills = SAMPLE_WAYBILLS.map(w =>
    pendingWaybills.includes(w.no) ? { ...w, status: 'Statement Pending' as const } : w
  );

  const filtered = waybills.filter(w => {
    const matchKeyword =
      !keyword ||
      w.no.toLowerCase().includes(keyword.toLowerCase()) ||
      w.origin.toLowerCase().includes(keyword.toLowerCase()) ||
      w.destination.toLowerCase().includes(keyword.toLowerCase());
    const matchTruck = truckTypeFilter === 'all' || w.truckType === truckTypeFilter;
    return matchKeyword && matchTruck;
  });

  const selectableWaybills = filtered.filter(w => w.status === 'Unbilled');
  const allChecked =
    selectableWaybills.length > 0 && selectableWaybills.every(w => selected.has(w.no));
  const indeterminate =
    !allChecked && selectableWaybills.some(w => selected.has(w.no));

  const toggleAll = () => {
    const n = new Set(selected);
    if (allChecked) {
      selectableWaybills.forEach(w => n.delete(w.no));
    } else {
      selectableWaybills.forEach(w => n.add(w.no));
    }
    setSelected(n);
  };

  const toggle = (no: string) => {
    const n = new Set(selected);
    if (n.has(no)) n.delete(no);
    else n.add(no);
    setSelected(n);
  };

  const selectedList: string[] = Array.from(selected);

  const handleReset = () => {
    setKeyword('');
    setTruckTypeFilter('all');
  };

  return (
    <>
      <div className="vp-card">
        <div className="vp-card-title">
          <div>
            <div className="section-title">Unbilled Waybills</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Select completed waybills to generate a billing statement.
              Price details are not displayed here — you will enter your own amounts in the next step.
            </div>
          </div>
          {selectedList.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#00b96b', fontWeight: 500 }}>
                {selectedList.length} Selected
              </span>
              <button className="btn-default" onClick={() => setSelected(new Set())}>
                Clear Selection
              </button>
              <button
                className="btn-primary"
                onClick={() => onGenerateStatement(selectedList)}
              >
                Generate Statement
              </button>
            </div>
          )}
        </div>

        <div className="filter-row">
          <input
            className="filter-input"
            placeholder="Waybill No. / Origin / Destination"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select
            className="filter-select"
            value={truckTypeFilter}
            onChange={e => setTruckTypeFilter(e.target.value)}
          >
            <option value="all">All Truck Types</option>
            {TRUCK_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button className="btn-default" onClick={handleReset}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 0 }}>
          <span>ⓘ</span>
          <span>
            <strong>Blind Billing:</strong> Contract rates and TMS amounts are not shown here.
            You will input your own billed amounts per waybill when creating the statement.
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = indeterminate; }}
                  onChange={toggleAll}
                />
              </th>
              <th>Waybill No.</th>
              <th>Unloading Time</th>
              <th>Actual Truck Type</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const isPending = w.status === 'Statement Pending';
              return (
                <tr
                  key={w.no}
                  style={{ opacity: isPending ? 0.55 : 1 }}
                  title={isPending ? 'This waybill is already included in a pending statement.' : undefined}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(w.no)}
                      disabled={isPending}
                      onChange={() => !isPending && toggle(w.no)}
                    />
                  </td>
                  <td><strong>{w.no}</strong></td>
                  <td>{w.unloadingTime}</td>
                  <td>{w.truckType}</td>
                  <td style={{ fontSize: 12 }}>{w.origin}</td>
                  <td style={{ fontSize: 12 }}>{w.destination}</td>
                  <td>
                    {isPending ? (
                      <span className="tag tag-settlement-pending">⊘ Statement Pending</span>
                    ) : (
                      <span className="tag" style={{ background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }}>
                        Unbilled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">No unbilled waybills found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">&gt;</button>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>
            Total {filtered.length} · 20/page
          </span>
        </div>
      </div>
    </>
  );
}

export default UnbilledWaybillsList;
