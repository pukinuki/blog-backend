const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/list_helper')
const User = require('../models/user')

const api = supertest(app)

describe('Api users with initial database tests that', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    let userObjects = [...helper.users]

    const hashPassword = async (password) => await bcrypt.hash(password, 10)
    userObjects = userObjects.map(user => {
      console.log(Promise. hashPassword(user.password))
      user['passwordHash'] = 'secret'
      delete user['password']
      return new User(user)
    })

    console.log(userObjects)

    const promiseArray = userObjects.map(user => user.save())
    await Promise.all(promiseArray)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
})