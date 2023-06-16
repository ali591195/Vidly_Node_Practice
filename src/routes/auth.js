// Imported Packages
    const _ = require('lodash');
    const bcrypt = require('bcrypt');
    const express = require('express');
    const router = express.Router();
    const { User} = require('../models/user');
    const validate = require('../middleware/validate');
    const Joi = require('joi');

// API request/response
    router.post('/', validate(validation), async (rq, rs) => {
        const obj = rq.body;

        const user = await User.findOne({ email: obj.email });
        if(!user) return rs.status(400).send('Invalid email or password');

        const validPassword = await bcrypt.compare(obj.password, user.password); 
        if(!validPassword) return rs.status(400).send('Invalid email or password');

        const token = user.generateAuthToken();
        rs.status(200).send(token);
    })

// Validation Function
    function validation(obj){
        const schema = Joi.object({
            email: Joi.string().min(5).max(255).required().email(),
            password: Joi.string().min(8).max(1024).required()
        });
        
        return schema.validate(obj).error;
    }

// Exports Object
    module.exports = router;