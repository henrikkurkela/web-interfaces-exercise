const { DataTypes } = require('sequelize')
const { afterBulkUpdate } = require('./database')
const sequelize = require('./database')

const Image = sequelize.define('image',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
)

class ImagesModel {

    get = (image) => {
        return Image.findOne({ where: { ...image } })
    }

    getAll = (where = null) => {
        return Image.findAll({ where: { ...where } })
    }

    add = (image) => {
        return Image.create({ ...image })
    }

    delete = (image) => {
        return Image.destroy({ where: { ...image } })
    }

    deleteAll = () => {
        return Image.destroy({ where: {} })
    }
}

module.exports = ImagesModel

module.exports.Image = Image
