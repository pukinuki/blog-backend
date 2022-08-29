const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const initialBlogs = require('../utils/list_helper').blogs
const Blog = require('../models/blog')

const api = supertest(app)

describe('HTTP GET /api/blogs tests that', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test(`there are ${initialBlogs.length} blogs`, async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('property "id" is defined in response and value is the same as expected', async () => {
    const response = await api
      .get(`/api/blogs/${initialBlogs[0]._id}`)

    expect(response.body.id).toBeDefined()
    expect(response.body.id).toBe(initialBlogs[0]._id)
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})
