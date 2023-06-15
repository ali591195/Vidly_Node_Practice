// Imported Packages
    const winston = require('winston');
    const express = require('express');
    const app = express();

    require('./startup/logging')();
    require('./startup/routes')(app);
    require('./startup/database')();
    require('./startup/config')();
    require('./startup/prod')(app);

// Database Connection

// Middleware Pipeline
   
// Port Connection
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

    module.exports = server;