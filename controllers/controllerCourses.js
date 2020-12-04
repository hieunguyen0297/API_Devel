const Course = require('../models/Course')
const asyncHandler = require('../middleware/async')
const { query } = require('express')
const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp')


//Get all courses /api/v1/courses
// route -> /api/v1/bootcamps/:bootcampId/courses =>  get course that associate with the bootcamp using bootcamp id
const getCourses = asyncHandler(async (req, res, next) => {

    if(req.params.bootcampId){  //inside if dont include await
        const courses = await Course.find({ bootcamp: req.params.bootcampId})

        res.status(200).json({success: true, count: courses.length, data: courses})

    }else {
       res.status(200).json(res.advancedResults)
    }
})

//Get single course need an id
//Route /api/v1/courses/:id

const getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({path: 'bootcamp', select: 'name description'})
    
    if(course){
        res.status(200).json({success: true, data: course})
    }else{
        next( new ErrorResponse('Course not found', 404))
    }
})


//Create a course
//Route GET /api/v1/bootcamps/:bootcampId/courses 
//Whenever a course is created, it will be added to the bootcamp associate with it
//Access           Private

const addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    //Check the bootcamp if is valid  or not
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
      return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404))
    }
    
    //Make sure this is the owner of the bootcamp, so he can add update and delete course
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} is not authorized to add course`, 401))
    }


    const course = await Course.create(req.body)
    res.status(200).json({success: true, data: course})
})


//Update course
//Route  /api/v1/courses/:id
//Access Private 
const updateCourse = asyncHandler(async (req, res, next) => {
    var course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
    }

    //Check if current login user own this course
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} is not authorozed to update this course`, 401))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    })

    res.status(200).json({success: true, data: course})
})


//Delete course
//Route /api/v1/courses/:id
//Access  Private

const deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)

    if(!course) { 
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404))
    }

    //Check if current login user own this course
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with the ID of ${req.user.id} is not authorozed to delete this course`, 401))
    }

    course.remove()
    
    res.status(200).json({success: true, data: `${course.title} has been remove`})
})



module.exports = { getCourses, getCourse, addCourse, updateCourse, deleteCourse }