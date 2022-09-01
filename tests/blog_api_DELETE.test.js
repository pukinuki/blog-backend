const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/list_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('HTTP DELETE /api/blogs/<id> tests that', () => {

  beforeEach(async () => {
    jest.setTimeout(10000)

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

    let loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[0].username,
        password: helper.users[0].password
      })

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send(helper.blogs[0])

    loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[1].username,
        password: helper.users[1].password
      })

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send(helper.blogs[1])
  })

  test('a blog can be deleted', async () => {

    const initialBlogsInDB = await helper.blogsInDb()
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[0].username,
        password: helper.users[0].password
      })

    await api
      .delete(`/api/blogs/${helper.blogs[0]._id}`)
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .expect(204)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(initialBlogsInDB.length - 1)
    expect(titles).not.toContain(
      helper.blogs[0].title
    )
  })

  test('a non existing blog returns code 204 but database length is unchanged', async () => {

    const initialBlogsInDB = await helper.blogsInDb()

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[0].username,
        password: helper.users[0].password
      })

    await api
      .delete('/api/blogs/5a422a851b54a676234d17fd')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .expect(204)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogsInDB.length)
  })

  test('a blog can not be deleted by a user different from the one who created it', async () => {

    const initialBlogsInDB = await helper.blogsInDb()

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: helper.users[1].username,
        password: helper.users[1].password
      })

    await api
      .delete(`/api/blogs/${helper.blogs[0]._id}`)
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .expect(401)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogsInDB.length)
  })

  afterAll(() => {
    mongoose.connection.close()
  })

})