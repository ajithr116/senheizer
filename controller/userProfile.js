const User = require('../models/user'); 
const Product = require('../models/products'); 
const userController = require('../userFunctions/usersFun');



const userProfile = async (req,res)=>{
    if (req.session.uid) {

        const userDetails = await User.findById(req.session.uid);
        
        // console.log("--",userDetails);
        let error = req.session.error;
        res.render('user/profile',{userDetails,error});
    } 
    else {
        res.redirect('/login');
    }
}


const userUpdateProfile = async (req,res)=>{

    const{updateFirstName:firstName,updateLastName:lastName,updateEmail:email,updatePhoneNo:phoneNo} = req.body;
    if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
        req.session.error = 1;
    }
    
    const userId = req.query.userId;
    console.log("--", firstName,"--",lastName,"--",email,"--",phoneNo,"--",userId);
    try {
        const user = await User.findByIdAndUpdate({_id:userId}, {
          firstname: firstName,
          lastname: lastName,
          email: email,
          phoneNo: phoneNo,
        }, { new: true })
          .catch((error) => {
            console.error('Error updating user:', error);
            throw error; // Re-throw to handle in the outer catch block
          });

        console.log("--",user);
        res.redirect('/profile');
      } 
      catch (error) {
        console.error(error);
        res.status(500).send('Error updating profile');
      }    
}

module.exports = {
    userProfile,
    userUpdateProfile,
}