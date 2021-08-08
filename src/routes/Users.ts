import express, { Router } from 'express'
import bodyParser from 'body-parser'
import argon2, { argon2id } from 'argon2'
import { authMiddleware } from '../middleware/UserMiddleware'
import FormData from 'form-data'
import dataUriToBuffer from 'data-uri-to-buffer'
import fetch from 'node-fetch'

import Session from '../models/Session'
import User from '../models/User'
import Post from '../models/Post'

const UsersRouter = Router()
UsersRouter.use(bodyParser.json())
UsersRouter.use(authMiddleware)

async function getUser(req: express.Request) { // @ts-ignore
  let user = req.user
  return user
}

UsersRouter.route('/').all(async (req, res) => {
  res.status(200).json({
    status: 200,
    route: '/users',
    message: 'Hello World!'
  })
})

UsersRouter.route('/:id').get(async (req, res) => {
  let user = await getUser(req)
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done',
    user: user,
  })
})

const usernameRegex = /^[a-z0-9]+$/i
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

// @ts-ignore
function removeA (arr) {
  let what
  const a = arguments
  let L = a.length
  let ax
  while (L > 1 && arr.length) {
    what = a[--L]
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1)
    }
  }
  return arr
}

UsersRouter.route('/upload').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('No body') // @ts-ignore
  if (!req.body.uri) errors.push('No data')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'errors',
      errors
    })
  }
  let title = req.body.title || 'Untitled'
  let description = req.body.description || 'none'
  var file = new FormData()
  const buffer = dataUriToBuffer(req.body.uri)
  file.append('file', buffer)
  let result = await fetch(process.env.CDN + '/upload', {
    method: 'POST',
    body: file, // @ts-ignore
    headers: {
      Authorization: process.env.CDN_AUTH
    }
  })
  result = await result.json()
  let post = new Post({ // @ts-ignore
    author: req.user.id, // @ts-ignore
    image: process.env.CDN + '/get/' + result.id,
    title: title,
    description: description,
    likes: 0,
    dislikes: 0,
    views: 0,
    createdAt: new Date()
  })
  await post.save()
  return res.status(200).json({
    status: 200,
    success: true,
    post: post
  })
})

UsersRouter.route('/view/:id').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('No body') // @ts-ignore
  if (!req.params.id) errors.push('No id')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'errors',
      errors
    })
  }
  let post = await Post.findOne({ // @ts-ignore
    _id: req.params.id
  }).exec()
  if (!post) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'errors',
      errors: [
        'Post not found'
      ]
    })
  }
  post.views++
  await post.save()
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done',
  })
})

UsersRouter.route('/interact/:id').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('No body') // @ts-ignore
  if (!req.params.id) errors.push('No id')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'errors',
      errors
    })
  }
  let id: any = req.params.id
  let u2 = await User.findOne({
    $or: [
      { _id: id },
      { lowercaseName: id.toLowerCase() }
    ]
  }).exec()
  let u1 = await User.findOne({ // @ts-ignore
    _id: req.user._id
  }).exec()
  if (!u2) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: 'errors',
      errors: [
        'Invalid user'
      ]
    })
  }
  if (u1.following.includes(u2._id)) { // @ts-ignore
    let i = removeA(u1.following, u2._id)
    u1.following = i // @ts-ignore
    let i2 = removeA(u2.followers, u1._id)
    u1.following = i2 
  } else {
    u1.following.push(u2._id)
    u2.followers.push(u1._id)
  }
  u1.save()
  u2.save()
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done'
  })
})

UsersRouter.route('/profile').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('No body')
  let sess = await Session.findOne({
    sessionString: req.get('Authorization')
  }).exec()
  let user = await User.findOne({
    _id: sess.userId
  }).exec()
  user.description = req.body.bio
  await user.save()
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done'
  })

})

UsersRouter.route('/settings').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('No body')
  if (req.body.newPassword && !req.body.currentPassword) errors.push('You need to input your current password for the new password section')
  if (req.body.newUsername && !req.body.currentPassword2) errors.push('You need to input your current password for the new username section')
  if (req.body.newUsername) {
    if (!req.body.newUsername.match(usernameRegex)) errors.push('Your new username must be alphanumeric')
    let newUsername = req.body.newUsername
    if (newUsername.length <= 2) errors.push('Your new username must have more than 2 characters')
    let usernames = await User.find({
      name: req.body.newUsername
    }).exec()
    if (usernames > 0) errors.push('This username is not available')
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors
    })
  }
  let user = await User.findOne({ // @ts-ignore
    _id: req.user._id
  }).exec()
  user.private = req.body.privateCheck
  user.nsfw = req.body.nsfwCheck
  let changes = []
  if (req.body.newPassword) {
    const hashedPassword = await argon2.hash(req.body.newPassword, {
      type: argon2id,
    })
    user.password = hashedPassword
    changes.push('password')
  }
  if (req.body.newUsername) {
    user.name = req.body.newUsername
    user.lowercaseName = req.body.newUsername.toLowerCase()
    changes.push('username')
  }
  user.save()
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done',
    changes: changes
  })
})

UsersRouter.route('/logout').get(async (req, res) => {
  let sess = await Session.findOne({
    sessionString: req.get('Authorization')
  }).exec()
  await sess.remove()
  return res.status(200).json({
    status: 200,
    success: true,
    message: 'Authentication required',
    errors: [
      'Successfully removed your session',
    ],
  })
})

export default UsersRouter