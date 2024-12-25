// models/PartnerCardContact.js
const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const { PartnerCard } = require('./PartnerCard');


    const PartnerCardContact = sequelize.define('PartnerCardContact', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });


    module.exports = {PartnerCardContact};
