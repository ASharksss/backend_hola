'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('age_limits', [
  {
    "id": 1,
    "name": "0+",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('age_limits', null, {});
  }
};
