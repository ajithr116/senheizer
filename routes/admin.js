const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const multer  = require('multer')

const adminController = require('../controller/admin');
const adminCategoryController = require('../controller/category');
const adminOrderController = require("../controller/orderManagement");
const adminCouponController = require('../controller/couponmanagement');
const upload = multer({ dest: 'uploads/' })


// const adminController = require('../controller/user');


// const port = process.env.PORT || 3000;

// const urll = require('url');

// const adminDB = require('../models/adminDB'); // Import the user database module

const app = express();
const router = express.Router();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));

//errror handling
app.use(function(err, req, res, next) {
    console.error(err.stack); // errror stack
    res.status(500).send('Something broke!'); 
});

// app.use(function(req, res, next) {
//     if (!req.session.uname) {
//         res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         // res.setHeader('Cache-Control', 'no-cache,no-store');
//     }
//     else{
//         res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
//         // res.setHeader('Cache-Control', 'no-cache,no-store');
//     }
//     next();
// });
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

//----------------------------------------------requirements over --------------------------------------------------------------


router.get('/login', adminController.adminLogin);
router.post('/aSubmit',adminController.adminSubmit);
router.get('/index',adminController.adminIndex);
router.get('/logout',adminController.adminLogout);

//product
router.get('/viewProduct',adminController.adminViewProducts);
router.get('/addProduct',adminController.adminAddProduct);
router.post('/productSubmit', adminController.adminSubmitProduct);
router.get('/deleteproduct',adminController.adminDeleteProduct);
router.get('/detailProduct',adminController.adminDetailProduct);
router.get('/getProductDetails',adminController.adminDetailProduct);
router.post('/updateproduct', adminController.adminUpdateProduct);
// router.put('/updateproduct', adminController.adminUpdateProduct);

//usermanangement
router.get('/userManagement',adminController.adminUsermanage);
router.get('/unblockuser',adminController.adminBlockUser);
router.get('/blockuser',adminController.adminUnblockUser);
router.get('/userdetails',adminController.adminUserDetails);

//category
router.get('/addCategory',adminCategoryController.adminCategory);
router.post('/submitcategory',adminCategoryController.adminSubmitCategory);
router.get('/blockcategory',adminCategoryController.adminBlockCategory);
router.get('/unblockcategory',adminCategoryController.adminUnBlockCategory);
router.get('/categoryManage',adminCategoryController.adminCategoryManage);

//order management 
router.get('/ordermanagement',adminOrderController.adminOrders);
router.get('/orderdetails',adminOrderController.adminOrderDetails);
router.post('/status',adminOrderController.adminUpdateStatus);

//coupon management
router.get("/couponManage",adminCouponController.adminCouponDetails);
router.get("/addCoupon",adminCouponController.adminAddCoupon);
router.post('/addCoupon',adminCouponController.adminSubmitCoupon);
router.get('/unblockcoupon',adminCouponController.adminBlockCoupon);
router.get('/blockcoupon',adminCouponController.adminUnblockCoupon);

router.get('/',adminController.adminDefault);



router.use((req,res)=>{
    res.redirect('./login');
});



module.exports = router;        //exporitng the router 
