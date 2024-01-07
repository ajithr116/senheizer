const addressSchema = new mongoose.Schema({
    //   _id: String, // _id will be generated automatically
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    });
    
    module.exports = mongoose.model('Address', addressSchema);