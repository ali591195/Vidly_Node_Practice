// Imported Packages
    const express = require('express');
    const router = express.Router();
    const {Genre, createValidation, updateValidation} = require('../models/genre');
    const auth = require('../middleware/auth');
    const admin = require('../middleware/admin');
    const validate = require('../middleware/validate');

// APIs Request/Response
    router.get('/', async (rq, rs) => {
        const result = await Genre.find().sort('name');
        rs.send(result);
    });
    router.get('/:id',async (rq, rs) => {
        const id = rq.params.id;
        const genre = await Genre.findById(id);
        if (!genre) return rs.status(404).send(`The Id ${id} does not exist`);
        rs.send(genre);
    });
    router.post('/', [auth, validate(createValidation)], async (rq, rs) => {
        const genre = new Genre(rq.body);
        
        await genre.save();
        rs.send(genre);
    });
    router.delete('/:id',  [auth, admin], async (rq, rs) => {
        const id = rq.params.id;
        let genre = await Genre.findById(id);
        if (!genre) return rs.status(404).send(`The Id ${id} does not exist`);
        
        genre = await Genre.deleteOne({ _id: id });
        rs.send(genre);
    });
    router.put('/:id', [auth, validate(updateValidation)], async (rq, rs) => {1
        const id = rq.params.id;
        
        const genre = await Genre.findById(id);
        if (!genre) return rs.status(404).send(`The Id ${id} does not exist`);

        genre.name = rq.body.name || genre.name;
        genre.description = rq.body.description || genre.description;
        genre.popularity = rq.body.popularity || genre.popularity;
        genre.update_at = Date.now;

        await genre.save();

        rs.send(genre);
    });

// Exports Object
    module.exports = router;