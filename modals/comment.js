let mongoose = require('mongoose')
let Schema = mongoose.Schema
let commentSchema = new Schema(
  {
    comment: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
    like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Comment', commentSchema)
