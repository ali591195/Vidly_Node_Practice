const error = require('../../../middleware/error');

describe('error', () => {
    it('should return status 500 if an err is passed to it', () => {
        const err = new Error('Error');
        const res = jest.fn().mockReturnThis();
        res.status = jest.fn().mockReturnThis();
        res.send = jest.fn();

        error(err, 0, res, 0);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
