const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Users = require('../models/Users')
const {sendEmail} = require('../utils/sendEmail');
const { urlencoded } = require('express');
const crypto = require('crypto');
const { userInfo } = require('os');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public

const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    //Create a user
    const user = await Users.create({name, email, password, role})

    sendTokenResponse(user, 200, res)

})



//@desc     User login
//@route    POST /api/v1/auth/login
//@access   Public
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    //Validate email and password// email in good format and password has 6 characters
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400))
    }

    //Check for user
    const user = await Users.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401)) //401 unauthorized users doesnt exist
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials', 401))
    }

    sendTokenResponse(user, 200, res)

})



//@desc     Get current login user
//@route    GET /api/v1/auth/me
//@access   Private
const getMe = asyncHandler(async (req, res, next) => {
    
    const user = await Users.findById(req.user.id);
    res.status(200).json({success: true, data: user})
    
})


//@desc     Forgot password 
//@route    POST /api/v1/auth/forgotpassword
//@access   Public
const forgotpassword = asyncHandler(async (req, res, next) => {
    let {email} = req.body

    const user = await Users.findOne({email});

    if(!user){
        return next(new ErrorResponse('There is no user with that email', 404))
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken()

    //Save to database
    await user.save({validateBeforeSave: false})

    //Make a custom url and a message to send to user's email
    const url = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    let message = `Click in the link below to reset your password: \n\n ${url}`

    //Call sendEmail function
    try{
        await sendEmail({
            email: user.email,
            subject : 'Password Reset Token',
            message 
        })

        res.status(200).json({success: true, data: 'Email Sent'})
    }catch (err){
        console.log(err)
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpire = undefined;

        // await user.save({validateBeforeSave: false})
        return next(new ErrorResponse('Email could not be sent', 500))
    }
    // res.status(200).json({success: true, reset_token: resetToken, user})
    
})


//@desc     Reset Password
//@route    POST /api/v1/resetpassword/:resettoken
//@access   Public
const resetPassword = asyncHandler(async (req, res, next) => {
    //Get hash token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    //Now find the user by the hash token
    const user = await Users.findOne({resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }});

    if(!user){
        return next(new ErrorResponse('Invalid Token', 400))
    }

    //Set new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res)
    
})



//@desc     Update user name, email
//@route    PUT /api/v1/auth/updatedetails
//@access   Private
const updateDetails = asyncHandler(async (req, res, next) => {

    const user = await Users.findByIdAndUpdate(req.user.id, {name: req.body.name, email: req.body.email}, {new: true, runValidators: true});

    res.status(200).json({success: true, data: user})
    
})


//@desc     Update password
//@route    PUT /api/v1/auth/updatepassword
//@access   Private
const updatePassword = asyncHandler(async (req, res, next) => {
    
    const user = await Users.findById(req.user.id).select('+password');

    //Check current password
    if(!user.matchPassword(req.body.currentpassword)){
        return next(new ErrorResponse('Password is incorrect', 401))
    }

    user.password = req.body.newpassword

    //Save the pssword to database
    await user.save()

    sendTokenResponse(user, 200, res)
    
})


//@desc     Log out /clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
const logout = asyncHandler(async (req, res, next) => {
    res.cookie('cookie','none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    
    res.status(200).json({success: true, data: []})
})



//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignJwtToken();
    const options = { 
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res.status(statusCode).cookie('cookie', token, options).json({success: true, data_token: token}) //cookie is the name of cookie

}


module.exports = { register, login, getMe, forgotpassword, resetPassword, updateDetails, updatePassword, logout }