/*jslint nomen: true*/
/*global require, module,  __dirname */

module.exports = function (grunt) {
    'use strict';

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var path = require('path');

    var packageJson = grunt.file.readJSON('package.json');
    var dependencies = [];
    for (var dep in packageJson.dependencies) {
        dependencies.push('node_modules/' + dep + '/**/*.*');
    }

    var mainScript = path.parse(packageJson.scripts.start);

    var launcher = {
        name: packageJson.name,
        scripts: {
            start: ['node', mainScript.base].join(' ')
        }
    };

    // Configure Grunt
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        project: {
            build: './build',
            dist: './dist',
            app: './src'
        },

        'file-creator': {
            'packageJson': {
                'dist/package.json': function (fs, fd, done) {
                    fs.writeSync(fd, JSON.stringify(launcher));
                    done();
                }
            }
        },

        jshint: {
            dev: [
                '<%= project.app%>/**/*.js',
                'Gruntfile.js'
            ]
        },

        fileExists: {
            config: ['./src/config.json']
        },

        clean: { // erase all files in dist and build folder
            dist: ['<%= project.dist%>', '<%= project.build%>'],
            dev: ['<%= project.build%>']
        },

        copy: { // Copy files (images, ...)
            dist: {
                files: [
                    { // config.json
                        cwd: '<%= project.app%>',
                        expand: true,
                        flatten: true,
                        src: ['**/config.json'],
                        dest: '<%= project.dist%>'
                    },
                    { // scripts
                        cwd: '<%= project.app%>',
                        expand: true,
                        flatten: false,
                        src: ['**/*.js'],
                        dest: '<%= project.dist%>'
                    },
                    { //deps,
                        flatten: false,
                        expand: true,
                        src: dependencies,
                        dest: '<%= project.dist%>'
                    }
                ],
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'dist.tgz'
                },
                files: [
                    {
                        src: ['<%= project.dist%>/**'],
                        expand: true,
                        dest: '.'
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', [
        'fileExists',
        'jshint',
        'clean:dist',
        'copy',
        'file-creator',
        'compress'
    ]);
};