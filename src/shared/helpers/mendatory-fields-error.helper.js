/*global module, require*/
module.exports = function (server) {
    'use strict';
    return function (fields, descriptor) {
        var _ = require('lodash');

        // All keys in fields has a descriptor
        for (var keyF in fields) {
            if (fields.hasOwnProperty(keyF) && !descriptor.hasOwnProperty(keyF)) {
                return 'Unknown property: ' + keyF;
            }
        }

        // All mendatory fields are present
        for (var keyD in descriptor) {
            if (descriptor.hasOwnProperty(keyD) && descriptor[keyD] && !fields.hasOwnProperty(keyD)) {
                return 'Missing property: ' + keyD;
            }
            if (descriptor.hasOwnProperty(keyD) && descriptor[keyD] && fields.hasOwnProperty(keyD)) {
                if ((_.isRegExp(descriptor[keyD])) && (!descriptor[keyD].test(fields[keyD]))) {
                    return 'Bad value: ' + keyD;
                }
            }
        }

        return false;
    };
};