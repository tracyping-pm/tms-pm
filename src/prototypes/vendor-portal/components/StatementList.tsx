import React, { useState } from 'react';

interface Props {
  onOpenDetail: (no: string, status: Status) => void;
  onEdit: (no: string, status: Status) => void;
}

export type Status = 'Awaiting Comparison' | 'Awaiting Re-bill' | 'Pending Payment' | 'Paid';

interface Row {
  no: string;
  totalSubmittedAmount: number;
  waybillCount: number;
  invoiceNo: string;
  status: Status;
  createdAt: string;
  rejectReason?: string;
}

const SAMPLE: Row[] = [
  {
    no: 'VS2604001',
    totalSubmittedAmount: 52800,
    waybillCount: 3,
    invoiceNo: 'INV-2026-00201',
    status: 'Awaiting Comparison',
    createdAt: '2026-04-20 10:15',
  },
  {
    no: 'VS2604002',
    totalSubmittedAmount: 38500,
    waybillCount: 2,
    invoiceNo: 'INV-2026-00198',
    status: 'Awaiting Re-bill',
    createdAt: '2026-04-18 14:30',
    rejectReason:
      'Basic Amount for WB2604011 exceeds contracted rate. Additional Charge for WB2604012 has no supporting proof. Please correct and resubmit.',
  },
  {
    no: 'VS2604003',
    totalSubmittedAmount: 68800,
    waybillCount: 4,
    invoiceNo: 'INV-2026-00185',
    status: 'Pending Payment',
    createdAt: '2026-04-13 11:45',
  },
  {
    no: 'VS2603001',
    totalSubmittedAmount: 48000,
    waybillCount: 3,
    invoiceNo: 'INV-2026-00157',
    status: 'Paid',
    createdAt: '2026-03-28 14:10',
  },
];

const STATUS_TAG: Record<Status, { cls: string; label: string }> = {
  'Awaiting Comparison': {
    cls: 'tag-under-review',
    label: 'Awaiting Comparison',
  },
  'Awaiting Re-bill': {
    cls: 'tag-rejected',
    label: 'Awaiting Re-bill',
  },
  'Pending Payment': {
    cls: 'tag-partial',
    label: 'Pending Payment',
  },
  Paid: {
    cls: 'tag-approved',
    label: 'Paid',
  },
};

function StatusTag({ s }: { s: Status }) {
  const { cls, label } = STATUS_TAG[s];
  return <span className={`tag ${cls}`}>{label}</span>;
}

function StatementList({ onOpenDetail, onEdit }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');

  const filtered = SAMPLE.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchKeyword = !keyword || r.no.includes(keyword) || r.invoiceNo.includes(keyword);
    return matchStatus && matchKeyword;
  });

  const awaitingCount = SAMPLE.filter(r => r.status === 'Awaiting Comparison').length;
  const rebillCount = SAMPLE.filter(r => r.status === 'Awaiting Re-bill').length;
  const pendingCount = SAMPLE.filter(r => r.status === 'Pending Payment').length;
  const paidCount = SAMPLE.filter(r => r.status === 'Paid').length;

  return (
    <>
      <div className="vp-kpi-row">
        <div className="vp-kpi">
          <div className="vp-kpi-label">Total Statements</div>
          <div className="vp-kpi-value">{SAMPLE.length}</div>
        </div>
        <div className="vp-kpi">
          <div className="vp-kpi-label">Awaiting Comparison</div>
          <div className="vp-kpi-value" style={{ color: '#1677ff' }}>{awaitingCount}</div>
        </div>
        <div className="vp-kpi">
          <div className="vp-kpi-label">Awaiting Re-bill</div>
          <div className="vp-kpi-value red">{rebillCount}</div>
        </div>
        <div className="vp-kpi">
          <div className="vp-kpi-label">Pending Payment</div>
          <div className="vp-kpi-value orange">{pendingCount}</div>
        </div>
        <div className="vp-kpi">
          <div className="vp-kpi-label">Paid</div>
          <div className="vp-kpi-value green">{paidCount}</div>
        </div>
      </div>

      {rebillCount > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 12 }}>
          <span>⚠</span>
          <span>
            You have <strong>{rebillCount}</strong> statement{rebillCount > 1 ? 's' : ''} rejected by TMS.
            Please review the rejection reason and resubmit.
          </span>
        </div>
      )}

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">My Statements</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            Statements submitted to TMS. Once submitted, TMS will compare amounts and notify you of the result.
          </div>
        </div>

        <div className="filter-row">
          <input
            className="filter-input"
            placeholder="Statement No. / Invoice No."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Awaiting Comparison">Awaiting Comparison</option>
            <option value="Awaiting Re-bill">Awaiting Re-bill</option>
            <option value="Pending Payment">Pending Payment</option>
            <option value="Paid">Paid</option>
          </select>
          <button className="btn-default" onClick={() => { setKeyword(''); setStatusFilter('all'); }}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Statement No.</th>
              <th className="num">Total Submitted Amount</th>
              <th>Waybills</th>
              <th>Invoice No.</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const isRebill = r.status === 'Awaiting Re-bill';
              return (
                <tr key={r.no} className={isRebill ? 'rebill-row' : undefined}>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => onOpenDetail(r.no, r.status)}
                    >
                      {r.no}
                    </button>
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    {r.totalSubmittedAmount.toLocaleString()} PHP
                  </td>
                  <td style={{ fontSize: 12, color: '#666' }}>{r.waybillCount} waybills</td>
                  <td style={{ fontSize: 12 }}>{r.invoiceNo}</td>
                  <td>
                    <StatusTag s={r.status} />
                    {isRebill && (
                      <div
                        style={{ fontSize: 11, color: '#cf1322', marginTop: 3, maxWidth: 200 }}
                        title={r.rejectReason}
                      >
                        {r.rejectReason && r.rejectReason.length > 60
                          ? r.rejectReason.slice(0, 60) + '…'
                          : r.rejectReason}
                      </div>
                    )}
                  </td>
                  <td>{r.createdAt}</td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => onOpenDetail(r.no, r.status)}
                    >
                      View
                    </button>
                    {isRebill && (
                      <>
                        {' '}·{' '}
                        <button
                          className="btn-link"
                          style={{ color: '#d46b08' }}
                          onClick={() => onEdit(r.no, r.status)}
                        >
                          Edit & Resubmit
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No statements match the current filter.
                </td>
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

export default StatementList;
export type { Row as StatementRow };
