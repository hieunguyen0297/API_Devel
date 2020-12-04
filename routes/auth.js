const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotpassword, resetPassword, updateDetails, updatePassword, logout } = require('../controllers/controllerAuth')
const {protect} = require('../middleware/authProtect')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/me').get(protect, getMe)
router.route('/forgotpassword').post(forgotpassword)
router.route('/resetpassword/:resettoken').post(resetPassword)
router.route('/updatedetails').put(protect, updateDetails)
router.route('/updatepassword').put(protect, updatePassword)
router.get('/logout', logout )

module.exports = router

