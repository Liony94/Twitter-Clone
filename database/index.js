require("dotenv").config();
const mongoose = require("mongoose");

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Connexion à la base de données établie");
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err);
    throw err;
  }
}

module.exports = connectDB();
