const { Publication, Publication_tags, Publication_likes, Attachment, File, sequelize } = require('../models/models');
const { Op } = require('sequelize');
const cron = require('node-cron');

const deleteExpiredPublications = async () => {
  const transaction = await sequelize.transaction();
  try {
    const now = new Date();
    // Находим все просроченные публикации
    const expiredPublications = await Publication.findAll({
      where: {
        date_of_delete: {
          [Op.lte]: now
        }
      },
      transaction
    });

    // Получаем IDs просроченных публикаций
    const publicationIds = expiredPublications.map(pub => pub.id);

    // Удаляем связанные записи из Publication_tags
    await Publication_tags.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      },
      transaction
    });

    // Удаляем связанные записи из Publication_likes
    await Publication_likes.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      },
      transaction
    });

    // Находим все attachments, связанные с просроченными публикациями
    const attachments = await Attachment.findAll({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      },
      transaction
    });

    // Получаем IDs файлов, связанных с attachments
    const fileIds = attachments.map(att => att.fileId);

    // Удаляем записи из Attachment
    await Attachment.destroy({
      where: {
        publicationId: {
          [Op.in]: publicationIds
        }
      },
      transaction
    });

    // Удаляем записи из File
    await File.destroy({
      where: {
        id: {
          [Op.in]: fileIds
        }
      },
      transaction
    });

    // Удаляем просроченные публикации
    const result = await Publication.destroy({
      where: {
        id: {
          [Op.in]: publicationIds
        }
      },
      transaction
    });

    await transaction.commit();

    console.log(`Deleted ${result} expired publications and their associated tags, likes, attachments, and files.`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting expired publications and their associated tags, likes, attachments, and files:', error);
  }
};

// Запускаем задачу каждый день в 16:03
cron.schedule('3 16 * * *', deleteExpiredPublications);

module.exports = deleteExpiredPublications;