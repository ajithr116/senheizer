const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');
const Wishlist = require('../models/wishlist');


mongoose.connect(process.env.MONGODB_ADDRESS)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


const userLogin =  async (req, res, next) => {
  if (req.session.uid) {
      res.redirect('/index'); 
  } 
  else {
      const error = req.session.error;
      req.session.error = null;

      res.render('user/login', {error:error});
  }
};

const userSubmit = async(req,res,next)=>{
  // const email=req.body.uName;
  // const password=req.body.uPassword;

  const {uName:email,uPassword:password} = req.body;

  const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
    
  if(req.session.uid){
      res.redirect('/home'); 
  }
  else{
    try{
        if(true){
            const exists = await userController.checkEmailExist(email);     //function to find email exists or not
                if (exists) {
                    const isBlocked = await userController.isUserDeleted(email);
                    if(isBlocked==true){
                      req.session.error = 5 // email blocked
                      res.redirect('/login');
                    }else{
                        if(rePassword.test(password)){
                            req.session.email=email;
                            const user = await userController.authenticateUser(email,password);
                            if(user){
                                req.session.uid=user._id;
                                req.session.email=email;
                                console.log("successfully logged in");
                                res.redirect('./index');
                            }
                            else{
                                req.session.error = 4 // email and password not match
                                res.redirect('/login');
                            }
                        }
                        else{
                          req.session.error = 3 // password 3 not the match the format
                          res.redirect('/login');
                        }
                    }
                } 
                else {
                  req.session.error = 2 // Error code 3 email does not exists
                  res.redirect('/login');
                }
            }
            else{
              req.session.error = 1 // Error code 3 regular expression not mathch
              res.redirect('/login');
            }
        }
        catch(err){
          next(err);
        }
    }
};


const userSignup = async (req,res)=>{
  if (req.session.uid) {
      res.redirect('/index'); 
  } else {
      const error = req.session.error;
      req.session.error = null;

      res.render('./user/signup',{ error: error });
  }
};

const userSubmitForm = async(req,res,next)=>{

  const nameRegex = /^[a-zA-Z]{1,30}$/;    //only alphabet and upto 30 
  var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
  const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const {uFirstName: firstName,uLastName: lastName,uEmail: email,uPassword: password,uConfirmPassword: confirmPassword,uPhoneNo:phoneNumber} = req.body;
    
  try{
      if(req.session.uid){
          res.redirect('/index'); 
      }
      else{
          if(nameRegex.test(firstName) && nameRegex.test(lastName)|| req.session.check){
              if(true || req.session.check){
              // if(reEmail.test(email)){

                  const exists2 = await userController.checkEmailExist(email);     //function to find email exists or not
                  

                  if(exists2){
                      // console.log("bad");
                      req.session.error=3;    //email exists
                      res.redirect('/signup');
                  }
                  else{
                      if(rePassword.test(password) || req.session.check){
                          // console.log("good");
                          if(password==confirmPassword){
                              req.session.rFirstName = firstName;
                              req.session.rLastName = lastName;
                              req.session.rEmail = email;
                              req.session.rPassword = password;
                              req.session.rPhoneNumber = phoneNumber;
                              req.session.oneTimeAccess = 1;
                              req.session.check=true;

                              var val = Math.floor(1000 + Math.random() * 9000);
                              req.session.randomNumber=val;

                              console.log("all good");

                              const transporter = nodemailer.createTransport({
                                  service: 'gmail',
                                  auth: {
                                      user: process.env.EMAIL_ADDRESS,
                                      pass: process.env.PASS
                                  }
                              });
                              
                              console.log('rEmail' , req.session.rEmail);
                              const mailOptions = {
                                  from: 'ajith8593935904@gmail.com',
                                  to: req.session.rEmail,
                                  subject: 'Your OTP Verification Code',
                                  text: `Your OTP is: ${val}`
                              };
                              console.log("sended");

                              transporter.sendMail(mailOptions, (error, info) => {
                                  if (error) {
                                      console.error(error);
                                      // Display a user-friendly error message or redirect to an error page
                                  } else {
                                      console.log('Email sent:', info.response);
                                  }
                              });
                              

                              res.render('user/otp',{email:req.session.rEmail});
                          }
                          else{
                              // console.log("bad");
                              req.session.error=5;    //password confirm fail
                              res.redirect('/signup');
                          }
                      }
                      else{
                          // console.log("bad");
                          req.session.error=4;    //password format
                          res.redirect('/signup');
                      }
                  }
              }
              else{
                  req.session.error=2;    //emial format
                  res.redirect('/signup');
              }
          }
          else{
              req.session.error=1;    //first name and last name need alphabet
              res.redirect('/signup');
          }
      }
  }
  catch(err){
      next(err);
  }
};

const userSubmitForm2 = async (req,res,next)=>{
  if(req.session.oneTimeAccess){
      var val = Math.floor(1000 + Math.random() * 9000);
      req.session.randomNumber=val;
      console.log("--resended with otp ",req.session.randomNumber);
  
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.PASS
          }
      });
      
      console.log('rEmail' , req.session.rEmail);
      const mailOptions = {
          from: 'ajith8593935904@gmail.com',
          to: req.session.rEmail,
          subject: 'Your OTP Verification Code',
          text: `Your OTP is: ${val}`
      };
      console.log("sended");
  
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error(error);
              // Display a user-friendly error message or redirect to an error page
          } else {
              console.log('Email sent:', info.response);
          }
      });
      
      res.render('user/otp',{email:req.session.rEmail});
  }
};


const userOtpVerify = async(req,res)=>{
  if (req.session.oneTimeAccess) {

      const d1 = req.body.oottpp;

      console.log("--resended-- with otp ",req.session.randomNumber);

      console.log("d1" , d1)

      if(d1==req.session.randomNumber){

          const rFirstName = req.session.rFirstName;
          const rLastName = req.session.rLastName;
          const rEmail = req.session.rEmail;
          const rPassword =  req.session.rPassword;
          const rPhoneNumber =  req.session.rPhoneNumber;


          const upload = await userController.insertUserData(rFirstName,rLastName,rEmail,rPassword,rPhoneNumber)
          console.log("upload = ",upload);

          req.session.destroy((err) => {
              console.log("---otp successfull");
          })
          res.render('user/otp',{otpWrong:true,email:rEmail});
      }
      else{
        console.log("wrong otp");
        res.render('user/otp',{otpWrong:false,email:req.session.rEmail});

        }
  } 
  else {
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('/signup');
  }

};

const userIndex = async(req,res)=>{
  // console.log("routes");
  if (req.session.uid) {

      const product = await userController.getAllProduct(7);
      // const product2 = await userDB.getAllProductPage();

      res.render('user/index',{products:product});
  } 
  else {
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('/login');
  }
};

const userProducts = async (req, res) => {
    if (req.session.uid) {
    let product = await userController.getAllProductPage();
    let product2 = await userController.getAllProductPage();
    const category = await Category.find({ isDeleted: false });
  
    const searchQuery = req.query.search;
    const brand = req.query.brand;
    const maxPrice = req.query.max;
    const color = req.query.color;
    const category2 = req.query.category;
    // console.log("--",category2);
        
    // console.log("--",brand,"--",maxPrice,"--",color,"--",category);
    /* 1. .filter():
    Used to create a new array with elements that pass a certain test.
    Takes a callback function as an argument, which is applied to each element in the original array.
    Only elements for which the callback function returns true are included in the new array.
    
    2. .includes():
    Checks if a value is present within an array.
    Returns true if the value is found, false otherwise.
    
    3. .some():
    Determines if at least one element in an array passes a test.
    Takes a callback function as an argument, which is applied to each element.
    Returns true as soon as the callback returns true for any element, otherwise false.*/
    if (brand) {
        product = product.filter(product => brand.includes(product.brand));
    }
    
    if (maxPrice) {
        product = product.filter(product => product.price <= maxPrice);
    }
    
    if (color) {
        const colorArray = color.split(',').map(color => color.trim());
        product = product.filter(product => colorArray.some(color => product.tags.includes(color)));
    }
      
        // ... other code

        if (category2) {
            const populatedProducts = await Product.find({}).populate('category');
            product = populatedProducts.filter(product => product.category.name === category2);
        }
        
        // ... other filters and rendering
  
    if (searchQuery) {
        product = product.filter(product => {
        return (
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.tags.toLowerCase().includes(searchQuery.toLowerCase())
        );
        });
    }
    const wishlist = await Wishlist.find({user:req.session.uid});
    // console.log("--",wishlist[0]);
    res.render('user/products', { products: product, category,product2:product2,wishlist});
    } else {
      res.redirect('/login');
    }
};
  
// const userProductCategory = async(req,res)=>{
//     const categoryName = req.body.category; // Get the category from the request body
//     // Your existing code to get products by category
//     let product = await userController.getAllProductPage();
//     const category = await Category.find({ isDeleted: false });
//     product = product.filter(product => product.category === categoryName);

//     // Send the filtered products as the response
//     res.json(product);
    
// }

const userProductPage = async(req,res)=>{
  if (req.session.uid) {

      const productId = req.query.productId;
      const product1 = await userController.getProductDetails(productId);
      // console.log("----",product1);
      res.render('user/productPage',{ product:product1 ,proID:productId});
      
  } 
  else {
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('/login');
  }
};


const userLogout = async (req,res)=>{
  try{
        req.session.uid='';
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('./login');
//   });
  }
  catch(err){
      next(err);
  }
};

// const userForgotpassword  = async(req,res)=>{

//     // req.session.randomNumber=null;

//     res.render('user/forgotpassword');
// }

// const userForgetPasswordEmail = async(req,res)=>{

//     const {email:userEmail} = req.body;
//     req.session.email = userEmail;
//     const user = await userController.checkEmailExist(userEmail);
//     // console.log("--",user);
//     if(!user){
//         req.flash('error', 'Email does not exist');
//         return res.redirect('/forgotpassword');
//     }
//     req.session.step=1;
//     userController.sendMail(req,res,userEmail);
//     res.redirect('/passwordotp');
// }

// const userPasswordOtp = async (req,res)=>{
//     console.log("====");
//     if(req.session.step==1){
//         const wrongotp = req.session.wrongotp;
//         const email = req.session.email;

//         req.session.wrongotp=null;

//         console.log('wrongtp ', wrongotp);
//         res.render('user/passwordotp',{email,wrongotp});
//     }
//     else{
//         res.redirect('/forgotpassword');
//     }
// }

// const userOtp = async (req,res)=>{
//     const oottpp = req.body.oottpp;
//     const val = req.session.randomNumber;

//     if(val==oottpp){
//         req.session.wrongotp=1;
//         req.session.step=2;
//         console.log("success");
//         res.redirect('/resetpassword');
//     }
//     else{
//         req.session.wrongotp=2;
//         console.log("fail");
//         res.redirect('/passwordotp')
//     }
// }

// const userResentOtp = async (req,res)=>{
//     if(req.session.step==1){
//         req.session.step=1;
//         // console.log("----",req.session.emil)
//         userController.sendMail(req,res,req.session.email);
//         res.redirect('/passwordotp');
//     }
//     else{
//         res.redirect('/login');
//     }
// }

// const userResetPassword = async (req,res)=>{
//     if(req.session.step==2){
        
//         const notMatch = req.session.notMatch;
//         req.session.notMatch = null;

//         res.render('user/resetpassword',{notMatch});
//     }
//     else{
//         res.redirect('/forgotpassword');
//     }
// }

// const userSubmitResetPassword = async(req,res)=>{
//     // console.log("reached");
//     const{password:password,verifyPassword:verifyPassword}=req.body;
//     const specialCharacterRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

//     console.log("--",password,"--",verifyPassword);

//     const email = req.session.email;

//     if(specialCharacterRegex.test(password)){
//         if(password==verifyPassword){
//             const user = await User.findOne({ email });

//             console.log("--",user)

//             const updatedUser = await User.findByIdAndUpdate(user._id, {password: password}, { new: true });
            
//             // console.log("--",password,"--",verifyPassword);
//             req.session.notMatch=3;
//             res.redirect('/resetPassword');

//             // res.redirect('/login');
//         }
//         else{
//             req.session.notMatch=2;
//             res.redirect('/resetPassword');
//         }
//     }
//     else{
//         req.session.notMatch=1;
//         res.redirect('/resetPassword');
//     }
// }

module.exports = {
  userLogin,
  userSubmit,
  userSignup,
  userSubmitForm,
  userSubmitForm2,
  userOtpVerify,
  userIndex,
  userProducts,
  userProductPage,
  userLogout,
////   userProductCategory,
//   userUpdateProfile,
//   userProfile,
//   userAddAddress,
//   userAddAddressDetails,
//   userEditAddress,
//   userUpdateAddress,
//   userDeleteAddress,
//   userForgotpassword,
//   userForgetPasswordEmail,
//   userPasswordOtp,
//   userOtp,
//   userResentOtp,
//   userResetPassword,
//   userSubmitResetPassword,
};
