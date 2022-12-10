var express = require('express')
var router = express.Router()
let User = require('../modals/user')
let Article = require('../modals/articles')
let Comment = require('../modals/comment')
let auth = require('../middlewares/auth')
const { model } = require('mongoose')
const { populate } = require('../modals/user')

/* GET users listing. */

router.get('/', function (req, res, next) {
  Article.find({})
    .populate('authorId', 'name image')
    .exec((err, article) => {
      return res.render('index', { article })
    })
})

// submit article form
router.post('/', (req, res, next) => {
  req.body.authorId = req.session.userId
  Article.create(req.body, (err, article) => {
    if (err) return next(err)
    return res.redirect('/users')
  })
})

// find article form
router.get('/new', auth.isUserLogged, (req, res, next) => {
  return res.render('articleform')
})

// logout
router.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.clearCookie('connect.sid')
  return res.redirect('/')
})

// find singal Article details
router.get('/:id', (req, res, next) => {
  let error = req.flash('error')[0]
  console.log(error)
  let id = req.params.id
  Article.findById(id)
    .populate('authorId')
    .exec((err, article) => {
      Comment.find({ articleId: id })
        .populate('userId')
        .exec((err, comments) => {
          console.log(err, article)
          console.log(err, comments)
          return res.render('articleDetails', { article, error, comments })
        })
    })
})

// like article
router.get('/:id/like', auth.isUserLogged, (req, res, next) => {
  let id = req.params.id
  Article.findById(id, (err, article) => {
    if (err) return next(err)
    if (!article.like.includes(req.session.userId)) {
      Article.findByIdAndUpdate(
        id,
        { $push: { like: req.session.userId } },
        (err, article) => {
          if (err) return next(err)
          return res.redirect('/users/' + id)
        },
      )
    } else {
      Article.findByIdAndUpdate(
        id,
        { $pull: { like: req.session.userId } },
        (err, article) => {
          if (err) return next(err)
          return res.redirect('/users/' + id)
        },
      )
    }
  })
})

// delete article
router.get('/:id/delete', auth.isUserLogged, (req, res, next) => {
  let id = req.params.id
  let userId = req.session.userId
  Article.findById(id)
    .populate('authorId')
    .exec((err, article) => {
      let articleAuthorId = article.authorId._id
      if (articleAuthorId == userId) {
        Article.findByIdAndDelete(id, (err, article) => {
          return res.redirect('/users')
        })
      } else {
        req.flash('error', 'you can only delete your  article.')
        return res.redirect('/users/' + id)
      }
    })
})

//  find update article form
router.get('/:id/edit', auth.isUserLogged, (req, res, next) => {
  let id = req.params.id
  let userId = req.session.userId
  Article.findById(id)
    .populate('authorId')
    .exec((err, article) => {
      let articleAuthorId = article.authorId._id
      if (userId == articleAuthorId) {
        Article.findById(id, (err, article) => {
          return res.render('editForm', { article })
        })
      } else {
        req.flash('error', 'Sorry, you can only edit your  article.')
        return res.redirect('/users/' + id)
      }
    })
})
// submit update form
router.post('/:id', (req, res, next) => {
  let id = req.params.id
  Article.findByIdAndUpdate(id, req.body, { new: true }, (err, article) => {
    if (err) return next(err)
    return res.redirect('/users/' + id)
  })
})

// create comment
router.post('/:id/comments', auth.isUserLogged, (req, res, next) => {
  let id = req.params.id
  req.body.userId = req.session.userId
  req.body.articleId = req.params.id
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err)
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment._id } },
      { new: true },
      (err, article) => {
        if (err) return next(err)
        Article.findByIdAndUpdate(
          id,
          { $push: { userId: req.session.userId } },
          { new: true },
          (err, article) => {
            return res.redirect('/users/' + id)
          },
        )
      },
    )
  })
})

// find my article
router.get('/:id/myarticle', auth.isUserLogged, (req, res, next) => {
  let id = req.params.id
  console.log('userid', id)
  Article.find({ authorId: id })
    .populate('authorId', 'name image')
    .exec((err, article) => {
      return res.render('index', { article })
    })
})

module.exports = router
