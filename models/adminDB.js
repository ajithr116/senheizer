const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017'; // Add the missing "mongodb://" prefix

const dbName = 'senheizer';


// checking email exist or not
async function checkEmailExist(email){
    const client = new MongoClient(url);

    try{
        await client.connect();
        console.log('connected to mongodb(adminDB) --email exist-- ');

        const db = client.db(dbName);
        const collection = db.collection('admin');

        // Use findOne to check if the document exists
        const document = await collection.findOne({email});

        return !!document;  // Return true if the document exists, false if not

    }
    catch(err){
        console.log('error',err);
    }
    finally{
        client.close();
    }
}

//email an password match
async function authenticateUser(email, password) {
    const client = new MongoClient(url);
  
    try {
      await client.connect();
      console.log('Connected to MongoDB admin authenticated user ');
  
      const db = client.db(dbName);
      const collection = db.collection('admin');
  
      // Use findOne to find a user with the provided email
      const user = await collection.findOne({ email });
  
      if (user) {
  
        if (user.password === password) {
          return user; 
        }
      }
  
      return null; // Return null if the user doesn't exist or the password doesn't match
    } 
    catch (err) {
      console.error('Error:', err);
      return null; 
    } 
    finally {
      client.close();
    }
  }


// addding datas 
async function addProduct(productName,productCategory,productBrand,productPrice,productQuantity,joinedFileNames,productTags,productDesc){

  const client = new MongoClient(url);

    try{
      await client.connect();
      console.log('Connected to adding product  ');

      const db = client.db(dbName);
      const collection = db.collection('products')

      const productCount = await collection.countDocuments(); // Get current count
      const productID =productCount + 1 + "p" ; // Increment for new ID

      const productData = {
        _id: productID, // Assign the unique ID
        name: productName,
        category: productCategory,
        brand: productBrand,
        price: productPrice,
        quantity: productQuantity,
        images: joinedFileNames, // Store joined image file names
        tags: productTags,
        description: productDesc,
        isDeleted:false,
      };

      const result = await collection.insertOne(productData);
      console.log('Product added:');

      // const categoryCollection = db.collection('category');
      // const categoryData = {
      //   _id: productID,
      //   category: productCategory,
      // };

      // const resultCategory = await collection.insertOne(categoryData);
      // console.log('cartegory added:');

    }

    catch(err){
      console.log(err);
    }
    finally {
      client.close();
    }
}

async function getAllProduct() {
  const client = new MongoClient(url);

  console.log('Connected to -- getting alll the products----  ');

  try {
    await client.connect();
    const db = client.db(dbName);

    const collection = db.collection('products');

    // Fetch all user data and project the fields you need
    const productData = await collection.find({}, { projection: { _id: 1, name: 1, category: 1, brand: 1, price: 1, quantity:1, images:1, tags:1, description:1, isDeleted:1 } }).toArray();

    return productData;
  } catch (err) {
      console.log(err)
  } finally {
    client.close();
  }
}

async function getAllUser() {
  const client = new MongoClient(url);

  console.log('Connected to -- getting alll user----  ');

  try {
    await client.connect();
    const db = client.db(dbName);

    const collection = db.collection('users');

    // Fetch all user data and project the fields you need
    const userData = await collection.find({}, { projection: { _id: 1, firstName: 1, lastName: 1, email: 1, joinedDate: 1, isDeleted:1,status:1 } }).toArray();

    return userData;
  } catch (err) {
      console.log(err)
  } finally {
    client.close();
  }
}
  
async function deleteProduct(productID){

  const client = new MongoClient(url);

  try{
    await client.connect();
    console.log('Connected to delete products');
    const db = client.db(dbName);
    const collection = db.collection('products');
    const result = await collection.updateOne({_id:productID},{$set:{isDeleted:true}});
  }
  catch(err){
    console.log(err);
  }
  finally{
    client.close();
  }
}



async function blockUser(userID){
  const client = new MongoClient(url);
  try{
    await client.connect();
    console.log('Connected to block user');
    const db = client.db(dbName);

    const collection = db.collection('users');
    const result = await collection.updateOne({ _id: userID }, { $set: { isDeleted: true } });

  }
  catch(err){
    console.error('Error blocking user:', err);
  }
  finally{
    client.close();
  }
}

async function unBlockUser(userID){
  const client = new MongoClient(url);

  try{
    await client.connect();
    console.log('Connected to unblock user');
    const db = client.db(dbName);

    const collection = db.collection('users');
    // const result = await collection.updateOne({_id:userID},{$set:{isDeleted:true}});
    const result = await collection.updateOne({ _id: userID }, { $set: { isDeleted: false } });

  }
  catch(err){
    console.error('Error blocking user:', err);
    
  }
  finally{
    client.close();
  }
}




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

async function updateProduct(productID, productName, productCategory, productBrand, productPrice, productQuantity, joinedFileNames, productTags, productDesc) {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to -update product-');

    const db = client.db(dbName);
    const collection = db.collection('products');

    const filter = { _id: productID }; // Filter by product ID
    // const update = {{},{$set: {name: productName,category: productCategory,brand: productBrand,price: productPrice,quantity: productQuantity,images: joinedFileNames, providedtags: productTags,description: productDesc}};

    const result = await collection.updateOne({_id:productID}, {$set: {name: productName,category: productCategory,brand: productBrand,price: productPrice,quantity: productQuantity,images: joinedFileNames, tags: productTags,description: productDesc}});
    console.log('Product updated:', result);
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}


async function getUniqueCategories() {
  const client = new MongoClient(url);

  try {

    console.log('Connected to --getting unique categories--');

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('products');

    const uniqueCategories = await collection.distinct('category');
    return uniqueCategories;
  } catch (err) {
    console.error(err);
    throw err; // Rethrow the error for handling outside
  } finally {
    client.close();
  }
}

// addding category 
async function addCategory(newCategory){

  const client = new MongoClient(url);

    try{
      await client.connect();
      console.log('Connected to adding category  ');

      const db = client.db(dbName);
      const collection = db.collection('category')

      const categoryCount = await collection.countDocuments(); // Get current count
      const categoryID =categoryCount + 1 + "c" ; // Increment for new ID

      const categoryData = {
        _id: categoryID, // Assign the unique ID
        category:newCategory
      };

      const result = await collection.insertOne(categoryData);
      console.log('cartegory added:');

    }
    catch(err){
      console.log(err);
    }
    finally {
      client.close();
    }
}



module.exports={
    checkEmailExist,
    authenticateUser,
    addProduct,
    getAllProduct,
    deleteProduct,
    getUniqueCategories,
    getProductDetails,
    updateProduct,
    getAllUser,
    blockUser,
    unBlockUser,
    addCategory,
}