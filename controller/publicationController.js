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
  Type_notification,
  Notification, Basket, Publication_views
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
        ageLimitId, tags, typeFileId,
        blocks, groupTags, creativeTags
      } = req.body;
      const files = req.files ? (Array.isArray(req.files.file) ? req.files.file : [req.files.file]) : [];
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
      }

      const publication = await Publication.create({
        title,
        description,
        price,
        ageLimitId,
        userId,
        statusOfPublicationId: 1,
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
              typeFileId,
              userId,
              approve: false,
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
        where: {authorId: userId},
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
      console.error("Ошибка:", e.message); // Отладочное сообщение
      return res.status(500).json({error: e.message});
    }
  }

  async getUserPublications(req, res) {
    try {
      const {userId} = req.query
      const publications = await Publication.findAll({
        where: {userId}
      })
      return res.json(publications)
    } catch (e) {
      return res.status(500).json({error: e.message});
    }
  }

  async getPublication(req, res) {
    try {
      const userId = req.userId
      const {id} = req.query
      const publication = await Publication.findOne({
        where: {id},
        include: [
          {model: Publication_block, include: {model: File}}
        ]
      })
      if (publication) {
        // Преобразование данных для включения полного пути к файлам
        const publicationData = publication.toJSON();
        publicationData.publication_blocks = publicationData.publication_blocks.map(block => {
          if (block.file) {
            block.file.url = `/static/${block.file.name}`;
          }
          return block;
        });

        const [view, created] = await Publication_views.findOrCreate({where: {userId, publicationId: id}})
        if (created) {
          // Если запись была создана, увеличиваем views в таблице Publication
          const publication = await Publication.findByPk(id)
          if (publication) {
            await publication.increment('views_count');
          }
        }
        return res.json(publicationData);
      } else {
        return res.status(404).json({message: 'Запись не найдена'});
      }

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
      if (folders.length > 0) {
        return res.json(folders)
      } else {
        return res.json('У пользователя нет плейлистов')
      }
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

        const subscribers = await Subscription.findAll({where: {authorId: userId}})
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
              {model: Publication_block, include: {model: File}}
            ],
          });

          for (let publication of publications) {
            if (publication.publication_blocks) { // Обратите внимание на правильный регистр: Publication_block -> Publication_blocks
              publication.publication_blocks.forEach(block => {
                if (block.type === 'file') {
                  block.file.url = `/static/${block.file.name}`;
                }
              });
            }
          }

          break;
        case 'subscriptions':

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
      return res.json(publications)
    } catch (e) {
      console.log(e)
      return res.status(500).json({error: e.message});
    }
  }

  async createFolder(req, res) {
    try {
      const userId = req.userId
      const {name, tags} = req.body
      const folder = await Folder_of_publication.create({name, userId})
      tags.map(async tag => {
        await Folder_tag.create({creativeTagId: tag.id, folderOfPublicationId: folder.id})
      })
      return res.json(folder)
    } catch (e) {
      return res.status(500).json({error: e.message});
    }
  }

  async putPublicationInFolder(req, res) {
    try {
      const {publicationId, folderOfPublicationId} = req.body
      const storage = await Storage_publication.create({publicationId, folderOfPublicationId})
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

  async buyPublication(req, res) {
    try {
      const userId = req.userId;
      const {publicationIds} = req.body;

      if (!Array.isArray(publicationIds) || publicationIds.length === 0) {
        return res.status(400).json({error: 'Не указан массив publicationIds или он пуст'});
      }

      const boughtPublications = [];
      const failedPublications = [];

      for (const publicationId of publicationIds) {
        const candidate = await Publication_buy.findOne({where: {publicationId, userId}});

        if (candidate) {
          failedPublications.push(publicationId);
        } else {
          const buy = await Publication_buy.create({publicationId, userId});
          boughtPublications.push(publicationId);
        }
      }

      if (boughtPublications.length > 0) {
        await Basket.destroy({where: {userId, publicationId: boughtPublications}});
      }

      return res.json({
        bought: boughtPublications,
        alreadyBought: failedPublications
      })
    } catch (e) {
      return res.status(500).json({error: e.message});
    }
  }

}

module.exports = new PublicationController()