import React, { useEffect, useState } from 'react';
import {
  type SyncedApplication,
  type SyncedAppStatus,
  type OperationLogEntry,
  formatDateTime,
  getAllApplications,
  upsertApplication,
} from '../../../common/prepaidApplicationSync';

interface Props {
  onCreate: () => void;
  onEdit: (app: SyncedApplication) => void;
  onDetail: (app: SyncedApplication) => void;
  /** Bumped externally to force a re-read from localStorage (e.g. after Save/Submit). */
  refreshKey?: number;
}

type Source = 'Self-Created' | 'TMS-Synced';

// Sample seed used to populate localStorage on first load if empty.
function buildSeedApplications(): SyncedApplication[] {
  return [
    {
      applicationNo: 'PPA2604002',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Prepaid Application',
      status: 'Awaiting Confirmation',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        { no: 'WB2604020', positionTime: '2026-04-16 12:45', unloadingTime: '2026-04-16 08:30', truckType: '10-Wheeler', origin: 'PH-NCR-Manila / Port Area', destination: 'PH-Cavite-Imus / DC', prePaidAmount: 8500 },
      ],
      claimTickets: [],
      paymentItems: [],
      deductionItems: [],
      totalAmountPayable: 8500,
      bankName: 'BPI',
      payeeAccount: '1234-5678-90',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: ['proof_PPA2604002.pdf'],
      createdAt: '2026-04-18T14:30:00.000Z',
      submittedAt: '2026-04-18T14:30:00.000Z',
      operationLogs: [
        { time: '2026-04-18T14:15:00.000Z', actor: 'Vendor', action: 'Saved as Draft', note: '' },
        { time: '2026-04-18T14:30:00.000Z', actor: 'Vendor', action: 'Submitted', note: 'Awaiting TMS review' },
      ] as OperationLogEntry[],
    },
    {
      applicationNo: 'PPA2604001',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Prepaid Application',
      status: 'Paid',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        { no: 'WB2604010', positionTime: '2026-04-12 09:00', unloadingTime: '2026-04-12 14:00', truckType: '10-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Cavite-Imus', prePaidAmount: 6000 },
        { no: 'WB2604011', positionTime: '2026-04-13 10:00', unloadingTime: '2026-04-13 13:00', truckType: '6-Wheeler',  origin: 'PH-Cavite-Imus', destination: 'PH-NCR-Taguig', prePaidAmount: 6000 },
      ],
      claimTickets: [],
      paymentItems: [
        { type: 'Basic Amount',     netAmount: 12000, vatRate: 0, vatAmount: 0, whtRate: 0, whtAmount: 0 },
      ],
      deductionItems: [],
      totalAmountPayable: 12000,
      bankName: 'BPI',
      payeeAccount: '1234-5678-90',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: ['proof_PPA2604001.pdf'],
      createdAt: '2026-04-10T08:30:00.000Z',
      submittedAt: '2026-04-10T08:30:00.000Z',
      reviewedAt: '2026-04-11T10:00:00.000Z',
      paidAt: '2026-04-12T16:00:00.000Z',
      operationLogs: [
        { time: '2026-04-10T08:30:00.000Z', actor: 'Vendor', action: 'Submitted', note: '' },
        { time: '2026-04-11T10:00:00.000Z', actor: 'TMS Reviewer', action: 'Approved', note: 'HR Payment request triggered' },
        { time: '2026-04-12T16:00:00.000Z', actor: 'HR System', action: 'Payment Released', note: 'APA2604001 — Payment completed' },
      ] as OperationLogEntry[],
    },
    {
      applicationNo: 'PPA2604004',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Prepaid Application',
      status: 'Rejected',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        { no: 'WB2604018', positionTime: '2026-04-14 09:00', unloadingTime: '2026-04-14 13:00', truckType: '4-Wheeler', origin: 'PH-NCR-Manila', destination: 'PH-Laguna-Calamba', prePaidAmount: 6000 },
      ],
      claimTickets: [],
      paymentItems: [],
      deductionItems: [],
      totalAmountPayable: 6000,
      bankName: 'BDO',
      payeeAccount: '9876-5432-10',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: [],
      rejectReason: 'Prepaid amount exceeds 80% of basic freight for WB2604018. Please reduce amount and resubmit.',
      createdAt: '2026-04-15T11:20:00.000Z',
      submittedAt: '2026-04-15T11:20:00.000Z',
      reviewedAt: '2026-04-16T08:00:00.000Z',
      operationLogs: [
        { time: '2026-04-15T11:20:00.000Z', actor: 'Vendor', action: 'Submitted', note: '' },
        { time: '2026-04-16T08:00:00.000Z', actor: 'TMS Reviewer', action: 'Rejected', note: 'Prepaid amount exceeds 80% of basic freight for WB2604018. Please reduce amount and resubmit.' },
      ] as OperationLogEntry[],
    },
  ];
}

const STATUS_STYLE: Record<SyncedAppStatus, React.CSSProperties> = {
  'Draft':                 { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'Awaiting Confirmation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Pending Payment':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Paid':                  { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Rejected':              { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Payment Rejected':      { background: '#fff1f0', color: '#a8071a', border: '1px solid #ff7875' },
};

const SOURCE_STYLE: Record<Source, React.CSSProperties> = {
  'Self-Created': { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3' },
  'TMS-Synced':   { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
};

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 4, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap',
};

const STATUS_OPTIONS: SyncedAppStatus[] = [
  'Draft', 'Awaiting Confirmation', 'Pending Payment', 'Paid', 'Rejected', 'Payment Rejected',
];

const EDITABLE_STATUSES = new Set<SyncedAppStatus>(['Draft', 'Rejected', 'Payment Rejected']);

function PrePaidApplicationList({ onCreate, onEdit, onDetail, refreshKey }: Props) {
  const [apps, setApps] = useState<SyncedApplication[]>([]);
  const [filterAppNo, setFilterAppNo] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Load from localStorage on mount and on refreshKey change. Seed if empty.
  useEffect(() => {
    let current = getAllApplications();
    if (current.length === 0) {
      buildSeedApplications().forEach(upsertApplication);
      current = getAllApplications();
    }
    setApps(current);
  }, [refreshKey]);

  const filtered = apps.filter(a => {
    if (filterAppNo && !a.applicationNo.toLowerCase().includes(filterAppNo.toLowerCase())) return false;
    const sourceLabel: Source = a.source === 'Vendor Portal' ? 'Self-Created' : 'TMS-Synced';
    if (filterSource && sourceLabel !== filterSource) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const handleReset = () => {
    setFilterAppNo('');
    setFilterSource('');
    setFilterStatus('');
  };

  return (
    <div className="vp-card">
      <div className="vp-card-title">
        <div>
          <div className="section-title">PrePaid Applications</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
            Apply for advance payment on in-progress waybills. Drafts can be edited; submissions are sent to TMS for review.
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ flexWrap: 'wrap', gap: '8px 12px', marginTop: 12, marginBottom: 12 }}>
        <input
          className="filter-input"
          placeholder="Application Number"
          value={filterAppNo}
          onChange={e => setFilterAppNo(e.target.value)}
          style={{ width: 200 }}
        />
        <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">Source: All</option>
          <option value="Self-Created">Self-Created</option>
          <option value="TMS-Synced">TMS-Synced</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Status: All</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-default" onClick={handleReset}>Reset</button>
          <button className="btn-primary">Search</button>
          <button className="btn-primary" onClick={onCreate}>+ Create PrePaid Application</button>
        </div>
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Application Number</th>
            <th>Source</th>
            <th style={{ textAlign: 'right' }}>Payable Amount</th>
            <th>Status</th>
            <th>Creation Time</th>
            <th>Operation</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a: SyncedApplication) => {
            const sourceLabel: Source = a.source === 'Vendor Portal' ? 'Self-Created' : 'TMS-Synced';
            const editable = EDITABLE_STATUSES.has(a.status);
            return (
              <tr key={a.applicationNo}>
                <td>
                  <strong style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => editable ? onEdit(a) : onDetail(a)}>
                    {a.applicationNo}
                  </strong>
                </td>
                <td><span style={{ ...BADGE_BASE, ...SOURCE_STYLE[sourceLabel] }}>{sourceLabel}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {a.totalAmountPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span style={{ ...BADGE_BASE, ...STATUS_STYLE[a.status] }}>{a.status}</span>
                  {a.rejectReason && (a.status === 'Rejected' || a.status === 'Payment Rejected') && (
                    <div style={{ fontSize: 11, color: '#cf1322', marginTop: 3, maxWidth: 220 }} title={a.rejectReason}>
                      ⚠ {a.rejectReason.length > 50 ? a.rejectReason.slice(0, 50) + '…' : a.rejectReason}
                    </div>
                  )}
                </td>
                <td style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{formatDateTime(a.createdAt)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {editable ? (
                    <button className="btn-link" onClick={() => onEdit(a)}>Edit</button>
                  ) : (
                    <button className="btn-link" onClick={() => onDetail(a)}>Detail</button>
                  )}
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="empty">No applications found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#666' }}>{filtered.length} Application(s)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default PrePaidApplicationList;
