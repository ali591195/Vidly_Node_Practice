// Imported Packages
    const winston = require('winston');
    const app = require('./express');
    
// Database Connection

// Middleware Pipeline
   
// Port Connection
    function connection(app) {
        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));
        return server;
    }

    const server = connection(app);

    module.exports = server
    