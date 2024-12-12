const {v4: uuidv4} = require('uuid');
const path = require('path')
const fs = require('fs')
const {
    Publication,
    Publication_tag,
    Attachment,
    File,
    Publication_likes,
    Folder_of_publication,
    Folder_tag,
    Storage_publication,
    Creative_tag,
    Publication_buy,
    User,
    Age_limit,
    Role,
    Status_of_publication,
    Comment,
    User_interest,
    Author_tag,
    Group_tag,
    Publication_block,
    Subscription,
    Type_notification, Complaint_about_publication,
    Notification, Basket, Publication_views, Transaction, Wallet, Favorites
} = require("../models/models");
const {count, findPublicationTags, checkTags} = require('../services/utils')
const {Op} = require("sequelize");

class PublicationController {
    async createPublication(req, res) {
        try {
            const userId = req.userId;
            const role = req.user.roleId;
            const {
                title, description, price,
                ageLimitId, tags,
                blocks, groupTags, creativeTags,
            } = req.body;
            const files = req.files?.file ? (Array.isArray(req.files.file) ? req.files.file : [req.files.file]) : [];
            const cover = req.files?.cover
            let coverName = null
            if (role !== 2) {
                const foundGroupTags = await Group_tag.findAll({
                    where: {
                        id: {
                            [Op.in]: JSON.parse(groupTags),
                        },
                    },
                });

                const groupTagsIds = foundGroupTags.map(tag => tag.id);

                const foundCreativeTags = await Creative_tag.findAll({
                    where: {
                        id: {
                            [Op.in]: JSON.parse(creativeTags),
                        },
                        groupTagId: {
                            [Op.in]: groupTagsIds,
                        },
                    },
                });

                const authorTagsData = foundCreativeTags.map(tag => ({
                    userId,
                    creativeTagId: tag.id,
                }));

                await Author_tag.bulkCreate(authorTagsData);
                await User.update({roleId: 2}, {where: {id: userId}});
                await Wallet.findOrCreate({where: {userId}})
            }

            if (cover) {
                //Прикрепление обложки для публикации
                const coverTypeFile = cover.name.split('.').pop();

                if (coverTypeFile !== 'jpeg' && coverTypeFile !== 'png' && coverTypeFile !== 'jpg') {
                    return res.json('Неподходящее расширение файла для обложки');
                }
                coverName = `${uuidv4()}.${coverTypeFile}`;
                await cover.mv(path.resolve(__dirname, '..', 'static', coverName));
                await File.create({
                    name: coverName,
                    typeFileId: 4,
                    userId,
                    approve: false,
                    url: `/static/${coverName}`
                })
            }

            const publication = await Publication.create({
                title,
                description,
                price,
                ageLimitId,
                userId,
                statusOfPublicationId: 1,
                coverUrl: coverName ? `/static/${coverName}` : null
            });

            const parsedTags = JSON.parse(tags);
            for (const tag of parsedTags) {
                await Publication_tag.create({creativeTagId: tag, publicationId: publication.id});
            }

            const blockArray = JSON.parse(blocks);
            for (const block of blockArray) {
                if (block.type === 'file') {
                    const item = files.find(file => file.name === block.content);
                    if (item) {
                        const typeFile = item.name.split('.').pop();
                        const fileName = `${uuidv4()}.${typeFile}`;

                        await item.mv(path.resolve(__dirname, '..', 'static', fileName));

                        const file = await File.create({
                            name: fileName,
                            typeFileId: 2,
                            userId,
                            approve: false,
                            url: `/static/${fileName}`
                        });

                        await Publication_block.create({
                            type: block.type,
                            text: null,
                            fileId: file.id,
                            publicationId: publication.id,
                        });

                    } else {
                        console.log("Файл не найден для блока:", block.content); // Отладочное сообщение
                    }
                } else if (block.type === 'text') {
                    await Publication_block.create({
                        type: block.type,
                        text: block.content,
                        fileId: null,
                        publicationId: publication.id,
                    });
                }
            }
            //Получаем подписчиков автора
            const subscribers = await Subscription.findAll({
                where: {authorId: userId, onNotification: true},
            })
            //Получаем ids подписчиков
            let subscribersIds = subscribers.map(item => item.userId)
            //Берем nickname автора
            const nickname = await User.findOne({where: {id: userId}, attributes: ['nickname']})
            let notificationText
            //Перебираем подписчиков
            for (let i of subscribersIds) {
                //Берем нужный шаблон для уведомления
                const textTemplate = await Type_notification.findOne({where: {id: 1}})
                //Формируем текст уведомления
                notificationText = textTemplate.text.replace('{nickname}', nickname.nickname).replace('{title}', publication.title)

                await Notification.create({
                    userId: i, notification_text: notificationText, typeNotificationId: 1
                })
            }
            return res.json(notificationText);
        } catch (e) {
            console.error("Ошибка:", e); // Отладочное сообщение
            return res.status(500).json({error: e.message});
        }
    }

    async editPublication(req, res) {
        try {
            const userId = req.userId;
            const publicationId = req.params.id; // Предполагаем, что ID публикации передается как параметр маршрута
            const {
                title, description, price,
                ageLimitId, tags,
                blocks, groupTags, creativeTags,
            } = req.body;
            const files = req.files?.file ? (Array.isArray(req.files.file) ? req.files.file : [req.files.file]) : [];
            const cover = req.files?.cover;
            let coverName = null;

            // Найти существующую публикацию
            const publication = await Publication.findOne({where: {id: publicationId, userId}});
            if (!publication) {
                return res.status(404).json({error: 'Публикация не найдена'});
            }

            // Удаление старой обложки, если новая обложка предоставлена
            if (cover) {
                const coverTypeFile = cover.name.split('.').pop();
                if (coverTypeFile !== 'jpeg' && coverTypeFile !== 'png' && coverTypeFile !== 'jpg') {
                    return res.json('Неподходящее расширение файла для обложки');
                }
                if (publication.coverUrl) {
                    let oldCover = publication.coverUrl.replace('/static/', '');
                    const oldCoverPath = path.resolve(__dirname, '..', 'static', oldCover);
                    console.log(oldCoverPath)
                    fs.unlinkSync(oldCoverPath);
                    await File.destroy({where: {name: oldCover}});
                }
                coverName = `${uuidv4()}.${coverTypeFile}`;
                await cover.mv(path.resolve(__dirname, '..', 'static', coverName));
                await File.create({
                    name: coverName,
                    typeFileId: 4,
                    userId,
                    approve: false,
                    url: `/static/${coverName}`
                });
            }

            // Удаление старых файлов и блоков
            const oldBlocks = await Publication_block.findAll({where: {publicationId}});
            for (const block of oldBlocks) {
                if (block.fileId) {
                    const file = await File.findOne({where: {id: block.fileId}});
                    const filePath = path.resolve(__dirname, '..', 'static', file.name);
                    fs.unlinkSync(filePath);
                    await file.destroy();
                }
                await block.destroy();
            }

            // Обновление публикации
            await publication.update({
                title,
                description,
                price,
                ageLimitId,
                coverUrl: coverName ? `/static/${coverName}` : publication.coverUrl,
            });

            // Удаление старых тегов
            await Publication_tag.destroy({where: {publicationId: publication.id}});

            // Сохранение новых тегов
            const parsedTags = JSON.parse(tags);
            for (const tag of parsedTags) {
                await Publication_tag.create({creativeTagId: tag, publicationId: publication.id});
            }

            // Сохранение новых блоков контента
            const blockArray = JSON.parse(blocks);
            for (const block of blockArray) {
                if (block.type === 'file') {
                    const item = files.find(file => file.name === block.content);
                    if (item) {
                        const typeFile = item.name.split('.').pop();
                        const fileName = `${uuidv4()}.${typeFile}`;

                        await item.mv(path.resolve(__dirname, '..', 'static', fileName));

                        const file = await File.create({
                            name: fileName,
                            typeFileId: 2,
                            userId,
                            approve: false,
                            url: `/static/${fileName}`
                        });

                        await Publication_block.create({
                            type: block.type,
                            text: null,
                            fileId: file.id,
                            publicationId: publication.id,
                        });

                    } else {
                        console.log("Файл не найден для блока:", block.content); // Отладочное сообщение
                    }
                } else if (block.type === 'text') {
                    await Publication_block.create({
                        type: block.type,
                        text: block.content,
                        fileId: null,
                        publicationId: publication.id,
                    });
                }
            }

            // Получение подписчиков автора
            const subscribers = await Subscription.findAll({where: {authorId: userId}});
            const subscribersIds = subscribers.map(item => item.userId);
            const nickname = await User.findOne({where: {id: userId}, attributes: ['nickname']});
            let notificationText;

            // Отправка уведомлений подписчикам
            for (let i of subscribersIds) {
                const textTemplate = await Type_notification.findOne({where: {id: 1}});
                notificationText = textTemplate.text.replace('{nickname}', nickname.nickname).replace('{title}', publication.title);

                await Notification.create({
                    userId: i,
                    notification_text: notificationText,
                    typeNotificationId: 1
                });
            }

            return res.json(notificationText);
        } catch (e) {
            console.error("Ошибка:", e); // Отладочное сообщение
            return res.status(500).json({error: e.message});
        }
    }

    async getUserPublications(req, res) {
        try {
            const {userId} = req.query
            const publications = await Publication.findAll({
                where: {userId},
                include: {
                    model: Publication_tag,
                    attributes: ['creativeTagId'],
                    required: false,
                }
            });

            const currentDate = new Date();

            const filteredAndReversedPublications = publications
                .filter(publication => {
                    const dateOfDelete = publication.date_of_delete;
                    return !dateOfDelete || new Date(dateOfDelete) <= currentDate;
                })
                .reverse();

            return res.json(publications)
            // return res.json(filteredAndReversedPublications)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getMainPublications(req, res) {
        try {
            const userId = req.userId
            /*
            group принимает:
            main(без фильтров, по интересам), subscriptions(подписки), likes(понравившееся),
            discussed(комменты), available (покупки), popular (популярное)
            */
            const {group = 'main', creative_tags} = req.query
            let publications = []
            let publicationsArray
            let tags = []
            let publicationIds
            switch (group) {
                case 'main':
                    // Находим все creativeTagIds, которые интересуют пользователя
                    const userInterests = await User_interest.findAll({
                        where: {userId: userId},
                        attributes: ['creativeTagId']
                    });

                    const userCreativeTagIds = userInterests.map(interest => interest.creativeTagId);

                    // Преобразование тегов из запроса в числа с проверкой на корректность
                    let filterCreativeTagIds = userCreativeTagIds;

                    if (creative_tags) {
                        const queryTags = Array.isArray(creative_tags) ? creative_tags.map(tag => parseInt(tag, 10)).filter(tag => !isNaN(tag)) : [parseInt(creative_tags, 10)].filter(tag => !isNaN(tag));
                        filterCreativeTagIds = queryTags.length > 0 ? queryTags : userCreativeTagIds;
                    }

                    // Находим все публикации, которые имеют указанные creativeTagIds
                    publications = await Publication.findAll({
                        include: [{
                            model: Publication_tag,
                            where: {
                                creativeTagId: {
                                    [Op.in]: filterCreativeTagIds
                                }
                            },
                            attributes: [],
                        },
                            {
                                model: User, attributes: ['nickname'],
                                include: {
                                    model: File,
                                    where: {typeFileId: 3,},
                                    required: false
                                }
                            },
                            {
                                model: Publication_buy,
                                where: {userId}, // Фильтр по текущему пользователю
                                attributes: ['userId', 'publicationId'],
                                required: false // Разрешаем LEFT JOIN, чтобы включить все публикации
                            }
                        ],
                    });

                    publications = publications.map(publication => {
                        let plainPublication = publication.toJSON(); // Преобразуем в plain object
                        // Проверяем наличие покупок
                        plainPublication.isAvialable = plainPublication.publication_buys.length > 0 || plainPublication.price === 0;
                        return plainPublication;
                    });

                    break;
                case 'subscriptions':
                    let subscriptions = await Subscription.findAll({where: {userId}})
                    let authorsIds = await subscriptions.map(item => item.authorId)
                    publications = await Publication.findAll({
                        where: {
                            userId: {
                                [Op.in]: authorsIds
                            }
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ],
                        include: [
                            {
                                model: Publication_buy,
                                where: {userId},
                                attributes: ['userId', 'publicationId'],
                                required: false
                            }
                        ]
                    })
                    publications = publications.map(publication => {
                        let plainPublication = publication.toJSON(); // Преобразуем в plain object
                        // Проверяем наличие покупок
                        plainPublication.isAvialable = plainPublication.publication_buys.length > 0 || plainPublication.price === 0;
                        return plainPublication;
                    });
                    break;
                case 'likes':
                    //Вызов лайкнутых пользователем публикации
                    publicationsArray = await Publication_likes.findAll({
                        where: {userId},
                        attributes: ['publicationId', 'userId'],
                        include: {
                            model: Publication,
                            attributes: ['id', 'title', 'description', 'price', 'date_of_delete', 'createdAt',],
                            include: [
                                {model: User, attributes: ['id', 'nickname',]},
                                {model: Age_limit, attributes: ['name']},
                                {model: Attachment, include: {model: File}}
                            ]
                        },
                    })

                    //Вызов тэгов, привязанных к публикациям
                    await findPublicationTags(publicationsArray, tags)
                    //Фильтрация по тэгам
                    if (creative_tags) {
                        checkTags(creative_tags, tags, publications, publicationsArray)
                    } else {
                        publications = publicationsArray
                    }
                    break;
                case 'popular':
                    //Получаем инфу о лайках
                    publicationsArray = await Publication_likes.findAll()
                    //Считаем количество лайков у каждого объявления
                    let likes = count(publicationsArray)
                    // Преобразуем объект в массив пар [key, value]
                    const entries = Object.entries(likes);
                    // Сортируем массив по значениям от большего к меньшему
                    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
                    //Достаем ключи
                    const keys = sortedEntries.map(pair => pair[0])
                    //Находим по ключам объявления
                    for (const item of keys) {
                        let candidate = await Publication.findOne({
                            where: {id: item},
                            include: {model: Attachment, include: {model: File}}
                        })
                        if (creative_tags) {
                            for (let i = 0; i < creative_tags.length; i++) {
                                let addedTag = await Publication_tag.findAll({
                                    where: {publicationId: item, creativeTagId: creative_tags[i]}
                                })
                                addedTag.map(t => {
                                    publications.push(candidate)
                                })
                            }
                        } else {
                            publications.push(candidate)
                        }
                    }

                    break;
                case 'discussed':
                    publicationsArray = await Comment.findAll({
                        include: {model: Publication}
                    })
                    publicationIds = publicationsArray.map(item => item.publicationId);

                    // Подсчитываем количество повторений каждого значения
                    const countMap = publicationIds.reduce((acc, id) => {
                        acc[id] = (acc[id] || 0) + 1;
                        return acc;
                    }, {});

                    // Преобразуем объект в массив пар [ключ, значение]
                    const sortedCountArray = Object.entries(countMap)
                        .sort((a, b) => b[1] - a[1]); // Сортируем по значению в порядке убывания

                    // Извлекаем ключи из отсортированного массива
                    const sortedKeys = sortedCountArray.map(item => item[0]);

                    //Если есть тэги
                    if (creative_tags) {
                        for (let i = 0; i < creative_tags.length; i++) {//Перебираем массив тэгов
                            for (const item of sortedKeys) {
                                //Находим по тэгам объявления
                                let tag = await Publication_tag.findOne({
                                    where: {
                                        publicationId: item,
                                        creativeTagId: parseInt(creative_tags[i])
                                    }
                                })
                                //Если нашли добавляем пост в общий массив
                                if (tag) {
                                    const post = await Publication.findOne({where: {id: tag.publicationId}})
                                    if (post) {
                                        publications.push(post)
                                    }
                                }
                            }
                        }
                        //Убираем дубликаты
                        publications = Array.from(new Set(publications.map(p => p.id)))
                            .map(id => {
                                return publications.find(p => p.id === id);
                            });

                    } else {
                        for (const item of sortedKeys) {
                            const candidate = await Publication.findOne({where: {id: item}});
                            publications.push(candidate);
                        }
                    }

                    break;
                case 'available':
                    publicationsArray = await Publication_buy.findAll({
                        where: {userId},
                        include: {
                            model: Publication, include: [
                                {
                                    model: User,
                                    attributes: ['id', 'nickname', 'roleId'],
                                    include: [{model: Role, attributes: ['id', 'name']}]
                                },
                                {model: Age_limit, attributes: ['id', 'name']},
                                {model: Status_of_publication, attributes: ['name']},
                                {model: Attachment, include: {model: File}}
                            ]
                        }
                    })
                    if (creative_tags) {
                        for (const item of publicationsArray) {
                            const publicationTags = await Publication_tag.findAll({
                                where: {publicationId: item.publication.id},
                                attributes: ['publicationId', 'creativeTagId'],
                                include: [
                                    {model: Creative_tag, attributes: ['name']},
                                ]
                            });
                            tags.push(...publicationTags);

                            for (let i = 0; i < creative_tags.length; i++) { // перебор выбранных тэгов
                                tags.map(item => { // перебор тэгов найденных по публикациям
                                    if (item.creativeTagId === parseInt(creative_tags[i])) { // если есть совпадения
                                        publicationsArray.map(publication => { // добавление в общий массив
                                            if (publication.publicationId === item.publicationId) {
                                                publications.push(publication)
                                            }
                                        })
                                    }
                                })
                            }

                        }
                        const uniqueNames = new Set(publications)
                        publications = Array.from(uniqueNames)
                    } else {
                        publications = publicationsArray
                    }
                    break;
            }

            const currentDate = new Date();

            const filteredAndReversedPublications = publications
                .filter(publication => {
                    const dateOfDelete = publication.date_of_delete;
                    return !dateOfDelete || new Date(dateOfDelete) <= currentDate;
                })
                .reverse();

            // console.log(filteredAndReversedPublications);


            // return res.json(publications.reverse())
            return res.json(filteredAndReversedPublications)
        } catch (e) {
            console.log(e)
            return res.status(500).json({error: e.message});
        }
    }

    async getPublicationsInFolder(req, res) {
        try {
            const {folderId} = req.query
            const userId = req.userId
            const publications = await Publication.findAll({
                include: [
                    {
                        model: Storage_publication,
                        required: true, // Используем inner join, чтобы получить только соответствующие записи
                        where: {folderOfPublicationId: folderId}
                    },
                    {
                        model: Publication_buy,
                        required: false,
                        where: {userId},
                        attributes: ['userId'] // Указываем атрибуты, чтобы Sequelize не генерировал SELECT *
                    }
                ],
                raw: true // Возвращаем данные как plain JSON objects
            });

            const folder = await Folder_of_publication.findByPk(folderId)


            // Добавляем маркер isPurchased в каждую публикацию
            publications.forEach(pub => {
                pub.isPurchased = !!pub['Publication_buys.userId']; // Преобразуем userId в boolean
                delete pub['Publication_buys.userId']; // Удаляем лишний атрибут из итогового объекта
            });

            const result = {
                name: folder.name,
                description: folder.description,
                data: publications,
            }


            res.json(result)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getPublication(req, res) {
        try {
            const userId = req.userId
            const id = req.params.id


            let publication,
                purchase,
                isBought,
                publicationJSON,
                userAvatar,
                isLiked,
                isFavorite,
                errorMessages= [];

            publication = await Publication.findOne({
                where: {id},
                include: [{
                    model: Publication_block, include: {model: File}
                }, {
                    model: User,
                    attributes: ['id', 'nickname'],
                }]
            })



            if (!publication) {
                return res.status(404).json({success: false, isBought: false, message: 'Publication not found'});
            }else{
                publicationJSON = publication.toJSON();
            }

            purchase = await Publication_buy.findOne({where: {userId, publicationId: id}})
            // isBought = purchase || publication.price === 0; // потом
            isBought = true; // test

            if(!isBought){
                return res.status(200).json({success: true, isBought: false, message: 'Сначала приобретите публикацию'});
            }

            isLiked = await Publication_likes.findOne({where: {userId, publicationId: id}})
            publicationJSON.user.isLiked = Boolean(isLiked);

            isFavorite = await Favorites.findOne({where: {userId, publicationId: id}})
            publicationJSON.user.isFavorite = Boolean(isFavorite);

            userAvatar = await File.findOne({where: {userId: publication.userId, typeFileId: 3}})
            userAvatar ? publicationJSON.user.avatarUrl = `/static/${userAvatar?.name}` : null;

            const [view, created] = await Publication_views.findOrCreate({where: {userId, publicationId: id}})

            if (created) {
                // Если запись была создана, увеличиваем views в таблице Publication
                const publication = await Publication.findByPk(id)
                if (publication) {
                    await publication.increment('views_count');
                }
            }

            // Преобразование данных для включения полного пути к файлам
            publicationJSON.publication_blocks = publicationJSON.publication_blocks.map(block => {
                if (block.file) {
                    block.file.url = `/static/${block.file.name}`;
                }
                return block;
            });

            return res.json(publicationJSON);

        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async deletePublication(req, res) {
        try {
            const userId = req.userId
            const author = req.user
            const {publicationId} = req.body
            const today = new Date()
            const newDateOfDelete = new Date(today);
            newDateOfDelete.setDate(today.getDate() + 14);
            const publication = await Publication.findByPk(publicationId)
            if (publication.userId === userId) {
                await Publication.update({
                        date_of_delete: newDateOfDelete
                    },
                    {
                        where: {id: publicationId}
                    }
                )
                //Отправка уведомления
                const subscribers = await Subscription.findAll({where: {authorId: userId, onNotification: true}})
                const subscribersIds = subscribers.map(item => item.userId)
                let templateText = await Type_notification.findOne({where: {id: 6}})
                for (let item of subscribersIds) {
                    let notification_text = templateText.text.replace('{nickname}', author.nickname).replace('{title}', publication.title)
                    await Notification.create({userId: item, notification_text, typeNotificationId: 6})
                }
            }
            return res.json(publication)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async likePublication(req, res) {
        try {
            const userId = req.userId
            const {publicationId} = req.body
            const like = await Publication_likes.findOne({where: {userId, publicationId}})
            if (like) {
                await Publication_likes.destroy({where: {publicationId, userId}})
            } else {
                await Publication_likes.create({userId, publicationId})
            }
            return res.json("усе")
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async createFolder(req, res) {
        try {
            const userId = req.userId
            const {name, tags, description} = req.body
            const folder = await Folder_of_publication.create({name, userId, description})
            tags.map(async tag => {
                await Folder_tag.create({creativeTagId: tag.id, folderOfPublicationId: folder.id})
            })
            return res.json(folder)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async editFolder(req, res) {
        const {folderOfPublicationId, name, description} = req.body
        try {
            const updateFolder = await Folder_of_publication.update({
                name,
                description
            }, {where: {id: folderOfPublicationId}})
            return res.json(updateFolder)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async deleteFolder(req, res) {
        try {
            const {id} = req.body
            const folder = await Folder_of_publication.findByPk(id)
            if (folder) {
                await Storage_publication.destroy({where: {folderOfPublicationId: id}})
                await Folder_of_publication.destroy({where: {id}})
                return res.json('Плейлист удален')
            } else {
                return res.json('Плейлист не найден')
            }

        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async putPublicationInFolder(req, res) {
        try {
            const {publicationId, folderOfPublicationId} = req.body
            const storage = await Storage_publication.findOrCreate({where: {publicationId, folderOfPublicationId}})
            return res.json(storage)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async deletePublicationInFolder(req, res) {
        try {
            const {publicationId, folderOfPublicationId} = req.body
            const storage = await Storage_publication.destroy({where: {publicationId, folderOfPublicationId}})
            return res.json(storage)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async putPublicationInBasket(req, res) {
        try {
            const userId = req.userId
            const {publicationId} = req.body
            const candidate = await Publication_buy.findOne({where: {userId, publicationId}})
            if (candidate) {
                return res.json('Уже приобретено')
            } else {
                const [item, created] = await Basket.findOrCreate({where: {userId, publicationId}})
                if (created) {
                    return res.json(item)
                } else {
                    return res.json('Уже в коризне')
                }
            }
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getBasket(req, res) {
        try {
            const userId = req.userId
            const publications = await Basket.findAll({
                where: {userId},
                include: [
                    {
                        model: Publication,
                        include: [{model: User, attributes: ['nickname']}]
                    }
                ]
            })
            return res.json(publications)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async deleteItemFromBasket(req, res) {
        try {
            const {basketId} = req.body;
            const basketItem = await Basket.findOne({where: {publicationId: basketId}})

            function erroR(message) {
                res.status(501).json(message)
            }

            if (!basketId || !basketItem) {
                return erroR({message: 'Not found'})
            }

            const deleteThis = await Basket.destroy({where: {id: basketItem.id}})
            if (deleteThis) {
                return res.status(200).json({id: basketId})
            } else {
                return erroR({message: 'something went wrong'})
            }

        } catch (e) {
            console.log(e)
        }
    }


    async buyPublication(req, res) {
        try {
            const userId = req.userId;
            const user = req.user;
            const {publicationIds} = req.body;
            let buy
            let publication
            let publications = []
            let authorWalletId
            let textTemplate = await Type_notification.findOne({where: {id: 7}})
            //Проверка на publicationIds
            if (!Array.isArray(publicationIds) || publicationIds.length === 0) {
                return res.status(400).json({error: 'Не указан массив publicationIds или он пуст'});
            }
            const boughtPublications = []; //Купленные
            const failedPublications = [];// Уже приобретенные
            for (const publicationId of publicationIds) {
                const candidate = await Publication_buy.findOne({where: {publicationId, userId}});
                if (candidate) {
                    failedPublications.push(publicationId);
                } else {
                    buy = await Publication_buy.create({publicationId, userId});
                    boughtPublications.push(publicationId);
                    publication = await Publication.findOne({
                        where: {id: publicationId},
                        attributes: ['title', 'price'],
                        include: {model: User, attributes: ['id', 'nickname']}
                    })
                    publications.push(publication)
                    //Находим кошелек автора
                    authorWalletId = await Wallet.findOne({
                        where: {userId: publication.user.id},
                        attributes: ['id', 'balance']
                    })
                    //Создаем транзакцию
                    let transaction = await Transaction.create({
                        publicationBuyId: buy.id,
                        purchaseCost: publication.price,
                        transferToAuthor: publication.price * (1 - 0.01),
                        transferToService: publication.price * (1 - 0.99),
                        walletId: authorWalletId.id,
                        userId
                    })

                    //Обновляем баланс
                    let newBalance = authorWalletId.balance + transaction.transferToAuthor
                    await Wallet.update(
                        {balance: newBalance},
                        {where: {id: authorWalletId.id}}
                    )
                    //Отправляем уведомление
                    let notification_text = textTemplate.text
                        .replace('{nickname}', user.nickname).replace('{title}', publication.title)
                    await Notification.create({
                        userId: publication.user.id,
                        notification_text,
                        typeNotificationId: 7
                    })
                }
            }
            //Удаляем из корзины купленные публикации
            if (boughtPublications.length > 0) {
                await Basket.destroy({where: {userId, publicationId: boughtPublications}});
            }
            return res.json({
                bought: boughtPublications,
                alreadyBought: failedPublications,
                publications
            })
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getUserFolders(req, res) {
        try {
            const {userId} = req.query
            const folders = await Folder_of_publication.findAll({
                where: {userId}
            })
            // Извлекаем последнюю публикацию для каждой папки
            const foldersWithLatestPublications = await Promise.all(folders.map(async folder => {
                const latestPublication = await Storage_publication.findOne({
                    where: {folderOfPublicationId: folder.id},
                    include: [{
                        model: Publication
                    }],
                    order: [['createdAt', 'DESC']] //Последний добавленный в плейлист пост
                });
                return {
                    ...folder.toJSON(),
                    latest_publication: latestPublication ? [latestPublication] : []
                };
            }));

            if (folders.length > 0) {
                return res.json(foldersWithLatestPublications);
            } else {
                return res.json('У пользователя нет плейлистов')
            }
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }


    // НАДО ПРОВЕРИТЬ НА ДРУГОМ МАССИВЕ ТЕГОВ, БУДУТ ЛИ ДУБЛИ ПУБЛИКАЦИЙ
    async getSimilarPublications(req, res) {
        try {
            const publicationId = req.params.id
            //Берем теги текущей публикации
            const publicationTags = await Publication_tag.findAll({
                where: {publicationId}
            })
            let publicationTagsIds = publicationTags.map(tag => tag.creativeTagId)

            //Находим записи похожие записи тегов
            let similarTagsIds = await Publication_tag.findAll({
                where: {
                    creativeTagId: {
                        [Op.in]: publicationTagsIds
                    }
                }
            })
            let similarPublicationIds = similarTagsIds.map(publication => publication.publicationId)
            //Находим публикации по тегам
            let similarPublication = await Publication.findAll({
                where: {
                    id: {
                        [Op.in]: similarPublicationIds
                    }
                },
                attributes: ['id', 'title', 'price', 'views_count', 'coverUrl', 'createdAt', 'date_of_delete',]
            })
            return res.json(similarPublication.slice(0, 10))
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async reportPublication(req, res) {
        try {
            const {publicationId, reasonForComplaintId} = req.body
            const complaint = await Complaint_about_publication.create({
                reasonForComplaintId, publicationId
            })
            return res.json(complaint)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async addToFavorites(req, res) {
        try {
            const userId = req.userId
            const {publicationId} = req.body
            const [favoriteItem, created] = await Favorites.findOrCreate({
                where: {publicationId, userId}
            })
            if (created) {
                return res.json({favoriteItem, created})
            } else {
                await Favorites.destroy({where: {publicationId, userId}})
                return res.json({favoriteItem, created})
            }

        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

}

module.exports = new PublicationController()