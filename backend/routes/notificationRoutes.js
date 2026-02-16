const express = require("express");
const Notification = require("../models/Notification");
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const ensureMonthlySummaryNotification = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const existing = await Notification.findOne({
    user: userId,
    code: "monthly-summary",
    createdAt: { $gte: monthStart, $lte: monthEnd },
  });
  if (existing) return;

  const expenses = await Expense.find({
    user: userId,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  if (expenses.length === 0) return;

  let total = 0;
  const byCat = {};
  expenses.forEach((e) => {
    const cat = e.category || "Other";
    byCat[cat] = (byCat[cat] || 0) + e.amount;
    total += e.amount;
  });

  const topCats = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const message = `Monthly summary: You spent ₹${total.toFixed(
    0
  )} this month. Top categories: ${topCats.join(", ")}.`;

  await Notification.create({
    user: userId,
    code: "monthly-summary",
    message,
  });
};

const ensureLogReminderNotification = async (userId) => {
  const lastExpense = await Expense.findOne({ user: userId })
    .sort({ date: -1 })
    .lean();

  const today = startOfToday();

  if (!lastExpense) {
    const existing = await Notification.findOne({
      user: userId,
      code: "log-reminder",
    });
    if (!existing) {
      await Notification.create({
        user: userId,
        code: "log-reminder",
        message: "You haven't added any expenses yet. Log your daily expenses to track spending.",
      });
    }
    return;
  }

  const last = new Date(lastExpense.date);
  last.setHours(0, 0, 0, 0);

  const diffDays = (today - last) / (1000 * 60 * 60 * 24);

  if (diffDays >= 0) {

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const existing = await Notification.findOne({
      user: userId,
      code: "log-reminder",
      createdAt: { $gte: threeDaysAgo },
    });

    if (!existing) {
      await Notification.create({
        user: userId,
        code: "log-reminder",
        message: "You haven't added expenses for a few days. Remember to log your daily spending.",
      });
    }
  }
};

router.get("/", auth, async (req, res) => {
  try {

    await Promise.all([
      ensureMonthlySummaryNotification(req.user._id),
      ensureLogReminderNotification(req.user._id),
    ]);

    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Read-all notifications error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
