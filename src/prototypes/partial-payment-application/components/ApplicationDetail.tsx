import React from 'react';
import {
  APPLICATIONS,
  ENTITY_LABEL,
  WAYBILLS,
  type PartialPaymentApplication,
} from '../data/mockData';
import { AppStatusBadge, Card, formatAmount, formatMoney, HrStatusBadge, PrepayStatusBadge } from './UI';

interface Props {
  applicationNo: string;
  onBack: () => void;
  onTransfer: (applicationNo: string, waybillNo: string) => void;
}

export default function ApplicationDetail({ applicationNo, onBack, onTransfer }: Props) {
  const app = APPLICATIONS.find(a => a.applicationNo === applicationNo);
  if (!app) {
    return (
      <Card>
        <div className="ppa-table-empty">Application not found.</div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="ppa-btn" onClick={onBack}>← Back</button>
        </div>
      </Card>
    );
  }

  const showFinanceActions = app.status === 'Synced' || app.status === 'Paid';
  const showRefresh = app.status === 'Synced';
  const showCancel = app.status === 'Draft' || app.status === 'Synced';

  return (
    <>
      <div className="ppa-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="ppa-page-title ppa-mono">{app.applicationNo}</span>
            <AppStatusBadge status={app.status} />
          </div>
          <div className="ppa-page-sub">{app.vendorName} · {app.countryCode} · {ENTITY_LABEL[app.companyEntity]}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ppa-btn" onClick={onBack}>← Back</button>
          {showRefresh && <button className="ppa-btn">⟳ Refresh HR Status</button>}
          {showCancel && <button className="ppa-btn danger">Cancel Application</button>}
        </div>
      </div>

      {/* HR Sync card */}
      <Card title="HR Sync Status" tip={app.hrLastSyncedAt ? `Last synced ${app.hrLastSyncedAt}` : 'Not synced yet'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>HR Payment Number</div>
            <div className="ppa-mono">{app.hrPaymentNumber ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>HR Status (`PaymentStatusShowEnum`)</div>
            <HrStatusBadge status={app.hrPaymentStatus} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Effect on Settlement</div>
            <div style={{ fontSize: 13 }}>
              {app.status === 'Paid' && <span style={{ color: '#047857' }}>✓ Counted in AP Statement deduction</span>}
              {app.status === 'Synced' && <span style={{ color: '#b45309' }}>⏸ Held — not deducted yet</span>}
              {app.status === 'Rejected' && <span style={{ color: '#b91c1c' }}>✗ Released back to pool</span>}
              {app.status === 'Draft' && <span style={{ color: '#6b7280' }}>—</span>}
              {app.status === 'Cancelled' && <span style={{ color: '#6b7280' }}>—</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Basic info */}
      <Card title="Basic Information">
        <div className="ppa-detail-grid">
          <div className="label">Vendor</div><div className="value">{app.vendorName} ({app.vendorId})</div>
          <div className="label">Country / Entity</div><div className="value">{app.countryCode} / {ENTITY_LABEL[app.companyEntity]}</div>
          <div className="label">Currency</div><div className="value">{app.currency}</div>
          <div className="label">Allocation Mode</div><div className="value">{app.allocationMode}{app.prepaidRatio ? ` · ${app.prepaidRatio}%` : ''}</div>
          <div className="label">Tax-Inclusive</div><div className="value">{app.taxInclusive ? 'Yes' : 'No'}</div>
          <div className="label">VAT / WHT</div><div className="value">{app.vatRate}% / {app.whtRate}%</div>
          <div className="label">Net Amount</div><div className="value">{formatMoney(app.netAmount, app.currency)}</div>
          <div className="label">VAT Amount</div><div className="value">{formatMoney(app.vatAmount, app.currency)}</div>
          <div className="label">WHT Amount (deducted)</div><div className="value">{formatMoney(app.whtAmount, app.currency)}</div>
          <div className="label">Total Payable</div><div className="value" style={{ fontWeight: 600 }}>{formatMoney(app.totalPayable, app.currency)}</div>
          <div className="label">Created</div><div className="value">{app.createdAt} by {app.createdBy}</div>
          <div className="label">Submitted</div><div className="value">{app.submittedAt ?? '—'}</div>
          <div className="label">Paid</div><div className="value">{app.paidAt ?? '—'}</div>
          <div className="label">Proof</div>
          <div className="value">
            {app.documents.length === 0 ? '—' : app.documents.map(d => (
              <span key={d.id} className="ppa-link" style={{ marginRight: 12 }}>📎 {d.name}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Items */}
      <Card title="Allocated Waybills" tip={`${app.items.length} waybill(s)`}>
        <table className="ppa-table">
          <thead>
            <tr>
              <th>Waybill No.</th>
              <th>Status</th>
              <th>Route</th>
              <th className="num">Basic Amount Snapshot</th>
              <th className="num">Allocated Amount</th>
              <th>Prepay Status</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {app.items.length === 0 && (
              <tr><td colSpan={8} className="ppa-table-empty">No allocated waybills (released back to pool).</td></tr>
            )}
            {app.items.map(it => {
              const wb = WAYBILLS.find(w => w.waybillNo === it.waybillNo);
              return (
                <tr key={it.waybillNo}>
                  <td className="ppa-mono">{it.waybillNo}</td>
                  <td>{wb?.status ?? '-'}</td>
                  <td>{wb ? `${wb.origin} → ${wb.destination}` : '-'}</td>
                  <td className="num">{formatAmount(it.basicAmountSnapshot)}</td>
                  <td className="num" style={{ fontWeight: 500 }}>{formatAmount(it.allocatedAmount)}</td>
                  <td><PrepayStatusBadge status={wb?.prepayStatus ?? null} /></td>
                  <td className="ppa-mono" style={{ fontSize: 12, color: '#6b7280' }}>
                    {it.transferredFrom ? `↪ ${it.transferredFrom}` : '—'}
                  </td>
                  <td>
                    {showFinanceActions && wb && wb.status !== 'Cancelled' && (
                      <button
                        className="ppa-btn link"
                        onClick={() => onTransfer(app.applicationNo, it.waybillNo)}
                      >Cancel Waybill →</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* HR audit trail */}
      <Card title="HR Approval Timeline" tip="Mirrored from HR `PaymentOngoingApprovalEnum`">
        <HrTimeline app={app} />
      </Card>
    </>
  );
}

function HrTimeline({ app }: { app: PartialPaymentApplication }) {
  // Synthesize a realistic timeline based on current status.
  type Step = { title: string; meta?: string; status: 'done' | 'active' | 'error' | 'pending' };
  const steps: Step[] = [];

  const submitted = !!app.submittedAt;
  const released = app.hrPaymentStatus === 'Released' || app.hrPaymentStatus === 'Closed';
  const rejected = app.hrPaymentStatus === 'Rejected' || app.hrPaymentStatus === 'Released Error' || app.hrPaymentStatus === 'Withdrawn';

  steps.push({
    title: 'Created in TMS',
    meta: `${app.createdBy} · ${app.createdAt}`,
    status: 'done',
  });
  if (submitted) {
    steps.push({
      title: 'Submitted to HR · /api/payment/create',
      meta: `${app.submittedAt} · HR No. ${app.hrPaymentNumber}`,
      status: 'done',
    });
  } else {
    steps.push({ title: 'Submit to HR', status: 'pending' });
  }

  const stages: { key: string; reachedAt: Set<string> }[] = [
    { key: '1st Approval (firstApprover)', reachedAt: new Set(['Pending Review','Pending FA Approval','Pending Release','Released','Closed']) },
    { key: 'Accounting Review (accountingReview)', reachedAt: new Set(['Pending FA Approval','Pending Release','Released','Closed']) },
    { key: "FA Head's Approval (faHeadApproval)", reachedAt: new Set(['Pending Release','Released','Closed']) },
    { key: 'Treasury Release (treasuryRelease)', reachedAt: new Set(['Released','Closed']) },
  ];

  if (rejected) {
    steps.push({ title: 'HR Rejected / Withdrawn', meta: app.hrLastSyncedAt, status: 'error' });
  } else {
    stages.forEach((s, idx) => {
      if (s.reachedAt.has(app.hrPaymentStatus ?? '')) {
        steps.push({ title: s.key, status: 'done', meta: idx === stages.length - 1 ? app.paidAt : undefined });
      } else if (submitted && (idx === 0 || stages[idx - 1].reachedAt.has(app.hrPaymentStatus ?? ''))) {
        steps.push({ title: s.key, status: 'active', meta: 'In progress' });
      } else {
        steps.push({ title: s.key, status: 'pending' });
      }
    });
  }

  if (released) {
    steps.push({ title: 'TMS marks Application as Paid; waybill prepayment Effective', meta: app.paidAt, status: 'done' });
  } else if (rejected) {
    steps.push({ title: 'TMS releases waybill association', meta: app.hrLastSyncedAt, status: 'error' });
  } else {
    steps.push({ title: 'TMS waiting for HR Released / Closed', status: 'pending' });
  }

  return (
    <div className="ppa-timeline">
      {steps.map((s, i) => (
        <div key={i} className={`ppa-timeline-item ${s.status === 'pending' ? '' : s.status}`}>
          <div className="title">{s.title}</div>
          {s.meta && <div className="meta">{s.meta}</div>}
        </div>
      ))}
    </div>
  );
}
