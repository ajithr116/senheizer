const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    //   _id: String, // _id will be generated automatically
    district: {
      type: String,
      required: true,
      trim: true // Remove leading/trailing whitespace
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: Number,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone:{
      type:Number,
      requirted:true
    },
    userId:{
      type:String,
      required:true
    }})
  
module.exports = mongoose.model('Address', addressSchema);