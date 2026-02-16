import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const GroupExpenses = ({
  expenses,
  groupId,
  onUpdated,
  readOnly = false, // 👈 important
}) => {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [settlingId, setSettlingId] = useState(null);

  const token = localStorage.getItem("token");

  /* ✅ SETTLE — allowed for ALL users */
  const settleExpense = async (id) => {
    setSettlingId(id);

    try {
      await fetch(
        `${API_BASE}/api/groups/${groupId}/expenses/${id}/settle`,
        {
          method: "PATCH",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}, // 👈 allow link users
        }
      );

      onUpdated(); // realtime update
    } catch (err) {
      console.error(err);
    } finally {
      setSettlingId(null);
    }
  };

  /* ❌ EDIT — admin only */
  const saveEdit = async (id) => {
    await fetch(
      `${API_BASE}/api/groups/${groupId}/expenses/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
        }),
      }
    );

    setEditingId(null);
    onUpdated();
  };

  /* ❌ DELETE — admin only */
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    await fetch(
      `${API_BASE}/api/groups/${groupId}/expenses/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    onUpdated();
  };

  return (
    <div className="expense-list">
      {expenses.map((e) =>
        editingId === e._id ? (
          <div key={e._id} className="expense-card edit">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button className="primary-btn" onClick={() => saveEdit(e._id)}>
              Save
            </button>
          </div>
        ) : (
          <div
            key={e._id}
            className={`expense-card ${
              settlingId === e._id ? "settling" : ""
            }`}
          >
            <div>
              <strong>{e.title}</strong>
              <div className="muted">
                 by {e.paidBy}</div>
            </div>

            <div className="expense-actions">
              <span>₹{e.amount}</span>

              {/* ✅ SETTLE BUTTON — ALWAYS VISIBLE */}
              {!e.isSettled && (
                <button
                  className="settle-btn"
                  title="Mark as settled"
                  onClick={() => settleExpense(e._id)}
                >
                  ✔
                </button>
              )}

              {/* ❌ ADMIN ONLY */}
              {token && !readOnly && (
                <>
                  <button
                    className="icon-btn expense-action-btn"
                    onClick={() => {
                      setEditingId(e._id);
                      setTitle(e.title);
                      setAmount(e.amount);
                    }}
                  >
                    ✏
                  </button>

                  <button
                    className="icon-btn expense-action-btn delete"
                    onClick={() => deleteExpense(e._id)}
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default GroupExpenses;
