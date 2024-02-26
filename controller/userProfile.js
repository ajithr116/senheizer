const User = require('../models/user'); 
const Product = require('../models/products'); 
const userController = require('../userFunctions/usersFun');
const Address=require('../models/address');


const userProfile = async (req,res)=>{
  if (req.session.uid) {
    const userDetails = await User.findById(req.session.uid);
    const checkoutPage = req.query.checkoutPage;
    let change = 0

    if(checkoutPage==1){
      change=1;
    }

    const user = await User.findById(req.session.uid).populate('address');
    let error = req.session.error;
    res.render('user/profile',{userDetails,error,user,change});
} 
  else {
    res.redirect('/login');
  }
}


const userUpdateProfile = async (req,res)=>{
  const{updateFirstName:firstName,updateLastName:lastName,updateEmail:email,updatePhoneNo:phoneNo} = req.body;
  // if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
  //   req.session.error = 1;
  // }
  const userId = req.query.userId;
  try {
    const user = await User.findByIdAndUpdate({_id:userId}, {$set:{firstName:firstName,lastName:lastName,email:email,phoneNumber:phoneNo}});
    res.redirect('/profile');
  } 
  catch (error) {
    console.error(error);
    res.status(404).render('user/404page');
  }
}

const userAddAddress = async(req,res)=>{
  if (req.session.uid) {
      
    const userDetails = await User.findById(req.session.uid);
    const error = req.session.error;
    const id = req.session.uid;
    const check = req.query.checkoutPage;
    if(check==1){
    req.session.change=1;
    }
    res.render('user/addAddress',{error,id});
  } 
  else {
    res.redirect('/login');
  }
}

const userAddAddressDetails = async(req,res)=>{
  const{newAddressName:addressName,newPhoneNo:phoneNo,newZip:zipCode,newState:state,newDistrict:distrct,newFullAddress:fullAddress}=req.body;
  const userId = req.query.userId;
  // if (phoneNo.length !== 10 && zipCode.length !== 6) {
  //   req.session.error = 3;
  //   res.redirect('/addaddress');
  // }else{
  //   if (phoneNo.length !== 10) {
  //     req.session.error = 1;
  //     res.redirect('/addaddress');
  //   }
  //   else{
  //     if (zipCode.length !== 6) {
  //       req.session.error = 2;
  //       res.redirect('/addaddress');
  //     }   
  //     else{
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
         
        try {
          const user = await User.findById(userId);
          user.address.push(address._id);
          const updatedUser = await user.save();
          res.set('Cache-Control', 'no-store')

        } catch (error) {
          console.error("Error updating user with address:", error);
        }
        if(req.session.change==1){
          req.session.change='';
          res.redirect('/checkout');
        }
        else{
          res.redirect('/profile');
        }
      // }     
  //   }
  // }
}

const userEditAddress = async(req,res)=>{
  if (req.session.uid) {
    const addressId = req.query.addressid;

    if (!addressId || (addressId && addressId.length !== 24) || (addressId && addressId.length<24) ) {
      res.status(404).render('user/404page'); 
      return; 
    }

    const address = await Address.findById(addressId);
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
  const addressId = req.query.addressId; 
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
    res.status(500).render('user/404page');
  }
  res.redirect('/profile');
}

const userDeleteAddress = async(req,res)=>{
  const addressId = req.query.addressid; 
  const userId = req.session.uid;
  try {
    const deletedAddress = await Address.findByIdAndRemove(addressId);        
    const updatedUser = await User.findByIdAndUpdate(userId,{$pull: {address: addressId}},{ new: true });
    res.redirect('/profile');
  } catch (error) {
      console.error("Error deleting address:", error);
  }
}

const userWallet = async(req,res)=>{
  if(req.session.uid){
    const users = await User.findById(req.session.uid).sort({date:-1});
    res.render('user/wallet',{users});
  }
  else {
    res.redirect('/login');
  }
}

module.exports = {
  userProfile,
  userUpdateProfile,
  userDeleteAddress,
  userUpdateAddress,
  userEditAddress,
  userAddAddressDetails,
  userAddAddress,
  userWallet,
}