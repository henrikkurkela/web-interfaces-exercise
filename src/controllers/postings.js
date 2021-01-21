const postingsRouter = require('express').Router()
const multer = require('multer')
const fs = require('fs')

const upload = multer({ dest: 'uploads/' })

const auth = require('../middlewares/auth')

const PostingsModel = require('../models/posting')
const ImagesModel = require('../models/image')

const Postings = new PostingsModel()
const Images = new ImagesModel()

postingsRouter.post('/', auth(true), upload.any(), async (request, response) => {

    if (!request.body.title) {
        response.status(400).send('No title.')
    } else if (!request.body.description) {
        response.status(400).send('No description.')
    } else if (!request.body.category) {
        response.status(400).send('No category')
    } else if (!request.body.location) {
        response.status(400).send('No location.')
    } else if (!request.body.price) {
        response.status(400).send('No price.')
    } else if (!request.body.shipping && !request.body.pickup) {
        response.status(400).send('No delivery method.')
    } else {
        try {
            const newPosting = await Postings.add({
                title: request.body.title,
                description: request.body.description,
                category: request.body.category,
                location: request.body.location,
                price: request.body.price,
                shipping: request.body.shipping ? true : false,
                pickup: request.body.pickup ? true : false,
                userId: request.auth.id
            })

            await request.files.map((image) => {
                Images.add({ image: `uploads/${image.filename}`, postingId: newPosting.get({ plain: true }).id })
            })

            response.status(201).json(newPosting)
        } catch (error) {
            request.files.map((file) => {
                fs.unlinkSync(file.path)
            })

            response.status(400).send(error.message)
        }
    }
})

postingsRouter.get('/', async (request, response) => {

    response.json(Postings.getAll())
})

module.exports = postingsRouter
