// Imported Package
    const Joi = require('joi');
    const mongoose = require('mongoose');
    const objectId = require('joi-objectid')(Joi);

// Schema and Model
    const Movie = mongoose.model('Movie', new mongoose.Schema({
        title: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
            trim: true
        },
        genre: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        },
        numberInStock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 255
        },
        dailyRentalRate: {
            type: Number,
            min: 0,
            default: 0,
            required: true,
            max: 255
        }
    }))

// Validation Functions
    function createValidate(obj) {
        const schema = Joi.object({
            title: Joi.string().min(3).max(255).required(),
            genreId: objectId().required(),
            numberInStock: Joi.number().min(0).max(255).default(0).required(),
            dailyRentalRate: Joi.number().min(0).max(255).default(0).required()
        })

        return schema.validate(obj).error
    }
    function updateValidate(obj) {
        const schema = Joi.object({
            title: Joi.string().min(3).max(255),
            genreId: objectId(),
            numberInStock: Joi.number().min(0).default(0),
            dailyRentalRate: Joi.number().min(0).default(0)
        })

        return schema.validate(obj).error
    }

// Exported Object
    exports.Movie = Movie;
    exports.createValidate = createValidate;
    exports.updateValidate = updateValidate;