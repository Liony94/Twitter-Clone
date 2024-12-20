require("dotenv").config();

// Ajout des logs de debug
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);
console.log("PUSHER_APP_ID:", process.env.PUSHER_APP_ID);

const express = require("express");
const path = require("path");
const index = require("./routes");
const morgan = require("morgan");
const apiRouter = require("./routes/api");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const Pusher = require("pusher");
require("./config/passport.config");
const authRoutes = require("./routes/auth.routes");
const messagesRoutes = require("./routes/messages.routes");

const app = express();

// Configuration Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Session et authentification
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
});

app.use(sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configuration de base
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("pusher", pusher);

// Middleware de base
app.use(morgan("short"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
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

// Modification du démarrage du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // Connexion à la base de données avec gestion d'erreur
  require("./database").catch((err) => {
    console.error("Erreur de connexion à la base de données:", err);
    process.exit(1);
  });
});

module.exports = app;
