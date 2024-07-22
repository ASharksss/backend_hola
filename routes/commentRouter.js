const Router = require('express')
const router = new Router()
const commentController  = require('../controller/commentController')
const {isAuthorized} = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

router.post('/commentPublication', isAuthorized, commentController.commentPublication)
router.post('/commentLike', isAuthorized, commentController.commentLike)
router.post('/reportComment', isAuthorized, commentController.reportComment)

module.exports = router