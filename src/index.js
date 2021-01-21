require('dotenv').config()

const express = require('express')
const cors = require('cors')

const database = require('./models/database')

const User = require('./models/user').User
const Posting = require('./models/posting').Posting
const Image = require('./models/image').Image

User.hasMany(Posting, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
Posting.belongsTo(User)

Posting.hasMany(Image, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
Image.belongsTo(Posting)

const signup = require('./controllers/signup')
const login = require('./controllers/login')
const postings = require('./controllers/postings')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/signup', signup)
app.use('/api/login', login)
app.use('/api/postings', postings)
app.use('/api/uploads', express.static('uploads'))

app.listen(process.env.PORT)

database.sync({ force: true })
