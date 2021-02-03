const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')

chai.use(chaiHttp)
chai.should()

describe('Postings', () => {

    let token = null
    let postingId = null

    it('POST /api/postings should reject unauthorized requests', (done) => {
        chai.request(app)
            .post('/api/postings')
            .set('Content-Type', 'multipart/form-data')
            .set('Authorization', 'Bearer FakeToken')
            .field('title', 'Test Posting')
            .field('description', 'Test Description')
            .field('category', 'Tests')
            .field('location', 'Oulu')
            .field('price', '30')
            .field('shipping', 'true')
            .field('pickup', 'false')
            .end((error, response) => {
                response.should.have.status(401)
                response.text.should.equal('This operation requires a valid token.')
                done()
            })
    })

    it('POST /api/postings should accept authorized requests', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ email: 'new@user.com', password: 'newpassword' })
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.have.all.keys('auth')
                token = response.body.auth

                chai.request(app)
                    .post('/api/postings')
                    .set('Content-Type', 'multipart/form-data')
                    .set('Authorization', `Bearer ${token}`)
                    .field('title', 'Test Posting')
                    .field('description', 'Test Description')
                    .field('category', 'Tests')
                    .field('location', 'Oulu')
                    .field('price', '30')
                    .field('shipping', 'true')
                    .field('pickup', 'false')
                    .attach('picture', './src/tests/test.jpg')
                    .end((error, response) => {
                        response.should.have.status(201)
                        response.body.should.have.all.keys('id', 'title', 'description', 'category', 'location', 'price', 'shipping', 'pickup', 'images', 'user', 'userId', 'createdAt', 'updatedAt')
                        postingId = response.body.id
                        done()
                    })
            })
    })

    it('GET /api/postings should return all postings', (done) => {
        chai.request(app)
            .get('/api/postings')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body[0].should.have.all.keys('id', 'title', 'description', 'category', 'location', 'price', 'shipping', 'pickup', 'images', 'user', 'userId', 'createdAt', 'updatedAt')
                done()
            })
    })

    it('PATCH /api/postings/:id should accept authorized requests', (done) => {
        chai.request(app)
            .patch(`/api/postings/${postingId}`)
            .set('Content-Type', 'multipart/form-data')
            .set('Authorization', `Bearer ${token}`)
            .field('description', 'New Test Description')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.have.all.keys('id', 'title', 'description', 'category', 'location', 'price', 'shipping', 'pickup', 'images', 'user', 'userId', 'createdAt', 'updatedAt')
                response.body.description.should.equal('New Test Description')
                done()
            })
    })

    it('PATCH /api/postings/:id should reject unauthorized requests', (done) => {
        chai.request(app)
            .patch(`/api/postings/${postingId}`)
            .set('Authorization', 'Bearer FakeToken')
            .field('description', 'New Test Description')
            .end((error, response) => {
                response.should.have.status(401)
                response.text.should.equal('This operation requires a valid token.')
                done()
            })
    })

    it('GET /api/postings/location/oulu should return the test posting', (done) => {
        chai.request(app)
            .get('/api/postings/location/oulu')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body[0].location.should.equal('Oulu')
                done()
            })
    })

    it('GET /api/postings/location/kemi should not return the test posting', (done) => {
        chai.request(app)
            .get('/api/postings/location/kemi')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body.filter((posting) => posting.location === 'Oulu').should.deep.equal([])
                done()
            })
    })

    it('GET /api/postings/category/tests should return the test posting', (done) => {
        chai.request(app)
            .get('/api/postings/category/tests')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body[0].category.should.equal('Tests')
                done()
            })
    })

    it('GET /api/postings/category/releases should not return the test posting', (done) => {
        chai.request(app)
            .get('/api/postings/category/releases')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body.filter((posting) => posting.category === 'Tests').should.deep.equal([])
                done()
            })
    })

    it('GET /api/postings/date/asc should return the test posting last', (done) => {
        chai.request(app)
            .get('/api/postings/date/asc')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body[response.body.length - 1].id.should.equal(postingId)
                done()
            })
    })

    it('GET /api/postings/date/desc should return the test posting first', (done) => {
        chai.request(app)
            .get('/api/postings/date/desc')
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.be.a('array')
                response.body[0].id.should.equal(postingId)
                done()
            })
    })

    it('DELETE /api/postings/:id should reject unauthorized requests', (done) => {
        chai.request(app)
            .delete(`/api/postings/${postingId}`)
            .set('Authorization', 'Bearer FakeToken')
            .end((error, response) => {
                response.should.have.status(401)
                response.text.should.equal('This operation requires a valid token.')
                done()
            })
    })

    it('DELETE /api/postings/:id should accept authorized requests', (done) => {
        chai.request(app)
            .delete(`/api/postings/${postingId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((error, response) => {
                response.should.have.status(204)
                done()
            })
    })
})
