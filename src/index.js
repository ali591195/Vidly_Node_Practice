const app = require('./startup/express');
const serverless = require('serverless-http');

    require('./startup/logging')();
    require('./startup/routes')(app);
    require('./startup/database')();
    require('./startup/config')();
    require('./startup/prod')(app);
    const server = require('./startup/port');


module.exports.handler = serverless(app);