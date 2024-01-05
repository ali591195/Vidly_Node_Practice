const mongoose = require("mongoose");
const winston = require("winston");

module.exports = function () {
  const db =
    "mongodb+srv://vidly_user:Dsk35124@cluster0.pdjp0jh.mongodb.net/?retryWrites=true&w=majority";
  mongoose
    .connect(db, { useUnifiedTopology: true })
    .then(() => winston.info(`Connected to ${db}...`));
};
