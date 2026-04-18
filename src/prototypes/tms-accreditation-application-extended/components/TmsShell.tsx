import React from 'react';

interface Props {
  children: React.ReactNode;
  breadcrumb: string[];
  activeMenu: string;
}

const MENU_MAIN = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'waybills', label: 'Waybills' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'trucks', label: 'Trucks' },
];

const MENU_FIN = [
  { key: 'accreditation', label: 'Accreditation Application' },
  { key: 'vendor-statement', label: 'Vendor Statement' },
  { key: 'ar-statement', label: 'AR Statement' },
];

function TmsShell({ children, breadcrumb, activeMenu }: Props) {
  return (
    <div className="tms-layout">
      <aside className="tms-sidebar">
        <div className="tms-brand">
          <div style={{ width: 28, height: 28, borderRadius: 4, background: '#e6f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="#00b96b" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="#00b96b" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="#00b96b" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="#00b96b" />
            </svg>
          </div>
          <span className="tms-brand-text">Inteluck TMS</span>
          <span className="tms-badge">DEV</span>
        </div>

        <div className="tms-nav-group">Operations</div>
        {MENU_MAIN.map(m => (
          <div key={m.key} className={`tms-nav-item${m.key === activeMenu ? ' active' : ''}`}>{m.label}</div>
        ))}

        <div className="tms-nav-group">Financial Management</div>
        {MENU_FIN.map(m => (
          <div key={m.key} className={`tms-nav-item${m.key === activeMenu ? ' active' : ''}`}>{m.label}</div>
        ))}
      </aside>

      <div className="tms-main">
        <div className="tms-topbar">
          <div className="tms-breadcrumb">
            {breadcrumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="sep">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'current' : ''}>{c}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="tms-user">
            <div className="tms-user-avatar">Z</div>
            <span style={{ fontSize: 13, color: '#333' }}>Zhang Jialei · Procurement</span>
          </div>
        </div>
        <div className="tms-content">{children}</div>
      </div>
    </div>
  );
}

export default TmsShell;
