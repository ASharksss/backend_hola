
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('type_files', [
  {
    "id": 1,
    "name": "Обложка профиля",
    "createdAt":new Date(),
    "updatedAt":new Date()
  },
  {
    "id": 2,
    "name": "Вложение",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 3,
    "name": "Аватар пользователя",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 4,
    "name": "Обложка публикации",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('type_files', null, {});
  }
};
