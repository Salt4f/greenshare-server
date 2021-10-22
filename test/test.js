const validate = require('../utils/data-validation');
var assert = require('assert');

describe('data-validation', function () {
    describe('#email(email)', function () {
        it('should return false when the value is undefined', function () {
            assert.strictEqual(validate.email(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.strictEqual(validate.email(''), false);
        });
        it('should return false when the value length is smaller than the minimum accepted', function () {
            assert.strictEqual(validate.email('r@c'), false);
        });
        it('should return false when the value length is greater than the maximum accepted', function () {
            assert.strictEqual(
                validate.email(
                    'xavier.garcia.merino.jimenezzzz@estudiantat.upc.edu'
                ),
                false
            );
        });
        it("should return false when the value doesn't comply with regex", function () {
            assert.strictEqual(
                validate.email('admin.@greensharebcn.com'),
                false
            );
        });
        it('should return true when the email is valid', function () {
            assert.strictEqual(validate.email('admin@greensharebcn.com'), true);
        });
    });
    describe('#nickname(nickname)', function () {
        it('should return false when the value is undefined', function () {
            assert.strictEqual(validate.nickname(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.strictEqual(validate.nickname(''), false);
        });
        it('should return false when the value length is smaller than the minimum accepted', function () {
            assert.strictEqual(validate.nickname('alex'), false);
        });
        it('should return false when the value length is greater than the maximum accepted', function () {
            assert.strictEqual(
                validate.nickname('xavier.garcia.merino.jimenez123'),
                false
            );
        });
        it('should return true when the nickname is valid', function () {
            assert.strictEqual(validate.nickname('greenshare'), true);
        });
    });
    describe('#password(password)', function () {
        it('should return false when the value is undefined', function () {
            assert.strictEqual(validate.password(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.strictEqual(validate.password(''), false);
        });
        it('should return true when the password is valid', function () {
            assert.strictEqual(validate.password('a#r30ac!apoAWASag'), true);
        });
    });
    describe('#id(id)', function () {
        it('should return false when the value is undefined', function () {
            assert.strictEqual(validate.id(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.strictEqual(validate.id(''), false);
        });
        it('should return false when the value is negative', function () {
            assert.strictEqual(validate.id(-2), false);
        });
        it('should return true when the password is valid', function () {
            assert.strictEqual(validate.id(42069), true);
        });
    });
    describe('#token(token)', function () {
        it('should return false when the value is undefined', function () {
            assert.strictEqual(validate.token(undefined), false);
        });
        it('should return false when the value is empty', function () {
            assert.strictEqual(validate.token(''), false);
        });
        it('should return true when the password is valid', function () {
            assert.strictEqual(validate.token('a#r30ac!apoAWASag'), true);
        });
    });
});
