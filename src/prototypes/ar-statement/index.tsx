/**
 * @name AR Statement 对账单管理
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - C:\Users\wilso\Desktop\prototype\1_AR_statement_home.png
 * - C:\Users\wilso\Desktop\prototype\2_Add_AR_STATEMENT.png
 * - C:\Users\wilso\Desktop\prototype\AutomaticAllocationMode.png
 * - C:\Users\wilso\Desktop\prototype\ManualAllocationMode.png
 */

import './style.css';

import React, { useState } from 'react';

import AppShell from './components/AppShell';
import StatementList from './components/StatementList';
import CreateStatement from './components/CreateStatement';
import StatementDetailAuto from './components/StatementDetailAuto';
import StatementDetailManual from './components/StatementDetailManual';
import AddInvoiceDialog from './components/AddInvoiceDialog';
import EditInvoiceDialog from './components/EditInvoiceDialog';
import ExportPreviewDialog from './components/ExportPreviewDialog';
import ClaimTicketManage from './components/ClaimTicketManage';

type View = 'list' | 'create' | 'detail-auto' | 'detail-manual' | 'claim';
type Dialog = 'add-invoice' | 'edit-invoice' | 'export' | null;

const Component = function ARStatement() {
  const [view, setView] = useState<View>('list');
  const [dialog, setDialog] = useState<Dialog>(null);

  const handleGenerate = (mode: 'auto' | 'manual') => {
    if (mode === 'auto') {
      setView('detail-auto');
    } else {
      setView('detail-manual');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <StatementList
            onAddStatement={() => setView('create')}
            onViewDetail={(mode) => mode === 'auto' ? setView('detail-auto') : setView('detail-manual')}
            onExport={() => setDialog('export')}
          />
        );
      case 'create':
        return (
          <CreateStatement
            onGenerate={handleGenerate}
            onAddInvoice={() => setDialog('add-invoice')}
            onBack={() => setView('list')}
          />
        );
      case 'detail-auto':
        return (
          <StatementDetailAuto
            onBack={() => setView('list')}
            onExport={() => setDialog('export')}
            onAddInvoice={() => setDialog('add-invoice')}
          />
        );
      case 'detail-manual':
        return (
          <StatementDetailManual
            onBack={() => setView('list')}
            onExport={() => setDialog('export')}
            onAddInvoice={() => setDialog('add-invoice')}
            onEditInvoice={() => setDialog('edit-invoice')}
          />
        );
      case 'claim':
        return (
          <ClaimTicketManage onBack={() => setView('list')} />
        );
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'list':
      case 'create':
      case 'detail-auto':
      case 'detail-manual':
        return 'AR Statement';
      case 'claim':
        return 'Claim Ticket Manage';
    }
  };

  const activeMenu = view === 'claim' ? 'claim' : 'ar-statement';

  return (
    <AppShell
      title={getTitle()}
      activeMenu={activeMenu}
      onMenuChange={(menu) => {
        if (menu === 'ar-statement') setView('list');
        if (menu === 'claim') setView('claim');
      }}
    >
      {renderView()}

      {dialog === 'add-invoice' && (
        <AddInvoiceDialog
          onClose={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
        />
      )}

      {dialog === 'edit-invoice' && (
        <EditInvoiceDialog
          onClose={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
        />
      )}

      {dialog === 'export' && (
        <ExportPreviewDialog
          onClose={() => setDialog(null)}
        />
      )}
    </AppShell>
  );
};

export default Component;
