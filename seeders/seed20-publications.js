
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert('publications', [
//
// ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('publications', null, {});
  }
};
