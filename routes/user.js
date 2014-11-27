var router = require('express').Router()
,   utils = require('../modules/http-utils')
,   auth = require('../modules/auth')
,   password = require('../modules/password')

module.exports = function (UserModel) {
  
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
    if (!postValidator(req.body, res)) return false

    var user = hashPassword(req.body)

    userExists (UserModel, user.username, res, function (exists) {
      if (exists) return utils.badRequest(res, 'user with given username already exists')

      user.created = Date.now()

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
    if (!postValidator(req.body, res)) return false

    var user = utils.sanitize(hashPassword(req.body), { username : true, pw : true })

    UserModel.findOne(user).exec(function (err, validatedUser) {
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

    // only allow field 'password' to be PATCHed by username
    // (updating username if you are accessing the resource
    //  by username is nonsensical, and updating 'created'
    //  timestamp should be disallowed)
    var user = hashPassword(utils.sanitize(req.body, { password : true }))

    UserModel.findOneAndUpdate({
      username : req.params.user
    }, user).exec(function (err, updatedUser) {
      if (err) return utils.internalServerError(res)
      if (!updatedUser) return utils.notFound(res)

      utils.noContent(res)
    })
  })

  // DELETE specific user
  router.delete('/:user', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    UserModel.find({ username : req.params.user }).remove().exec(function (err, deletedUser) {
      if (err) return utils.internalServerError(res)
      if (!deletedUser) return utils.notFound(res, 'user with supplied username does not exist')

      utils.noContent(res)
    })
  })

  return router

}

// swap field 'password' for encrypted 'pw'
function hashPassword (user) {
  // if no 'password' prop, just return `user`
  if (user.password) {
    var pw = password.hash(user.password)
    
    user = utils.sanitize(user, { password : true }, 'blacklist')
    user.pw = pw    
  }
  return user
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

