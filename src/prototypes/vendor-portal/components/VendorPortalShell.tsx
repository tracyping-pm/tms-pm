import React from 'react';

interface Props {
  children: React.ReactNode;
  breadcrumb: string[];
  activeMenu: string;
  onMenuChange: (key: string) => void;
}

const MENU_MAIN = [
  { key: 'home', label: 'Home' },
  { key: 'vendor-info', label: 'Vendor Info' },
  { key: 'trucks', label: 'Trucks' },
  { key: 'crew', label: 'Crew' },
];

const MENU_FIN = [
  { key: 'accreditation', label: 'Accreditation Application' },
  { key: 'price-reconciliation', label: 'Price Reconciliation' },
  { key: 'claim-tickets', label: 'Claim Tickets' },
  { key: 'settlement', label: 'Settlement Application' },
  { key: 'my-statements', label: 'My Statements' },
];

function VendorPortalShell({ children, breadcrumb, activeMenu, onMenuChange }: Props) {
  const isClickable = (k: string) => ['price-reconciliation', 'claim-tickets', 'settlement', 'my-statements'].includes(k);

  return (
    <div className="vp-layout">
      <aside className="vp-sidebar">
        <div className="vp-brand">
          <div style={{ width: 30, height: 30, borderRadius: 6, background: '#e6f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L8 5v3h6V5l5 5-5 5v-3H8v3l-5-5z" fill="#00b96b"/>
            </svg>
          </div>
          <span className="vp-brand-text">Inteluck VP</span>
          <span className="vp-badge-vp">VENDOR</span>
        </div>

        <div className="vp-nav-group">MAIN</div>
        {MENU_MAIN.map((m) => (
          <div
            key={m.key}
            className={`vp-nav-item${m.key === activeMenu ? ' active' : ''}`}
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Not part of this prototype"
          >
            {m.label}
          </div>
        ))}

        <div className="vp-nav-group">FINANCE</div>
        {MENU_FIN.map((m) => {
          const clickable = isClickable(m.key);
          return (
            <div
              key={m.key}
              className={`vp-nav-item${m.key === activeMenu ? ' active' : ''}`}
              style={clickable ? {} : { opacity: 0.5, cursor: 'not-allowed' }}
              onClick={() => clickable && onMenuChange(m.key)}
              title={clickable ? undefined : 'Not part of this prototype'}
            >
              {m.label}
            </div>
          );
        })}
      </aside>

      <div className="vp-main">
        <div className="vp-topbar">
          <div className="vp-breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="sep">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'current' : ''}>{crumb}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="vp-user">
            <div style={{ position: 'relative', cursor: 'pointer' }} title="Messages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                position: 'absolute', top: -4, right: -6,
                background: '#ff4d4f', color: '#fff', fontSize: 10,
                fontWeight: 700, borderRadius: 8, padding: '0 4px',
                lineHeight: '14px', minWidth: 14, textAlign: 'center'
              }}>3</span>
            </div>
            <div className="vp-user-avatar">C</div>
            <span style={{ fontSize: 13, color: '#333' }}>Coca-Cola Bottlers PH Inc.</span>
          </div>
        </div>

        <div className="vp-content">{children}</div>
      </div>
    </div>
  );
}

export default VendorPortalShell;
