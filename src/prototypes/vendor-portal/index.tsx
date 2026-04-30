/**
 * @name Vendor Portal
 *
 * VP Billing V2 设计：盲核对模式 + 简化提单流程
 *
 * 参考资料：
 * - src/docs/prds/S44 VP Billing/VP billing V2.md
 * - src/docs/prds/Vendor Statement.md
 * - src/docs/prds/S38 Claim Ticket.md
 *
 * 菜单：
 *   Unbilled Waybills → Generate Statement → CreateStatementForm
 *   Claim Tickets（保留）
 *   My Statements → StatementDetail（含 Awaiting Re-bill 编辑路径）
 */

import './style.css';

import React, { useState } from 'react';

import VendorPortalShell from './components/VendorPortalShell';

// PrePaid Application
import PrePaidApplicationList, { type PrePaidApplication } from './components/PrePaidApplicationList';
import PrePaidApplicationForm from './components/PrePaidApplicationForm';

// Unbilled Waybills
import UnbilledWaybillsList, { type CreateMode } from './components/UnbilledWaybillsList';

// Create Statement Form (V2)
import CreateStatementForm from './components/CreateStatementForm';

// Claim Tickets
import ClaimTicketList from './components/ClaimTicketList';
import ClaimTicketDetail from './components/ClaimTicketDetail';
import DisputeClaimDialog from './components/DisputeClaimDialog';

// My Statements
import StatementList, { type Status as StatementStatus } from './components/StatementList';
import StatementDetailView from './components/StatementDetail';

type Menu = 'prepaid-application' | 'unbilled-waybills' | 'claim-tickets' | 'my-statements';

type PrepaidView = 'list' | 'create' | 'detail';
type UnbilledView = 'list' | 'create';
type ClaimView = 'list' | 'detail';
type StatementView = 'list' | 'detail' | 'edit';

type Dialog = 'claim-dispute' | null;

const MENU_LABEL: Record<Menu, string> = {
  'prepaid-application': 'PrePaid Application',
  'unbilled-waybills': 'Unbilled Waybills',
  'claim-tickets': 'Claim Tickets',
  'my-statements': 'My Statements',
};

const Component = function VendorPortal() {
  const [menu, setMenu] = useState<Menu>('prepaid-application');

  // PrePaid Application
  const [prepaidView, setPrepaidView] = useState<PrepaidView>('list');
  const [viewedPrepaidApp, setViewedPrepaidApp] = useState<PrePaidApplication | null>(null);

  // Unbilled Waybills
  const [unbilledView, setUnbilledView] = useState<UnbilledView>('list');
  const [selectedWaybills, setSelectedWaybills] = useState<string[]>([]);
  const [createMode, setCreateMode] = useState<CreateMode>('system-price');
  // waybills that have been submitted (show as Statement Pending in list)
  const [pendingWaybills, setPendingWaybills] = useState<string[]>([]);

  // Claim Tickets
  const [claimView, setClaimView] = useState<ClaimView>('list');
  const [openedClaimNo, setOpenedClaimNo] = useState('PHCT26041501AB');
  const [claimReturn, setClaimReturn] = useState<'statement-detail' | null>(null);

  // My Statements
  const [statementView, setStatementView] = useState<StatementView>('list');
  const [openedStmtNo, setOpenedStmtNo] = useState('VS2604001');
  const [openedStmtStatus, setOpenedStmtStatus] = useState<StatementStatus>('Awaiting Comparison');
  // For edit (Awaiting Re-bill) flow
  const [editingStmtNo, setEditingStmtNo] = useState<string | undefined>(undefined);
  const [editingRejectReason, setEditingRejectReason] = useState<string | undefined>(undefined);
  // Mock reject reasons per statement
  const REJECT_REASONS: Record<string, string> = {
    VS2604002:
      'Basic Amount for WB2604013 exceeds contracted rate. Additional Charge for WB2604013 has no supporting proof. Please correct and resubmit.',
  };

  const [dialog, setDialog] = useState<Dialog>(null);

  const switchMenu = (key: string) => {
    const m = key as Menu;
    setMenu(m);
    setDialog(null);
    setClaimReturn(null);
    if (m === 'prepaid-application') setPrepaidView('list');
    if (m === 'unbilled-waybills') setUnbilledView('list');
    if (m === 'claim-tickets') setClaimView('list');
    if (m === 'my-statements') setStatementView('list');
  };

  // --- PrePaid Application handlers ---
  const renderPrepaidApplication = () => {
    if (prepaidView === 'create') {
      return (
        <PrePaidApplicationForm
          onBack={() => setPrepaidView('list')}
          onSubmit={() => setPrepaidView('list')}
        />
      );
    }
    if (prepaidView === 'detail' && viewedPrepaidApp) {
      const app = viewedPrepaidApp;
      const statusColors: Record<string, React.CSSProperties> = {
        'Pending Review': { background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' },
        'Approved': { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
        'Rejected': { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
        'Paid': { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
      };
      const badge = { borderRadius: 4, padding: '3px 10px', fontSize: 13, ...(statusColors[app.status] || {}) };

      // Waybill transport status mock mapping
      const waybillStatusMap: Record<string, string> = {
        WB2604010: 'Delivered',
        WB2604011: 'Delivered',
        WB2604020: 'In Transit',
        WB2604021: 'In Transit',
        WB2604022: 'Planning',
        WB2604023: 'Pending',
      };
      const getWaybillStatusBadge = (wbNo: string) => {
        const s = waybillStatusMap[wbNo] || 'In Transit';
        const base: React.CSSProperties = { borderRadius: 4, padding: '2px 8px', fontSize: 11, whiteSpace: 'nowrap' };
        switch (s) {
          case 'Delivered': return <span style={{ ...base, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }}>Delivered</span>;
          case 'In Transit': return <span style={{ ...base, background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' }}>In Transit</span>;
          case 'Planning': return <span style={{ ...base, background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' }}>Planning</span>;
          case 'Pending': return <span style={{ ...base, background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f' }}>Pending</span>;
          default: return <span style={{ ...base, background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' }}>{s}</span>;
        }
      };

      // Payment stepper
      const STEPS = ['Pending Review', 'Approved', 'Paid'];
      const stepIndex = STEPS.indexOf(app.status);
      const isRejected = app.status === 'Rejected';
      // For rejected, highlight step 0 (Pending Review) as current
      const currentStep = isRejected ? 0 : stepIndex;

      // Mock proof files for paid apps
      const proofFiles = app.status === 'Paid'
        ? [
            { name: 'payment_voucher_001.pdf', icon: '📄' },
            { name: 'bank_receipt.jpg', icon: '🖼' },
            { name: 'approval_memo.pdf', icon: '📄' },
          ]
        : [];
      const [previewMsg, setPreviewMsg] = React.useState('');

      return (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button className="btn-default" onClick={() => { setViewedPrepaidApp(null); setPrepaidView('list'); }}>← Back</button>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{app.applicationNo}</h2>
            <span style={badge}>{app.status}</span>
          </div>

          {app.status === 'Approved' && (
            <div className="alert" style={{ background: '#e6f4ff', border: '1px solid #91caff', color: '#0958d9', marginBottom: 16 }}>
              <strong>Payment Request Auto-generated:</strong> A <em>Vendor Payment</em> request has been automatically created in the HR system. You will be notified once payment is released.
            </div>
          )}
          {app.status === 'Rejected' && app.rejectReason && (
            <div className="alert" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', marginBottom: 16 }}>
              <strong>Rejected:</strong> {app.rejectReason}
            </div>
          )}

          {/* Card 1: Application Information */}
          <div className="vp-card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Application Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Application No.', value: app.applicationNo },
                { label: 'Application Date', value: app.applicationDate },
                { label: 'Status', value: <span style={{ ...badge, fontSize: 12 }}>{app.status}</span> },
                { label: 'Associated Waybills', value: app.waybillNos.join(', ') },
                { label: 'PrePaid Amount', value: app.prepaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) },
                { label: 'Total Amount', value: <strong>{app.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Associated Waybills */}
          <div className="vp-card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Associated Waybills</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waybill No.</th>
                  <th>Transport Status</th>
                </tr>
              </thead>
              <tbody>
                {app.waybillNos.map(wbNo => (
                  <tr key={wbNo}>
                    <td><strong>{wbNo}</strong></td>
                    <td>{getWaybillStatusBadge(wbNo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card 3: Submitted Proof */}
          <div className="vp-card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Submitted Proof</div>
            {proofFiles.length > 0 ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {proofFiles.map(f => (
                  <div
                    key={f.name}
                    onClick={() => setPreviewMsg('Preview not available in prototype')}
                    style={{
                      width: 100, borderRadius: 8, border: '1px solid #e8e8e8',
                      background: '#fafafa', padding: 12, textAlign: 'center', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{f.icon}</div>
                    <div style={{ fontSize: 11, color: '#666', wordBreak: 'break-all' }}>{f.name}</div>
                  </div>
                ))}
                {previewMsg && (
                  <div style={{ width: '100%', marginTop: 8, fontSize: 12, color: '#888' }}>{previewMsg}</div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#bbb', padding: '12px 0' }}>No proof submitted.</div>
            )}
          </div>

          {/* Card 4: Payment Status */}
          <div className="vp-card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 20 }}>Payment Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STEPS.map((step, idx) => {
                const isDone = !isRejected && stepIndex > idx;
                const isCurrent = currentStep === idx && !isRejected;
                const isCurrentRejected = isRejected && idx === 0;
                const circleStyle: React.CSSProperties = {
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600, flexShrink: 0,
                  background: isDone ? '#00b96b' : (isCurrent || isCurrentRejected) ? '#00b96b' : '#f0f0f0',
                  color: (isDone || isCurrent || isCurrentRejected) ? '#fff' : '#bbb',
                  border: `2px solid ${isDone ? '#00b96b' : (isCurrent || isCurrentRejected) ? '#00b96b' : '#e0e0e0'}`,
                };
                const labelStyle: React.CSSProperties = {
                  fontSize: 12, marginTop: 6, textAlign: 'center',
                  color: (isDone || isCurrent || isCurrentRejected) ? '#00b96b' : '#bbb',
                  fontWeight: (isCurrent || isCurrentRejected) ? 600 : 400,
                };
                return (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={circleStyle}>{isDone ? '✓' : idx + 1}</div>
                      <div style={labelStyle}>{step}</div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{
                          height: 2, width: '100%',
                          background: (!isRejected && stepIndex > idx) ? '#00b96b' : '#e0e0e0',
                        }} />
                        {isRejected && idx === 0 && (
                          <div style={{
                            position: 'absolute', top: -14,
                            background: '#fff1f0', border: '1px solid #ffa39e',
                            borderRadius: 12, padding: '2px 10px',
                            fontSize: 12, color: '#cf1322', fontWeight: 600, whiteSpace: 'nowrap',
                          }}>
                            ✕ Rejected
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {app.status === 'Rejected' && (
            <div style={{ textAlign: 'right' }}>
              <button className="btn-primary" onClick={() => setPrepaidView('create')}>Resubmit Application</button>
            </div>
          )}
        </div>
      );
    }
    return (
      <PrePaidApplicationList
        onCreate={() => setPrepaidView('create')}
        onViewDetail={(app) => { setViewedPrepaidApp(app); setPrepaidView('detail'); }}
      />
    );
  };

  // --- Unbilled Waybills handlers ---
  const handleGenerateStatement = (waybillNos: string[], mode: CreateMode) => {
    setSelectedWaybills(waybillNos);
    setCreateMode(mode);
    setUnbilledView('create');
  };

  const handleStatementSubmit = (waybillNos: string[]) => {
    setPendingWaybills(prev => [...new Set([...prev, ...waybillNos])]);
    setSelectedWaybills([]);
    setUnbilledView('list');
    // Navigate to My Statements after submit
    setMenu('my-statements');
    setStatementView('list');
  };

  // --- Claim Tickets handlers ---
  const backFromClaimDetail = () => {
    if (claimReturn === 'statement-detail') {
      setClaimReturn(null);
      setMenu('my-statements');
      setStatementView('detail');
      return;
    }
    setClaimView('list');
  };

  // --- My Statements handlers ---
  const handleOpenStatementDetail = (no: string, status: StatementStatus) => {
    setOpenedStmtNo(no);
    setOpenedStmtStatus(status);
    setStatementView('detail');
  };

  const handleEditStatement = (no: string, _status: StatementStatus) => {
    setEditingStmtNo(no);
    setEditingRejectReason(REJECT_REASONS[no]);
    setStatementView('edit');
  };

  const handleResubmit = (waybillNos: string[]) => {
    // After resubmit, go back to list
    setEditingStmtNo(undefined);
    setEditingRejectReason(undefined);
    setStatementView('list');
  };

  // --- Render ---
  const renderUnbilledWaybills = () => {
    if (unbilledView === 'create') {
      return (
        <CreateStatementForm
          prefillWaybills={selectedWaybills}
          mode={createMode}
          onBack={() => { setSelectedWaybills([]); setUnbilledView('list'); }}
          onSubmit={handleStatementSubmit}
        />
      );
    }
    return (
      <UnbilledWaybillsList
        onGenerateStatement={handleGenerateStatement}
        pendingWaybills={pendingWaybills}
      />
    );
  };

  const renderClaimTickets = () => {
    switch (claimView) {
      case 'list':
        return (
          <ClaimTicketList
            onOpenDetail={(no) => { setOpenedClaimNo(no); setClaimView('detail'); }}
          />
        );
      case 'detail':
        return (
          <ClaimTicketDetail
            ticketNo={openedClaimNo}
            onBack={backFromClaimDetail}
            onDispute={() => setDialog('claim-dispute')}
            returnLabel={
              claimReturn === 'statement-detail'
                ? `← Back to Statement ${openedStmtNo}`
                : '← Back to Claim Tickets'
            }
          />
        );
    }
  };

  const renderStatements = () => {
    switch (statementView) {
      case 'list':
        return (
          <StatementList
            onOpenDetail={handleOpenStatementDetail}
            onEdit={handleEditStatement}
          />
        );
      case 'detail':
        return (
          <StatementDetailView
            no={openedStmtNo}
            status={openedStmtStatus}
            onBack={() => setStatementView('list')}
            onEdit={
              openedStmtStatus === 'Awaiting Re-bill'
                ? () => handleEditStatement(openedStmtNo, openedStmtStatus)
                : undefined
            }
          />
        );
      case 'edit':
        return (
          <CreateStatementForm
            prefillWaybills={[]}
            mode="edit"
            onBack={() => setStatementView(editingStmtNo ? 'detail' : 'list')}
            onSubmit={handleResubmit}
            editStatementNo={editingStmtNo}
            rejectReason={editingRejectReason}
          />
        );
    }
  };

  const renderMain = () => {
    if (menu === 'prepaid-application') return renderPrepaidApplication();
    if (menu === 'unbilled-waybills') return renderUnbilledWaybills();
    if (menu === 'claim-tickets') return renderClaimTickets();
    if (menu === 'my-statements') return renderStatements();
    return null;
  };

  const breadcrumb = (() => {
    const root = ['Finance', MENU_LABEL[menu as Menu]];
    if (menu === 'prepaid-application') {
      if (prepaidView === 'create') return [...root, 'Create Application'];
      if (prepaidView === 'detail' && viewedPrepaidApp) return [...root, viewedPrepaidApp.applicationNo];
      return root;
    }
    if (menu === 'unbilled-waybills') {
      if (unbilledView === 'create') return [...root, 'Create Statement'];
      return root;
    }
    if (menu === 'claim-tickets') {
      if (claimView === 'detail') return [...root, openedClaimNo];
      return root;
    }
    if (menu === 'my-statements') {
      if (statementView === 'detail') return [...root, openedStmtNo];
      if (statementView === 'edit') return [...root, editingStmtNo || '', 'Edit & Resubmit'];
      return root;
    }
    return root;
  })();

  return (
    <VendorPortalShell breadcrumb={breadcrumb} activeMenu={menu} onMenuChange={switchMenu}>
      {renderMain()}

      {dialog === 'claim-dispute' && (
        <DisputeClaimDialog
          ticketNo={openedClaimNo}
          onClose={() => setDialog(null)}
          onSubmitted={() => setDialog(null)}
        />
      )}
    </VendorPortalShell>
  );
};

export default Component;
