const express = require("express");
const path = require("path");
const index = require("./routes");
const morgan = require("morgan");
require ('./database');

const app = express();
const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(morgan("short"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(index);

app.listen(port);
