const request = require('supertest');
const mongoose = require('mongoose');
const {Rental} = require('../../../models/rental');
const {Movie} = require('../../../models/movie');
const {User} = require('../../../models/user');
const {Customer} = require('../../../models/customer');

describe('/api/rentals', () => {
    let server;
    let token;
    let rental;
    let movie;
    let customer;

    beforeEach(async () => {
        server = require('../../../index');
        server.close();

        rental = new Rental({
            movie: {
                _id: new mongoose.Types.ObjectId,
                title: 'abc',
                dailyRentalRate: 1
            },
            customer: {
                _id: new mongoose.Types.ObjectId,
                name: 'abc',
                phone: '12345678901',
            }
        });
        await rental.save();
        token = User().generateAuthToken();
    });
    afterEach( async () => {
        await Rental.deleteMany({});
        server.close();
    });

    describe('POST /', () => {
        beforeEach( async () => {
            await Rental.deleteMany({});
            movie = new Movie({
                _id: rental.movie._id,
                title: 'abc',
                genre: {
                    _id: new mongoose.Types.ObjectId,
                    name: 'abc'
                },
                numberInStock: 1,
                dailyRentalRate: 1
            });
            await movie.save();
            customer = new Customer({
                _id: rental.customer._id,
                name: 'abc',
                phone: '12345678901'
            });
            await customer.save();
        })
        afterEach( async () => {
            await Movie.deleteMany({});
            await Customer.deleteMany({});
        });

        const exec = () => {
            return request(server)
                .post('/api/rentals')
                .set('x-auth-token', token)
                .send({
                    customerId: rental.customer._id,
                    movieId: rental.movie._id
                })
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return status 400 if invalid request', async () => {
            rental.movie._id = null

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 404 if the movie id is invalid', async () => {
            rental.movie._id = new mongoose.Types.ObjectId;
            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 400 if the movie stock is 0', async () => {
            movie.numberInStock = 0;
            await movie.save();

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 404 if the customer id is invalid', async () => {
            rental.customer._id = new mongoose.Types.ObjectId;
            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 and the new created rental is returned if request is valid', async () => {
            const res = await exec();

            const movieInDb = await Movie.findById(movie._id);

            expect(movieInDb.numberInStock).toBe(movie.numberInStock - 1);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('movie');
            expect(res.body).toHaveProperty('customer');
        });
    });
    describe('GET /', () => {
        it('should return all rentals', async () => {
            const res = await request(server).get('/api/rentals');

            expect(res.body[0]).toHaveProperty('movie');
            expect(res.body[0]).toHaveProperty('customer');
        });
    });
    describe('GET /:id', () => {
        const exec = () => {
            return request(server).get(`/api/rentals/${rental._id}`);
        }

        it('should return 404 if no rental is found', async () => {
            rental._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return 200 with the rental if valid request', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('movie');
            expect(res.body).toHaveProperty('customer');
        });
    });
    describe('DELETE /:id', () => {
        const exec = () => {
            return request(server)
                .delete(`/api/rentals/${rental._id}`)
                .set('x-auth-token', token)
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return 404 if no rental is found', async () => {
            rental._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 with the updated customer if valid request', async () => {
            const res = await exec();

            const rentalInDb = await Rental.findById(rental._id);

            expect(res.status).toBe(200);
            expect(rentalInDb).toBeNull();
            expect(res.body).toMatchObject({
                acknowledged: true
            });
        });
    });
    describe('PUT /:id', () => {
        beforeEach( async () => {
            movie = new Movie({
                _id: new mongoose.Types.ObjectId,
                title: 'abc',
                genre: {
                    _id: new mongoose.Types.ObjectId,
                    name: 'abc'
                },
                numberInStock: 1,
                dailyRentalRate: 1
            });
            await movie.save();
            customer = new Customer({
                _id: new mongoose.Types.ObjectId,
                name: 'abc',
                phone: '12345678901'
            });
            await customer.save();
        })
        afterEach( async () => {
            await Movie.deleteMany({});
            await Customer.deleteMany({});
        });

        const exec = () => {
            return request(server)
                .put(`/api/rentals/${rental._id}`)
                .set('x-auth-token', token)
                .send({
                    movieId: movie._id,
                    customerId: customer._id,
                })
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return 404 if no rental is found', async () => {
            rental._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 400 if invalid request', async () => {
            movie._id = null

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 404 if invalid updated movie id send and the request is valid', async () => {
            movie._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 404 if invalid updated customer id send and the request is valid', async () => {
            customer._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 with the updated rental if valid request', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('movie');
            expect(res.body).toHaveProperty('customer');
        });
    });
});