let User = require('../modals/user')
module.exports = {
  isUserLogged: (req, res, next) => {
    if (req.session && req.session.userId) {
      next()
    } else {
      res.redirect('/login')
    }
  },
  userInfo: (req, res, next) => {
    var userId = req.session && req.session.userId
    if (userId) {
      User.findById(userId, 'name image', (err, user) => {
        if (err) return next(err)
        req.user = user
        res.locals.user = user
        next()
      })
    } else {
      req.user = null
      res.locals.user = null
      next()
    }
  },
}
