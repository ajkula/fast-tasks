const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors').UnauthorizedError;

const SECRET_KEY = process.env.SECRET_KEY;

function authenticateJWT(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    const token = req.header('Authorization');
    if (!token) {
        return next(new UnauthorizedError('Token not provided'));
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        console.log("TOKEN:", token);
        console.log("SECRET_KEY:", process.env.SECRET_KEY);

        if (err) {
            return next(new UnauthorizedError('Token not valid'));
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateJWT;
