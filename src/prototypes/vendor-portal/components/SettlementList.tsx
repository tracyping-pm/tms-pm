import React, { useState } from 'react';
import { EmptyState, formatAmount } from './UIComponents';

interface Props {
  onCreate: () => void;
  onOpenDetail: (apNo: string) => void;
  onEdit?: (apNo: string) => void;
}

interface Row {
  apNo: string;
  createdAt: string;
  period: string;
  waybillCount: number;
  totalAmount: number;
  invoiceNo?: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected';
  statementNo?: string;
}

const SAMPLE: Row[] = [
  { apNo: 'ApS260416002', createdAt: '2026-04-16 17:10', period: '2026-04-01 ~ 2026-04-15', waybillCount: 4, totalAmount: 42300, status: 'Under Review' },
  { apNo: 'ApS260413004', createdAt: '2026-04-13 09:42', period: '2026-03-16 ~ 2026-03-31', waybillCount: 6, totalAmount: 68800, invoiceNo: 'INV-2026-00157', status: 'Approved', statementNo: 'PHVS26041301' },
  { apNo: 'ApS260410003', createdAt: '2026-04-10 11:20', period: '2026-03-01 ~ 2026-03-15', waybillCount: 3, totalAmount: 21500, status: 'Rejected' },
  { apNo: 'ApS260409001', createdAt: '2026-04-09 16:55', period: '2026-04-01 ~ 2026-04-10', waybillCount: 2, totalAmount: 18000, status: 'Draft' },
];

function StatusTag({ s }: { s: Row['status'] }) {
  const map: Record<Row['status'], string> = {
    'Draft': 'tag-draft',
    'Under Review': 'tag-under-review',
    'Approved': 'tag-approved',
    'Rejected': 'tag-rejected',
  };
  return <span className={`tag ${map[s]}`}>{s}</span>;
}

function ApplicationList({ onCreate, onOpenDetail, onEdit }: Props) {
  const [status, setStatus] = useState('all');
  const filtered = SAMPLE.filter(r => status === 'all' || r.status === status);

  return (
    <>
      <div className="vp-kpi-row">
        <div className="vp-kpi"><div className="vp-kpi-label">Total Applications</div><div className="vp-kpi-value">{SAMPLE.length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Under Review</div><div className="vp-kpi-value blue">{SAMPLE.filter(r => r.status === 'Under Review').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Approved (Statements Generated)</div><div className="vp-kpi-value green">{SAMPLE.filter(r => r.status === 'Approved').length}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Rejected</div><div className="vp-kpi-value red">{SAMPLE.filter(r => r.status === 'Rejected').length}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">My Settlement Applications</div>
          <button className="btn-primary" onClick={onCreate}>+ New Settlement Application</button>
        </div>

        <div className="alert alert-info">
          <span>ⓘ</span>
          Only waybills in <strong>Awaiting Settlement</strong> can be submitted. Approved applications auto-generate a Vendor Statement for your confirmation in <strong>My Statements</strong>.
        </div>

        <div className="filter-row">
          <input className="filter-input" placeholder="Application No." />
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input className="filter-input" placeholder="Period: YYYY-MM-DD" />
          <button className="btn-default">Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <div className="table-container">
          <table className="data-table sticky-header">
            <thead>
              <tr>
                <th>Application No.</th>
                <th>Created At</th>
                <th>Reconciliation Period</th>
                <th className="num">Waybills</th>
                <th className="num">Total Amount</th>
                <th>Invoice No.</th>
                <th>Status</th>
                <th>Linked Statement</th>
                <th>Operate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon="📋"
                      title="No settlement applications"
                      description="Create your first settlement application to get started."
                      action={<button className="btn-primary" onClick={onCreate}>+ New Application</button>}
                    />
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r.apNo}>
                  <td><button className="btn-link" onClick={() => onOpenDetail(r.apNo)}>{r.apNo}</button></td>
                  <td>{r.createdAt}</td>
                  <td>{r.period}</td>
                  <td className="num">{r.waybillCount}</td>
                  <td className="num amount">{formatAmount(r.totalAmount)}</td>
                  <td>{r.invoiceNo || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td><StatusTag s={r.status} /></td>
                  <td>{r.statementNo ? <span style={{ color: '#1890ff' }}>{r.statementNo}</span> : <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td>
                    <button className="btn-link" onClick={() => onOpenDetail(r.apNo)}>Details</button>
                    {r.status === 'Draft' && <>
                      <button className="btn-link" style={{ marginLeft: 8 }}>Edit</button>
                      <button className="btn-link" style={{ marginLeft: 8, color: '#ff4d4f' }}>Delete</button>
                    </>}
                    {r.status === 'Under Review' && <button className="btn-link" style={{ marginLeft: 8 }}>Withdraw</button>}
                    {r.status === 'Rejected' && <button className="btn-link" style={{ marginLeft: 8 }} onClick={() => onEdit?.(r.apNo)}>Edit</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="pagination">
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">&gt;</button>
            <span style={{ marginLeft: 12, fontSize: 12, color: '#999' }}>Total {filtered.length} · 20/page</span>
          </div>
        )}
      </div>
    </>
  );
}

export default ApplicationList;
