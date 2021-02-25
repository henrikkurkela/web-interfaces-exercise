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

    const postingsJson = postings.map((posting) => {
        return posting.get({ plain: true })
    })

    response.json(postingsJson)
})

postingsRouter.get('/:sortBy/:value', async (request, response) => {

    const postings = await Postings.getAll()

    const sortBy = request.params.sortBy
    const value = request.params.value

    const postingsJson = postings.map((posting) => {
        return posting.get({ plain: true })
    })

    switch (sortBy) {
        case 'category':
        case 'location':
            response.json(postingsJson.filter((item) => RegExp(value, 'gi').test(item[`${sortBy}`])))
            break
        case 'date':
            switch (value) {
                case 'asc':
                    response.json(postingsJson.sort((first, second) => new Date(first.updatedAt).getTime() - new Date(second.updatedAt).getTime()))
                    break
                case 'desc':
                    response.json(postingsJson.sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()))
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

    if (request.body.shipping) {
        switch (request.body.shipping) {
            case 'true':
            case true:
            case 1:
                request.body.shipping = true
                break
            default:
                request.body.shipping = false
                break
        }
    } else {
        request.body.shipping = false
    }

    if (request.body.pickup) {
        switch (request.body.pickup) {
            case 'true':
            case true:
            case 1:
                request.body.pickup = true
                break
            default:
                request.body.pickup = false
                break
        }
    } else {
        request.body.pickup = false
    }

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
                shipping: request.body.shipping,
                pickup: request.body.pickup,
                userId: request.auth.id
            })

            await Promise.all(
                request.files.map(async (image) => {
                    await Images.add({ image: `/uploads/${image.filename}`, postingId: newPosting.get({ plain: true }).id })
                })
            )

            const postingWithImages = await Postings.get({ id: newPosting.id })

            response.status(201).json(postingWithImages.get({ plain: true }))
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

    let patchedPosting = { ...posting.get({ plain: true }), ...patch }

    if (patchedPosting.shipping) {
        switch (patchedPosting.shipping) {
            case 'true':
            case true:
            case 1:
                patchedPosting.shipping = true
                break
            default:
                patchedPosting.shipping = false
                break
        }
    } else {
        patchedPosting.shipping = false
    }

    if (patchedPosting.pickup) {
        switch (patchedPosting.pickup) {
            case 'true':
            case true:
            case 1:
                patchedPosting.pickup = true
                break
            default:
                patchedPosting.pickup = false
                break
        }
    } else {
        patchedPosting.pickup = false
    }

    if (!patchedPosting.title) {
        response.status(400).send('No title.')
    } else if (!patchedPosting.description) {
        response.status(400).send('No description.')
    } else if (!patchedPosting.category) {
        response.status(400).send('No category')
    } else if (!patchedPosting.location) {
        response.status(400).send('No location.')
    } else if (!patchedPosting.price) {
        response.status(400).send('No price.')
    } else if (!patchedPosting.shipping && !patchedPosting.pickup) {
        response.status(400).send('No delivery method.')
    } else if (request.files.length > 4) {
        response.status(400).send('Too many images.')
    } else if (request.auth.id !== posting.userId) {
        response.status(401).send('Unauthorized.')
    } else {
        try {
            await Postings.updateById({ ...patch, id, userId: request.auth.id })

            if (request.files.length > 4) {
                response.status(400).send('Too many images.')
            } else if (request.files.length > 0) {
                images.map((image) => {
                    Images.delete({ id: image.id })
                })

                await Promise.all(
                    request.files.map(async (image) =>
                        await Images.add({ image: `/uploads/${image.filename}`, postingId: posting.get({ plain: true }).id })
                    )
                )
            }

            posting = await Postings.get({ id })
            const postingJson = posting.get({ plain: true })

            response.status(200).json(postingJson)
        } catch (error) {
            response.status(400).send(error.message)
        }
    }
})

postingsRouter.delete('/:id', auth(true), async (request, response) => {

    try {
        const id = request.params.id
        const posting = await Postings.get({ id })

        if (request.auth.id === posting.userId) {
            await Postings.delete({ id })
            response.status(204).end()
        } else {
            response.status(401).send('Unauthorized.')
        }
    } catch (error) {
        response.status(400).send(error.message)
    }

})

module.exports = postingsRouter
