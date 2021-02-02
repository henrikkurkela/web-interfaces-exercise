const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')

chai.use(chaiHttp)
chai.should()

describe('Signup', () => {

    it('POST /api/signup should accept registration requests or reject if already exists', (done) => {
        chai.request(app)
            .post('/api/signup')
            .send({ email: 'new@user.com', username: 'newuser', password: 'newpassword' })
            .end((error, response) => {
                response.status.should.be.oneOf([201, 400])
                done()
            })
    })

})
