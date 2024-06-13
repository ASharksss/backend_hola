const {Comment, Comment_likes} = require("../models/models");

class CommentController {
  async commentPublication(req, res) {
    try {
      const userId = req.userId
      const {text, publicationId, commentId = null} = req.body
      const comment = await Comment.create({userId, text, publicationId, commentId})
      return res.json(comment)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async commentLike(req, res) {
    try {
      const userId = req.userId
      const {commentId} = req.body
      const like = await Comment_likes.findOne({where: {userId, commentId}})
      let comment
      if (like) {
        await Comment_likes.destroy({where: {commentId, userId}})
      } else {
        comment = await Comment_likes.create({userId, commentId})
      }
      return res.json(comment)
    } catch (e) {
      return res.json(e.message)
    }
  }
}


module.exports = new CommentController()