const Router = require('express')
const router = new Router()
const TransactionController = require('../controller/transactionController')

const {isAuthorized} = require("../middleware/authMiddleware");

// router.post('/transaction', isAuthorized, TransactionController.createTransaction)
// router.post('/transaction/temp', isAuthorized, TransactionController.answFromRobo)

router.get('/transaction', isAuthorized, TransactionController.payAd)
router.get('/success', TransactionController.success)
router.get('/error', TransactionController.error)

module.exports = router