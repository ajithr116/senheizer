const userController = require('../userFunctions/usersFun');
const User = require('../models/user');

const userForgotpassword  = async(req,res)=>{

    // req.session.randomNumber=null;

    res.render('user/forgotpassword');
}

const userForgetPasswordEmail = async(req,res)=>{

    const {email:userEmail} = req.body;
    req.session.email = userEmail;
    const user = await userController.checkEmailExist(userEmail);
    // console.log("--",user);
    if(!user){
        req.flash('error', 'Email does not exist');
        return res.redirect('/forgotpassword');
    }
    req.session.step=1;
    userController.sendMail(req,res,userEmail);
    res.redirect('/passwordotp');
}

const userPasswordOtp = async (req,res)=>{
    console.log("====");
    if(req.session.step==1){
        const wrongotp = req.session.wrongotp;
        const email = req.session.email;

        req.session.wrongotp=null;

        console.log('wrongtp ', wrongotp);
        res.render('user/passwordotp',{email,wrongotp});
    }
    else{
        res.redirect('/forgotpassword');
    }
}

const userOtp = async (req,res)=>{
    const oottpp = req.body.oottpp;
    const val = req.session.randomNumber;

    if(val==oottpp){
        req.session.wrongotp=1;
        req.session.step=2;
        console.log("success");
        res.redirect('/resetpassword');
    }
    else{
        req.session.wrongotp=2;
        console.log("fail");
        res.redirect('/passwordotp')
    }
}

const userResentOtp = async (req,res)=>{
    if(req.session.step==1){
        req.session.step=1;
        // console.log("----",req.session.emil)
        userController.sendMail(req,res,req.session.email);
        res.redirect('/passwordotp');
    }
    else{
        res.redirect('/login');
    }
}

const userResetPassword = async (req,res)=>{
    if(req.session.step==2){
        
        const notMatch = req.session.notMatch;
        req.session.notMatch = null;

        res.render('user/resetpassword',{notMatch});
    }
    else{
        res.redirect('/forgotpassword');
    }
}

const userSubmitResetPassword = async(req,res)=>{
    // console.log("reached");
    const{password:password,verifyPassword:verifyPassword}=req.body;
    const specialCharacterRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

    console.log("--",password,"--",verifyPassword);

    const email = req.session.email;

    if(specialCharacterRegex.test(password)){
        if(password==verifyPassword){
            const user = await User.findOne({ email });

            console.log("--",user)

            const updatedUser = await User.findByIdAndUpdate(user._id, {password: password}, { new: true });
            
            // console.log("--",password,"--",verifyPassword);
            req.session.notMatch=3;
            res.redirect('/resetPassword');

            // res.redirect('/login');
        }
        else{
            req.session.notMatch=2;
            res.redirect('/resetPassword');
        }
    }
    else{
        req.session.notMatch=1;
        res.redirect('/resetPassword');
    }
}


module.exports={
    userSubmitResetPassword,
    userResetPassword,
    userOtp,
    userPasswordOtp,
    userForgetPasswordEmail,
    userForgotpassword,
    userResentOtp,
}