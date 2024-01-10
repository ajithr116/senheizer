
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const flash = require('connect-flash');

const userController = require('./controller/user');

require('dotenv').config();

const bcrypt = require('bcrypt'); // Import bcrypt library

// const math = require('./routes/sample'); // Import the math module
const { MongoClient } = require('mongodb');
// const port = process.env.PORT || 4000;

// Import the user and admin routes
// const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const userRoutes = require('./routes/user');
const userDB = require('./models/userDB'); // Import the user database module


const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: '1hhh2vsdj2342bSDf523', resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');
app.use(flash());

// app.use(
//     session({
//         secret: 'aSdfsdfSDFse#',
//         resave: false,
//         saveUninitialized: true
//     })
// );



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

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// app.use('/resetpassword',(req,res)=>{
//     res.render('user/resetPassword');
// })


//----------------------------------------------requirements over --------------------------------------------------------------

//---------------------------------admin routes-------------------------------------------

//const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);
//directory in views/admin/

//---------------------------------admin routes end--------------------------------------------

app.use('/', userRoutes);



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