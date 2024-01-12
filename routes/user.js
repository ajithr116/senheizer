// routes/userRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const userController = require('../controller/user');
const functionController = require('../userFunctions/usersFun');
const userProfileController = require('../controller/userProfile');
const addToCartController = require('../controller/cartAndOrders');

// router.use( async (req,res,next)=>{
//     console.log("reached-");
//     console.log(req.session.email);
//     if(await userController.isUserDeleted(req.session.email)){
//         res.redirect('./logout');
//     }
//     next();
// })
const checkUserBlocked = async (req,res,next)=>{
    // console.log("reached middelware");
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

//user profile settings
router.get('/profile',checkUserBlocked,userController.userProfile);
router.post('/profile',userController.userUpdateProfile);
router.get('/addaddress',checkUserBlocked,userController.userAddAddress);
router.post('/addaddress',userController.userAddAddressDetails);
router.get('/editaddress',checkUserBlocked,userController.userEditAddress);
router.post('/editaddress',userController.userUpdateAddress);
router.get('/deleteaddress',userController.userDeleteAddress);

//user forgot passwored
router.get('/forgotpassword',userController.userForgotpassword);
router.post('/forgotpassword',userController.userForgetPasswordEmail);
router.get('/passwordotp',userController.userPasswordOtp);
router.post('/passwordotp',userController.userOtp);
router.get('/resendotp',userController.userResentOtp);
router.get('/resetpassword',userController.userResetPassword);
router.post('/resetpassword',userController.userSubmitResetPassword);

//cart and orders, checkout
router.get('/addtocart',checkUserBlocked,addToCartController.addToCart);
router.get('/cart',checkUserBlocked,addToCartController.userCartDetails)
router.get('/removeproduct',addToCartController.userRemoveProductFromCart);
router.post('/updatecart',addToCartController.userUpdateCart); //pending
router.get('/checkout',checkUserBlocked,addToCartController.userCheckout);
//----tricky
router.get('/paymentsuccess',addToCartController.userPayment);

router.get('/payment',checkUserBlocked,addToCartController.userPaymentPage);

router.get('/logout',userController.userLogout);


module.exports = router;
