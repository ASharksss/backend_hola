const {Publication} = require("../models/models");

class PublicationController {
  async createPublication(req, res) {
    try {
      const userId = req.userId
      const {title, content, description, price} = req.body
      const publication = await Publication.create({title, content, description, price, userId, approve: true})
    } catch (e) {
      console.log(e.message)
    }
  }
}

module.exports = new PublicationController()