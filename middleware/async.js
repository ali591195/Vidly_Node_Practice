module.exports = function(handler) {
    return async (rq, rs, next) => {
        try {
            await handler(rq, rs);
        }
        catch(ex) {
            next(ex);
        }
    };
}