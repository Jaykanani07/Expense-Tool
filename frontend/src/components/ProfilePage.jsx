import React, { useEffect, useState } from "react";

/* ================= AVATAR OPTIONS ================= */
/* These URLs are saved DIRECTLY into profile.avatar */
const AVATARS = [
  {
    src: "https://res.cloudinary.com/dngfwucpu/image/upload/v1766071085/Avtar_1_dktgic.png",
  },
  {
    src: "https://res.cloudinary.com/dngfwucpu/image/upload/v1766071067/Avtar_2_lmf3fu.png",
  },
  {
    src: "https://res.cloudinary.com/dngfwucpu/image/upload/v1766071089/Avtar_3_quakct.png",
  },
  {
    src: "https://res.cloudinary.com/dngfwucpu/image/upload/v1766071083/Avtar_4_helofk.png",
  },
];

const ProfilePage = ({ user, profile, onSave, onLogout }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    spenderType: "Moderate",
    spendingNotes: "",
    incomeSource: "Salary",
    monthlyIncome: "",
    savingGoal: "",
    financialGoal: "",
    avatar: "", // 🔥 avatar URL stored here
  });

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (profile) {
      setForm(profile);
    } else {
      setForm((prev) => ({
        ...prev,
        fullName: user?.name || "",
        email: user?.email || "",
      }));
    }
  }, [profile, user]);

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= AVATAR SELECT ================= */
  const handleAvatarSelect = (avatarUrl) => {
    setForm((prev) => ({
      ...prev,
      avatar: avatarUrl, // ✅ URL saved directly
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    onSave(form); // 🔥 DO NOT CHANGE
    alert("Profile saved successfully");
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile & Preferences</h1>
        <p className="muted">Manage your personal and financial details</p>
      </div>

      {/* ================= AVATAR SECTION ================= */}
      <div className="avatar-section">
  <div className="profile-card">
    <h3>Select Avatar</h3>
    <div className="avatar-grid">
      {AVATARS.map((a) => (
        <button
          key={a.src}
          type="button"
          className={`avatar-option ${
            form.avatar === a.src ? "active" : ""
          }`}
          onClick={() => handleAvatarSelect(a.src)}
        >
          <img src={a.src} alt="avatar" />
        </button>
      ))}
    </div>
  </div>
</div>


      <div className="profile-grid">
        {/* Personal Info */}
        <div className="profile-card">
          <h3>Personal Information</h3>

          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />

          <label>Email</label>
          <input value={form.email} disabled />
        </div>

        {/* Spending Behaviour */}
        <div className="profile-card">
          <h3>Spending Behaviour</h3>

          <label>Spender Type</label>
          <select
            name="spenderType"
            value={form.spenderType}
            onChange={handleChange}
          >
            <option>Conservative</option>
            <option>Moderate</option>
            <option>High Spender</option>
          </select>

          <label>Spending Habits</label>
          <textarea
            name="spendingNotes"
            value={form.spendingNotes}
            onChange={handleChange}
            placeholder="Example: Mostly food and travel"
          />
        </div>

        {/* Financial Details */}
        <div className="profile-card">
          <h3>Financial Details</h3>

          <label>Income Source</label>
          <select
            name="incomeSource"
            value={form.incomeSource}
            onChange={handleChange}
          >
            <option>Salary</option>
            <option>Business</option>
            <option>Freelance</option>
            <option>Other</option>
          </select>

          <label>Monthly Income (₹)</label>
          <input
            name="monthlyIncome"
            value={form.monthlyIncome}
            onChange={handleChange}
            type="number"
          />

          <label>Monthly Saving Goal (₹)</label>
          <input
            name="savingGoal"
            value={form.savingGoal}
            onChange={handleChange}
            type="number"
          />
        </div>

        {/* Goals */}
        <div className="profile-card">
          <h3>Goals & Notes</h3>

          <label>Financial Goal</label>
          <textarea
            name="financialGoal"
            value={form.financialGoal}
            onChange={handleChange}
            placeholder="Example: Save for emergency fund"
          />
        </div>
      </div>

      <div className="profile-actions">
        <button className="primary-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
