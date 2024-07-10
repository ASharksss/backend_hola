const Router = require('express')
const router = new Router()
const tagController = require('../controller/tagController')

router.post('/createTagGroup', tagController.createTagGroup)
router.post('/createTag', tagController.createTag)
router.get('/getTagGroup', tagController.getTagGroup)
router.get('/getCreativeTagByGroup', tagController.getCreativeTagByGroup)

module.exports = router