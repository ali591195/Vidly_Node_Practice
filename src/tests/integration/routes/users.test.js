const request = require('supertest');
const { User, validateEmail } = require('../../../models/user');

require('../../../../functions/index');

describe('/api/users', () => {
    let server;
    let user;
    let token;

    beforeEach(async () => {
        server = require('../../../startup/port');

        user = new User({
            name: '123',
            email: 'abc123@gmail.com',
            password: 'abcABC1!'
        });

        await user.save();

        token = user.generateAuthToken();
    });
    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        const exec = () => {
            return request(server)
                .get('/api/users/me')
                .set('x-auth-token', token)
        }

        it('should return status 401 if authentication failed', async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return status 200 and return the user if authentication succeed', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({email: user.email});
        });
    }); 
    describe('POST /', () => {
        const exec = () => {
            return request(server)
                .post('/api/users')
                .send({
                    name: user.name,
                    email: user.email,
                    password: user.password
                })
        };

        it('should return 400 if user send invalid request', async () => {
            user.name = '';

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 200 and return the user if request is valid', async () => {
            user.email = 'abcd123@gmail.com'
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({email: user.email});
        });
    });
});

describe('validateEmail',() => {
    it('should throw an error if email is already registered', async () => {
        const server = require('../../../startup/port');

        const user = new User({
            name: '123',
            email: 'abc123@gmail.com',
            password: 'abcABC1!'
        });

        await user.save();

        try {
            await validateEmail(user.email);
        }
        catch(err) {
            expect(err).toBeInstanceOf(Error);
        }

        await User.deleteMany({});
        await server.close();
    });
});