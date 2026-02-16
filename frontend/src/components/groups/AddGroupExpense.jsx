import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const emojiMap = {
  cake: "🎂",
  food: "🍕",
  travel: "✈️",
  flight: "✈️",
  hotel: "🏨",
  fuel: "⛽",
  petrol: "⛽",
  party: "🎉",
  water: "💧",
  ticket: "🎟️",
  tea: "🍵",
  coffee: "☕",
  transportation: "🚌",
  train: "🚆",
};

const AddGroupExpense = ({ group, onAdded, onClose }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");

  /* 🔹 Auto add emoji */
  const handleTitleChange = (value) => {
    const lower = value.toLowerCase();
    const emoji = Object.keys(emojiMap).find((k) =>
      lower.includes(k)
    );

    if (emoji && !value.includes(emojiMap[emoji])) {
      setTitle(`${emojiMap[emoji]} ${value}`);
    } else {
      setTitle(value);
    }
  };

  const submitExpense = async () => {
    if (!title || !amount || !paidBy) {
      alert("All fields required");
      return;
    }

    await fetch(`${API_BASE}/api/groups/${group._id}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        paidBy,
      }),
    });

    setSuccess(true);

    setTimeout(async () => {
      setTitle("");
      setAmount("");
      setPaidBy("");
      setSuccess(false);
      await onAdded();
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal expense-modal">
        {success ? (
          <div className="success-tick">✔</div>
        ) : (
          <>
            <h3>Add Expense</h3>

            <input
              placeholder="Expense title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitExpense()}
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitExpense()}
            />

            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              <option value="">Paid by</option>
              {group.members.map((m, i) => (
                <option key={i} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button className="primary-btn" onClick={submitExpense}>
                Add Expense
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddGroupExpense;
