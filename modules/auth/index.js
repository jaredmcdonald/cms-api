var authToken = 'abc123' // todo - generate on a per-user, per-session basis

exports.authorized = function (req) {
  return req.session.authToken === authToken
}

exports.authorize = function (req) {
  req.session.authToken = authToken
}
