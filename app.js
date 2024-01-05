const app = require("./src/startup/express");

require("./src/startup/logging")();
require("./src/startup/routes")(app);
require("./src/startup/database")();
// require("./src/startup/config")();
require("./src/startup/prod")(app);
const server = require("./src/startup/port");
