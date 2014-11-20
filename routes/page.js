var router = require('express').Router()

module.exports = function (PageModel) {

  /*
   *  ROUTES
   *
   */

  // GET all pages
  router.get('/', function (req, res) {
    var query = {}
    if (!authorized(req)) {
      query.deleted = false
      query.active = true
    }

    PageModel.find(query).exec(function (err, pages) {
      if (err) return dbError(res)

      sendOk(res, pages)
    })
  })

  // GET page
  router.get('/:slug', function (req, res) {
    var query = {
      slug : req.params.slug
    }
    if (!authorized(req)) {
      query.deleted = false
      query.active = true
    }

    PageModel.findOne(query).exec(function (err, page) {
      if (err) return dbError(res)
      if (!page) return notFound(res)

      sendOk(res, page)
    })
  })

  // POST new page
  router.post('/', function (req, res) {
    if (!authorized(req)) return notAuthorized(res)

    var page = req.body

    if (!postValidator(page, res)) return false

    slugExists(PageModel, page.slug, res, function (exists) {
      if (exists) return badRequest(res, 'resource already exists with that slug')

      page.active = !!page.active // guard against 'undefined'
      page.created = page.updated = Date.now()
      page.deleted = false

      new PageModel(page).save(function (err, newPage) {
        if (err) return dbError(res)

        res.status(201).send({
          status : 'created',
          statusCode : 201,
          data : {
            url : '/page/' + newPage.slug
          }
        })
      })
    })
  })

  // DELETE page
  router.delete('/:slug', function (req, res) {
    if (!authorized(req)) return notAuthorized(res)

    PageModel.findOneAndUpdate({
      slug : req.params.slug,
      deleted : false
    }, {
      deleted : true,
      updated : Date.now()
    }).exec(function (err, deletedPage) {
      if (err) return dbError(res)
      if (!deletedPage) return notFound(res)

      res.status(204).end()
    })
  })

  // PATCH page
  router.patch('/:slug', function (req, res) {
    if (!authorized(req)) return notAuthorized(res)

    var page = req.body

    page = removeProps(page, { 'slug' : true }) // don't allow changing of slug
    page.updated = Date.now()

    PageModel.findOneAndUpdate({
      slug : req.params.slug
    }, page).exec(function (err, updatedPage) {
      if (err) return dbError(res)
      if (!updatedPage) return notFound(res)

      res.status(204).end()
    })
  })

  return router

}

/*
 *  HELPERS
 *
 */

function authorized (req) {
  return true // temp
}

function removeProps (page, props) {
  var p = Object.create(null)
  for (var key in page) {
    if (!props[key]) {
      p[key] = page[key]
    }
  }
  return p
}

function slugExists (model, slug, res, cb) {
  model.count({ slug : slug }).exec(function (err, count) {
    if (err) return dbError(res)

    cb(count !== 0)
  })
}

function postValidator (data, res) {
  var missing = ['slug', 'content', 'title'].filter(function (item) {
    return !data[item]
  })

  if (missing.length) {
    badRequest(res, 'missing fields: ' + missing.join(', '))
    return false
  }

  return true
}

function sendOk (res, data) {
  res.status(200).send({
    status : 'ok',
    statusCode : 200,
    data : data
  })
}

function badRequest (res, msg) {
  res.status(400).send({
    status : 'bad request: ' + msg,
    statusCode: 400
  })
}

function notAuthorized (res) {
  res.status(401).send({
    status : 'not authorized',
    statusCode : 401
  })
}

function notFound (res) {
  res.status(404).send({
    status : 'not found',
    statusCode : 404
  })
}

function dbError (res) {
  res.status(500).send({
    status : 'internal server error',
    statusCode : 500
  })
}
