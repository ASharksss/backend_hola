const Router = require('express')
const router = new Router()
const publicationController = require('../controller/publicationController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/createPublication', isAuthorized, publicationController.createPublication)
router.post('/likePublication', isAuthorized, publicationController.likePublication)


module.exports = router