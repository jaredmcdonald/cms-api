module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify : {
      build : {
        src : [ 'client/main.js' ],
        dest : 'public/js/app.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-browserify')
  grunt.registerTask('default', [ 'browserify' ])
}