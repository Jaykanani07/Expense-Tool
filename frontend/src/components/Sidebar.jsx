// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";

const Sidebar = ({
  activeTab,
  setActiveTab,
  user,
  profile,
  onLogout,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const icons = {
    overview: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5L12 4l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.5V20h11V10.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    expenses: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16.5" cy="14" r="1.2" fill="currentColor" />
      </svg>
    ),
    groups: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 18.5c.8-2.4 2.7-3.8 4.9-3.8 2.2 0 4.1 1.4 4.9 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    reports: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V8M12 19V5M19 19v-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19c.9-2.8 3.3-4.3 6.5-4.3s5.6 1.5 6.5 4.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 12H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    collapse: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.5 7.5L11 12l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    expand: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.5 7.5L13 12l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  const menu = [
    { key: "overview", label: "Home", icon: icons.overview },
    { key: "expenses", label: "Expenses", icon: icons.expenses },
    { key: "groups", label: "Groups", icon: icons.groups },
    { key: "reports", label: "Reports", icon: icons.reports },
    { key: "profile", label: "Profile", icon: icons.profile },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
      <div className="sidebar-brand">
        <span className="brand-badge">₹</span>
        <div>
          <strong>Expense Tool</strong>
          <p className="muted small">Modern Finance</p>
        </div>
      </div>
      <button
        className="sidebar-collapse-btn"
        onClick={onToggleCollapse}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? icons.expand : icons.collapse}
      </button>
      </div>

      <div className="sidebar-profile">
        <div className="avatar">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt="avatar"
              className="avatar-img"
            />
          ) : (
            user?.name?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <p>{user.name}</p>
          <span className="muted small">{user.email}</span>
        </div>
      </div>

      <nav>
        {menu.map((item) => (
          <button
            key={item.key}
            className={activeTab === item.key ? "active" : ""}
            onClick={() => setActiveTab(item.key)}
            title={isCollapsed ? item.label : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout} title={isCollapsed ? "Logout" : ""}>
        <span className="nav-icon">{icons.logout}</span>
        <span className="logout-label">Logout</span>
      </button>
      </aside>
    </>
  );
};

export default Sidebar;
