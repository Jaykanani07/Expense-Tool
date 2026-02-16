const express = require("express");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

const router = express.Router();


const createNotificationIfNeeded = async (userId, code, message) => {
  const exists = await Notification.findOne({ user: userId, code });
  if (exists) return;
  await Notification.create({ user: userId, code, message });
};

const checkBudgetNotifications = async (userId, expenseDate, lastAmount) => {
  const date = new Date(expenseDate);
  const month = date.getMonth();
  const year = date.getFullYear();

  const budget = await Budget.findOne({ user: userId, month, year });
  if (!budget || budget.amount <= 0) return;

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const expenses = await Expense.find({
    user: userId,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const eighty = budget.amount * 0.8;
  const forty = budget.amount * 0.4;

  if (total >= budget.amount) {
    await createNotificationIfNeeded(
      userId,
      "over-budget",
      `You have exceeded your monthly budget of ₹${budget.amount}.`
    );
  } else if (total >= eighty) {
    await createNotificationIfNeeded(
      userId,
      "near-80",
      `You have used more than 80% of your monthly budget (₹${total.toFixed(
        0
      )} of ₹${budget.amount}).`
    );
  }

  const dayOfMonth = date.getDate();
  if (total >= forty && total < budget.amount) {
    await createNotificationIfNeeded(
      userId,
      "fast-spend",
      `You spent more than 40% of this month's budget in the first week. Consider slowing down your spending.`
    );
  }

  if (lastAmount >= budget.amount * 0.3) {
    await createNotificationIfNeeded(
      userId,
      "large-expense",
      `A large expense of ₹${lastAmount} was added. Please review if this is expected.`
    );
  }
};

const checkDuplicateExpense = async (userId, expense) => {
  const sameDay = new Date(expense.date);
  sameDay.setHours(0, 0, 0, 0);
  const nextDay = new Date(sameDay);
  nextDay.setDate(nextDay.getDate() + 1);

  const existing = await Expense.findOne({
    user: userId,
    category: expense.category,
    amount: expense.amount,
    date: { $gte: sameDay, $lt: nextDay },
    _id: { $ne: expense._id },
  });

  if (existing) {
    await createNotificationIfNeeded(
      userId,
      "duplicate-expense",
      `Possible duplicate expense detected: ₹${expense.amount} for ${expense.category} on this date.`
    );
  }
};

router.post("/", auth, async (req, res) => {
  try {
    const { date, category, amount, description } = req.body;

    if (!date || !category || !amount) {
      return res
        .status(400)
        .json({ message: "date, category and amount are required" });
    }

    const expense = await Expense.create({
      user: req.user._id,
      date,
      category,
      amount,
      description,
    });

    checkBudgetNotifications(req.user._id, date, amount).catch((err) =>
      console.error("Notification budget error:", err.message)
    );

    checkDuplicateExpense(req.user._id, expense).catch((err) =>
      console.error("Notification duplicate error:", err.message)
    );

    res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    console.error("Get expenses error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    let expense = await Expense.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const { date, category, amount, description } = req.body;

    if (date) expense.date = date;
    if (category) expense.category = category;
    if (typeof amount === "number") expense.amount = amount;
    if (description !== undefined) expense.description = description;

    await expense.save();

    res.json(expense);
  } catch (err) {
    console.error("Update expense error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
