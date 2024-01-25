const mongoose = require('mongoose');

const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const offerID = "a" + forUniqueId;

const offerSchema = new mongoose.Schema({
    offerId: {
      type: String,
      required: true,
      default:offerID
    },
    type: {
      type: String, // "productt", "categery", "referral"
      required: true,
    },
    discount: {
      type: Number, 
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    targetProduct: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
    targetCategory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
  });
  
  module.exports = mongoose.model('Offer', offerSchema);
  