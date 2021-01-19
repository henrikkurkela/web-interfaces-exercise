const signupRouter = require('express').Router()
const bcrypt = require('bcrypt')

const UsersModel = require('../models/user')

const Users = new UsersModel()

signupRouter.post('/', async (request, response) => {

    if (!RegExp('^[a-zA-Z0-9.]+@[a-zA-Z]+[.]{1}[a-zA-Z]+$').test(request.body.email)) {
        response.status(400).send('Invalid email.')
    } else if (!RegExp('^[a-zA-Z0-9]{1,255}$').test(request.body.username)) {
        response.status(400).send('Invalid username.')
    } else if (!RegExp('^. *').test(request.body.password)) {
        response.status(400).send('Invalid password.')
    } else {
        try {
            const adduser = await Users.add({
                email: request.body.email,
                username: request.body.username,
                password: await bcrypt.hash(request.body.password, 10)
            })
            const newuser = adduser.get({ plain: true })
            delete newuser['password']
            response.status(201).json(newuser)
        } catch (error) {
            console.log(error)
            response.status(400).send('User already exists.')
        }
    }

    response.status(500).send('Internal server error.')
})

module.exports = signupRouter
