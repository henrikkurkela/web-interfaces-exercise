const { Sequelize } = require('sequelize')

const sequelize = process.env.DATABASE_URL ?
    new Sequelize(process.env.DATABASE_URL, {
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }) :
    new Sequelize({
        host: process.env.SQL_HOST,
        database: process.env.SQL_DATABASE,
        username: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        port: process.env.SQL_PORT,
        dialect: process.env.SQL_DIALECT
    })

module.exports = sequelize
