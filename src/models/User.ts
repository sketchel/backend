import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({ 
  name: String, 
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  joinedAt: Date
})

export default mongoose.model('user', UserSchema)