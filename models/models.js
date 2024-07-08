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
})

//Подписки
const Subscription = sequelize.define('subscription', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

//Публикации
const Publication = sequelize.define('publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title: {type: DataTypes.STRING},
  content: {type: DataTypes.STRING},
  description: {type: DataTypes.STRING},
  price: {type: DataTypes.INTEGER},
  date_of_delete: {type: DataTypes.DATE, defaultValue: null}
})

const Publication_block = sequelize.define('publication_block', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  type: {type: DataTypes.STRING},
  text: {type: DataTypes.STRING},
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
  approve: {type: DataTypes.BOOLEAN}
})

const Folder_of_publication = sequelize.define('folder_of_publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Comment = sequelize.define('comment', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  text: {type: DataTypes.STRING}
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
  Publication_buy, Folder_tag,
  Storage_publication, Comment, Folder_of_publication,
  Publication_likes, Author_tag, User_interest, Attachment, Comment_likes, Publication_tag, Publication_block
}