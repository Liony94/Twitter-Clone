const mongoose = require('mongoose');
const schema = mongoose.Schema;

const tweetSchema = ({
    content: { type: String, maxlength: 140, minlength: 3, required: true}
});

const Tweet = mongoose.model('tweet', tweetSchema);

module.exports = Tweet;