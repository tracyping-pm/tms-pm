/**
 * @name TMS Accreditation Application Extended
 *
 * 参考资料：
 * - /Users/tracy/.claude/plans/unified-cuddling-hare.md
 * - src/docs/prds/S33Vendor 认证材料处理.md（原申请审核框架）
 * - src/docs/prds/S34 对账单优化.md（Edit Billed Amount + Discrepancy Proof）
 * - src/docs/prds/S36Procurement财务.md（Procurement PIC 数据权限）
 */

import './style.css';

import React, { useState } from 'react';

import TmsShell from './components/TmsShell';
import ApplicationList, { type AppType } from './components/ApplicationList';
import SettlementReviewDetail from './components/SettlementReviewDetail';
import ModificationReviewDetail from './components/ModificationReviewDetail';

type View = 'list' | 'settlement-detail' | 'modification-detail' | 'generic-detail';

const Component = function TmsAccreditationApplicationExtended() {
  const [view, setView] = useState<View>('list');
  const [openedApNo, setOpenedApNo] = useState('ApS260416002');

  const openDetail = (apNo: string, type: AppType) => {
    setOpenedApNo(apNo);
    if (type === 'Settlement') setView('settlement-detail');
    else if (type === 'Modification') setView('modification-detail');
    else setView('generic-detail');
  };

  const renderView = () => {
    switch (view) {
      case 'list':
        return <ApplicationList onOpenDetail={openDetail} />;
      case 'settlement-detail':
        return <SettlementReviewDetail apNo={openedApNo} onBack={() => setView('list')} />;
      case 'modification-detail':
        return <ModificationReviewDetail apNo={openedApNo} onBack={() => setView('list')} />;
      case 'generic-detail':
        return (
          <>
            <div className="tms-card" style={{ padding: 14, marginBottom: 16 }}>
              <button className="btn-link" onClick={() => setView('list')}>← Back to Applications</button>
              <span style={{ marginLeft: 10, fontSize: 13, color: '#666' }}>{openedApNo}</span>
            </div>
            <div className="tms-card">
              <div className="section-title">Vendor / Truck / Crew Accreditation</div>
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                Standard Accreditation application review flow (existing S33 behavior unchanged).
              </div>
            </div>
          </>
        );
    }
  };

  const breadcrumb = (() => {
    switch (view) {
      case 'list': return ['Financial Management', 'Accreditation Application'];
      case 'settlement-detail': return ['Financial Management', 'Accreditation Application', openedApNo];
      case 'modification-detail': return ['Financial Management', 'Accreditation Application', openedApNo];
      case 'generic-detail': return ['Financial Management', 'Accreditation Application', openedApNo];
    }
  })();

  return (
    <TmsShell breadcrumb={breadcrumb} activeMenu="accreditation">
      {renderView()}
    </TmsShell>
  );
};

export default Component;
