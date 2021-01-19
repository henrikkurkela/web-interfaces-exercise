const jwt = require('jsonwebtoken')

const auth = (strict = false) => {
	return (request, response, next) => {

		try {
			const authorization = request.headers.authorization

			if (!authorization) {
				request.auth = null
			} else {
				const token = authorization.split(' ')[1]
				const decodedToken = jwt.verify(token, process.env.SECRET)
				request.auth = decodedToken
			}
		} catch (error) {
			request.auth = null
		} finally {
			if (strict && !request.auth) {
				response.status(401).send('This operation requires a valid token.')
			} else {
				next()
			}
		}
	}
}

module.exports = auth
