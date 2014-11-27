var express = require('express')
,   path = require('path')
,   favicon = require('serve-favicon')
,   logger = require('morgan')
,   cookieParser = require('cookie-parser')
,   session = require('express-session')
,   bodyParser = require('body-parser')
,   mongoose = require('mongoose')
,   http = require('http')

// models
,   models = {
      page : require('./models/page')(mongoose),
      user : require('./models/user')(mongoose)
    }

// routes
,   routes = {
      page : require('./routes/page')(models.page),
      user : require('./routes/user')(models.user)
      // admin : require('./routes/admin')(models.user),
      // index : require('./routes/index')()
    }

// app
,   app = express()

if (!process.env.SECRET) {
  console.error('cms-api: missing environment variable $SECRET')
  process.exit(1)
}

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
  resave : false,
  saveUninitialized: false,
  secret : process.env.SECRET
}))

// initialize routes
app.use('/api/v1/page', routes.page)
app.use('/api/v1/user', routes.user)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({
    status : http.STATUS_CODES[err.status],
    statusCode : err.status
  })
})


// connect to DB
mongoose.connect(process.env.MONGOLAB_URI || 'localhost/cms')

module.exports = app
