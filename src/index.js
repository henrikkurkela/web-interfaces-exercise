require('dotenv').config()

const express = require('express')
const cors = require('cors')

const database = require('./models/database')

const signup = require('./controllers/signup')
const login = require('./controllers/login')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/signup', signup)
app.use('/api/login', login)

app.listen(process.env.PORT)

database.sync({ force: true })
