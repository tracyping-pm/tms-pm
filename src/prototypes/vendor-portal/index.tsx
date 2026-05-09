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
import PrePaidApplicationList from './components/PrePaidApplicationList';
import PrePaidApplicationForm from './components/PrePaidApplicationForm';
import PrePaidApplicationDetail from './components/PrePaidApplicationDetail';
import { type SyncedApplication } from '../../common/prepaidApplicationSync';

// Unbilled Waybills
import UnbilledWaybillsList, { type CreateMode } from './components/UnbilledWaybillsList';

// Create Statement Form — Billable Waybills flow (new)
import BillableCreateStatementForm, { type NewStatementData } from './components/BillableCreateStatementForm';

// Create Statement Form — My Statements edit/resubmit flow (kept)
import CreateStatementForm from './components/CreateStatementForm';

// Claim Tickets
import ClaimTicketList from './components/ClaimTicketList';
import ClaimTicketDetail from './components/ClaimTicketDetail';
import DisputeClaimDialog from './components/DisputeClaimDialog';

// My Statements
import StatementList, { type Status as StatementStatus, type StatementRow } from './components/StatementList';
import StatementDetailView from './components/StatementDetail';

type Menu = 'prepaid-application' | 'unbilled-waybills' | 'claim-tickets' | 'my-statements';

type PrepaidView = 'list' | 'create' | 'detail';
type UnbilledView = 'list' | 'create';
type ClaimView = 'list' | 'detail';
type StatementView = 'list' | 'detail' | 'edit';

type Dialog = 'claim-dispute' | null;

const MENU_LABEL: Record<Menu, string> = {
  'prepaid-application': 'PrePaid Application',
  'unbilled-waybills': 'Billable Waybills',
  'claim-tickets': 'Claim Tickets',
  'my-statements': 'My Statements',
};

const Component = function VendorPortal() {
  const [menu, setMenu] = useState<Menu>('prepaid-application');

  // PrePaid Application
  const [prepaidView, setPrepaidView] = useState<PrepaidView>('list');
  const [viewedPrepaidApp, setViewedPrepaidApp] = useState<SyncedApplication | null>(null);
  const [editingPrepaidApp, setEditingPrepaidApp] = useState<SyncedApplication | null>(null);
  const [prepaidRefreshKey, setPrepaidRefreshKey] = useState(0);

  // Unbilled Waybills
  const [unbilledView, setUnbilledView] = useState<UnbilledView>('list');
  const [selectedWaybills, setSelectedWaybills] = useState<string[]>([]);
  const [createMode, setCreateMode] = useState<CreateMode>('system-price');
  // waybills that have been submitted (show as Statement Pending in list)
  const [pendingWaybills, setPendingWaybills] = useState<string[]>([]);
  // Statements created from Billable Waybills flow (synced to My Statements list)
  const [extraStatements, setExtraStatements] = useState<StatementRow[]>([]);

  // Claim Tickets
  const [claimView, setClaimView] = useState<ClaimView>('list');
  const [openedClaimNo, setOpenedClaimNo] = useState('PHCT26041501AB');
  const [claimReturn, setClaimReturn] = useState<'statement-detail' | null>(null);

  // My Statements
  const [statementView, setStatementView] = useState<StatementView>('list');
  const [openedStmtNo, setOpenedStmtNo] = useState('VS2604001');
  const [openedStmtStatus, setOpenedStmtStatus] = useState<StatementStatus>('Awaiting Comparison');
  const [vpStatusOverrides, setVpStatusOverrides] = useState<Record<string, StatementStatus>>({});
  const [submitSuccessNo, setSubmitSuccessNo] = useState<string | null>(null);
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
          initialApp={editingPrepaidApp || undefined}
          onBack={() => { setEditingPrepaidApp(null); setPrepaidView('list'); }}
          onSaved={() => {
            setEditingPrepaidApp(null);
            setPrepaidRefreshKey(k => k + 1);
            setPrepaidView('list');
          }}
        />
      );
    }
    if (prepaidView === 'detail' && viewedPrepaidApp) {
      return (
        <PrePaidApplicationDetail
          app={viewedPrepaidApp}
          onBack={() => { setViewedPrepaidApp(null); setPrepaidView('list'); }}
        />
      );
    }
    return (
      <PrePaidApplicationList
        refreshKey={prepaidRefreshKey}
        onCreate={() => { setEditingPrepaidApp(null); setPrepaidView('create'); }}
        onEdit={(app) => { setEditingPrepaidApp(app); setPrepaidView('create'); }}
        onDetail={(app) => { setViewedPrepaidApp(app); setPrepaidView('detail'); }}
      />
    );
  };

  // --- Unbilled Waybills handlers ---
  const handleGenerateStatement = (waybillNos: string[], mode: CreateMode) => {
    setSelectedWaybills(waybillNos);
    setCreateMode(mode);
    setUnbilledView('create');
  };

  const handleBillableStatementCreate = (data: NewStatementData) => {
    // Mark waybills as Statement Pending in Billable Waybills list
    setPendingWaybills(prev => [...new Set([...prev, ...data.waybillNos])]);
    setSelectedWaybills([]);
    setUnbilledView('list');
    // Add new statement to My Statements list
    const newRow: StatementRow = {
      no: data.statementNo,
      source: 'Self-Created',
      totalSubmittedAmount: data.isDraft ? 0 : data.totalSubmittedAmount,
      currency: 'PHP',
      statementType: data.statementType,
      waybillCount: data.waybillNos.length,
      invoiceNo: '—',
      status: data.isDraft ? 'Draft' : 'Awaiting Comparison',
      createdAt: data.createdAt.slice(0, 16).replace('T', ' '),
    };
    setExtraStatements(prev => [newRow, ...prev]);
    // Navigate to My Statements
    setMenu('my-statements');
    setStatementView('list');
    if (!data.isDraft) {
      setSubmitSuccessNo(data.statementNo);
      setTimeout(() => setSubmitSuccessNo(null), 4000);
    }
  };

  const handleStatementSubmit = (waybillNos: string[]) => {
    setPendingWaybills(prev => [...new Set([...prev, ...waybillNos])]);
    setSelectedWaybills([]);
    setUnbilledView('list');
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

  const handleSubmitToTMS = (no: string) => {
    // Update status to Awaiting Comparison; stay on current detail page
    setVpStatusOverrides(prev => ({ ...prev, [no]: 'Awaiting Comparison' }));
    setOpenedStmtStatus('Awaiting Comparison');
    setSubmitSuccessNo(no);
    setTimeout(() => setSubmitSuccessNo(null), 4000);
  };

  // --- Render ---
  const renderUnbilledWaybills = () => {
    if (unbilledView === 'create') {
      return (
        <BillableCreateStatementForm
          prefillWaybillNos={selectedWaybills}
          onBack={() => { setSelectedWaybills([]); setUnbilledView('list'); }}
          onSubmit={handleBillableStatementCreate}
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
          <>
            {submitSuccessNo && (
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 16px', marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#52c41a', fontSize: 16 }}>✓</span>
                <span>Statement <strong>{submitSuccessNo}</strong> has been submitted to TMS and is now <strong>Awaiting Comparison</strong>.</span>
              </div>
            )}
            <StatementList
              onOpenDetail={handleOpenStatementDetail}
              onEdit={handleEditStatement}
              statusOverrides={vpStatusOverrides}
              extraRows={extraStatements}
            />
          </>
        );
      case 'detail':
        return (
          <StatementDetailView
            no={openedStmtNo}
            status={openedStmtStatus}
            onBack={() => setStatementView('list')}
            onSubmitToTMS={handleSubmitToTMS}
            onEdit={
              openedStmtStatus === 'Draft' || openedStmtStatus === 'Awaiting Re-bill'
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
