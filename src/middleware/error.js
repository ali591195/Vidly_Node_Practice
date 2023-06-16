const winston = require('winston');

module.exports = function(err, rq, rs, next) {
    winston.error(err.message, err);
    rs.status(500).send('Something failed');
};