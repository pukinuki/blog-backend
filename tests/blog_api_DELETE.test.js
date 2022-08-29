const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const initialBlogs = require('../utils/list_helper').blogs
const Blog = require('../models/blog')

const api = supertest(app)

describe('HTTP DELETE /api/blogs/<id> tests that', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('a blog can be deleted', async () => {

    await api
      .delete(`/api/blogs/${initialBlogs[4]._id}`)
      .expect(204)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(initialBlogs.length - 1)
    expect(titles).not.toContain(
      initialBlogs[4].title
    )
  })

  test('a non existing blog returns code 204 but database lenth is unchanged', async () => {

    await api
      .delete('/api/blogs/5a422a851b54a676234d17fd')
      .expect(204)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length)
  })

  afterAll(() => {
    mongoose.connection.close()
  })

})