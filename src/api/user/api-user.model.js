var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var crypto = require('crypto');
require('mongoose-type-email');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var UserSchema   = new Schema({
    name: {
        type: String, 
        required: 'Name is required'
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    
    user.password = crypto.createHash('sha256').update(user.password).digest('hex');
    next();
});

UserSchema.methods.comparePassword = function(candidatePassword) {
    var user = this;
    return (user.password === crypto.createHash('sha256').update(candidatePassword).digest('hex'));
};

module.exports = mongoose.model('User', UserSchema);