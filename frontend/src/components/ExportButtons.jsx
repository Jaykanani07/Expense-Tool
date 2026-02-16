// src/components/ExportButtons.jsx
import React from "react";

const ExportButtons = ({ expenses }) => {

  // ---------------- CSV EXPORT ----------------
  const exportCSV = () => {
    const headers = ["Date", "Category", "Amount", "Description"];

    const rows = expenses.map((e) => [
      e.date,
      e.category,
      e.amount,
      e.description || "",
    ]);

    const csvArray = [headers, ...rows];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvArray.map((row) => row.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "expense_report.csv";
    link.click();
  };


  // ---------------- PDF EXPORT ----------------
  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Report</title>
        </head>
        <body>
          <h2 style="text-align:center;">Expense Report</h2>
          <table border="1" width="100%" cellspacing="0" cellpadding="6">
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
            ${expenses
              .map(
                (e) => `
              <tr>
                <td>${e.date}</td>
                <td>${e.category}</td>
                <td>₹${e.amount}</td>
                <td>${e.description || ""}</td>
              </tr>`
              )
              .join("")}
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  return (
    <div className="export-actions">
      <button className="primary-btn" onClick={exportCSV}>
        Export CSV
      </button>

      <button className="secondary-btn" onClick={exportPDF}>
        Export PDF
      </button>
    </div>
  );
};

export default ExportButtons;
