module.exports = function (mongoose) {

  var pageSchema = mongoose.Schema({
    slug : String,
    title : String,
    content : String,
    created : Number,
    updated : Number,
    active : Boolean,
    deleted : Boolean
  })

  return mongoose.model('Page', pageSchema)
}
