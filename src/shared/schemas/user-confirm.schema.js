/*global module, require*/
module.exports = function (server) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var crypto = require('crypto');
    require('mongoose-type-email');

    var validateEmail = function (email) {
        var re = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email);
    };

    var UserConfirmSchema = new Schema({
        email: {
            type: String,
            required: 'Email address is required',
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [/^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        token: String,
        expire: Date
    });

    UserConfirmSchema.pre('save', function (next) {
        var self = this;
        var expire = new Date().getTime() + 3600 * 1000 * 2;
        this.expire = this.expire ? this.expire : new Date(expire);
        crypto.randomBytes(48, function (ex, buf) {
            self.token = buf.toString('hex');
            return next();
        });
    });

    var processRelations = function () {};

    return {
        schema: UserConfirmSchema,
        postLoad: processRelations
    };
};