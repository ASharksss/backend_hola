const {Comment, Comment_likes, Notification, Type_notification, Complaint_about_comment} = require("../models/models");

class CommentController {
  async commentPublication(req, res) {
    try {
      const userId = req.userId
      const user = req.user
      const {text, publicationId, commentId = null} = req.body
      let comment
      if (commentId) {
        comment = await Comment.create({userId, text, publicationId, commentId})
        // Находим получателя объявления
        let recipient = await Comment.findOne({where: {id: commentId}, attributes: ['userId']})
        //Шаблонный текст
        let templateText = await Type_notification.findOne({where: {id: 4}})
        let notification_text = templateText.text.replace('{nickname}', user.nickname)
        await Notification.create({userId: recipient.userId, notification_text, typeNotificationId: 4})
      } else {
        comment = await Comment.create({userId, text, publicationId, commentId})
      }

      return res.json(comment)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async commentLike(req, res) {
    try {
      const userId = req.userId
      const user = req.user
      const {commentId} = req.body
      let comment = await Comment.findOne({where: {id: commentId}})
      const like = await Comment_likes.findOne({where: {userId, commentId}})
      let commentLike
      let commentator
      if (like) {
        await Comment_likes.destroy({where: {commentId, userId}})
      } else {
        commentLike = await Comment_likes.create({userId, commentId})
        let templateText = await Type_notification.findOne({where: {id: 3}})
        let notification_text = templateText.text.replace('{nickname}', user.nickname)
        await Notification.create(
          {userId: comment.userId, notification_text: notification_text, typeNotificationId: 3}
        )
      }
      return res.json(commentLike)
    } catch (e) {
      return res.json(e.message)
    }
  }

  async reportComment(req, res) {
    try {
      const {commentId, reasonForComplaintId} = req.body
      const complaint = await Complaint_about_comment.create({
        reasonForComplaintId, commentId
      })
      return res.json(complaint)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }
}


module.exports = new CommentController()