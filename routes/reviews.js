const express = require('express');
const router = express.Router({mergeParams: true});
const { advancedResults } = require('../middleware/advancedResults')
const { getReviews, getReview, addReview, updateReview, deleteReview } = require('../controllers/RevewController')
const Review = require('../models/Review');
const { populate, deleteMany } = require('../models/Review');
const { protect, authorize } = require('../middleware/authProtect')

router.route('/').get(advancedResults(Review, {path: 'bootcamp', select: 'name'}), getReviews).post(protect,authorize('user', 'admin'), addReview)
router.route('/:id').get(getReview).put(protect, updateReview).delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router