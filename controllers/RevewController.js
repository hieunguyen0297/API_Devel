const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Users = require('../models/Users')
const Bootcamp = require('../models/Bootcamp')
const Review = require('../models/Review')



//@desc     Get Review
//@route    GET /api/v1/reviews
//@route    GET /api/v1/:bootcampId/reviews
//@access   Private
exports.getReviews = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId){
        const reviews = await Review.find({ bootcamp : req.params.bootcampId })
        res.status(200).json({success: true, count: reviews.length, data: reviews})
    }else{
        res.status(200).json(res.advancedResults)
    }
})


//@desc     Get single review
//@route    GET /api/v1/reviews/:id
//@access   Private
exports.getReview = asyncHandler(async (req, res, next) => {
   const review = await Review.findById(req.params.id).populate({
       path: 'bootcamp',
       select: 'name description' //dont need to populate the id// it is automatic populate
   })

   if(!review){
       return next(new ErrorResponse(`There is no review with the ID of ${req.params.id}`, 404))
   }

   res.status(200).json({success: true, data: review})
})



//@desc     Add review
//@route    GET /api/v1/:bootcampId/reviews
//@access   Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`There is not bootcamp with the ID of ${req.params.bootcampId}`,404))
    }

    const review = await Review.create(req.body)
    res.status(200).json({success: true, data: review})
})
 


//@desc     Update review
//@route    PUT /api/v1/reviews/:id
//@access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    
    let review = await Review.findById(req.params.id)
 
    if(!review){
        return next(new ErrorResponse(`There is no review with ID of ${req.params.id}`, 404))
    }

    if(review.user.toString() !== req.user.id){
        return next(new ErrorResponse(`You are not authorized to update this review`, 401))        
    }

    review = await Review.findByIdAndUpdate(req.params.id, { title: req.body.title, text: req.body.text, rating: req.body.rating }, {new: true, runValidators: true})

    res.status(200).json({success: true, data: review})
 })


//@desc     Delete review
//@route    DELETE /api/v1/reviews/:id
//@access   Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    
    let review = await Review.findById(req.params.id)
 
    if(!review){
        return next(new ErrorResponse(`There is no review with ID of ${req.params.id}`, 404))
    }

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`You are not authorized to delete this review`, 401))        
    }

    review = await Review.findByIdAndDelete(req.params.id)

    res.status(200).json({success: true, data: [] })
 })