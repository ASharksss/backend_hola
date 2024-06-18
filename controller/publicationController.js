const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const {
  Publication,
  Publication_tag,
  Attachment,
  File,
  Publication_likes, Folder_of_publication, Folder_tag, Storage_publication, Creative_tag, Publication_buy, User,
  Age_limit, Role, Status_of_publication, Comment, User_interest
} = require("../models/models");
const {count, findPublicationTags, checkTags} = require('../utils')
const {Op} = require("sequelize");

class PublicationController {
  async createPublication(req, res) {
    try {
      const userId = req.userId
      const {title, content, description, price, ageLimitId, tags, typeFileId} = req.body
      const {file} = req.files
      //Создание публикации
      const publication = await Publication.create({
        title, content, description, price, ageLimitId, userId, statusOfPublicationId: 1
      })
      //Запист тэгов публикации
      JSON.parse(tags).map(async tag => {
        await Publication_tag.create({creativeTagId: tag.id, publicationId: publication.id})
      })
      //Загрузка файлов
      let fileArray = file.name !== undefined ? [file] : file // проверка на количество файлов
      fileArray.map(async item => {
        let typeFile = item.name.split('.').pop() // записали расширение файла
        let fileName = uuid.v4() + `.${typeFile}` //создание уникального имени
        await item.mv(path.resolve(__dirname, '..', 'static', fileName))
        const file = await File.create({name: fileName, typeFileId, userId, approve: false,})
        const attachments = await Attachment.create({publicationId: publication.id, fileId: file.id})
        console.log(attachments)
      })
      return res.json('Добавлено')
    } catch (e) {
      console.log(e.message)
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
      return res.json(e.message)
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
            where: { userId: userId },
            attributes: ['creativeTagId']
          });

          const userCreativeTagIds = userInterests.map(interest => interest.creativeTagId);

          if (userCreativeTagIds.length === 0) {
            return []; // Если у пользователя нет интересов, возвращаем пустой массив
          }

          // Преобразование тегов из запроса в числа
          const queryTags = Array.isArray(creative_tags) ? creative_tags.map(tag => parseInt(tag, 10)) : [parseInt(creative_tags, 10)];

          // Определяем финальный список creativeTagIds для фильтрации публикаций
          const filterCreativeTagIds = queryTags.length > 0 ? queryTags : userCreativeTagIds;

          // Находим все публикации, которые имеют указанные creativeTagIds
          publications = await Publication.findAll({
            include: [{
              model: Publication_tag,
              where: {
                creativeTagId: {
                  [Op.in]: filterCreativeTagIds
                }
              },
              attributes: []
            }]
          });
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
      return res.json(e.message)
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
      return res.json(e.message)
    }
  }

  async putPublicationInFolder(req, res) {
    try {
      const {publicationId, folderOfPublicationId} = req.body
      const storage = await Storage_publication.create({publicationId, folderOfPublicationId})
      return res.json(storage)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async buyPublication(req, res) {
    try {
      const userId = req.userId
      const {publicationId} = req.body
      const candidate = await Publication_buy.findOne({where: {publicationId, userId}})
      if (candidate) {
        return res.json('Уже куплено')
      }
      const buy = await Publication_buy.create({publicationId, userId})
      return res.json(buy)
    } catch (e) {
      return res.json(e.message)
    }
  }

}

module.exports = new PublicationController()