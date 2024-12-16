
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert('baskets', [
//
// ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('baskets', null, {});
  }
};
