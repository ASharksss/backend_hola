const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  nickname: {type: DataTypes.STRING},
  date_of_birth: {type: DataTypes.DATE},
  sex: {type: DataTypes.STRING},
})

const Role = sequelize.define('role', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
})

const Subscription = sequelize.define('subscription', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Publication = sequelize.define('publication', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title: {type: DataTypes.STRING},
  content: {type: DataTypes.STRING},
  description: {type: DataTypes.STRING},
  approve: {type: DataTypes.BOOLEAN},
  price: {type: DataTypes.INTEGER},
  date_of_delete: {type: DataTypes.DATE, defaultValue: null}
})


//Relationships
Role.hasMany(User)
User.belongsTo(Role)

User.hasMany(Subscription, )
Subscription.belongsTo(User, {
  as: 'author'
})

User.hasMany(Subscription)
Subscription.belongsTo(User)

User.hasMany(Publication)
Publication.belongsTo(User)

module.exports = {
  User, Role, Subscription, Publication
}