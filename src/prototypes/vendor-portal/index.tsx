/**
 * @name Vendor Portal
 *
 * 合并三大 VP 菜单：Price Reconciliation / Claim Tickets / Settlement Application / My Statements
 * 于单一原型入口，通过左侧菜单切换。
 *
 * 参考资料：
 * - /Users/tracy/.claude/plans/unified-cuddling-hare.md
 * - /Users/tracy/.claude/plans/ticklish-purring-stream.md（7 点修改）
 * - src/docs/prds/Vendor Statement.md
 * - src/docs/prds/S33Vendor 认证材料处理.md
 * - src/docs/prds/S34 对账单优化.md
 * - src/docs/prds/S38 Claim Ticket.md
 */

import './style.css';

import React, { useState } from 'react';

import VendorPortalShell from './components/VendorPortalShell';

import WaybillReconciliationList from './components/WaybillReconciliationList';
import ImportSheetDialog from './components/ImportSheetDialog';
import DiffView, { type DiffRow } from './components/DiffView';
import RaiseModificationDialog from './components/RaiseModificationDialog';
import ModificationList from './components/ModificationList';
import ModificationDetail from './components/ModificationDetail';

import ClaimTicketList from './components/ClaimTicketList';
import ClaimTicketDetail from './components/ClaimTicketDetail';
import DisputeClaimDialog from './components/DisputeClaimDialog';

import SettlementList from './components/SettlementList';
import SettlementCreate from './components/SettlementCreate';
import SettlementDetail from './components/SettlementDetail';

import StatementList, { type Status as StatementStatus } from './components/StatementList';
import StatementDetailView from './components/StatementDetail';
import ConfirmDialog from './components/ConfirmDialog';
import RejectDialog from './components/RejectDialog';

type Menu = 'price-reconciliation' | 'claim-tickets' | 'settlement' | 'my-statements';

type ReconView = 'waybills' | 'diff' | 'applications' | 'application-detail';
type ClaimView = 'list' | 'detail';
type SettlementView = 'list' | 'create' | 'detail';
type StatementView = 'list' | 'detail';

type Dialog =
  | 'import'
  | 'raise'
  | 'confirm'
  | 'reject'
  | 'claim-dispute'
  | null;

const MENU_LABEL: Record<Menu, string> = {
  'price-reconciliation': 'Price Reconciliation',
  'claim-tickets': 'Claim Tickets',
  'settlement': 'Settlement Application',
  'my-statements': 'My Statements',
};

const Component = function VendorPortal() {
  const [menu, setMenu] = useState<Menu>('price-reconciliation');

  // Price Reconciliation
  const [reconView, setReconView] = useState<ReconView>('waybills');
  const [focusWaybill, setFocusWaybill] = useState<string | undefined>(undefined);
  const [selectedDiffRows, setSelectedDiffRows] = useState<DiffRow[]>([]);
  const [openedModApNo, setOpenedModApNo] = useState<string>('ApM260416001');

  // 已发起结算的运单（在 Price Reconciliation 列表中置灰）
  const [settledWaybills, setSettledWaybills] = useState<Record<string, string>>({});

  // Claim Tickets
  const [claimView, setClaimView] = useState<ClaimView>('list');
  const [openedClaimNo, setOpenedClaimNo] = useState<string>('PHCT26041501AB');
  // 跨模块跳转到 Claim Detail 时记录返回目标，用于 Back 按钮返回原页
  const [claimReturn, setClaimReturn] = useState<'statement-detail' | 'settlement-detail' | null>(null);

  // Settlement Application
  const [settlementView, setSettlementView] = useState<SettlementView>('list');
  const [openedSetApNo, setOpenedSetApNo] = useState('ApS260416002');
  const [prefillWaybills, setPrefillWaybills] = useState<string[]>([]);

  // My Statements
  const [statementView, setStatementView] = useState<StatementView>('list');
  const [openedStmtNo, setOpenedStmtNo] = useState('PHVS26041602');
  const [openedStmtStatus, setOpenedStmtStatus] = useState<StatementStatus>('Awaiting Confirmation');

  const [dialog, setDialog] = useState<Dialog>(null);

  const switchMenu = (key: string) => {
    const m = key as Menu;
    setMenu(m);
    setDialog(null);
    setClaimReturn(null);
    if (m === 'price-reconciliation') setReconView('waybills');
    if (m === 'claim-tickets') setClaimView('list');
    if (m === 'settlement') setSettlementView('list');
    if (m === 'my-statements') setStatementView('list');
  };

  const backFromClaimDetail = () => {
    if (claimReturn === 'statement-detail') {
      setClaimReturn(null);
      setMenu('my-statements');
      setStatementView('detail');
      return;
    }
    if (claimReturn === 'settlement-detail') {
      setClaimReturn(null);
      setMenu('settlement');
      setSettlementView('detail');
      return;
    }
    setClaimView('list');
  };

  const handleCreateSettlementFromDiff = (rows: DiffRow[]) => {
    const waybills = Array.from(new Set(rows.map(r => r.waybill)));
    const pseudoApNo = 'ApS260418' + String(Math.floor(Math.random() * 900) + 100);
    const newMap = { ...settledWaybills };
    waybills.forEach(wb => { newMap[wb] = pseudoApNo; });
    setSettledWaybills(newMap);
    setPrefillWaybills(waybills);
    setMenu('settlement');
    setSettlementView('create');
  };

  const renderPriceReconciliation = () => {
    if (reconView === 'diff') {
      return (
        <DiffView
          onBack={() => { setFocusWaybill(undefined); setReconView('waybills'); }}
          onRaiseModification={(rows) => { setSelectedDiffRows(rows); setDialog('raise'); }}
          onCreateSettlement={handleCreateSettlementFromDiff}
          focusWaybill={focusWaybill}
          settledWaybills={settledWaybills}
        />
      );
    }
    if (reconView === 'application-detail') {
      return (
        <ModificationDetail
          apNo={openedModApNo}
          onBack={() => setReconView('applications')}
        />
      );
    }
    return (
      <>
        <div className="recon-tab-bar">
          <button
            className={`recon-tab ${reconView === 'waybills' ? 'active' : ''}`}
            onClick={() => setReconView('waybills')}
          >
            Waybills for Reconciliation
          </button>
          <button
            className={`recon-tab ${reconView === 'applications' ? 'active' : ''}`}
            onClick={() => setReconView('applications')}
          >
            My Modification Requests
          </button>
        </div>
        {reconView === 'waybills' && (
          <WaybillReconciliationList
            onImport={() => setDialog('import')}
            onRaiseModification={(rows) => { setSelectedDiffRows(rows); setDialog('raise'); }}
            onCreateSettlement={handleCreateSettlementFromDiff}
            settledWaybills={settledWaybills}
          />
        )}
        {reconView === 'applications' && (
          <ModificationList
            onOpenDetail={(apNo) => { setOpenedModApNo(apNo); setReconView('application-detail'); }}
          />
        )}
      </>
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
              claimReturn === 'statement-detail' ? `← Back to Statement ${openedStmtNo}`
              : claimReturn === 'settlement-detail' ? `← Back to Application ${openedSetApNo}`
              : '← Back to Claim Tickets'
            }
          />
        );
    }
  };

  const renderSettlement = () => {
    switch (settlementView) {
      case 'list':
        return (
          <SettlementList
            onCreate={() => { setPrefillWaybills([]); setSettlementView('create'); }}
            onOpenDetail={(no) => { setOpenedSetApNo(no); setSettlementView('detail'); }}
          />
        );
      case 'create':
        return (
          <SettlementCreate
            prefillWaybills={prefillWaybills}
            onBack={() => { setPrefillWaybills([]); setSettlementView('list'); }}
            onSubmit={() => { setPrefillWaybills([]); setSettlementView('list'); }}
          />
        );
      case 'detail':
        return (
          <SettlementDetail
            apNo={openedSetApNo}
            onBack={() => setSettlementView('list')}
            onOpenClaimTicket={(no) => { setOpenedClaimNo(no); setClaimReturn('settlement-detail'); setMenu('claim-tickets'); setClaimView('detail'); }}
          />
        );
    }
  };

  const renderStatements = () => {
    switch (statementView) {
      case 'list':
        return (
          <StatementList
            onOpenDetail={(no, s) => { setOpenedStmtNo(no); setOpenedStmtStatus(s); setStatementView('detail'); }}
          />
        );
      case 'detail':
        return (
          <StatementDetailView
            no={openedStmtNo}
            status={openedStmtStatus}
            onBack={() => setStatementView('list')}
            onConfirm={() => setDialog('confirm')}
            onReject={() => setDialog('reject')}
            onOpenClaimTicket={(no) => { setOpenedClaimNo(no); setClaimReturn('statement-detail'); setMenu('claim-tickets'); setClaimView('detail'); }}
          />
        );
    }
  };

  const renderMain = () => {
    if (menu === 'price-reconciliation') return renderPriceReconciliation();
    if (menu === 'claim-tickets') return renderClaimTickets();
    if (menu === 'settlement') return renderSettlement();
    if (menu === 'my-statements') return renderStatements();
    return null;
  };

  const breadcrumb = (() => {
    const root = ['Finance', MENU_LABEL[menu]];
    if (menu === 'price-reconciliation') {
      if (reconView === 'diff') return [...root, focusWaybill ? `Diff · ${focusWaybill}` : 'Diff'];
      if (reconView === 'application-detail') return [...root, 'My Modification Requests', openedModApNo];
      return root;
    }
    if (menu === 'claim-tickets') {
      if (claimView === 'detail') return [...root, openedClaimNo];
      return root;
    }
    if (menu === 'settlement') {
      if (settlementView === 'create') return [...root, 'New Application'];
      if (settlementView === 'detail') return [...root, openedSetApNo];
      return root;
    }
    if (menu === 'my-statements') {
      if (statementView === 'detail') return [...root, openedStmtNo];
      return root;
    }
    return root;
  })();

  return (
    <VendorPortalShell breadcrumb={breadcrumb} activeMenu={menu} onMenuChange={switchMenu}>
      {renderMain()}

      {dialog === 'import' && (
        <ImportSheetDialog
          onClose={() => setDialog(null)}
          onImported={() => { setDialog(null); setReconView('waybills'); }}
        />
      )}

      {dialog === 'raise' && (
        <RaiseModificationDialog
          rows={selectedDiffRows}
          onClose={() => setDialog(null)}
          onSubmitted={() => { setDialog(null); setReconView('applications'); }}
        />
      )}

      {dialog === 'confirm' && (
        <ConfirmDialog
          statementNo={openedStmtNo}
          onClose={() => setDialog(null)}
          onConfirm={() => { setDialog(null); setOpenedStmtStatus('Pending Payable'); }}
        />
      )}

      {dialog === 'reject' && (
        <RejectDialog
          statementNo={openedStmtNo}
          onClose={() => setDialog(null)}
          onReject={() => { setDialog(null); setOpenedStmtStatus('Pending'); }}
        />
      )}

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
