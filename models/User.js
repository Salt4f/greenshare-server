const mongoose = require('mongoose');

// declaring user schema
const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: [true, 'Please provide a nickname'],
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email',
        ],
        unique: true,
    },
});

// USER METHODS
// get name
UserSchema.methods.getName = function () {
    return this.name;
};

module.exports = mongoose.model('User', UserSchema);
