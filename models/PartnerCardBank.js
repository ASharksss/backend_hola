const sequelize = require('../db')
const {DataTypes} = require('sequelize')


    const PartnerCardBank = sequelize.define('PartnerCardBank', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

        bankName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bic: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        correspondentAccount: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });


    module.exports = {PartnerCardBank};
