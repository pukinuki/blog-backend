const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/list_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('HTTP POST /api/blogs tests that', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHashList = []

    for (let i = 0; i < helper.users.length; i++) {
      passwordHashList[i] = await bcrypt.hash(helper.users[i].password, 10)
    }

    const userArrayCopy = helper.users.map(user => ({ ...user }))
    const userObjects = userArrayCopy.map((user, index) => {
      user['passwordHash'] = passwordHashList[index]
      delete user['password']
      return new User(user)
    })

    const promiseArray = userObjects.map(user => user.save())
    await Promise.all(promiseArray)

    await Blog.deleteMany({})

    const blogObjects = helper.blogs.map(blog => new Blog(blog))
    const promiseArray2 = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray2)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      author: 'pukinuki',
      title: 'async/await simplifies making async calls',
      url: 'https://cedint.upm.es',
      likes: 9
    }

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[0].username,
        password: helper.users[0].password
      })

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.blogs.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('a valid blog can not be added if a token is not provided and response has status code 401 Unauthorized', async () => {
    const newBlog = {
      author: 'pukinuki',
      title: 'async/await simplifies making async calls',
      url: 'https://cedint.upm.es',
      likes: 9
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    expect(response.body.error).toBe('token missing')

  })

  test('if "like" property is missing to the request, it will default to the value 0', async () => {
    const newBlog = {
      _id: '5a422a851b54a676234d17fd',
      author: 'pukinuki',
      title: 'async/await simplifies making async calls',
      url: 'https://cedint.upm.es'
    }

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[0].username,
        password: helper.users[0].password
      })

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
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

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[0].username,
        password: helper.users[0].password
      })

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(400)
  })

  afterAll(() => {
    mongoose.connection.close()
  })

})