const Joi = require('joi');
const express = require('express');
const router = express.Router();

const genres = [
    {id: 1, name: 'Action'},
    {id: 2, name: 'Adventure'},
    {id: 3, name: 'Animation'},
    {id: 4, name: 'Comedy'},
    {id: 5, name: 'Crime'}
];

router.get('/', (rq, rs) => rs.send(genres));
router.get('/:id', (rq, rs) => {
    const genre = genres.find(g => g.id === parseInt(rq.params.id));
    if (!genre) return rs.status(404).send(`The Id ${rq.params.id} does not exist`);
    rs.send(genre);
});

router.post('/', (rq, rs) => {
    const error = validation(rq.body);
    if (error) return rs.status(400).send(error.details[0].message);

    const newObj = {
        id: genres.length + 1,
        name: rq.body.name
    };
    genres.push(newObj);
    rs.send(newObj);
});

router.delete('/:id', (rq, rs) => {
    const genre = genres.find(g => g.id === parseInt(rq.params.id));
    if (!genre) return rs.status(404).send(`The Id ${rq.params.id} does not exist`);
    
    const index = genres.indexOf(genre);
    genres.splice(index, 1);
    rs.send(genre);
});

router.put('/:id', (rq, rs) => {
    const genre = genres.find(g => g.id === parseInt(rq.params.id));
    if (!genre) return rs.status(404).send(`The Id ${rq.params.id} does not exist`);

    const error = validation(rq.body);
    if(error) return rs.status(400).send(error.details[0].message);

    genre.name = rq.body.name;
    rs.send(genre);
    
});

function validation(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(obj).error;
};

module.exports = router;