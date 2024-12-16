
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('type_notifications', [
  {
    "id": 1,
    "text": "На странице {nickname} новый пост {title}",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 2,
    "text": "{nickname} подписался на вас",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 3,
    "text": "{nickname} понравился Ваш комментарий",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 4,
    "text": "{nickname} ответил на Ваш комментарий",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 5,
    "text": "{nickname} подписался на Вас",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 6,
    "text": "{nickname} удаляет пост {title}, успейте посмотреть его",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 7,
    "text": "{nickname} приобрел Ваш пост {title}",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('type_notifications', null, {});
  }
};
