const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const UsersModel = require('../models/user')

const Users = new UsersModel()

loginRouter.post('/', async (request, response) => {

    let user

    if (request.body.username) {
        user = await Users.get({ username: request.body.username })
    } else if (request.body.email) {
        user = await Users.get({ email: request.body.email })
    } else {
        user = null
    }

    if (user) {
        try {
            const correctpassword = await bcrypt.compare(request.body.password, user.password)
            if (correctpassword) {
                const token = jwt.sign(user.get({ plain: true }), process.env.SECRET)
                response
                    .status(200)
                    .send({ auth: token })
            } else {
                response.status(401).send('Incorrect credentials.')
            }
        } catch (error) {
            response.status(500).send('Internal server error.')
        }
    } else {
        response.status(401).send('Incorrect credentials.')
    }
})

module.exports = loginRouter
