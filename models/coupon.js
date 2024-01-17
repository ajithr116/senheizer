const mongoose = require('mongoose');
const moment = require('moment');
const currentDate = moment(); 
const formattedDate = currentDate.format("dddd, MMMM Do YYYY, h:mm:ss a");
const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const couponId = "co" + forUniqueId;

const orderSchema = new mongoose.Schema({
  couponId: {
    type: String,
    required: true,
    default:couponId
  },
  couponCode:{
    type:String,
    required:true
  },
  user: {
    type:Array,
  },
  reducingAmount: {
    type: Number,
    required: true
  },
  expireDate: {
    type: Date,
    default: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 * 24 * 60 * 60 * 1000 represents 7 days in milliseconds (7 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second).
  },
  minimumPrice: {
    type: Number,
    default: 1000,
  },
  isActive:{
    type:Boolean,
  },
  createdDate:{
    type:Date,
    default:Date.now(),
  },
  isDeleted:{
    type:Boolean,
    default:false,
  }
});

module.exports = mongoose.model('Coupon', orderSchema);
