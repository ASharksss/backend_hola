const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const {
  Publication,
  Publication_tag,
  Attachment,
  File,
  Comment,
  Comment_likes,
  Publication_likes, Folder_of_publication, Folder_tag, Storage_publication
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

}

module.exports = new PublicationController()