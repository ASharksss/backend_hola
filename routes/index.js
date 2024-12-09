const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const publicationRouter = require('./publicationRouter')
const commentRouter = require('./commentRouter')
const tagRouter = require('./tagRouter')
const authRouter = require('./authRouter')
const searchRouter = require('./searchRouter')

router.use('/user', userRouter)
router.use('/publication', publicationRouter)
router.use('/comment', commentRouter)
router.use('/tag', tagRouter)
router.use('/auth', authRouter)
router.use('/search', searchRouter)

module.exports = router