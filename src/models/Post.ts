import mongoose, { Schema } from 'mongoose'

const PostSchema: Schema = new Schema({ 
  author: String,
  title: String,
  description: String,
  likes: Number,
  dislikes: Number,
  views: Number,
  image: String,
  createdAt: Date
})

export default mongoose.model('post', PostSchema)