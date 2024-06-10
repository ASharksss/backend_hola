const {Publication, Creative_tag, CreativeTag} = require("../models/models");

class PublicationController {
  async createPublication(req, res) {
    try {
      const userId = req.userId
      const {/*title, content, description, price, ageLimitId,*/ tags} = req.body
      const publicationId = 1
      /* const publication = await Publication.create(
         {title, content, description, price, userId, statusOfPublicationId: 1, ageLimitId}
       )*/
      const publication = await Publication.findOne({where: {id: 1}})
      tags.map(async tag => {
        const tagOfBd = await CreativeTag.findOne({where: {id: tag.id}})
        await publication.addTagOfBd(tagOfBd, {through: {publicationId}})
      })
    } catch (e) {
      console.log(e.message)
    }
  }
}

module.exports = new PublicationController()