import React, { useState } from 'react';

interface Props {
  onOpenDetail: (no: string, status: Status) => void;
}

type Status = 'Pending Payment' | 'Partially Paid' | 'Paid';

interface Row {
  no: string;
  period: string;
  totalPayable: number;
  amountPaid: number;
  source: 'Vendor Request' | 'Manual';
  status: Status;
  createdAt: string;
}

const SAMPLE: Row[] = [
  { no: 'PHVS26041502', period: '2026-03-16 ~ 2026-03-31', totalPayable: 68800, amountPaid: 0, source: 'Vendor Request', status: 'Pending Payment', createdAt: '2026-04-13 11:45' },
  { no: 'PHVS26040901', period: '2026-03-01 ~ 2026-03-15', totalPayable: 55200, amountPaid: 30000, source: 'Manual', status: 'Partially Paid', createdAt: '2026-04-09 09:30' },
  { no: 'PHVS26032801', period: '2026-02-16 ~ 2026-02-29', totalPayable: 48000, amountPaid: 48000, source: 'Manual', status: 'Paid', createdAt: '2026-03-28 14:10' },
];

function StatusTag({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    'Pending Payment': 'tag-under-review',
    'Partially Paid': 'tag-partial',
    'Paid': 'tag-approved',
  };
  return <span className={`tag ${map[s]}`}>{s}</span>;
}

function StatementList({ onOpenDetail }: Props) {
  const [status, setStatus] = useState('all');
  const filtered = SAMPLE.filter(r => status === 'all' || r.status === status);

  const totalOutstanding = SAMPLE.filter(r => r.status !== 'Paid')
    .reduce((a, r) => a + (r.totalPayable - r.amountPaid), 0);
  const totalPaid = SAMPLE.filter(r => r.status === 'Paid').reduce((a, r) => a + r.amountPaid, 0);

  return (
    <>
      <div className="vp-kpi-row">
        <div className="vp-kpi"><div className="vp-kpi-label">Total Statements</div><div className="vp-kpi-value">{SAMPLE.length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Pending Payment</div><div className="vp-kpi-value orange">{SAMPLE.filter(r => r.status === 'Pending Payment').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Outstanding Amount</div><div className="vp-kpi-value red">{totalOutstanding.toLocaleString()}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Total Paid</div><div className="vp-kpi-value green">{totalPaid.toLocaleString()}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">My Statements</div>
          <div style={{ fontSize: 12, color: '#999' }}>Statements generated from your settlement applications or created by Procurement.</div>
        </div>

        <div className="filter-row">
          <input className="filter-input" placeholder="Statement No." />
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Pending Payment">Pending Payment</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
          </select>
          <select className="filter-select">
            <option>Source: All</option>
            <option>Vendor Request</option>
            <option>Manual</option>
          </select>
          <input className="filter-input" placeholder="Period: YYYY-MM-DD" />
          <button className="btn-default">Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Statement No.</th>
              <th>Reconciliation Period</th>
              <th>Source</th>
              <th className="num">Total Payable</th>
              <th className="num">Amount Paid</th>
              <th className="num">Remaining</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.no}>
                <td><button className="btn-link" onClick={() => onOpenDetail(r.no, r.status)}>{r.no}</button></td>
                <td>{r.period}</td>
                <td>
                  {r.source === 'Vendor Request'
                    ? <span className="tag tag-matched">Vendor Request</span>
                    : <span className="tag tag-draft">Manual</span>}
                </td>
                <td className="num">{r.totalPayable.toLocaleString()}</td>
                <td className="num">{r.amountPaid.toLocaleString()}</td>
                <td className="num" style={{ color: r.totalPayable - r.amountPaid > 0 ? '#ff4d4f' : '#999' }}>
                  {(r.totalPayable - r.amountPaid).toLocaleString()}
                </td>
                <td><StatusTag s={r.status} /></td>
                <td>{r.createdAt}</td>
                <td>
                  <button className="btn-link" onClick={() => onOpenDetail(r.no, r.status)}>Details</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="empty">No statements match the current filter.</td></tr>}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">&gt;</button>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>Total {filtered.length} · 20/page</span>
        </div>
      </div>
    </>
  );
}

export default StatementList;
export type { Status };
