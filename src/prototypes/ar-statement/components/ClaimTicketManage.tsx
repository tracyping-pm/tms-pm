import React, { useState } from 'react';

interface ClaimTicketManageProps {
  onBack: () => void;
}

interface ClaimTicket {
  ticketNo: string;
  claimType: string;
  relatedWaybill: string;
  customer: string;
  claimAmount: string;
  currency: string;
  claimReason: string;
  status: string;
  createdDate: string;
  createdBy: string;
  canDelete: boolean;
}

interface CreateClaimForm {
  claimType: string;
  relatedWaybill: string;
  claimAmount: string;
  currency: string;
  customer: string;
  claimDate: string;
  claimReason: string;
}

const SAMPLE_DATA: ClaimTicket[] = [
  {
    ticketNo: 'CLM2024010001',
    claimType: 'Damage',
    relatedWaybill: 'WB2024010001',
    customer: 'Customer A',
    claimAmount: '₱2,500.00',
    currency: 'USD',
    claimReason: 'Cargo damage during transit',
    status: 'Approved',
    createdDate: '2024-01-10',
    createdBy: 'Admin',
    canDelete: false,
  },
  {
    ticketNo: 'CLM2024010002',
    claimType: 'Shortage',
    relatedWaybill: 'WB2024010002',
    customer: 'Customer A',
    claimAmount: '₱800.00',
    currency: 'USD',
    claimReason: '5 pieces missing',
    status: 'Pending',
    createdDate: '2024-01-12',
    createdBy: 'Admin',
    canDelete: true,
  },
  {
    ticketNo: 'CLM2024010003',
    claimType: 'Delay',
    relatedWaybill: 'WB2024010003',
    customer: 'Customer B',
    claimAmount: '₱1,200.00',
    currency: 'USD',
    claimReason: 'Delivery delayed by 5 days',
    status: 'Processing',
    createdDate: '2024-01-14',
    createdBy: 'Admin',
    canDelete: false,
  },
];

const EMPTY_FORM: CreateClaimForm = {
  claimType: '',
  relatedWaybill: '',
  claimAmount: '',
  currency: 'USD',
  customer: '',
  claimDate: '',
  claimReason: '',
};

function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'Approved':
      return {
        display: 'inline-block',
        background: '#52c41a',
        color: '#fff',
        borderRadius: 4,
        padding: '2px 10px',
        fontSize: 12,
        whiteSpace: 'nowrap' as const,
        fontWeight: 500,
      };
    case 'Pending':
      return {
        display: 'inline-block',
        background: '#1890ff',
        color: '#fff',
        borderRadius: 4,
        padding: '2px 10px',
        fontSize: 12,
        whiteSpace: 'nowrap' as const,
        fontWeight: 500,
      };
    case 'Processing':
      return {
        display: 'inline-block',
        background: '#fa8c16',
        color: '#fff',
        borderRadius: 4,
        padding: '2px 10px',
        fontSize: 12,
        whiteSpace: 'nowrap' as const,
        fontWeight: 500,
      };
    case 'Rejected':
      return {
        display: 'inline-block',
        background: '#ff4d4f',
        color: '#fff',
        borderRadius: 4,
        padding: '2px 10px',
        fontSize: 12,
        whiteSpace: 'nowrap' as const,
        fontWeight: 500,
      };
    default:
      return {
        display: 'inline-block',
        background: '#f5f5f5',
        color: '#595959',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        padding: '2px 10px',
        fontSize: 12,
        whiteSpace: 'nowrap' as const,
      };
  }
}

function ClaimTicketManage({ onBack }: ClaimTicketManageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateClaimForm>(EMPTY_FORM);

  // Filter state
  const [filterTicketNo, setFilterTicketNo] = useState('');
  const [filterClaimType, setFilterClaimType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRelatedWaybill, setFilterRelatedWaybill] = useState('');

  const totalItems = SAMPLE_DATA.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleReset = () => {
    setFilterTicketNo('');
    setFilterClaimType('');
    setFilterStatus('');
    setFilterRelatedWaybill('');
  };

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleSave = () => {
    // In a real implementation, this would submit the form data
    setShowCreateModal(false);
  };

  const handleFormChange = (field: keyof CreateClaimForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    height: 30,
    padding: '0 8px',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    fontSize: 13,
    color: '#333',
    outline: 'none',
    minWidth: 130,
  };

  const selectFilterStyle: React.CSSProperties = {
    height: 30,
    padding: '0 8px',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    fontSize: 13,
    color: '#333',
    outline: 'none',
    minWidth: 130,
    background: '#fff',
    cursor: 'pointer',
  };

  const btnPrimaryStyle: React.CSSProperties = {
    background: '#00b96b',
    border: 'none',
    color: '#fff',
    borderRadius: 4,
    padding: '5px 14px',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    height: 30,
    whiteSpace: 'nowrap' as const,
  };

  const btnDefaultStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #d9d9d9',
    color: '#333',
    borderRadius: 4,
    padding: '5px 14px',
    fontSize: 13,
    cursor: 'pointer',
    height: 30,
    whiteSpace: 'nowrap' as const,
  };

  const modalLabelStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    display: 'block',
  };

  const modalInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    fontSize: 13,
    color: '#333',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const modalSelectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    fontSize: 13,
    color: '#333',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
    cursor: 'pointer',
  };

  const requiredStar = <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>;

  const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '3px 8px',
    border: '1px solid #d9d9d9',
    borderRadius: 3,
    background: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? '#bbb' : '#333',
    fontSize: 12,
  });

  const pageNumStyle = (active: boolean): React.CSSProperties => ({
    padding: '3px 8px',
    border: active ? '1px solid #00b96b' : '1px solid #d9d9d9',
    borderRadius: 3,
    background: active ? '#00b96b' : '#fff',
    color: active ? '#fff' : '#333',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 4,
          padding: 16,
        }}
      >
        {/* Page title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="section-title" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>
            Claim Ticket Manage
          </div>
          <button
            className="btn-primary"
            onClick={handleOpenModal}
            style={btnPrimaryStyle}
          >
            + Create Claim Ticket
          </button>
        </div>

        {/* Filter bar */}
        <div
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            padding: '12px 12px 8px 12px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="filter-input"
              style={inputStyle}
              placeholder="Ticket No."
              value={filterTicketNo}
              onChange={(e) => setFilterTicketNo(e.target.value)}
            />
            <select
              className="filter-select"
              style={selectFilterStyle}
              value={filterClaimType}
              onChange={(e) => setFilterClaimType(e.target.value)}
            >
              <option value="">Claim Type: All</option>
              <option value="Damage">Damage</option>
              <option value="Shortage">Shortage</option>
              <option value="Delay">Delay</option>
              <option value="Other">Other</option>
            </select>
            <select
              className="filter-select"
              style={selectFilterStyle}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
            <input
              className="filter-input"
              style={inputStyle}
              placeholder="Related Waybill"
              value={filterRelatedWaybill}
              onChange={(e) => setFilterRelatedWaybill(e.target.value)}
            />
            <button className="btn-primary" style={btnPrimaryStyle}>
              Search
            </button>
            <button className="btn-default" onClick={handleReset} style={btnDefaultStyle}>
              Reset
            </button>
          </div>
        </div>

        {/* Data table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 1100, width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Ticket No.
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Claim Type
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Related Waybill
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Customer
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Claim Amount
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Currency
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8' }}>
                  Claim Reason
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Status
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Created Date
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Created By
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '1px solid #e8e8e8', whiteSpace: 'nowrap' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DATA.map((row) => (
                <tr key={row.ticketNo} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                    <span
                      className="link-blue"
                      style={{ color: '#1677ff', cursor: 'pointer' }}
                    >
                      {row.ticketNo}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', color: '#333' }}>
                    {row.claimType}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                    <span
                      className="link-blue"
                      style={{ color: '#1677ff', cursor: 'pointer' }}
                    >
                      {row.relatedWaybill}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', color: '#333' }}>
                    {row.customer}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', textAlign: 'right', color: '#ff4d4f', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {row.claimAmount}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', color: '#333' }}>
                    {row.currency}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', color: '#555', maxWidth: 220 }}>
                    {row.claimReason}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                    <span style={getStatusBadgeStyle(row.status)}>{row.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', color: '#333', whiteSpace: 'nowrap' }}>
                    {row.createdDate}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', color: '#333' }}>
                    {row.createdBy}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <span
                      className="link-blue"
                      style={{ color: '#1677ff', cursor: 'pointer', marginRight: 10 }}
                      title="View"
                    >
                      &#128065;
                    </span>
                    <span
                      className="link-blue"
                      style={{ color: '#1677ff', cursor: 'pointer', marginRight: row.canDelete ? 10 : 0 }}
                      title="Edit"
                    >
                      &#9998;
                    </span>
                    {row.canDelete && (
                      <span
                        className="link-blue"
                        style={{ color: '#ff4d4f', cursor: 'pointer' }}
                        title="Delete"
                      >
                        &#128465;
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <span style={{ fontSize: 13, color: '#555' }}>
            Total <b>{totalItems}</b> items
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              style={pageBtnStyle(currentPage === 1)}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              «
            </button>
            <button
              style={pageBtnStyle(currentPage === 1)}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                style={pageNumStyle(currentPage === p)}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              style={pageBtnStyle(currentPage === totalPages)}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            >
              ›
            </button>
            <button
              style={pageBtnStyle(currentPage === totalPages)}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              »
            </button>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{
                marginLeft: 8,
                height: 28,
                border: '1px solid #d9d9d9',
                borderRadius: 3,
                fontSize: 12,
                padding: '0 4px',
                color: '#333',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Claim Ticket Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 6,
              width: 520,
              maxWidth: '95vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Create Claim Ticket</span>
              <span
                style={{ fontSize: 18, color: '#999', cursor: 'pointer', lineHeight: 1 }}
                onClick={handleCloseModal}
              >
                &times;
              </span>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 20px 8px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Claim Type */}
              <div>
                <label style={modalLabelStyle}>
                  {requiredStar}Claim Type
                </label>
                <select
                  style={modalSelectStyle}
                  value={form.claimType}
                  onChange={(e) => handleFormChange('claimType', e.target.value)}
                >
                  <option value="">Please select</option>
                  <option value="Damage">Damage</option>
                  <option value="Shortage">Shortage</option>
                  <option value="Delay">Delay</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Related Waybill */}
              <div>
                <label style={modalLabelStyle}>
                  {requiredStar}Related Waybill
                </label>
                <input
                  type="text"
                  style={modalInputStyle}
                  placeholder="Enter waybill number"
                  value={form.relatedWaybill}
                  onChange={(e) => handleFormChange('relatedWaybill', e.target.value)}
                />
              </div>

              {/* Claim Amount + Currency row */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 2 }}>
                  <label style={modalLabelStyle}>
                    {requiredStar}Claim Amount
                  </label>
                  <input
                    type="number"
                    style={modalInputStyle}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.claimAmount}
                    onChange={(e) => handleFormChange('claimAmount', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Currency</label>
                  <select
                    style={modalSelectStyle}
                    value={form.currency}
                    onChange={(e) => handleFormChange('currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="CNY">CNY</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Customer */}
              <div>
                <label style={modalLabelStyle}>
                  {requiredStar}Customer
                </label>
                <select
                  style={modalSelectStyle}
                  value={form.customer}
                  onChange={(e) => handleFormChange('customer', e.target.value)}
                >
                  <option value="">Please select</option>
                  <option value="Customer A">Customer A</option>
                  <option value="Customer B">Customer B</option>
                  <option value="Customer C">Customer C</option>
                </select>
              </div>

              {/* Claim Date */}
              <div>
                <label style={modalLabelStyle}>Claim Date</label>
                <input
                  type="date"
                  style={modalInputStyle}
                  value={form.claimDate}
                  onChange={(e) => handleFormChange('claimDate', e.target.value)}
                />
              </div>

              {/* Claim Reason */}
              <div>
                <label style={modalLabelStyle}>
                  {requiredStar}Claim Reason
                </label>
                <textarea
                  rows={3}
                  style={{
                    ...modalInputStyle,
                    resize: 'vertical',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                  }}
                  placeholder="Enter claim reason"
                  value={form.claimReason}
                  onChange={(e) => handleFormChange('claimReason', e.target.value)}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                padding: '12px 20px 16px 20px',
                borderTop: '1px solid #f0f0f0',
                marginTop: 4,
              }}
            >
              <button
                className="btn-default"
                style={{ ...btnDefaultStyle, height: 32, padding: '0 16px' }}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ ...btnPrimaryStyle, height: 32, padding: '0 16px' }}
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaimTicketManage;
