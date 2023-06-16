const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {Rental, createValidation} = require('../models/rental');
const {Movie} = require('../models/movie');



router.post('/', [auth, validate(createValidation)], async (rq, rs) => {
    const rental = await Rental.lookup(rq.body.customerId, rq.body.movieId);

    if(!rental) return rs.status(404).send('Rental not found');

    if(rental.returned === true) return rs.status(400).send('Rental is already processed');

    rental.return();

    await rental.save();

    await Movie.updateMany({_id: rental.movie._id}, {
        $inc: {numberInStock: 1}
    });

    return rs.send(rental);
});

module.exports = router; 