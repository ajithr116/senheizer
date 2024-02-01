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
const adminDashboadController = require('../controller/admindashboard');
const adminBannerController = require('../controller/bannerManagement')
const upload = multer({ dest: 'uploads/' })



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
    res.status(404).render('admin/404page');
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

//----------------------------------------------requirements over --------------------------------------------------------------


router.get('/login', adminController.adminLogin);
router.post('/aSubmit',adminController.adminSubmit);
router.get('/logout',adminController.adminLogout);

//product
router.get('/viewProduct',adminController.adminViewProducts);
router.get('/addProduct',adminController.adminAddProduct);
router.post('/productSubmit', adminController.adminSubmitProduct);
router.get('/deleteproduct',adminController.adminDeleteProduct);
router.get('/detailProduct',adminController.adminDetailProduct);
router.get('/getProductDetails',adminController.adminDetailProduct);
router.post('/updateproduct', adminController.adminUpdateProduct);

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

//dashboard controller 
router.get('/index',adminDashboadController.adminIndex );
router.post('/userstats',adminDashboadController.userStats);    //weekly, montly, yearly
router.get('/salesReport',adminDashboadController.adminSalesReports);
router.post('/salesReport2',adminDashboadController.salesReport2);
router.get('/orderStatusAnalysis',adminDashboadController.orderStatus);
router.get('/productPopularity',adminDashboadController.productPopularity);
router.get('/paymentMethodPreferences',adminDashboadController.paymentMethodPreferences);
router.post('/salesRevenue',adminDashboadController.salesRavenue);
router.get('/downloadreport',adminDashboadController.downloadSalesReport);
router.get('/excelconvert',adminDashboadController.excelDownload);

//banner
router.get('/banner',adminBannerController.adminBanner);
router.get('/addBanner',adminBannerController.adminAddBanner);
router.post('/addBanner',adminBannerController.adminUploadBanner);
router.get('/deletebanner',adminBannerController.adminBannerDelete);
router.get('/unblockbanner',adminBannerController.adminUnblockBanner);
router.get('/blockbanner',adminBannerController.adminBlockbanner);


router.use((req,res)=>{
    res.redirect('./login');
});

module.exports = router;     
