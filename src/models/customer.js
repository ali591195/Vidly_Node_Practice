// Imported Package
    const Joi = require('joi');
    const mongoose = require('mongoose');

// Schema and Model
    const Customer = mongoose.model('Customer', new mongoose.Schema({
        name: {
            type: String,
            minlength: 3,
            maxlength: 255,
            required: true
        },
        phone: {
            type: String,
            minlength: 11,
            maxlength: 255,
            required: true
        },
        isGold: {
            type: Boolean,
            default: false
        }
    }));

// Validation Function
function createValidation(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        phone: Joi.string().min(11).max(255).required(),
        isGold: Joi.boolean()
    });

    return schema.validate(obj).error;
}
function updateValidation(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255),
        phone: Joi.string().min(11).max(255),
        isGold: Joi.boolean()
    });

    return schema.validate(obj).error;
}

// Exports Object
    exports.Customer = Customer;
    exports.createValidation = createValidation;
    exports.updateValidation = updateValidation;