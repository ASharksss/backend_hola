// models/PartnerCardAdditional.js
const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const {PartnerCard} = require('./PartnerCard');

const PartnerCardAdditional = sequelize.define('PartnerCardAdditional', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    site: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


module.exports = {PartnerCardAdditional};
