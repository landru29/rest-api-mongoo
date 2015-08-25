/*global module*/
module.exports = function (server) {
'use strict';
    var Application = server.models.Application;
    var _ = require('lodash');
    

    /**
     * Read all applications
     * @param {function} callback Callback function
     */
    function readApplications(callback) {
        Application.find(callback);
    }

    /**
     * Get an application by ID
     * @param {String} id         Application Identifier
     * @param {function} callback Callback function
     */
    function readApplicationById(id, callback) {
        Application.findById(id, callback);
    }
    
    /**
     * Get an application by Name
     * @param {String} name       Application Name
     * @param {function} callback Callback function
     */
    function readApplicationByName(name, callback) {
        Application.find({name: name}, callback);
    }

    /**
     * Create an Application
     * @param {Object}   ApplicationData Application {name}
     * @param {function} callback Callback function
     */
    function createApplication(applicationData, callback) { 
        var application = new Application();
        application.name = applicationData.name;
        application.active = true;
        application.save(function(err, createdApplication) {
            if (!err) {
                callback(null, {
                    _id: application._id,
                    name: application.name
                    }
                );
            } else {
                 callback(err);
            }
        });
    }

    /**
     * Delete a Application
     * @param {String} id         Application Identifier
     * @param {function} callback Callback function
     */
    function deleteApplication(id, callback) {
        Application.remove({
            _id: id
        }, callback);
    }

    /**
     * [[Description]]
     * @param {String} id         Application Identifier
     * @param {Object}   ApplicationData Application {name, email, password}
     * @param {function} callback Callback function
     */
    function updateApplication(id, applicationData, callback) {
        Application.findById(id, function (err, application) {
            if (err) {
                return callback(err);
            }
            if (applicationData.name) {
                application.name = applicationData.name;
            }
            if (applicationData.active) {
                application.active = applicationData.active;
            }
            application.save(callback);
        });
    }


    return {
        readApplications: readApplications,
        readApplicationById: readApplicationById,
        readApplicationByName: readApplicationByName,
        createApplication: createApplication,
        deleteApplication: deleteApplication,
        updateApplication: updateApplication        
    };
};