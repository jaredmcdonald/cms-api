var router = require('express').Router()
,   utils = require('../modules/http-utils')
,   auth = require('../modules/auth')

module.exports = function (PageModel) {

  /*
   *  ROUTES
   *
   */

  // GET all pages
  router.get('/', function (req, res) {
    var authValues = getAuthHandler({}, req)

    PageModel.find(authValues.query, authValues.remove).exec(function (err, pages) {
      if (err) return utils.internalServerError(res)

      utils.ok(res, pages)
    })
  })

  // GET page
  router.get('/:slug', function (req, res) {
    var authValues = getAuthHandler({
      slug : req.params.slug
    }, req)

    PageModel.findOne(authValues.query, authValues.remove).exec(function (err, page) {
      if (err) return utils.internalServerError(res)
      if (!page) return utils.notFound(res)

      utils.ok(res, page)
    })
  })

  // POST new page
  router.post('/', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    var page = req.body

    if (!postValidator(page, res)) return false

    slugExists(PageModel, page.slug, res, function (exists) {
      if (exists) return utils.badRequest(res, 'page already exists with that slug')

      page.active = !!page.active // guard against 'undefined'
      page.created = page.updated = Date.now()
      page.deleted = false

      new PageModel(page).save(function (err, newPage) {
        if (err) return utils.internalServerError(res)
        
        utils.created(res, {
          url : '/api/v1/page/' + newPage.slug
        })
      
      })
    })
  })

  // DELETE page
  router.delete('/:slug', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    PageModel.findOneAndUpdate({
      slug : req.params.slug,
      deleted : false
    }, {
      deleted : true,
      updated : Date.now()
    }).exec(function (err, deletedPage) {
      if (err) return utils.internalServerError(res)
      if (!deletedPage) return utils.notFound(res)

      utils.noContent(res)
    })
  })

  // PATCH page
  router.patch('/:slug', function (req, res) {
    if (!auth.authorized(req)) return utils.notAuthorized(res)

    var page = req.body

    page = utils.sanitize(page, { 'slug' : true }, 'blacklist') // don't allow changing of slug
    page.updated = Date.now()

    PageModel.findOneAndUpdate({
      slug : req.params.slug
    }, page).exec(function (err, updatedPage) {
      if (err) return utils.internalServerError(res)
      if (!updatedPage) return utils.notFound(res)

      utils.noContent(res)
    })
  })

  return router

}

/*
 *  HELPERS
 *
 */

function getAuthHandler (defaultQuery, req) {
  var authValues = {
    query : defaultQuery,
    remove : '-__v'
  }

  if (!auth.authorized(req)) {
    authValues.query.deleted = false
    authValues.query.active = true
    authValues.remove += ' -_id -deleted -active'
  }

  return authValues
}

function slugExists (model, slug, res, cb) {
  model.count({ slug : slug }).exec(function (err, count) {
    if (err) return utils.internalServerError(res)

    cb(count !== 0)
  })
}

function postValidator (data, res) {
  var missing = utils.validate(['slug', 'content', 'title'], data)

  if (missing.length) {
    utils.badRequest(res, 'missing fields: ' + missing.join(', '))
    return false
  }

  return true
}
