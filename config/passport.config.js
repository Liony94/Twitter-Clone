const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../database/models/user.model");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ "local.email": email });
        if (!user) {
          return done(null, false, { message: "Utilisateur inconnu" });
        }
        const match = await user.comparePassword(password);
        if (!match) {
          return done(null, false, { message: "Mot de passe incorrect" });
        }
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);
