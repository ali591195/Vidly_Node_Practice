// Imported Package
    const Joi = require('joi');
    const mongoose = require('mongoose');
    const objectId = require('joi-objectid')(Joi);
    const moment = require('moment');

// Schema and Model
    const rentalSchema = new mongoose.Schema({
        movie: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            title: {
                type: String,
                required: true,
            },
            dailyRentalRate: {
                type: Number,
                required: true
            }
        },
        customer: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
            },
            name: {
                type: String,
            },
            phone: {
                type: String,
            },
            isGold: {
                type: Boolean,
                default: false
            }
        },
        rentalDate: {
            type: Date,
            default: Date.now
        },
        returnedDate: {
            type: Date
        },
        returned: {
            type: Boolean,
            default: false
        },
        rentalFee: {
            type: Number,
            min: 0,
        }
    });
    rentalSchema.statics.lookup = async function(customerId, movieId) {
        return this.findOne({
            'customer._id': customerId,
            'movie._id': movieId
        })
    };

    rentalSchema.methods.return = function() {
        this.returnedDate = new Date();

        const daysDiff = moment().diff(this.rentalDate, 'days');
        this.rentalFee = daysDiff * this.movie.dailyRentalRate;

        this.returned = true;
    };

    const Rental = mongoose.model('Rental', rentalSchema);

// Validation Function
    function createValidation(obj) {
        const schema = Joi.object({
            movieId: objectId().required(),
            customerId: objectId().required(),
        });

        return schema.validate(obj).error;
    }
    function updateValidation(obj){
        const schema = Joi.object({
            movieId: objectId().required(),
            customerId: objectId().required(),
            returned: Joi.boolean().default(false),
            rentalFee: Joi.number().min(0)
        });

        return schema.validate(obj).error;
    }

// Exports Object
    exports.Rental = Rental;
    exports.createValidation = createValidation;
    exports.updateValidation = updateValidation;