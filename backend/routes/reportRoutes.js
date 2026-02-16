const express = require("express");
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const byCategory = {};
    let total = 0;

    expenses.forEach((e) => {
      const cat = e.category || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + e.amount;
      total += e.amount;
    });

    res.json({ total, byCategory });
  } catch (err) {
    console.error("Report summary error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/csv", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      date: 1,
    });

    let csv = "Date,Category,Amount,Description\n";

    expenses.forEach((e) => {
      const d = new Date(e.date).toISOString().slice(0, 10);
      const desc = (e.description || "").replace(/,/g, " "); 
      csv += `${d},${e.category},${e.amount},${desc}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="expenses_report.csv"'
    );

    res.send(csv);
  } catch (err) {
    console.error("Report csv error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
