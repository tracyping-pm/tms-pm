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

// Unbilled Waybills
import UnbilledWaybillsList from './components/UnbilledWaybillsList';

// Create Statement Form (V2)
import CreateStatementForm from './components/CreateStatementForm';

// Claim Tickets
import ClaimTicketList from './components/ClaimTicketList';
import ClaimTicketDetail from './components/ClaimTicketDetail';
import DisputeClaimDialog from './components/DisputeClaimDialog';

// My Statements
import StatementList, { type Status as StatementStatus } from './components/StatementList';
import StatementDetailView from './components/StatementDetail';

type Menu = 'unbilled-waybills' | 'claim-tickets' | 'my-statements';

type UnbilledView = 'list' | 'create';
type ClaimView = 'list' | 'detail';
type StatementView = 'list' | 'detail' | 'edit';

type Dialog = 'claim-dispute' | null;

const MENU_LABEL: Record<Menu, string> = {
  'unbilled-waybills': 'Unbilled Waybills',
  'claim-tickets': 'Claim Tickets',
  'my-statements': 'My Statements',
};

const Component = function VendorPortal() {
  const [menu, setMenu] = useState<Menu>('unbilled-waybills');

  // Unbilled Waybills
  const [unbilledView, setUnbilledView] = useState<UnbilledView>('list');
  const [selectedWaybills, setSelectedWaybills] = useState<string[]>([]);
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
    if (m === 'unbilled-waybills') setUnbilledView('list');
    if (m === 'claim-tickets') setClaimView('list');
    if (m === 'my-statements') setStatementView('list');
  };

  // --- Unbilled Waybills handlers ---
  const handleGenerateStatement = (waybillNos: string[]) => {
    setSelectedWaybills(waybillNos);
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
            onBack={() => setStatementView(editingStmtNo ? 'detail' : 'list')}
            onSubmit={handleResubmit}
            editStatementNo={editingStmtNo}
            rejectReason={editingRejectReason}
          />
        );
    }
  };

  const renderMain = () => {
    if (menu === 'unbilled-waybills') return renderUnbilledWaybills();
    if (menu === 'claim-tickets') return renderClaimTickets();
    if (menu === 'my-statements') return renderStatements();
    return null;
  };

  const breadcrumb = (() => {
    const root = ['Finance', MENU_LABEL[menu as Menu]];
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
