const Router = require('express')
const router = new Router()
const publicationController = require('../controller/publicationController')
const {isAuthorized} = require("../middleware/authMiddleware");

router.put('/deletePublication', isAuthorized, publicationController.deletePublication)
router.put('/editPublication/:id', isAuthorized, publicationController.editPublication)
router.put('/editFolder', isAuthorized, publicationController.editFolder)
router.post('/createPublication', isAuthorized, publicationController.createPublication) // <-- CREATE PUBLICATION | AND | CREATE AUTHOR RECOMMENDATIONS
router.post('/likePublication', isAuthorized, publicationController.likePublication)
router.post('/createFolder', isAuthorized, publicationController.createFolder)
router.post('/putPublicationInFolder', isAuthorized, publicationController.putPublicationInFolder)
// router.post('/buyPublication', isAuthorized, publicationController.buyPublication)
router.post('/putPublicationInBasket', isAuthorized, publicationController.putPublicationInBasket)

router.post('/reportPublication', isAuthorized, publicationController.reportPublication)

router.post('/addToFavorites', isAuthorized, publicationController.addToFavorites)
router.get('/getUserPublications', isAuthorized, publicationController.getUserPublications)
router.get('/getPublication/:id', isAuthorized, publicationController.getPublication)
router.get('/getPublicationsInFolder', isAuthorized, publicationController.getPublicationsInFolder)
router.get('/getUserFolders', isAuthorized, publicationController.getUserFolders)
router.get('/getMainPublications', isAuthorized, publicationController.getMainPublications)
router.get('/getBasket', isAuthorized, publicationController.getBasket)
router.get('/getSimilarPublications/:id', isAuthorized, publicationController.getSimilarPublications)
router.delete('/deletePublicationInFolder', isAuthorized, publicationController.deletePublicationInFolder)
router.delete('/deleteFolder', isAuthorized, publicationController.deleteFolder)
router.delete('/deleteBasketItem', isAuthorized, publicationController.deleteItemFromBasket)



module.exports = router