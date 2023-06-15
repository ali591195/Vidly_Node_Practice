// Imported Packages
    const express = require('express');
    const router = express.Router();
    const {Movie, createValidate, updateValidate} = require('../models/movie');
    const {Genre} = require('../models/genre')
    const auth = require('../middleware/auth');
    const validate = require('../middleware/validate');

// API  request/response
    router.post('/', [auth, validate(createValidate)], async (rq, rs) => {
        const obj= rq.body

        const genre = await Genre.findById(obj.genreId);
        if(!genre) return rs.status(404).send(`The genre id ${obj.genreId} is incorrect`);

        const movie = new Movie({
            title: obj.title,
            genre: {
                _id: genre._id,
                name: genre.name
            },
            numberInStock: obj.numberInStock,
            dailyRentalRate: obj.dailyRentalRate
        });
        await movie.save();
        rs.send(movie);
    });
    router.get('/', async (rq, rs) => {
        const movies = await Movie.find().sort('title');
        rs.send(movies);
    });
    router.get('/:id', async (rq, rs) => {
        const id = rq.params.id;
        const movie = await Movie.findById(id);
        if(!movie) return rs.status(404).send(`The id ${id} is incorrect`);
        rs.send(movie);
    });
    router.put('/:id', [auth, validate(updateValidate)], async (rq, rs) => {
        const obj = rq.body;
        const id = rq.params.id;
        const movie = await Movie.findById(id);
        if(!movie) return rs.status(404).send(`The id ${id} does not exist`);      
        
        movie.title = obj.title || movie.title;
        if (obj.genreId) {
            const genre = await Genre.findById(obj.genreId);
            if(!genre) return rs.status(404).send(`The Genre id ${obj.genreId} does not exist`);
            movie.genre._id = genre._id || movie.genre._id;
            movie.genre.name = genre.name || movie.genre.name;
        }
        movie.numberInStock = obj.numberInStock || movie.numberInStock;
        movie.dailyRentalRate = obj.dailyRentalRate || movie.dailyRentalRate;

        await movie.save();
        rs.send(movie);
    });
    router.delete('/:id', auth, async (rq, rs) => {
        const id = rq.params.id;
        const movie = await Movie.findById(id);
        if(!movie) return rs.status(404).send(`The id ${id} is incorrect`);

        const result = await Movie.deleteOne({ _id: id});
        rs.send(result);
    });

// Exports Object
    module.exports = router;