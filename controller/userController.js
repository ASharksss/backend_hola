const {User_interest, Author_tag, Subscription} = require("../models/models");

class UserController {

  async subscribe(req, res) {
    try {
      const userId = req.userId
      const {authorId} = req.body
      const [candidate, created] = await Subscription.findOrCreate({
        where: {authorId, userId}
      })
      if (created) {
        return res.json(candidate)
      } else {
        await Subscription.destroy({where: {userId, authorId}})
      }
      return res.json(candidate)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async createUserInterests(req, res) {
    try {
      const userId = req.userId
      console.log(userId)
      const {tags} = req.body
      tags.map(async tag => {
        await User_interest.create({userId, creativeTagId: tag.id})
      })
      return res.json(tags)
    } catch (e) {
      return res.json(e.message)
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
      return res.json(e.message)
    }
  }
}

module.exports = new UserController()