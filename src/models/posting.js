const { DataTypes } = require('sequelize')
const sequelize = require('./database')

const User = require('./user').User
const Image = require('./image').Image

const Posting = sequelize.define('posting',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        shipping: {
            type: DataTypes.BOOLEAN
        },
        pickup: {
            type: DataTypes.BOOLEAN
        }
    }
)

class PostingsModel {

    get = (posting) => {
        return Posting.findOne({ where: { ...posting }, include: [{ model: User, attributes: ['username', 'email'] }, Image] })
    }

    getAll = (where = null) => {
        return Posting.findAll({ where: { ...where }, include: [{ model: User, attributes: ['username', 'email'] }, Image] })
    }

    add = (posting) => {
        return Posting.create({ ...posting })
    }

    updateById = (posting) => {
        return Posting.update({ ...posting }, { where: { id: posting.id }, include: [{ model: User, attributes: ['username', 'email'] }, Image] })
    }

    delete = (posting) => {
        return Posting.destroy({ where: { ...posting } })
    }

    deleteAll = () => {
        return Posting.destroy({ where: {} })
    }
}

module.exports = PostingsModel

module.exports.Posting = Posting
