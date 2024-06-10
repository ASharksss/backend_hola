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
  approve: {type: DataTypes.BOOLEAN},
  price: {type: DataTypes.INTEGER},
  date_of_delete: {type: DataTypes.DATE, defaultValue: null}
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

/* МНОГИЕ КО МНОГИМ
  СОЗДАНИЕ ТАБЛИЦЫ ПУБЛИКАЦИЯ - ТЭГ */
Publication.belongsToMany(Creative_tag, {through: 'tag_publication'})
Creative_tag.belongsToMany(Publication, {through: 'tag_publication'})

//Привязка типа файла к файлу
Type_file.hasMany(File)
File.belongsTo(Type_file)

//Привязка пользователя к файлу
User.hasMany(File)
File.belongsTo(User)

//Привязка публикации к папке
Publication.hasMany(Folder_of_publication)
Folder_of_publication.belongsTo(Publication)

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
Comment.belongsToMany(User, {through: 'comment_likes'})
User.belongsToMany(Comment, {through: 'comment_likes'})

/* МНОГИЕ КО МНОГИМ
  СОЗДАНИЕ ТАБЛИЦЫ ВЛОЖЕНИЯ */
Publication.belongsToMany(File, {through: 'attachment'})
File.belongsToMany(Publication, {through: 'attachment'})

//Хранение публикаций в папках
Publication.belongsToMany(Folder_of_publication, {through: 'storage_publication'})
Folder_of_publication.belongsToMany(Publication, {through: 'storage_publication'})

// Темы, на которые пишет автор
User.belongsToMany(Creative_tag, {through: 'author_tag'})
Creative_tag.belongsToMany(User, {through: 'author_tag'})

//Интересы пользователя
User.belongsToMany(Creative_tag, {through: 'user_interest'})
Creative_tag.belongsToMany(User, {through: 'user_interest'})

//Просмотры публикаций
User.belongsToMany(Publication, {through: 'publication_views'})
Publication.belongsToMany(User, {through: 'publication_views'})

//Покупки публикаций
User.belongsToMany(Publication, {through: 'publication_buy'})
Publication.belongsToMany(User, {through: 'publication_buy'})

//Лайки публикаций
User.belongsToMany(Publication, {through: 'publication_likes'})
Publication.belongsToMany(User, {through: 'publication_likes'})

module.exports = {
  User, Role, Subscription, Publication, Creative_tag, Group_tag, Age_limit, Status_of_publication, Type_file, File
}