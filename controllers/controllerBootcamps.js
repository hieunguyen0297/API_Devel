const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const { query, json } = require('express')
const path = require('path')




//@desc     Get all bootcamps
//@route    Get /api/v1/bootcamps
//@access   Public
const getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults)  
    
})


//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/id
//@access   Public
const getBootcamp = asyncHandler(async (req, res, next) => {
        
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        next(new ErrorResponse(`Bootcamp not found with the ID of ${req.params.id}`, 404))
    }else{
        res.status(200).json({success: true, data: bootcamp})
    }  
                
})



//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private
const createBootcamp = asyncHandler(async (req, res, next) => {
    //Add user to req.body
    req.body.user = req.user.id

    //Find publisher of bootcamp from Bootcamp model; find all bootcamp by this user
    const publishedBootcamp = await Bootcamp.findOne({ user : req.user.id })

    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)

    res.status(201).json({
        uccess: true,
        data: bootcamp
    });
  
});


//@desc     Update  bootcamp
//@route    PUT /api/v1/bootcamps/id
//@access   Private
const updateBootcamp = asyncHandler(async (req, res, next) => {
   
    let bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with the ID of ${req.params.id}`, 404))
    }

    
    //Make sure current login user is the owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} is not authorized to update this bootcamp`, 401))
    }

    //Update the bootcamp
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    })

    res.status(200).json({success: true, data: bootcamp})
    
})


//@desc     Delete single bootcamp
//@route    DELETE /api/v1/bootcamps/id
//@access   Private
const deleteBootcamp = asyncHandler(async (req, res, next) => {
    
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with the ID of ${req.params.id}`, 404))
    }

    //Make sure current login user is the owner to be able to delete
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} is not authorized to delete this bootcamp`, 401))
    }

    //trigger the middleware to remove the bootcamp
    bootcamp.remove()

    res.status(200).json({success: true, data: []})
})


//Get bootcamps within radius
//Route : /api/v1/bootcamps/radius/:zipcode/:distance
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    //get the values of params
    const { zipcode, distance } = req.params;

    //Get latitude/longtitude from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calculate radius using radians
    //Divide distance by radius of Earth
    //Earth radius = 3963 miles
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
       location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } } //centerSphere mongoDB
    })

    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})
})


//@desc     Upload photo for bootcamp
//@route    Put /api/v1/bootcamps/:id/photo
//@access   Private 
const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with the ID of ${req.params.id}`, 404))
    }

    //Make sure current login user is the owner to be able to delete
    if(bootcamp.user !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} is not authorized to upload photo`, 401))
    }

    //Check to see if there is a upload file
    if(!req.files){
        return next(new ErrorResponse('Please upload a photo', 400))
    }

    const file = req.files.file;
    console.log(req.files)
    //Make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse('Please upload an image file', 400))
    }

    //Check file size
    if(!file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    //Create file custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    //Move the file // upload the file path
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        //Insert the filename into database
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
        res.status(200).json({success: true, data: file.name})
    })

    console.log(file.name)

})


module.exports = {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload}