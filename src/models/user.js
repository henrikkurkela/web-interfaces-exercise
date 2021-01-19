const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
    indexes: [
        { unique: true, fields: ['email'] },
        { unique: true, fields: ['username'] }
    ]
})

class UsersModel {

    get = (user) => {
        return User.findOne({ where: { ...user } })
    }

    getAll = () => {
        return User.findAll()
    }

    add = (user) => {
        return User.create({ ...user })
    }

    delete = (user) => {
        return User.destroy({ where: { ...user } })
    }

    deleteAll = () => {
        return User.destroy({ where: {} })
    }
}

module.exports = UsersModel
