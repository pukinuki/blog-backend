const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const initialBlogs = require('../utils/list_helper').blogs
const Blog = require('../models/blog')

const api = supertest(app)

describe('HTTP PUT /api/blogs/<id> tests that', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('a blog can be updated with new likes, and database length is unchanged', async () => {
    const updatedBlog = { ...initialBlogs[4] }
    updatedBlog.likes = updatedBlog.likes + 1

    const updatedBlogResponse = await api
      .put(`/api/blogs/${initialBlogs[4]._id}`)
      .send(updatedBlog)
      .expect(200)

    expect(updatedBlogResponse.body.likes).toBe(initialBlogs[4].likes+1)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('if the blog does not exist, it respond with status code 200 and null body content', async () => {
    const updatedBlog = { ...initialBlogs[4] }
    updatedBlog._id = '5a422a851b54a676234d17fd'
    updatedBlog.likes = updatedBlog.likes + 1

    const response = await api
      .put('/api/blogs/5a422a851b54a676234d17fd')
      .send(updatedBlog)
      .expect(200)

    expect(response.body).toEqual(null)
  })

  afterAll(() => {
    mongoose.connection.close()
  })

})