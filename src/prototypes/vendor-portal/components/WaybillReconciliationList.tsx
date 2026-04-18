import React, { useState } from 'react';

interface Props {
  onImport: () => void;
  onOpenDiff: (waybillNo: string) => void;
  onGoApplications: () => void;
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

function WaybillReconciliationList({ onImport, onOpenDiff, onGoApplications, settledWaybills = {} }: Props) {
  const [status, setStatus] = useState<string>('all');
  const filtered = status === 'all' ? SAMPLE : SAMPLE.filter(r => r.status === status);
  const isSettled = (no: string) => !!settledWaybills[no];

  const counts = {
    total: SAMPLE.length,
    pending: SAMPLE.filter(r => r.status === 'Discrepancy Pending').length,
    matched: SAMPLE.filter(r => r.status === 'Matched').length,
    notReconciled: SAMPLE.filter(r => r.status === 'Not Reconciled').length,
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-default" onClick={onGoApplications}>View My Modification Requests</button>
            <button className="btn-primary" onClick={onImport}>
              <span style={{ marginRight: 6 }}>↑</span>Import Sheet
            </button>
          </div>
        </div>

        <div className="alert alert-info">
          <span>ⓘ</span>
          Filter to Awaiting Price Verification / Awaiting Settlement only. Download the template, fill in your amounts, and upload to compare with TMS amounts line-by-line.
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

        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Waybill No.</th>
                <th>Position Time</th>
                <th>Delivery</th>
                <th>Truck Type</th>
                <th>Origin → Destination</th>
                <th className="num">Paid in Advance</th>
                <th className="num">Basic (Remaining)</th>
                <th className="num">Additional</th>
                <th className="num">Exception</th>
                <th className="num">Claim</th>
                <th>Reconciliation Status</th>
                <th>Operate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const settled = isSettled(r.no);
                return (
                  <tr key={r.no} style={settled ? { opacity: 0.55, background: '#fafafa' } : {}}>
                    <td>
                      <button className="btn-link" onClick={() => onOpenDiff(r.no)}>{r.no}</button>
                      {settled && (
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                          已加入 <strong>{settledWaybills[r.no]}</strong>
                        </div>
                      )}
                    </td>
                    <td>{r.positionTime}</td>
                    <td>{r.delivery}</td>
                    <td>{r.truckType}</td>
                    <td style={{ fontSize: 12 }}>{r.origin}<br/>→ {r.destination}</td>
                    <td className="num">{r.paidAdvance.toLocaleString()}</td>
                    <td className="num">{r.basic.toLocaleString()}</td>
                    <td className="num">{r.additional.toLocaleString()}</td>
                    <td className="num">{r.exception.toLocaleString()}</td>
                    <td className="num">{r.claim.toLocaleString()}</td>
                    <td>
                      {settled
                        ? <span className="tag tag-settlement-pending">Settlement Pending</span>
                        : <StatusTag status={r.status} />}
                    </td>
                    <td>
                      <button className="btn-link" onClick={() => onOpenDiff(r.no)}>View Diff</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="empty">No waybills match the current filter.</td></tr>
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
