// models/PartnerCardContact.js
const sequelize = require('../db')
const {DataTypes} = require('sequelize')



    const PartnerCardContact = sequelize.define('PartnerCardContact', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        email: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
    });


    module.exports = {PartnerCardContact};
