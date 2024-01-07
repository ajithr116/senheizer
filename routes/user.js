// routes/userRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const userController = require('../controller/user');
const functionController = require('../userFunctions/usersFun')



// router.get('/login', async (req, res, next) => {
//     if (req.session.uid) {
//         res.redirect('/index'); 
//     } 
//     else {

//         const error = req.session.error;
//         req.session.error = null;

//         res.render('user/login', {error:error},(err, html) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Internal Server Error');
//             } 
//             else {
//             res.send(html);
//             }
//         });
//     }
// });

// router.post('/submit',async(req,res,next)=>{
//     // const email=req.body.uName;
//     // const password=req.body.uPassword;

//     const {uName:email,uPassword:password} = req.body;

//     const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

//     if(req.session.uid){
//         res.redirect('/home'); 
//     }
//     else{
        
//         try{
//             if(true){
//                 const exists = await userController.checkEmailExist(email);     //function to find email exists or not
                
//                 if (exists) {

//                     const isBlocked = await userController.isUserDeleted(email);

//                     if(isBlocked==true){
//                         req.session.error = 5 // email blocked
//                         res.redirect('/login');
//                     }
//                     else{
//                         // console.log('Email exists');
//                         if(rePassword.test(password)){

//                             req.session.email=email;
                        
//                             const user = await userController.authenticateUser(email,password);

//                             if(user){
//                                 // const hashedPassword = await bcrypt.hash(password, 10);
//                                 req.session.uid=user._id;
//                                 req.session.email=email;
//                                 console.log("successfully logged in");
//                                 res.redirect('./index');
//                             }
//                             else{
//                                 // console.log('Authentication failed');
//                                 req.session.error = 4 // email and password not match
//                                 res.redirect('/login');
//                             }
//                         }
//                         else{
//                             // console.log('Password not match the format');
//                             req.session.error = 3 // password 3 not the match the format
//                             res.redirect('/login');
//                         }
//                     }
//                 } 
//                 else {
//                     // console.log('Email does not exist');
//                     req.session.error = 2 // Error code 3 email does not exists
//                     res.redirect('/login');
//                 }
//             }
//             else{
//                 req.session.error = 1 // Error code 3 regular expression not mathch
//                 res.redirect('/login');
//             }
//         }
//         catch(err){
//             next(err);
//         }
//     }
// });

// router.get('/signup',(req,res)=>{
//     if (req.session.uid) {
//         res.redirect('/index'); 
//     } else {
//         const error = req.session.error;
//         req.session.error = null;
        
//         // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         // res.render('./user/login');

//         res.render('./user/signup',{ error: error });
//     }
// });

// router.post('/submitForm',async(req,res,next)=>{

//     const nameRegex = /^[a-zA-Z]{1,30}$/;    //only alphabet and upto 30 
//     var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
//     const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

//     // const firstName = req.body.uFirstName;
//     // const lastName = req.body.uLastName;
//     // const email = req.body.uEmail;
//     // const password = req.body.uPassword;
//     // const confirmPassword = req.body.uConfirmPassword;

//     const {uFirstName: firstName,uLastName: lastName,uEmail: email,uPassword: password,uConfirmPassword: confirmPassword} = req.body;
      
//     try{
//         if(req.session.uid){
//             res.redirect('/index'); 
//         }
//         else{
//             if(nameRegex.test(firstName) && nameRegex.test(lastName)|| req.session.check){
//                 if(true || req.session.check){
//                 // if(reEmail.test(email)){

//                     const exists2 = await userController.checkEmailExist(email);     //function to find email exists or not
                    

//                     if(exists2){
//                         // console.log("bad");
//                         req.session.error=3;    //email exists
//                         res.redirect('/signup');
//                     }
//                     else{
//                         if(rePassword.test(password) || req.session.check){
//                             // console.log("good");
//                             if(password==confirmPassword){
//                                 req.session.rFirstName = firstName;
//                                 req.session.rLastName = lastName;
//                                 req.session.rEmail = email;
//                                 req.session.rPassword = password;
//                                 req.session.oneTimeAccess = 1;
//                                 req.session.check=true;

//                                 var val = Math.floor(1000 + Math.random() * 9000);
//                                 req.session.randomNumber=val;

//                                 console.log("all good");

//                                 const transporter = nodemailer.createTransport({
//                                     service: 'gmail',
//                                     auth: {
//                                         user: process.env.EMAIL_ADDRESS,
//                                         pass: process.env.PASS
//                                     }
//                                 });
                                
//                                 console.log('rEmail' , req.session.rEmail);
//                                 const mailOptions = {
//                                     from: 'ajith8593935904@gmail.com',
//                                     to: req.session.rEmail,
//                                     subject: 'Your OTP Verification Code',
//                                     text: `Your OTP is: ${val}`
//                                 };
//                                 console.log("sended");

//                                 transporter.sendMail(mailOptions, (error, info) => {
//                                     if (error) {
//                                         console.error(error);
//                                         // Display a user-friendly error message or redirect to an error page
//                                     } else {
//                                         console.log('Email sent:', info.response);
//                                     }
//                                 });
                                

//                                 res.render('user/otp',{email:req.session.rEmail});
//                             }
//                             else{
//                                 // console.log("bad");
//                                 req.session.error=5;    //password confirm fail
//                                 res.redirect('/signup');
//                             }
//                         }
//                         else{
//                             // console.log("bad");
//                             req.session.error=4;    //password format
//                             res.redirect('/signup');
//                         }
//                     }
//                 }
//                 else{
//                     req.session.error=2;    //emial format
//                     res.redirect('/signup');
//                 }
//             }
//             else{
//                 req.session.error=1;    //first name and last name need alphabet
//                 res.redirect('/signup');
//             }
//         }
//     }
//     catch(err){
//         next(err);
//     }
// });

// router.get('/submitForm',async(req,res,next)=>{

//     if(req.session.oneTimeAccess){
//         var val = Math.floor(1000 + Math.random() * 9000);
//         req.session.randomNumber=val;
//         console.log("--resended with otp ",req.session.randomNumber);
    
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_ADDRESS,
//                 pass: process.env.PASS
//             }
//         });
        
//         console.log('rEmail' , req.session.rEmail);
//         const mailOptions = {
//             from: 'ajith8593935904@gmail.com',
//             to: req.session.rEmail,
//             subject: 'Your OTP Verification Code',
//             text: `Your OTP is: ${val}`
//         };
//         console.log("sended");
    
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error(error);
//                 // Display a user-friendly error message or redirect to an error page
//             } else {
//                 console.log('Email sent:', info.response);
//             }
//         });
        
//         res.render('user/otp',{email:req.session.rEmail});
//     }
// });


// router.post('/otpverify',async(req,res)=>{
//     if (req.session.oneTimeAccess) {

//         const d1 = req.body.oottpp;
//         // console.log("random number " , req.session.randomNumber);

//         console.log("--resended-- with otp ",req.session.randomNumber);

//         console.log("d1" , d1)

//         if(d1==req.session.randomNumber){

//             const rFirstName = req.session.rFirstName;
//             const rLastName = req.session.rLastName;
//             const rEmail = req.session.rEmail;
//             const rPassword =  req.session.rPassword;

//             const upload = await userController.insertUserData(rFirstName,rLastName,rEmail,rPassword)
//             console.log("upload = ",upload);

//             req.session.destroy((err) => {
//                 // req.session.username=upload;
//                 console.log("---otp successfull");
                
//                 // setTimeout(()=>{
//                 //     res.redirect('/login');
//                 // },3000)
//             })
//             res.render('user/otp',{otpWrong:true,email:rEmail});
//         }
//         else{

//             console.log("wrong otp");
            
//             // res.render('user/otp',{otpWrong:false});
//             res.render('user/otp',{otpWrong:false,email:req.session.rEmail});

//         }
//     } 
//     else {
//         // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         res.redirect('/signup');
//     }

// });

// router.get('/index',async(req,res)=>{
//     // console.log("routes");
//     if (req.session.uid) {

//         const product = await userController.getAllProduct(3);
//         // const product2 = await userDB.getAllProductPage();

//         res.render('user/index',{products:product});
//     } 
//     else {
//         // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         res.redirect('/login');
//     }
// });

// router.get('/products',async(req,res)=>{
//     if (req.session.uid) {

//         const product = await userController.getAllProductPage();
        
//         // console.log(product);
//         res.render('user/products',{products:product});
//     } 
//     else {
//         // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         res.redirect('/login');
//     }
// });

// router.get('/productPage',async(req,res)=>{
//     if (req.session.uid) {

//         const productId = req.query.productId;
//         const product1 = await userController.getProductDetails(productId);
//         // console.log("----",product1);
//         res.render('user/productPage',{ product:product1 ,proID:productId});
        
//     } 
//     else {
//         // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         res.redirect('/login');
//     }
// });


// router.get('/logout',(req,res)=>{
//     try{
//         req.session.destroy((err) => {
//         if (err) {
//             console.error('Session destruction error:', err);
//         }
//         res.clearCookie('connect.sid');
        
//         // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         res.redirect('./login');
//     });
//     }
//     catch(err){
//         next(err);
//     }
// });

// router.use( async (req,res,next)=>{
//     console.log("reached-");
//     console.log(req.session.email);
//     if(await userController.isUserDeleted(req.session.email)){
//         res.redirect('./logout');
//     }
//     next();
// })
const checkUserBlocked = async (req,res,next)=>{
    console.log("reached middelware");
    if(await functionController.isUserDeleted(req.session.email)){
        res.redirect('./logout');
    } else {
        next();
    }
}

router.get('/login',userController.userLogin);
router.post('/submit',userController.userSubmit);
router.get('/signup',userController.userSignup);
router.post('/submitForm',userController.userSubmitForm);
router.get('/submitForm',userController.userSubmitForm2);
router.post('/otpverify',userController.userOtpVerify);
router.get('/index',checkUserBlocked,userController.userIndex);
router.get('/products',checkUserBlocked,userController.userProducts);
router.get('/productPage',checkUserBlocked,userController.userProductPage);
router.get('/logout',userController.userLogout);




module.exports = router;
