const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const {User} = require('./models.js');
const {PartnerCardContact} = require('./PartnerCardContact.js');
const {PartnerCardAdditional} = require('./PartnerCardAdditional.js');
const {PartnerCardBank} = require('./PartnerCardBank.js');

const PartnerCard = sequelize.define('PartnerCard', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shortName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    legalAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    actualAddress: {
        type: DataTypes.STRING,
    },
    inn: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    taxationSystem: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    okved: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ogrnip: {
        type: DataTypes.STRING,
    },
    kpp: {
        type: DataTypes.STRING,
    },
    ogrn: {
        type: DataTypes.STRING,
    },
    director: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


PartnerCard.belongsTo(PartnerCardContact);
PartnerCardContact.hasMany(PartnerCard);


PartnerCard.belongsTo(PartnerCardAdditional);
PartnerCardAdditional.hasMany(PartnerCard);


PartnerCard.belongsTo(PartnerCardBank);
PartnerCardBank.hasMany(PartnerCard);


module.exports = {PartnerCard};
