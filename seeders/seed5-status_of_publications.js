
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('status_of_publications', [
  {
    "id": 1,
    "name": "Ожидает проверки",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('status_of_publications', null, {});
  }
};
