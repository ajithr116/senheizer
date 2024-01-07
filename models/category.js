const mongoose = require('mongoose');

//--------unique value------------------
const forAddress = Math.floor(10000000 + Math.random() * 90000000).toString();
const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const forCategoryId = Math.floor(10000000 + Math.random() * 90000000).toString();
const addressID = "a" + forAddress;
const uniqueUid = "u"+forUniqueId;
const categoryID = "c"+forCategoryId;
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


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uniqueID:{
        type:String,
        default:categoryID
    },
    description: {
        type: String,
        default:"---",
        trim: true
    },
    createdAt:{
        type:String,
        default:joinedDate
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', categorySchema);
