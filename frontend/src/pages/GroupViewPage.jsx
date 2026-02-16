import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;
const formatINR = (value) => {
  const n = Number(value || 0);
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
};

const GroupViewPage = () => {
  const { token } = useParams() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

const settleExpense = async (expenseId) => {
  try {
    const settledExpenseTitle =
      data?.expenses?.find((e) => e._id === expenseId)?.title ||
      "this expense";

    const settleRes = await fetch(
      `${API_BASE}/api/groups/group-view/${token}/expenses/${expenseId}/settle`,
      { method: "PATCH" }
    );

    const settleJson = await settleRes.json().catch(() => ({}));

    if (!settleRes.ok) {
      setActionMessage(settleJson.message || "Could not settle this expense.");
      return;
    }

    // 🔁 Refresh view immediately
    const res = await fetch(`${API_BASE}/api/groups/view/${token}`);
    const json = await res.json();
    setData(json);

    const viewerName = json?.group?.viewerName || "Member";
    const viewerBalance = Number(json?.group?.balances?.[viewerName] || 0);

    const statusText =
      viewerBalance < 0
        ? `now needs to pay ₹${formatINR(Math.abs(viewerBalance))}`
        : viewerBalance > 0
        ? `now needs to receive ₹${formatINR(viewerBalance)}`
        : "is now fully settled";

    setActionMessage(
      `${viewerName} settled "${settledExpenseTitle}" and ${statusText}.`
    );
  } catch (err) {
    console.error("Settle failed", err);
    setActionMessage("Settle failed. Please try again.");
  }
};

  useEffect(() => {
    if (!token) return;

    const fetchGroup = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/groups/view/${token}`);
        if (!res.ok) throw new Error("Invalid or expired link");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [token]);

  if (!token) {
    return <div className="readonly-error">Invalid link</div>;
  }

  /* ================= SKELETON LOADER ================= */
  if (loading) {
    return (
      <div className="readonly-page">
        <div className="readonly-card animate-in">
          <div className="skeleton title"></div>

          <div className="skeleton-block">
            <div className="skeleton avatar-row"></div>
            <div className="skeleton avatar-row"></div>
          </div>

          <div className="skeleton-block">
            <div className="skeleton row"></div>
            <div className="skeleton row"></div>
          </div>

          <div className="skeleton-block">
            <div className="skeleton pill"></div>
            <div className="skeleton pill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="readonly-error">{error}</div>;
  }

  const { group, expenses } = data;
  const mySummary = group?.mySummary || { youPay: [], youReceive: [] };

  return (
    <div className="readonly-page">
      <div className="readonly-card animate-in">
        {/* HEADER */}
        <div className="readonly-header">
          <h2>{group.name}</h2>
          <span className="readonly-badge">Read only</span>
        </div>

        {actionMessage && <p className="muted">{actionMessage}</p>}

        {/* MEMBERS */}
        <section className="readonly-section">
          <h4>Members</h4>
          <div className="member-grid">
            {group.members.map((m, i) => (
              <div key={i} className="member-chip">
                <div className="avatar">{m.name[0]}</div>
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* EXPENSES */}
<section className="readonly-section">
  <h4>Expenses</h4>

  {expenses.length === 0 ? (
    <p className="muted">No expenses added yet</p>
  ) : (
    <div className="expense-list">
      {expenses.map((e) => (
        <div key={e._id} className="expense-card readonly-expense">
          <div className="expense-left">
            <strong>{e.title}</strong>
            <div className="muted small">
              Paid by {e.paidBy}
            </div>
          </div>

          <div className="expense-right">
            <span className="amount">₹{e.amount}</span>

            {/* ✅ SETTLE BUTTON FOR LINK MEMBERS */}
            {e.canSettle ? (
              <button
                className="settle-btn"
                onClick={() => settleExpense(e._id)}
                title="Mark as settled"
              >
                ✔ Settle
              </button>
            ) : e.isViewerSettled ? (
              <span className="settled-badge">Your part settled</span>
            ) : (
              <span className="settled-badge">Settled</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {/* BALANCES */}
        <section className="readonly-section">
          <h4>Your Balances</h4>

          {mySummary.youPay.length === 0 && mySummary.youReceive.length === 0 ? (
            <p className="muted">All settled for you</p>
          ) : (
            <div className="balance-list">
              {mySummary.youPay.map((item, i) => (
                <div key={`pay-${i}`} className="balance-pill negative">
                  <span>You</span>
                  <strong>
                    pay ₹{item.amount} to {item.to}
                  </strong>
                </div>
              ))}

              {mySummary.youReceive.map((item, i) => (
                <div key={`receive-${i}`} className="balance-pill positive">
                  <span>You</span>
                  <strong>
                    get ₹{item.amount} from {item.from}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GroupViewPage;