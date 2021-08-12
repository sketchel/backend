import { Router } from 'express'
import bodyParser from 'body-parser'
import User from '../models/User'
import Post from '../models/Post'

const ApiRouter = Router()
ApiRouter.use(bodyParser.json())

ApiRouter.route('/').all((req, res) => {
  res.status(200).json({
    success: true,
    route: '/api',
    status: 200,
    message: 'Hello World!'
  })
})

ApiRouter.route('/posts/:query').get(async (req, res) => {
  let user = await User.findOne({
    $or: [
      { _id: req.params.query },
      { lowercaseName: req.params.query.toLowerCase() }
    ]
  }).exec()
  if (!user) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'This user does not exist',
      errors: [
        'Could not find this user'
      ]
    })
  }
  let posts = await Post.find({
    author: user._id
  }).exec()
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done',
    posts: posts
  })
})

ApiRouter.route('/user/:query')
    .get(async (req, res) => {
        let user = await User.findOne({
            lowercaseName: req.params.query
        }).exec()
        if (!user) {
            user = await User.findOne({ // Allow people to search for people using IDs.
                _id: req.params.query
            }).exec()
                .catch(() => {})
            if (!user) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'This user does not exist',
                    errors: [
                        'Could not find this user'
                    ]
                })
            }
        }
        const publicObject = {
            id: user._id,
            name: user.name,
            description: user.description,
            avatar: user.avatar,
            joinedAt: user.joinedAt,
            rank: user.rank,
            following: user.following,
            followers: user.followers
        }
        return res.status(200).json({
            success: true,
            status: 200,
            user: publicObject,
            message: 'done'
        })
    })

ApiRouter.route('/post/:query')
    .get(async (req, res) => {
        let post = await Post.findOne({
            _id: req.params.query
        }).exec()
        if (!post) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'This post does not exist',
                errors: [
                    'Could not find this post'
                ]
            })
        }
        const publicObject = {
            id: post._id,
            author: post.author,
            title: post.title,
            description: post.description,
            image: post.image,
            createdAt: post.createdAt,
            views: post.views,
            likes: post.likes,
            dislikes: post.dislikes
        }
        return res.status(200).json({
            success: true,
            status: 200,
            post: publicObject,
            message: 'done'
        })
    })

export default ApiRouter