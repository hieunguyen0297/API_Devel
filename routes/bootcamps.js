const { Router } = require('express');
const express = require('express');
const router = express.Router()
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/controllerBootcamps')
const Bootcamp = require('../models/Bootcamp')
const {advancedResults} = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/authProtect')

//Re-route
router.use('/:bootcampId/courses', require('./courses'))
router.use('/:bootcampId/reviews', require('./reviews'))

//wherever we put protect, user has to log in
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id').get(getBootcamp).put(protect,  authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router