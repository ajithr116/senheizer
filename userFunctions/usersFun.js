const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

require('dotenv').config();

const User = require('../models/user'); 
const Product = require('../models/products'); 




async function checkEmailExist(email) {
    try {
      // await connectDB(); // Ensure database connection is established
      const document = await User.findOne({ email });
      return !!document; // Return true if document exists, false if not
    } catch (err) {
      console.error('Error checking email existence:', err);
      throw err; // Re-throw for proper handling
    }
  }
  
async function isUserDeleted(email) {
    try {
      // await connectDB(); // Ensure database connection is established
  
      const user = await User.findOne({ email }, { match: { isDeleted: false } });
      //  console.log("----",user);
      if (user) {
        return user.isDeleted; // Return the isDeleted value directly
      } else {
        return false; // User not found, assume not deleted
      }
    } catch (err) {
      console.error('Error checking user deletion status:', err);
    }
  
  }
    
  
async function authenticateUser(email, password) {
  try {
    // await connectDB(); // Ensure database connection

    const user = await User.findOne({ email });

    // console.log("---",user);
    if (!user) {
      return null; // User not found
    }

    // console.log(user.password,"=",password);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return user; 
    } else {
      return null; 
    }
  } catch (err) {
    console.error('Error during authentication:', err);
    // throw new Error('Authentication failed'); // Re-throw a more informative error
  }
}
    
    
async function insertUserData(firstName,lastName,email,password,phoneNumber) {
  try {
    // await connectDB(); // Ensure database connection

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber
    });
    const savedUser = await user.save()
    .then((data)=>{console.log("data added",data)})
    .catch((err)=>{"error",err})

    // console.log('User created:', savedUser);
    return savedUser;
  } catch (err) {
    console.error('Error creating user:', err);
    throw err; // Rethrow to allow for proper error handling
  }

}
  
async function getAllProduct(limits = 3) {
  try {
    const products = await Product.find(
      { isDeleted: false }, // Only retrieve non-deleted products
      {
        _id: 1,
        name: 1,
        category: 1,
        brand: 1,
        price: 1,
        quantity: 1,
        images: 1,
        tags: 1,
        description: 1,
        isDeleted: 1,
      }
    )
      .limit(limits)
      .exec();

    return products;
  } catch (err) {
    console.error('Error getting products:', err);
    throw err; // Rethrow to allow for proper error handling
  } 
}

  
async function getAllProductPage() {
  try {
    const products = await Product.find(
      { isDeleted: false }, // Only retrieve non-deleted products
      {
        _id: 1,
        name: 1,
        category: 1,
        brand: 1,
        price: 1,
        quantity: 1,
        images: 1,
        tags: 1,
        description: 1,
        isDeleted: 1,
      }
    )

    return products;
  } catch (err) {
    console.error('Error getting products:', err);
    throw err; // Rethrow to allow for proper error handling
  }
}

async function getProductDetails(productID) {
  try {
    const products = await Product.findOne({ _id:productID})
    // console.log(products)
    return products;
  } catch (err) {
    console.error('Error getting products:', err);
    throw err; // Rethrow to allow for proper error handling
  }
}
  
const sendMail = async (req,res,email)=>{
  console.log("reached");
  var val = Math.floor(1000 + Math.random() * 9000);
  req.session.randomNumber=val;
  console.log("val" ,val);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.PASS
      }
  });

  console.log('rEmail' ,email);
  const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Your OTP Verification Code',
      text: `Your OTP is: ${val}`
  };
  console.log("sended");

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
  
      } else {
        console.log('Email sent:', info.response);
      }
  });
}
  
  module.exports = {
    checkEmailExist,
    isUserDeleted,
    authenticateUser,
    insertUserData,
    getAllProduct,
    getAllProductPage,
    getProductDetails,
    sendMail,
  };
  