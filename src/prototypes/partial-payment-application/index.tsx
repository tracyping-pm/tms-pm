/**
 * @name Partial Payment Application
 *
 * 基于 src/docs/prds/S37 Partial Payment Application 详细设计.md 的原型。
 * 覆盖：申请单 List / Create / Detail、运单取消时的资金转移弹窗、
 * Waybill Billing 字段调整示例、AP Statement 列变更对照示例。
 *
 * 参考资料：
 * - src/docs/prds/S37 Partial Payment Application 详细设计.md
 * - src/docs/requirement/Partial Payment 流程优化讨论纪要.md
 * - /Volumes/data/workspace/hr_frontend/src/api/types/payment.ts
 * - /Volumes/data/workspace/hr_frontend/src/enums/index.ts
 * - /Volumes/data/workspace/hr_frontend/src/utils/payments.ts
 */

import './style.css';

import React, { useState } from 'react';

import Shell, { type MenuKey, MENU_LABEL } from './components/Shell';
import ApplicationList from './components/ApplicationList';
import ApplicationCreate from './components/ApplicationCreate';
import ApplicationDetail from './components/ApplicationDetail';
import TransferPrepaymentDialog from './components/TransferPrepaymentDialog';
import WaybillBillingSample from './components/WaybillBillingSample';
import ApStatementSample from './components/ApStatementSample';

const Component = function PartialPaymentApplication() {
  const [menu, setMenu] = useState<MenuKey>('application-list');
  const [openedNo, setOpenedNo] = useState<string>('PPA-TH-20260420-001');

  // Transfer dialog state
  const [transfer, setTransfer] = useState<{ applicationNo: string; waybillNo: string } | null>(null);

  function handleNavigateMenu(m: MenuKey) {
    setMenu(m);
  }

  function handleOpenDetail(no: string) {
    setOpenedNo(no);
    setMenu('application-detail');
  }

  let breadcrumb: string[] = ['Inteluck TMS', 'Financial Process'];
  let body: React.ReactNode = null;

  switch (menu) {
    case 'application-list':
      breadcrumb = [...breadcrumb, 'Partial Payment Application'];
      body = (
        <ApplicationList
          onCreate={() => setMenu('application-create')}
          onOpen={handleOpenDetail}
        />
      );
      break;
    case 'application-create':
      breadcrumb = [...breadcrumb, 'Partial Payment Application', 'Create'];
      body = (
        <ApplicationCreate
          onCancel={() => setMenu('application-list')}
          onSaved={() => setMenu('application-list')}
        />
      );
      break;
    case 'application-detail':
      breadcrumb = [...breadcrumb, 'Partial Payment Application', openedNo];
      body = (
        <ApplicationDetail
          applicationNo={openedNo}
          onBack={() => setMenu('application-list')}
          onTransfer={(applicationNo, waybillNo) => setTransfer({ applicationNo, waybillNo })}
        />
      );
      break;
    case 'waybill-billing':
      breadcrumb = [...breadcrumb, MENU_LABEL[menu]];
      body = <WaybillBillingSample />;
      break;
    case 'ap-statement':
      breadcrumb = [...breadcrumb, MENU_LABEL[menu]];
      body = <ApStatementSample />;
      break;
  }

  return (
    <>
      <Shell menu={menu} setMenu={handleNavigateMenu} breadcrumb={breadcrumb}>
        {body}
      </Shell>
      {transfer && (
        <TransferPrepaymentDialog
          applicationNo={transfer.applicationNo}
          cancelledWaybillNo={transfer.waybillNo}
          onClose={() => setTransfer(null)}
          onConfirm={() => {
            setTransfer(null);
          }}
        />
      )}
    </>
  );
};

export default Component;
