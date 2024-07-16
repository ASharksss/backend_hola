const {
  User_interest,
  Author_tag,
  Subscription,
  UsersSocialMedia,
  User, File,
  Type_notification, Notification, SocialMedia
} = require("../models/models");
const {v4: uuidv4} = require("uuid");
const path = require("path");

class UserController {

  async subscribe(req, res) {
    try {
      const userId = req.userId
      const user = req.user
      const {authorId} = req.body
      const [candidate, created] = await Subscription.findOrCreate({
        where: {authorId, userId}
      })
      if (created) {
        const textTemplate = await Type_notification.findOne({where: {id: 5}})
        let notification_text = textTemplate.text.replace('{nickname}', user.nickname)
        await Notification.create({
          userId: authorId,
          notification_text,
          typeNotificationId: 5
        })
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

  async takeAvatar(req, res) {
    try {
      const avatar = req.files.avatar
      const userId = req.userId
      //Проверка на уже имеющееся аватарку
      const avatarExist = await File.findOne({where: {userId, typeFileId: 3}})
      if (avatarExist) {
        await avatarExist.destroy() //Если существует - удаляем
      }
      //Добавление аватарки
      const avatarTypeFile = avatar.name.split('.').pop()
      if (avatarTypeFile !== 'jpeg' && avatarTypeFile !== 'png' && avatarTypeFile !== 'jpg') {
        return res.json('Неподходящее расширение файла для обложки');
      }
      const avatarName = `${uuidv4()}.${avatarTypeFile}`;
      await avatar.mv(path.resolve(__dirname, '..', 'static', avatarName));
      const image = await File.create({
        name: avatarName,
        typeFileId: 3,
        userId,
        approve: false,
        url: `/static/${avatarName}`
      })
      return res.json(image)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async takeCover(req, res) {
    try {
      const cover = req.files.cover
      const userId = req.userId
      //Проверка на существующую обложку
      const coverExist = await File.findOne({where: {userId, typeFileId: 1}})
      if (coverExist) {
        await coverExist.destroy() //Если существует - удаляем
      }
      //Добавление обложки
      const coverTypeFile = cover.name.split('.').pop()
      if (coverTypeFile !== 'jpeg' && coverTypeFile !== 'png' && coverTypeFile !== 'jpg') {
        return res.json('Неподходящее расширение файла для обложки');
      }
      const coverName = `${uuidv4()}.${coverTypeFile}`;
      await cover.mv(path.resolve(__dirname, '..', 'static', coverName));
      const image = await File.create({
        name: coverName,
        typeFileId: 1,
        userId,
        approve: false
      })
      return res.json(image)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getUser(req, res) {
    try {
      const userId = req.query.userId
      let coverUrl, avatarUrl
      const user = await User.findByPk(userId, {
        attributes: ['nickname']
      })
      //Получение аватарки
      const avatar = await File.findOne({where: {userId, typeFileId: 3}})
      if (avatar) {
        avatarUrl = avatar.url = `/static/${avatar?.name}`
      }
      //Получение обложки профиля
      const cover = await File.findOne({where: {userId, typeFileId: 1}})
      if (cover) {
        coverUrl = cover.url = `/static/${cover?.name}`
      }
      //Получение количества подписчиков
      let subscribersCount = await Subscription.count({where: {authorId: userId}})
      if (subscribersCount === 0) {
        subscribersCount = 'Нет подписчиков'
      }

      let socialMedia = await UsersSocialMedia.findAll({
        attributes: ['text'],
        where: {userId},
        include: {model: SocialMedia, attributes: ['name']}
      })

      if (avatar && !cover) {
        return res.json({user, avatarUrl, subscribersCount, socialMedia})
      }
      if (!avatar && cover) {
        return res.json({user, coverUrl, subscribersCount, socialMedia})
      }
      if (!avatar && !cover) {
        return res.json({user, subscribersCount, socialMedia})
      }
      if (avatar && cover) {
        return res.json({user, avatarUrl, coverUrl, subscribersCount, socialMedia})
      }
      return res.json(user)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getNotifications(req, res) {
    try {
      const userId = req.userId
      // Находим все непрочитанные уведомления для текущего пользователя
      const notifications = await Notification.findAll({
        where: {
          userId,
          read: false // Получаем только непрочитанные уведомления
        }
      });
      // Массив для хранения идентификаторов прочитанных уведомлений
      const notificationIds = notifications.map(notification => notification.id);
      // Если найдены непрочитанные уведомления, отмечаем их как прочитанные
      if (notificationIds.length > 0) {
        await Notification.update(
          {read: true}, // Устанавливаем флаг isRead в true
          {where: {id: notificationIds}} // Обновляем только уведомления с указанными идентификаторами
        );
      }
      // Возвращаем список всех уведомлений (уже отмеченных как прочитанные)
      return res.json(notifications);
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getNotificationCount(req, res) {
    try {
      const userId = req.userId
      const count = await Notification.count({where: {userId, read: false}})
      return res.json(count)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }
}

module.exports = new UserController()