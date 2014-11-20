var express = require('express')
,   path = require('path')
,   favicon = require('serve-favicon')
,   logger = require('morgan')
,   cookieParser = require('cookie-parser')
,   bodyParser = require('body-parser')
,   mongoose = require('mongoose')
,   http = require('http')

// models
,   models = {
      page : require('./models/page')(mongoose)
    }

// routes
,   routes = {
      page : require('./routes/page')(models.page)
    }

// app
,   app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// initialize routes
app.use('/page', routes.page)

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
