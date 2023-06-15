// Imported Packages
    const express = require('express');
    const router = express.Router();
    const mongoose = require('mongoose');
    const { Rental, createValidation, updateValidation } = require('../models/rental');
    const { Movie } = require('../models/movie');
    const { Customer } = require('../models/customer');
    const auth = require('../middleware/auth');
    const validate = require('../middleware/validate');

// API request/response
    router.post('/', [auth, validate(createValidation)], async (rq, rs) => {
        const obj= rq.body

        const movie = await Movie.findById(obj.movieId);
        if(!movie) return rs.status(404).send(`The movie id ${obj.movieId} is incorrect`);
        if(movie.numberInStock === 0) return rs.status(400).send('The movie is not in stock');

        const customer = await Customer.findById(obj.customerId);
        if(!customer) return rs.status(404).send(`The customer id ${obj.customerId} is incorrect`);

        const rental = new Rental({
            movie: {
                _id: movie._id,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate
            },
            customer: {
                _id: customer._id,
                name: customer.name,
                phone: customer.phone,
                isGold: customer.isGold,
            },
            rentalFee: obj.rentalFee
        });

        try {
            const session = await mongoose.startSession();
            await session.withTransaction(async () => {
                await rental.save();
            
                movie.numberInStock--;
                await movie.save();
                rs.send(rental);
            });

            await session.endSession(); 
            }
        catch(err) {
            console.error(err.message); 
        }
    });
    router.get('/', async (rq, rs) => {
        const rentals = await Rental.find().sort('-rentalDate');
        rs.send(rentals);
    });
    router.get('/:id', async (rq, rs) => {
        const id = rq.params.id;
        const rental = await Rental.findById(id);
        if(!rental) return rs.status(404).send(`The id ${id} is incorrect`);
        rs.send(rental);
    });
    router.put('/:id', [auth, validate(updateValidation)], async (rq, rs) => {
        const obj = rq.body;
        const id = rq.params.id;
        
        const rental = await Rental.findById(id);
        if(!rental) return rs.status(404).send(`The id ${id} does not exist`);

        if (obj.movieId) {
            const movie = await Movie.findById(obj.movieId);
            if(!movie) return rs.status(404).send(`The movie id ${obj.movieId} does not exist`);
            rental.movie._id = movie._id;
            rental.movie.name = movie.name;
            rental.movie.dailyRentalRate = movie.dailyRentalRate;
        }
        if (obj.customerId) {
            const customer = await Customer.findById(obj.customerId);
            if(!customer) return rs.status(404).send(`The customer id ${obj.customerId} does not exist`);
            rental.customer._id = customer._id;
            rental.customer.name = customer.name;
            rental.customer.phone = customer.phone;
            rental.customer.isGold = customer.isGold;
        }
        rental.returned = obj.returned || rental.returned;
        rental.rentalFee = obj.rentalFee || rental.rentalFee;

        await rental.save();
        rs.send(rental);
    });
    router.delete('/:id', auth, async (rq, rs) => {
        const id = rq.params.id;
        const rental = await Rental.findById(id);
        if(!rental) return rs.status(404).send(`The id ${id} is incorrect`);

        const result = await Rental.deleteOne({ _id: id});
        rs.send(result);
    });

// Exports Object
    module.exports = router;