
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('socialmedia', [
  {
    "id": 1,
    "name": "telegram",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 2,
    "name": "vk",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 3,
    "name": "email",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 4,
    "name": "twitch",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 5,
    "name": "tiktok",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 6,
    "name": "youtube",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": 7,
    "name": "link",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('socialmedia', null, {});
  }
};
