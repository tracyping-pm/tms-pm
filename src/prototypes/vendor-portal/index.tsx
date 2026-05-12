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
import { getAllApplications } from '../../common/prepaidApplicationSync';
import { upsertApStatement, getApStatement, tmsStatusToVpStatus } from '../../common/apStatementSync';

import VendorPortalShell from './components/VendorPortalShell';

// PrePaid Application
import PrePaidApplicationList from './components/PrePaidApplicationList';
import PrePaidApplicationForm from './components/PrePaidApplicationForm';
import PrePaidApplicationDetail from './components/PrePaidApplicationDetail';
import { type SyncedApplication } from '../../common/prepaidApplicationSync';

// Unbilled Waybills
import UnbilledWaybillsList, { type CreateMode } from './components/UnbilledWaybillsList';
import {
  buildEffectiveWaybills,
  deriveWaybillStatus,
  type Waybill,
  SHEET_SYNC_OVERRIDES,
} from './data/waybills';

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
import StatementDetailView, { type MockData as StatementMockData } from './components/StatementDetail';

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
  // Sheet sync overrides — lifted here so Billable Waybills list and the
  // Add Waybill modal in BillableCreateStatementForm see the same prices.
  const [syncedOverrides, setSyncedOverrides] = useState<Record<string, Partial<Waybill>>>({});
  // Statements created from Billable Waybills flow (synced to My Statements list)
  const [extraStatements, setExtraStatements] = useState<StatementRow[]>([]);
  // Full snapshot per user-created statementNo, used by StatementDetail when no built-in mock matches.
  const [extraStatementData, setExtraStatementData] = useState<Record<string, StatementMockData>>({});

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
  const [draftSuccessNo, setDraftSuccessNo] = useState<string | null>(null);
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
    const snapshot: StatementMockData = {
      source: 'Self-Created',
      reconciliationPeriod: data.reconciliationPeriod,
      taxMark: data.taxMark,
      totalAmountPayable: data.totalSubmittedAmount,
      createDate: data.createdAt.slice(0, 10),
      waybills: data.waybills.map(w => ({
        no: w.no,
        waybillAmount: w.basicAmount + w.additionalCharge + w.exceptionFee + w.reimbursement,
        basicAmount: w.basicAmount,
        prepaidAmount: 0,
        additionalCharge: w.additionalCharge,
        exceptionFee: w.exceptionFee,
        reimbursement: w.reimbursement,
        positionTime: w.positionTime,
        unloadingTime: w.unloadingTime,
        truckType: w.truckType,
        origin: w.origin,
        destination: w.destination,
      })),
      claimTickets: data.claims.map(c => ({
        ticketNo: c.no,
        claimType: c.type,
        relatedWaybill: c.waybillNo,
        claimAmount: c.amount,
      })),
      waybillContractCost: data.waybillContractCost,
      vendorBasicAmount: data.totals.basic,
      prepaidAmount: data.prepaidTotal,
      vendorExceptionFee: data.totals.exception,
      vendorAdditionalCharge: data.totals.additional,
      kpiClaim: data.claimTotal,
      vat: data.vatAmount,
      wht: data.whtAmount,
    };

    if (!data.isDraft) {
      // Submitted: persist to localStorage so TMS can see it.
      setPendingWaybills(prev => [...new Set([...prev, ...data.waybillNos])]);
      upsertApStatement({
        no: data.statementNo,
        vendorName: 'Manila Freight Co.',
        source: 'Vendor Portal',
        status: 'Awaiting Comparison',
        statementType: data.statementType,
        reconciliationPeriod: data.reconciliationPeriod,
        taxMark: data.taxMark,
        vatRate: data.vatRate,
        whtRate: data.whtRate,
        vatAmount: data.vatAmount,
        whtAmount: data.whtAmount,
        settlementItems: data.settlementItems,
        totalVpAmount: data.totalSubmittedAmount,
        waybillCount: data.waybillNos.length,
        waybills: data.waybills.map(w => ({
          no: w.no,
          positionTime: w.positionTime,
          unloadingTime: w.unloadingTime,
          truckType: w.truckType,
          origin: w.origin,
          destination: w.destination,
          basicAmount: w.basicAmount,
          additionalCharge: w.additionalCharge,
          exceptionFee: w.exceptionFee,
          reimbursement: w.reimbursement,
        })),
        claims: data.claims.map(c => ({ no: c.no, type: c.type, amount: c.amount, waybillNo: c.waybillNo })),
        createdAt: data.createdAt,
        submittedAt: new Date().toISOString(),
        operationLogs: [{ time: new Date().toISOString(), actor: 'Manila Freight Co.', action: 'Submitted the AP statement' }],
      });
      // StatementList reads submitted statements from localStorage — no need to add to extraStatements.
    } else {
      // Draft: keep in React state only.
      const newRow: StatementRow = {
        no: data.statementNo,
        source: 'Self-Created',
        totalSubmittedAmount: data.totalSubmittedAmount,
        currency: 'PHP',
        statementType: data.statementType,
        waybillCount: data.waybillNos.length,
        invoiceNo: '—',
        status: 'Draft',
        createdAt: data.createdAt.slice(0, 16).replace('T', ' '),
      };
      setExtraStatements(prev => [newRow, ...prev]);
      setExtraStatementData(prev => ({ ...prev, [data.statementNo]: snapshot }));
    }

    // Always keep snapshot so StatementDetail can fall back to it
    setExtraStatementData(prev => ({ ...prev, [data.statementNo]: snapshot }));

    setSelectedWaybills([]);
    setUnbilledView('list');
    setMenu('my-statements');
    setStatementView('list');
    if (data.isDraft) {
      setDraftSuccessNo(data.statementNo);
      setTimeout(() => setDraftSuccessNo(null), 4000);
    } else {
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
    // Use live status from sync if available (TMS may have updated it)
    const synced = getApStatement(no);
    setOpenedStmtStatus(synced ? tmsStatusToVpStatus(synced.status) as StatementStatus : status);
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
    const prepaidAmountMap: Record<string, number> = {};
    const submittedApplications = getAllApplications().filter(app => app.status !== 'Draft');
    for (const app of submittedApplications) {
      for (const wb of app.waybills) {
        if (wb.prePaidAmount > 0) {
          prepaidAmountMap[wb.no] = (prepaidAmountMap[wb.no] || 0) + wb.prePaidAmount;
        }
      }
    }

    const billableWaybills = buildEffectiveWaybills(syncedOverrides, prepaidAmountMap).filter(
      waybill => deriveWaybillStatus(waybill, pendingWaybills) === 'Billable'
    );

    if (unbilledView === 'create') {
      return (
        <BillableCreateStatementForm
          prefillWaybillNos={selectedWaybills}
          billableWaybills={billableWaybills}
          onBack={() => { setSelectedWaybills([]); setUnbilledView('list'); }}
          onSubmit={handleBillableStatementCreate}
        />
      );
    }
    return (
      <UnbilledWaybillsList
        onGenerateStatement={handleGenerateStatement}
        pendingWaybills={pendingWaybills}
        syncedOverrides={syncedOverrides}
        onApplySyncOverrides={() => setSyncedOverrides(SHEET_SYNC_OVERRIDES)}
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
            {draftSuccessNo && (
              <div style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 6, padding: '10px 16px', marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#595959', fontSize: 16 }}>✓</span>
                <span>Statement <strong>{draftSuccessNo}</strong> has been created in <strong>Draft</strong> status.</span>
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
      case 'detail': {
        // Build extraData from localStorage for synced statements, fall back to in-memory snapshot
        const syncedStmt = getApStatement(openedStmtNo);
        let detailExtraData = extraStatementData[openedStmtNo];
        if (syncedStmt && !detailExtraData) {
          detailExtraData = {
            source: 'Self-Created',
            reconciliationPeriod: syncedStmt.reconciliationPeriod,
            taxMark: syncedStmt.taxMark,
            totalAmountPayable: syncedStmt.totalVpAmount,
            createDate: syncedStmt.createdAt.slice(0, 10),
            waybills: syncedStmt.waybills.map(w => ({
              no: w.no,
              waybillAmount: w.basicAmount + w.additionalCharge + w.exceptionFee + w.reimbursement,
              basicAmount: w.basicAmount,
              prepaidAmount: 0,
              additionalCharge: w.additionalCharge,
              exceptionFee: w.exceptionFee,
              reimbursement: w.reimbursement,
              positionTime: w.positionTime,
              unloadingTime: w.unloadingTime,
              truckType: w.truckType,
              origin: w.origin,
              destination: w.destination,
            })),
            claimTickets: syncedStmt.claims.map(c => ({
              ticketNo: c.no,
              claimType: c.type,
              relatedWaybill: c.waybillNo,
              claimAmount: c.amount,
            })),
            waybillContractCost: syncedStmt.waybills.reduce(
              (s, w) => s + w.basicAmount + w.additionalCharge + w.exceptionFee + w.reimbursement, 0
            ),
            vendorBasicAmount: syncedStmt.waybills.reduce((s, w) => s + w.basicAmount, 0),
            prepaidAmount: 0,
            vendorExceptionFee: syncedStmt.waybills.reduce((s, w) => s + w.exceptionFee, 0),
            vendorAdditionalCharge: syncedStmt.waybills.reduce((s, w) => s + w.additionalCharge, 0),
            kpiClaim: syncedStmt.claims.reduce((s, c) => s + c.amount, 0),
            vat: syncedStmt.vatAmount,
            wht: syncedStmt.whtAmount,
            rejectReason: syncedStmt.rejectReason,
            operationLog: (syncedStmt.operationLogs || []).map(l => ({
              timestamp: l.time.slice(0, 16).replace('T', ' '),
              action: l.action,
              operator: l.actor,
              subLine: l.note ? `Reason: ${l.note}` : undefined,
            })),
          };
        } else if (syncedStmt && detailExtraData) {
          // Merge in reject reason and operation log from sync
          detailExtraData = {
            ...detailExtraData,
            rejectReason: syncedStmt.rejectReason ?? detailExtraData.rejectReason,
            operationLog: syncedStmt.operationLogs
              ? syncedStmt.operationLogs.map(l => ({
                  timestamp: l.time.slice(0, 16).replace('T', ' '),
                  action: l.action,
                  operator: l.actor,
                  subLine: l.note ? `Reason: ${l.note}` : undefined,
                }))
              : detailExtraData.operationLog,
          };
        }
        return (
          <StatementDetailView
            no={openedStmtNo}
            status={openedStmtStatus}
            onBack={() => setStatementView('list')}
            onSubmitToTMS={handleSubmitToTMS}
            extraData={detailExtraData}
            onEdit={
              openedStmtStatus === 'Draft' || openedStmtStatus === 'Awaiting Re-bill'
                ? () => handleEditStatement(openedStmtNo, openedStmtStatus)
                : undefined
            }
          />
        );
      }
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
