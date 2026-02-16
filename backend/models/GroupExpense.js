const mongoose = require("mongoose");

const groupExpenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paidBy: {
      type: String,
      required: true,
    },

    splitBetween: [
      {
        type: String,
      },
    ],

    settledBy: [
      {
        type: String,
      },
    ],

    // ✅ PHASE 2 ADDITIONS
    isSettled: {
      type: Boolean,
      default: false,
    },

    settledAt: {
      type: Date,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupExpense", groupExpenseSchema);
