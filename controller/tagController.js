const {Group_tag, Creative_tag} = require("../models/models");

class TagController {
  async createTagGroup(req, res) {
    try {
      const {name} = req.body
      const tagGroup = await Group_tag.create({name})
      return res.json(tagGroup)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async createTag(req, res) {
    try {
      const {name, groupTagId} = req.body
      const tag = await Creative_tag.create({name, groupTagId})
      return res.json(tag)
    } catch (e) {
      return res.json(e.message)
    }
  }

}

module.exports = new TagController()