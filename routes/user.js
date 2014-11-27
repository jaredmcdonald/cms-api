var router = require('express').Router()
,   utils = require('../modules/http-utils')
,   auth = require('../modules/auth')

module.exports = function (UserModel, password) {
  
  /*
   *  ROUTES
   *
   */

  // GET all users
  router.get('/', function (req, res) {
    // GET endpoints for users are protected
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    UserModel.find({}, '-__v -pw').exec(function (err, users) {
      if (err) return utils.internalServerError(res)

      utils.ok(res, users)
    })
  })

  // GET specific user by username
  router.get('/:user', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    UserModel.findOne({ username : req.params.user }, '-__v -pw').exec(function (err, user) {
      if (err) return utils.internalServerError(res)
      if (!user) return utils.notFound(res)

      utils.ok(res, user)
    })
  })

  // POST new user
  router.post('/', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    var user = req.body

    if (!postValidator(user, res)) return false

    userExists (UserModel, req.body.username, res, function (exists) {
      if (exists) return utils.badRequest(res, 'user with given username already exists')

      user.created = Date.now()
      user.pw = password.encrypt(user.password)
      delete user.password

      new UserModel(user).save(function (err, newUser) {
        if (err) return utils.internalServerError(res)

        utils.created(res, {
          url : '/api/v1/user/' + newUser.username
        })
      })
    })
  })

  // POST to auth user (start session)
  router.post('/login', function (req, res) {
    var user = req.body

    if (!postValidator(user, res)) return false

    UserModel.findOne({
      username : user.username,
      pw : password.encrypt(user.password)
    }).exec(function (err, validatedUser) {
      if (err) return utils.internalServerError(res)
      if (!validatedUser) return utils.notAuthorized(res, 'authentication failed')

      auth.authorize(req) // begin authorized session
      utils.noContent(res)
    })
  })

  // POST to log out (kill session)
  router.post('/logout', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res, 'not logged in')
    
    auth.logout(req)
    utils.noContent(res)
  })

  // PATCH specific user
  router.patch('/:user', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    utils.notImplemented(res)
  })

  // DELETE specific user
  router.delete('/:user', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    utils.notImplemented(res)
  })

  return router

}

function postValidator (data, res) {
  var missing = utils.validate(['username', 'password'], data)

  if (missing.length) {
    utils.badRequest(res, 'missing fields: ' + missing.join(', '))
    return false
  }

  return true
}

function userExists (model, un, res, cb) {
  model.count({ username : un }).exec(function (err, count) {
    if (err) return utils.internalServerError(res)

    cb(count !== 0)
  })
}

