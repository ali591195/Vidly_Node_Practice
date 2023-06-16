const request = require('supertest');
const {User} = require('../../../models/user');
const bcrypt = require('bcrypt');

require('../../../../functions/index');

describe('/api/auth', () => {
    let server;
    let user;

    beforeEach(async () => {
        server = require('../../../startup/port');

        const salt = await bcrypt.genSalt(10);

        user = new User({
            name: '123',
            email: 'abc123@gmail.com',
            password: 'abcABC1!'
        });
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();
    });
    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });

    const exec = () => {
        return request(server)
            .post('/api/auth')
            .send({
                email: user.email,
                password: user.password
            })
    }

    it('should return status 400 if the request fails the validation', async () => {
        user = {};
        const res = await exec();

        expect(res.status).toBe(400);
    });
    it('should return status 400 if the email is not registered', async () => {
        user.email = 'abc1234@gmail.com';
        const res = await exec();

        expect(res.status).toBe(400);
    });
    it('should return status 400 if the password is incorrect', async () => {
        user.password = 'abcABC1!X';
        const res = await exec();

        expect(res.status).toBe(400);
    });
    it('should return status 200 if request is valid', async () => {
        user.password = 'abcABC1!';

        const res = await exec();

        expect(res.status).toBe(200);
    });
}); 