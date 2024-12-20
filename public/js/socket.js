const pusher = new Pusher(process.env.PUSHER_KEY, {
  cluster: process.env.PUSHER_CLUSTER,
});

const channel = pusher.subscribe("twitter-clone");

channel.bind("newTweet", function (tweet) {
  // Votre code pour gérer les nouveaux tweets
});

channel.bind("newMessage", function (message) {
  // Votre code pour gérer les nouveaux messages
});
