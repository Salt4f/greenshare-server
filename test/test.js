const validate = require('../utils/data-validation');
var assert = require('assert');

describe('data-validation', function () {
    describe('#email(email)', function () {
        it('should return false when the value is undefined', function () {
            assert.equal(validate.email(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.equal(validate.email(''), false);
        });
        it('should return false when the value length is smaller than the minimum accepted', function () {
            assert.equal(validate.email('r@c'), false);
        });
        it('should return false when the value length is greater than the maximum accepted', function () {
            assert.equal(
                validate.email(
                    'xavier.garcia.merino.jimenezzzz@estudiantat.upc.edu'
                ),
                false
            );
        });
        it("should return false when the value doesn't comply with regex", function () {
            assert.equal(validate.email('admin.@greensharebcn.com'), false);
        });
        it('should return true when the email is valid', function () {
            assert.equal(validate.email('admin@greensharebcn.com'), true);
        });
    });
    describe('#nickname(nickname)', function () {
        it('should return false when the value is undefined', function () {
            assert.equal(validate.nickname(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.equal(validate.nickname(''), false);
        });
        it('should return false when the value length is smaller than the minimum accepted', function () {
            assert.equal(validate.nickname('alex'), false);
        });
        it('should return false when the value length is greater than the maximum accepted', function () {
            assert.equal(
                validate.nickname('xavier.garcia.merino.jimenez123'),
                false
            );
        });
        it('should return true when the nickname is valid', function () {
            assert.equal(validate.nickname('greenshare'), true);
        });
    });
});
