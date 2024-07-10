const {Group_tag, Creative_tag} = require("../models/models");
const {Op} = require("sequelize");

class TagController {
  async createTagGroup(req, res) {
    try {
      const {groups} = req.body
      groups.map(async group => {
        await Group_tag.create({name: group.name})
      })
      return res.json(groups)
    } catch (e) {
      return res.status(500).json({error: e.message});
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
      return res.status(500).json({error: e.message});
    }
  }

  async getTagGroup(req, res) {
    try {
      const groups = await Group_tag.findAll()
      return res.json(groups)
    } catch (e) {
      return res.status(500).json({error: e.message});
    }
  }

  async getCreativeTagByGroup(req, res) {
    try {
      const {groups} = req.body
      const tags = await Creative_tag.findAll({
        where: {
          groupTagId: {
            [Op.in] : groups
          }
        }
      })
      return res.json(tags)
    } catch (e) {
      return res.status(500).json({error: e.message});
    }
  }

}

module.exports = new TagController()