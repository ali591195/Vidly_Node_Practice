const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (rq, rs, next) {
    const token = rq.header('x-auth-token');
    if(!token) return rs.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        rq.user = decoded;
        next();
    }
    catch(e) {
        return rs.status(400).send('Invalid token.');
    }
}
