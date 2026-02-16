// src/components/ProfileModal.jsx
import React, { useEffect, useState } from "react";

const ProfileModal = ({ user, profile, onClose, onSave }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setFullName(profile?.fullName || user.name || "");
    setEmail(profile?.email || user.email || "");
    setIncomeSource(profile?.incomeSource || "");
    setMonthlyIncome(profile?.monthlyIncome || "");
    setNotes(profile?.notes || "");
  }, [user, profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      fullName,
      email,
      incomeSource,
      monthlyIncome,
      notes,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Profile</h2>
          <button
            type="button"
            className="ghost-btn small"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} disabled />
          </div>

          <div className="field">
            <label>Income Source</label>
            <input
              type="text"
              placeholder="e.g. Job, Freelancing, Business"
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Monthly Income (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 30000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Notes / Goals</label>
            <textarea
              rows={3}
              placeholder="Savings goal, comments about your spending..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn full-width">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
