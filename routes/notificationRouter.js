const Router = require("express");
const router = new Router();

const NotificationController = require("../controller/notificationController")
const {isAuthorized} = require("../middleware/authMiddleware");

router.get('/connect', NotificationController.connected);
router.post('/setRead',isAuthorized, NotificationController.read);

module.exports = router;