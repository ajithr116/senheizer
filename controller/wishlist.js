// const { default: products } = require("razorpay/dist/types/products");
const Wishlist = require("../models/wishlist");
const Products = require('../models/products');

const userAddWishlist = async(req,res)=>{
    const { productId } = req.body;
    const userId = req.session.uid;

    try{
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {    //not
            // console.log("1--")
            wishlist = new Wishlist({ user: userId, Products: [{ productId: productId }] });
            res.json({isInWishlist:true});
        } 
        else {
            if(wishlist.Products.find(product=>product.productId.toString()===productId)){    //product id match
                wishlist.Products.pull({productId:productId});
                res.json({isInWishlist:false}); //no there is not because removed
                // console.log("2--")
            }
            else{   //adding product if there is not 
                wishlist.Products.push({productId:productId});   //adding 
                res.json({isInWishlist:true});
                // console.log("3--")

            }
        }

        await wishlist.save();
        // console.log("done ");
    }
    catch(err){
        console.error(err);
    }

}

module.exports = {
    userAddWishlist,
}