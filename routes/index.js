var router = require('express').Router()

module.exports = function () {
  router.get('/', function (req, res) {
    res.status(200)
    res.render('index', { title : 'Index '})
  })

  return router
}