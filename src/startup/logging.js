const winston = require("winston");

require("express-async-errors");
require("winston-mongodb");

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(
          ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
        )
      ),
    })
  );
  winston.add(new winston.transports.File({ filename: "filelog.log" }));
  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(
          ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
        )
      ),
    })
  );
};
