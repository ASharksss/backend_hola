const Router = require('express')
const router = new Router()
const tagController = require('../controller/tagController')

router.post('/createTagGroup', tagController.createTagGroup)
router.post('/createTag', tagController.createTag)


module.exports = router