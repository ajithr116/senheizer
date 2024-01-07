const mongoose = require('mongoose');


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
  _id: {
    type: String,
    required: true,
    // unique: true, // Ensure unique _id values
    default: uniqueUid
  },
  firstName: {
    type:String
  },
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique email addresses
  },
  password: {
    type:String
  }, // Consider hashing password before storing
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
  isAdmin:{
    type:String,
    default:false
  }
});

module.exports = mongoose.model('user', userSchema);
