/* eslint-disable no-param-reassign */
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Missing username'],
    unique: true,
    minlength: [3, 'Username must have a minimum length of 3 characters'],
  },
  favoriteGenre: String
})

const User = mongoose.model('User', userSchema)
module.exports = User
