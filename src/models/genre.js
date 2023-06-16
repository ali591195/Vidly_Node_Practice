// Imported Package
    const Joi = require('joi');
    const mongoose = require('mongoose');

// Schema & Model
    const genreSchema =  new mongoose.Schema({
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
        },
        description: String,
        popularity: {
            type: Number,
            min: 1,
            max: 100
        }, // Check popularity from a scale of 1 to 100
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: Date
    })
    const Genre = mongoose.model('Genre', genreSchema);

// Validation Functions
function createValidation(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        description: Joi.string(),
        popularity: Joi.number().min(1).max(100)
    });

    return schema.validate(obj).error;
}
function updateValidation(obj) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255),
        description: Joi.string(),
        popularity: Joi.number().min(1).max(100)
    });

    return schema.validate(obj).error;
}

// Exported Object
    exports.Genre = Genre;
    exports.genreSchema = genreSchema;
    exports.createValidation = createValidation;
    exports.updateValidation = updateValidation;