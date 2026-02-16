// src/components/ExpenseList.jsx
import React, { useState } from "react";

const categories = ["Food", "Travel", "Shopping", "Bills", "Other"];

const ExpenseList = ({
  expenses,
  setExpenses,
  recurringExpenses,
  setRecurringExpenses,
}) => {
  /* ================= ONE-TIME EXPENSE STATE ================= */
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    category: "",
    description: "",
    amount: "",
  });

  /* ================= RECURRING STATE ================= */
  const [editingRecurringId, setEditingRecurringId] = useState(null);
  const [recurringForm, setRecurringForm] = useState({
    title: "",
    amount: 1000,
    category: "Bills",
    day: 1,
  });

  /* ================= RECURRING HANDLERS ================= */

  const startRecurringEdit = (r) => {
    setEditingRecurringId(r.id);
    setRecurringForm({
      title: r.title,
      amount: Number(r.amount),
      category: r.category,
      day: Number(r.day),
    });
  };

  const handleRecurringChange = (e) => {
    const { name, value } = e.target;

    setRecurringForm((prev) => ({
      ...prev,
      [name]:
        name === "day" || name === "amount"
          ? Number(value)
          : value,
    }));
  };

  const saveRecurringEdit = (id) => {
    setRecurringExpenses((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...recurringForm,
            }
          : r
      )
    );
    setEditingRecurringId(null);
  };

  const deleteRecurring = (id) => {
    setRecurringExpenses((prev) =>
      prev.filter((r) => r.id !== id)
    );
  };

  const toggleStatus = (id) => {
    setRecurringExpenses((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      )
    );
  };

  /* ================= ONE-TIME EXPENSE HANDLERS ================= */

  const handleDelete = (id) => {
    setExpenses((prev) =>
      prev.filter((e) => e.id !== id)
    );
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...editForm } : e
      )
    );
    setEditingId(null);
  };

  const handleChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* ================= RECURRING EXPENSES ================= */}
      <section className="expense-panel">
        <div className="panel-header">
          <h3>Recurring Expenses</h3>
          <button
            className="primary-btn"
            onClick={() => {
              const id = crypto.randomUUID();

              const newRec = {
                id,
                title: "New Recurring",
                amount: 1000,
                category: "Bills",
                day: 1,
                active: true,
                lastAddedMonth: null,
              };

              // ✅ CREATE FIRST
              setRecurringExpenses((prev) => [
                ...prev,
                newRec,
              ]);

              // ✅ THEN EDIT
              startRecurringEdit(newRec);
            }}
          >
            + Add Recurring
          </button>
        </div>

        {recurringExpenses.length === 0 ? (
          <p className="muted">✨ Add recurring items once and let them track automatically every month.</p>
        ) : (
          recurringExpenses.map((r) => (
            <div key={r.id} className="recurring-row">
              {editingRecurringId === r.id ? (
                <div className="recurring-edit-grid">
                  <div className="field">
                    <label>Name</label>
                    <input
                      name="title"
                      value={recurringForm.title}
                      onChange={handleRecurringChange}
                    />
                  </div>

                  <div className="field">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={recurringForm.amount}
                      onChange={handleRecurringChange}
                    />
                  </div>

                  <div className="field">
                    <label>Category</label>
                    <select
                      name="category"
                      value={recurringForm.category}
                      onChange={handleRecurringChange}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Due day (1–28)</label>
                    <input
                      type="number"
                      name="day"
                      min="1"
                      max="28"
                      value={recurringForm.day}
                      onChange={handleRecurringChange}
                    />
                  </div>

                  <div className="recurring-actions">
                    <button
                      className="primary-btn"
                      onClick={() =>
                        saveRecurringEdit(r.id)
                      }
                    >
                      Save
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        setEditingRecurringId(null)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <strong>{r.title}</strong>
                    <p className="muted">
                      ₹{r.amount} • Monthly • Due {r.day}th
                    </p>
                  </div>

                  <div className="recurring-actions">
                    <button
                      className={
                        r.active
                          ? "active-btn"
                          : "paused-btn"
                      }
                      onClick={() => toggleStatus(r.id)}
                    >
                      {r.active ? "Active" : "Paused"}
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        startRecurringEdit(r)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() =>
                        deleteRecurring(r.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </section>

      {/* ================= ONE-TIME EXPENSES ================= */}
      <section className="expense-panel">
        <h3>One-time Expenses</h3>

        {!expenses.length ? (
          <p className="muted">🎉 You’re all set! Add your first expense to start tracking.</p>
        ) : (
          <div className="expense-list">
            {expenses.map((e) => (
              <div key={e.id} className="expense-card">
                {editingId === e.id ? (
                  <>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleChange}
                    />

                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleChange}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <input
                      name="description"
                      value={editForm.description}
                      onChange={handleChange}
                    />

                    <input
                      type="number"
                      name="amount"
                      value={editForm.amount}
                      onChange={handleChange}
                    />

                    <div className="expense-actions">
                      <button
                        className="primary-btn"
                        onClick={() =>
                          saveEdit(e.id)
                        }
                      >
                        Save
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="expense-left">
                      <h4>{e.category}</h4>
                      <p className="muted">
                        {e.description || "—"}
                      </p>
                      <span className="expense-date">
                        {e.date}
                      </span>
                    </div>

                    <div className="expense-right">
                      <strong className="amount-strong">
                        ₹{Number(e.amount).toFixed(2)}
                      </strong>
                      <div className="expense-actions">
                        <button
                          className="secondary-btn"
                          onClick={() =>
                            startEdit(e)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="danger-btn"
                          onClick={() =>
                            handleDelete(e.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default ExpenseList;
