/**
 * @name TMS Prepaid Application & AP Statement
 *
 * V5/V6/V7 设计：
 * - Prepaid Application：VP 同步 + TMS 内部创建，FA 审核（Approve→自动调用 HR Payment API / Reject / Edit）
 * - AP Statement：VP 提交后同步，初始状态 Awaiting Confirmation，支持 TMS 内部创建，新增 Source 字段（VP/Internal）
 * - 菜单：Accreditation Application 已从 Financial Mgmt 删除，统一归口至 Procurement Mgmt
 *
 * 参考资料：
 * - src/docs/prds/S44 VP Billing/VP billing V5.md §3
 * - src/docs/prds/S44 VP Billing/VP billing V6.md §1–§2
 * - src/docs/prds/S44 VP Billing/VP billing V7.md §1–§3
 */

import './style.css';

import React, { useState } from 'react';

import TmsShell from './components/TmsShell';
import ApplicationList from './components/ApplicationList';
import PrepaidReviewDetail from './components/PrepaidReviewDetail';
import CreatePrepaidForm from './components/CreatePrepaidForm';
import ApStatementList from './components/ApStatementList';
import ApStatementDetail from './components/ApStatementDetail';

type ActiveMenu = 'accreditation' | 'ap-statement';
type PrepaidView = 'list' | 'detail' | 'create';
type ApView = 'list' | 'detail';

const Component = function TmsPrepaidApplication() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('accreditation');

  // Prepaid Application views
  const [prepaidView, setPrepaidView] = useState<PrepaidView>('list');
  const [openedAppNo, setOpenedAppNo] = useState('');

  // AP Statement views
  const [apView, setApView] = useState<ApView>('list');
  const [openedStatementId, setOpenedStatementId] = useState('');

  const handleMenuChange = (key: string) => {
    const menu = key as ActiveMenu;
    setActiveMenu(menu);
    if (menu === 'accreditation') setPrepaidView('list');
    if (menu === 'ap-statement') setApView('list');
  };

  const renderPrepaid = () => {
    switch (prepaidView) {
      case 'list':
        return (
          <ApplicationList
            onOpenDetail={(appNo) => { setOpenedAppNo(appNo); setPrepaidView('detail'); }}
            onCreateNew={() => setPrepaidView('create')}
          />
        );
      case 'detail':
        return (
          <PrepaidReviewDetail
            appNo={openedAppNo}
            onBack={() => setPrepaidView('list')}
          />
        );
      case 'create':
        return (
          <CreatePrepaidForm
            onBack={() => setPrepaidView('list')}
            onSubmit={() => setPrepaidView('list')}
          />
        );
    }
  };

  const renderApStatement = () => {
    switch (apView) {
      case 'list':
        return (
          <ApStatementList
            onCreateNew={() => setApView('list')} // placeholder: would open create form
            onViewDetail={(id) => { setOpenedStatementId(id); setApView('detail'); }}
          />
        );
      case 'detail':
        return (
          <ApStatementDetail
            statementId={openedStatementId}
            onBack={() => setApView('list')}
          />
        );
    }
  };

  const renderView = () => {
    if (activeMenu === 'accreditation') return renderPrepaid();
    if (activeMenu === 'ap-statement') return renderApStatement();
    return null;
  };

  const breadcrumb = (() => {
    if (activeMenu === 'accreditation') {
      if (prepaidView === 'detail') return ['Procurement Mgmt', 'Prepaid Application', openedAppNo];
      if (prepaidView === 'create') return ['Procurement Mgmt', 'Prepaid Application', 'Create'];
      return ['Procurement Mgmt', 'Prepaid Application'];
    }
    if (activeMenu === 'ap-statement') {
      if (apView === 'detail') return ['Financial Management', 'AP Statement', openedStatementId];
      return ['Financial Management', 'AP Statement'];
    }
    return [];
  })();

  return (
    <TmsShell breadcrumb={breadcrumb} activeMenu={activeMenu} onMenuChange={handleMenuChange}>
      {renderView()}
    </TmsShell>
  );
};

export default Component;
