const router = require("express").Router();
const Message = require("../database/models/message.model");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const User = require("../database/models/user.model");

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    // Récupérer les conversations uniques
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { recipient: req.user._id }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.user._id] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipient", req.user._id] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Peupler les informations utilisateur
    await Message.populate(conversations, {
      path: "_id",
      model: "user",
      select: "username",
    });

    res.render("messages/index", { conversations });
  } catch (e) {
    next(e);
  }
});

router.get("/:userId", isAuthenticated, async (req, res, next) => {
  try {
    const otherUser = await User.findById(req.params.userId).select("username");
    if (!otherUser) {
      return res.status(404).redirect("/messages");
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUser._id },
        { sender: otherUser._id, recipient: req.user._id },
      ],
    })
      .sort("createdAt")
      .populate("sender", "username")
      .populate("recipient", "username");

    // Marquer les messages comme lus
    await Message.updateMany(
      {
        sender: otherUser._id,
        recipient: req.user._id,
        read: false,
      },
      { read: true }
    );

    res.render("messages/conversation", {
      messages,
      otherUser,
      currentUserId: req.user._id,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/send", isAuthenticated, async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    console.log("Données reçues:", { recipientId, content });

    // Vérifier si le destinataire existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.log("Destinataire non trouvé");
      return res.status(404).json({ message: "Destinataire non trouvé" });
    }
    console.log("Destinataire trouvé:", recipient.username);

    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });
    console.log("Message créé:", newMessage);

    const savedMessage = await newMessage.save();
    console.log("Message sauvegardé:", savedMessage);

    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username")
      .populate("recipient", "username");
    console.log("Message peuplé:", populatedMessage);

    // Émettre le message via Socket.IO
    const io = req.app.get("io");
    io.to(recipientId).emit("newMessage", populatedMessage);

    res.json(populatedMessage);
  } catch (e) {
    console.error("Erreur complète:", e);
    res.status(500).json({ message: "Erreur lors de l'envoi du message" });
  }
});

router.get("/users/search", isAuthenticated, async (req, res, next) => {
  try {
    const searchTerm = req.query.q || "";
    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclure l'utilisateur courant
      username: new RegExp(searchTerm, "i"),
    })
      .select("username")
      .limit(10);
    res.json(users);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
