const uuid = require('uuid')
const path = require('path')
const {Publication, Publication_tag, Attachment, File} = require("../models/models");

class PublicationController {
  async createPublication(req, res) {
    try {
      const userId = req.userId
      const {title, content, description, price, ageLimitId, tags, typeFileId} = req.body
      const {file} = req.files
      const publication = await Publication.create({
        title, content, description, price, ageLimitId, userId, statusOfPublicationId: 1
      })
      JSON.parse(tags).map(async tag => {
        console.log(tag.id)
        await Publication_tag.create({creativeTagId: tag.id, publicationId: publication.id})
      })
      let fileName
      if(parseInt(typeFileId) === 1) {
        fileName = uuid.v4() + '.mp4'
      }
      if(parseInt(typeFileId) === 2) {
        fileName = uuid.v4() + '.mp3'
      }
      if(parseInt(typeFileId) === 3) {
        fileName = uuid.v4() + '.jpg'
      }
      await file.mv(path.resolve(__dirname, '..', 'static', fileName))
      const file2 = await File.create({name: fileName, typeFileId, userId, approve: true,})
      return res.json('Добавлено')
    } catch (e) {
      console.log(e.message)
    }
  }
}

module.exports = new PublicationController()