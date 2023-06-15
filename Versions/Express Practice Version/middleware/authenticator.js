function authenticate(rq, rs, next){
    console.log(`Authenticating...`);
    next();
}

module.exports = authenticate;