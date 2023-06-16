// Imported Packages
    const express = require('express');
    const router = express.Router();
    const {Customer, createValidation, updateValidation} = require('../models/customer');
    const auth = require('../middleware/auth');
    const validate = require('../middleware/validate');

// CRUD Operations
    router.post('/', [auth, validate(createValidation)], async (rq, rs) => {
        const customer = new Customer(rq.body);
        await customer.save();
        rs.send(customer);
    });
    router.get('/', async (rq, rs) => {
        const customers = await Customer.find();
        rs.send(customers);
    });
    router.get('/:id', async (rq, rs) => {
        const id = rq.params.id;
        let customer = await Customer.findById(id);
        if (!customer) return rs.status(404).send(`The id ${id} does not exist...`);
        customer = await customer.save();
        rs.send(customer);
    });
    router.put('/:id', [auth, validate(updateValidation)], async (rq, rs) => {
        const id = rq.params.id;
        const customer = await Customer.findById(id);
        if (!customer) return rs.status(404).send(`The id ${id} does not exist...`);

        customer.name = rq.body.name || customer.name;
        customer.phone = rq.body.phone || customer.phone;
        customer.isGold = rq.body.isGold || customer.isGold;
        
        await customer.save();
        rs.send(customer);
    });
    router.delete('/:id', auth, async (rq, rs) => {
        const id = rq.params.id;
        let customer = await Customer.findById(id);
        if (!customer) return rs.status(404).send(`The id ${id} does not exist...`);

        customer = await Customer.deleteOne({_id: id});
        rs.send(customer);
    });

// Exported Object
    module.exports = router;