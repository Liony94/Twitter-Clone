require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const Pusher = require("pusher");

const app = express();

// Configuration de base
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware de base
app.use(morgan("short"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session et authentification
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  },
});

app.use(sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configuration Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

app.set("pusher", pusher);

// Initialisation asynchrone
async function initializeApp() {
  try {
    // Connexion à la base de données
    await require("./database")();

    // Configuration passport
    require("./config/passport.config");

    // Routes
    const index = require("./routes");
    const apiRouter = require("./routes/api");
    const authRoutes = require("./routes/auth.routes");
    const messagesRoutes = require("./routes/messages.routes");

    app.use((req, res, next) => {
      res.locals.user = req.user;
      res.locals.isAuthenticated = req.isAuthenticated();
      res.locals.error = req.flash("error");
      res.locals.success = req.flash("success");
      next();
    });

    app.use("/", index);
    app.use("/api", apiRouter);
    app.use("/auth", authRoutes);
    app.use("/messages", messagesRoutes);

    // Gestion des erreurs 404
    app.use((req, res, next) => {
      res.status(404).render("error", {
        message: "Page non trouvée",
        error: { status: 404 },
      });
    });

    // Gestion des erreurs 500
    app.use((err, req, res, next) => {
      console.error("Erreur serveur:", err);
      res.status(err.status || 500).render("error", {
        message: err.message || "Une erreur est survenue",
        error: process.env.NODE_ENV === "development" ? err : {},
      });
    });

    return app;
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    throw error;
  }
}

// Export de la promesse d'initialisation
module.exports = initializeApp();
