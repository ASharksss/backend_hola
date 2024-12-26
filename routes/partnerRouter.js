const Router = require('express')
const router = new Router()
const PartnerController = require('../controller/partnerController')

const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/add', isAuthorized, PartnerController.createPartner)
router.get('/get', isAuthorized, PartnerController.getPartnerData)




module.exports = router