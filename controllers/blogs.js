const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user')
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/',async (request, response) => {

  if (!request.token)
    return response.status(401).json({ error: 'token missing' })

  const decodedUser = request.user

  const user = await User.findById(decodedUser.id)

  const body = { ...request.body }

  body['user'] = user._id

  const blog = new Blog(body)

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  savedBlog['user'] = user
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.token)
    return response.status(401).json({ error: 'token missing' })

  const decodedUser = request.user

  const blog = await Blog.findById(request.params.id)

  if (!blog)
    return response.status(204).end()

  if ( blog.user.toString() !== decodedUser.id.toString() ) {
    return response.status(401).json({ error: 'user not allowed to delete this blog' })
  }

  await Blog.findByIdAndRemove(request.params.id)

  const user = await User.findById(decodedUser.id)
  user.blogs = user.blogs.filter(b => {
    return b._id.toString() !== blog._id.toString()
  })
  await user.save()

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const postBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user')
  response.json(postBlog)
})

module.exports = blogsRouter