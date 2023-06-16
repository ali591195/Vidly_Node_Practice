const request = require('supertest');
const {Rental} = require('../../../models/rental');
const {Movie} = require('../../../models/movie');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const moment = require('moment');

require('../../../../functions/index');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;

    beforeEach(async () => {
        server = require('../../../startup/port');

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'customer1',
                phone: '0123456789'
            },
            movie: {
                _id: movieId,
                title: 'movie1',
                dailyRentalRate: 1
            }
        });

        await rental.save();
    });
    afterEach(async () => { 
        await Rental.deleteMany({});
        await server.close();
    });

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({customerId, movieId});
    };

    it('should return 401 if client is not logged in', async () => {
        token = '';
        const res = await exec();
        
        expect(res.status).toBe(401);
    });
    it('should return 400 if customerId is not provided', async () => {
        customerId = '';
        const res = await exec();
        
        expect(res.status).toBe(400);
    });
    it('should return 400 if movieId is not provided', async () => {
        movieId = '';
        const res = await exec();
        
        expect(res.status).toBe(400);
    });
    it('should return 404 if no rental found for the customer/movie', async () => {
        await Rental.deleteMany({});

        const res = await exec();
            
        expect(res.status).toBe(404);
    });
    it('should return 400 if rental is already processed', async () => {
        rental.returned = true;
        await rental.save();

        const res = await exec();
            
        expect(res.status).toBe(400);
    });
    describe('if input is valid', () => {
        let rentalInDb;
        let res;
        let genreId;
        let movie
        let movieInDb;

        beforeEach(async () => {
            genreId = new mongoose.Types.ObjectId();
            movie = new Movie({
                _id: movieId,
                title: 'movie1',
                dailyRentalRate: 1,
                genre: {
                    _id: genreId,
                    name: 'a'
                },
                numberInStock: 10
            });

            await movie.save();

            res = await exec(); 
            rentalInDb = await Rental.findById(rental._id);
            movieInDb = await Movie.findById(movieId);
        });

        afterEach(async () => { 
            await Movie.deleteMany({});
        });

        it('should return 200 if request is valid', async () => {
            expect(res.status).toBe(200);
        });
        it('should set returned key to true if request is valid', async () => {
            expect(rentalInDb.returned).toBe(true);
        });
        it('should set returned date and the difference should be 10 secs to current time if request is valid', async () => {
            const diff = new Date() - rentalInDb.returnedDate;
    
            expect(diff).toBeLessThan(10 * 1000);
        });
        it('should set rental fee if request is valid', async () => {
            const daysDiff = moment().diff(rentalInDb.rentalDate, 'days');
    
            expect(rentalInDb.rentalFee).toBe(daysDiff * rentalInDb.movie.dailyRentalRate);
        });
        it('should increase movie stock if request is valid', async () => {
            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
        });
        it('should return the rental if request is valid', async () => {
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['rentalDate', 'rentalFee', 'customer', 'returnedDate', 'movie'])
            );
        });
    });
}); 