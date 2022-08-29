const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const initialBlogs = require('../utils/list_helper').blogs
const Blog = require('../models/blog')

const api = supertest(app)

describe('HTTP POST /api/blogs tests that', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

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

  test('if "like" property is missing to the request, it will default to the value 0', async () => {
    const newBlog = {
      _id: '5a422a851b54a676234d17fd',
      author: 'pukinuki',
      title: 'async/await simplifies making async calls',
      url: 'https://cedint.upm.es'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)

    const response = await api.get(`/api/blogs/${'5a422a851b54a676234d17fd'}`)

    expect(response.body.likes).toBeDefined()
    expect(response.body.likes).toBe(0)
  })

  test('if the "title" and "url" properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request', async () => {
    const newBlog = {
      _id: '5a422a851b54a676234d17fd',
      author: 'pukinuki',
      title: 'async/await simplifies making async calls',
      likes: 9
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  afterAll(() => {
    mongoose.connection.close()
  })

})