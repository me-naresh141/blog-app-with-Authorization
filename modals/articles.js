let mongoose = require('mongoose')
let Schema = mongoose.Schema

let ArticleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    catagory: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)
module.exports = mongoose.model('Article', ArticleSchema)
