const Group = require("../models/Group");
const GroupExpense = require("../models/GroupExpense");

/* ================= CREATE GROUP ================= */
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const creator = {
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
    };

const cleanMembers = members
  .filter((m) => m.name)
  .map((m) => ({
    name: m.name,
    phone: m.phone || "",
    email: m.email || "",
    viewToken: generateToken(), // 🔹 NEW
  }));

    const finalMembers = [creator, ...cleanMembers];

    const balances = {};
    finalMembers.forEach((m) => {
      balances[m.name] = 0;
    });

    const group = await Group.create({
      name,
      description,
      createdBy: req.user.id,
      members: finalMembers,
      balances,
    });

    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const crypto = require("crypto");

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

/* ================= GET USER GROUPS ================= */
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { createdBy: req.user.id },
        { "members.user": req.user.id },
      ],
    }).sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE GROUP ================= */
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.name = req.body.name ?? group.name;
    group.description = req.body.description ?? group.description;

    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE GROUP ================= */
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!group) {
      return res.status(404).json({ message: "Not allowed" });
    }

    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADD GROUP EXPENSE ================= */
exports.addGroupExpense = async (req, res) => {
  try {
    const { title, amount, paidBy } = req.body;
    const { groupId } = req.params;

    if (!title || !amount || !paidBy) {
      return res.status(400).json({ message: "Invalid expense data" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    await GroupExpense.create({
      group: groupId,
      title,
      amount: Number(amount),
      paidBy,
      splitBetween: group.members.map((m) => m.name), // kept but not used
      settledBy: [],
    });

    await recalcBalances(groupId);

    res.status(201).json({ message: "Expense added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE GROUP EXPENSE ================= */
exports.updateGroupExpense = async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;
    const { title, amount } = req.body;

    const expense = await GroupExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.title = title ?? expense.title;
    expense.amount = Number(amount) ?? expense.amount;
    await expense.save();

    await recalcBalances(groupId);

    res.json({ message: "Expense updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE GROUP EXPENSE ================= */
exports.deleteGroupExpense = async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;

    await GroupExpense.findByIdAndDelete(expenseId);
    await recalcBalances(groupId);

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SETTLE GROUP EXPENSE ================= */
exports.settleGroupExpense = async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;

    const expense = await GroupExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.isSettled = true;
    expense.settledAt = new Date();
    await expense.save();

    await recalcBalances(groupId);

    res.json({ message: "Expense settled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADD GROUP MEMBER ================= */
exports.addGroupMember = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const { groupId } = req.params;

    if (!name) {
      return res.status(400).json({ message: "Member name required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const exists = group.members.some(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "Member already exists" });
    }

    group.members.push({
      name,
      email: email || "",
      phone: phone || "",
    });

    await group.save();

    // 🔥 IMPORTANT FIX
    await recalcBalances(groupId);

    res.json(group);
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const { sendEmail } = require("../utils/sendEmail");

/* ================= SHARE GROUP VIA EMAIL ================= */
exports.shareGroupByEmail = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only members with email + token
    const membersWithEmail = group.members.filter(
      (m) => m.email && m.viewToken
    );

    for (const member of membersWithEmail) {
      const link = `${process.env.FRONTEND_URL}/group-view/${member.viewToken}`;

      await sendEmail({
        to: member.email,
        subject: `View expenses for ${group.name}`,
        html: `
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">
      
      <!-- Header -->
      <tr>
        <td style="background:#111827; padding:20px; text-align:center;">
          <h2 style="color:#ffffff; margin:0;">Expense Tool</h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px;">
          <p style="font-size:16px; margin-top:0;">Hello ${member.name},</p>

          <p style="font-size:15px; line-height:1.6;">
            You’ve been invited to view expenses for 
            <strong>${group.name}</strong>.
          </p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${link}" 
               style="background:#111827; color:#ffffff; 
                      padding:14px 22px; text-decoration:none; 
                      border-radius:6px; font-weight:bold; 
                      display:inline-block;">
              View Group Expenses
            </a>
          </div>

          <p style="font-size:14px; color:#555;">
            This secure link allows you to view and settle your share of the expenses.
          </p>

          <p style="font-size:14px; color:#555;">
            If you were not expecting this email, you can safely ignore it.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb; padding:20px; text-align:center;">
          <p style="font-size:12px; color:#999; margin:0;">
            © ${new Date().getFullYear()} Expense Tool<br/>
            Automated notification — please do not reply.
          </p>
        </td>
      </tr>

    </table>
  </div>
`,
      });
    }

    res.json({ message: "Emails sent successfully" });
  } catch (err) {
    console.error("Share email error:", err);
    res.status(500).json({ message: "Failed to send emails" });
  }
};

/* ================= SHARE GROUP WITH ONE MEMBER ================= */
exports.shareGroupWithMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const member = group.members.find(
      (m) => m.email && m.email.toLowerCase() === email.toLowerCase()
    );

    if (!member || !member.viewToken) {
      return res.status(404).json({ message: "Member or token not found" });
    }

    // ✅ USE EXISTING TOKEN
    const link = `${process.env.FRONTEND_URL}/group-view/${member.viewToken}`;

    await sendEmail({
      to: member.email,
      subject: `View expenses for ${group.name}`,
      html: `
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">
      
      <!-- Header -->
      <tr>
        <td style="background:#111827; padding:20px; text-align:center;">
          <h2 style="color:#ffffff; margin:0;">Expense Tool</h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px;">
          <p style="font-size:16px; margin-top:0;">Hello ${member.name},</p>

          <p style="font-size:15px; line-height:1.6;">
            You’ve been invited to view expenses for 
            <strong>${group.name}</strong>.
          </p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${link}" 
               style="background:#111827; color:#ffffff; 
                      padding:14px 22px; text-decoration:none; 
                      border-radius:6px; font-weight:bold; 
                      display:inline-block;">
              View Group Expenses
            </a>
          </div>

          <p style="font-size:14px; color:#555;">
            This secure link allows you to view and settle your share of the expenses.
          </p>

          <p style="font-size:14px; color:#555;">
            If you were not expecting this email, you can safely ignore it.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb; padding:20px; text-align:center;">
          <p style="font-size:12px; color:#999; margin:0;">
            © ${new Date().getFullYear()} Expense Tool<br/>
            Automated notification — please do not reply.
          </p>
        </td>
      </tr>

    </table>
  </div>
`,
    });

    res.json({ message: `Link sent to ${member.name}` });
  } catch (err) {
    console.error("Individual share error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};

/* ================= GET GROUP EXPENSES ================= */
exports.getGroupExpenses = async (req, res) => {
  try {
    const expenses = await GroupExpense.find({
      group: req.params.groupId,
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET SINGLE GROUP ================= */
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SETTLE EXPENSE BY MEMBER TOKEN ================= */
exports.settleExpenseByToken = async (req, res) => {
  try {
    const { token, expenseId } = req.params;

    // 1️⃣ Find group using member token
    const group = await Group.findOne({
      "members.viewToken": token,
    });

    if (!group) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    const member = group.members.find((m) => m.viewToken === token);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // 2️⃣ Find expense
    const expense = await GroupExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const memberName = member.name;
    const participants =
      Array.isArray(expense.splitBetween) && expense.splitBetween.length > 0
        ? expense.splitBetween
        : group.members.map((m) => m.name);

    // Payer does not need to settle their own share.
    if (expense.paidBy === memberName) {
      return res
        .status(400)
        .json({ message: "Payer cannot settle this expense" });
    }

    if (!participants.includes(memberName)) {
      return res
        .status(400)
        .json({ message: "You are not part of this expense" });
    }

    if (!Array.isArray(expense.settledBy)) {
      expense.settledBy = [];
    }

    if (expense.settledBy.includes(memberName)) {
      return res.json({ message: "Your share is already settled" });
    }

    // 3️⃣ Settle only this member's share
    expense.settledBy.push(memberName);

    const debtors = participants.filter((name) => name !== expense.paidBy);
    const allDebtorsSettled = debtors.every((name) =>
      expense.settledBy.includes(name)
    );

    if (allDebtorsSettled) {
      expense.isSettled = true;
      expense.settledAt = new Date();
    }

    await expense.save();

    // 4️⃣ Recalculate balances (UNCHANGED CORE LOGIC)
    await recalcBalances(group._id);

    res.json({
      message: allDebtorsSettled
        ? "Expense settled successfully"
        : "Your share has been settled",
    });
  } catch (err) {
    console.error("Token settle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= BALANCE RECALC (FINAL LOGIC) ================= */
async function recalcBalances(groupId) {
  const group = await Group.findById(groupId);
  if (!group) return;

  group.balances = {};
  const members = group.members.map((m) => m.name);

  members.forEach((name) => {
    group.balances[name] = 0;
  });

  const expenses = await GroupExpense.find({
    group: groupId,
    isSettled: { $ne: true },
  });

  expenses.forEach((e) => {
    const participants =
      Array.isArray(e.splitBetween) && e.splitBetween.length > 0
        ? e.splitBetween
        : members;

    const perHead = e.amount / participants.length;
    const settledBy = Array.isArray(e.settledBy) ? e.settledBy : [];

    const unsettledDebtors = participants.filter(
      (memberName) =>
        memberName !== e.paidBy && !settledBy.includes(memberName)
    );

    unsettledDebtors.forEach((debtorName) => {
      if (typeof group.balances[debtorName] === "number") {
        group.balances[debtorName] -= perHead;
      }
    });

    if (typeof group.balances[e.paidBy] === "number") {
      group.balances[e.paidBy] += perHead * unsettledDebtors.length;
    }
  });

  await group.save();
}
/* ================= VIEW GROUP BY TOKEN (READ-ONLY) ================= */
exports.viewGroupByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const group = await Group.findOne({
      "members.viewToken": token,
    });

    if (!group) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    const viewer = group.members.find((m) => m.viewToken === token);
    if (!viewer) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    // Get expenses (read-only)
    const expenses = await GroupExpense.find({
      group: group._id,
    }).sort({ createdAt: -1 });

    const settlements = getSettlementsFromBalances(group.balances || {});
    const mySettlements = settlements.filter(
      (s) => s.from === viewer.name || s.to === viewer.name
    );

    const mySummary = {
      youPay: mySettlements
        .filter((s) => s.from === viewer.name)
        .map((s) => ({ to: s.to, amount: s.amount })),
      youReceive: mySettlements
        .filter((s) => s.to === viewer.name)
        .map((s) => ({ from: s.from, amount: s.amount })),
    };

    const expensesForViewer = expenses.map((expense) => {
      const participants =
        Array.isArray(expense.splitBetween) && expense.splitBetween.length > 0
          ? expense.splitBetween
          : group.members.map((m) => m.name);

      const settledBy = Array.isArray(expense.settledBy) ? expense.settledBy : [];

      const canSettle =
        participants.includes(viewer.name) &&
        expense.paidBy !== viewer.name &&
        !expense.isSettled &&
        !settledBy.includes(viewer.name);

      return {
        ...expense.toObject(),
        canSettle,
        isViewerSettled:
          expense.paidBy === viewer.name || settledBy.includes(viewer.name),
      };
    });

    res.json({
      group: {
        name: group.name,
        description: group.description,
        viewerName: viewer.name,
        members: group.members.map((m) => ({
          name: m.name,
        })),
        balances: group.balances,
        mySummary,
      },
      expenses: expensesForViewer,
    });
  } catch (err) {
    console.error("View group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

function getSettlementsFromBalances(balances) {
  const toPaise = (value) => Math.round(Number(value || 0) * 100);
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([name, amount]) => {
    const paise = toPaise(amount);
    if (Math.abs(paise) <= 1) return;

    if (paise > 0) creditors.push({ name, paise });
    if (paise < 0) debtors.push({ name, paise: -paise });
  });

  creditors.sort((a, b) => b.paise - a.paise);
  debtors.sort((a, b) => b.paise - a.paise);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payPaise = Math.min(debtors[i].paise, creditors[j].paise);
    settlements.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount: payPaise / 100,
    });

    debtors[i].paise -= payPaise;
    creditors[j].paise -= payPaise;

    if (debtors[i].paise <= 0) i++;
    if (creditors[j].paise <= 0) j++;
  }

  return settlements;
}
