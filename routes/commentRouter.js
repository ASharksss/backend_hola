const Router = require('express')
const router = new Router()
const commentController  = require('../controller/commentController')
const {isAuthorized} = require("../middleware/authMiddleware");
const userController = require("../controller/userController");

router.post('/commentPublication', isAuthorized, commentController.commentPublication)
router.post('/commentLike', isAuthorized, commentController.commentLike)
router.post('/reportComment', isAuthorized, commentController.reportComment)

router.get('/getComments/:id', isAuthorized, commentController.getComments)

router.delete('/deleteComment', isAuthorized, commentController.deleteComment)




module.exports = router