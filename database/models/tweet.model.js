const mongoose = require("mongoose");
const schema = mongoose.Schema;

const tweetSchema = schema(
  {
    content: {
      type: String,
      maxlength: [140, "Le tweet ne peut pas dépasser 140 caractères"],
      minlength: [1, "Le tweet doit contenir au moins 1 caractère"],
      required: [true, "Le contenu est requis"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tweet = mongoose.model("tweet", tweetSchema);
module.exports = Tweet;
