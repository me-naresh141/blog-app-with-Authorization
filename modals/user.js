let mongoose = require('mongoose')
let Schema = mongoose.Schema
let bcrypt = require('bcrypt')
let UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

//
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err)
      console.log(hashed)
      this.password = hashed
      return next()
    })
  }
})
//
UserSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result)
  })
}

module.exports = mongoose.model('User', UserSchema)
