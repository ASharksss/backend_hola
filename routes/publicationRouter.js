const Router = require('express')
const router = new Router()
const publicationController = require('../controller/publicationController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/createPublication', isAuthorized, publicationController.createPublication)

module.exports = router