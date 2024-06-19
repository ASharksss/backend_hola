const Router = require('express')
const router = new Router()
const userController = require('../controller/userController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/createUserInterests', isAuthorized, userController.createUserInterests)
router.post('/createAuthorTags', isAuthorized, userController.createAuthorTags)
router.post('/subscribe', isAuthorized, userController.subscribe)

module.exports = router