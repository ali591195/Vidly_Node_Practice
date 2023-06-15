// Imported Packages
    const _ = require('lodash');
    const bcrypt = require('bcrypt');
    const express = require('express');
    const router = express.Router();
    const { User, validation } = require('../models/user');
    const auth = require('../middleware/auth');
    const validate = require('../middleware/validate');

// API request/response
    router.get('/me', auth, async (rq, rs) => {
        const user = await User.findById(rq.user._id).select('-password');
        rs.send(user);
    });
    router.post('/', validate(validation), async (rq, rs) => {
        const obj = rq.body;

        const user = new User(obj);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        const token = user.generateAuthToken();
        rs.header('x-auth-token', token).send(_.pick(user, [ "_id",'name', 'email' ]));
    });
    
// Exports Object
    module.exports = router;