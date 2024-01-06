
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // Import bcrypt library

// const math = require('./routes/sample'); // Import the math module
const { MongoClient } = require('mongodb');
// const port = process.env.PORT || 4000;

// Import the user and admin routes
// const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const userDB = require('./models/userDB'); // Import the user database module


const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: '1hhh2vsdj2342bSDf523', resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');


app.use(
    session({
        secret: 'aSdfsdfSDFse#',
        resave: false,
        saveUninitialized: true
    })
);

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
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

//---------------------------------admin routes-------------------------------------------

//const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);
//directory in views/admin/

//---------------------------------admin routes end--------------------------------------------

app.get('/login', async (req, res) => {

    if (req.session.uid) {
        res.redirect('/index'); 
    } 
    else {

        const error = req.session.error;
        req.session.error = null;

        res.render('user/login', {error:error},(err, html) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } 
            else {
            res.send(html);
            }
        });
    }
});

app.post('/submit',async(req,res,next)=>{
    const email=req.body.uName;
    const password=req.body.uPassword;

    // console.log(email);
    // console.log(password);

    const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

    if(req.session.uid){
        res.redirect('/home'); 
    }
    else{
        try{
            if(reEmail.test(email)){
                // console.log(email);
                const exists = await userDB.checkEmailExist(email);     //function to find email exists or not

                if (exists) {
                    // console.log('Email exists');
                    if(rePassword.test(password)){
                        // req.session.email=email;

                        
                        const user = await userDB.authenticateUser(email,password);

                        if(user){
                            const hashedPassword = await bcrypt.hash(password, 10);
                            req.session.uid=user._id;
                            console.log("congrats");
                            res.redirect('./index');
                        }
                        else{
                            // console.log('Authentication failed');
                            req.session.error = 4 // email and password not match
                            res.redirect('/login');
                        }
                    }
                    else{
                        // console.log('Password not match the format');
                        req.session.error = 3 // password 3 not the match the format
                        res.redirect('/login');
                    }
                } 
                else {
                    // console.log('Email does not exist');
                    req.session.error = 2 // Error code 3 email does not exists
                    res.redirect('/login');
                }
            }
            else{
                req.session.error = 1 // Error code 3 regular expression not mathch
                res.redirect('/login');
            }
        }
        catch(err){
            next(err);
        }
    }
});




app.get('/signup',(req,res)=>{
    if (req.session.uid) {
        res.redirect('/index'); 
    } else {
        const error = req.session.error;
        req.session.error = null;
        
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        // res.render('./user/login');

        res.render('./user/signup',{ error: error });
    }
});

app.post('/submitForm',async(req,res,next)=>{

    const nameRegex = /^[a-zA-Z]{1,30}$/;    //only alphabet and upto 30 
    var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
    const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    const firstName = req.body.uFirstName;
    const lastName = req.body.uLastName;
    const email = req.body.uEmail;
    const password = req.body.uPassword;
    const confirmPassword = req.body.uConfirmPassword;

    try{
        if(req.session.uid){
            res.redirect('/index'); 
        }
        else{
            if(nameRegex.test(firstName) && nameRegex.test(lastName)){
                if(reEmail.test(email)){

                    const exists2 = await userDB.checkEmailExist(email);     //function to find email exists or not

                    if(exists2){
                        // console.log("bad");
                        req.session.error=3;    //email exists
                        res.redirect('/signup');
                    }
                    else{
                        if(rePassword.test(password)){
                            // console.log("good");
                            if(password==confirmPassword){
                                req.session.rFirstName = firstName;
                                req.session.rLastName = lastName;
                                req.session.rEmail = email;
                                req.session.rPassword = password;
                                req.session.oneTimeAccess = 1;

                                var val = Math.floor(1000 + Math.random() * 9000);
                                req.session.randomNumber=val;

                                // setTimeout(() => {
                                //     delete req.session.user;
                                    
                                // }, 60000); // Delay in milliseconds

                                console.log("all good");

                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'ajith8593935904@gmail.com',
                                        pass: 'fnvjzjziqibmyzwp'
                                    }
                                });
                                
                                console.log('rEmail' , req.session.rEmail);
                                const mailOptions = {
                                    from: 'ajith8593935904@gmail.com',
                                    to: req.session.rEmail,
                                    subject: 'Your OTP Verification Code',
                                    text: `Your OTP is: ${val}`
                                };
                                console.log("sended");

                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.error(error);
                                        // Display a user-friendly error message or redirect to an error page
                                    } else {
                                        console.log('Email sent:', info.response);
                                    }
                                });
                                

                                res.render('user/otp',{email:req.session.rEmail});
                            }
                            else{
                                // console.log("bad");
                                req.session.error=5;    //password confirm fail
                                res.redirect('/signup');
                            }
                        }
                        else{
                            // console.log("bad");
                            req.session.error=4;    //password format
                            res.redirect('/signup');
                        }
                    }
                }
                else{
                    req.session.error=2;    //emial format
                    res.redirect('/signup');
                }
            }
            else{
                req.session.error=1;    //first name and last name need alphabet
                res.redirect('/signup');
            }
        }
    }
    catch(err){
        next(err);
    }
});

app.get('/index',async(req,res)=>{
    if (req.session.uid) {

        const product = await userDB.getAllProduct(3);
        const product2 = await userDB.getAllProductPage();

        // console.log(product);
        res.render('user/index',{products:product,products2:product2});
    } 
    else {
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('/login');
    }
});

app.get('/products',async(req,res)=>{
    if (req.session.uid) {

        const product = await userDB.getAllProductPage();
        
        // console.log(product);
        res.render('user/products',{products:product});
    } 
    else {
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('/login');
    }
});

app.get('/productPage',async(req,res)=>{
    if (req.session.uid) {

        const productId = req.query.productId;
        const product = await userDB.getProductDetails(productId);
        console.log("--",product);
        res.render('user/productPage',{ product ,proID:productId});
    } 
    else {
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('/login');
    }
});

app.post('/otpverify',async(req,res)=>{
    if (req.session.oneTimeAccess) {

        // setTimeout(() => {
        //     const ottp = req.session.user;
        //     ottp.destroy();;
        // }, 60000); // Delay in milliseconds


        const d1 = req.body.oottpp;
        // console.log("random number " , req.session.randomNumber);

        console.log("d1" , d1)

        if(d1==req.session.randomNumber){

            const rFirstName = req.session.rFirstName;
            const rLastName = req.session.rLastName;
            const rEmail = req.session.rEmail;
            const rPassword =  req.session.rPassword;

            const upload = await userDB.insertUserData(rFirstName,rLastName,rEmail,rPassword)
            console.log("upload = ",upload);

            req.session.destroy((err) => {
                // req.session.username=upload;
                console.log("upload---",upload);
                res.redirect('/login');
            })

        }
        else{

            // console.log("wrong otp");
            res.redirect('/signup');
        }
    } 
    else {
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('/signup');
    }

});


app.get('/loadingPage',async(req,res)=>{
    res.render('user/loadingPage');
});


app.get('/logout',(req,res)=>{
    try{
        req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.clearCookie('connect.sid');
        
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('./login');
    });
    }
    catch(err){
        next(err);
    }
});



app.get('*',(req,res)=>{
    if (req.session.uname) {
        res.redirect('/home'); 
    } 
    else {
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('./login');
    }
});

app.use((req,res)=>{
    res.redirect('./login');
});


//---------------------------------------------- route over --------------------------------------------------------------

app.listen(3000,()=>{
    console.log("server running " )
})