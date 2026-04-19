import React, { useMemo, useState } from 'react';
import { CLAIM_TICKETS, type ClaimStatus, type DeductionState } from '../data/claimTickets';

interface Props {
  onOpenDetail: (ticketNo: string) => void;
}

const STATUS_OPTIONS: ClaimStatus[] = [
  'Ongoing Validation',
  'Claim team review',
  'Pending Vendor Confirm',
  'Vendor Disputed',
  'For Deduction',
  'Closed',
  'Canceled',
];

const DEDUCTION_OPTIONS: (DeductionState | 'all')[] = ['all', 'For Deduction', 'Deducted', 'Not Linked AP', 'Written Off'];

function statusTagClass(s: ClaimStatus): string {
  switch (s) {
    case 'Pending Vendor Confirm': return 'tag-discrepancy-pending';
    case 'Vendor Disputed': return 'tag-rejected';
    case 'For Deduction': return 'tag-under-review';
    case 'Claim team review': return 'tag-under-review';
    case 'Ongoing Validation': return 'tag-draft';
    case 'Closed': return 'tag-matched';
    case 'Canceled': return 'tag-draft';
  }
}

function ClaimTicketList({ onOpenDetail }: Props) {
  const [kw, setKw] = useState('');
  const [claimType, setClaimType] = useState<string>('all');
  const [statusSel, setStatusSel] = useState<Set<ClaimStatus>>(new Set());
  const [deduction, setDeduction] = useState<string>('all');
  const [showTerminal, setShowTerminal] = useState(false);

  const filtered = useMemo(() => {
    return CLAIM_TICKETS.filter(t => {
      if (!showTerminal && (t.status === 'Closed' || t.status === 'Canceled')) return false;
      if (kw && !t.ticketNo.toUpperCase().includes(kw.toUpperCase())
          && !t.claimTypeL2.toLowerCase().includes(kw.toLowerCase())) return false;
      if (claimType !== 'all' && t.claimTypeL1 !== claimType) return false;
      if (statusSel.size > 0 && !statusSel.has(t.status)) return false;
      if (deduction !== 'all' && t.deductionForVendor !== deduction) return false;
      return true;
    });
  }, [kw, claimType, statusSel, deduction, showTerminal]);

  const toggleStatus = (s: ClaimStatus) => {
    const n = new Set(statusSel);
    if (n.has(s)) n.delete(s); else n.add(s);
    setStatusSel(n);
  };

  const reset = () => {
    setKw('');
    setClaimType('all');
    setStatusSel(new Set());
    setDeduction('all');
    setShowTerminal(false);
  };

  const counts = {
    total: CLAIM_TICKETS.length,
    pending: CLAIM_TICKETS.filter(t => t.status === 'Pending Vendor Confirm').length,
    disputed: CLAIM_TICKETS.filter(t => t.status === 'Vendor Disputed').length,
    forDeduction: CLAIM_TICKETS.filter(t => t.deductionForVendor === 'For Deduction').length,
  };

  return (
    <>
      <div className="vp-kpi-row">
        <div className="vp-kpi"><div className="vp-kpi-label">Total Claim Tickets</div><div className="vp-kpi-value">{counts.total}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Pending Vendor Confirm</div><div className="vp-kpi-value orange">{counts.pending}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">Vendor Disputed</div><div className="vp-kpi-value red">{counts.disputed}</div></div>
        <div className="vp-kpi"><div className="vp-kpi-label">For Deduction</div><div className="vp-kpi-value blue">{counts.forDeduction}</div></div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">My Claim Tickets</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            默认隐藏 Closed / Canceled，
            <button className="btn-link" style={{ padding: 0 }} onClick={() => setShowTerminal(v => !v)}>
              {showTerminal ? '隐藏终态' : '查看全部'}
            </button>
          </div>
        </div>

        <div className="alert alert-info">
          <span>ⓘ</span>
          Claim Ticket 由 TMS Claim 团队或 Inteluck 内部发起。处于 <strong>Pending Vendor Confirm</strong> 状态时，您可以选择 Confirm 或 Dispute。
        </div>

        <div className="filter-row">
          <input
            className="filter-input"
            placeholder="Ticket No. / Claim Type"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <select className="filter-select" value={claimType} onChange={(e) => setClaimType(e.target.value)}>
            <option value="all">All Claim Type</option>
            <option value="External">External</option>
            <option value="Internal">Internal</option>
          </select>
          <select className="filter-select" value={deduction} onChange={(e) => setDeduction(e.target.value)}>
            {DEDUCTION_OPTIONS.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'All Deduction' : d}</option>
            ))}
          </select>
          <input className="filter-input" placeholder="Creation Time: YYYY-MM-DD" />
          <button className="btn-default" onClick={reset}>Reset</button>
          <button className="btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#666', marginRight: 4, alignSelf: 'center' }}>Status:</span>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`tag ${statusSel.has(s) ? statusTagClass(s) : 'tag-draft'}`}
              onClick={() => toggleStatus(s)}
              style={{ cursor: 'pointer', border: statusSel.has(s) ? '1px solid #333' : '1px solid transparent' }}
            >
              {s}
            </button>
          ))}
          {statusSel.size > 0 && (
            <button className="btn-link" style={{ fontSize: 12 }} onClick={() => setStatusSel(new Set())}>Clear</button>
          )}
        </div>

        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket No.</th>
                <th>Claim Type</th>
                <th className="num">Claim Amount</th>
                <th>Claimant</th>
                <th>Responsible Party</th>
                <th>Related Waybill</th>
                <th>Deduction for Vendor</th>
                <th>Status</th>
                <th>Creation Time</th>
                <th>Operate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.ticketNo}>
                  <td><button className="btn-link" onClick={() => onOpenDetail(t.ticketNo)}>{t.ticketNo}</button></td>
                  <td style={{ fontSize: 12 }}>
                    <div>{t.claimTypeL1}</div>
                    <div style={{ color: '#666' }}>{t.claimTypeL2}</div>
                  </td>
                  <td className="num" style={{ color: '#cf1322' }}>-{t.claimAmount.toLocaleString()}</td>
                  <td style={{ fontSize: 12 }}>{t.claimant}</td>
                  <td>{t.responsibleParty}</td>
                  <td>{t.relatedWaybill || <span style={{ color: '#999' }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{t.deductionForVendor}</td>
                  <td><span className={`tag ${statusTagClass(t.status)}`}>{t.status}</span></td>
                  <td style={{ fontSize: 12, color: '#666' }}>{t.creationTime}</td>
                  <td>
                    <button className="btn-link" onClick={() => onOpenDetail(t.ticketNo)}>Details</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="empty">No claim tickets match the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

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

export default ClaimTicketList;
