const {Publication, Folder_of_publication, User,  File} = require("../models/models");
const { Op } = require('sequelize');
class SearchController {
    async searchByAll(req, res) {
        try {
            const text  = req.query.text;  // Используем параметр limit, по умолчанию 10
            const limit = 5;
            // Выполняем поиск по публикациям
            const publications = await Publication.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${text}%` } },  // Поиск по названию
                        { description: { [Op.like]: `%${text}%` } }  // Поиск по описанию
                    ],
                },
                limit
            });

            // Выполняем поиск по папкам
            const folders = await Folder_of_publication.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${text}%` } },  // Поиск по имени папки
                        { description: { [Op.like]: `%${text}%` } }  // Поиск по описанию папки
                    ],
                },
                limit
            });

            // Выполняем поиск по пользователям, фильтруя по roleId = 2 и тексту
            const users = await User.findAll({
                where: {
                    roleId: 2,  // Фильтрация по роли
                    [Op.or]: [
                        { nickname: { [Op.like]: `%${text}%` } },  // Поиск по никнейму
                        { aboutMe: { [Op.like]: `%${text}%` } }  // Поиск по информации о себе
                    ]
                },
                attributes: ['nickname', 'id'],
                limit,
                include: [
                    {model: File, where:{ typeFileId: 3}, attributes: ['url']},
                ]
            });

            // Формируем ответ, чтобы вернуть найденные данные
            return res.json({
                publications,
                folders,
                users
            });

        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
}

module.exports = new SearchController();
