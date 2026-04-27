import React from 'react';

export type MenuKey =
  | 'application-list'
  | 'application-create'
  | 'application-detail'
  | 'waybill-billing'
  | 'ap-statement';

const MENU_LABEL: Record<MenuKey, string> = {
  'application-list':   'Applications',
  'application-create': 'Create Application',
  'application-detail': 'Application Detail',
  'waybill-billing':    'Waybill Billing (Field Update)',
  'ap-statement':       'AP Statement (Column Update)',
};

interface ShellProps {
  menu: MenuKey;
  setMenu: (m: MenuKey) => void;
  breadcrumb: string[];
  topbarRight?: React.ReactNode;
  children: React.ReactNode;
}

export default function Shell({ menu, setMenu, breadcrumb, topbarRight, children }: ShellProps) {
  return (
    <div className="ppa-layout">
      <aside className="ppa-sidebar">
        <div className="ppa-brand">
          <span className="ppa-brand-text">Inteluck TMS</span>
          <span className="ppa-brand-badge">Finance</span>
        </div>
        <div className="ppa-nav-group">Financial Process</div>
        <div
          className={`ppa-nav-item ${['application-list','application-create','application-detail'].includes(menu) ? 'active' : ''}`}
          onClick={() => setMenu('application-list')}
        >
          📑 Partial Payment Application
        </div>
        <div className="ppa-nav-group">Other Modules (mock)</div>
        <div
          className={`ppa-nav-item ${menu === 'waybill-billing' ? 'active' : ''}`}
          onClick={() => setMenu('waybill-billing')}
        >
          🚚 Waybill Billing
        </div>
        <div
          className={`ppa-nav-item ${menu === 'ap-statement' ? 'active' : ''}`}
          onClick={() => setMenu('ap-statement')}
        >
          🧾 AP Statement
        </div>
      </aside>
      <main className="ppa-main">
        <div className="ppa-topbar">
          <div className="ppa-breadcrumb">
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="sep">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'current' : ''}>{b}</span>
              </React.Fragment>
            ))}
          </div>
          <div>{topbarRight}</div>
        </div>
        <div className="ppa-content">{children}</div>
      </main>
    </div>
  );
}

export { MENU_LABEL };
