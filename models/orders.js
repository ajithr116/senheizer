const mongoose = require('mongoose');
const moment = require('moment');
const currentDate = moment(); 
const formattedDate = currentDate.format("dddd, MMMM Do YYYY, h:mm:ss a");
const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const orderId = "o" + forUniqueId;

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
    default:orderId
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddressID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  orderStatus: {
    type: String,
    // enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  orderDate: {
    type: String,
    default: formattedDate,
  },
  date:{
    type:Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', orderSchema);
