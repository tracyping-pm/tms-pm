import React from 'react';

interface AppShellProps {
  title: string;
  activeMenu: string; // 'ar-statement' | 'ap-statement'
  onMenuChange: (menu: string) => void;
  children: React.ReactNode;
}

function AppShell({ title, activeMenu, onMenuChange, children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* 左侧导航 */}
      <nav className="nav-sidebar">
        {/* Logo 区域 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            backgroundColor: '#fff',
          }}
        >
          {/* 图标占位 */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              backgroundColor: '#e6f7ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="#00b96b" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="#00b96b" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="#00b96b" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="#00b96b" />
            </svg>
          </div>
          <span style={{ color: '#333', fontSize: 14, fontWeight: 600 }}>Inteluck TMS</span>
          <span style={{ background: '#00b96b', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 3, marginLeft: 6, fontWeight: 600 }}>DEV</span>
        </div>

        {/* 菜单 */}
        <div style={{ paddingTop: 8 }}>
          <div className="nav-item" onClick={() => onMenuChange('home')}>
            <span style={{ marginRight: 8 }}>&#127968;</span>Home Page
          </div>
          <div className="nav-item" onClick={() => onMenuChange('customer')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ marginRight: 8 }}>&#128100;</span>Customer Mgmt</span>
            <span style={{ fontSize: 10, color: '#999' }}>&#9662;</span>
          </div>
          <div className="nav-item" onClick={() => onMenuChange('procurement')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ marginRight: 8 }}>&#128230;</span>Procurement Mgmt</span>
            <span style={{ fontSize: 10, color: '#999' }}>&#9662;</span>
          </div>
          <div className="nav-item" onClick={() => onMenuChange('project')}>
            <span style={{ marginRight: 8 }}>&#128203;</span>Project Mgmt
          </div>

          <div className="nav-group-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: '#00b96b', borderRadius: 2 }} />
            AR&amp;AP Mgmt
            <span style={{ fontSize: 10, color: '#999', marginLeft: 'auto' }}>&#9652;</span>
          </div>
          <div
            className="nav-item"
            onClick={() => onMenuChange('ar-dashboard')}
            style={{ paddingLeft: 36 }}
          >
            AR Dashboard
          </div>
          <div
            className={`nav-item${activeMenu === 'ar-statement' ? ' active' : ''}`}
            onClick={() => onMenuChange('ar-statement')}
            style={{ paddingLeft: 36 }}
          >
            AR Statement
          </div>
          <div
            className={`nav-item${activeMenu === 'ap-statement' ? ' active' : ''}`}
            onClick={() => onMenuChange('ap-statement')}
            style={{ paddingLeft: 36 }}
          >
            AP Statement
          </div>

          <div className="nav-item" onClick={() => onMenuChange('user')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ marginRight: 8 }}>&#128101;</span>User Mgmt</span>
            <span style={{ fontSize: 10, color: '#999' }}>&#9662;</span>
          </div>
          <div className="nav-item" onClick={() => onMenuChange('statistics')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ marginRight: 8 }}>&#128202;</span>Statistics</span>
            <span style={{ fontSize: 10, color: '#999' }}>&#9662;</span>
          </div>
          <div className="nav-item" onClick={() => onMenuChange('tools')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ marginRight: 8 }}>&#128295;</span>Tools</span>
            <span style={{ fontSize: 10, color: '#999' }}>&#9662;</span>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 顶部 Header */}
        <header className="top-header" style={{ justifyContent: 'space-between' }}>
          {/* 左侧：页面标题 + 下拉箭头 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{title}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M0 0l5 6 5-6z" fill="#555" />
            </svg>
          </div>

          {/* 右侧：工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* 下载图标 */}
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555' }}
              title="Download"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v13M7 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20h16" strokeLinecap="round" />
              </svg>
            </button>

            {/* 通知图标 + 徽章 */}
            <div style={{ position: 'relative' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555' }}
                title="Notifications"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  background: '#ff4d4f',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: '0 4px',
                  lineHeight: '16px',
                  minWidth: 16,
                  textAlign: 'center',
                }}
              >
                5
              </span>
            </div>

            {/* 头像图标 */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: '#00b96b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Z
            </div>

            {/* 用户名 */}
            <span style={{ fontSize: 13, color: '#333' }}>Zhang Jialei</span>

            {/* 国旗占位 */}
            <span style={{ fontSize: 18, lineHeight: 1 }} title="Language">&#127464;&#127475;</span>
          </div>
        </header>

        {/* 内容区 */}
        <main style={{ flex: 1, backgroundColor: '#f5f5f5', overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
