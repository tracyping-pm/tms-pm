import React, { useState } from 'react';
import {
  type SyncedApplication,
  type SyncedAppStatus,
  formatDate,
  formatDateTime,
} from '../../../common/prepaidApplicationSync';

interface Props {
  app: SyncedApplication;
  onBack: () => void;
}

const STATUS_BADGE: Record<SyncedAppStatus, React.CSSProperties> = {
  'Draft':                 { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'Awaiting Confirmation': { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' },
  'Pending Payment':       { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  'Paid':                  { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  'Rejected':              { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Payment Rejected':      { background: '#fff1f0', color: '#a8071a', border: '1px solid #ff7875' },
};

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 4, padding: '3px 12px', fontSize: 13, display: 'inline-block',
};

const sectionStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6,
  padding: '20px 24px', marginBottom: 16,
};
const sectionTitleStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
};
const sectionBar: React.CSSProperties = {
  width: 4, height: 16, background: '#333', borderRadius: 2, flexShrink: 0,
};
const sectionLabel: React.CSSProperties = { fontWeight: 600, fontSize: 15 };

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function PrePaidApplicationDetail({ app, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');

  const sourceBadge: React.CSSProperties = app.source === 'Vendor Portal'
    ? { background: '#f0fcf4', color: '#00b96b', border: '1px solid #87e8a3' }
    : { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' };

  // Compute payment items from waybills if not yet set (for Awaiting Confirmation etc.)
  const paymentItems = app.paymentItems.length > 0
    ? app.paymentItems
    : [{
        type: 'Basic Amount',
        netAmount: app.totalAmountPayable,
        vatRate: 0,
        vatAmount: 0,
        whtRate: 0,
        whtAmount: 0,
      }];

  const deductionItems = app.deductionItems;

  const paymentAmount = paymentItems.reduce((s, p) => s + p.netAmount + p.vatAmount - p.whtAmount, 0)
    - deductionItems.reduce((s, d) => s + d.netAmount + d.vatAmount - d.whtAmount, 0);

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Back */}
      <div style={{ marginBottom: 12 }}>
        <button className="btn-link" style={{ fontSize: 13 }} onClick={onBack}>← Back to PrePaid Applications</button>
      </div>

      {/* Header bar */}
      <div style={{
        background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6,
        padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#333', marginRight: 4 }}>{app.applicationNo}</span>
        <span style={{ ...BADGE_BASE, ...STATUS_BADGE[app.status] }}>{app.status}</span>
        <span style={{ ...BADGE_BASE, ...sourceBadge }}>
          {app.source === 'Vendor Portal' ? 'Self-Created' : 'TMS-Synced'}
        </span>
        <div style={{ flex: 1 }} />
      </div>

      {/* Reject reason banner */}
      {(app.status === 'Rejected' || app.status === 'Payment Rejected') &&
       (app.rejectReason || app.hrRejectReason) && (
        <div style={{
          background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6,
          padding: '12px 20px', marginBottom: 16, fontSize: 13,
        }}>
          <div style={{ fontWeight: 600, color: '#cf1322', marginBottom: 4 }}>
            {app.status === 'Payment Rejected' ? 'HR Payment Rejected' : 'Application Rejected by TMS'}
          </div>
          <div style={{ color: '#333' }}>
            Reject Reason: {app.hrRejectReason || app.rejectReason}
          </div>
        </div>
      )}

      {/* Application Information */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Application information</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Statement Tax Mark</div>
            <div>{app.taxMark}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Total Amount Payable</div>
            <div style={{ fontWeight: 600 }}>{fmt(app.totalAmountPayable)}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Application Type</div>
            <div>PrePaid Application</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Create date</div>
            <div>{formatDate(app.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Associated Waybills */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Associated Waybills ({app.waybills.length})</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <button
            onClick={() => setActiveTab('waybill')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 0', fontSize: 14,
              fontWeight: activeTab === 'waybill' ? 600 : 400,
              color: activeTab === 'waybill' ? '#1677ff' : '#666',
              borderBottom: activeTab === 'waybill' ? '2px solid #1677ff' : '2px solid transparent',
            }}
          >
            Waybill List ({app.waybills.length})
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 0', fontSize: 14,
              fontWeight: activeTab === 'claim' ? 600 : 400,
              color: activeTab === 'claim' ? '#1677ff' : '#666',
              borderBottom: activeTab === 'claim' ? '2px solid #1677ff' : '2px solid transparent',
            }}
          >
            Claim Ticket List ({app.claimTickets.length})
          </button>
        </div>

        {activeTab === 'waybill' && (
          app.waybills.length === 0 ? (
            <div className="empty" style={{ padding: 24 }}>No waybills.</div>
          ) : (
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Waybill</th>
                  <th>Position Time</th>
                  <th>Unloading Time</th>
                  <th>Truck Type</th>
                  <th>Origin</th>
                  <th>Destination</th>
                </tr>
              </thead>
              <tbody>
                {app.waybills.map(w => (
                  <tr key={w.no}>
                    <td style={{ fontWeight: 500 }}>{w.no}</td>
                    <td>{w.positionTime}</td>
                    <td>{w.unloadingTime}</td>
                    <td>{w.truckType}</td>
                    <td>{w.origin || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td>{w.destination || <span style={{ color: '#bbb' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'claim' && (
          app.claimTickets.length === 0 ? (
            <div className="empty" style={{ padding: 24 }}>No claim tickets.</div>
          ) : (
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Claim Type</th>
                  <th>Related Waybill</th>
                  <th style={{ textAlign: 'right' }}>Claim Amount</th>
                </tr>
              </thead>
              <tbody>
                {app.claimTickets.map(t => (
                  <tr key={t.ticketNo}>
                    <td style={{ fontWeight: 500 }}>{t.ticketNo}</td>
                    <td>{t.claimType}</td>
                    <td>{t.relatedWaybill || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ textAlign: 'right', color: '#cf1322', fontWeight: 600 }}>{fmt(t.claimAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Amount Information */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Amount Information</span>
        </div>

        <div style={{ display: 'flex', gap: 32, marginBottom: 18, fontSize: 13 }}>
          <div>
            <span style={{ color: '#999', marginRight: 8 }}>Payment Amount</span>
            <strong>{fmt(paymentAmount)}</strong>
          </div>
        </div>

        {/* Payment Item */}
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
          Payment Item
        </div>
        <table className="data-table" style={{ fontSize: 12, marginBottom: 18 }}>
          <thead>
            <tr>
              <th>Payment Item Type</th>
              <th style={{ textAlign: 'right' }}>Net Amount</th>
              <th style={{ textAlign: 'right' }}>VAT Rate</th>
              <th style={{ textAlign: 'right' }}>VAT</th>
              <th style={{ textAlign: 'right' }}>WHT Rate</th>
              <th style={{ textAlign: 'right' }}>WHT</th>
            </tr>
          </thead>
          <tbody>
            {paymentItems.map((p, i) => (
              <tr key={i}>
                <td>{p.type}</td>
                <td style={{ textAlign: 'right' }}>{fmt(p.netAmount)}</td>
                <td style={{ textAlign: 'right' }}>{p.vatRate}%</td>
                <td style={{ textAlign: 'right' }}>{fmt(p.vatAmount)}</td>
                <td style={{ textAlign: 'right' }}>{p.whtRate}%</td>
                <td style={{ textAlign: 'right' }}>{fmt(p.whtAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Deduction Item */}
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
          Deduction Item
        </div>
        {deductionItems.length === 0 ? (
          <div style={{ fontSize: 13, color: '#999', padding: '12px 0' }}>No deduction items.</div>
        ) : (
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Payment Item Type</th>
                <th style={{ textAlign: 'right' }}>Net Amount</th>
                <th style={{ textAlign: 'right' }}>VAT Rate</th>
                <th style={{ textAlign: 'right' }}>VAT</th>
                <th style={{ textAlign: 'right' }}>WHT Rate</th>
                <th style={{ textAlign: 'right' }}>WHT</th>
              </tr>
            </thead>
            <tbody>
              {deductionItems.map((d, i) => (
                <tr key={i}>
                  <td>{d.type}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(d.netAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{d.vatRate}%</td>
                  <td style={{ textAlign: 'right' }}>{fmt(d.vatAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{d.whtRate}%</td>
                  <td style={{ textAlign: 'right' }}>{fmt(d.whtAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Information */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Payment Information</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 13 }}>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Bank Name</div>
            <div>{app.bankName || '—'}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Bank Account Name</div>
            <div>{app.payeeName || '—'}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4 }}>Payee Account</div>
            <div>{app.payeeAccount || '—'}</div>
          </div>
        </div>
      </div>

      {/* Supporting Documents & Remark */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={sectionBar} />
          <span style={sectionLabel}>Supporting Documents &amp; Remark</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
          <div>
            {app.proofFiles.length === 0 ? (
              <div style={{ fontSize: 13, color: '#999' }}>No documents uploaded.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {app.proofFiles.map((f, i) => (
                  <div key={i} style={{
                    width: 80, height: 80, border: '1px solid #d9d9d9', borderRadius: 6,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#555', background: '#f5f5f5',
                  }}>
                    <div style={{ fontSize: 24 }}>📄</div>
                    <div style={{ maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: 4, fontSize: 13 }}>Remark</div>
            <div style={{ fontSize: 13, padding: '8px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, minHeight: 80 }}>
              {app.remark || <span style={{ color: '#bbb' }}>—</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Operation Log */}
      <div className="vp-card">
        <div className="vp-card-title"><div className="section-title">Operation Log</div></div>
        {(app.operationLogs || []).length === 0 ? (
          <div style={{ fontSize: 13, color: '#bbb', padding: '8px 0' }}>No records.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(app.operationLogs || []).map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: i < (app.operationLogs!.length - 1) ? '1px solid #f0f0f0' : 'none', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', minWidth: 140 }}>{formatDateTime(log.time)}</div>
                <div style={{ fontSize: 12, color: '#595959', minWidth: 90 }}>{log.actor}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{log.action}{log.note ? <span style={{ fontWeight: 400, color: '#666', marginLeft: 6 }}>— {log.note}</span> : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrePaidApplicationDetail;
