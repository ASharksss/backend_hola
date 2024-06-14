const Router = require('express')
const router = new Router()
const publicationController = require('../controller/publicationController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/createPublication', isAuthorized, publicationController.createPublication)
router.post('/likePublication', isAuthorized, publicationController.likePublication)
router.post('/createFolder', isAuthorized, publicationController.createFolder)
router.post('/putPublicationInFolder', isAuthorized, publicationController.putPublicationInFolder)
router.post('/buyPublication', isAuthorized, publicationController.buyPublication)
router.get('/getMainPublications', isAuthorized, publicationController.getMainPublications)


module.exports = router