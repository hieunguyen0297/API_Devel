const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

//@desc     Get all bootcamps
//@route    Get /api/v1/bootcamps
//@access   Public
const getBootcamps = asyncHandler(async (req, res, next) => {
  
        const bootcamps = await Bootcamp.find()
        res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})  
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
   
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    })
    if(!bootcamp){
        next(new ErrorResponse(`Bootcamp not found with the ID of ${req.params.id}`, 404))
    }else{
        res.status(200).json({success: true, data: bootcamp})
    }

})


//@desc     Delete single bootcamp
//@route    DELETE /api/v1/bootcamps/id
//@access   Private
const deleteBootcamp = asyncHandler(async (req, res, next) => {
    
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if(!bootcamp){
        next(new ErrorResponse(`Bootcamp not found with the ID of ${req.params.id}`, 404))
    }else{
        res.status(200).json({success: true, msg: `Item with ID of ${req.params.id} has been deleted`})
    }  
})

module.exports = {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp}