/*
 *  common http API tasks
 *
 */
var codes = require('http').STATUS_CODES

function respond (res, status, data) {
  
  res.status(status)

  // contentless response
  if (typeof data !== 'object') {
    return res.end()
  }

  var body = {
    status : codes[status],
    statusCode : status
  }

  Object.keys(data).forEach(function (key) {
    body[key] = data[key]
  })

  res.send(body)
}

// check that object `data` has fields in array
// `required`; return an array of anything in
// `required` not in `data`
exports.validate = function (required, data) {
  return required.filter(function (item) {
    return !data[item]
  })
}

// sanitize object `data` per `strategy`
// if `strategy` is 'whitelist' (default),
// return an object with only the fields
// that are truthy in object `props`; if
// `strategy` is 'blacklist', then return
// object with only properties that have
// falsy (or undefined) values in `props`
exports.sanitize = function (data, props, strategy) {
  blacklist = strategy === 'blacklist'
  var p = Object.create(null)
  
  Object.keys(data).forEach(function (key) {
    if (blacklist ? !props[key] : props[key]) {
      p[key] = data[key]
    }
  })
  return p
}


/*
 *  responses
 *
 */

// 200 OK
exports.ok = function (res, data) {
  respond(res, 200, { data : data })
}

// 201 Created
exports.created = function (res, data) {
  respond(res, 201, { data : data })
}

// 204 No Content
exports.noContent = function (res) {
  respond(res, 204)
}

// 400 Bad Request
exports.badRequest = function (res, msg) {
  respond(res, 400, { error : msg || 'bad request' })
}

// 401 Not Authorized
exports.notAuthorized = function (res, msg) {
  respond(res, 401, { error : msg || 'must be logged in to perform specified action' })
}

// 404 Not Found
exports.notFound = function (res, msg) {
  respond(res, 404, { error : msg || 'resource does not exist' })
}

// 500 Internal Server Error
exports.internalServerError = function (res, msg) {
  respond(res, 500, { error : msg || 'error processing request' })
}

// 501 Not Implemented
exports.notImplemented = function (res, msg) {
  respond(res, 501, { error : msg || 'request not implemented' })
}