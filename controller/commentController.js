const moment = require("moment");
require('moment/locale/ru');
const {Comment, Comment_likes, Notification, Type_notification, Complaint_about_comment, User, Creative_tag,
  Publication, File
} = require("../models/models");
const {Sequelize} = require("sequelize");
class CommentController {
  async commentPublication(req, res) {
    try {
      const userId = req.userId
      const user = req.user
      const {text, publicationId, commentId = null} = req.body

      let comment, createdComment;

      async function createCommentAndReturn(){
        comment = await Comment.create({userId, text, publicationId, commentId})

        createdComment = await Comment.findOne({
          where: { id: comment.id },
          attributes: ['id', 'userId', 'createdAt', 'text', 'commentId'],
          include: [
            { model: User, attributes: ['nickname'] },
          ]
        });

        return {createdComment, comment};
      }

      if (commentId) {

        await createCommentAndReturn();
        // Находим получателя объявления
        let recipient = await Comment.findOne({where: {id: commentId}, attributes: ['userId']})
        //Шаблонный текст
        let templateText = await Type_notification.findOne({where: {id: 4}})
        let notification_text = templateText.text.replace('{nickname}', user.nickname)
        await Notification.create({userId: recipient.userId, notification_text, typeNotificationId: 4})

      } else {
        await createCommentAndReturn();
      }

      return res.json(createdComment)
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

  async getComments(req, res) {
    try {
      const { id } = req.params
      const userId = req.userId

      const comments = await Comment.findAll({
        where: { publicationId: id },
        attributes: ['id', 'userId', 'createdAt', 'text', 'commentId'],
        include: [
          { model: User, attributes: ['nickname'] },
          // {
          //   model: User,
          //   attributes: ['nickname'],
          //   include: [
          //     {
          //       model: File,
          //       where: { typeFileId: 3 },
          //       attributes: ['url']
          //     }
          //   ]
          // }
        ],
      });

      const userLiked = await Comment_likes.findAll({where: {userId: userId}})

      async function getLikesCount(id){
        const likes = await Comment_likes.findAll({where: {commentId: id}})
        return likes.length;
      }

      const commentMap = new Map();
      // Создаем карту комментариев по их ID
      for (const comment of comments) {
        const likeCount = await getLikesCount(comment.id);  // Ожидаем завершения асинхронной функции
        commentMap.set(comment.id, {
          ...comment.dataValues,
          nickname: comment.User, // Accessing nickname from the included User model
          createdAt: moment(comment.createdAt).fromNow(),
          isLiked: Boolean(userLiked.find(ul => ul.commentId === comment.id)),
          likeCount,  // Присваиваем значение после выполнения асинхронной функции
          replies: []
        });
      }

      const result = [];
      // Построение дерева комментариев
      commentMap.forEach(comment => {
        if (comment.commentId === null) {
          // Если у комментария нет родителя, добавляем его в корень
          result.push(comment);
        } else {
          // Если есть родитель, добавляем текущий комментарий в его дочерние
          const parent = commentMap.get(comment.commentId);
          if (parent) {
            parent.replies.push(comment);
          }
        }
      });
      return res.json(result.reverse())
    } catch (e) {
      console.log(e)
      return res.status(500).json({error: e.message})
    }
  }

  async deleteComment(req, res) {
    try {
      const userId = req.userId;
      const { commentId } = req.body
      let del;

      const comment = await Comment.findByPk(commentId)
      if (comment.userId === userId) {
        del = await Comment.destroy({where: {id: commentId}})
      }
      if(del){
        return res.json({success: true})
      }else{
        return res.json({success: false})
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json({error: e.message})
    }
  }

}


module.exports = new CommentController()