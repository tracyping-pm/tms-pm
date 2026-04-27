import React from 'react';
import type {
  ApplicationStatus,
  HrPaymentStatus,
  WaybillPrepayStatus,
  Currency,
} from '../data/mockData';

export function formatAmount(value: number | undefined): string {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMoney(value: number | undefined, currency: Currency): string {
  if (value === undefined || value === null) return '-';
  return `${currency} ${formatAmount(value)}`;
}

const APP_STATUS_CLASS: Record<ApplicationStatus, string> = {
  Draft: 'draft',
  Synced: 'synced',
  Paid: 'paid',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
};

export function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`ppa-badge ${APP_STATUS_CLASS[status]}`}>{status}</span>;
}

const HR_STATUS_CLASS: Record<NonNullable<HrPaymentStatus>, string> = {
  'Pending Approval':    'info',
  'Pending Review':      'info',
  'Pending FA Approval': 'warn',
  'Pending Release':     'warn',
  'Released':            'success',
  'Closed':              'success',
  'Withdrawn':           'cancelled',
  'Released Error':      'rejected',
  'Rejected':            'rejected',
};

export function HrStatusBadge({ status }: { status: HrPaymentStatus }) {
  if (!status) return <span className="ppa-badge draft">Not Synced</span>;
  return <span className={`ppa-badge ${HR_STATUS_CLASS[status]}`}>{status}</span>;
}

const PREPAY_CLASS: Record<NonNullable<WaybillPrepayStatus>, string> = {
  'Pending Sync': 'pending-sync',
  'Pending HR':   'pending-hr',
  'Effective':    'effective',
  'Released':     'released',
};

export function PrepayStatusBadge({ status }: { status: WaybillPrepayStatus }) {
  if (!status) return <span className="ppa-badge draft">—</span>;
  return <span className={`ppa-badge ${PREPAY_CLASS[status]}`}>{status}</span>;
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}
export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <div className="ppa-form-row">
      <label className={required ? 'req' : ''}>{label}</label>
      <div>
        {children}
        {hint && !error && <div className="hint">{hint}</div>}
        {error && <div className="ppa-form-error">{error}</div>}
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="ppa-stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function Card({ title, tip, children, action }: { title?: React.ReactNode; tip?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="ppa-card">
      {(title || action) && (
        <div className="ppa-card-title">
          <span>{title}{tip && <span className="ppa-card-tip" style={{ marginLeft: 8 }}>{tip}</span>}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
