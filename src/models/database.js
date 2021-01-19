const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(`mysql://${process.env.SQL_USER}:${process.env.SQL_PASSWORD}@${process.env.SQL_HOST}:${process.env.SQL_PORT}/${process.env.SQL_DATABASE}`)

module.exports = sequelize
