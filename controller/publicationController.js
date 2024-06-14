const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const {
  Publication,
  Publication_tag,
  Attachment,
  File,
  Publication_likes, Folder_of_publication, Folder_tag, Storage_publication, Creative_tag, Publication_buy, User,
  Age_limit
} = require("../models/models");

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
        console.log(item.name)
        let typeFile = item.name.split('.').pop() // записали расширение файла
        let fileName = uuid.v4() + `.${typeFile}` //создание уникального имени
        await item.mv(path.resolve(__dirname, '..', 'static', fileName))
        const file = await File.create({name: fileName, typeFileId, userId, approve: false,})
        await Attachment.create({publicationId: publication.id, fileId: file.id})
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
      discussed(комменты), available (покупки)
      */
      const {group = 'main', tag} = req.query
      let publications
      let publicationsArray
      let tags = []
      let publicationTags
      switch (group) {
        case 'main':
          publications = 'main'
          break;
        case 'subscriptions':
          publications = 'subscriptions'
          break;
        case 'likes':
          //Нахожу лайкнутые пользователем публикации
          publicationsArray = await Publication_likes.findAll({
            where: {userId},
            attributes: ['publicationId', 'userId'],
            include:  {
              model: Publication,
              attributes: ['id','title', 'description', 'price', 'date_of_delete', 'createdAt', ],
              include: [
                {model: User, attributes: ['id', 'nickname', ]},
                {model: Age_limit, attributes: ['name']}
              ]
            },
          })

          //Нахожу тэги, привязанные к этим публикациям
          for (const item of publicationsArray) {
            const publicationTags = await Publication_tag.findAll({
              where: {publicationId: item.publication.id},
              attributes: ['publicationId', 'creativeTagId'],
              include: [
                {model: Creative_tag, attributes: ['name']},

              ]
            });
            tags.push(...publicationTags);
          }


          break;
        case 'discussed':
          publications = 'discussed'
          break;
        case 'available':
          publications = 'available'
          break;
      }
      return res.json(tags)
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