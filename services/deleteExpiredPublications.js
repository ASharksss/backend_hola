const {
  Publication, Publication_tag, Publication_likes, Attachment, File, Comment, Comment_likes,
  Publication_buy, Publication_views, Storage_publication
} = require('../models/models');
const { Op } = require('sequelize');
const cron = require('node-cron');

const deleteExpiredPublications = async () => {
  try {
    const now = new Date();

    // Находим все просроченные публикации
    const expiredPublications = await Publication.findAll({
      where: {
        date_of_delete: {
          [Op.lte]: now
        }
      }
    });

    // Получаем IDs просроченных публикаций
    const publicationIds = expiredPublications.map(pub => pub.id);

    // Удаляем связанные записи из Publication_tags
    await Publication_tag.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Находим все comments, связанные с просроченными публикациями
    const comments = await Comment.findAll({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Получаем IDs комментариев
    const commentIds = comments.map(comment => comment.id);

    // Удаляем лайки комментариев
    await Comment_likes.destroy({
      where: {
        commentId: {
          [Op.in]: commentIds
        }
      }
    });

    // Удаляем комментарии
    await Comment.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });


    // Удаляем покупки
    await Publication_buy.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Удаляем просмотры
    await Publication_views.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Удаляем из папок
    await Storage_publication.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Удаляем лайки публикаций
    await Publication_likes.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Находим все attachments, связанные с просроченными публикациями
    const attachments = await Attachment.findAll({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Получаем IDs файлов, связанных с attachments
    const fileIds = attachments.map(att => att.fileId);

    // Удаляем записи из Attachment
    await Attachment.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      }
    });

    // Удаляем записи из File
    await File.destroy({
      where: {
        id: {
          [Op.in]: fileIds
        }
      }
    });

    // Удаляем просроченные публикации
    const result = await Publication.destroy({
      where: {
        id: {
          [Op.in]: publicationIds
        }
      }
    });

    console.log(`Deleted ${result} expired publications and their associated tags, likes, attachments, comments, and files.`);
  } catch (error) {
    console.error('Error deleting expired publications and their associated tags, likes, attachments, comments, and files:', error);
  }
};

// Запускаем задачу каждый день в 00.00
cron.schedule('00 00 * * *', deleteExpiredPublications);

module.exports = deleteExpiredPublications;