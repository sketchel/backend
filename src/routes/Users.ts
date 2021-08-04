import express, { Router } from 'express'
import bodyParser from 'body-parser'
import argon2, { argon2id } from 'argon2'
import { authMiddleware } from '../middleware/UserMiddleware'

import Session from '../models/Session'
import User from '../models/User'

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
  console.log(req.body)
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