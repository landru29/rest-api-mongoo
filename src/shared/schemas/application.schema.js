/*global module, require*/
module.exports = function (server) {
    'use strict';

    var mongoose     = require('mongoose');
    var Schema       = mongoose.Schema;

    var ApplicationSchema   = new Schema({
        name: {
            type: String,
            required: 'Name is required'
        },
        active: {
            type: Boolean,
            default: true
        }
    });
    
    var processRelations = function() {};

    return {
        schema: ApplicationSchema,
        postLoad: processRelations
    };
};