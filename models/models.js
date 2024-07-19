const sequelize = require('../db')
const {DataTypes} = require('sequelize')


//Творческие тэги
const Group_tag = sequelize.define('group_tag', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
})

//Творческие тэги
const Creative_tag = sequelize.define('creative_tag', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
})

//Роли для пользователей
const Role = sequelize.define('role', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
})

//Пользователи
const User = sequelize.define('user', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  nickname: {type: DataTypes.STRING},
  date_of_birth: {type: DataTypes.DATE},
  sex: {type: DataTypes.STRING},
  password: {type: DataTypes.STRING},
  email: {type: DataTypes.STRING},
  aboutMe: {type: DataTypes.STRING}
})

//Подписки
const Subscription = sequelize.define('subscription', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

//Публикации
const Publication = sequelize.define('publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title: {type: DataTypes.STRING},
  description: {type: DataTypes.TEXT},
  price: {type: DataTypes.INTEGER},
  date_of_delete: {type: DataTypes.DATE, defaultValue: null},
  views_count: {type: DataTypes.INTEGER, defaultValue: 0},
  coverUrl: {type: DataTypes.STRING}
})

const Publication_block = sequelize.define('publication_block', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  type: {type: DataTypes.STRING},
  text: {type: DataTypes.TEXT},
})

//Статусы публикаций
const Status_of_publication = sequelize.define('status_of_publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

//Возратсные ограничения для публикаций
const Age_limit = sequelize.define('age_limit', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

//Тип файла
const Type_file = sequelize.define('type_file', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})
//Файлы
const File = sequelize.define('file', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  approve: {type: DataTypes.BOOLEAN},
  url: {type: DataTypes.STRING}
})

const Folder_of_publication = sequelize.define('folder_of_publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  description: {type: DataTypes.STRING}
})

const Comment = sequelize.define('comment', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  text: {type: DataTypes.STRING}
})

const SocialMedia = sequelize.define('socialMedia', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const UsersSocialMedia = sequelize.define('usersSocialMedia', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  text: {type: DataTypes.STRING}
})

const Notification = sequelize.define('notification', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  read: {type: DataTypes.BOOLEAN, defaultValue: false},
  notification_text: {type: DataTypes.STRING}
})

const Type_notification = sequelize.define('type_notification', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  text: {type: DataTypes.STRING}
})

const Wallet = sequelize.define('wallet', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  balance: {type: DataTypes.DOUBLE, defaultValue: 0}
})

const Transaction = sequelize.define('transaction', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  purchaseCost: {type: DataTypes.DOUBLE},
  commission: {type: DataTypes.DOUBLE, defaultValue: 1},
  transferToAuthor: {type: DataTypes.DOUBLE},
  transferToService: {type: DataTypes.DOUBLE}
})

const Finance_report = sequelize.define('finance_report', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  start_billing_period: {type: DataTypes.DATE},
  end_billing_period: {type: DataTypes.DATE}
})

const Report_transaction = sequelize.define('report_transaction', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Basket = sequelize.define('basket', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const Publication_tag = sequelize.define('publication_tag', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Comment_likes = sequelize.define('comment_likes', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Attachment = sequelize.define('attachment', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Storage_publication = sequelize.define('storage_publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Author_tag = sequelize.define('author_tag', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const User_interest = sequelize.define('user_interest', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Publication_views = sequelize.define('publication_views', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Publication_buy = sequelize.define('publication_buy', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Publication_likes = sequelize.define('publication_likes', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Folder_tag = sequelize.define('folder_tag', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})


//Relationships

//Прикрепление транзакции к аналитике
Transaction.hasMany(Report_transaction)
Report_transaction.belongsTo(Transaction)

//Прикрепление финансового отчета к аналитике
Finance_report.hasMany(Report_transaction)
Report_transaction.belongsTo(Finance_report)

//Прикрепление автора к финансовому отчету
User.hasMany(Finance_report)
Finance_report.belongsTo(User)

//Привязка покупки к транзакции
Publication_buy.hasMany(Transaction)
Transaction.belongsTo(Publication_buy)

//Привязка кошелька к транзакции
Wallet.hasMany(Transaction)
Transaction.belongsTo(Wallet)

//Привязка пользователя к кошельку
User.hasMany(Wallet)
Wallet.belongsTo(User)

//Привязка пользователя к корзине
User.hasMany(Basket)
Basket.belongsTo(User)


//Привязка публикации к корзине
Publication.hasMany(Basket)
Basket.belongsTo(Publication)

//Привязка к тэгу группу тэгов
Group_tag.hasMany(Creative_tag)
Creative_tag.belongsTo(Group_tag)

//Пользователь - Роль
Role.hasMany(User)
User.belongsTo(Role)

//Подписка
User.hasMany(Subscription,)
Subscription.belongsTo(User, {
  as: 'author'
})

//Подписка
User.hasMany(Subscription)
Subscription.belongsTo(User)

//Привязка пользователя к публикации
User.hasMany(Publication)
Publication.belongsTo(User)

//Привязка сатусов к публикациям
Status_of_publication.hasMany(Publication)
Publication.belongsTo(Status_of_publication)

//Привязка возрастного ограничения к публикации
Age_limit.hasMany(Publication)
Publication.belongsTo(Age_limit)

/* СОЗДАНИЕ ТАБЛИЦЫ ПУБЛИКАЦИЯ - ТЭГ */
Publication.hasMany(Publication_tag)
Publication_tag.belongsTo(Publication)

Creative_tag.hasMany(Publication_tag)
Publication_tag.belongsTo(Creative_tag)

//Привязка файла к блоку публикации
File.hasMany(Publication_block)
Publication_block.belongsTo(File)

//Привязка публикации к блоку публикации
Publication.hasMany(Publication_block)
Publication_block.belongsTo(Publication)

//Привязка типа файла к файлу
Type_file.hasMany(File)
File.belongsTo(Type_file)

//Привязка пользователя к файлу
User.hasMany(File)
File.belongsTo(User)

//Привязка пользователя к папке
User.hasMany(Folder_of_publication)
Folder_of_publication.belongsTo(User)

//Привязка пользователя к комментарию
User.hasMany(Comment)
Comment.belongsTo(User)

//Привязка комментария к публикации
Publication.hasMany(Comment)
Comment.belongsTo(Publication)

//idРодителя для ответов на комментарии
Comment.hasMany(Comment)
Comment.belongsTo(Comment)

//Лайки комментариев
Comment.hasMany(Comment_likes)
Comment_likes.belongsTo(Comment)

User.hasMany(Comment_likes)
Comment_likes.belongsTo(User)

/* МНОГИЕ КО МНОГИМ
  СОЗДАНИЕ ТАБЛИЦЫ ВЛОЖЕНИЯ */

File.hasMany(Attachment)
Attachment.belongsTo(File)

Publication.hasMany(Attachment)
Attachment.belongsTo(Publication)

//Хранение публикаций в папках
Publication.hasMany(Storage_publication)
Storage_publication.belongsTo(Publication)

Folder_of_publication.hasMany(Storage_publication)
Storage_publication.belongsTo(Folder_of_publication)

// Темы, на которые пишет автор
User.hasMany(Author_tag)
Author_tag.belongsTo(User)

Creative_tag.hasMany(Author_tag)
Author_tag.belongsTo(Creative_tag)

//Интересы пользователя
Creative_tag.hasMany(User_interest)
User_interest.belongsTo(Creative_tag)

User.hasMany(User_interest)
User_interest.belongsTo(User)

//Просмотры публикаций
Publication.hasMany(Publication_views)
Publication_views.belongsTo(Publication)

User.hasMany(Publication_views)
Publication_views.belongsTo(User)

//Покупки публикаций
Publication.hasMany(Publication_buy)
Publication_buy.belongsTo(Publication)

User.hasMany(Publication_buy)
Publication_buy.belongsTo(User)

//Лайки публикаций
Publication.hasMany(Publication_likes)
Publication_likes.belongsTo(Publication)

User.hasMany(Publication_likes)
Publication_likes.belongsTo(User)

//Привязка тжгов к папкам
Creative_tag.hasMany(Folder_tag)
Folder_tag.belongsTo(Creative_tag)

Folder_of_publication.hasMany(Folder_tag)
Folder_tag.belongsTo(Folder_of_publication)

//Привязка социаьный сетей к пользователю
SocialMedia.hasMany(UsersSocialMedia)
UsersSocialMedia.belongsTo(SocialMedia)

User.hasMany(UsersSocialMedia)
UsersSocialMedia.belongsTo(User)

//Уведомления
User.hasMany(Notification)
Notification.belongsTo(User)

Type_notification.hasMany(Notification)
Notification.belongsTo(Type_notification)


module.exports = {
  User,
  Role,
  Subscription,
  Publication,
  Creative_tag,
  Group_tag,
  Age_limit,
  Status_of_publication,
  Type_file,
  File,
  Publication_views,
  Publication_buy, Folder_tag, Basket, Transaction, Wallet,
  Storage_publication, Comment, Folder_of_publication, SocialMedia, UsersSocialMedia, Notification, Type_notification,
  Publication_likes, Author_tag, User_interest, Attachment, Comment_likes, Publication_tag, Publication_block
}