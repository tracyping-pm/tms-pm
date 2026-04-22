import React from 'react';
import { CLAIM_TICKETS } from '../data/claimTickets';

interface Props {
  ticketNo: string;
  onBack: () => void;
  onDispute: () => void;
  returnLabel?: string;
}

function ClaimTicketDetail({ ticketNo, onBack, onDispute, returnLabel = '← Back to Claim Tickets' }: Props) {
  const ticket = CLAIM_TICKETS.find(t => t.ticketNo === ticketNo);

  if (!ticket) {
    return (
      <div className="vp-card">
        <button className="btn-link" onClick={onBack}>← Back</button>
        <div className="empty">Ticket {ticketNo} not found.</div>
      </div>
    );
  }

  const canAct = ticket.status === 'Pending Vendor Confirm';

  return (
    <>
      <div className="vp-card" style={{ padding: 14, marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack}>{returnLabel}</button>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div>
            <div className="section-title">{ticket.ticketNo}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Created by {ticket.creator} · {ticket.creationTime}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`tag ${ticket.status === 'Pending Vendor Confirm' ? 'tag-discrepancy-pending' : ticket.status === 'Vendor Disputed' ? 'tag-rejected' : ticket.status === 'Completed' ? 'tag-matched' : 'tag-under-review'}`}>
              {ticket.status}
            </span>
          </div>
        </div>

        {canAct && (
          <div className="alert alert-info" style={{ borderLeftColor: '#fa8c16', background: '#fff7e6' }}>
            <span>⚠</span>
            该 Claim Ticket 等待您确认。请仔细核对索赔金额与凭证，可选择 <strong>Confirm</strong>（同意纳入扣款）或 <strong>Dispute</strong>（提交异议，需附证据）。
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Claim Type L1</div>
            <div className="detail-value">{ticket.claimTypeL1}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Claim Type L2</div>
            <div className="detail-value">{ticket.claimTypeL2}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Claim Amount</div>
            <div className="detail-value" style={{ color: '#cf1322', fontWeight: 600 }}>
              -{ticket.claimAmount.toLocaleString()} {ticket.currency}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Claimant</div>
            <div className="detail-value">{ticket.claimant}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Responsible Party</div>
            <div className="detail-value">{ticket.responsibleParty}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Waybill Based</div>
            <div className="detail-value">{ticket.isWaybillBased ? `Yes · ${ticket.relatedWaybill || '—'}` : 'No'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Deduction for Vendor</div>
            <div className="detail-value">{ticket.deductionForVendor}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Linked Settlement</div>
            <div className="detail-value">{ticket.linkedSettlementApNo || <span style={{ color: '#999' }}>尚未关联</span>}</div>
          </div>
        </div>
      </div>

      <div className="vp-card">
        <div className="vp-card-title">
          <div className="section-title">Claim Details</div>
        </div>
        <div style={{ padding: '4px 12px 12px', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {ticket.claimDetails || <span style={{ color: '#999' }}>(No details provided)</span>}
        </div>

        <div className="vp-card-title" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <div className="section-title" style={{ fontSize: 13 }}>Attachments</div>
        </div>
        <div style={{ padding: '4px 12px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: 4, padding: '4px 10px', fontSize: 12 }}>
            📎 damage-photo-01.jpg
          </span>
          <span style={{ background: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: 4, padding: '4px 10px', fontSize: 12 }}>
            📎 customer-complaint.pdf
          </span>
        </div>
      </div>

      {ticket.resolutionNote && (
        <div className="vp-card">
          <div className="vp-card-title">
            <div className="section-title">Resolution Note</div>
          </div>
          <div style={{ padding: '4px 12px 12px', fontSize: 13, lineHeight: 1.7 }}>
            {ticket.resolutionNote}
          </div>
        </div>
      )}

      {canAct && (
        <div className="vp-card" style={{ padding: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-default" onClick={onDispute}>Dispute</button>
          <button className="btn-primary" onClick={onBack}>Confirm (Mock)</button>
        </div>
      )}
    </>
  );
}

export default ClaimTicketDetail;
