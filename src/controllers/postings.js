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
    } else if (request.files.length > 4) {
        response.status(400).send('Too many images.')
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

            const newImages = await Promise.all(
                request.files.map(async (image) => {
                    const newImage = await Images.add({ image: `/uploads/${image.filename}`, postingId: newPosting.get({ plain: true }).id })
                    return newImage.get({ plain: true }).image
                })
            )

            response.status(201).json({ ...newPosting.get({ plain: true }), images: newImages })
        } catch (error) {
            request.files.map((file) => {
                fs.unlinkSync(file.path)
            })

            response.status(400).send(error.message)
        }
    }
})

postingsRouter.get('/', async (request, response) => {

    const postings = await Postings.getAll()
    const images = await Images.getAll()

    const postingsWithImages = postings.map((posting) => {
        return { ...posting.get({ plain: true }), images: images.filter((image) => image.postingId === posting.id).map((image) => image.image) }
    })

    response.json(postingsWithImages)
})

module.exports = postingsRouter
