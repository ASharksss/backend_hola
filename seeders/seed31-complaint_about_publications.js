
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert('complaint_about_publications', [
//
// ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('complaint_about_publications', null, {});
  }
};
