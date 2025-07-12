const mongoose = require('mongoose');

const clothesSchema = new mongoose.Schema({
  season: String,
  gender: String,
  type: String,
  subType: String,
  images: [
    {
      filename: String,
      path: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Clothes', clothesSchema);
