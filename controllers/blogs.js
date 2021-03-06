const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user')

    response.json(blogs.map(Blog.format))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong' })
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const getTokenFrom = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
  }

  try {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined && body.url === undefined) {
      return response.status(400).json({ error: 'title and url missing' })
    }

    const user = await User.findById(decodedToken.id)
    console.log('käyttäjä', user)
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(Blog.format(savedBlog))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndUpdate({ _id: request.params.id }, { likes: request.body.likes })
    const result = await Blog.findById(request.params.id)
    response.json(Blog.format(result))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = blogsRouter