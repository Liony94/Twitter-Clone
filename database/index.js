const mongoose = require('mongoose');

mongoose
  .connect("mongodb+srv://guiprouchandy:j23FeWS6LtGRKlsF@node.e3ghu.mongodb.net/?retryWrites=true&w=majority&appName=Node")
  .then(() => {
    console.log("connexion OK !");
  })
  .catch((err) => console.log(err));
