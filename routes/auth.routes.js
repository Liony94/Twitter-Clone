const router = require("express").Router();
const User = require("../database/models/user.model");
const passport = require("passport");

router.get("/signin", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("auth/signin");
});

router.get("/signup", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    console.log("Données reçues:", { email, username });

    const hashedPassword = await User.hashPassword(password);
    const user = new User({
      username,
      local: {
        email,
        password: hashedPassword,
      },
    });

    const savedUser = await user.save();
    console.log("Utilisateur créé:", savedUser);

    res.redirect("/auth/signin");
  } catch (e) {
    console.error("Erreur lors de l'inscription:", e);
    next(e);
  }
});

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/signin",
    failureFlash: true,
  })
);

router.get("/signout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Route temporaire pour lister les utilisateurs (à retirer en production)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-local.password"); // Exclut le mot de passe
    res.json(users);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
