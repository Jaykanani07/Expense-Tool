import React, { useState, useRef, useEffect } from "react";

import Sidebar from "./Sidebar";
import OverviewUI from "./OverviewUI";
import ExpenseList from "./ExpenseList";
import ReportsUI from "./ReportsUI";
import ProfilePage from "./ProfilePage";
import GroupsPage from "./groups/GroupsPage";


/* REQUIRED FOR GOOGLE LOGIN / BACKEND */
const API_BASE = "http://localhost:5000";
const DEMO_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzkwMzE2N2MwNjNjOTc0NmM1N2RhNyIsImVtYWlsIjoiamF5MUBleGFtcGxlLmNvbSIsImlhdCI6MTc2NTM2NDI5NywiZXhwIjoxNzY1OTY5MDk3fQ.hY3SzmTIepXsKUQMQF8rf4NR7u67Aqom0rgQ8OXUQms";

const Dashboard = ({
  user,
  onLogout,
  expenses,
  setExpenses,
  budget,
  setBudget,
  profile,
  setProfile,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );

  const tabTitles = {
    overview: "Overview",
    expenses: "Expenses",
    groups: "Groups",
    reports: "Reports",
    profile: "Profile",
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("emt_theme", nextTheme);
  };

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 1100) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  /* ================= UI STATE ================= */
  const [activeTab, setActiveTab] = useState("overview");
  const [budgetInput, setBudgetInput] = useState(String(budget || 0));
  // ================= RECURRING EXPENSES =================
const [recurringExpenses, setRecurringExpenses] = useState([]);

  /* CATEGORY BUDGETS */
  const [categoryBudgets, setCategoryBudgets] = useState({
    Food: 5000,
    Travel: 3000,
    Shopping: 2000,
    Bills: 7000,
    Other: 3000,
  });

  /* ================= NOTIFICATIONS ================= */
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toastsRef = useRef([]);

  const closeToast = (id) => {
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
    setToasts([...toastsRef.current]);
  };

  const pushToast = (toast, ttl = 5000) => {
    if (
      toastsRef.current.some(
        (t) => t.code === toast.code || t.message === toast.message
      )
    )
      return;

    const id = Date.now() + Math.random();
    const t = { id, ...toast };
    toastsRef.current.push(t);
    setToasts([...toastsRef.current]);

    setTimeout(() => closeToast(id), ttl);
  };

  const showNotification = ({ code, message }) => {
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    pushToast({ code, message, time });

    setNotifications((prev) =>
      prev.some((n) => n.code === code)
        ? prev
        : [...prev, { id: Date.now(), code, message, time }]
    );
  };

  /* ================= ADD EXPENSE ================= */
  const handleAddExpense = (expense) => {
    setExpenses((prev) => {
      const updated = [expense, ...prev];

      const total = updated.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
      );

      /* TOTAL BUDGET ALERTS */
      if (budget > 0) {
        if (total >= budget * 0.8 && total < budget) {
          showNotification({
            code: "near-80",
            message: "You have used 80% of your budget.",
          });
        }

        if (total >= budget) {
          showNotification({
            code: "over-budget",
            message: "You have exceeded your monthly budget!",
          });
        }

        if (budget - total < budget * 0.1) {
          showNotification({
            code: "budget-low",
            message: "You have less than 10% of your total budget remaining.",
          });
        }

        if (Number(expense.amount) >= budget * 0.3) {
          showNotification({
            code: "large-expense",
            message: `Large expense added: ₹${expense.amount}`,
          });
        }
      }

      /* CATEGORY ALERTS */
      const limit = categoryBudgets[expense.category];
      if (limit) {
        const spent = updated
          .filter((e) => e.category === expense.category)
          .reduce((s, e) => s + Number(e.amount || 0), 0);

        if (spent >= limit * 0.8 && spent < limit) {
          showNotification({
            code: `cat-80-${expense.category}`,
            message: `${expense.category} category has reached 80% of its budget.`,
          });
        }

        if (spent >= limit * 0.95 && spent < limit) {
          showNotification({
            code: `cat-critical-${expense.category}`,
            message: `${expense.category} category is almost exhausted.`,
          });
        }

        if (spent >= limit) {
          showNotification({
            code: `cat-over-${expense.category}`,
            message: `${expense.category} category budget exceeded.`,
          });
        }
      }

      /* DUPLICATE EXPENSE */
      const key = `${expense.date}-${expense.category}-${expense.amount}`;
      const count = updated.filter(
        (e) => `${e.date}-${e.category}-${e.amount}` === key
      ).length;

      if (count > 1) {
        showNotification({
          code: "duplicate-expense",
          message: "Possible duplicate expense detected.",
        });
      }

      return updated;
    });
  };
      useEffect(() => {
        const today = new Date();
        const todayDate = today.getDate();
        const currentMonth = today.getMonth();

        recurringExpenses.forEach((rec) => {
          if (
            rec.active &&
            rec.day === todayDate &&
            rec.lastAddedMonth !== currentMonth
          ) {
            // Auto add expense
            handleAddExpense({
              amount: rec.amount,
              category: rec.category,
              date: today.toISOString().slice(0, 10),
              description: `${rec.title} (Recurring)`,
            });

            showNotification({
              code: `recurring-added-${rec.id}`,
              message: `${rec.title} added automatically.`,
            });

            setRecurringExpenses((prev) =>
              prev.map((r) =>
                r.id === rec.id
                  ? { ...r, lastAddedMonth: currentMonth }
                  : r
              )
            );
          }

          // Reminder (3 days before)
          if (rec.active && rec.day - todayDate === 3) {
            showNotification({
              code: `recurring-reminder-${rec.id}`,
              message: `${rec.title} is due in 3 days.`,
            });
          }
        });
      }, [recurringExpenses]);

  /* ================= CATEGORY BUDGET EDIT ================= */
  const handleUpdateCategoryBudget = (category, newValue) => {
    setCategoryBudgets((prev) => {
      const oldValue = prev[category];
      const diff = newValue - oldValue;
      if (diff === 0) return prev;

      const others = Object.keys(prev).filter((c) => c !== category);
      const perCat = diff / others.length;

      for (let c of others) {
        if (prev[c] - perCat < 0) {
          showNotification({
            code: "cat-budget-error",
            message:
              "Not enough budget in other categories to make this change.",
          });
          return prev;
        }
      }

      const updated = { ...prev, [category]: newValue };
      others.forEach((c) => {
        updated[c] = Math.round(updated[c] - perCat);
      });

      showNotification({
        code: `cat-budget-${category}`,
        message: `${category} budget updated.`,
      });

      showNotification({
        code: "cat-redistribute-info",
        message: "Other category budgets were auto-balanced.",
      });

      return updated;
    });
  };

  /* ================= MONTHLY BUDGET CHANGE ================= */
  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const newBudget = Number(budgetInput);
    if (newBudget <= 0 || newBudget === budget) return;

    setCategoryBudgets((prev) => {
      if (budget <= 0) return prev;
      const ratio = newBudget / budget;
      const updated = {};
      Object.keys(prev).forEach((c) => {
        updated[c] = Math.round(prev[c] * ratio);
      });
      return updated;
    });

    setBudget(newBudget);

    showNotification({
      code: "budget-updated",
      message:
        "Monthly budget updated. Category budgets adjusted automatically.",
    });
  };

  /* ================= CALCULATIONS ================= */
  const totalSpent = expenses.reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );
  const remaining = budget - totalSpent;

  /* ================= RENDER ================= */
  return (
    <>
      <div className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Sidebar
          user={user}
          profile={profile}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          onLogout={onLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main className="main-area">
          {/* HEADER + BELL */}
          <div className="page-header">
            <div>
              <button
                className="mobile-menu-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰ Menu
              </button>
              <h1>{tabTitles[activeTab]}</h1>
              <p className="muted small">
                Smart spending insights with a fresh modern dashboard
              </p>
            </div>

            <div className="page-header-right">
              {/* Theme Toggle */}
              <div className="theme-toggle-wrapper" style={{ marginRight: '15px' }}>
                <input
                  className="theme-toggle-checkbox"
                  id="header-theme-toggle"
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                />
                <label className="theme-toggle" htmlFor="header-theme-toggle">
                  <div className="theme-toggle-track">
                    <div className="theme-toggle-track-glow"></div>
                    <div className="theme-toggle-track-dots">
                      <span className="theme-toggle-track-dot"></span>
                      <span className="theme-toggle-track-dot"></span>
                      <span className="theme-toggle-track-dot"></span>
                    </div>
                  </div>
                  <div className="theme-toggle-thumb">
                    <div className="theme-toggle-thumb-shadow"></div>
                    <div className="theme-toggle-thumb-highlight"></div>
                    <div className="theme-toggle-thumb-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M16.5 12c0-2.48-2.02-4.5-4.5-4.5s-4.5 2.02-4.5 4.5 2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5zm-4.5 7.5c-4.14 0-7.5-3.36-7.5-7.5s3.36-7.5 7.5-7.5 7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zm0-16.5c-4.97 0-9 4.03-9 9h-3l3.89 3.89.07.14 4.04-4.03h-3c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42c1.63 1.63 3.87 2.64 6.36 2.64 4.97 0 9-4.03 9-9s-4.03-9-9-9z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="theme-toggle-particles">
                    <span className="theme-toggle-particle"></span>
                    <span className="theme-toggle-particle"></span>
                    <span className="theme-toggle-particle"></span>
                    <span className="theme-toggle-particle"></span>
                  </div>
                </label>
                <div className="theme-toggle-labels">
                  <span className="theme-toggle-label-off">LIGHT</span>
                  <span className="theme-toggle-label-on">DARK</span>
                </div>
              </div>

              <div className="notif-wrapper" style={{ marginRight: '10px' }}>
              <button
                className="icon-btn"
                onClick={() => setShowNotifications((s) => !s)}
              >
                🔔
                {notifications.length > 0 && (
                  <span className="notif-badge">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  {notifications.length === 0 ? (
                    <p className="muted">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="notif-item">
                        <p>{n.message}</p>
                        <span>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            </div>
          </div>

          {activeTab === "overview" && (
        <OverviewUI
          totalSpent={totalSpent}
          budget={budget}
          remaining={remaining}
          expenses={expenses}
          budgetInput={budgetInput}
          setBudgetInput={setBudgetInput}
          onBudgetSubmit={handleBudgetSubmit}
          onAddExpense={handleAddExpense}
          categoryBudgets={categoryBudgets}
          onUpdateCategoryBudget={handleUpdateCategoryBudget}
        />
          )}

          {activeTab === "expenses" && (
            <ExpenseList expenses={expenses} setExpenses={setExpenses}  
            recurringExpenses={recurringExpenses}
            setRecurringExpenses={setRecurringExpenses}
            />
          )}

          {activeTab === "reports" && <ReportsUI expenses={expenses} />}
          {activeTab === "groups" && <GroupsPage />}
          {activeTab === "profile" && (
            <ProfilePage
              user={user}
              profile={profile}
              onSave={setProfile}
              onLogout={onLogout}
            />
          )}
        </main>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <p>{t.message}</p>
            <button onClick={() => closeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
