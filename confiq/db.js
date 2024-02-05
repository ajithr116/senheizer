// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_ADDRESS, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('Error connecting to MongoDB:', err);
//     process.exit(1); 
//   }
// }; 

// module.exports = connectDB; 
 

const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_ADDRESS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    // Log the full error object
    console.error(err);
    process.exit(1); 
  }
};

module.exports = connectDB;