const mongoose = require('mongoose');
const crypto = require('crypto')

//--------unique value------------------
const forAddress = Math.floor(10000000 + Math.random() * 90000000).toString();
const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const addressID = "a" + forAddress;
const uniqueUid = "u"+forUniqueId;
//--------unique value------------------

//------------------------
  // Format joined date
  let joinedDate = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  //----------------------

const userSchema = new mongoose.Schema({
  uniqueID: {
    type: String,
    required: true,
    // unique: true, // Ensure unique _id values
    default: uniqueUid
  },
  firstName: {
    type:String,
    required:true
  },
  lastName: {
    type:String,
    required:true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique email addresses
  },
  password: {
    type:String
  }, // Consider hashing password before storing
  phoneNumber: {
    type: Number,
    required: true,
    unique: true
  },
  joinedDate: {
    type: String,
    default: joinedDate // Set default to current date and time
  },
  status: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  address: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  cart: [{
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
  }],
  isAdmin:{
    type:Boolean,
    default:false
  },
  wallet:{
    type:Number,
    default:0
  },
  walletHistory: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund','refer'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  wishlist:{
    type:Array
  },
  referralCode: {
    type: String,
    default: function() {
      return crypto.randomBytes(3).toString('hex'); // Generate a random referral code
    }
  },
  referralCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema);
