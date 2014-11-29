module.exports = function (grunt) {
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    browserify : {
      build : {
        src : 'client/js/main.js',
        dest : 'public/js/main.js'
      }
    },
    sass : {
      dist : {
        options : {
          sourcemap : 'none'
        },
        files : {
          'public/css/main.css' : 'client/sass/main.scss',
          'public/css/admin.css' : 'client/sass/admin.scss'
        }
      }
    },
    watch : {
      css : {
        files : 'client/**/*.scss',
        tasks : [ 'sass' ]
      },
      js : {
        files : 'client/**/*.js',
        tasks : [ 'browserify' ]
      }
    }
  })

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', [ 'sass', 'browserify' ])
}