function log(rq, rs, next){
    console.log(`Logging...`);
    next();
}

module.exports = log;