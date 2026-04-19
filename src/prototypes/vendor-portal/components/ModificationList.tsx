import React, { useState } from 'react';

interface Props {
  onBack?: () => void;
  onOpenDetail: (apNo: string) => void;
}

interface AppRow {
  apNo: string;
  createdAt: string;
  rows: number;
  waybills: string[];
  totalDelta: number;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Partially Approved';
}

const SAMPLE: AppRow[] = [
  { apNo: 'ApM260416001', createdAt: '2026-04-16 14:22', rows: 3, waybills: ['WB2604002', 'WB2604003'], totalDelta: 1900, status: 'Under Review' },
  { apNo: 'ApM260415003', createdAt: '2026-04-15 10:05', rows: 2, waybills: ['WB2603027'], totalDelta: 1200, status: 'Approved' },
  { apNo: 'ApM260412011', createdAt: '2026-04-12 16:40', rows: 4, waybills: ['WB2603015', 'WB2603016'], totalDelta: 3400, status: 'Partially Approved' },
  { apNo: 'ApM260410007', createdAt: '2026-04-10 09:11', rows: 1, waybills: ['WB2603009'], totalDelta: 500, status: 'Rejected' },
  { apNo: 'ApM260409002', createdAt: '2026-04-09 20:30', rows: 2, waybills: ['WB2603005'], totalDelta: 800, status: 'Draft' },
];

function StatusTag({ s }: { s: AppRow['status'] }) {
  const map: Record<AppRow['status'], string> = {
    'Draft': 'tag-draft',
    'Under Review': 'tag-under-review',
    'Approved': 'tag-approved',
    'Rejected': 'tag-rejected',
    'Partially Approved': 'tag-partial',
  };
  return <span className={`tag ${map[s]}`}>{s}</span>;
}

function ApplicationList({ onBack, onOpenDetail }: Props) {
  const [type, setType] = useState('Modification');
  const [status, setStatus] = useState('all');

  const filtered = SAMPLE.filter(r => status === 'all' || r.status === status);

  return (
    <>
      {onBack && (
        <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
          <button className="btn-link" onClick={onBack}>← Back to Waybills</button>
        </div>
      )}

      <div className="vp-kpi-row">
        <div className="vp-kpi"><div className="vp-kpi-label">Total Applications</div><div className="vp-kpi-value">{SAMPLE.length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Under Review</div><div className="vp-kpi-value blue">{SAMPLE.filter(r => r.status === 'Under Review').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Approved</div><div className="vp-kpi-value green">{SAMPLE.filter(r => r.status === 'Approved').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Rejected / Partial</div><div className="vp-kpi-value red">{SAMPLE.filter(r => r.status === 'Rejected' || r.status === 'Partially Approved').length}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">My Modification Requests</div>
        </div>

        <div className="filter-row">
          <input className="filter-input" placeholder="Application No." />
          <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Modification">Type: Price Modification</option>
            <option value="Settlement">Type: Settlement</option>
            <option value="Vendor">Type: Vendor Accreditation</option>
          </select>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Partially Approved">Partially Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input className="filter-input" placeholder="Created: YYYY-MM-DD" />
          <button className="btn-default">Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Type</th>
              <th>Created At</th>
              <th>Waybills</th>
              <th className="num">Rows</th>
              <th className="num">Total Delta</th>
              <th>Status</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.apNo}>
                <td><button className="btn-link" onClick={() => onOpenDetail(r.apNo)}>{r.apNo}</button></td>
                <td>Price Modification</td>
                <td>{r.createdAt}</td>
                <td>{r.waybills.join(', ')}</td>
                <td className="num">{r.rows}</td>
                <td className="num diff-positive">+{r.totalDelta.toLocaleString()}</td>
                <td><StatusTag s={r.status} /></td>
                <td>
                  <button className="btn-link" onClick={() => onOpenDetail(r.apNo)}>Details</button>
                  {r.status === 'Draft' && <button className="btn-link" style={{ marginLeft: 8 }}>Edit</button>}
                  {r.status === 'Under Review' && <button className="btn-link" style={{ marginLeft: 8 }}>Withdraw</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="empty">No applications match the current filter.</td></tr>}
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

export default ApplicationList;
