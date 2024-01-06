const { MongoClient } = require('mongodb');


const url = 'mongodb://127.0.0.1:27017';
const dbName = 'senheizer';


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

// checking if email exist or not 
async function checkEmailExist(email) {
    const client = new MongoClient(url);
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection('users');
  
      const document = await collection.findOne({ email });
  
      return !!document; // Return true if the document exists, false if not
    } 
    catch (err) {
      console.error('Error:', err);
      return false; 
    } 
    finally {
      client.close();
    }
  }

//email an password match
async function authenticateUser(email, password) {
    const client = new MongoClient(url);
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection('users');
  
      const user = await collection.findOne({ email });
  
      if (user) {

        if (user.password === password) {
          return user; 
        }
      }
  
      return null; 
    } 
    catch (err) {
      console.error('Error:', err);
      return null; // Return null in case of an error
    } 
    finally {
      client.close();
    }
  }

  // Function to connect to MongoDB and insert a document
  async function insertUserData(firstName,lastName,email,password) {

    const client = new MongoClient(url);
    const forAddress = Math.floor(10000000 + Math.random() * 90000000).toString();
    const forUniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const addressID = "a" + forAddress;
    const uniqueUid = "u"+forUniqueId;

    try {
      await client.connect();
      console.log('Connected to MongoDB --insert user data--');
      
      const db = client.db(dbName);
      const collection = db.collection('users');
      const document = {
        _id: uniqueUid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password, // Consider hashing password before storing
        joinedDate: joinedDate,
        status:true,
        isDeleted:false,
        address: addressID
      };  
      // Insert a document into the collection
      const result = await collection.insertOne(document);
      console.log('Document inserted:', result);
      return true;
  
    } 
    catch (err) {
      console.error('Error:', err);
    } 
    finally {
      client.close();
    }
  }


  async function getAllProduct(limits=3) {
    const client = new MongoClient(url);
  
    console.log('Connected to -- getting alll the products----  ');
  
    try {
      await client.connect();
      const db = client.db(dbName);
      // console.log("getting all the product err 1")

      const collection = db.collection('products');
      // console.log("getting all the product err 2")

      const productData = await collection.find({}, { projection: { _id: 1, name: 1, category: 1, brand: 1, price: 1, quantity:1, images:1, tags:1, description:1, isDeleted:1 } }).limit(limits).toArray();
      // console.log(productData);

      return productData;
    } catch (err) {
        console.log("getting all the product err ",err)
    } finally {
      client.close();
    }
  }

  async function getAllProductPage() {
    const client = new MongoClient(url);
  
    console.log('Connected to -- getting alll the products----  ');
  
    try {
      await client.connect();
      const db = client.db(dbName);
      // console.log("getting all the product err 1")

      const collection = db.collection('products');
      // console.log("getting all the product err 2")

      const productData = await collection.find({}, { projection: { _id: 1, name: 1, category: 1, brand: 1, price: 1, quantity:1, images:1, tags:1, description:1, isDeleted:1 } }).toArray();
      // console.log(productData);

      return productData;
    } catch (err) {
        console.log("getting all the product err ",err)
    } finally {
      client.close();
    }
  }


//get product details  
async function getProductDetails(productID) {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('products');

    // Retrieve product details, including soft-deleted ones
    const product = await collection.findOne({ _id: productID });

    return product;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error for proper handling
  } finally {
    await client.close();
  }
}
  module.exports = {
    checkEmailExist,
    authenticateUser,
    insertUserData,
    getAllProduct,
    getAllProductPage,
    getProductDetails,
  };
  
