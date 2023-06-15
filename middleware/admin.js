
module.exports = function(rq, rs, next) {
    if (!rq.user.isAdmin) return rs.status(403).send('Access denied.')

    next();
}