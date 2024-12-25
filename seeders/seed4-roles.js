
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
  {
    "id": 1,
    "name": "Пользователь",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 2,
    "name": "Автор",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
      {
        "id": 3,
        "name": "Автор ИП",
        "createdAt": new Date(),
        "updatedAt": new Date()
      }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
