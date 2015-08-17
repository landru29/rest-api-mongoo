module.exports = function (server) {
    'use strict';
    return function (schema, options) {
        schema.add({
            modifiedAt: Date
        });

        schema.pre('save', function (next) {
            this.lastMod = new Date();
            next();
        });
    };
};