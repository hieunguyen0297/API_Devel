const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/AdminController')
const {advancedResults} = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/authProtect')
const Users = require('../models/Users');

router.use(protect)
router.use(authorize('admin'))

router.route('/').get(advancedResults(Users), getUsers).post(createUser)
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router