// routes/userRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const userController = require('../controller/user');
const userPasswordSettingsController = require('../controller/userPasswordSettings');
const functionController = require('../userFunctions/usersFun');
const userProfileController = require('../controller/userProfile');
const addToCartController = require('../controller/cartAndOrders');
const userFiltering = require('../controller/filtering');
const wishlistController = require('../controller/wishlist');

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
// router.post('/products',userController.userProductCategory);
router.get('/productPage',checkUserBlocked,userController.userProductPage);

//user profile settings
router.get('/profile',checkUserBlocked,userProfileController.userProfile);
router.post('/profile',userProfileController.userUpdateProfile);
router.get('/addaddress',checkUserBlocked,userProfileController.userAddAddress);
router.post('/addaddress',userProfileController.userAddAddressDetails);
router.get('/editaddress',checkUserBlocked,userProfileController.userEditAddress);
router.post('/editaddress',userProfileController.userUpdateAddress);
router.get('/deleteaddress',userProfileController.userDeleteAddress);

//user forgot passwored
router.get('/forgotpassword',userPasswordSettingsController.userForgotpassword);
router.post('/forgotpassword',userPasswordSettingsController.userForgetPasswordEmail);
router.get('/passwordotp',userPasswordSettingsController.userPasswordOtp);
router.post('/passwordotp',userPasswordSettingsController.userOtp);
router.get('/resendotp',userPasswordSettingsController.userResentOtp);
router.get('/resetpassword',userPasswordSettingsController.userResetPassword);
router.post('/resetpassword',userPasswordSettingsController.userSubmitResetPassword);

//cart and orders, checkout, orders
router.get('/addtocart',checkUserBlocked,addToCartController.addToCart);
router.get('/cart',checkUserBlocked,addToCartController.userCartDetails)
router.get('/removeproduct',addToCartController.userRemoveProductFromCart);
router.post('/updatecart',addToCartController.userUpdateCart); 
router.get('/checkout',checkUserBlocked,addToCartController.userCheckout);
router.post('/verifyCoupon',addToCartController.userVerifyCoupon);

//----tricky
//-----payments---------------------------------------------------------
router.get('/paymentsuccess',addToCartController.userPayment);
router.post('/ordersuccessR',addToCartController.userPaymentR);
router.post("/verifypaymentR",addToCartController.userPaymentVerifiyR)
//---------------------------------------------------------------------------

router.get('/payment',checkUserBlocked,addToCartController.userPaymentPage);
router.get('/orders',checkUserBlocked,addToCartController.userOrders);
router.get('/orderhistory',checkUserBlocked,addToCartController.userOrderDetails);  //extrra
router.get('/deleteorder',addToCartController.userDeleteOrder);
router.get('/ordersuccess',checkUserBlocked,addToCartController.orderSuccessPage);
// router.get('/products/filter',userFiltering.userFiltering)

//wishlist 
router.post("/addToWishlist",wishlistController.userAddToWishlist);
router.post("/removeFromWishlist",wishlistController.userRemoveFromWishlist);

//wallet
router.get('/wallet',checkUserBlocked,userProfileController.userWallet);



router.get('/logout',userController.userLogout);


module.exports = router;
