import React, { useMemo, useState } from 'react';
import {
  APPLICATIONS,
  type ApplicationStatus,
  type CountryCode,
  type PartialPaymentApplication,
} from '../data/mockData';
import { AppStatusBadge, HrStatusBadge, Stat, formatMoney } from './UI';

interface Props {
  onCreate: () => void;
  onOpen: (applicationNo: string) => void;
}

const STATUS_OPTIONS: ('All' | ApplicationStatus)[] = ['All', 'Draft', 'Synced', 'Paid', 'Rejected', 'Cancelled'];
const COUNTRY_OPTIONS: ('All' | CountryCode)[] = ['All', 'PH', 'TH', 'Group'];

export default function ApplicationList({ onCreate, onOpen }: Props) {
  const [status, setStatus] = useState<'All' | ApplicationStatus>('All');
  const [country, setCountry] = useState<'All' | CountryCode>('All');
  const [keyword, setKeyword] = useState('');

  const list = useMemo(() => {
    return APPLICATIONS.filter(a =>
      (status === 'All' || a.status === status) &&
      (country === 'All' || a.countryCode === country) &&
      (!keyword ||
        a.applicationNo.toLowerCase().includes(keyword.toLowerCase()) ||
        a.vendorName.toLowerCase().includes(keyword.toLowerCase()))
    );
  }, [status, country, keyword]);

  const totalCount = APPLICATIONS.length;
  const draftCount = APPLICATIONS.filter(a => a.status === 'Draft').length;
  const inHrCount = APPLICATIONS.filter(a => a.status === 'Synced').length;
  const paidCount = APPLICATIONS.filter(a => a.status === 'Paid').length;
  const rejectedCount = APPLICATIONS.filter(a => a.status === 'Rejected').length;

  return (
    <>
      <div className="ppa-page-header">
        <div>
          <div className="ppa-page-title">Partial Payment Application</div>
          <div className="ppa-page-sub">Vendor 预付款申请单 — Financial Process</div>
        </div>
        <button className="ppa-btn primary" onClick={onCreate}>+ Create Application</button>
      </div>

      <div className="ppa-stats-row" style={{ marginBottom: 16 }}>
        <Stat label="Total" value={totalCount} />
        <Stat label="Draft" value={draftCount} sub="Pending Submit" />
        <Stat label="In HR Approval" value={inHrCount} sub="Synced — waiting for Released" />
        <Stat label="Paid" value={paidCount} sub="HR Released / Closed" />
        <Stat label="Rejected" value={rejectedCount} sub="Released back to pool" />
      </div>

      <div className="ppa-card">
        <div className="ppa-filters">
          <div className="ppa-filter-item">
            <label>Status</label>
            <select className="ppa-select" value={status} onChange={e => setStatus(e.target.value as any)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ppa-filter-item">
            <label>Country</label>
            <select className="ppa-select" value={country} onChange={e => setCountry(e.target.value as any)}>
              {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="ppa-filter-item" style={{ flex: 1 }}>
            <label>Search</label>
            <input
              className="ppa-input"
              style={{ minWidth: 240 }}
              placeholder="Application No. / Vendor"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <table className="ppa-table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Vendor</th>
              <th>Country</th>
              <th>Currency</th>
              <th className="num">Total Payable</th>
              <th>Status</th>
              <th>HR Status</th>
              <th>HR Sync</th>
              <th>Created At</th>
              <th>Created By</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={11} className="ppa-table-empty">No applications match the filters.</td></tr>
            )}
            {list.map(a => (
              <Row key={a.applicationNo} app={a} onOpen={onOpen} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Row({ app, onOpen }: { app: PartialPaymentApplication; onOpen: (no: string) => void }) {
  return (
    <tr>
      <td>
        <span className="ppa-table-link ppa-mono" onClick={() => onOpen(app.applicationNo)}>{app.applicationNo}</span>
      </td>
      <td>{app.vendorName}</td>
      <td>{app.countryCode}</td>
      <td>{app.currency}</td>
      <td className="num">{formatMoney(app.totalPayable, app.currency)}</td>
      <td><AppStatusBadge status={app.status} /></td>
      <td><HrStatusBadge status={app.hrPaymentStatus} /></td>
      <td className="ppa-mono" style={{ fontSize: 12, color: '#6b7280' }}>{app.hrLastSyncedAt ?? '-'}</td>
      <td className="ppa-mono" style={{ fontSize: 12, color: '#6b7280' }}>{app.createdAt}</td>
      <td>{app.createdBy}</td>
      <td>
        <button className="ppa-btn link" onClick={() => onOpen(app.applicationNo)}>View</button>
      </td>
    </tr>
  );
}
