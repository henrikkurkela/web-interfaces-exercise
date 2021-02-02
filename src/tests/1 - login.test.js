const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')

chai.use(chaiHttp)
chai.should()

describe('Login', () => {

    it('POST /api/login should accept correct credentials', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ email: 'new@user.com', password: 'newpassword' })
            .end((error, response) => {
                response.should.have.status(200)
                response.body.should.have.all.keys('auth')
                done()
            })
    })

    it('POST /api/login should reject incorrect credentials', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ email: 'new@user.com', password: 'wrongpassword' })
            .end((error, response) => {
                response.should.have.status(401)
                response.text.should.equal('Incorrect credentials.')
                done()
            })
    })
})
