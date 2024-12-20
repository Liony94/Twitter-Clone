const router = require("express").Router();
const tweetRoutes = require("./tweet.routes");
const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes");
const messageRoutes = require("./messages.routes");

router.use("/tweet", tweetRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);

module.exports = router;
