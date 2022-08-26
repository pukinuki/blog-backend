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

  afterAll(() => {
    mongoose.connection.close()
  })

})

describe('HTTP POST /api/blogs tests that', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      author: 'pukinuki',
      title: 'async/await simplifies making async calls',
      url: 'https://cedint.upm.es',
      likes: 9
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

})
