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

  const productSchema = new mongoose.Schema({
    // _id: {
    //     type: String,
    //     required: true,
    //     default:uniqueUid
    // },
    productID:{
        type:String,
        default:uniqueUid
    },
    name: {
        type: String,
        required: true,
        trim: true // Remove leading/trailing spaces
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) {
                throw new Error('Price must be greater than 0');
            }
        }
    },
    quantity: {
        type: Number,
        default: 0
    },
    images: [String], 
    tags:  {
      type:String,
    },
    description: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt:{
        type:String,
        default:joinedDate
    },
    updatedAt: {
      type: Date,
      default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
















