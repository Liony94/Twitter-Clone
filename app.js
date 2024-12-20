const express = require("express");
const path = require("path");
const index = require("./routes");
const morgan = require("morgan");
require("./database");
const apiRouter = require("./routes/api");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
require("./config/passport.config");
const authRoutes = require("./routes/auth.routes");
const http = require("http");
const socketIO = require("socket.io");
const messagesRoutes = require("./routes/messages.routes");

const app = express();
const server = http.createServer(app);

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
  },
});

app.use(sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Socket.IO avec configuration optimisée
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

io.engine.use(sessionMiddleware);

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

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Socket.IO connection handler avec gestion d'erreur
io.on("connection", (socket) => {
  console.log("Nouveau client connecté");

  try {
    const session = socket.request.session;
    if (session && session.passport && session.passport.user) {
      socket.join(session.passport.user);
    }

    socket.on("disconnect", () => {
      console.log("Client déconnecté");
    });
  } catch (error) {
    console.error("Erreur Socket.IO:", error);
  }
});

app.set("io", io);

// Démarrage du serveur
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // Connexion à la base de données après le démarrage du serveur
  require("./database");
});
