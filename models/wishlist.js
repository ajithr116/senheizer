const mongoose = require('mongoose');
const moment = require('moment');
const currentDate = moment(); 
const formattedDate = currentDate.format("dddd, MMMM Do YYYY, h:mm:ss a");
const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const wishlistID = "w" + forUniqueId;

const wishlistSchema = new mongoose.Schema({
  wishlistId: {
    type: String,
    required: true,
    default:wishlistID
  },
  user: {
    type:String,
    require:true
  },
  products: [{
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      }
  }],
  createdDate:{
    type:Date,
    default:Date.now(),
  }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
