const request = require('supertest');
const { User } = require('../../../models/user');
const {Movie} = require('../../../models/movie');
const {Genre} = require('../../../models/genre');
const mongoose = require('mongoose');

require('../../../../functions/index');

describe('/api/movies', () => {
    let server;
    let token;
    let movie;

    beforeEach(async () => {
        server = require('../../../startup/port');

        movie = new Movie({
            title: 'abc',
            genre: {
                _id: new mongoose.Types.ObjectId,
                name: 'abc'
            },
            numberInStock: 1,
            dailyRentalRate: 1
        });
        await movie.save();
        token = User().generateAuthToken();
    });
    afterEach( async () => {
        await Movie.deleteMany({});
        await server.close();
    });

    describe('POST /', () => {
        beforeEach( async () => {
            await Movie.deleteMany({});
        })

        const exec = () => {
            return request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({
                    title: movie.title,
                    genreId: movie.genre._id,
                    numberInStock: movie.numberInStock,
                    dailyRentalRate: movie.dailyRentalRate
                })
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return status 400 if invalid request', async () => {
            movie.title = ''

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 404 if the genre id is invalid', async () => {
            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 and the new created customer is returned if request is valid', async () => {
            const genre = new Genre({
                _id: movie.genre._id,
                name: movie.genre.name
            });
            await genre.save();

            const res = await exec();

            await Genre.deleteMany({});

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                title: movie.title,
            });
        });
    });
    describe('GET /', () => {
        it('should return all movies', async () => {
            const res = await request(server).get('/api/movies');

            expect(res.body[0]).toMatchObject({
                title: movie.title
            });
        });
    });
    describe('GET /:id', () => {
        const exec = () => {
            return request(server).get(`/api/movies/${movie._id}`);
        }

        it('should return 404 if no movie is found', async () => {
            movie._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return 200 with the movie if valid request', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                title: movie.title
            });
        });
    });
    describe('DELETE /:id', () => {
        const exec = () => {
            return request(server)
                .delete(`/api/movies/${movie._id}`)
                .set('x-auth-token', token)
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return 404 if no movie is found', async () => {
            movie._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 and delete the movie if valid request', async () => {
            const res = await exec();

            const movieInDb = await Movie.findById(movie._id);

            expect(res.status).toBe(200);
            expect(movieInDb).toBeNull();
            expect(res.body).toMatchObject({
                acknowledged: true
            });
        });
    });
    describe('PUT /:id', () => {
        beforeEach(() => {
            movie.title = 'abcupdated';
        });

        const exec = () => {
            return request(server)
                .put(`/api/movies/${movie._id}`)
                .set('x-auth-token', token)
                .send({
                    title: movie.title,
                    genreId: movie.genre._id
                })
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return 404 if no movie is found', async () => {
            movie._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 400 if invalid request', async () => {
            movie.title = ''

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 404 if invalid updated genre id send and the request is valid', async () => {
            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 with the updated movie if valid request', async () => {
            const genre = new Genre({
                _id: movie.genre._id,
                name: movie.genre.name
            });
            await genre.save();

            const res = await exec();

            await Genre.deleteMany({});

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                title: 'abcupdated'
            });
        });
    });
});