// src/components/ReportsUI.jsx
import React from "react";
import ExportButtons from "./ExportButtons";

const ReportsUI = ({ expenses }) => {
  return (
    <div className="panel">
      <h2>Reports & Exports</h2>
      <p className="muted">
        Download your expense data for reports and analysis.
      </p>
      <ExportButtons expenses={expenses} />
    </div>
  );
};

export default ReportsUI;
