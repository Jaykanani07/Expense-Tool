// src/components/AddExpenseForm.jsx
import React, { useEffect, useState } from "react";

const categories = ["Food", "Travel", "Shopping", "Bills", "Other"];

const AddExpenseForm = ({ onAddExpense }) => {
  const [form, setForm] = useState({
    date: "",
    category: "Food",
    amount: "",
    description: "",
  });

  useEffect(() => {
    const recentCategory = localStorage.getItem("emt_recent_category");
    if (recentCategory && categories.includes(recentCategory)) {
      setForm((prev) => ({ ...prev, category: recentCategory }));
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.amount) return;

    onAddExpense({
      id: Date.now(),
      ...form,
      amount: Number(form.amount),
    });

    localStorage.setItem("emt_recent_category", form.category);

    setForm({
      date: "",
      category: "Food",
      amount: "",
      description: "",
    });
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="expense-amount">
        <span className="currency">₹</span>
        <input
          type="number"
          name="amount"
          min="0"
          value={form.amount}
          onChange={handleChange}
          placeholder="Add amount"
          autoFocus
          required
        />
      </div>

      <div className="expense-row">
        <div className="field">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label>Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional note"
        />
      </div>

      <button type="submit" className="primary-btn full-width">
        Add Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;
