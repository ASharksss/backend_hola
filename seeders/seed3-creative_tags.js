
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('creative_tags', [
      {
        id: 1,
        name: "Путешествия по России",
        file: "/static/Путешествия по России.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 1
      },
      {
        id: 2,
        name: "Мировые путешествия",
        file: "/static/Путешествия по Миру.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 1
      },
      {
        id: 3,
        name: "Финансовые рынки",
        file: "/static/Финансовые рынки.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 2
      },
      {
        id: 4,
        name: "Личный Капитал",
        file: "/static/Личный Капитал.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 2
      },
      {
        id: 5,
        name: "Онлайн-курсы",
        file: "/static/Онлайн-курсы.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 3
      },
      {
        id: 6,
        name: "Публикации для саморазвития",
        file: "/static/Публикации для саморазвития.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 3
      },
      {
        id: 7,
        name: "Малый бизнес",
        file: "/static/Малый бизнес.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 4
      },
      {
        id: 8,
        name: "Стартапы",
        file: "/static/Стартапы.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 4
      },
      {
        id: 9,
        name: "Местные новости",
        file: "/static/Местные новости.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 5
      },
      {
        id: 10,
        name: "Мировые новости",
        file: "/static/Мировые новости.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 5
      },
      {
        id: 11,
        name: "Личные блоги",
        file: "/static/Личные блоги.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 6
      },
      {
        id: 12,
        name: "Профессиональные блоги",
        file: "/static/Профессиональные блоги.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 6
      },
      {
        id: 13,
        name: "Традиционная музыка",
        file: "/static/Традиционная музыка.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 8
      },
      {
        id: 17,
        name: "Современные технологии",
        file: "/static/Современные технологии.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 7
      },
      {
        id: 18,
        name: "Технические инновации",
        file: "/static/Технические инновации.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 7
      },
      {
        id: 19,
        name: "Классическая музыка",
        file: "/static/Классическая музыка.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 8
      },
      {
        id: 20,
        name: "Современная музыка",
        file: "/static/Современная музыка.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 8
      },
      {
        id: 21,
        name: "Популярные фильмы",
        file: "/static/Фильмы.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 9
      },
      {
        id: 22,
        name: "Артхаус",
        file: "/static/Артхаус.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 9
      },
      {
        id: 23,
        name: "Классический театр",
        file: "/static/Классический театр.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 10
      },
      {
        id: 24,
        name: "Современный театр",
        file: "/static/Современный театр.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 10
      },
      {
        id: 27,
        name: "Мировая политика",
        file: "/static/Мировая политика.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 11
      },
      {
        id: 28,
        name: "Локальная политика",
        file: "/static/Локальная политика.png",
        createdAt: new Date(),
        updatedAt: new Date(),
        groupTagId: 11
      }
], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('creative_tags', null, {});
  }
};
