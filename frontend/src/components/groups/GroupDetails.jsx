import React, { useEffect, useState } from "react";
import AddGroupExpense from "./AddGroupExpense";
import GroupExpenses from "./GroupExpenses";
import GroupBalances from "./GroupBalances";
import RecentTransactions from "./RecentTransactions";
import Charts from "./Charts";

const API_BASE = "http://localhost:5000";

const GroupDetails = ({ group, refreshGroup }) => {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const [member, setMember] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // 🔔 Toast state
  const [toast, setToast] = useState(null);
  // toast = { type: "success" | "error", message: string }

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  /* ================= TOAST HELPER ================= */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  /* ================= FETCH EXPENSES ================= */
  const fetchExpenses = async () => {
    const res = await fetch(
      `${API_BASE}/api/groups/${group._id}/expenses`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setExpenses(await res.json());
  };

  const refreshAll = async () => {
    await fetchExpenses();
    await refreshGroup();
  };

  useEffect(() => {
    if (group) fetchExpenses();
  }, [group?._id]);

  if (!group) return null;

  /* ================= ADD MEMBER ================= */
  const addMember = async () => {
    if (!member.name) {
      showToast("error", "Member name is required");
      return;
    }

    try {
      await fetch(`${API_BASE}/api/groups/${group._id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(member),
      });

      setMember({ name: "", email: "", phone: "" });
      setShowAddMember(false);
      refreshAll();
      showToast("success", "Member added successfully");
    } catch {
      showToast("error", "Failed to add member");
    }
  };

  /* ================= SHARE WITH ONE MEMBER ================= */
  const shareWithMember = async (email, name) => {
    if (!email) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/groups/${group._id}/share/member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Failed to send email");
      } else {
        showToast("success", data.message || `Link sent to ${name}`);
      }
    } catch {
      showToast("error", "Failed to send email");
    }
  };

  /* ================= SHARE WITH ALL ================= */
  const shareWithAll = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/groups/${group._id}/share/email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Failed to send emails");
      } else {
        showToast("success", data.message || "Emails sent successfully");
      }
    } catch {
      showToast("error", "Failed to send emails");
    }
  };

  return (
    <div className="group-details-card">
      {/* HEADER */}
      <div className="group-header">
        <div>
          <h2>{group.name}</h2>
          <p className="muted">
            Total spent ₹
            {expenses.reduce((s, e) => s + e.amount, 0)}
          </p>
        </div>

        <div className="header-actions compact-actions">
          <button
            className="primary-btn"
            onClick={() => setShowAddExpense(true)}
          >
            + Add Expense
          </button>

          <button
            className="secondary-btn"
            onClick={() => setShowAddMember(true)}
          >
            + Add Member
          </button>

          <button className="share-btn" onClick={shareWithAll}>
            📨 Share All
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="group-tabs">
        {["expenses", "settlements", "members", "summary"].map((t) => (
          <button
            key={t}
            className={activeTab === t ? "active" : ""}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddExpense && (
        <AddGroupExpense
          group={group}
          onAdded={refreshAll}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMember && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Member</h3>

            <input
              placeholder="Name"
              value={member.name}
              onChange={(e) =>
                setMember({ ...member, name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              value={member.email}
              onChange={(e) =>
                setMember({ ...member, email: e.target.value })
              }
            />
            <input
              placeholder="Phone"
              value={member.phone}
              onChange={(e) =>
                setMember({ ...member, phone: e.target.value })
              }
            />

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowAddMember(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={addMember}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === "expenses" && (
        <>
          <GroupExpenses
            expenses={expenses}
            groupId={group._id}
            onUpdated={refreshAll}
            readOnly={false}
          />
          <RecentTransactions expenses={expenses} />
        </>
      )}

      {activeTab === "settlements" && (
        <GroupBalances
          balances={group.balances}
          currentUserName={currentUser?.name || ""}
        />
      )}

      {activeTab === "members" && (
        <div className="members-grid">
          {group.members.map((m, i) => (
            <div key={i} className="member-card">
              <div className="avatar">{m.name[0]}</div>

              <div className="member-info">
                <strong>{m.name}</strong>
                <div className="muted member-email">
                  {m.email || "—"}
                </div>
              </div>

              {m.email && (
                <button
                  className="member-share-btn"
                  title="Share with this member"
                  onClick={() => shareWithMember(m.email, m.name)}
                >
                  📤
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "summary" && (
        <Charts balances={group.balances} />
      )}

      {/* 🔔 TOAST */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
