'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'status_string', {
      type: Sequelize.STRING,
    });

  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('transactions', 'status_string');

  }
};
