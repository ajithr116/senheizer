const mongoose = require('mongoose');

const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const bannerId = "b" + forUniqueId;

const bannerSchema = new mongoose.Schema({
  bannerId: {
    type: String,
    default:bannerId
  },
  imageName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  linkType:{
    type:String
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  discountAmt:{
    type:Number,
    default:10
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Banner', bannerSchema);
