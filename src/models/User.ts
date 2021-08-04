import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({ 
  name: String, 
  email: {
    type: String,
    required: true,
    unique: true
  },
  lowercaseName: String,
  lowercaseEmail: String,
  following: Array,
  followers: Array,
  nsfw: Boolean,
  private: Boolean,
  rank: String,
  description: String,
  password: String,
  avatar: String,
  joinedAt: Date,
  emailVerified: Boolean
})

export default mongoose.model('user', UserSchema)