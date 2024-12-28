const {
    User_interest,
    Author_tag,
    Subscription,
    UsersSocialMedia,
    User,
    File,
    Type_notification,
    Notification,
    SocialMedia,
    Publication,
    Publication_buy,
    Publication_tag,
    Creative_tag,
    Group_tag,
    Complaint_about_publication,
    Complaint_about_comment,
    Reason_for_complaint,
    Type_file
} = require("../models/models");
const {v4: uuidv4} = require("uuid");
const path = require("path");
const {Op, where} = require("sequelize");
const bcrypt = require("bcrypt");
const fs = require('fs');
const e = require("express");

// const handlebars = require('handlebars')
class UserController {

    async subscribe(req, res) {
        try {
            const userId = req.userId
            const user = req.user
            const {authorId} = req.body
            const [candidate, created] = await Subscription.findOrCreate({
                where: {authorId, userId}
            })
            if (created) {
                const textTemplate = await Type_notification.findOne({where: {id: 5}})
                let notification_text = textTemplate.text.replace('{nickname}', user.nickname)
                await Notification.create({
                    userId: authorId,
                    notification_text,
                    typeNotificationId: 5
                })
                // Увеличиваем счетчик подписчиков
                await User.increment('count_subscribers', {by: 1, where: {id: authorId}});
                return res.json(candidate)
            } else {
                await Subscription.destroy({where: {userId, authorId}})
                // Уменьшаем счетчик подписчиков
                await User.decrement('count_subscribers', {by: 1, where: {id: authorId}});
            }
            return res.json(candidate)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getSubscribers(req, res) {
        try {
            const {authorId} = req.query
            const subscribers = await Subscription.findAll({where: {authorId}})
            return res.json(subscribers)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getMySubscriptions(req, res) {
        try {
            const userId = req.userId
            const subscriptions = await Subscription.findAll({
                where: {userId: userId}
            })
            let authorIds = subscriptions.map(item => item.authorId)
            let authors = await User.findAll({
                where: {
                    id: {
                        [Op.in]: authorIds
                    }
                },
                attributes: ['id', 'nickname', 'aboutMe']
            })

            // Преобразуем авторов в обычные объекты и добавляем avatarUrl и coverUrl
            let authorsWithUrls = await Promise.all(authors.map(
                async (author) => {
                    // Преобразуем Sequelize объект в обычный объект
                    let authorPlain = author.toJSON();

                    // Получение аватарки
                    let avatar = await File.findOne({where: {userId: author.id, typeFileId: 3}});
                    if (avatar) {
                        authorPlain.avatarUrl = `/static/${avatar.name}`;
                    }

                    // Получение обложки профиля
                    const cover = await File.findOne({where: {userId: author.id, typeFileId: 1}});
                    if (cover) {
                        authorPlain.coverUrl = `/static/${cover.name}`;
                    }
                    return authorPlain;
                }));

            return res.json(authorsWithUrls);
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async createUserInterests(req, res) {
        try {
            const userId = req.userId;
            const { tags } = req.body;

            console.log(userId);
            console.log(tags);

            // Шаг 1: Получить текущие интересы пользователя
            const currentInterests = await User_interest.findAll({ where: { userId } });

            // Шаг 2: Найти старые теги, которые не пришли в запросе
            const currentTagIds = currentInterests.map(interest => interest.creativeTagId);
            const newTagIds = tags.map(tag => tag.id);

            // Удаляем те теги, которые больше не присутствуют в новом запросе
            const tagsToDelete = currentTagIds.filter(tagId => !newTagIds.includes(tagId));

            await User_interest.destroy({
                where: {
                    userId,
                    creativeTagId: tagsToDelete
                }
            });

            // Шаг 3: Создать новые интересы для тегов, которых еще нет
            for (const tag of tags) {
                await User_interest.findOrCreate({
                    where: { userId, creativeTagId: tag.id }
                });
            }

            return res.json(tags); // Отправляем список новых тегов
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    async updateAuthorInterests(req, res) {
        try {
            const userId = req.userId;
            const user = req.user;
            const { tags } = req.body;

            // if(user.roleId !== 2 || user.roleId !== 3){
            //     return res.status(400).json({success: false});
            // }
            // Шаг 1: Получить текущие интересы пользователя
            const currentInterests = await Author_tag.findAll({ where: { userId } });

            // if(currentInterests){
                // Шаг 2: Найти старые теги, которые не пришли в запросе
                const currentTagIds = currentInterests.map(interest => interest.creativeTagId);
                const newTagIds = tags.map(tag => tag.id);

                // Удаляем те теги, которые больше не присутствуют в новом запросе
                const tagsToDelete = currentTagIds.filter(tagId => !newTagIds.includes(tagId));

                await Author_tag.destroy({
                    where: {
                        userId,
                        creativeTagId: tagsToDelete
                    }
                });
            // }

            // Шаг 3: Создать новые интересы для тегов, которых еще нет
            for (const tag of tags) {
                await Author_tag.findOrCreate({
                    where: { userId, creativeTagId: tag.id }
                });
            }

            return res.json(tags); // Отправляем список новых тегов
        } catch (e) {
            console.log(e)
            return res.status(500).json({ error: e });
        }
    }


    async getUserInterests(req, res) {
        try {
            const userId = req.userId
            // console.log(userId)
            //Находим интересы пользователя
            const userInterests = await Group_tag.findAll({
                include: [
                    {
                        model: Creative_tag,
                        include: [
                            {
                                model: User_interest,
                                attributes: [],
                                where: {userId: userId}
                            }
                        ]
                    }
                ],
                group: ['group_tag.id', 'creative_tags.id'] //Группируем по ids
            })

            // Форматирование результатов ВАРИАНТ 1
            // const var1 = userInterests.map(group => ({
            //     groupId: group.id,
            //     groupName: group.name,
            //     tags: group.creative_tags.map(tag => ({
            //         id: tag.id,
            //         name: tag.name
            //     }))
            // })).filter(group => group.tags.length > 0);

            // Форматирование результатов ВАРИАНТ 2
            const var2 = userInterests.map(group => ({
                groupId: group.id,
                tags: group.creative_tags.map(tag => tag.id)
            })).filter(group => group.tags.length > 0);
            //Один из вариантов уйдет после того, как Нафис поэкспериментирует
            return res.json({
                groupIds: var2.map(group => group.groupId),
                tags: var2.flatMap(group => ({
                    groupId: group.groupId,
                    tagsIds: group.tags
                }))
            })
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getAuthorInterests(req, res) {
        try {
            const userId = req.userId
            // console.log(userId)
            //Находим интересы пользователя
            const authorInterests = await Group_tag.findAll({
                include: [
                    {
                        model: Creative_tag,
                        include: [
                            {
                                model: Author_tag,
                                attributes: [],
                                where: {userId: userId}
                            }
                        ]
                    }
                ],
                group: ['group_tag.id', 'creative_tags.id'] //Группируем по ids
            })

            // Форматирование результатов ВАРИАНТ 1
            // const var1 = userInterests.map(group => ({
            //     groupId: group.id,
            //     groupName: group.name,
            //     tags: group.creative_tags.map(tag => ({
            //         id: tag.id,
            //         name: tag.name
            //     }))
            // })).filter(group => group.tags.length > 0);

            // Форматирование результатов ВАРИАНТ 2
            const var2 = authorInterests.map(group => ({
                groupId: group.id,
                tags: group.creative_tags.map(tag => tag.id)
            })).filter(group => group.tags.length > 0);

            //Один из вариантов уйдет после того, как Нафис поэкспериментирует
            return res.json({
                groupIds: var2.map(group => group.groupId),
                tags: var2.flatMap(group => ({
                    groupId: group.groupId,
                    tagsIds: group.tags
                }))
            })
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }
    async createAuthorTags(req, res) {
        try {
            const userId = req.userId
            const {tags} = req.body
            tags.map(async tag => {
                await Author_tag.create({creativeTagId: tags.id, userId})
            })
            return res.json(tags)
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async getAuthorTags(req, res) {
        try {
            const userId = req.userId
            const authorTags = await Group_tag.findAll({
                include:
                    {
                        model: Creative_tag,
                        include: {
                            model: Author_tag,
                            attributes: [],
                            where: {userId: userId}
                        }
                    },
                group: ['group_tag.id', 'creative_tags.id']
            })

            // Форматирование результатов ВАРИАНТ 1
            const var1 = authorTags.map(group => ({
                groupId: group.id,
                groupName: group.name,
                tags: group.creative_tags.map(tag => ({
                    id: tag.id,
                    name: tag.name
                }))
            })).filter(group => group.tags.length > 0);

            // Форматирование результатов ВАРИАНТ 2
            const var2 = authorTags.map(group => ({
                groupId: group.id,
                tags: group.creative_tags.map(tag => tag.id)
            }))
                .filter(group => group.tags.length > 0);

            //Один из вариантов уйдет после того, как Нафис поэкспериментирует
            return res.json({
                var1,
                groupIds: var2.map(group => group.groupId),
                tags: var2.flatMap(group => ({
                    groupId: group.groupId,
                    tagsIds: group.tags
                }))
            })

        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async createUsersSocialMedia(req, res) {
        try {
            const userId = req.userId
            const {socialMedia} = req.body
            for (let item of socialMedia) {
                await UsersSocialMedia.create({socialMediumId: item.socialMediumId, text: item.text, userId})
            }
            return res.json('Добавлено')
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async createAboutMe(req, res) {
        try {
            const userId = req.userId
            const {aboutMe} = req.body
            const result = await User.update(
                {aboutMe},
                {where: {id: userId}}
            )
            if (result[0] === 0) {
                return res.json('Запись не найдена или уже имеет такое значение')
            }
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }

    async takeAvatar(req, res) {
        try {
            const avatar = req.files.avatar
            const userId = req.userId

            //Проверка на уже имеющееся аватарку
            const avatarExist = await File.findOne({where: {userId, typeFileId: 3}})
            if (avatarExist) {
                await avatarExist.destroy() //Если существует - удаляем
            }
            //Добавление аватарки
            const avatarTypeFile = avatar.name.split('.').pop()
            console.log(avatarTypeFile)
            if (avatarTypeFile !== 'jpeg' && avatarTypeFile !== 'png' && avatarTypeFile !== 'jpg') {
                return res.json('Неподходящее расширение файла для обложки');
            }
            const avatarName = `${uuidv4()}.${avatarTypeFile}`;
            await avatar.mv(path.resolve(__dirname, '..', 'static', avatarName));
            const image = await File.create({
                name: avatarName,
                typeFileId: 3,
                userId,
                approve: false,
                url: `/static/${avatarName}`
            })
            return res.json(image)


        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async takeCover(req, res) {
        try {
            const cover = req.files.cover
            const userId = req.userId
            //Проверка на существующую обложку
            const coverExist = await File.findOne({where: {userId, typeFileId: 1}})
            if (coverExist) {
                await coverExist.destroy() //Если существует - удаляем
            }
            //Добавление обложки
            const coverTypeFile = cover.name.split('.').pop()
            if (coverTypeFile !== 'jpeg' && coverTypeFile !== 'png' && coverTypeFile !== 'jpg') {
                return res.json('Неподходящее расширение файла для обложки');
            }
            const coverName = `${uuidv4()}.${coverTypeFile}`;
            await cover.mv(path.resolve(__dirname, '..', 'static', coverName));
            const image = await File.create({
                name: coverName,
                typeFileId: 1,
                userId,
                approve: false,
                url: `/static/${coverName}`
            })
            return res.json(image)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getAvatar(req, res) {
        try {
            const userId = req.userId
            const avatar = await File.findOne({
                where: {userId, typeFileId: 3}
            })
            if (avatar) {
                return res.json(avatar)
            } else {
                return res.json('У пользователя нет аватарки')
            }
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getProfileCover(req, res) {
        try {
            const userId = req.userId
            const profileCover = await File.findOne({
                where: {userId, typeFileId: 1}
            })
            if (profileCover) {
                return res.json(profileCover)
            } else {
                return res.json('У пользователя нет обложки')
            }
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getUser(req, res) {
        try {
            const userId = req.query.userId
            const meId = req.userId;
            // let creative_tags = req.query.creative_tags
            let coverUrl, avatarUrl
            let publications
                //Получение всех постов пользователя
                publications = await Publication.findAll({
                    where: {userId},
                    include: [
                        {
                            model: Publication_tag,
                            attributes: ['creativeTagId'],
                            required: false,
                        },
                        {
                            model: Publication_buy, //Для проверки доступности публикации
                            where: {userId}, //Фильтр по текущему пользователя
                            attributes: ['userId', 'publicationId'],
                            required: false //Разрешаем LEFT JOIN,чтобы включить все публикации
                        }
                    ]
                })
            // }
            //Cтавим флаг "Доступно"
            publications = publications.map(publication => {
                let plainPublication = publication.toJSON(); // Преобразуем в plain object
                // Проверяем наличие покупок
                plainPublication.isAvialable = plainPublication.publication_buys.length > 0 || plainPublication.price === 0;
                return plainPublication;
            });

            const user = await User.findByPk(userId, {
                attributes: ['nickname', 'count_subscribers', 'aboutMe','id']
            })
            const isSubscription = await Subscription.findOne({where: {userId: meId, authorId: userId}})
            const isSub = Boolean(isSubscription) || false;
            if (user) {
                user.setDataValue('isSub', isSub);
            }
            //Получение аватарки
            const avatar = await File.findOne({where: {userId, typeFileId: 3}})
            if (avatar) {
                avatarUrl = avatar.url = `/static/${avatar?.name}`
            }
            //Получение обложки профиля
            const cover = await File.findOne({where: {userId, typeFileId: 1}})
            if (cover) {
                coverUrl = cover.url = `/static/${cover?.name}`
            }

            //Получение социальный сетей
            let socialMedia = await UsersSocialMedia.findAll({
                attributes: ['text'],
                where: {userId},
                include: {model: SocialMedia, attributes: ['name']}
            })

            if (avatar && !cover) {
                return res.json({user, avatarUrl, socialMedia, publications})
            }
            if (!avatar && cover) {
                return res.json({user, coverUrl, socialMedia, publications})
            }
            if (!avatar && !cover) {
                return res.json({user, socialMedia, publications})
            }
            if (avatar && cover) {
                return res.json({user, avatarUrl, coverUrl, socialMedia, publications})
            }
            return res.json(user, socialMedia)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async updatePassword(req, res) {
        try {
            const userId = req.userId
            const user = req.user

            const {newPassword, oldPassword} = req.body;

            let checkPassword = bcrypt.compareSync(oldPassword, user.password)

            if (checkPassword || newPassword) {
                const hashPassword = await bcrypt.hash(newPassword, 10)
                await User.update(
                    {password: hashPassword},
                    {where: {id: userId}}
                )
            } else {
                return res.status(401).json({message: 'Incorrect old passwords '})
            }
            return res.json({message: 'Password updated'})
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async updateUser(req, res) {
        try {
            const userId = req.userId
            const user = req.user
            const {nickname, aboutMe, date_of_birth, sex, socialMedia} = req.body

            function isSocialMedia(socialMedia) {
                return socialMedia && socialMedia.length > 0
            }

            async function addSocialMedia(socialID, text, userID) {
                let [media, created] = await UsersSocialMedia.findOrCreate({
                        where: {
                            userId: userID,
                            socialMediumId: socialID
                        },
                        defaults: {
                            socialMediumId: socialID,
                            text,
                            userId: userID
                        }
                    },
                )
                if (!created) {
                    await media.update({text})
                    await media.save()
                }
            }

            // try {
             await User.update(
                    {nickname, aboutMe, date_of_birth, sex},
                    {where: {id: userId}}
                )
            // } catch (e) {
            //     return res.status(500).json({error: e.message})
            // }

            if (isSocialMedia) {
                for (let item of socialMedia) {
                    await addSocialMedia(item.socialMediumId, item.text, userId)
                }
            }

            let avatar = await File.findOne({
                where: {userId: user.id, typeFileId: 3}
            })

            user.avatar = avatar?.url
            user.usersSocialMedia = socialMedia
            user.nickname = nickname
            user.aboutMe = aboutMe
            user.date_of_birth = date_of_birth
            user.sex = sex
            delete user.password
            delete user.updatedAt

            return res.json(user)

        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getNotifications(req, res) {
        try {
            const userId = req.userId
            // Находим все непрочитанные уведомления для текущего пользователя
            const notifications = await Notification.findAll({
                where: {
                    userId,
                    // read: false // Получаем только непрочитанные уведомления
                }
            });
            // Массив для хранения идентификаторов прочитанных уведомлений
            const notificationIds = notifications.map(notification => notification.id);
            // Если найдены непрочитанные уведомления, отмечаем их как прочитанные
            if (notificationIds.length > 0) {
                await Notification.update(
                    {read: true}, // Устанавливаем флаг isRead в true
                    {where: {id: notificationIds}} // Обновляем только уведомления с указанными идентификаторами
                );
            }
            // Возвращаем список всех уведомлений (уже отмеченных как прочитанные)
            return res.json(notifications.reverse());
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getNotificationCount(req, res) {
        try {
            const userId = req.userId
            const count = await Notification.count({where: {userId, read: false}})
            return res.json(count)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getRecommendedAuthors(req, res) {
        try {
            const userId = req.userId
            const userInterests = await User_interest.findAll({
                where: {userId}
            })
            const userInterestsIds = userInterests.map(item => item.creativeTagId)
            const author_tags = await Author_tag.findAll({
                where: {
                    creativeTagId: {
                        [Op.in]: userInterestsIds
                    }
                }
            })
            const similarAuthorsIds = author_tags.map(item => item.userId)
                .filter((value, index, self) => self.indexOf(value) === index);//Удаление дублей в массиве
            const similarAuthors = await User.findAll({
                where: {
                    id: {
                        [Op.in]: similarAuthorsIds
                    }
                },
                attributes: ['id', 'nickname', 'aboutMe', 'count_subscribers']
            })
            return res.json(similarAuthors)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async getReasonForComplaint(req, res) {
        try {
            const reasons = await Reason_for_complaint.findAll({
                attributes: ['id', 'name']
            })
            return res.json(reasons)
        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

    async toggleNotifications(req, res) {
        try {
            const {subscriptionId} = req.body
            // Найти запись по ID подписки
            const subscription = await Subscription.findByPk(subscriptionId, {
                include: {model: User, as: 'author'}
            })

            if (!subscription) {
                return res.json('Подписка не найдена');
            }
            // Переключить значение onNotification
            subscription.onNotification = !subscription.onNotification;
            // Сохранить изменения
            await subscription.save();
            return res.json(`Уведомления от ${subscription.author.nickname} ${subscription.onNotification ? 'включены' : 'выключены'}`);
        } catch (e) {
            return res.status(500).json('Ошибка при переключении уведомлений подписки:', e);
        }
    }

    async createContract(req, res) {
        try {
            const {
                name, surname, patronymic,
                series, number, insuranceNumber,
                inn, kpp, ogrn, contractNumber,
                typeUser
            } = req.body
            let legalContract = fs.readFileSync('static/templates/legalContract.docx', 'utf8');
            let personContract = fs.readFileSync('static/templates/personContract.docx', 'utf8');
            if (typeUser === 'legalEntity') {

            }
            if (typeUser === 'person') {

            }

        } catch (e) {
            return res.status(500).json({error: e.message})
        }
    }

}

module.exports = new UserController()