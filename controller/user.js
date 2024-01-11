const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');


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

      let product = await userController.getAllProductPage();
      const category = await Category.find({isDeleted:false});

      const searchQuery = req.query.search;         //The filter method in JavaScript is a powerful tool for iterating through an array and selecting only the elements that meet a specific condition. It returns a new array containing the filtered elements.
      
      if (searchQuery) {
            product = product.filter(product => {
            return (
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.tags.toLowerCase().includes(searchQuery.toLowerCase())
          );
        });
      }
      // console.log(product);
      res.render('user/products',{products:product,category});
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

const userProfile = async (req,res)=>{
    if (req.session.uid) {

        const userDetails = await User.findById(req.session.uid);
        
        // console.log("--",userDetails);
        // In your server-side route or controller
        const user = await User.findById(req.session.uid).populate('address');
        let error = req.session.error;
        res.render('user/profile',{userDetails,error,user});
    } 
    else {
        res.redirect('/login');
    }
}


const userUpdateProfile = async (req,res)=>{
    const{updateFirstName:firstName,updateLastName:lastName,updateEmail:email,updatePhoneNo:phoneNo} = req.body;
    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
        req.session.error = 1;
    }
    
    const userId = req.query.userId;
    // console.log("--", firstName,"--",lastName,"--",email,"--",phoneNo,"--",userId);

    try {
        const user = await User.findByIdAndUpdate({_id:userId}, {$set:{firstName:firstName,lastName:lastName,email:email,phoneNumber:phoneNo}});
        // console.log("--",user);
        res.redirect('/profile');
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Error updating profile');
    }
}

const userAddAddress = async(req,res)=>{
    if (req.session.uid) {
        
        const userDetails = await User.findById(req.session.uid);
        // console.log("--",userDetails);
        const error = req.session.error;
        const id = req.session.uid;
        res.render('user/addAddress',{error,id});
    } 
    else {
        res.redirect('/login');
    }
}


const userAddAddressDetails = async(req,res)=>{
    const{newAddressName:addressName,newPhoneNo:phoneNo,newZip:zipCode,newState:state,newDistrict:distrct,newFullAddress:fullAddress}=req.body;
    const userId = req.query.userId;
    // console.log('--',userId);
    // Check phone number length
    if (phoneNo.length !== 10 && zipCode.length !== 6) {
        req.session.error = 3;
        res.redirect('/addaddress');
    }else{
        if (phoneNo.length !== 10) {
            req.session.error = 1;
            res.redirect('/addaddress');
        }
        else{
            if (zipCode.length !== 6) {
                req.session.error = 2;
                res.redirect('/addaddress');
            }   
            else{
                const newAddress = new Address({
                    district: distrct,
                    state: state,
                    pincode: zipCode, // Assuming zipCode holds the pincod
                    address: fullAddress,
                    name: addressName,
                    phone: phoneNo,
                    userId: userId
                  });

                const address = await newAddress.save()
                .catch(error => {
                console.error("Error saving address:", error);
                });
                  
                // console.log("---",address._id);
                try {
                    const user = await User.findById(userId);
                    user.address.push(address._id);
                    const updatedUser = await user.save();
                    res.set('Cache-Control', 'no-store')

                    console.log("User updated with address:", updatedUser);
                } catch (error) {
                    console.error("Error updating user with address:", error);
                }
                res.redirect('/profile');
                // console.log("--", addressName,"--",phoneNo,"--",zipCode,"--",state,"--",distrct,"--",fullAddress);
            }     
        }
    }
}

const userEditAddress = async(req,res)=>{
    if (req.session.uid) {
        
         const addressId = req.query.addressid;

       const address = await Address.findById(addressId);
    //    console.log("----",address);
        // console.log("--",userDetails);
        const error = req.session.error;
        const id = req.session.uid;
        res.render('user/editAddress',{error,id,address});
    } 
    else {
        res.redirect('/login');
    }
}

const userUpdateAddress = async (req,res)=>{

    const{newAddressName:addressName,newPhoneNo:phoneNo,newZip:zipCode,newState:state,newDistrict:distrct,newFullAddress:fullAddress}=req.body;
    // console.log("--", addressName,"--",phoneNo,"--",zipCode,"--",state,"--",distrct,"--",fullAddress,"--",req.query.addressId);

    const addressId = req.query.addressId; // Get the address ID from the query parameters
        const update = {
            district: distrct,
            state: state,
            pincode: zipCode,
            address: fullAddress,
            name: addressName,
            phone: phoneNo,
        }; 
        try {
            const address = await Address.findByIdAndUpdate(addressId, update, { new: true });
            console.log("Updated address:", address);
        } catch (error) {
            console.error("Error updating address:", error);
        }
    res.redirect('/profile');
}

const userDeleteAddress = async(req,res)=>{
    const addressId = req.query.addressid; // Get the address ID from the query parameters
    const userId = req.session.uid;
    // console.log("--id",addressId);

    try {
        // Using findByIdAndRemove()
        const deletedAddress = await Address.findByIdAndRemove(addressId);        
        const updatedUser = await User.findByIdAndUpdate(userId,{$pull: {address: addressId}},{ new: true });
        // Or using deleteOne()
        // const result = await Address.deleteOne({ _id: addressId });
        res.redirect('/profile');
    } catch (error) {
        console.error("Error deleting address:", error);
    }
}

const userForgotpassword  = async(req,res)=>{

    // req.session.randomNumber=null;

    res.render('user/forgotpassword');
}

const userForgetPasswordEmail = async(req,res)=>{

    const {email:userEmail} = req.body;
    req.session.email = userEmail;
    const user = await userController.checkEmailExist(userEmail);
    // console.log("--",user);
    if(!user){
        req.flash('error', 'Email does not exist');
        return res.redirect('/forgotpassword');
    }
    req.session.step=1;
    userController.sendMail(req,res,userEmail);
    res.redirect('/passwordotp');
}

const userPasswordOtp = async (req,res)=>{
    console.log("====");
    if(req.session.step==1){
        const wrongotp = req.session.wrongotp;
        const email = req.session.email;

        req.session.wrongotp=null;

        console.log('wrongtp ', wrongotp);
        res.render('user/passwordotp',{email,wrongotp});
    }
    else{
        res.redirect('/forgotpassword');
    }
}

const userOtp = async (req,res)=>{
    const oottpp = req.body.oottpp;
    const val = req.session.randomNumber;

    if(val==oottpp){
        req.session.wrongotp=1;
        req.session.step=2;
        console.log("success");
        res.redirect('/resetpassword');
    }
    else{
        req.session.wrongotp=2;
        console.log("fail");
        res.redirect('/passwordotp')
    }
}

const userResentOtp = async (req,res)=>{
    if(req.session.step==1){
        req.session.step=1;
        // console.log("----",req.session.emil)
        userController.sendMail(req,res,req.session.email);
        res.redirect('/passwordotp');
    }
    else{
        res.redirect('/login');
    }
}

const userResetPassword = async (req,res)=>{
    if(req.session.step==2){
        
        const notMatch = req.session.notMatch;
        req.session.notMatch = null;

        res.render('user/resetpassword',{notMatch});
    }
    else{
        res.redirect('/forgotpassword');
    }
}

const userSubmitResetPassword = async(req,res)=>{
    // console.log("reached");
    const{password:password,verifyPassword:verifyPassword}=req.body;
    const specialCharacterRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;;
    const email = req.session.email;
    if(specialCharacterRegex.test(password)){
        if(password==verifyPassword){
            const user = await User.findOne({ email });
            const updatedUser = await User.findByIdAndUpdate(user._id, {password: password}, { new: true });
            // console.log("--",password,"--",verifyPassword);
            // console.log('--',updatedUser);
            res.redirect('/login');
        }
        else{
            req.session.notMatch=2;
            console.log("reached2");
            res.redirect('/resetPassword');
        }
    }
    else{
        req.session.notMatch=1;
        res.redirect('/resetPassword');
    }
}

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
  userUpdateProfile,
  userProfile,
  userAddAddress,
  userAddAddressDetails,
  userEditAddress,
  userUpdateAddress,
  userDeleteAddress,
  userForgotpassword,
  userForgetPasswordEmail,
  userPasswordOtp,
  userOtp,
  userResentOtp,
  userResetPassword,
  userSubmitResetPassword,
};
