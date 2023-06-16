const request = require('supertest');
const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');

require('../../../../functions/index');

let server;

describe('/api/genres', () => {
    beforeEach(async () => { 
        server = require('../../../startup/port');
     });
    afterEach(async () => { 
        await Genre.deleteMany({});
        await server.close();
     })

    describe('GET /', () => {
        it('should return all genres',async () => {
            await Genre.collection.insertMany([
                { name: 'genre1', description: 'description1', popularity: 1},
                { name: 'genre2', description: 'description2', popularity: 2},
                { name: 'genre3', description: 'description3', popularity: 3}
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(3);
            test.each([ [ 'genre1', 'description1', 1], [ 'genre2', 'description2', 2], [ 'genre3', 'description3', 3] ], (name, description, popularity) => {
                expect(res.body.some(g => g.name === name && g.description === description && g.popularity === popularity)).toBeTruthy();
            });
        });
    });

    describe('GET /:id', () => {
        it('should return a genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1', description: 'description1', popularity: 1});
            await genre.save()
            const res = await request(server).get(`/api/genres/${genre._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ name: genre.name });
        });
        it('should give status of 404 if invalid id is passed', () => {
            test.each([ "1", '', 123, {}, [], true, null, undefined ], async id => {
                const res = await request(server).get(`/api/genres/${id}`);
                expect(res.status).toBe(404);
            })
        });
        it('should give status of 404 if no genre with a given id exist', async () => {
                const id = new mongoose.Types.ObjectId().toHexString();
                const res = await request(server).get(`/api/genres/${id}`);
                expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;

        const exec = (x = 'ali',y = 'a',z = 1) => {
            return request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: x, description: y, popularity: z});
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 400 if client send a bad request', async () => {
                const res = await exec('a');
                expect(res.status).toBe(400);
        });
        it('should save genre if it is valid', async () => {
            await exec();

            const genre = await Genre.find({name: 'ali'});
            
            expect(genre).not.toBeNull();
        });
        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'ali');
        });
    });

    describe('DELETE /', () => {
        let token;

        const exec = async () => {
            return request(server)
                .delete(`/api/genres/${id}`)
                .set('x-auth-token', token)
        }

        beforeEach(async () =>  {
            const genre = new Genre({ name: 'genre1', description: 'description1', popularity: 1});
            await genre.save()
            id = genre._id;
            token = new User({isAdmin: true}).generateAuthToken();
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 if the user is not an admin', async () => {
            token = new User({isAdmin: false}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);

        });
        it('should give status of 404 if invalid id is passed', async () => {
            test.each([ "1", '', 123, {}, [], true, null, undefined ], async id => {
                id = id;
                const res = await exec();
                expect(res.status).toBe(404);
            })
        });
        it('should give status of 404 if no genre with a given id exist', async () => {
                id = new mongoose.Types.ObjectId().toHexString();
                const res = await exec();
                expect(res.status).toBe(404);
        });
        it('should delete genre if it is valid', async () => {
            const res = await exec();

            const genre = await Genre.find({name: 'genre1'});
            
            expect(genre.length).toBe(0);
            expect(res.body).toHaveProperty('acknowledged', true);
        });
    });

    describe('PUT /', () => {
        let token;

        const exec = async (a = 'ali') => {
            return request(server)
                .put(`/api/genres/${id}`)
                .set('x-auth-token', token)
                .send({name: a });
        }

        beforeEach(async () =>  {
            const genre = new Genre({ name: 'genre1', description: 'description1', popularity: 1});
            await genre.save()
            id = genre._id;
            token = new User({isAdmin: true}).generateAuthToken();
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should give status of 404 if invalid id is passed', async () => {
            test.each([ "1", '', 123, {}, [], true, null, undefined ], async id => {
                id = id;
                const res = await exec();
                expect(res.status).toBe(404);
            })
        });
        it('should give status of 404 if no genre with a given id exist', async () => {
                id = new mongoose.Types.ObjectId().toHexString();
                const res = await exec();
                expect(res.status).toBe(404);
        });
        it('should return 400 if client send a bad request', async () => {
            const res = await exec('a');
            expect(res.status).toBe(400);
        });
        it('should save genre if it is valid', async () => {
            await exec();

            const genre = await Genre.find({name: 'ali'});
            
            expect(genre).not.toBeNull();
        });
        it('should return the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'ali');
        });
    });
});
