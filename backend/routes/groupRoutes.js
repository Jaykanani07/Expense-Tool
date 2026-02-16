/*groupRoutes.js */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

/* ================= GROUP ================= */

// GET all groups
router.get("/", authMiddleware, groupController.getMyGroups);

// ✅ GET single group (THIS FIXES WHITE SCREEN)
router.get("/:id", authMiddleware, groupController.getGroupById);

// CREATE group
router.post("/", authMiddleware, groupController.createGroup);

// UPDATE group
router.put("/:id", authMiddleware, groupController.updateGroup);

// DELETE group
router.delete("/:id", authMiddleware, groupController.deleteGroup);

/* ================= GROUP EXPENSES ================= */

// ADD expense
router.post(
  "/:groupId/expenses",
  authMiddleware,
  groupController.addGroupExpense
);

// GET expenses
router.get(
  "/:groupId/expenses",
  authMiddleware,
  groupController.getGroupExpenses
);

// UPDATE expense
router.put(
  "/:groupId/expenses/:expenseId",
  authMiddleware,
  groupController.updateGroupExpense
);
router.delete(
  "/:groupId/expenses/:expenseId",
  authMiddleware,
  groupController.deleteGroupExpense
);

router.patch(
  "/:groupId/expenses/:expenseId/settle",
  authMiddleware,
  groupController.settleGroupExpense
);
router.post(
  "/:groupId/members",
  authMiddleware,
  groupController.addGroupMember
);
  
router.get(
  "/view/:token",
  groupController.viewGroupByToken
);
// 📧 SHARE GROUP VIA EMAIL
router.post(
  "/:groupId/share/email",
  authMiddleware,
  groupController.shareGroupByEmail
);
router.post(
  "/:groupId/share/member",
  authMiddleware,
  groupController.shareGroupWithMember
);

router.patch(
  "/group-view/:token/expenses/:expenseId/settle",
  groupController.settleExpenseByToken
);

module.exports = router;
