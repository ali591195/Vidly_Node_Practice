const configFunction = require('../../../startup/config');
const config = require('config');

describe('config', () => {
    it("should throw an error", () => {
        jest.spyOn(config, 'get').mockReturnValueOnce(null);
        expect(() => {configFunction()}).toThrow();
    });
});