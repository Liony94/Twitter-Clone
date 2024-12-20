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

// Création de la session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
});

// Configuration de Socket.IO avec le middleware de session
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.engine.use(sessionMiddleware);

const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(morgan("short"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utilisation du middleware de session
app.use(sessionMiddleware);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

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

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Nouveau client connecté");

  // Vérification de l'authentification via la session
  const session = socket.request.session;
  if (session && session.passport && session.passport.user) {
    socket.join(session.passport.user);
  }

  socket.on("disconnect", () => {
    console.log("Client déconnecté");
  });
});

app.set("io", io);

server.listen(port);
