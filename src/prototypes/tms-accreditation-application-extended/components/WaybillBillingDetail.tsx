import React, { useState } from 'react';

interface Props {
  waybillNo: string;
  onBack: () => void;
}

interface BillingItem {
  name: string;
  amount: number;
  status?: string;
  statusColor?: string;
  isDeduction?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

interface WaybillBillingData {
  no: string;
  customerTruckType: string;
  requiredTruckType: string;
  vendorTruckType: string;
  vendorRequiredTruckType: string;
  contractRevenue: BillingItem[];
  contractCost: BillingItem[];
  linkedStatement?: string;
  operationLog: { time: string; actor: string; action: string; detail?: string }[];
}

const WAYBILL_DATA: Record<string, WaybillBillingData> = {
  WB2604011: {
    no: 'WB2604011',
    customerTruckType: '6-Wheeler', requiredTruckType: '6-Wheeler',
    vendorTruckType: '6-Wheeler', vendorRequiredTruckType: '6-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 14500, status: 'Write off', statusColor: '#cf1322' },
      { name: 'Additional Amount Receivable', amount: 800, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 0, status: 'Under Billing Preparation', statusColor: '#d46b08' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 14500, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 800, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Discount Amount', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2604002',
    operationLog: [
      { time: '2026-04-12 10:30', actor: 'Keris', action: 'Run Waybill', detail: 'Sum: 2,600.00 → 1,500.00' },
      { time: '2026-04-14 09:23', actor: 'Zhuge Liang', action: 'Edit Basic Amount Payable (Remaining): Sum: 2,600.00 → 1,000.00' },
    ],
  },
  WB2604013: {
    no: 'WB2604013',
    customerTruckType: '10-Wheeler', requiredTruckType: '10-Wheeler',
    vendorTruckType: '10-Wheeler', vendorRequiredTruckType: '10-Wheeler',
    contractRevenue: [
      { name: 'Basic Amount Receivable', amount: 15000, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Additional Amount Receivable', amount: 1200, status: 'Collected', statusColor: '#389e0d' },
      { name: 'Exception Fee', amount: 500, status: 'Under Billing Preparation', statusColor: '#d46b08' },
      { name: 'Goods Rejection', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    contractCost: [
      { name: 'Basic Amount Payable (Remaining)', amount: 15000, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Additional Amount Payable', amount: 1200, status: 'Under Payment Preparation', statusColor: '#d46b08' },
      { name: 'Vendor Exception Fee', amount: 500, status: 'Awaiting No Bill', statusColor: '#999' },
      { name: 'Vendor Discount Amount', amount: 0, status: 'Awaiting No Bill', statusColor: '#999' },
    ],
    linkedStatement: 'APVS2604003',
    operationLog: [
      { time: '2026-04-13 11:00', actor: 'System', action: 'Waybill created' },
      { time: '2026-04-14 10:30', actor: 'Zhuge Liang', action: 'Linked to AP Statement APVS2604003' },
    ],
  },
};

function fmt(n: number) { return n > 0 ? n.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'; }

// ─── Component ─────────────────────────────────────────────────────────────────

function WaybillBillingDetail({ waybillNo, onBack }: Props) {
  const data = WAYBILL_DATA[waybillNo] ?? WAYBILL_DATA['WB2604011'];

  const [activeTab, setActiveTab] = useState<'delivered' | 'settlement'>('delivered');
  const [showEditBasicAmount, setShowEditBasicAmount] = useState(false);
  const [showEditExceptionFee, setShowEditExceptionFee] = useState(false);

  // Edit Basic Amount form state
  const [basicAmountMode, setBasicAmountMode] = useState<'write-off' | 'collected'>('collected');
  const [editBasicAmount, setEditBasicAmount] = useState('');

  // Edit Exception Fee form state
  const [editExceptionFee, setEditExceptionFee] = useState('');

  const basicItem = data.contractCost.find(i => i.name.startsWith('Basic Amount Payable'));
  const exceptionItem = data.contractCost.find(i => i.name.startsWith('Vendor Exception Fee'));

  // Gross calculations
  const totalRevenue = data.contractRevenue.reduce((s, i) => s + i.amount, 0);
  const totalCost = data.contractCost.reduce((s, i) => s + i.amount, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(0) : '0';

  const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '18px 20px', marginBottom: 14 };

  return (
    <>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-link" onClick={onBack} style={{ fontSize: 13 }}>← Back</button>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Waybill: {waybillNo}</div>
        <div style={{ width: 80 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 14, background: '#fff', borderRadius: '6px 6px 0 0', padding: '0 4px' }}>
        {(['delivered', 'settlement'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', fontSize: 13,
            fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? '#1677ff' : '#666',
            background: 'none', border: 'none',
            borderBottom: activeTab === tab ? '2px solid #1677ff' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>
            {tab === 'delivered' ? 'Delivered' : 'Awaiting Settlement'}
          </button>
        ))}
      </div>

      {activeTab === 'delivered' && (
        <>
          {/* Billing Section */}
          <div style={CARD}>
            {/* Section header with action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 16, background: '#333', borderRadius: 2 }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Billing</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-default" style={{ fontSize: 12 }} onClick={() => setShowEditBasicAmount(true)}>
                  Edit Basic Amount
                </button>
                <button className="btn-default" style={{ fontSize: 12 }} onClick={() => setShowEditExceptionFee(true)}>
                  Edit Exception Fee
                </button>
                {data.linkedStatement && (
                  <button className="btn-default" style={{ fontSize: 12 }}>
                    Linked Statement: {data.linkedStatement}
                  </button>
                )}
              </div>
            </div>

            {/* Truck type header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Customer Billing Truck Type</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{data.customerTruckType}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Customer Required Truck Type</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{data.requiredTruckType}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Vendor Billing Truck Type</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{data.vendorTruckType}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Vendor Required Truck Type</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{data.vendorRequiredTruckType}</div>
                </div>
              </div>
            </div>

            {/* Contract Revenue | Contract Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>

              {/* Contract Revenue */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Contract Revenue</span>
                  <span style={{ fontWeight: 400, fontSize: 12, color: '#999' }}>
                    ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {data.contractRevenue.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < data.contractRevenue.length - 1 ? '1px solid #f8f8f8' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#333' }}>{item.name}</div>
                      {item.status && (
                        <div style={{ fontSize: 11, color: item.statusColor ?? '#999', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.statusColor ?? '#999', display: 'inline-block' }} />
                          {item.status}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: item.amount > 0 ? '#333' : '#bbb', textAlign: 'right', minWidth: 80 }}>
                      ₱{fmt(item.amount)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f0f0f0' }} />

              {/* Contract Cost */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Contract Cost</span>
                  <span style={{ fontWeight: 400, fontSize: 12, color: '#999' }}>
                    ₱{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {data.contractCost.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < data.contractCost.length - 1 ? '1px solid #f8f8f8' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#333' }}>{item.name}</div>
                      {item.status && (
                        <div style={{ fontSize: 11, color: item.statusColor ?? '#999', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.statusColor ?? '#999', display: 'inline-block' }} />
                          {item.status}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: item.amount > 0 ? '#333' : '#bbb', textAlign: 'right', minWidth: 80 }}>
                      ₱{fmt(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gross Profit / Margin */}
            <div style={{ display: 'flex', gap: 32, padding: '12px 0 0', marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Gross Profit</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: grossProfit >= 0 ? '#389e0d' : '#cf1322' }}>
                  ₱{Math.abs(grossProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Gross Margin</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: parseInt(grossMargin) >= 0 ? '#389e0d' : '#cf1322' }}>
                  {grossMargin}%
                </div>
              </div>
            </div>
          </div>

          {/* Operation Log */}
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: '#333', borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Operation Log</span>
            </div>
            {data.operationLog.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d9d9d9', marginTop: 4, flexShrink: 0 }} />
                  {i < data.operationLog.length - 1 && <div style={{ width: 1, flex: 1, background: '#f0f0f0', marginTop: 2 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>
                    <span style={{ color: '#999', marginRight: 10 }}>{entry.time}</span>
                    <span style={{ color: '#1677ff', marginRight: 8 }}>{entry.actor}</span>
                    <span>{entry.action}</span>
                  </div>
                  {entry.detail && (
                    <div style={{ fontSize: 12, color: '#888', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, padding: '4px 10px', marginTop: 4 }}>
                      {entry.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'settlement' && (
        <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#bbb' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14 }}>No pending settlement items.</div>
        </div>
      )}

      {/* Edit Basic Amount Panel */}
      {showEditBasicAmount && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Basic Amount</span>
              <button className="modal-close" onClick={() => setShowEditBasicAmount(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Customer Basic Amount</div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {(['write-off', 'collected'] as const).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                      <input type="radio" name="basicMode" checked={basicAmountMode === m} onChange={() => setBasicAmountMode(m)} />
                      {m === 'write-off' ? 'Write off' : 'Collected'}
                    </label>
                  ))}
                </div>
              </div>

              {basicItem && (
                <div style={{ background: '#f6f9ff', border: '1px solid #d6e4ff', borderRadius: 4, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Basic Amount Payable (Remaining)</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
                    ₱{basicItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  {basicItem.status && (
                    <div style={{ fontSize: 11, color: basicItem.statusColor, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: basicItem.statusColor, display: 'inline-block' }} />
                      {basicItem.status}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
                  <span style={{ color: '#ff4d4f' }}>*</span> Basic Amount Payable
                </div>
                <input
                  type="number"
                  className="filter-input"
                  style={{ width: '100%' }}
                  placeholder="Enter amount"
                  value={editBasicAmount}
                  onChange={e => setEditBasicAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowEditBasicAmount(false)}>Callback</button>
              <button className="btn-default" onClick={() => setShowEditBasicAmount(false)}>Cancel</button>
              <button
                className="btn-primary"
                disabled={!editBasicAmount}
                onClick={() => setShowEditBasicAmount(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exception Fee Panel */}
      {showEditExceptionFee && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Exception Fee</span>
              <button className="modal-close" onClick={() => setShowEditExceptionFee(false)}>✕</button>
            </div>
            <div className="modal-body">
              {exceptionItem && (
                <div style={{ background: '#f6f9ff', border: '1px solid #d6e4ff', borderRadius: 4, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Current Exception Fee</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
                    ₱{exceptionItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
                  <span style={{ color: '#ff4d4f' }}>*</span> New Exception Fee Amount
                </div>
                <input
                  type="number"
                  className="filter-input"
                  style={{ width: '100%' }}
                  placeholder="Enter amount"
                  value={editExceptionFee}
                  onChange={e => setEditExceptionFee(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-default" onClick={() => setShowEditExceptionFee(false)}>Cancel</button>
              <button
                className="btn-primary"
                disabled={!editExceptionFee}
                onClick={() => setShowEditExceptionFee(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WaybillBillingDetail;
