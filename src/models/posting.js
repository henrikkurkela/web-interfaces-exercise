const { DataTypes } = require('sequelize');
const sequelize = require('./database');

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
        return Posting.findOne({ where: { ...posting } })
    }

    getAll = () => {
        return Posting.findAll()
    }

    add = (posting) => {
        return Posting.create({ ...posting })
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
