
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('creative_tags', [
      {
        id: 1,
        name: "Путешествия по России",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 1
      },
      {
        id: 2,
        name: "Мировые путешествия",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 1
      },
      {
        id: 3,
        name: "Финансовые рынки",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 2
      },
      {
        id: 4,
        name: "Личная экономика",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 2
      },
      {
        id: 5,
        name: "Онлайн-курсы",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 3
      },
      {
        id: 6,
        name: "Книги для саморазвития",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 3
      },
      {
        id: 7,
        name: "Малый бизнес",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 4
      },
      {
        id: 8,
        name: "Стартапы",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 4
      },
      {
        id: 9,
        name: "Местные новости",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 5
      },
      {
        id: 10,
        name: "Мировые новости",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 5
      },
      {
        id: 11,
        name: "Личные блоги",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 6
      },
      {
        id: 12,
        name: "Профессиональные блоги",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 6
      },
      {
        id: 13,
        name: "Традиционная музыка",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 7
      },
      {
        id: 14,
        name: "Традиционные танцы",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 7
      },
      {
        id: 15,
        name: "Гармония природы",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 9
      },
      {
        id: 16,
        name: "Гармония в жизни",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 9
      },
      {
        id: 17,
        name: "Современные технологии",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 10
      },
      {
        id: 18,
        name: "Технические инновации",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 10
      },
      {
        id: 19,
        name: "Классическая музыка",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 11
      },
      {
        id: 20,
        name: "Современная музыка",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 11
      },
      {
        id: 21,
        name: "Популярные фильмы",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 12
      },
      {
        id: 22,
        name: "Артхаус",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 12
      },
      {
        id: 23,
        name: "Классический театр",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 13
      },
      {
        id: 24,
        name: "Современный театр",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 13
      },
      {
        id: 25,
        name: "Новости о звездах",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 14
      },
      {
        id: 26,
        name: "Скандалы знаменитостей",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 14
      },
      {
        id: 27,
        name: "Мировая политика",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 15
      },
      {
        id: 28,
        name: "Локальная политика",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 15
      }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('creative_tags', null, {});
  }
};
