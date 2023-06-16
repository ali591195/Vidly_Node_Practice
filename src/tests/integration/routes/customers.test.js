const request = require('supertest');
const { User } = require('../../../models/user');
const {Customer} = require('../../../models/customer');
const mongoose = require('mongoose');

require('../../../../functions/index');

describe('/api/customers', () => {
    let server;
    let token;
    let customer;

    beforeEach(async () => {
        server = require('../../../startup/port');

        customer = new Customer({
            name: 'abc',
            phone: '12345678901'
        });
        await customer.save();
        token = User().generateAuthToken();
    });
    afterEach( async () => {
        await Customer.deleteMany({});
        await server.close();
    });

    describe('POST /', () => {
        beforeEach( async () => {
            await Customer.deleteMany({});
        })

        const exec = () => {
            return request(server)
                .post('/api/customers')
                .set('x-auth-token', token)
                .send({
                    name: customer.name,
                    phone: customer.phone
                })
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return status 400 if invalid request', async () => {
            customer.name = ''

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 200 and the new created customer is returned if request is valid', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                name: 'abc',
                phone: '12345678901'
            });
        });
    });
    describe('GET /', () => {
        it('should return all customers', async () => {
            const res = await request(server).get('/api/customers');

            expect(res.body[0]).toMatchObject({
                name: 'abc',
                phone: '12345678901'
            });
        });
    });
    describe('GET /:id', () => {
        const exec = () => {
            return request(server).get(`/api/customers/${customer._id}`);
        }

        it('should return 404 if no customer is found', async () => {
            customer._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return 200 with the customer if valid request', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                name: 'abc',
                phone: '12345678901'
            });
        });
    });
    describe('DELETE /:id', () => {
        const exec = () => {
            return request(server)
                .delete(`/api/customers/${customer._id}`)
                .set('x-auth-token', token)
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return 404 if no customer is found', async () => {
            customer._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 200 with the updated customer if valid request', async () => {
            const res = await exec();

            const customerInDb = await Customer.findById(customer._id);

            expect(res.status).toBe(200);
            expect(customerInDb).toBeNull();
            expect(res.body).toMatchObject({
                acknowledged: true
            });
        });
    });
    describe('PUT /:id', () => {
        beforeEach(() => {
            customer.name = 'abcupdated';
        });

        const exec = () => {
            return request(server)
                .put(`/api/customers/${customer._id}`)
                .set('x-auth-token', token)
                .send({
                    name: customer.name,
                })
        };

        it('should return status 401 if authorization failed', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('should return 404 if no customer is found', async () => {
            customer._id = new mongoose.Types.ObjectId;

            const res = await exec();

            expect(res.status).toBe(404);
        });
        it('should return status 400 if invalid request', async () => {
            customer.name = ''

            const res = await exec();

            expect(res.status).toBe(400);
        });
        it('should return status 200 with the updated customer if valid request', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                name: 'abcupdated'
            });
        });
    });
});