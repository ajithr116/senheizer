const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');
const Wishlist = require('../models/wishlist');
const Banner = require('../models/banner');
const saltRounds = 10;


require('dotenv').config();

const userLogin =  async (req, res, next) => {
  if (req.session.uid) {
    res.redirect('/index'); 
  } 
  else {
  const error = req.session.error;
  req.session.error = null;
  req.session.step='';
  req.session.StepLogin=1;
  res.render('user/login', {error:error});
}
};

const userSubmit = async(req,res,next)=>{
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
    if(req.session.StepLogin==1){
      req.session.step='';
      const error = req.session.error;
      req.session.error = null;
      res.render('./user/signup',{ error: error });
    }
    else{
      res.redirect('/login'); 
    }
  }
};

const userSubmitForm = async(req,res,next)=>{

  const nameRegex = /^[a-zA-Z]{1,30}$/;    //only alphabet and upto 30 
  var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
  const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const {uFirstName: firstName, uLastName: lastName, uEmail: email, uPassword: password, uConfirmPassword: confirmPassword, uPhoneNo:phoneNumber, uReferral: referralCode} = req.body;
    
  try{
      if(req.session.uid){
        res.redirect('/index'); 
      }
      else{
        if(nameRegex.test(firstName) && nameRegex.test(lastName)|| req.session.check){
          if(true || req.session.check){
            const exists2 = await userController.checkEmailExist(email);     //function to find email exists or not
            if(exists2){
              req.session.error=3;    //email exists
              res.redirect('/signup');
            }
            else{
              req.session.referal = false;

              if (referralCode) {
                const user = await User.findOne({ referralCode: referralCode });
                if (!user) {
                  req.session.error = 6; // Referral code does not exist
                  return res.redirect('/signup');
                } else {
                  req.session.referal = true;
                  req.session.referalCode = referralCode;
                }
              }

              if(rePassword.test(password) || req.session.check){
                if(password==confirmPassword){

                  const hashedPassword = await bcrypt.hash(password, saltRounds);
                  req.session.rFirstName = firstName;
                  req.session.rLastName = lastName;
                  req.session.rEmail = email;
                  req.session.rPassword = hashedPassword;
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
                    } else {
                      console.log('Email sent:', info.response);
                    }
                  });
                  res.render('user/otp',{email:req.session.rEmail});
                }
                else{
                  req.session.error=5;    //password confirm fail
                  res.redirect('/signup');
                }
              }
              else{
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
    res.status(404).render('user/404page');
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
      from: process.env.EMAIL_ADDRESS,
      to: req.session.rEmail,
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
    res.render('user/otp',{email:req.session.rEmail});
  }
};

const userOtpVerify = async(req,res)=>{
  if (req.session.oneTimeAccess) {
    const d1 = req.body.oottpp;
    console.log("--resended-- with otp ",req.session.randomNumber);
    console.log("otp" , d1)
    if(d1==req.session.randomNumber){
      const rFirstName = req.session.rFirstName;
      const rLastName = req.session.rLastName;
      const rEmail = req.session.rEmail;
      const rPassword =  req.session.rPassword;
      const rPhoneNumber =  req.session.rPhoneNumber;

      let newUser = await userController.insertUserData(rFirstName,rLastName,rEmail,rPassword,rPhoneNumber);
      if(req.session.referal){

        const newUser2 = await User.findOne({email:req.session.rEmail});
      
        newUser2.wallet = 50;
        newUser2.walletHistory.push({
          amount: 50,
          type: 'refer',
          date: Date.now()
        });
        await newUser2.save();

        const referrer = await User.findOne({ referralCode: req.session.referalCode });
        console.log("refer",req.session.referalCode);
        referrer.referralCount += 1;
        referrer.wallet += 50; // Add 50 to the referrer's wallet 
        referrer.walletHistory.push({
          amount: 50, 
          type: 'refer',
          date: Date.now()
        });
        await referrer.save();
      }

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
    res.redirect('/signup');
  }
};

const userIndex = async(req,res)=>{
  if (req.session.uid) {
    const product = await userController.getAllProduct(7);
    const today = new Date();
    const banners = await Banner.find({isDeleted: false,isBlocked: false,startDate: { $lte: today },endDate: { $gte: today }});
    res.render('user/index',{products:product,banners});
  } 
  else {
    res.redirect('/login');
  } 
};

const userProducts = async (req, res) => {
  try{
    if (req.session.uid) {
    let product = await userController.getAllProductPage();
    let product2 = await userController.getAllProductPage();
    const category = await Category.find({ isDeleted: false });
    const { brand, maxPrice, color, category2 } = req.query;
    const searchQuery = req.query.search; 
    
    if (brand) {
      product = product.filter(product => brand.includes(product.brand));
    }
    
    if (maxPrice) {
      product = product.filter(product => product.price <= maxPrice);
    }
    
    if (color) {
      let colorArray;
      if (typeof color === 'string') {
          colorArray = color.split(',').map(c => c.trim().toLowerCase());
      } else if (Array.isArray(color)) {
          colorArray = color.map(c => c.trim().toLowerCase());
      }
      product = product.filter(product => {
          const productColors = product.tags.split(',').map(tag => tag.trim().toLowerCase());
          return colorArray.some(c => productColors.includes(c));
      });
    }
    
    if (category2) {
      product = await Product.find({ category: category2 });
    }
    
    if (searchQuery) {
      product = product.filter(product => {
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.toLowerCase().includes(searchQuery.toLowerCase())||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }); 
    }

    const today = new Date();
    const banners = await Banner.find({isDeleted: false,isBlocked: false,startDate: { $lte: today },endDate: { $gte: today }});

    
    res.render('user/products', { products: product, category,product2:product2,banners});
    } else {
      res.redirect('/login'); 
    }
  }
  catch(err){
    console.error(err.message);
    res.status(404).render('user/404page');
  }
};

const userProductPage = async(req,res)=>{
  if (req.session.uid) {
    const productId = req.query.productId;
    const product1 = await userController.getProductDetails(productId);
    const banner = await Banner.findOne({link:productId});
    res.render('user/productPage',{ product:product1 ,proID:productId,banner});
  } 
  else {
    res.redirect('/login');
  }
};

const userLogout = async (req,res,next)=>{ 
  try{
    req.session.uid='';
    res.redirect('./login');
  }
  catch(err){
    next(err);
    res.status(404).render('user/404page');
  }
};

const discount = async(req,res,next)=>{
  const productId = req.query.productId;
  const categoryId = req.query.categoryId;
  var products;
  try {
    const discounts = await Banner.find({});
    let productDiscount = 0;
    let categoryDiscount = 0;
    discounts.forEach(async discount => {
      if (discount.linkType === 'product' && discount.link == productId) {
        productDiscount = discount.discountAmt;
      }
      if (discount.linkType === 'category') {
        products = await Product.findOne({ category: categoryId });
      }
    });
    res.json({ productDiscount, categoryDiscount });
  } catch (error) {
    console.error(error);
    res.status(404).render('user/404page');
  }
}

const checkReferral = async (req, res) => {
  try {
    const referralCode = req.params.referralCode;
    const referralExists = await User.findOne({ referralCode: referralCode });
    if (referralExists) {
      res.json({ referralExists: true });
    } else {
      res.json({ referralExists: false });
    }
  } catch (error) {
    console.error('Error checking referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
  discount,
  checkReferral
};
