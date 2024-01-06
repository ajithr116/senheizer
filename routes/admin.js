const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const adminController = require('../controller/admin');
const multer  = require('multer')
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
router.get('/viewProduct',adminController.adminViewProducts);
router.get('/addProduct',adminController.adminAddProduct);
router.post('/productSubmit', adminController.adminSubmitProduct);
router.get('/deleteproduct',adminController.adminDeleteProduct);
router.get('/categoryManage',adminController.adminCategoryManage);
router.get('/detailProduct',adminController.adminDetailProduct);
router.get('/getProductDetails',adminController.adminDetailProduct);
router.post('/updateproduct', adminController.adminUpdateProduct);
router.get('/userManagement',adminController.adminUsermanage);
router.get('/unblockuser',adminController.adminBlockUser);
router.get('/blockuser',adminController.adminUnblockUser);
router.get('/addCategory',adminController.adminCategory);
router.post('/submitcategory',adminController.adminSubmitCategory);
router.get('/',adminController.adminDefault);



router.use((req,res)=>{
    res.redirect('./login');
});



module.exports = router;        //exporitng the router 
