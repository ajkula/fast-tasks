const jwt = require('jsonwebtoken');
const UnauthorizedException = require('../errors');

const SECRET_KEY = process.env.SECRET_KEY;

function authenticateJWT(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    const token = req.header('Authorization');
    if (!token) {
        return next(new UnauthorizedException('Token not provided'));
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return next(new UnauthorizedException('Token not valid'));
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateJWT;
