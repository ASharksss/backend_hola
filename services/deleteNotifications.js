const {Op} = require("sequelize");
const {Notification} = require('../models/models');
const cron = require('node-cron');
const deleteNotifications = async () => {
  try {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    const deletedCount = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lte]: twoMonthsAgo
        },
        read: false
      }
    })

    console.log(`Удалено ${deletedCount} старых уведомлений`);
  } catch (e) {
    console.log(e)
  }
}

// Запускаем задачу каждый день в 00.00
cron.schedule('00 00 * * *', deleteNotifications);

module.exports = deleteNotifications;