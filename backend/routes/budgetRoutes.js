const express = require("express");
const Budget = require("../models/Budget");
const auth = require("../middleware/authMiddleware");

const router = express.Router();


const getMonthYear = (date = new Date()) => ({
  month: date.getMonth(), 
  year: date.getFullYear(),
});


router.post("/", auth, async (req, res) => {
  try {
    let { amount, month, year } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid budget amount is required" });
    }

    if (month === undefined || year === undefined) {
      const now = getMonthYear();
      month = now.month;
      year = now.year;
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, year },
      { amount },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(budget);
  } catch (err) {
    console.error("Set budget error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/current", auth, async (req, res) => {
  try {
    const { month, year } = getMonthYear();

    const budget = await Budget.findOne({
      user: req.user._id,
      month,
      year,
    });

    res.json(
      budget || {
        user: req.user._id,
        month,
        year,
        amount: 0,
      }
    );
  } catch (err) {
    console.error("Get current budget error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({
      year: -1,
      month: -1,
    });
    res.json(budgets);
  } catch (err) {
    console.error("Get budgets error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
