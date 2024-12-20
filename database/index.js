require("dotenv").config();
const mongoose = require("mongoose");

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(process.env.MONGODB_URI, options)
  .then(() => {
    console.log("connexion OK !");
  })
  .catch((err) => console.log(err));
