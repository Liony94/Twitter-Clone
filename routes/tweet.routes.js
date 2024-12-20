const router = require("express").Router();
const Tweet = require("../database/models/tweet.model");

router.post("/new", async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vous devez être connecté" });
    }

    const body = req.body;
    const newTweet = new Tweet({
      content: body.content,
      author: req.user._id,
    });

    const savedTweet = await newTweet.save();
    const populatedTweet = await Tweet.findById(savedTweet._id).populate(
      "author"
    );

    // Émettre le nouveau tweet à tous les clients connectés
    const io = req.app.get("io");
    io.emit("newTweet", {
      ...populatedTweet.toJSON(),
      canDelete: true,
    });

    res.redirect("/");
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet non trouvé" });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Vous devez être connecté" });
    }

    if (tweet.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce tweet" });
    }

    await Tweet.findByIdAndDelete(req.params.id);
    res.status(200).end();
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Erreur lors de la suppression du tweet" });
  }
});

module.exports = router;
