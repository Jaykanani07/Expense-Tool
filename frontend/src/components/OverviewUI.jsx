import React, { useState } from "react";
import SpendingCharts from "./SpendingCharts";
import AddExpenseForm from "./AddExpenseForm";

const OverviewUI = ({
  totalSpent,
  budget,
  remaining,
  expenses,
  budgetInput,
  setBudgetInput,
  onBudgetSubmit,
  onAddExpense,
  categoryBudgets,
  onUpdateCategoryBudget,
}) => {
  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const categorySpend = {};
  expenses.forEach((e) => {
    categorySpend[e.category] =
      (categorySpend[e.category] || 0) + Number(e.amount || 0);
  });

  return (
    <>
      <section className="balance-hero animate-in">
        <p className="hero-label">Total Balance</p>
        <h2 className={remaining < 0 ? "negative" : "positive"}>
          ₹{remaining.toFixed(2)}
        </h2>
        <div className="balance-meta-row">
          <div>
            <span className="muted small">Income / Budget</span>
            <strong>₹{budget.toFixed(2)}</strong>
          </div>
          <div>
            <span className="muted small">Expense</span>
            <strong className="negative">₹{totalSpent.toFixed(2)}</strong>
          </div>
          <div>
            <span className="muted small">Savings</span>
            <strong className={remaining < 0 ? "negative" : "positive"}>
              ₹{Math.max(remaining, 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      <section className="overview-cards">
        <div className="overview-card">
          <p>Expense</p>
          <h2>₹{totalSpent.toFixed(2)}</h2>
        </div>
        <div className="overview-card">
          <p>Income</p>
          <h2>₹{budget.toFixed(2)}</h2>
        </div>
        <div className="overview-card">
          <p>Savings</p>
          <h2 className={remaining < 0 ? "negative" : ""}>
            ₹{remaining.toFixed(2)}
          </h2>
        </div>
      </section>

  {/* ================= CATEGORY + REMAINING LAYOUT ================= */}
      <section className="overview-panel budget-layout">

        {/* LEFT SIDE : CATEGORY BUDGETS (70%) */}
        <div className="budget-left">
          <h3>Category Budgets</h3>

          {Object.keys(categoryBudgets).map((cat) => {
            const spent = categorySpend[cat] || 0;
            const limit = categoryBudgets[cat];
            const percent = Math.min((spent / limit) * 100, 100);

            return (
              <div key={cat} className="cat-row">
                <div className="cat-header">
                  <span className="cat-name">{cat}</span>

                  {editing === cat ? (
                    <div className="cat-edit-inline">
                      <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                      />
                      <button
                        className="cat-save"
                        onClick={() => {
                          onUpdateCategoryBudget(cat, Number(tempValue));
                          setEditing(null);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="cat-cancel"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="cat-actions">
                      <span className="cat-amount">
                        ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()}
                      </span>
                      <button
                        className="cat-edit-btn"
                        onClick={() => {
                          setEditing(cat);
                          setTempValue(limit);
                        }}
                        title="Edit budget"
                      >
                        ✏
                      </button>
                    </div>
                  )}
                </div>

                <div className="cat-progress">
                  <div
                    className={`cat-progress-fill ${
                      percent >= 100
                        ? "danger"
                        : percent >= 80
                        ? "warn"
                        : "safe"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE : REMAINING BUDGET CIRCLE (30%) */}
        <div className="budget-right">
          <div
            className="remaining-circle"
            style={{
              background: `conic-gradient(
                ${remaining < 0 ? "#dc2626" : "#22c55e"} ${
                budget > 0 ? Math.max((remaining / budget) * 100, 0) : 0
              }%,
                #e5e7eb 0
              )`,
            }}
          >
            <div className="remaining-inner">
              <span className="remaining-percent">
                {budget > 0
                  ? Math.max(Math.round((remaining / budget) * 100), 0)
                  : 0}
                %
              </span>
              <span className="remaining-label">Remaining</span>
            </div>
          </div>
        </div>

      </section>

      {/* CHART + ADD EXPENSE */}
      <section className="monthly-report-grid">
        <div className="overview-panel">
          <h3>Monthly Report</h3>
          <SpendingCharts expenses={expenses} />
        </div>

        <div className="overview-panel">
          <h3>Set Monthly Budget</h3>
          <form className="budget-form" onSubmit={onBudgetSubmit}>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
            <button className="primary-btn">Save Budget</button>
          </form>

          <h3>Add Expense</h3>
          <AddExpenseForm onAddExpense={onAddExpense} />
        </div>
      </section>

      {/* RECENT EXPENSES — AT BOTTOM */}
      <section className="overview-panel">
        <h3>Recent Expenses</h3>
        <p className="muted small">Your latest 5 transactions</p>

        {expenses.length === 0 ? (
          <p className="muted">🎉 You’re all set! Add your first expense to start tracking.</p>
        ) : (
          expenses.slice(0, 5).map((e, i) => (
            <div key={i} className="recent-row-grid">
              <div className="recent-category">{e.category}</div>
              <div className="recent-date">
                {e.date ? e.date.split("-").reverse().join("-") : ""}
              </div>
              <div className="recent-amount">
                ₹{Number(e.amount).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
};

export default OverviewUI;
