'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('group_tags', [
            {
                "id": 1,
                "name": "Путешествия",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {

                "id": 2,
                "name": "Экономика",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 3,
                "name": "Образование и саморазвитие",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 4,
                "name": "Бизнес",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 5,
                "name": "Новости",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 6,
                "name": "Блог",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 7,
                "name": "Фолк",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 8,
                "name": "Фонк",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 9,
                "name": "Гармония",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 10,
                "name": "Техника",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 11,
                "name": "Музыка",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 12,
                "name": "Фильмы",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 13,
                "name": "Театр",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 14,
                "name": "Знаменитости",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 15,
                "name": "Политика",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('group_tags', null, {});
    }
};
