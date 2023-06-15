const request = require('supertest');
const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');
let server;

describe('auth middleware', () => {
    let token

    beforeEach(async () => { 
        server = require('../../../index');
        server.close();
        token = new User().generateAuthToken();
    });

    const exec = () => {
        return request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name: 'ali', description: 'a', popularity: 1});
    };

    afterEach(async () => {
        await Genre.deleteMany({});
        server.close();
    });

    it('should return 401 if no token is provided', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });
    it('should return 400 if invalid token is provided', async () => {
        token = 'a';
        const res = await exec();
        expect(res.status).toBe(400);
    });
    it('should return 200 if invalid token is provided', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });
});