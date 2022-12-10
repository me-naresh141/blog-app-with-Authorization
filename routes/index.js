var express = require('express')
var router = express.Router()
let User = require('../modals/user')
let Article = require('../modals/articles')
let auth = require('../middlewares/auth')
// multer
let multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now + file.originalname)
  },
})
var upload = multer({ storage: storage })

/* GET home page. */
router.get('/', function (req, res, next) {
  // console.log(req.session)
  Article.find({})
    .populate('authorId', 'name image')
    .exec((err, article) => {
      return res.render('index', { article })
    })
})

// find a register form
router.get('/register', (req, res, next) => {
  res.render('register')
})

router.post('/register', upload.single('image'), (req, res, next) => {
  req.body.image = req.file.filename
  let email = req.body.email
  User.findOne({ email }, (err, user) => {
    if (!user) {
      User.create(req.body, (err, user) => {
        if (err) return next(err)
        return res.redirect('/login')
      })
    } else {
      req.flash('error', 'This email allready  available . please login')
      return res.redirect('/login')
    }
  })
})
// find a login form
router.get('/login', (req, res, next) => {
  let error = req.flash('error')[0]
  // console.log(error)
  return res.render('login', { error })
})
//
router.post('/login', (req, res, next) => {
  let { email, password } = req.body
  if (!email || !password) {
    req.flash('error', ' Email, password is required')
    return res.redirect('/login')
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err)
    // no user
    if (!user) {
      req.flash('error', ' Email is invalid')
      return res.redirect('/login')
    }
    // password compare
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err)
      if (!result) {
        req.flash('error', 'Password is invalid')
        return res.redirect('/login')
      }
      // persist loged in user information
      req.session.userId = user.id
      return res.redirect('/')
    })
  })
})
module.exports = router
