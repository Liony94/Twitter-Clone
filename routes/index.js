const router = require("express").Router();
const Tweet = require("../database/models/tweet.model");

router.get("/", async (req, res, next) => {
  try {
    const tweets = await Tweet.find({}).sort({ createdAt: -1 });
    res.render("home", { tweets });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
