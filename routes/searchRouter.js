const Router = require('express')
const router = new Router()
const SearchController = require('../controller/searchController')

router.get('/', SearchController.searchByAll)

module.exports = router