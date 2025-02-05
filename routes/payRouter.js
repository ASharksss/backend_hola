const Router = require('express')
const router = new Router()
const TransactionController = require('../controller/transactionController')

const {isAuthorized} = require("../middleware/authMiddleware");

router.post('/transaction', isAuthorized, TransactionController.createTransaction)
router.post('/transaction/temp', isAuthorized, TransactionController.answFromRobo)


module.exports = router