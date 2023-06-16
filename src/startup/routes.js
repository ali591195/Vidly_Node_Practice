const express = require('express');
const genres = require('../routes/genres');
const customers = require('../routes/customers');
const movies = require('../routes/movies');
const rentals = require('../routes/rentals');
const users = require('../routes/users');
const auth = require('../routes/auth');
const returns = require('../routes/returns');
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(express.json());
    app.use('/.netlify/functions/api/genres', genres);
    app.use('/.netlify/functions/api/customers', customers);
    app.use('/.netlify/functions/api/movies', movies);
    app.use('/.netlify/functions/api/rentals', rentals);
    app.use('/.netlify/functions/api/users', users);
    app.use('/.netlify/functions/api/auth', auth);
    app.use('/.netlify/functions/api/returns', returns);
    app.use(error);
};