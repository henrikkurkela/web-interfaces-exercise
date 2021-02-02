const postingsRouter = require('express').Router()
const multer = require('multer')
const fs = require('fs')

const upload = multer({ dest: 'uploads/' })

const auth = require('../middlewares/auth')

const PostingsModel = require('../models/posting')
const ImagesModel = require('../models/image')

const Postings = new PostingsModel()
const Images = new ImagesModel()

postingsRouter.get('/', async (request, response) => {

    const postings = await Postings.getAll()
    const images = await Images.getAll()

    const postingsWithImages = postings.map((posting) => {
        return { ...posting.get({ plain: true }), images: images.filter((image) => image.postingId === posting.id).map((image) => image.image) }
    })

    response.json(postingsWithImages)
})

postingsRouter.get('/:sortBy/:value', async (request, response) => {

    const postings = await Postings.getAll()
    const images = await Images.getAll()

    const sortBy = request.params.sortBy
    const value = request.params.value

    const postingsWithImages = postings.map((posting) => {
        return { ...posting.get({ plain: true }), images: images.filter((image) => image.postingId === posting.id).map((image) => image.image) }
    })

    switch (sortBy) {
        case 'category':
        case 'location':
            response.json(postingsWithImages.filter((item) => RegExp(value, 'gi').test(item[`${sortBy}`])))
            break
        case 'date':
            switch (value) {
                case 'asc':
                    response.json(postingsWithImages.sort((first, second) => new Date(first.updatedAt).getTime() - new Date(second.updatedAt).getTime()))
                    break
                case 'desc':
                    response.json(postingsWithImages.sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()))
                    break
                default:
                    response.status(400).send('Bad request.')
            }
            break
        default:
            response.status(400).send('Bad request.')
    }
})

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

postingsRouter.patch('/:id', auth(true), upload.any(), async (request, response) => {

    const id = request.params.id
    const patch = request.body

    let posting = await Postings.get({ id })
    let images = await Images.getAll({ postingId: posting.id })
    let imageFiles = images.map((image) => image.image)

    if (request.auth.id !== posting.userId) {
        response.status(401).send('Unauthorized.')
    } else {
        try {
            await Postings.updateById({ ...patch, id, userId: request.auth.id })
            posting = await Postings.get({ id })

            if (request.files.length > 4) {
                response.status(400).send('Too many images.')
            } else if (request.files.length > 0) {
                images.map((image) => {
                    Images.delete({ id: image.id })
                    fs.unlinkSync(`.${image.image}`)
                })

                imageFiles = await Promise.all(
                    request.files.map(async (image) => {
                        const newImage = await Images.add({ image: `/uploads/${image.filename}`, postingId: posting.get({ plain: true }).id })
                        return newImage.get({ plain: true }).image
                    })
                )
            }

            response.status(200).json({ ...posting.get({ plain: true }), images: imageFiles })
        } catch (error) {
            response.status(400).send(error.message)
        }
    }
})

postingsRouter.delete('/:id', auth(true), async (request, response) => {

    const id = request.params.id

    const posting = await Postings.get({ id })
    const images = await Images.getAll({ postingId: posting.id })

    if (request.auth.id !== posting.userId) {
        response.status(401).send('Unauthorized.')
    } else {
        try {
            images.map((image) => {
                Images.delete({ id: image.id })
                fs.unlinkSync(`.${image.image}`)
            })

            await Postings.delete({ id })

            response.status(204).end()
        } catch (error) {
            response.status(400).send(error.message)
        }
    }

})

module.exports = postingsRouter
