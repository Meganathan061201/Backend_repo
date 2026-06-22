const express = require("express");

const auth = require("../middleware/auth");
const { checkRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/dashboard", auth, checkRole("admin", "moderator"), (req, res) => {
  res.json({ message: "Moderator dashboard", user: req.user });
});

module.exports = router;


//Admin > Moderator > User