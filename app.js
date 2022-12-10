var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
let mongoose = require('mongoose')
let session = require('express-session')
var MongoStore = require('connect-mongo')
let flash = require('connect-flash')

require('dotenv').config()
// connect database
mongoose.connect('mongodb://localhost/blog-app-with-Authrization', (err) => {
  console.log(err ? err : 'sucessfully connected')
})

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var commentRouter = require('./routes/comment')
let auth = require('./middlewares/auth')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// add a session middelware
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost/blog-app-with-Authrization',
    }),
  }),
)

//  flash message  middelware
app.use(flash())

// userinfo middelware
app.use(auth.userInfo)

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/comment', commentRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
