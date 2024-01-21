const Coupon = require('../models/coupon');

const adminCouponDetails = async(req,res)=>{
    if(req.session.aid){
        try{
            const coupons = await Coupon.find({});
            res.render("admin/couponManage",{coupons});
        }
        catch(err){
            console.error(err);
        }
    }
    else{
        res.redirect('/login');
    }
}

const adminAddCoupon = async(req,res)=>{
    if(req.session.aid){
        res.render('admin/addCoupon')
    }
    else{
        res.redirect('/login');
    }
}
const adminSubmitCoupon = async (req, res) => {
    const { couponCode, couponExpireDate, couponReduceAmt, couponMinimumAmt } = req.body;
    // console.log("--",couponCode,"--",couponExpireDate,"--",couponReduceAmt,"--",couponMinimumAmt);

    const coupon = new Coupon({
        couponCode,
        reducingAmount: couponReduceAmt,
        minimumPrice: couponMinimumAmt,
        expireDate: couponExpireDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });
    await coupon.save();
    res.redirect('/admin/couponManage');
};


const adminBlockCoupon = async(req,res)=>{
    console.log( "reached");
    const couponID = req.query.couponId;
    const category = await Coupon.updateOne({_id:couponID}, { $set: { isDeleted: false } }, { new: true });
    res.redirect('/admin/couponManage');

}
const adminUnblockCoupon = async(req,res)=>{
    const couponID = req.query.couponId;
    const category = await Coupon.updateOne({_id:couponID}, { $set: { isDeleted: true } }, { new: true });
    res.redirect('/admin/couponManage');

}
module.exports={
    adminCouponDetails,
    adminAddCoupon,
    adminSubmitCoupon,
    adminBlockCoupon,
    adminUnblockCoupon,
}