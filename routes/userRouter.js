const Router = require('express')
const router = new Router()
const userController = require('../controller/userController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/createUserInterests', isAuthorized, userController.createUserInterests)     // <-- USER INTERESTING POST
router.post('/updateAuthorInterests', isAuthorized, userController.updateAuthorInterests) // <-- AUTHOR INTERESTING POST

router.post('/createAuthorTags', isAuthorized, userController.createAuthorTags)
router.post('/subscribe', isAuthorized, userController.subscribe)
router.post('/createUsersSocialMedia', isAuthorized, userController.createUsersSocialMedia)
router.post('/createAboutMe', isAuthorized, userController.createAboutMe)
router.post('/takeAvatar', isAuthorized, userController.takeAvatar)
router.post('/takeCover', isAuthorized, userController.takeCover)
router.post('/toggleNotifications', isAuthorized, userController.toggleNotifications)
router.post('/createContract', isAuthorized, userController.createContract)

router.get('/getAvatar', isAuthorized, userController.getAvatar)
router.get('/getProfileCover', isAuthorized, userController.getProfileCover)
router.get('/getSubscribers', isAuthorized, userController.getSubscribers)
router.get('/getMySubscriptions', isAuthorized, userController.getMySubscriptions)
router.get('/getUser', isAuthorized, userController.getUser)

router.get('/getNotifications', isAuthorized, userController.getNotifications)         // <-- NOTIFICATIONS
router.get('/getNotificationCount', isAuthorized, userController.getNotificationCount) // <-- NOTIFICATIONS

router.get('/getUserInterests', isAuthorized, userController.getUserInterests)     // <-- USER INTERESTING GET
router.get('/getAuthorInterests', isAuthorized, userController.getAuthorInterests) // <-- USER INTERESTING GET

router.get('/getAuthorTags', isAuthorized, userController.getAuthorTags)
router.get('/getRecommendedAuthors', isAuthorized, userController.getRecommendedAuthors)
router.get('/getReasonForComplaint', isAuthorized, userController.getReasonForComplaint)

router.put('/updateUser', isAuthorized, userController.updateUser)
router.put('/updatePassword', isAuthorized, userController.updatePassword)

module.exports = router