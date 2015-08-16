module.exports = function(fields, descriptor) {
    'use strict';
    var _ = require('lodash');
    
    // All keys in fields has a descriptor
    for (var key in fields) {
        if (fields.hasOwnProperty(key) && !descriptor.hasOwnProperty(key)) {
            return 'Unknown property: ' + key;
        }
    }
    
    // All mendatory fields are present
    for (var key in descriptor) {
        if (descriptor.hasOwnProperty(key) && descriptor[key] && !fields.hasOwnProperty(key)) {
            return 'Missing property: ' + key;
        }
        if (descriptor.hasOwnProperty(key) && descriptor[key] && fields.hasOwnProperty(key)) {
            if ((_.isRegExp(descriptor[key])) && (!descriptor[key].test(fields[key]))) {
                return 'Bad value: ' + key;
            }
        }
    }
    
    return false;
}