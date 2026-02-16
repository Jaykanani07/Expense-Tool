// src/components/ExpensesUI.jsx
import React from "react";

const ExpensesUI = ({ expenses }) => {
  return (
    <div className="panel">
      <h2>Expenses</h2>
      <table className="expenses-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, i) => (
            <tr key={i}>
              <td>{e.date}</td>
              <td>{e.category}</td>
              <td>₹{e.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesUI;
