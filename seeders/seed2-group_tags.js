'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('group_tags', [
            {
                "id": 1,
                "name": "Путешествия",
                "file": "/static/Путешествия.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {

                "id": 2,
                "name": "Экономика",
                "file": "/static/Экономика.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 3,
                "name": "Образование и саморазвитие",
                "file": "/static/Образование.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 4,
                "name": "Бизнес",
                "file": "/static/Бизнес.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 5,
                "name": "Новости",
                "file": "/static/Новости.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 6,
                "name": "Блог",
                "file": "/static/Блог.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 7,
                "name": "Техника",
                "file": "/static/Техника.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 8,
                "name": "Музыка",
                "file": "/static/Музыка.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 9,
                "name": "Фильмы",
                "file": "/static/Фильмы.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 10,
                "name": "Театр",
                "file": "/static/Театр.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
            {
                "id": 11,
                "name": "Политика",
                "file": "/static/Политика.jpg",
                "createdAt": new Date(),
                "updatedAt": new Date()
            },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('group_tags', null, {});
    }
};
