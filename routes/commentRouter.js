const Router = require('express')
const router = new Router()
const commentController  = require('../controller/commentController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/commentPublication', isAuthorized, commentController.commentPublication)
router.post('/commentLike', isAuthorized, commentController.commentLike)

module.exports = router