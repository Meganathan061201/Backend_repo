const express = require("express");

const auth = require("../middleware/auth");
const { checkRole } = require("../middleware/authorize");
const User = require("../models/User");

const router = express.Router();

router.get("/dashboard", auth, checkRole("admin"), (req, res) => {
  res.json({ message: "Admin dashboard", user: req.user });
});

router.get("/users", auth, checkRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/users/:id/role", auth, checkRole("admin"), async (req, res) => {
  try {
    const { role } = req.body || {};

    if (!role) {
      return res.status(400).json({
        message: "Send JSON body with role field",
        example: { role: "moderator" },
      });
    }

    const allowed = ["admin", "user", "moderator"];

    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
