const Joi = require('joi');
const express = require('express');
const router = express.Router();

const genres = [
    {id: 'action', name: 'Action'},
    {id: 'adventure', name: 'Adventure'},
    {id: 'animation', name: 'Animation'},
    {id: 'comedy', name: 'Comedy'},
    {id: 'crime', name: 'Crime'}
]

router.get('/', (rq, rs) => rs.send(genres));
router.get('/:id', (rq, rs) => {
    const genre = genres.find(g => g.id === rq.params.id);
    if (!genre) return rs.status(404).send(`The Id ${rq.params.id} does not exist`);
    rs.send(genre);
})

router.post('/', (rq, rs) => {
    const error = validation(rq.body);
    if (error) return rs.status(400).send(error.details[0].message);

    const newObj = {
        id: rq.body.name.toLowerCase(),
        name: rq.body.name
    };
    genres.push(newObj);
    rs.send(newObj);
})

router.delete('/:id', (rq, rs) => {
    const genre = genres.find(g => g.id === rq.params.id);
    if (!genre) return rs.status(404).send(`The Id ${rq.params.id} does not exist`);
    
    const index = genres.indexOf(genre);
    genres.splice(index, 1);
    rs.send(genre);
})

router.put('/:id', (rq, rs) => {
    const genre = genres.find(g => g.id === rq.params.id);
    if (!genre) return rs.status(404).send(`The Id ${rq.params.id} does not exist`);

    const error = validation(rq.body);
    if(error) return rs.status(400).send(error.details[0].message);

    genre.name = rq.body.name;
    genre.id = rq.body.name.toLowerCase();
    rs.send(genre);
    
})

function validation(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(obj).error;
}

module.exports = router;