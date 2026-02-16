import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const CATEGORY_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#7c3aed",
  "#dc2626",
  "#0f766e",
];

const SpendingCharts = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <p className="muted">
        Not enough data yet. Add a few expenses to see charts.
      </p>
    );
  }

  // ----- Pie chart: amount by category -----
  const categoryMap = {};
  expenses.forEach((e) => {
    const cat = e.category || "Other";
    const amt = Number(e.amount || 0);
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += amt;
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // ----- Bar chart: amount by MONTH  -----
  const monthMap = {};
  expenses.forEach((e) => {
    if (!e.date) return;
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`; // e.g. 2025-12
    const label = d.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!monthMap[key]) {
      monthMap[key] = { label, amount: 0 };
    }
    monthMap[key].amount += Number(e.amount || 0);
  });

  const monthData = Object.keys(monthMap)
    .sort() // sorts by year-month key
    .map((key) => ({
      month: monthMap[key].label,
      amount: monthMap[key].amount,
    }));

  return (
    <div className="charts-grid">
      <div className="chart-box">
        
        <div className="chart-inner">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={24} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-box">
        <h3>Spending by Month</h3>
        <div className="chart-inner">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar
                dataKey="amount"
                radius={[6, 6, 0, 0]}
                fill="#2563eb"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpendingCharts;
