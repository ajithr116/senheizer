const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user'); 
const Product = require('../models/products'); 
const userController = require('../userFunctions/usersFun');



mongoose.connect(process.env.MONGODB_ADDRESS)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// const userLogin = async (req,res)=>{
//   if (req.session.uid) {
//     res.redirect('/index'); 
//   } 
//   else {
//     const error = req.session.error;
//     req.session.error = null;

//     res.render('user/login', {error:error},(err, html) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('Internal Server Error');
//         } 
//         else {
//         res.send(html);
//         }
//     });
//   }
// };

// const userSubmit = async (req,res)=>{
//   // const email=req.body.uName;
//   // const password=req.body.uPassword;

//   const {uName:email,uPassword:password} = req.body;

//   const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//   var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

//   if(req.session.uid){
//     res.redirect('/home'); 
//   }
//   else{
//     try{
//       if(true){
//         const exists = await User.findOne({ email });   //==============================================================
//         if(exists){
//           const user = await User.findOne({ email }, { match: { isDeleted: false } });
//           if(user.isDeleted==true){                     //=============================================================
//             req.session.error = 5 // email blocked
//             res.redirect('/login');
//           }
//           else{
//             if(rePassword.test(password)){
//               req.session.email=email;
//               const user = await User.findOne({ email });
//               if(user.password==password){
//                 // const hashedPassword = await bcrypt.hash(password, 10);
//                 req.session.uid=user._id;
//                 req.session.email=email;
//                 console.log("successfully logged in");
//                 res.redirect('./index');
//               }else{
//                 // console.log('Authentication failed');
//                 req.session.error = 4 // email and password not match
//                 res.redirect('/login');
//               }
//             }
//             else{
//               // console.log('Password not match the format');
//               req.session.error = 3 // password 3 not the match the format
//               res.redirect('/login');
//             }
//           }
//         }
//         else{
//           // console.log('Email does not exist');
//           req.session.error = 2 // Error code 3 email does not exists
//           res.redirect('/login');
//         }
//       }
//       else{
//         req.session.error = 1 // Error code 3 regular expression not mathch
//         res.redirect('/login');
//       }
//     }
//     catch(err){
//       next(err);
//     }
//   }
// }
//------------------------------------------------------------------------

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
                  }
                  else{
                      // console.log('Email exists');
                      if(rePassword.test(password)){

                          req.session.email=email;
                      
                          const user = await userController.authenticateUser(email,password);

                          if(user){
                              // const hashedPassword = await bcrypt.hash(password, 10);
                              req.session.uid=user._id;
                              req.session.email=email;
                              console.log("successfully logged in");
                              res.redirect('./index');
                          }
                          else{
                              // console.log('Authentication failed');
                              req.session.error = 4 // email and password not match
                              res.redirect('/login');
                          }
                      }
                      else{
                          // console.log('Password not match the format');
                          req.session.error = 3 // password 3 not the match the format
                          res.redirect('/login');
                      }
                  }
              } 
              else {
                  // console.log('Email does not exist');
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
      
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      // res.render('./user/login');

      res.render('./user/signup',{ error: error });
  }
};

const userSubmitForm = async(req,res,next)=>{

  const nameRegex = /^[a-zA-Z]{1,30}$/;    //only alphabet and upto 30 
  var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
  const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  // const firstName = req.body.uFirstName;
  // const lastName = req.body.uLastName;
  // const email = req.body.uEmail;
  // const password = req.body.uPassword;
  // const confirmPassword = req.body.uConfirmPassword;

  const {uFirstName: firstName,uLastName: lastName,uEmail: email,uPassword: password,uConfirmPassword: confirmPassword} = req.body;
    
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

          const upload = await userController.insertUserData(rFirstName,rLastName,rEmail,rPassword)
          console.log("upload = ",upload);

          req.session.destroy((err) => {
              // req.session.username=upload;
              console.log("---otp successfull");
              
              // setTimeout(()=>{
              //     res.redirect('/login');
              // },3000)
              
          })
          res.render('user/otp',{otpWrong:true,email:rEmail});
      }
      else{

          console.log("wrong otp");
          
          // res.render('user/otp',{otpWrong:false});
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

      const product = await userController.getAllProduct(3);
      // const product2 = await userDB.getAllProductPage();

      res.render('user/index',{products:product});
  } 
  else {
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('/login');
  }
};

const userProducts = async(req,res)=>{
  if (req.session.uid) {

      const product = await userController.getAllProductPage();
      
      // console.log(product);
      res.render('user/products',{products:product});
  } 
  else {
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('/login');
  }
};

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
    //   req.session.destroy((err) => {
    //   if (err) {
    //       console.error('Session destruction error:', err);
    //   }
    //   res.clearCookie('connect.sid');
        req.session.uid='';
      // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
      res.redirect('./login');
//   });
  }
  catch(err){
      next(err);
  }
};

// router.use( async (req,res,next)=>{
//   console.log("reached-");
//   console.log(req.session.email);
//   if(await userController.isUserDeleted(req.session.email)){
//       res.redirect('./logout');
//   }
//   next();
// })



// async function checkEmailExist(email) {
//   try {
//     // await connectDB(); // Ensure database connection is established
//     const document = await User.findOne({ email });
//     return !!document; // Return true if document exists, false if not
//   } catch (err) {
//     console.error('Error checking email existence:', err);
//     throw err; // Re-throw for proper handling
//   }
// }

// async function isUserDeleted(email) {
//     try {
//       // await connectDB(); // Ensure database connection is established
  
//       const user = await User.findOne({ email }, { match: { isDeleted: false } });
//       //  console.log("----",user);
//       if (user) {
//         return user.isDeleted; // Return the isDeleted value directly
//       } else {
//         return false; // User not found, assume not deleted
//       }
//     } catch (err) {
//       console.error('Error checking user deletion status:', err);
//     }
  
//   }
  

//   async function authenticateUser(email, password) {
//     try {
//       // await connectDB(); // Ensure database connection
  
//       const user = await User.findOne({ email });

//       // console.log("---",user);
//       if (!user) {
//         return null; // User not found
//       }

//       // console.log(user.password,"=",password);
//       const passwordMatch = user.password === password;
  
//       if (passwordMatch) {
//         return user; 
//       } else {
//         return null; 
//       }
//     } catch (err) {
//       console.error('Error during authentication:', err);
//       // throw new Error('Authentication failed'); // Re-throw a more informative error
//     }
  
//   }
  
//   async function insertUserData(firstName,lastName,email,password) {
//     try {
//       // await connectDB(); // Ensure database connection

//       const user = await User.create({
//         firstName,
//         lastName,
//         email,
//         password
//       });
//       const savedUser = await user.save()
//       .then((data)=>{console.log("data added",data)})
//       .catch((err)=>{"error",err})

//       // console.log('User created:', savedUser);
//       return savedUser;
//     } catch (err) {
//       console.error('Error creating user:', err);
//       throw err; // Rethrow to allow for proper error handling
//     }
  
//   }

//   async function getAllProduct(limits = 3) {
//     try {
//       const products = await Product.find(
//         { isDeleted: false }, // Only retrieve non-deleted products
//         {
//           _id: 1,
//           name: 1,
//           category: 1,
//           brand: 1,
//           price: 1,
//           quantity: 1,
//           images: 1,
//           tags: 1,
//           description: 1,
//           isDeleted: 1,
//         }
//       )
//         .limit(limits)
//         .exec();
  
//       return products;
//     } catch (err) {
//       console.error('Error getting products:', err);
//       throw err; // Rethrow to allow for proper error handling
//     } 
//   }


// async function getAllProductPage() {
//   try {
//     const products = await Product.find(
//       { isDeleted: false }, // Only retrieve non-deleted products
//       {
//         _id: 1,
//         name: 1,
//         category: 1,
//         brand: 1,
//         price: 1,
//         quantity: 1,
//         images: 1,
//         tags: 1,
//         description: 1,
//         isDeleted: 1,
//       }
//     )

//     return products;
//   } catch (err) {
//     console.error('Error getting products:', err);
//     throw err; // Rethrow to allow for proper error handling
//   }
// }

// async function getProductDetails(productID) {
//   try {
//     const products = await Product.findOne({ _id:productID})
//     // console.log(products)
//     return products;
//   } catch (err) {
//     console.error('Error getting products:', err);
//     throw err; // Rethrow to allow for proper error handling
//   }
// }


// module.exports = {
//   checkEmailExist,
//   isUserDeleted,
//   authenticateUser,
//   insertUserData,
//   getAllProduct,
//   getAllProductPage,
//   getProductDetails,
//   userLogin
// };

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
};
