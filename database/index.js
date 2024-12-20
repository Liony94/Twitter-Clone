require("dotenv").config();
const mongoose = require("mongoose");

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
};

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Déjà connecté à MongoDB");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Connexion à la base de données établie");
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err);
    throw err;
  }
}

// Export une instance unique
let dbConnection = null;
module.exports = async () => {
  if (!dbConnection) {
    dbConnection = await connectDB();
  }
  return dbConnection;
};
