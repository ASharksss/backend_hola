
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert('userssocialmedia', [
//
// ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('userssocialmedia', null, {});
  }
};
