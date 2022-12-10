let express = require('express')
let router = express.Router()
let Comment = require('../modals/comment')
let Article = require('../modals/articles')
let auth = require('../middlewares/auth')

// auth middelware
router.use(auth.isUserLogged)

// find edit comment form
router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id
  let userId = req.session.userId
  Comment.findById(id, (err, comment) => {
    // console.log(comment)
    if (err) return next(err)
    if (comment.userId == userId) {
      return res.render('editcomment', { comment })
    } else {
      req.flash('error', 'you can only edit your comment.')
      return res.redirect('/users/' + comment.articleId)
    }
  })
})
// submit edit comment
router.post('/:id', (req, res, next) => {
  let id = req.params.id
  Comment.findByIdAndUpdate(id, req.body, (err, comment) => {
    return res.redirect('/users/' + comment.articleId)
  })
})

// like comment
router.get('/:id/like', (req, res, next) => {
  let id = req.params.id
  Comment.findById(id, (err, comment) => {
    console.log(comment)
    if (!comment.like.includes(req.session.userId)) {
      Comment.findByIdAndUpdate(
        id,
        { $push: { like: req.session.userId } },
        { new: true },
        (err, comment) => {
          if (err) return next(err)
          return res.redirect('/users/' + comment.articleId)
        },
      )
    } else {
      Comment.findByIdAndUpdate(
        id,
        { $pull: { like: req.session.userId } },
        { new: true },
        (err, comment) => {
          if (err) return next(err)
          return res.redirect('/users/' + comment.articleId)
        },
      )
    }
  })
})

// delete comment
router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id
  let userId = req.session.userId
  Comment.findById(id, (err, comment) => {
    if (userId == comment.userId) {
      Comment.findByIdAndDelete(id, (err, comment) => {
        let articleid = comment.articleId
        Article.findByIdAndUpdate(
          articleid,
          { $pull: { comments: comment._id } },
          (err, article) => {
            Article.findByIdAndUpdate(
              articleid,
              { $pull: { userId: comment.userId } },
              (err, article) => {
                return res.redirect('/users/' + comment.articleId)
              },
            )
          },
        )
      })
    } else {
      req.flash('error', 'you can only delete your comment.')
      return res.redirect('/users/' + comment.articleId)
    }
  })
})

module.exports = router
