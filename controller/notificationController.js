const {Notification} = require("../models/models");

class NotificationController {
    async connected(req, res) {

        const token = req.query.token;
        console.log('-------------------------------------------------TOKEN' , token);

        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');

        let i = 0;
        let timer = setInterval(write, 100000);

        function write() {
            return res.write(`data: ${i}\n\n`);
        }
    }

    async read(req, res) {
        try {
            const userId = req.userId
            // Находим все непрочитанные уведомления для текущего пользователя
            const notifications = await Notification.findAll({
                where: {
                    userId,
                    // read: false // Получаем только непрочитанные уведомления
                }
            });
            // Возвращаем список всех уведомлений (уже отмеченных как прочитанные)
            const notificationIds = notifications.map(notification => notification.id);
            if (notificationIds.length > 0) {
                await Notification.update(
                    {read: true}, // Устанавливаем флаг isRead в true
                    {where: {id: notificationIds}} // Обновляем только уведомления с указанными идентификаторами
                );
            }
            return res.status(200).json({message: 'notification read'});

        } catch (e) {
            return res.status(500).json({error: e.message})
        }

    }
}

module.exports = new NotificationController();