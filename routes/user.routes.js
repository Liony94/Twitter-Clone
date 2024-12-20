const router = require("express").Router();
const User = require("../database/models/user.model");

router.get("/", async (req, res, next) => {
  const users = await User.find();
  res.render("users", { users });
});

module.exports = router;
