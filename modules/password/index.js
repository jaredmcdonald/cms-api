var crypto = require('crypto')

// store passwords as md5 checksums
exports.hash = function (pw) {
  var hash = crypto.createHash('md5')
  hash.write(pw)
  return hash.digest('hex')
}
