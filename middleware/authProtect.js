const jwt = require('jsonwebtoken');
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const Users = require('../models/Users')


//Protect route
exports.protect = asyncHandler(async function(req, res, next) {
    let token;

    //Check header and get the token
    if(req.headers.authorization  &&  req.headers.authorization.startsWith('Bearer')){
        //Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    //Set token from cookies
    else if(req.cookies.cookie){ 
        token = req.cookies.cookie //cookie is name of the cookie
    }

    //Make sure token exists
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }

    try{
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)

        //after verify, that set req.user = verify jwt id / be able to get user or do anything else
        req.user = await Users.findById(decoded.id)
        
        next()

    }catch (err){
        next(err)
    }

})

//Grant access to specific role
exports.authorize =  ( ...roles ) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
        }
        next()
    }
}