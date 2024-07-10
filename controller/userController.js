const {User_interest, Author_tag, Subscription, UsersSocialMedia, User} = require("../models/models");

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
      return res.status(500).json({error: e.message});
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

}

module.exports = new UserController()