const {Group_tag, Creative_tag} = require("../models/models");

class TagController {
  async createTagGroup(req, res) {
    try {
      const {groups} = req.body
      groups.map(async group => {
        await Group_tag.create({name: group.name})
      })
      return res.json(groups)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async createTag(req, res) {
    try {
      const {tags} = req.body
      tags.map(async tag => {
        await Creative_tag.create({name: tag.name, groupTagId: tag.groupTagId})
      })
      return res.json(tags)
    } catch (e) {
      return res.json(e.message)
    }
  }

}

module.exports = new TagController()