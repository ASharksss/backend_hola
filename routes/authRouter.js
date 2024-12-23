const Router = require('express')
const router = new Router()
const authController = require('../controller/authController')

router.post('/reset', authController.resetPassword) // RETURN TOKEN
router.post('/check', authController.checkME) // ГДЕ СОХРАНЯТЬ?
router.post('/reset/newPassword', authController.setNewPassword)

router.post('/registration', authController.registration)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/login/access-token', authController.loginToAccessToken)

module.exports = router