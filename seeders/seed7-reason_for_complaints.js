
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('reason_for_complaints', [
  {
    "id": 1,
    "name": "Насилие",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 2,
    "name": "Оскорбление",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reason_for_complaints', null, {});
  }
};
