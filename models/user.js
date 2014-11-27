module.exports = function (mongoose) {

  var userSchema = mongoose.Schema({
    username : String,
    pw : String, // encrypted
    created : Number
  })

  return mongoose.model('User', userSchema)
}