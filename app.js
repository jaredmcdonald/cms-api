var express = require('express')
,   path = require('path')
,   favicon = require('serve-favicon')
,   logger = require('morgan')
,   cookieParser = require('cookie-parser')
,   session = require('express-session')
,   bodyParser = require('body-parser')
,   mongoose = require('mongoose')
,   baseApiPath = '/api/v1'

// models
,   models = {
      page : require('./models/page')(mongoose),
      user : require('./models/user')(mongoose)
    }

// paths for routing
,   apiPaths = {
      page : baseApiPath + '/page',
      user : baseApiPath + '/user'
    }

// routes
,   routes = {
      // API routes
      page : require('./routes/page')(models.page, apiPaths.page),
      user : require('./routes/user')(models.user, apiPaths.user),
      
      // HTML UI routes for FE javascript app
      index : require('./routes/index')(),
      admin : require('./routes/admin')()
    }

// app
,   app = express()

if (!process.env.SECRET) {
  console.error('cms-api: missing environment variable $SECRET')
  process.exit(1)
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
  resave : false,
  saveUninitialized: false,
  secret : process.env.SECRET
}))
app.use(express.static(path.join(__dirname, 'public')))

// connect to DB
mongoose.connect(process.env.MONGOLAB_URI || 'localhost/cms')

// initialize routes
app.use(apiPaths.page, routes.page)
app.use(apiPaths.user, routes.user)
app.use('/', routes.index)
app.use('/admin', routes.admin)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
