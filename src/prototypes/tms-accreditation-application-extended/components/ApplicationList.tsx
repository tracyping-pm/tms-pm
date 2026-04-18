import React, { useState } from 'react';

interface Props {
  onOpenDetail: (apNo: string, type: AppType) => void;
}

export type AppType = 'Vendor' | 'Truck' | 'Crew' | 'Settlement' | 'Modification';
type Status = 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Partially Approved';

interface Row {
  apNo: string;
  type: AppType;
  vendor: string;
  submittedAt: string;
  summary: string;
  amount?: number;
  status: Status;
}

const SAMPLE: Row[] = [
  { apNo: 'ApM260416001', type: 'Modification', vendor: 'Coca-Cola Bottlers PH Inc.', submittedAt: '2026-04-16 14:22', summary: '3 rows across WB2604002/WB2604003', amount: 1900, status: 'Under Review' },
  { apNo: 'ApS260416002', type: 'Settlement', vendor: 'Coca-Cola Bottlers PH Inc.', submittedAt: '2026-04-16 17:10', summary: '4 waybills · 2026-04-01 ~ 2026-04-15', amount: 42300, status: 'Under Review' },
  { apNo: 'ApS260415008', type: 'Settlement', vendor: 'SMC Logistics', submittedAt: '2026-04-15 10:30', summary: '6 waybills · 2026-03-16 ~ 2026-03-31', amount: 68800, status: 'Approved' },
  { apNo: 'ApV260414003', type: 'Vendor', vendor: 'NewCo Trucking', submittedAt: '2026-04-14 09:15', summary: 'Accreditation renewal — 5 documents', status: 'Approved' },
  { apNo: 'ApT260414001', type: 'Truck', vendor: 'SMC Logistics', submittedAt: '2026-04-14 08:00', summary: 'Truck TRK-0092 registration', status: 'Under Review' },
  { apNo: 'ApM260412011', type: 'Modification', vendor: 'JG Summit Freight', submittedAt: '2026-04-12 16:40', summary: '4 rows across 2 waybills', amount: 3400, status: 'Partially Approved' },
  { apNo: 'ApC260411002', type: 'Crew', vendor: 'SMC Logistics', submittedAt: '2026-04-11 14:20', summary: 'Driver ID-4457 onboarding', status: 'Approved' },
  { apNo: 'ApS260410003', type: 'Settlement', vendor: 'JG Summit Freight', submittedAt: '2026-04-10 11:20', summary: '3 waybills · 2026-03-01 ~ 2026-03-15', amount: 21500, status: 'Rejected' },
];

function TypeTag({ t }: { t: AppType }) {
  const map: Record<AppType, string> = {
    'Vendor': 'tag-vendor',
    'Truck': 'tag-vendor',
    'Crew': 'tag-vendor',
    'Settlement': 'tag-settlement',
    'Modification': 'tag-modification',
  };
  return <span className={`tag ${map[t]}`}>{t}</span>;
}

function StatusTag({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    'Draft': 'tag-draft',
    'Under Review': 'tag-under-review',
    'Approved': 'tag-approved',
    'Rejected': 'tag-rejected',
    'Partially Approved': 'tag-partial',
  };
  return <span className={`tag ${map[s]}`}>{s}</span>;
}

function ApplicationList({ onOpenDetail }: Props) {
  const [type, setType] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const filtered = SAMPLE.filter(r =>
    (type === 'all' || r.type === type) &&
    (status === 'all' || r.status === status)
  );

  const underReview = SAMPLE.filter(r => r.status === 'Under Review').length;
  const settlementApps = SAMPLE.filter(r => r.type === 'Settlement').length;
  const modificationApps = SAMPLE.filter(r => r.type === 'Modification').length;

  return (
    <>
      <div className="tms-kpi-row">
        <div className="tms-kpi"><div className="tms-kpi-label">Total Applications</div><div className="tms-kpi-value">{SAMPLE.length}</div></div>
        <div className="tms-kpi"><div className="tms-kpi-label">Pending Review</div><div className="tms-kpi-value blue">{underReview}</div></div>
        <div className="tms-kpi"><div className="tms-kpi-label">Settlement</div><div className="tms-kpi-value green">{settlementApps}</div></div>
        <div className="tms-kpi"><div className="tms-kpi-label">Modification</div><div className="tms-kpi-value orange">{modificationApps}</div></div>
      </div>

      <div className="tms-card">
        <div className="tms-card-title">
          <div className="section-title">Accreditation Applications</div>
          <span style={{ fontSize: 12, color: '#999' }}>Extended with Type = Settlement / Modification.</span>
        </div>

        <div className="alert alert-info">
          <span>ⓘ</span>
          Two new application types added: <strong>Settlement</strong> (auto-generate Vendor Statement on approval) and <strong>Modification</strong> (row-by-row approve/reject to update waybill billing amounts).
        </div>

        <div className="filter-row">
          <input className="filter-input" placeholder="Application No." />
          <input className="filter-input" placeholder="Vendor Name" />
          <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Type: All</option>
            <option value="Vendor">Vendor Accreditation</option>
            <option value="Truck">Truck</option>
            <option value="Crew">Crew</option>
            <option value="Settlement">Settlement</option>
            <option value="Modification">Price Modification</option>
          </select>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Partially Approved">Partially Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input className="filter-input" placeholder="Submitted: YYYY-MM-DD" />
          <button className="btn-default">Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Type</th>
              <th>Vendor</th>
              <th>Submitted At</th>
              <th>Summary</th>
              <th className="num">Amount</th>
              <th>Status</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.apNo}>
                <td><button className="btn-link" onClick={() => onOpenDetail(r.apNo, r.type)}>{r.apNo}</button></td>
                <td><TypeTag t={r.type} /></td>
                <td>{r.vendor}</td>
                <td>{r.submittedAt}</td>
                <td style={{ fontSize: 12, color: '#666' }}>{r.summary}</td>
                <td className="num">{r.amount ? r.amount.toLocaleString() : '—'}</td>
                <td><StatusTag s={r.status} /></td>
                <td>
                  <button className="btn-link" onClick={() => onOpenDetail(r.apNo, r.type)}>
                    {r.status === 'Under Review' ? 'Review' : 'Details'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="empty">No applications match the current filter.</td></tr>}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">&gt;</button>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>Total {filtered.length} · 20/page</span>
        </div>
      </div>
    </>
  );
}

export default ApplicationList;
