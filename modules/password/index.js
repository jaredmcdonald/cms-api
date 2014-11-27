var crypto = require('crypto')

module.exports = function (algo, password) {
  var fn = {}

  fn.encrypt = function (pw) {
    var cipher = crypto.createCipher(algo, password)
    ,   encrypted = cipher.update(pw, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }
  fn.decrypt = function (hex) {
    var decipher = crypto.createDecipher(algo, password)
    ,   decrypted = decipher.update(hex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  return fn
}
