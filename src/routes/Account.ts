import { Router } from 'express'
import argon2, { argon2id } from 'argon2'
import crypto from 'crypto'
import User from '../models/User'
import Session from '../models/Session'
import moment from 'moment'
import bodyParser from 'body-parser'

const AccountRouter = Router()
AccountRouter.use(bodyParser.json())

const usernameRegex = /^[a-z0-9]+$/i
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

AccountRouter.route('/').all((req, res) => {
  res.status(200).json({
    status: 200,
    route: '/account',
    message: 'Hello World!'
  })
})

AccountRouter.route('/login').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('You must supply a body')
  if (!req.body.username) errors.push('You must supply a username')
  if (!req.body.password) errors.push('You must supply a password')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors,
    })
  }
  let user = await User.findOne({
    [req.body.username.includes('@')
      ? 'lowercaseEmail'
      : 'lowercaseName']: req.body.username.toLowerCase()
  }).exec()
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: ['Username or password is invalid 1'],
    })
  }
  let passwordValid = await argon2.verify(user.password, req.body.password, {
    type: argon2id,
  })
  if (!passwordValid) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: ['Username or password is invalid 2'],
    })
  }
  let now = moment()
  let sessionToken = 'Bearer ' + crypto.randomBytes(96).toString('base64')
  let session = new Session({
    sessionString: sessionToken,
    userId: user._id,
    ip: req.ip,
    rememberMe: false,
    expiresAt: now
      .add(8, req.body.rememberMe ? 'days' : 'hours')
      .toDate()
  })
  await session.save()
  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    session: sessionToken,
    user: user._id
  })
})

AccountRouter.route('/register').post(async (req, res) => {
    let errors = []
    if (!req.body) errors.push('No body')
    if (!req.body.username) errors.push('You must supply a username')
    let username = req.body.username
    if (!req.body.email) errors.push('You must supply a email')
    if (!req.body.password) errors.push('You must supply a password')
    if (!req.body.confirmPassword) errors.push('You must supply a confirmation password')
    if (req.body.confirmPassword !== req.body.password) errors.push('The confirmation password must match your password.')
    if (!req.body.username.match(usernameRegex)) errors.push('Your username must be alphanumeric')
    if (username.length <= 2) errors.push('Your username\'s too short.')
    if (!req.body.email.match(emailRegex)) errors.push('Your email is invalid')
    let emails = await User.find({
      email: req.body.email,
    }).exec()
    let usernames = await User.find({
      name: req.body.username,
    }).exec()
    if (usernames.length > 0) errors.push('This username is already in use')
    if (emails.length > 0) errors.push('This email is already in use')
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'errors',
        errors
      })
    }
    const hashedPassword = await argon2.hash(req.body.password, {
      type: argon2id,
    })
    let user = new User({
      name: req.body.username,
      lowercaseName: req.body.username.toLowerCase(),
      lowercaseEmail: req.body.email.toLowerCase(),
      rank: 'default',
      email: req.body.email,
      description: 'This user likes to keep quiet.',
      password: hashedPassword,
      joinedAt: new Date(),
    })
    await user.save()
    res.status(200).json({
      success: true,
      message: 'Successfully created your account!',
    })
})

export default AccountRouter