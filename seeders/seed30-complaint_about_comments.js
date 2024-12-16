
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert('complaint_about_comments', [
//
// ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('complaint_about_comments', null, {});
  }
};
