const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const schema = mongoose.Schema;

const userSchema = schema(
  {
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur est requis"],
      unique: true,
      trim: true,
    },
    local: {
      email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
      },
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);

userSchema.statics.hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  } catch (e) {
    throw e;
  }
};

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.local.password);
};

const User = mongoose.model("user", userSchema);
module.exports = User;
