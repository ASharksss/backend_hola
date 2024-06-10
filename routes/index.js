const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const publicationRouter = require('./publicationRouter')

router.use('/user', userRouter)
router.use('/publication', publicationRouter)

module.exports = router